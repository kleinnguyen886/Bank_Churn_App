import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, CheckCircle2, Clock, Eye, Phone, Search, UserCheck, X } from "lucide-react";

import { apiGet } from "../lib/api";

type WorkspaceRow = {
  customer_id: string;
  name: string;
  geography: string;
  risk: string;
  score: number;
  owner: string;
  status: string;
  city?: string;
  region?: string;
  customer_age_group?: string;
  synthetic_email?: string;
  synthetic_phone?: string;
};

type WorkspaceResponse = {
  rows: WorkspaceRow[];
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
};

function getGeoFlag(geo: string): string {
  switch (geo) {
    case "France":
      return "🇫🇷";
    case "Germany":
      return "🇩🇪";
    case "Spain":
      return "🇪🇸";
    default:
      return "🌍";
  }
}

function getRiskClass(risk: string): string {
  const level = risk.toLowerCase();
  if (level === "high") return "bg-red-100 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function getStatusClass(status: string): string {
  const value = status.toLowerCase();
  if (value === "new") return "bg-blue-100 text-blue-700";
  if (value === "in-progress") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

export function RetentionWorkspace() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<WorkspaceRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    riskLevel: searchParams.get("risk") || "all",
    geography: "all",
    status: "all",
    owner: "all",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", "25");
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (filters.riskLevel !== "all") params.set("risk", filters.riskLevel);
      if (filters.geography !== "all") params.set("geography", filters.geography);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.owner !== "all") params.set("owner", filters.owner);

      try {
        const payload = await apiGet<WorkspaceResponse>(`/api/workspace?${params.toString()}`);
        if (cancelled) return;

        setRows(payload.rows || []);
        setPage(payload.page || 1);
        setTotalPages(payload.total_pages || 1);
        setTotalRows(payload.total_rows || 0);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load workspace data");
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [filters, page, searchTerm]);

  const selectedCustomer = useMemo(
    () => rows.find((row) => row.customer_id === selectedCustomerId) || null,
    [rows, selectedCustomerId],
  );

  const stats = useMemo(() => {
    const newHighRisk = rows.filter((row) => row.status === "new" && row.risk.toLowerCase() === "high").length;
    const inProgress = rows.filter((row) => row.status === "in-progress").length;
    const completed = rows.filter((row) => row.status === "completed").length;
    const totalHighRisk = rows.filter((row) => row.risk.toLowerCase() === "high").length;
    return { newHighRisk, inProgress, completed, totalHighRisk };
  }, [rows]);

  const owners = useMemo(() => {
    const values = Array.from(new Set(rows.map((row) => row.owner).filter(Boolean)));
    values.sort();
    return values;
  }, [rows]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Retention Action Workspace</h2>
            <p className="text-sm text-gray-500">API-driven quick view using enriched customer dataset output</p>
          </div>
          <div className="text-sm text-gray-500">{totalRows.toLocaleString()} records</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, ID, or geography..."
              value={searchTerm}
              onChange={(event) => {
                setPage(1);
                setSearchTerm(event.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.riskLevel}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, riskLevel: event.target.value }));
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">All Risk</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.geography}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, geography: event.target.value }));
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">All Geographies</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Spain">Spain</option>
          </select>

          <select
            value={filters.status}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, status: event.target.value }));
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.owner}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, owner: event.target.value }));
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">All Owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-2xl font-semibold text-gray-900">{stats.newHighRisk}</div>
              <div className="text-sm text-gray-600">New High-Risk (page)</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress (page)</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-2xl font-semibold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed (page)</div>
            </div>
            <div className="bg-white rounded-lg border border-red-200 bg-red-50/40 px-4 py-3">
              <div className="text-2xl font-semibold text-red-700">{stats.totalHighRisk}</div>
              <div className="text-sm text-red-600">High Risk (page)</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading && <div className="px-6 py-8 text-sm text-gray-500">Loading workspace rows...</div>}
            {error && <div className="px-6 py-8 text-sm text-red-600">{error}</div>}

            {!isLoading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Risk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.customer_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{row.name}</div>
                          <div className="text-xs text-gray-500">{row.customer_id}</div>
                          {row.customer_age_group && (
                            <div className="text-xs text-gray-400">Age group: {row.customer_age_group}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>
                            {getGeoFlag(row.geography)} {row.geography}
                          </div>
                          <div className="text-xs text-gray-500">{[row.city, row.region].filter(Boolean).join(", ") || "-"}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900">{Math.round((row.score || 0) * 100)}</div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getRiskClass(row.risk)}`}>
                            {row.risk}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{row.owner || "Unassigned"}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/customer/${row.customer_id}`}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View details</span>
                            </Link>

                            {row.synthetic_phone ? (
                              <a
                                href={`tel:${row.synthetic_phone}`}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded"
                                title="Call now"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </a>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded cursor-not-allowed"
                                title="No phone available"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedCustomerId(row.customer_id)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                              title="Quick view"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Quick view</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rows.length === 0 && (
                  <div className="py-12 text-center text-gray-500">No customers found for current filters.</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Customer Quick View</h3>
            <button onClick={() => setSelectedCustomerId(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</div>
              <div className="text-sm text-gray-500">{selectedCustomer.customer_id}</div>
              <div className="text-sm text-gray-600 mt-1">{getGeoFlag(selectedCustomer.geography)} {selectedCustomer.geography}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Risk</span><span className="font-medium">{selectedCustomer.risk}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Score</span><span className="font-medium">{Math.round((selectedCustomer.score || 0) * 100)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Owner</span><span className="font-medium">{selectedCustomer.owner || "Unassigned"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{selectedCustomer.status}</span></div>
            </div>

            <div className="pt-3 border-t border-gray-200 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <span className="text-gray-700">City/Region: {[selectedCustomer.city, selectedCustomer.region].filter(Boolean).join(", ") || "-"}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                <span className="text-gray-700">Email: {selectedCustomer.synthetic_email || "Not available"}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-gray-700">Phone: {selectedCustomer.synthetic_phone || "Not available"}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 space-y-2">
            <Link
              to={`/customer/${selectedCustomer.customer_id}`}
              className="block w-full px-4 py-2 text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Full Details
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
