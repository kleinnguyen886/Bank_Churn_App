import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Tag,
  Activity,
  CreditCard,
  Globe,
  ShieldAlert,
  Layers,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// Dataset-aligned customer profiles
// Features: CreditScore, Geography, Gender, Age, Tenure, Balance,
//           NumOfProducts, HasCrCard, IsActiveMember, EstimatedSalary, Exited
const customerData: Record<string, any> = {
  "C-15634602": {
    id: "C-15634602",
    name: "Henri Dupont",
    geography: "France",
    gender: "Male",
    age: 42,
    tenure: 2,
    creditScore: 619,
    balance: 0,
    numProducts: 1,
    hasCrCard: true,
    isActiveMember: false,
    estimatedSalary: 101348,
    // Derived/enrichment
    email: "h.dupont@email.fr",
    phone: "+33 1 55 23 4567",
    riskScore: 87,
    riskLevel: "high",
    riskChange: 14,
    lastMonthScore: 73,
    predictedChurn: true,
    retentionLikelihood: 68,
  },
  "C-15647311": {
    id: "C-15647311",
    name: "Klara Müller",
    geography: "Germany",
    gender: "Female",
    age: 54,
    tenure: 1,
    creditScore: 501,
    balance: 125510,
    numProducts: 3,
    hasCrCard: false,
    isActiveMember: false,
    estimatedSalary: 82150,
    email: "k.muller@email.de",
    phone: "+49 30 1234 5678",
    riskScore: 94,
    riskLevel: "high",
    riskChange: 18,
    lastMonthScore: 76,
    predictedChurn: true,
    retentionLikelihood: 42,
  },
};

const riskTrendData = [
  { month: "Oct", score: 48 },
  { month: "Nov", score: 54 },
  { month: "Dec", score: 61 },
  { month: "Jan", score: 68 },
  { month: "Feb", score: 73 },
  { month: "Mar", score: 81 },
  { month: "Apr", score: 87 },
];

// Feature contributions (SHAP-style, dataset features)
const churnDrivers = [
  {
    driver: "Non-Active Member",
    impact: "Very High",
    impactScore: 26,
    detail: "Account inactive for 4+ months — isActiveMember = 0",
    feature: "isActiveMember",
  },
  {
    driver: "Zero Account Balance",
    impact: "High",
    impactScore: 22,
    detail: "Balance = $0; customers with no balance churn at 2× rate",
    feature: "balance",
  },
  {
    driver: "Low Credit Score (619)",
    impact: "High",
    impactScore: 18,
    detail: "Credit score below 650 increases predicted churn probability",
    feature: "creditScore",
  },
  {
    driver: "Age Bracket 40-49",
    impact: "Medium",
    impactScore: 14,
    detail: "Customers aged 40-49 exhibit 35.8% base churn rate in this dataset",
    feature: "age",
  },
  {
    driver: "Single Product Holder",
    impact: "Medium",
    impactScore: 10,
    detail: "1-product customers churn at 27.7% vs 7.6% for 2-product holders",
    feature: "numProducts",
  },
  {
    driver: "Short Tenure (2 years)",
    impact: "Low",
    impactScore: 7,
    detail: "Low tenure correlates weakly but positively with churn",
    feature: "tenure",
  },
];

const recommendedActions = [
  {
    action: "Personal call within 24 hours",
    priority: "Critical",
    expectedImpact: "High",
    effort: "Low",
    timeline: "Immediate",
  },
  {
    action: "Offer balance incentive / interest rate bump",
    priority: "High",
    expectedImpact: "High",
    effort: "Low",
    timeline: "This week",
  },
  {
    action: "Re-activate account — digital engagement push",
    priority: "High",
    expectedImpact: "High",
    effort: "Medium",
    timeline: "Within 3 days",
  },
  {
    action: "Credit score improvement consultation",
    priority: "Medium",
    expectedImpact: "Medium",
    effort: "Medium",
    timeline: "Within 7 days",
  },
  {
    action: "Present 2nd product bundle (cross-sell to optimal 2-product holding)",
    priority: "Medium",
    expectedImpact: "Medium",
    effort: "Low",
    timeline: "Within 14 days",
  },
];

