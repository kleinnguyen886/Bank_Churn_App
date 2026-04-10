import { Link } from "react-router";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Filter,
  Bell,
  Download,
  Globe,
  UserX,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// Based on Kaggle Bank Churn Dataset (10,000 customers)
// Churn rate: ~20.4% | Geography: France/Germany/Spain
// Key drivers: Age, Num Products, Active Member, Balance, Geography, Credit Score

const kpiData = [
  {
    label: "Total Customers",
    value: "10,000",
    change: "+1.2%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Predicted Churners",
    value: "2,037",
    change: "+4.1%",
    trend: "down",
    icon: UserX,
    alert: true,
  },
  {
    label: "Overall Churn Rate",
    value: "20.4%",
    change: "+0.8%",
    trend: "down",
    icon: AlertTriangle,
    alert: true,
  },
  {
    label: "Retention Success Rate",
    value: "68.5%",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
  },
];

// Monthly churn volume trend
const churnTrendData = [
  { month: "Oct", churned: 298, retained: 1180, atRisk: 420 },
  { month: "Nov", churned: 312, retained: 1210, atRisk: 455 },
  { month: "Dec", churned: 287, retained: 1190, atRisk: 410 },
  { month: "Jan", churned: 325, retained: 1240, atRisk: 478 },
  { month: "Feb", churned: 341, retained: 1260, atRisk: 495 },
  { month: "Mar", churned: 318, retained: 1230, atRisk: 462 },
  { month: "Apr", churned: 156, retained: 631, atRisk: 241 },
];

// Churn rate by geography — Germany ~32%, France ~16%, Spain ~17%
const geographyData = [
  { name: "Germany", customers: 2509, churned: 814, churnRate: 32.4, color: "#ef4444" },
  { name: "France", customers: 5014, churned: 811, churnRate: 16.2, color: "#3b82f6" },
  { name: "Spain", customers: 2477, churned: 412, churnRate: 16.6, color: "#10b981" },
];

// Churn by number of products (key dataset insight: 3-4 products = near 100% churn)
const productChurnData = [
  { products: "1 Product", customers: 5084, churnRate: 27.7, color: "#f59e0b" },
  { products: "2 Products", customers: 4590, churnRate: 7.6, color: "#10b981" },
  { products: "3 Products", customers: 266, churnRate: 82.7, color: "#ef4444" },
  { products: "4 Products", customers: 60, churnRate: 100, color: "#7c3aed" },
];

// Churn by age bracket — 40-60 age group is highest risk
const ageChurnData = [
  { age: "18-29", churnRate: 9.2, count: 1420 },
  { age: "30-39", churnRate: 12.5, count: 2980 },
  { age: "40-49", churnRate: 35.8, count: 2340 },
  { age: "50-59", churnRate: 44.2, count: 1890 },
  { age: "60-69", churnRate: 38.6, count: 1020 },
  { age: "70+", churnRate: 28.1, count: 350 },
];

// Risk drivers radar (normalized 0-100)
const riskDriversData = [
  { subject: "Age 40-60", score: 88 },
  { subject: "3+ Products", score: 83 },
  { subject: "Inactive Member", score: 76 },
  { subject: "Germany Geo", score: 71 },
  { subject: "Low Balance", score: 65 },
  { subject: "Low Credit Score", score: 58 },
];

const topSegments = [
  {
    segment: "Germany — Non-Active Members",
    customers: 486,
    churnRate: 48.2,
    trend: "up",
    change: "+6.4%",
  },
  {
    segment: "Age 50-59 — Female",
    customers: 394,
    churnRate: 51.7,
    trend: "up",
    change: "+9.1%",
  },
  {
    segment: "3+ Product Holders",
    customers: 326,
    churnRate: 82.7,
    trend: "up",
    change: "+2.3%",
  },
  {
    segment: "Credit Score < 450",
    customers: 218,
    churnRate: 38.4,
    trend: "down",
    change: "-1.2%",
  },
];

const topActions = [
  {
    action: "Personal RM Outreach",
    deployed: 1840,
    successRate: 72,
    avgSavings: "$3,200",
  },
  { action: "Fee Waiver Offer", deployed: 1520, successRate: 68, avgSavings: "$2,800" },
  {
    action: "Product Simplification Review",
    deployed: 624,
    successRate: 74,
    avgSavings: "$4,100",
  },
  {
    action: "Activity Re-Engagement Campaign",
    deployed: 980,
    successRate: 65,
    avgSavings: "$2,400",
  },
];

const recentAlerts = [
  {
    title: "Germany Churn Rate Spike",
    description: "Germany churn rate exceeded 32% — 4.2% above monthly threshold",
    time: "2 hours ago",
    severity: "high",
  },
  {
    title: "3-Product Segment Critical",
    description: "82.7% of 3-product holders flagged as churn risk this cycle",
    time: "5 hours ago",
    severity: "high",
  },
  {
    title: "Female Age 40-60 Trend",
    description: "Churn risk for Female 40-60 cohort up 9.1% vs prior month",
    time: "1 day ago",
    severity: "medium",
  },
  {
    title: "Model Drift Alert",
    description: "Prediction accuracy on new data dropped to 84.2%",
    time: "1 day ago",
    severity: "medium",
  },
];

