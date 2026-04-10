import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  Filter,
  Download,
  Phone,
  Eye,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  MapPin,
  CreditCard,
  Activity,
} from "lucide-react";

// Dataset-aligned mock customers
// Fields from Kaggle bank churn dataset:
// CreditScore, Geography, Gender, Age, Tenure, Balance, NumOfProducts, HasCrCard, IsActiveMember, EstimatedSalary
const mockCustomers = [
  {
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
    riskScore: 87,
    riskLevel: "high",
    reasons: ["Non-active member", "Zero balance", "Low tenure"],
    recommendedAction: "Personal call + balance incentive",
    assignedStaff: "Sarah Johnson",
    lastContact: "2026-04-08",
    followUp: "2026-04-11",
    status: "new",
    priority: true,
  },
  {
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
    riskScore: 94,
    riskLevel: "high",
    reasons: ["3+ products held", "Germany high-risk geo", "Age 50-60 bracket", "Non-active member"],
    recommendedAction: "Product consolidation offer + RM escalation",
    assignedStaff: "Robert Chen",
    lastContact: "2026-04-07",
    followUp: "2026-04-11",
    status: "in-progress",
    priority: true,
  },
  {
    id: "C-15619304",
    name: "Ana García",
    geography: "Spain",
    gender: "Female",
    age: 47,
    tenure: 5,
    creditScore: 699,
    balance: 58782,
    numProducts: 1,
    hasCrCard: true,
    isActiveMember: false,
    estimatedSalary: 74892,
    riskScore: 72,
    riskLevel: "high",
    reasons: ["Non-active member", "Age 40-49 bracket"],
    recommendedAction: "Activity re-engagement campaign",
    assignedStaff: "Sarah Johnson",
    lastContact: "2026-04-05",
    followUp: "2026-04-10",
    status: "in-progress",
    priority: false,
  },
  {
    id: "C-15701122",
    name: "Franz Weber",
    geography: "Germany",
    gender: "Male",
    age: 50,
    tenure: 3,
    creditScore: 445,
    balance: 142560,
    numProducts: 2,
    hasCrCard: true,
    isActiveMember: true,
    estimatedSalary: 115200,
    riskScore: 68,
    riskLevel: "medium",
    reasons: ["Low credit score (<450)", "Germany geography", "Age 50-59"],
    recommendedAction: "Credit counselling + loyalty offer",
    assignedStaff: "Maria Garcia",
    lastContact: "2026-04-06",
    followUp: "2026-04-13",
    status: "new",
    priority: false,
  },
  {
    id: "C-15784802",
    name: "Sophie Laurent",
    geography: "France",
    gender: "Female",
    age: 57,
    tenure: 0,
    creditScore: 550,
    balance: 0,
    numProducts: 4,
    hasCrCard: false,
    isActiveMember: false,
    estimatedSalary: 93480,
    riskScore: 98,
    riskLevel: "high",
    reasons: ["4 products held (extreme risk)", "Non-active member", "Zero balance", "Age 50-60"],
    recommendedAction: "Immediate senior RM intervention",
    assignedStaff: "Robert Chen",
    lastContact: "2026-04-09",
    followUp: "2026-04-11",
    status: "new",
    priority: true,
  },
  {
    id: "C-15613022",
    name: "Luca Romano",
    geography: "France",
    gender: "Male",
    age: 34,
    tenure: 8,
    creditScore: 720,
    balance: 89400,
    numProducts: 2,
    hasCrCard: true,
    isActiveMember: true,
    estimatedSalary: 62050,
    riskScore: 38,
    riskLevel: "low",
    reasons: ["Moderate digital engagement dip"],
    recommendedAction: "Proactive check-in email",
    assignedStaff: "Sarah Johnson",
    lastContact: "2026-04-04",
    followUp: "2026-04-18",
    status: "completed",
    priority: false,
  },
  {
    id: "C-15698233",
    name: "Hans Becker",
    geography: "Germany",
    gender: "Male",
    age: 44,
    tenure: 4,
    creditScore: 588,
    balance: 110450,
    numProducts: 1,
    hasCrCard: true,
    isActiveMember: false,
    estimatedSalary: 99100,
    riskScore: 62,
    riskLevel: "medium",
    reasons: ["Germany geography", "Non-active member"],
    recommendedAction: "Email campaign + product upgrade offer",
    assignedStaff: "Maria Garcia",
    lastContact: "2026-04-03",
    followUp: "2026-04-15",
    status: "new",
    priority: false,
  },
  {
    id: "C-15756022",
    name: "Isabelle Martin",
    geography: "France",
    gender: "Female",
    age: 61,
    tenure: 7,
    creditScore: 412,
    balance: 0,
    numProducts: 3,
    hasCrCard: false,
    isActiveMember: false,
    estimatedSalary: 54320,
    riskScore: 96,
    riskLevel: "high",
    reasons: ["3 products held", "Zero balance", "Non-active member", "Low credit score", "Age 60+"],
    recommendedAction: "Immediate call + fee waiver + product simplification",
    assignedStaff: "Sarah Johnson",
    lastContact: "2026-04-10",
    followUp: "2026-04-11",
    status: "in-progress",
    priority: true,
  },
  {
    id: "C-15742210",
    name: "Carlos Fernández",
    geography: "Spain",
    gender: "Male",
    age: 29,
    tenure: 6,
    creditScore: 680,
    balance: 34200,
    numProducts: 2,
    hasCrCard: true,
    isActiveMember: true,
    estimatedSalary: 48900,
    riskScore: 24,
    riskLevel: "low",
    reasons: ["No immediate flags"],
    recommendedAction: "Retention monitoring only",
    assignedStaff: "Maria Garcia",
    lastContact: "2026-03-28",
    followUp: "2026-04-28",
    status: "completed",
    priority: false,
  },
];