const interactionHistory = [
  {
    date: "2026-04-08",
    type: "call",
    description: "Outbound call — customer mentioned considering switching banks",
    agent: "Sarah Johnson",
    outcome: "Follow-up scheduled",
  },
  {
    date: "2026-03-22",
    type: "digital",
    description: "Mobile app last login — balance check only",
    agent: "Digital Channel",
    outcome: "Low engagement",
  },
  {
    date: "2026-03-10",
    type: "campaign",
    description: "Email campaign: Spring savings account offer",
    agent: "Marketing Automation",
    outcome: "Not opened",
  },
  {
    date: "2026-02-18",
    type: "branch",
    description: "Branch visit — account inquiry and balance question",
    agent: "Paris Centrale Branch",
    outcome: "Resolved",
  },
  {
    date: "2026-01-25",
    type: "call",
    description: "Inbound call — fee query",
    agent: "Robert Chen",
    outcome: "Resolved",
  },
];

// Dataset feature benchmark comparison
const featureBenchmarkData = [
  { feature: "Credit Score", customer: 619, benchmark: 652 },
  { feature: "Balance (K)", customer: 0, benchmark: 76 },
  { feature: "Tenure (yr)", customer: 2, benchmark: 5 },
  { feature: "Products", customer: 1, benchmark: 1.5 },
  { feature: "Salary (K)", customer: 101, benchmark: 100 },
];

