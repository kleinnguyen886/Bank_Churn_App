from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_curve, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.data_service import download_churn_dataset, resolve_churn_csv
from app.services.data_service import local_raw_churn_csv

DATA_PROCESSED = ROOT / "data" / "processed"
MODELS_DIR = ROOT / "models"


def _risk_bucket(prob: float) -> str:
    if prob >= 0.75:
        return "High"
    if prob >= 0.45:
        return "Medium"
    return "Low"


def _best_f1_threshold(y_true: pd.Series, prob: pd.Series) -> tuple[float, float]:
    precision, recall, thresholds = precision_recall_curve(y_true, prob)
    f1_scores = (2 * precision[:-1] * recall[:-1]) / (precision[:-1] + recall[:-1] + 1e-12)
    best_idx = int(f1_scores.argmax())
    return float(thresholds[best_idx]), float(f1_scores[best_idx])


def _clean_feature_name(name: str) -> str:
    cleaned = str(name)
    if "__" in cleaned:
        cleaned = cleaned.split("__", 1)[1]
    return cleaned.replace("_", " ")


def _feature_importance_rows(best_model: Pipeline, top_n: int = 12) -> list[dict[str, Any]]:
    preprocessor = best_model.named_steps.get("preprocessor")
    model = best_model.named_steps.get("model")

    if preprocessor is None or model is None:
        return []

    if hasattr(preprocessor, "get_feature_names_out"):
        feature_names = [_clean_feature_name(name) for name in preprocessor.get_feature_names_out()]
    else:
        return []

    importances: list[float]
    if hasattr(model, "feature_importances_"):
        importances = [float(value) for value in model.feature_importances_]
    elif hasattr(model, "coef_"):
        coefficients = model.coef_
        if getattr(coefficients, "ndim", 1) > 1:
            coefficients = coefficients[0]
        importances = [float(abs(value)) for value in coefficients]
    else:
        return []

    if not importances or not feature_names:
        return []

    size = min(len(feature_names), len(importances))
    importance_frame = pd.DataFrame(
        {
            "feature": feature_names[:size],
            "importance": [abs(value) for value in importances[:size]],
        }
    )
    importance_frame = importance_frame.sort_values("importance", ascending=False).head(top_n).reset_index(drop=True)

    max_importance = float(importance_frame["importance"].max()) if not importance_frame.empty else 0.0
    if max_importance > 0:
        importance_frame["relative_pct"] = (importance_frame["importance"] / max_importance * 100).round(2)
    else:
        importance_frame["relative_pct"] = 0.0

    return [
        {
            "feature": str(row["feature"]),
            "importance": float(row["importance"]),
            "relative_pct": float(row["relative_pct"]),
        }
        for _, row in importance_frame.iterrows()
    ]


def _confusion_matrix_payload(y_true: pd.Series, y_pred: pd.Series) -> dict[str, Any]:
    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp = int(matrix[0, 0]), int(matrix[0, 1])
    fn, tp = int(matrix[1, 0]), int(matrix[1, 1])

    return {
        "predicted_labels": ["Predicted Stay", "Predicted Churn"],
        "rows": [
            {"actual_label": "Actual Stay", "values": [tn, fp]},
            {"actual_label": "Actual Churn", "values": [fn, tp]},
        ],
        "tn": tn,
        "fp": fp,
        "fn": fn,
        "tp": tp,
    }


MODEL_CHOICES = {
    "auto": "Auto Select Best",
    "catboost": "CatBoost",
    "random_forest": "Random Forest",
    "logistic_regression": "Logistic Regression",
}

MODEL_ALIASES = {
    "": "auto",
    "all": "auto",
    "auto": "auto",
    "best": "auto",
    "auto_select_best": "auto",
    "catboost": "catboost",
    "cat_boost": "catboost",
    "randomforest": "random_forest",
    "random_forest": "random_forest",
    "random-forest": "random_forest",
    "rf": "random_forest",
    "logisticregression": "logistic_regression",
    "logistic_regression": "logistic_regression",
    "logistic-regression": "logistic_regression",
    "logreg": "logistic_regression",
    "lr": "logistic_regression",
}


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train churn models and prepare dashboard artifacts.")
    parser.add_argument(
        "--model",
        default="auto",
        help="Retrain target: auto, catboost, random_forest, or logistic_regression.",
    )
    return parser.parse_args()