export function ExecutiveDashboard() {
  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div>
          <h2 className="font-semibold text-gray-900">Executive Overview Dashboard</h2>
          <p className="text-sm text-gray-500">
            Bank churn prediction monitoring — 10,000 customers tracked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>All Geographies</span>
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
          </button>
          <button className="relative px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {kpiData.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className={`bg-white rounded-lg border p-6 ${
                    kpi.alert ? "border-red-200 bg-red-50/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        kpi.alert ? "bg-red-100" : "bg-blue-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${kpi.alert ? "text-red-600" : "text-blue-600"}`}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span
                        className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}
                      >
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{kpi.value}</div>
                  <div className="text-sm text-gray-600">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            {/* Churn Volume Trend */}
            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Monthly Churn Volume Trend</h3>
                  <p className="text-sm text-gray-500">Churned vs retained vs at-risk customers</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={churnTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="churned"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Churned"
                    dot={{ fill: "#ef4444" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="atRisk"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="At Risk"
                    dot={{ fill: "#f59e0b" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="retained"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Retained"
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Geography Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Churn Rate by Geography</h3>
                </div>
                <p className="text-sm text-gray-500">Germany ~2× higher than FR/ES</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={geographyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="churned"
                  >
                    {geographyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} churned`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {geographyData.map((geo) => (
                  <div key={geo.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: geo.color }}
                      />
                      <span className="text-gray-700">{geo.name}</span>
                      <span className="text-xs text-gray-400">({geo.customers.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-semibold ${
                          geo.churnRate > 25 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {geo.churnRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            {/* Churn Rate by Number of Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Churn Rate by Number of Products</h3>
                  <p className="text-sm text-gray-500">
                    3+ products signal extreme churn risk
                  </p>
                </div>
                <Link
                  to="/workspace?risk=high"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Cases →
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={productChurnData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="products" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Churn Rate"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate" radius={[4, 4, 0, 0]}>
                    {productChurnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Churn Rate by Age Bracket */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Churn Rate by Age Bracket</h3>
                  <p className="text-sm text-gray-500">
                    Age 40-59 is the highest-risk cohort
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ageChurnData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="age" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 60]}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      name === "churnRate" ? `${v}%` : v,
                      name === "churnRate" ? "Churn Rate" : "Customers",
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="churnRate"
                    name="Churn Rate"
                    radius={[4, 4, 0, 0]}
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Top High-Risk Segments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top High-Risk Cohorts</h3>
                <Link to="/workspace" className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {topSegments.map((seg, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{seg.segment}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {seg.customers} customers
                          <span
                            className={`ml-2 font-medium ${
                              seg.trend === "up" ? "text-red-500" : "text-green-500"
                            }`}
                          >
                            {seg.change}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">{seg.churnRate}%</div>
                        <div className="text-xs text-gray-500">churn rate</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          seg.churnRate > 60
                            ? "bg-red-600"
                            : seg.churnRate > 35
                            ? "bg-red-400"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${seg.churnRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Retention Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top Retention Actions</h3>
                <Link to="/campaigns" className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {topActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{action.action}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {action.deployed} deployed
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {action.successRate}%
                        </div>
                        <div className="text-xs text-gray-500">success</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Avg customer LTV saved</span>
                      <span className="font-medium text-gray-700">{action.avgSavings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Priority Alerts</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-4">
                {recentAlerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        alert.severity === "high"
                          ? "bg-red-500"
                          : alert.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{alert.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View All Alerts
              </button>
            </div>
          </div>

          {/* Gender Breakdown Banner */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Churn Rate by Gender & Activity Status</h3>
                <p className="text-sm text-gray-500">
                  Female customers churn at ~25% vs ~16.5% for male; inactive members at ~26.9%
                </p>
              </div>
              <Link to="/workspace" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Workspace →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Female", churnRate: 25.1, total: 4543, color: "bg-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
                { label: "Male", churnRate: 16.5, total: 5457, color: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
                { label: "Inactive Member", churnRate: 26.9, total: 4849, color: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
                { label: "Active Member", churnRate: 14.3, total: 5151, color: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg p-4 ${item.bg}`}>
                  <div className={`text-xs font-medium ${item.text} mb-1`}>{item.label}</div>
                  <div className={`text-2xl font-bold ${item.text} mb-2`}>{item.churnRate}%</div>
                  <div className="text-xs text-gray-500">{item.total.toLocaleString()} customers</div>
                  <div className="w-full bg-white/70 rounded-full h-1.5 mt-2">
                    <div
                      className={`${item.color} h-1.5 rounded-full`}
                      style={{ width: `${item.churnRate * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