export function CustomerDetail() {
  const { customerId } = useParams();
  const customer =
    customerData[customerId as keyof typeof customerData] || customerData["C-15634602"];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Very High":
        return "text-red-700 bg-red-50";
      case "High":
        return "text-amber-700 bg-amber-50";
      case "Medium":
        return "text-blue-700 bg-blue-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-amber-500 text-white";
      case "Medium":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "complaint":
        return <AlertCircle className="w-4 h-4" />;
      case "campaign":
        return <Mail className="w-4 h-4" />;
      case "branch":
        return <Activity className="w-4 h-4" />;
      case "digital":
        return <Activity className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-700";
      case "complaint":
        return "bg-red-100 text-red-700";
      case "campaign":
        return "bg-purple-100 text-purple-700";
      case "branch":
        return "bg-green-100 text-green-700";
      case "digital":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const geoFlag = customer.geography === "France" ? "🇫🇷" : customer.geography === "Germany" ? "🇩🇪" : "🇪🇸";

  return (
    <>
      {/* Top Bar with Breadcrumb */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-gray-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/workspace" className="hover:text-gray-700">
            Retention Workspace
          </Link>
          <span>/</span>
          <span className="text-gray-900">Customer Detail</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/workspace"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 text-lg">{customer.name}</h2>
                {customer.predictedChurn && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
                    Predicted Churn
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {customer.id} • {geoFlag} {customer.geography} • {customer.gender}, Age {customer.age}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Phone className="w-4 h-4" />
              Call Customer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Status
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Top Row - Profile, Risk, Retention */}
          <div className="grid grid-cols-3 gap-6">
            {/* Dataset Feature Profile */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Profile</h3>
              {/* Dataset fields */}
              <div className="space-y-0">
                {[
                  { label: "Customer ID", value: customer.id, alert: false },
                  {
                    label: "Geography",
                    value: `${geoFlag} ${customer.geography}`,
                    alert: customer.geography === "Germany",
                    alertMsg: "High-churn geography",
                  },
                  { label: "Gender", value: customer.gender, alert: false },
                  {
                    label: "Age",
                    value: `${customer.age} years`,
                    alert: customer.age >= 40 && customer.age <= 60,
                    alertMsg: "High-risk age bracket",
                  },
                  { label: "Tenure", value: `${customer.tenure} year${customer.tenure !== 1 ? "s" : ""}`, alert: false },
                  {
                    label: "Credit Score",
                    value: customer.creditScore,
                    alert: customer.creditScore < 600,
                    alertMsg: "Below 600 threshold",
                  },
                  {
                    label: "Account Balance",
                    value: `$${customer.balance.toLocaleString()}`,
                    alert: customer.balance === 0,
                    alertMsg: "Zero balance — high risk",
                  },
                  {
                    label: "Num. Products",
                    value: customer.numProducts,
                    alert: customer.numProducts >= 3,
                    alertMsg: "3+ products = extreme risk",
                  },
                  { label: "Has Credit Card", value: customer.hasCrCard ? "Yes" : "No", alert: false },
                  {
                    label: "Active Member",
                    value: customer.isActiveMember ? "Yes ✓" : "No ✗",
                    alert: !customer.isActiveMember,
                    alertMsg: "Inactive = higher churn",
                  },
                  { label: "Estimated Salary", value: `$${customer.estimatedSalary.toLocaleString()}`, alert: false },
                ].map(({ label, value, alert, alertMsg }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-medium ${alert ? "text-red-600" : "text-gray-900"}`}>
                        {String(value)}
                      </span>
                      {alert && alertMsg && (
                        <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          {alertMsg}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              </div>
            </div>

            {/* Churn Risk Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Churn Risk Assessment</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {customer.riskScore}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRiskColor(customer.riskLevel)}`}
                  >
                    {customer.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm mb-1">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-600">+{customer.riskChange} pts</span>
                  </div>
                  <div className="text-xs text-gray-500">vs last month ({customer.lastMonthScore})</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Last month: {customer.lastMonthScore}</span>
                  <span>Current: {customer.riskScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${customer.riskScore}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">6-Month Risk Score Trend</h4>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Dataset context note */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Dataset context:</strong> This customer matches 4 of 5 top churn predictors:
                  non-active, zero balance, low credit score, age 40-49.
                </p>
              </div>
            </div>

            {/* Retention Success Prediction */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Retention Likelihood</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {customer.retentionLikelihood}%
                </div>
                <p className="text-sm text-gray-600">
                  Estimated retention success with immediate intervention
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">With immediate action (24h)</span>
                    <span className="font-medium text-green-600">{customer.retentionLikelihood}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${customer.retentionLikelihood}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">With delayed action (7 days)</span>
                    <span className="font-medium text-amber-600">{Math.max(customer.retentionLikelihood - 18, 10)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.max(customer.retentionLikelihood - 18, 10)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Without intervention</span>
                    <span className="font-medium text-red-600">{Math.max(customer.retentionLikelihood - 52, 5)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.max(customer.retentionLikelihood - 52, 5)}%` }} />
                  </div>
                </div>
              </div>

              {/* vs Dataset Averages */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-3">Feature vs Dataset Average</div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={featureBenchmarkData} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="feature" fontSize={10} width={75} />
                    <Tooltip />
                    <Bar dataKey="customer" name="This Customer" fill="#ef4444" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="benchmark" name="Dataset Avg" fill="#93c5fd" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Churn Drivers Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Top Churn Drivers (SHAP Feature Contributions)</h3>
                <p className="text-sm text-gray-500">
                  AI-attributed contributions from Gradient Boosting model trained on bank churn dataset
                </p>
              </div>
              <Link
                to="/model-governance"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View Model Details →
              </Link>
            </div>
            <div className="space-y-3">
              {churnDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="text-sm font-medium text-gray-900">{driver.driver}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getImpactColor(driver.impact)}`}
                      >
                        {driver.impact} Impact
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded font-mono">
                        {driver.feature}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{driver.detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0 w-20">
                    <div className="text-lg font-semibold text-gray-900">{driver.impactScore}%</div>
                    <div className="text-xs text-gray-500">contribution</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-red-400 h-1.5 rounded-full"
                        style={{ width: `${(driver.impactScore / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Retention Actions</h3>
            <div className="space-y-3">
              {recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${getPriorityColor(action.priority)}`}
                    >
                      {action.priority}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">{action.action}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Impact: {action.expectedImpact}</span>
                        <span>•</span>
                        <span>Effort: {action.effort}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {action.timeline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0">
                    Deploy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Interaction History */}
            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Interaction History</h3>
              <div className="space-y-4">
                {interactionHistory.map((interaction, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getInteractionColor(interaction.type)}`}
                      >
                        {getInteractionIcon(interaction.type)}
                      </div>
                      {idx < interactionHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900">
                          {interaction.description}
                        </div>
                        <div className="text-xs text-gray-500">{interaction.date}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{interaction.agent}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {interaction.outcome}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes and Action Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Notes & Action Log</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Note
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your note here..."
                  />
                  <button className="mt-2 w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Note
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Case Status
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Follow-up
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Set Reminder
                  </button>
                </div>

                {/* Model prediction note */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900 font-medium mb-1">Model Prediction</p>
                    <p className="text-xs text-blue-700">
                      Gradient Boosting v2.4.1 — Churn probability:{" "}
                      <strong>{(customer.riskScore / 100 * 0.92).toFixed(2)}</strong> (threshold: 0.50)
                    </p>
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
