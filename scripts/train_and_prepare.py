from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
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


def main() -> None:
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

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
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", pre),
            ("model", LogisticRegression(max_iter=1000, random_state=42)),
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision": float(precision_score(y_test, pred, zero_division=0)),
        "recall": float(recall_score(y_test, pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, prob)),
        "last_trained": pd.Timestamp.utcnow().strftime("%Y-%m-%d"),
        "model_version": "logreg-v1",
    }

    full_prob = model.predict_proba(X)[:, 1]
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
        "kpis": [
            {"label": "Total Customers", "value": f"{len(customer_master):,}", "change": "-"},
            {
                "label": "Predicted Churners",
                "value": f"{int((customer_master['churn_probability'] >= 0.5).sum()):,}",
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

    joblib.dump(model, MODELS_DIR / "churn_model.joblib")

    print("Prepared artifacts:")
    print("-", DATA_PROCESSED / "workspace_view.csv")
    print("-", DATA_PROCESSED / "dashboard_summary.json")
    print("-", DATA_PROCESSED / "governance_summary.json")
    print("-", DATA_PROCESSED / "campaigns_summary.json")
    print("-", MODELS_DIR / "churn_model.joblib")


if __name__ == "__main__":
    main()