def _normalize_model_choice(value: str | None) -> str:
    key = str(value or "").strip().lower().replace(" ", "_").replace("-", "_")
    key = key.strip("_")
    if not key:
        return "auto"
    if key in MODEL_ALIASES:
        return MODEL_ALIASES[key]
    if key in MODEL_CHOICES:
        return key
    raise ValueError(
        f"Unsupported retraining model '{value}'. Choose from auto, catboost, random_forest, or logistic_regression."
    )


def _model_display_name(choice: str) -> str:
    return MODEL_CHOICES.get(choice, choice)


def _train_and_evaluate_model(
    name: str,
    pipeline: Pipeline,
    param_grid: list[dict[str, list[Any]]],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> tuple[Pipeline, dict[str, Any]]:
    model_search = GridSearchCV(
        estimator=pipeline,
        param_grid=param_grid,
        cv=5,
        scoring="roc_auc",
        n_jobs=-1,
        refit=True,
    )
    model_search.fit(X_train, y_train)
    best_model = model_search.best_estimator_

    val_prob = best_model.predict_proba(X_val)[:, 1]
    best_threshold, best_validation_f1 = _best_f1_threshold(y_val, val_prob)

    test_prob = best_model.predict_proba(X_test)[:, 1]
    test_pred = (test_prob >= best_threshold).astype(int)

    metrics = {
        "model_name": name,
        "accuracy": float(accuracy_score(y_test, test_pred)),
        "precision": float(precision_score(y_test, test_pred, zero_division=0)),
        "recall": float(recall_score(y_test, test_pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, test_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, test_prob)),
        "cv_best_score": float(model_search.best_score_),
        "selected_threshold": best_threshold,
        "validation_f1_at_selected_threshold": best_validation_f1,
        "best_params": model_search.best_params_,
    }
    return best_model, metrics


def main() -> None:
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    args = _parse_args()
    selected_model_choice = _normalize_model_choice(args.model)

    csv_path = local_raw_churn_csv()
    if csv_path is None:
        ds_dir = download_churn_dataset()
        csv_path = resolve_churn_csv(ds_dir)
    df = pd.read_csv(csv_path)

    y = df["Exited"]
    id_col = "CustomerId"
    feature_cols = [
        "CreditScore",
        "Geography",
        "Gender",
        "Age",
        "Tenure",
        "Balance",
        "NumOfProducts",
        "HasCrCard",
        "IsActiveMember",
        "EstimatedSalary",
    ]
    X = df[feature_cols]

    num_cols = [
        "CreditScore",
        "Age",
        "Tenure",
        "Balance",
        "NumOfProducts",
        "EstimatedSalary",
    ]
    cat_cols = ["Geography", "Gender", "HasCrCard", "IsActiveMember"]

    pre = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ]
    )

    X_train_full, X_test, y_train_full, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full, test_size=0.2, random_state=42, stratify=y_train_full
    )
    candidate_models = [
        (
            "logistic_regression",
            "Logistic Regression",
            Pipeline(
                steps=[
                    ("preprocessor", pre),
                    ("model", LogisticRegression(max_iter=1000, random_state=42)),
                ]
            ),
            [
                {
                    "model__solver": ["liblinear"],
                    "model__penalty": ["l1", "l2"],
                    "model__C": [0.001, 0.01, 0.1, 1.0, 10.0, 100.0],
                    "model__class_weight": [None, "balanced"],
                    "model__fit_intercept": [True, False],
                },
                {
                    "model__solver": ["lbfgs", "saga"],
                    "model__penalty": ["l2"],
                    "model__C": [0.001, 0.01, 0.1, 1.0, 10.0, 100.0],
                    "model__class_weight": [None, "balanced"],
                    "model__fit_intercept": [True, False],
                },
            ],
        ),
        (
            "random_forest",
            "Random Forest",
            Pipeline(
                steps=[
                    ("preprocessor", pre),
                    ("model", RandomForestClassifier(random_state=42, n_jobs=-1)),
                ]
            ),
            [
                {
                    "model__n_estimators": [200, 400],
                    "model__max_depth": [None, 8, 12],
                    "model__min_samples_split": [2, 10],
                    "model__min_samples_leaf": [1, 4],
                    "model__class_weight": [None, "balanced"],
                }
            ],
        ),
        (
            "catboost",
            "CatBoost",
            Pipeline(
                steps=[
                    ("preprocessor", pre),
                    (
                        "model",
                        CatBoostClassifier(
                            verbose=0,
                            random_seed=42,
                            loss_function="Logloss",
                            iterations=1000
                        ),
                    ),
                ]
            ),
            [
                {
                    "model__depth": [4, 6, 8, 10],
                    "model__learning_rate": [0.03, 0.1],
                    "model__iterations": [200, 400],
                    "model__l2_leaf_reg": [3.0, 5.0, 7.0],
                }
            ],
        ),
    ]

    if selected_model_choice != "auto":
        candidate_models = [item for item in candidate_models if item[0] == selected_model_choice]
        if not candidate_models:
            raise ValueError(
                f"Unsupported retraining model '{args.model}'. Choose from auto, catboost, random_forest, or logistic_regression."
            )

    trained_models: list[tuple[Pipeline, dict[str, Any]]] = []
    for model_key, model_name, model_pipeline, param_grid in candidate_models:
        trained_models.append(
            _train_and_evaluate_model(
                name=model_name,
                pipeline=model_pipeline,
                param_grid=param_grid,
                X_train=X_train,
                y_train=y_train,
                X_val=X_val,
                y_val=y_val,
                X_test=X_test,
                y_test=y_test,
            )
        )

    best_model, metrics = max(
        trained_models,
        key=lambda item: (item[1]["roc_auc"], item[1]["f1_score"], item[1]["recall"]),
    )
    metrics["last_trained"] = pd.Timestamp.utcnow().strftime("%Y-%m-%d")
    metrics["model_version"] = (
        metrics["model_name"].lower().replace(" ", "-") + "-v1"
    )
    metrics["selected_model_choice"] = selected_model_choice
    metrics["selected_model_label"] = _model_display_name(selected_model_choice)

    best_test_prob = best_model.predict_proba(X_test)[:, 1]
    best_test_pred = (best_test_prob >= metrics["selected_threshold"]).astype(int)
    confusion = _confusion_matrix_payload(y_test, best_test_pred)
    feature_importance = _feature_importance_rows(best_model)

    model_snapshot = {
        "model_name": metrics["model_name"],
        "model_version": metrics["model_version"],
        "accuracy": f"{metrics['accuracy'] * 100:.1f}%",
        "precision": f"{metrics['precision'] * 100:.1f}%",
        "recall": f"{metrics['recall'] * 100:.1f}%",
        "f1_score": f"{metrics['f1_score'] * 100:.1f}%",
        "roc_auc": f"{metrics['roc_auc']:.3f}",
        "selected_threshold": f"{metrics['selected_threshold']:.3f}",
        "last_trained": metrics["last_trained"],
    }

    model_comparison = (
        pd.DataFrame([result for _, result in trained_models])
        .sort_values(["roc_auc", "f1_score", "recall"], ascending=False)
        .reset_index(drop=True)
    )

    full_prob = best_model.predict_proba(X)[:, 1]
    customer_master = df.copy()
    customer_master["churn_probability"] = full_prob
    customer_master["risk"] = customer_master["churn_probability"].apply(_risk_bucket)

    workspace = customer_master[
        [id_col, "Surname", "Geography", "risk", "churn_probability"]
    ].rename(
        columns={
            id_col: "customer_id",
            "Surname": "name",
            "churn_probability": "score",
            "Geography": "geography",
        }
    )
    workspace["owner"] = "Unassigned"
    workspace["status"] = "new"

    dashboard = {
        "title": "Executive Overview Dashboard",
        "subtitle": "Bank churn prediction monitoring from trained artifact",
        "model_snapshot": model_snapshot,
        "kpis": [
            {"label": "Total Customers", "value": f"{len(customer_master):,}", "change": "-"},
            {
                "label": "Predicted Churners",
                "value": f"{int((customer_master['churn_probability'] >= metrics['selected_threshold']).sum()):,}",
                "change": "model-driven",
                "alert": True,
            },
            {
                "label": "Overall Churn Rate",
                "value": f"{(customer_master['Exited'].mean() * 100):.1f}%",
                "change": "dataset",
            },
            {
                "label": "Retention Success Rate",
                "value": f"{(1 - metrics['recall']) * 100:.1f}%",
                "change": "from eval",
            },
        ],
        "top_segments": (
            customer_master.groupby("Geography")
            .agg(customers=(id_col, "count"), churn_rate=("Exited", "mean"))
            .reset_index()
            .sort_values("churn_rate", ascending=False)
            .head(3)
            .assign(
                segment=lambda d: d["Geography"],
                churn_rate=lambda d: (d["churn_rate"] * 100).round(1).astype(str) + "%",
                change="model refresh",
            )[["segment", "customers", "churn_rate", "change"]]
            .to_dict(orient="records")
        ),
        "recent_alerts": [
            {
                "title": "Model pipeline refreshed",
                "description": "New model artifact and data products generated from Kaggle dataset.",
                "severity": "medium",
            }
        ],
    }

    governance = {
        "title": "Model Governance Center",
        "subtitle": "Metrics derived from latest training run",
        "cards": [
            {"label": "Model Version", "value": metrics["model_version"]},
            {"label": "Accuracy", "value": f"{metrics['accuracy'] * 100:.1f}%"},
            {"label": "Precision", "value": f"{metrics['precision'] * 100:.1f}%"},
            {"label": "Recall", "value": f"{metrics['recall'] * 100:.1f}%"},
            {"label": "F1-Score", "value": f"{metrics['f1_score'] * 100:.1f}%"},
            {"label": "AUC-ROC", "value": f"{metrics['roc_auc']:.3f}"},
        ],
        "metrics": metrics,
        "confusion_matrix": confusion,
        "feature_importance": feature_importance,
        "model_comparison": model_comparison.to_dict(orient="records"),
        "alerts": [
            {
                "severity": "high" if metrics["recall"] < 0.8 else "medium",
                "title": "Recall threshold check",
                "description": "Investigate threshold tuning if recall is below 80%.",
            }
        ],
    }

    campaigns = {
        "title": "Campaign and Retention Offers Center",
        "subtitle": "Auto-generated campaign seeds from model risk segments",
        "kpis": [
            {"label": "Active Campaigns", "value": "3", "change": "auto"},
            {"label": "Customers Targeted", "value": f"{int((workspace['risk'] == 'High').sum()):,}", "change": "high risk"},
            {"label": "Offer Acceptance Rate", "value": "TBD", "change": "pending"},
            {"label": "Churns Prevented", "value": "TBD", "change": "pending"},
        ],
        "campaigns": [
            {
                "name": "High-Risk Direct Outreach",
                "segment": "Risk=High",
                "channel": "Personal Call + Email",
                "status": "Active",
            },
            {
                "name": "Germany Risk Segment",
                "segment": "Geography=Germany and Risk>=Medium",
                "channel": "RM Assisted",
                "status": "Active",
            },
            {
                "name": "Inactive Member Re-Engagement",
                "segment": "IsActiveMember=0",
                "channel": "Email + Push",
                "status": "Draft",
            },
        ],
    }

    customer_profiles = {}
    for _, row in customer_master.head(200).iterrows():
        cid = f"C-{int(row[id_col])}"
        customer_profiles[cid] = {
            "customer_id": cid,
            "name": row.get("Surname", "Unknown"),
            "geography": row.get("Geography", "Unknown"),
            "gender": row.get("Gender", "Unknown"),
            "age": int(row.get("Age", 0)),
            "risk": row.get("risk", "Medium"),
            "score": round(float(row.get("churn_probability", 0.5)), 3),
            "recommended_action": "Prioritized retention outreach" if row.get("risk") == "High" else "Monitor and engage",
            "drivers": [
                {"name": "Age", "impact": "High" if row.get("Age", 0) >= 45 else "Medium"},
                {"name": "Active Membership", "impact": "High" if int(row.get("IsActiveMember", 1)) == 0 else "Low"},
                {"name": "Product Count", "impact": "High" if int(row.get("NumOfProducts", 1)) >= 3 else "Medium"},
            ],
            "history": [
                {"date": pd.Timestamp.utcnow().strftime("%Y-%m-%d"), "type": "system", "description": "Auto-generated from latest scoring run."}
            ],
        }

    workspace.to_csv(DATA_PROCESSED / "workspace_view.csv", index=False)
    customer_master.to_csv(DATA_PROCESSED / "customer_master.csv", index=False)
    (DATA_PROCESSED / "dashboard_summary.json").write_text(json.dumps(dashboard, indent=2), encoding="utf-8")
    (DATA_PROCESSED / "governance_summary.json").write_text(json.dumps(governance, indent=2), encoding="utf-8")
    (DATA_PROCESSED / "campaigns_summary.json").write_text(json.dumps(campaigns, indent=2), encoding="utf-8")
    (DATA_PROCESSED / "customer_profiles.json").write_text(json.dumps(customer_profiles, indent=2), encoding="utf-8")

    joblib.dump(best_model, MODELS_DIR / "churn_model.joblib")

    print("Prepared artifacts:")
    print("-", DATA_PROCESSED / "workspace_view.csv")
    print("-", DATA_PROCESSED / "dashboard_summary.json")
    print("-", DATA_PROCESSED / "governance_summary.json")
    print("-", DATA_PROCESSED / "campaigns_summary.json")
    print("-", MODELS_DIR / "churn_model.joblib")


if __name__ == "__main__":
    main()