import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { analyticsService } from "../../services/api/analyticsService";
import type { ResourceAnalytics as ResourceAnalyticsData } from "../../services/api/analyticsService";
import {
  Building2, CheckCircle, Wrench, XCircle,
  PowerOff, ShieldCheck, ShieldOff, RefreshCw,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:          "#16a34a",
  OUT_OF_SERVICE:  "#dc2626",
  MAINTENANCE:     "#d97706",
  INACTIVE:        "#94a3b8",
};

const PIE_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

function StatCard({
  label, value, icon, color,
}: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function ResourceAnalytics() {
  const [data, setData] = useState<ResourceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyticsService.getResourceAnalytics();
      setData(result);
      setLastRefreshed(new Date());
    } catch {
      setError("Failed to load analytics. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-slate-500 text-sm">Loading analytics...</p>
    </section>
  );

  if (error) return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-red-500 text-sm">{error}</p>
    </section>
  );

  if (!data) return null;

  // Pie chart data for status breakdown
  const statusPieData = [
    { name: "Active",          value: data.activeResources,         color: STATUS_COLORS.ACTIVE },
    { name: "Out of Service",  value: data.outOfServiceResources,   color: STATUS_COLORS.OUT_OF_SERVICE },
    { name: "Maintenance",     value: data.maintenanceResources,    color: STATUS_COLORS.MAINTENANCE },
    { name: "Inactive",        value: data.inactiveResources,       color: STATUS_COLORS.INACTIVE },
  ].filter(d => d.value > 0);

  // Pie chart data for approval breakdown
  const approvalPieData = [
    { name: "Requires Approval",    value: data.requiresApprovalCount,    color: "#6366f1" },
    { name: "No Approval Needed",   value: data.noApprovalRequiredCount,  color: "#0ea5e9" },
  ].filter(d => d.value > 0);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Resource Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Resources"
          value={data.totalResources}
          icon={<Building2 className="w-5 h-5 text-slate-600" />}
          color="bg-slate-100"
        />
        <StatCard
          label="Active"
          value={data.activeResources}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Under Maintenance"
          value={data.maintenanceResources}
          icon={<Wrench className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          label="Out of Service"
          value={data.outOfServiceResources}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
      </div>

      {/* Charts Row 1 — Status Pie + Resources by Type Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Status Breakdown Pie */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resources by Type Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Resources by Type</h2>
          {data.resourcesByType.length === 0 ? (
            <p className="text-slate-400 text-sm">No resource type data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.resourcesByType} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="typeName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" name="Resources" radius={[4, 4, 0, 0]}>
                  {data.resourcesByType.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 — Buildings Bar + Approval Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Resources by Building */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Resources by Building</h2>
          {data.resourcesByBuilding.length === 0 ? (
            <p className="text-slate-400 text-sm">No building data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.resourcesByBuilding}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="building"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" name="Resources" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Approval Requirement Pie */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Booking Approval Requirement</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={approvalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {approvalPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-lg font-bold text-slate-800">{data.requiresApprovalCount}</p>
                  <p className="text-xs text-slate-500">Requires Approval</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldOff className="w-4 h-4 text-sky-500" />
                <div>
                  <p className="text-lg font-bold text-slate-800">{data.noApprovalRequiredCount}</p>
                  <p className="text-xs text-slate-500">No Approval Needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Maintenance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Currently Under Maintenance
            {data.currentlyUnderMaintenance.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {data.currentlyUnderMaintenance.length}
              </span>
            )}
          </h2>
        </div>
        {data.currentlyUnderMaintenance.length === 0 ? (
          <p className="text-slate-400 text-sm">No resources are currently under maintenance.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-2 font-medium">Resource</th>
                <th className="pb-2 font-medium">Building</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Start Date</th>
                <th className="pb-2 font-medium">End Date</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data.currentlyUnderMaintenance.map((item, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-2 font-medium text-slate-800">{item.resourceName}</td>
                  <td className="py-2 text-slate-600">{item.building || "—"}</td>
                  <td className="py-2 text-slate-600">{item.location || "—"}</td>
                  <td className="py-2 text-slate-600">{item.startDate}</td>
                  <td className="py-2 text-slate-600">{item.endDate}</td>
                  <td className="py-2">
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                      {item.maintenanceStatus}
                    </span>
                  </td>
                  <td className="py-2">
                    <Link
                      to={`/resources/${item.resourceId}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inactive Resources Warning */}
      {data.inactiveResources > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <PowerOff className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{data.inactiveResources}</span> resource
            {data.inactiveResources > 1 ? "s are" : " is"} currently inactive and not visible to users.
            <Link to="/resources" className="ml-1 text-indigo-600 hover:underline">
              Manage resources →
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}