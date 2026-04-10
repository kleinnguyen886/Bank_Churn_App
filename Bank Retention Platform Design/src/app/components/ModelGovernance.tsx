import { Link } from "react-router";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Database,
  GitBranch,
  Activity,
  Settings,
  Brain,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Kaggle Bank Churn Dataset — 10,000 rows, 10 features, ~20.4% churn
// Model: XGBoost (production) vs LightGBM (candidate)
// Target: Exited (0 = retained, 1 = churned)

const modelMetrics = [
  { label: "Model Version", value: "v2.4.1", change: null, icon: GitBranch },
  { label: "Accuracy", value: "86.4%", change: "-0.9%", trend: "down", icon: Activity },
  { label: "Precision", value: "82.1%", change: "+0.4%", trend: "up", icon: CheckCircle2 },
  { label: "Recall", value: "78.3%", change: "-1.8%", trend: "down", icon: Activity },
  { label: "F1 Score", value: "80.1%", change: "-0.7%", trend: "down", icon: BarChart2 },
  { label: "AUC-ROC", value: "0.867", change: "-0.012", trend: "down", icon: Activity },
  { label: "Last Retrained", value: "14 days ago", change: null, icon: Database, alert: true },
  { label: "Training Samples", value: "7,000", change: null, icon: Database },
];

const performanceTrend = [
  { date: "Mar 1", accuracy: 87.3, precision: 83.0, recall: 80.1, f1: 81.5 },
  { date: "Mar 8", accuracy: 87.0, precision: 82.8, recall: 79.5, f1: 81.1 },
  { date: "Mar 15", accuracy: 86.8, precision: 82.5, recall: 79.0, f1: 80.7 },
  { date: "Mar 22", accuracy: 86.5, precision: 82.2, recall: 78.6, f1: 80.4 },
  { date: "Mar 29", accuracy: 86.2, precision: 82.0, recall: 78.1, f1: 80.0 },
  { date: "Apr 5", accuracy: 86.4, precision: 82.1, recall: 78.3, f1: 80.1 },
];

// Feature importance from Kaggle notebooks — Age & NumOfProducts dominant
const featureImportance = [
  { feature: "Age", importance: 22.4, type: "numerical" },
  { feature: "NumOfProducts", importance: 18.6, type: "numerical" },
  { feature: "IsActiveMember", importance: 14.8, type: "binary" },
  { feature: "Balance", importance: 12.3, type: "numerical" },
  { feature: "Geography_Germany", importance: 9.7, type: "categorical" },
  { feature: "CreditScore", importance: 8.2, type: "numerical" },
  { feature: "Gender_Female", importance: 6.4, type: "categorical" },
  { feature: "Tenure", importance: 4.1, type: "numerical" },
  { feature: "EstimatedSalary", importance: 2.2, type: "numerical" },
  { feature: "HasCrCard", importance: 1.3, type: "binary" },
];

const featureTypeColor: Record<string, string> = {
  numerical: "#3b82f6",
  binary: "#8b5cf6",
  categorical: "#f59e0b",
};

const alerts = [
  {
    severity: "high",
    title: "Feature Drift — Age Distribution",
    description:
      "Age distribution in recent scoring batch shifted +4.2 years vs training data mean (38.9). May affect recall.",
    timestamp: "3 hours ago",
    status: "active",
  },
  {
    severity: "high",
    title: "Recall Below Threshold (78.3%)",
    description:
      "Recall dropped below 80% acceptable threshold — false negatives increasing. More at-risk customers missed.",
    timestamp: "1 day ago",
    status: "active",
  },
  {
    severity: "medium",
    title: "Class Imbalance Shift",
    description:
      "Live churn rate edged up to 22.1% vs training baseline of 20.4%. Decision threshold may need recalibration.",
    timestamp: "2 days ago",
    status: "investigating",
  },
  {
    severity: "low",
    title: "Retraining Recommended",
    description:
      "Model is 14 days old. Recommend retraining on latest quarter data within 7 days to maintain performance.",
    timestamp: "5 days ago",
    status: "scheduled",
  },
];

