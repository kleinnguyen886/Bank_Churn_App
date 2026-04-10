import { useState } from "react";
import {
  Plus,
  Filter,
  Download,
  Play,
  Pause,
  TrendingUp,
  Users,
  Target,
  Globe,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Dataset-aligned campaign data
// Segments based on Kaggle bank churn dataset insights:
// Germany (32% churn), Female 40-60 (51% churn), Non-active members (27% churn),
// 3+ product holders (82% churn), Low credit score customers

const kpiData = [
  { label: "Active Campaigns", value: "9", change: "+2", icon: Play },
  { label: "Customers Targeted", value: "6,284", change: "+840", icon: Users },
  { label: "Offer Acceptance Rate", value: "38.6%", change: "+4.1%", icon: TrendingUp },
  { label: "Churns Prevented", value: "1,247", change: "+318", icon: Target },
];

// Campaigns targeting dataset-identified high-risk cohorts
const campaigns = [
  {
    id: 1,
    name: "Germany Re-Engagement Drive",
    segment: "Germany — All Risk Levels",
    channel: "Personal Call + Email",
    startDate: "2026-04-01",
    targetAudience: 2509,
    reached: 2210,
    converted: 892,
    conversionRate: 40.4,
    retentionOutcome: 71,
    status: "active",
    budget: "$251,000",
    churnRateBefore: 32.4,
  },
  {
    id: 2,
    name: "Women 40-60 Priority Outreach",
    segment: "Female, Age 40-60 — High Risk",
    channel: "RM Personal Call",
    startDate: "2026-03-20",
    targetAudience: 820,
    reached: 820,
    converted: 492,
    conversionRate: 60.0,
    retentionOutcome: 76,
    status: "active",
    budget: "$98,400",
    churnRateBefore: 51.7,
  },
  {
    id: 3,
    name: "Non-Active Member Wake-Up",
    segment: "IsActiveMember = 0 — Medium Risk",
    channel: "Email + Push Notification",
    startDate: "2026-03-01",
    targetAudience: 4849,
    reached: 4849,
    converted: 1455,
    conversionRate: 30.0,
    retentionOutcome: 58,
    status: "completed",
    budget: "$72,735",
    churnRateBefore: 26.9,
  },
  {
    id: 4,
    name: "3-Product Simplification Offer",
    segment: "NumOfProducts ≥ 3 — Critical Risk",
    channel: "Senior RM Escalation",
    startDate: "2026-04-05",
    targetAudience: 326,
    reached: 298,
    converted: 210,
    conversionRate: 70.5,
    retentionOutcome: 82,
    status: "active",
    budget: "$163,000",
    churnRateBefore: 82.7,
  },
  {
    id: 5,
    name: "Zero Balance Recovery",
    segment: "Balance = 0 — High Risk",
    channel: "Personal Call + Incentive",
    startDate: "2026-02-15",
    targetAudience: 1780,
    reached: 1780,
    converted: 748,
    conversionRate: 42.0,
    retentionOutcome: 64,
    status: "completed",
    budget: "$89,000",
    churnRateBefore: 36.2,
  },
  {
    id: 6,
    name: "Low Credit Score Counselling",
    segment: "CreditScore < 500 — All Risk",
    channel: "Dedicated Advisor + Workshop",
    startDate: "2026-04-08",
    targetAudience: 480,
    reached: 310,
    converted: 118,
    conversionRate: 38.1,
    retentionOutcome: 55,
    status: "active",
    budget: "$57,600",
    churnRateBefore: 38.4,
  },
];

// Acceptance rate by geography (dataset segments)
const acceptanceByGeo = [
  { segment: "France", acceptance: 42.1, churnRate: 16.2, color: "#3b82f6" },
  { segment: "Germany", acceptance: 38.4, churnRate: 32.4, color: "#ef4444" },
  { segment: "Spain", acceptance: 44.8, churnRate: 16.6, color: "#10b981" },
];

// Acceptance rate by key feature segments
const acceptanceByFeature = [
  { segment: "Active Members", acceptance: 51.2, fill: "#10b981" },
  { segment: "Non-Active", acceptance: 28.7, fill: "#ef4444" },
  { segment: "1 Product", acceptance: 38.5, fill: "#f59e0b" },
  { segment: "2 Products", acceptance: 52.4, fill: "#3b82f6" },
  { segment: "3+ Products", acceptance: 68.1, fill: "#7c3aed" },
  { segment: "Female 40-60", acceptance: 60.8, fill: "#ec4899" },
];

const retentionTrend = [
  { month: "Nov", campaigns: 6, prevented: 820, budget: 195 },
  { month: "Dec", campaigns: 7, prevented: 1050, budget: 248 },
  { month: "Jan", campaigns: 7, prevented: 920, budget: 221 },
  { month: "Feb", campaigns: 8, prevented: 1180, budget: 312 },
  { month: "Mar", campaigns: 9, prevented: 1420, budget: 380 },
  { month: "Apr", campaigns: 9, prevented: 1247, budget: 342 },
];

// AI-recommended campaigns based on dataset patterns
const recommendedOffers = [
  {
    offer: "Germany Loyalty Reward Program",
    targetSegment: "Germany — Non-Active, Age 40+",
    insight: "Germany 2× churn rate; non-active age 40+ segment ~48% churn",
    estimatedReach: 640,
    expectedConversion: 55,
    estimatedPrevented: 352,
    priority: "Critical",
    churnRateTarget: 48.2,
  },
  {
    offer: "Product Portfolio Simplification",
    targetSegment: "NumOfProducts ≥ 3 — Untreated",
    insight: "3+ product holders show 82.7% churn rate — immediate consolidation needed",
    estimatedReach: 116,
    expectedConversion: 72,
    estimatedPrevented: 84,
    priority: "Critical",
    churnRateTarget: 82.7,
  },
  {
    offer: "Female Empowerment Finance Package",
    targetSegment: "Female, Age 45-55 — France/Germany",
    insight: "Female customers churn at ~25% vs male ~16.5%; targeted engagement shows 60%+ acceptance",
    estimatedReach: 380,
    expectedConversion: 58,
    estimatedPrevented: 220,
    priority: "High",
    churnRateTarget: 51.7,
  },
  {
    offer: "Zero-Balance Savings Seed Campaign",
    targetSegment: "Balance = $0 — Untreated Customers",
    insight: "Zero-balance customers have significantly higher exit rates; seed incentive drives deposits",
    estimatedReach: 920,
    expectedConversion: 34,
    estimatedPrevented: 313,
    priority: "High",
    churnRateTarget: 36.2,
  },
];

export function CampaignCenter() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSegment, setSelectedSegment] = useState("all");

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "paused":
        return "bg-amber-100 text-amber-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Campaign & Retention Offers Center</h2>
            <p className="text-sm text-gray-500">
              Targeted campaigns based on bank churn dataset — geography, age, products, activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-2" />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Segments</option>
            <option value="germany">🇩🇪 Germany</option>
            <option value="france">🇫🇷 France</option>
            <option value="spain">🇪🇸 Spain</option>
            <option value="nonactive">Non-Active Members</option>
            <option value="multiproduct">3+ Product Holders</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-4 gap-6">
            {kpiData.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">{kpi.change}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{kpi.value}</div>
                  <div className="text-sm text-gray-600">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Retention Prevention Trend */}
            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Campaign Performance Trend</h3>
                  <p className="text-sm text-gray-500">
                    Churns prevented and budget utilization by month
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={retentionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="prevented"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Churns Prevented"
                    dot={{ fill: "#10b981" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="budget"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Budget ($K)"
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Acceptance Rate by Feature Segment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Acceptance by Feature Segment</h3>
                <p className="text-sm text-gray-500">Offer uptake by dataset cohort</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={acceptanceByFeature} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="segment" stroke="#9ca3af" fontSize={10} width={95} />
                  <Tooltip formatter={(v) => [`${v}%`, "Acceptance Rate"]} />
                  <Bar dataKey="acceptance" radius={[0, 4, 4, 0]}>
                    {acceptanceByFeature.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geo Acceptance Overview */}
          <div className="grid grid-cols-3 gap-4">
            {acceptanceByGeo.map((geo) => (
              <div key={geo.segment} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{geo.segment}</span>
                    <span className="text-lg">
                      {geo.segment === "France" ? "🇫🇷" : geo.segment === "Germany" ? "🇩🇪" : "🇪🇸"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Baseline Churn Rate</div>
                    <div className={`text-xl font-bold ${geo.churnRate > 25 ? "text-red-600" : "text-amber-600"}`}>
                      {geo.churnRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Campaign Acceptance</div>
                    <div className="text-xl font-bold text-green-600">{geo.acceptance}%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Acceptance rate</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${geo.acceptance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI-Recommended Offers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">AI-Recommended Campaign Ideas</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Generated from bank churn dataset patterns — geography, age, product count, activity
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recommendedOffers.map((offer, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{offer.offer}</h4>
                      <p className="text-xs text-gray-500 font-mono">{offer.targetSegment}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ml-2 ${getPriorityColor(offer.priority)}`}
                    >
                      {offer.priority}
                    </span>
                  </div>
                  <div className="mb-3 p-2.5 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800">
                    <strong>Dataset insight:</strong> {offer.insight}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Reach</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {offer.estimatedReach}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Conv. %</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {offer.expectedConversion}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Prevented</div>
                      <div className="text-sm font-semibold text-green-600">
                        {offer.estimatedPrevented}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Base Churn</div>
                      <div className="text-sm font-semibold text-red-600">
                        {offer.churnRateTarget}%
                      </div>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Campaign
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Active & Recent Campaigns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Campaign Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Target Cohort
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Base Churn
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Retention
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{campaign.startDate}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {campaign.segment}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">{campaign.channel}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className={`text-sm font-semibold ${
                            campaign.churnRateBefore > 50
                              ? "text-red-600"
                              : campaign.churnRateBefore > 30
                              ? "text-amber-600"
                              : "text-gray-700"
                          }`}
                        >
                          {campaign.churnRateBefore}%
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">
                          {campaign.reached.toLocaleString()} /{" "}
                          {campaign.targetAudience.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{
                              width: `${(campaign.reached / campaign.targetAudience) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {campaign.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.converted} converted
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-green-600">
                            {campaign.retentionOutcome}%
                          </div>
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.budget}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          {campaign.status === "active" ? (
                            <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded">
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