export function RetentionWorkspace() {
  const [searchParams] = useSearchParams();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    riskLevel: searchParams.get("risk") || "all",
    geography: "all",
    status: "all",
    assignedStaff: "all",
  });

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.geography.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      filters.riskLevel === "all" || customer.riskLevel === filters.riskLevel;
    const matchesGeo =
      filters.geography === "all" || customer.geography === filters.geography;
    const matchesStatus = filters.status === "all" || customer.status === filters.status;
    const matchesStaff =
      filters.assignedStaff === "all" || customer.assignedStaff === filters.assignedStaff;

    return matchesSearch && matchesRisk && matchesGeo && matchesStatus && matchesStaff;
  });

  const stats = {
    newHighRisk: mockCustomers.filter((c) => c.status === "new" && c.riskLevel === "high").length,
    inProgress: mockCustomers.filter((c) => c.status === "in-progress").length,
    completedToday: mockCustomers.filter((c) => c.status === "completed").length,
    totalHighRisk: mockCustomers.filter((c) => c.riskLevel === "high").length,
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getGeoFlag = (geo: string) => {
    switch (geo) {
      case "France": return "🇫🇷";
      case "Germany": return "🇩🇪";
      case "Spain": return "🇪🇸";
      default: return "🌍";
    }
  };

  const selectedCustomerData = mockCustomers.find((c) => c.id === selectedCustomer);

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Retention Action Workspace</h2>
            <p className="text-sm text-gray-500">
              Review and manage churn risk cases across France, Germany, and Spain
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Bulk Assign
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, customer ID, or geography..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select
            value={filters.geography}
            onChange={(e) => setFilters({ ...filters, geography: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Geographies</option>
            <option value="France">🇫🇷 France</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Spain">🇪🇸 Spain</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.newHighRisk}</div>
                  <div className="text-sm text-gray-600">New High-Risk Cases</div>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">In-Progress Cases</div>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.completedToday}
                  </div>
                  <div className="text-sm text-gray-600">Completed Today</div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-red-200 bg-red-50/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold text-red-700">{stats.totalHighRisk}</div>
                  <div className="text-sm text-red-600">Total High-Risk</div>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Geography
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Age / Tenure
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Products / Active
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Top Churn Drivers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={`hover:bg-gray-50 ${customer.priority ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {customer.priority && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-gray-500">{customer.id}</div>
                            <div className="text-xs text-gray-400">{customer.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{getGeoFlag(customer.geography)}</span>
                          <span
                            className={`text-sm font-medium ${
                              customer.geography === "Germany"
                                ? "text-red-700"
                                : "text-gray-700"
                            }`}
                          >
                            {customer.geography}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">Age {customer.age}</div>
                        <div className="text-xs text-gray-500">{customer.tenure}yr tenure</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                              customer.numProducts >= 3
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {customer.numProducts} prod.
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity
                            className={`w-3 h-3 ${
                              customer.isActiveMember ? "text-green-500" : "text-red-400"
                            }`}
                          />
                          <span className="text-xs text-gray-500">
                            {customer.isActiveMember ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.balance === 0
                            ? <span className="text-red-600">$0</span>
                            : `$${(customer.balance / 1000).toFixed(0)}K`}
                        </div>
                        <div className="text-xs text-gray-500">
                          CS: {customer.creditScore}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {customer.riskScore}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${getRiskColor(customer.riskLevel)}`}
                          >
                            {customer.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.reasons.slice(0, 2).map((reason, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {reason}
                            </span>
                          ))}
                          {customer.reasons.length > 2 && (
                            <span className="px-1.5 py-1 text-xs text-gray-400">
                              +{customer.reasons.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(customer.status)}`}
                        >
                          {customer.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/customer/${customer.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Call now"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(customer.id)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Quick view"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No customers found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Side Panel */}
      {selectedCustomerData && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Customer Quick View</h3>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-5">
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-0.5">
                {selectedCustomerData.name}
              </div>
              <div className="text-sm text-gray-500">{selectedCustomerData.id}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">{["France","Germany","Spain"].includes(selectedCustomerData.geography) ? (selectedCustomerData.geography === "France" ? "🇫🇷" : selectedCustomerData.geography === "Germany" ? "🇩🇪" : "🇪🇸") : "🌍"}</span>
                <span className="text-sm font-medium text-gray-700">{selectedCustomerData.geography}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{selectedCustomerData.gender}, {selectedCustomerData.age}yrs</span>
              </div>
            </div>

            {/* Key Dataset Fields */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Profile</div>
              {[
                { label: "Credit Score", value: selectedCustomerData.creditScore, alert: selectedCustomerData.creditScore < 500 },
                { label: "Balance", value: selectedCustomerData.balance === 0 ? "$0 ⚠️" : `$${selectedCustomerData.balance.toLocaleString()}`, alert: selectedCustomerData.balance === 0 },
                { label: "Num. Products", value: `${selectedCustomerData.numProducts}`, alert: selectedCustomerData.numProducts >= 3 },
                { label: "Active Member", value: selectedCustomerData.isActiveMember ? "Yes ✓" : "No ✗", alert: !selectedCustomerData.isActiveMember },
                { label: "Has Credit Card", value: selectedCustomerData.hasCrCard ? "Yes" : "No", alert: false },
                { label: "Tenure", value: `${selectedCustomerData.tenure} years`, alert: false },
                { label: "Est. Salary", value: `$${selectedCustomerData.estimatedSalary.toLocaleString()}`, alert: false },
              ].map(({ label, value, alert }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm font-medium ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedCustomerData.riskScore}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded border ${getRiskColor(selectedCustomerData.riskLevel)}`}
                  >
                    {selectedCustomerData.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedCustomerData.status)}`}
                >
                  {selectedCustomerData.status.replace("-", " ")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-900 mb-2">Churn Drivers</div>
              <div className="space-y-2">
                {selectedCustomerData.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-900 mb-2">Recommended Action</div>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">{selectedCustomerData.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assigned To</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedCustomerData.assignedStaff}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Contact</span>
                <span className="text-sm text-gray-900">{selectedCustomerData.lastContact}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Follow-up Date</span>
                <span className="text-sm text-gray-900">{selectedCustomerData.followUp}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 space-y-2">
            <Link
              to={`/customer/${selectedCustomerData.id}`}
              className="block w-full px-4 py-2 text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Full Details
            </Link>
            <button className="w-full px-4 py-2 text-sm text-center border border-gray-300 rounded-lg hover:bg-gray-50">
              Mark In Progress
            </button>
          </div>
        </div>
      )}
    </>
  );
}