const datasetInfo = {
  version: "BankChurn-2024-Q1-v3",
  totalSamples: "10,000",
  trainingSamples: "7,000",
  validationSamples: "1,500",
  testSamples: "1,500",
  lastUpdated: "2026-03-27",
  features: 10,
  positiveClass: "20.4%",
  classRatio: "1 : 4.9 (churn : retained)",
  geographyDist: "France 50.1% | Germany 25.1% | Spain 24.8%",
};

const modelComparison = {
  production: { version: "v2.4.1 (XGBoost)", accuracy: 86.4, precision: 82.1, recall: 78.3, f1: 80.1, auc: 0.867, status: "Production" },
  candidate: { version: "v2.5.0 (LightGBM)", accuracy: 88.1, precision: 84.5, recall: 81.2, f1: 82.8, auc: 0.891, status: "Candidate" },
};

const confusionMatrix = { tp: 240, fp: 52, tn: 1142, fn: 66 };

export function ModelGovernance() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-50 text-red-700";
      case "investigating": return "bg-amber-50 text-amber-700";
      case "scheduled": return "bg-blue-50 text-blue-700";
      case "resolved": return "bg-green-50 text-green-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Model Governance Center</h2>
            <p className="text-sm text-gray-500">
              Bank churn prediction — XGBoost v2.4.1 on 10-feature dataset (10,000 customers)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700 font-medium">Production</span>
            </div>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>v2.4.1 — XGBoost (Current)</option>
              <option>v2.3.8 — XGBoost</option>
              <option>v2.3.0 — Random Forest</option>
              <option>v2.0.0 — Logistic Regression</option>
            </select>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-2" />
              Export Report
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Trigger Retraining
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-8 gap-3">
            {modelMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={`bg-white rounded-lg border p-4 ${metric.alert ? "border-amber-200 bg-amber-50/30" : "border-gray-200"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className={`w-4 h-4 ${metric.alert ? "text-amber-600" : "text-blue-600"}`} />
                    {metric.change && (
                      <div className="flex items-center gap-0.5 text-xs">
                        {metric.trend === "up"
                          ? <TrendingUp className="w-3 h-3 text-green-600" />
                          : <TrendingDown className="w-3 h-3 text-red-600" />}
                        <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                          {metric.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-0.5">{metric.value}</div>
                  <div className="text-xs text-gray-600">{metric.label}</div>
                </div>
              );
            })}
          </div>

          {/* Confusion Matrix + Alerts */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Confusion Matrix</h3>
              <p className="text-sm text-gray-500 mb-4">Test set — 1,500 samples (306 churned)</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{confusionMatrix.tp}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">True Positive</div>
                  <div className="text-xs text-gray-500">Churn predicted correctly</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{confusionMatrix.fn}</div>
                  <div className="text-xs text-red-600 font-medium mt-1">False Negative</div>
                  <div className="text-xs text-gray-500">Missed churns ⚠️</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">{confusionMatrix.fp}</div>
                  <div className="text-xs text-amber-600 font-medium mt-1">False Positive</div>
                  <div className="text-xs text-gray-500">Wrongly flagged</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{confusionMatrix.tn}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">True Negative</div>
                  <div className="text-xs text-gray-500">Retained correctly</div>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Precision</span>
                  <span className="font-medium text-gray-900">
                    {((confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fp)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recall (Sensitivity)</span>
                  <span className="font-medium text-gray-900">
                    {((confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fn)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Specificity</span>
                  <span className="font-medium text-gray-900">
                    {((confusionMatrix.tn / (confusionMatrix.tn + confusionMatrix.fp)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Active Alerts & Warnings</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">2 Critical</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">{alert.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{alert.description}</p>
                      <span className="text-xs opacity-75">{alert.timestamp}</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium border border-current rounded hover:bg-white/50 flex-shrink-0">
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Model Performance Trend</h3>
                <p className="text-sm text-gray-500">Key metrics over the past 6 weeks — gradual drift detected</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">30 Days</button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">90 Days</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[75, 92]} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                <Legend />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Recall threshold", fill: "#ef4444", fontSize: 10 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Accuracy" dot={{ fill: "#3b82f6" }} />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" dot={{ fill: "#10b981" }} />
                <Line type="monotone" dataKey="recall" stroke="#f59e0b" strokeWidth={2} name="Recall" dot={{ fill: "#f59e0b" }} />
                <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} name="F1 Score" dot={{ fill: "#8b5cf6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Importance + Dataset Info */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Feature Importance</h3>
                  <p className="text-sm text-gray-500">10 features from bank churn dataset — Age and NumOfProducts dominate</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Numerical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Binary</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Categorical</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="feature" stroke="#9ca3af" fontSize={12} width={140} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Importance"]}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={featureTypeColor[entry.type] || "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Training Dataset</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Dataset Version", value: datasetInfo.version },
                  { label: "Total Samples", value: datasetInfo.totalSamples },
                  { label: "Training Set", value: datasetInfo.trainingSamples },
                  { label: "Validation Set", value: datasetInfo.validationSamples },
                  { label: "Test Set", value: datasetInfo.testSamples },
                  { label: "Features", value: `${datasetInfo.features} features` },
                  { label: "Churn Rate (Target)", value: datasetInfo.positiveClass, highlight: true },
                  { label: "Class Ratio", value: datasetInfo.classRatio },
                  { label: "Geography Split", value: datasetInfo.geographyDist },
                  { label: "Last Updated", value: datasetInfo.lastUpdated },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="pb-2.5 border-b border-gray-100 last:border-0">
                    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                    <div className={`text-sm font-medium ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Database className="w-4 h-4 inline mr-2" />
                View Dataset Details
              </button>
            </div>
          </div>

          {/* Model Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Model Comparison — Champion vs Challenger</h3>
                <p className="text-sm text-gray-500">XGBoost (production) vs LightGBM (candidate) — both trained on bank churn dataset</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Auto-promote if improvement &gt; 2%</span>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-2 border-green-200 bg-green-50/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Production Model</div>
                    <div className="text-xl font-semibold text-gray-900">{modelComparison.production.version}</div>
                  </div>
                  <div className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                    {modelComparison.production.status}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Accuracy", value: modelComparison.production.accuracy, unit: "%" },
                    { label: "Precision", value: modelComparison.production.precision, unit: "%" },
                    { label: "Recall", value: modelComparison.production.recall, unit: "%" },
                    { label: "F1 Score", value: modelComparison.production.f1, unit: "%" },
                    { label: "AUC-ROC", value: modelComparison.production.auc, unit: "" },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">{value}{unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-blue-200 bg-blue-50/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Candidate Model</div>
                    <div className="text-xl font-semibold text-gray-900">{modelComparison.candidate.version}</div>
                  </div>
                  <div className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {modelComparison.candidate.status}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Accuracy", prod: modelComparison.production.accuracy, cand: modelComparison.candidate.accuracy, unit: "%" },
                    { label: "Precision", prod: modelComparison.production.precision, cand: modelComparison.candidate.precision, unit: "%" },
                    { label: "Recall", prod: modelComparison.production.recall, cand: modelComparison.candidate.recall, unit: "%" },
                    { label: "F1 Score", prod: modelComparison.production.f1, cand: modelComparison.candidate.f1, unit: "%" },
                    { label: "AUC-ROC", prod: modelComparison.production.auc, cand: modelComparison.candidate.auc, unit: "" },
                  ].map(({ label, prod, cand, unit }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{cand}{unit}</span>
                        <span className="text-xs text-green-600 font-medium">
                          +{(cand - prod).toFixed(cand < 1 ? 3 : 1)}{unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      LightGBM candidate shows overall +2.4% improvement
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Approve & Deploy
                    </button>
                    <button className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
