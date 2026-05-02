import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { AlertCircle, ArrowLeft, Clock, Mail, MapPin, Phone, Tag } from "lucide-react";

import { apiGet } from "../lib/api";

type Driver = {
  name: string;
  impact: string;
};

type HistoryItem = {
  date: string;
  type: string;
  description: string;
};

type CustomerPayload = {
  customer_id: string;
  name: string;
  geography: string;
  gender: string;
  age: number;
  tenure: number;
  credit_score: number;
  balance: number;
  num_products: number;
  has_cr_card: boolean;
  is_active_member: boolean;
  estimated_salary: number;
  risk: string;
  score: number;
  recommended_action: string;
  email: string;
  phone: string;
  synthetic_first_name: string;
  country_iso2: string;
  locale: string;
  timezone: string;
  local_currency: string;
  region: string;
  city: string;
  postal_code: string;
  street_address: string;
  phone_country_code: string;
  customer_age_group: string;
};

type CustomerContextResponse = {
  title: string;
  subtitle: string;
  customer: CustomerPayload;
  drivers: Driver[];
  history: HistoryItem[];
};

function getRiskClass(risk: string): string {
  const value = risk.toLowerCase();
  if (value === "high") return "bg-red-100 text-red-700 border-red-200";
  if (value === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-green-100 text-green-700 border-green-200";
}

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

export function CustomerDetail() {
  const { customerId } = useParams();
  const [data, setData] = useState<CustomerContextResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError("Missing customer id");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCustomer() {
      setIsLoading(true);
      setError(null);
      try {
        const payload = await apiGet<CustomerContextResponse>(`/api/customer/${encodeURIComponent(customerId)}`);
        if (!cancelled) {
          setData(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load customer details");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCustomer();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const customer = data?.customer;
  const riskScore = useMemo(() => {
    if (!customer) return 0;
    return Math.max(0, Math.min(100, Math.round((customer.score || 0) * 100)));
  }, [customer]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link to="/" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <Link to="/workspace" className="hover:text-gray-700">Retention Workspace</Link>
          <span>/</span>
          <span className="text-gray-900">Customer Detail</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/workspace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{customer?.name || "Customer"}</h2>
              {customer && (
                <p className="text-sm text-gray-500">
                  {customer.customer_id} • {getGeoFlag(customer.geography)} {customer.geography} • {customer.gender}, Age {customer.age}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {isLoading && <div className="text-sm text-gray-500">Loading customer detail...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!isLoading && !error && customer && (
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">General Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Full Name</span><span className="font-medium text-gray-900">{customer.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Synthetic First Name</span><span className="font-medium text-gray-900">{customer.synthetic_first_name || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">City</span><span className="font-medium text-gray-900">{customer.city || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Region</span><span className="font-medium text-gray-900">{customer.region || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Postal Code</span><span className="font-medium text-gray-900">{customer.postal_code || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Address</span><span className="font-medium text-gray-900">{customer.street_address || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Locale</span><span className="font-medium text-gray-900">{customer.locale || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">TimeZone</span><span className="font-medium text-gray-900">{customer.timezone || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Currency</span><span className="font-medium text-gray-900">{customer.local_currency || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Age Group</span><span className="font-medium text-gray-900">{customer.customer_age_group || "-"}</span></div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-gray-400" />{customer.email}</div>
                  <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{customer.phone}</div>
                  <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-gray-400" />{customer.geography} ({customer.country_iso2 || "-"})</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Risk and Action</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">{riskScore}</div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRiskClass(customer.risk)}`}>
                  {customer.risk}
                </span>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Credit Score</span><span className="font-medium">{customer.credit_score}</span></div>
                  <div className="flex justify-between"><span>Tenure</span><span className="font-medium">{customer.tenure} years</span></div>
                  <div className="flex justify-between"><span>Products</span><span className="font-medium">{customer.num_products}</span></div>
                  <div className="flex justify-between"><span>Active</span><span className="font-medium">{customer.is_active_member ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span>Balance</span><span className="font-medium">${customer.balance.toLocaleString()}</span></div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Recommended Action</div>
                  <div className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {customer.recommended_action}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Top Churn Drivers</h3>
                {data.drivers.length === 0 && <p className="text-sm text-gray-500">No driver details available.</p>}
                <div className="space-y-2">
                  {data.drivers.map((driver) => (
                    <div key={`${driver.name}-${driver.impact}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{driver.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Interaction History</h3>
                {data.history.length === 0 && <p className="text-sm text-gray-500">No interaction history available.</p>}
                <div className="space-y-3">
                  {data.history.map((item, index) => (
                    <div key={`${item.date}-${index}`} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{item.type}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Recorded</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              This customer profile is enriched from Churn_Modelling_customer_general_info.csv generated by generate_customer_general_info.py.
            </div>
          </div>
        )}
      </main>
    </>
  );
}
