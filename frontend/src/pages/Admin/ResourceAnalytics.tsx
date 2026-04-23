import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { analyticsService } from "../../services/api/analyticsService";
import type { ResourceAnalytics as ResourceAnalyticsData } from "../../services/api/analyticsService";
import {
  Building2, CheckCircle, Wrench, XCircle,
  PowerOff, ShieldCheck, ShieldOff, RefreshCw, Search, ArrowUpDown,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:          "#16a34a",
  OUT_OF_SERVICE:  "#dc2626",
  MAINTENANCE:     "#d97706",
  INACTIVE:        "#94a3b8",
};

const PIE_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

function StatCard({
  label, value, icon, color,
}: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
    >
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function ResourceAnalytics() {
  const [data, setData] = useState<ResourceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [typeChartMode, setTypeChartMode] = useState<"bar" | "pie">("bar");
  const [maintenanceSearch, setMaintenanceSearch] = useState("");
  const [maintenanceOnlyUrgent, setMaintenanceOnlyUrgent] = useState(false);
  const [buildingSort, setBuildingSort] = useState<"count" | "name">("count");

  const fetchData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const result = await analyticsService.getResourceAnalytics();
      setData(result);
      setLastRefreshed(new Date());
    } catch {
      setError("Failed to load analytics. Make sure you are logged in as admin.");
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => { fetchData(true); }, []);

  if (loading) return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <p className="text-slate-500 text-sm">Loading analytics...</p>
    </motion.section>
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

  const normalizedSearch = maintenanceSearch.trim().toLowerCase();
  const filteredMaintenance = data.currentlyUnderMaintenance.filter((item) => {
    const searchable = `${item.resourceName} ${item.building || ""} ${item.location || ""} ${item.maintenanceStatus}`
      .toLowerCase();
    const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
    const isUrgent = ["IN_PROGRESS", "OVERDUE", "CRITICAL"].includes(item.maintenanceStatus?.toUpperCase?.() || "");
    return matchesSearch && (!maintenanceOnlyUrgent || isUrgent);
  });

  const sortedBuildingData = [...data.resourcesByBuilding].sort((a, b) => {
    if (buildingSort === "name") {
      return (a.building || "").localeCompare(b.building || "");
    }
    return b.count - a.count;
  });

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 py-8"
    >

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Resource Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTypeChartMode((m) => (m === "bar" ? "pie" : "bar"))}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition"
          >
            <ArrowUpDown className="w-4 h-4" />
            Type chart: {typeChartMode === "bar" ? "Bar" : "Pie"}
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchData(false)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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
      </motion.div>

      {/* Charts Row 1 — Status Pie + Resources by Type Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

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
            typeChartMode === "bar" ? (
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
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.resourcesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    dataKey="count"
                    nameKey="typeName"
                  >
                    {data.resourcesByType.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </motion.div>

      {/* Charts Row 2 — Buildings Bar + Approval Pie */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Resources by Building */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Resources by Building</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBuildingSort("count")}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  buildingSort === "count"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sort by count
              </button>
              <button
                onClick={() => setBuildingSort("name")}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  buildingSort === "name"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sort by name
              </button>
            </div>
          </div>
          {data.resourcesByBuilding.length === 0 ? (
            <p className="text-slate-400 text-sm">No building data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={sortedBuildingData}
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
      </motion.div>

      {/* Active Maintenance Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Currently Under Maintenance
            {filteredMaintenance.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {filteredMaintenance.length}
              </span>
            )}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={maintenanceSearch}
              onChange={(e) => setMaintenanceSearch(e.target.value)}
              placeholder="Search resource, building..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={maintenanceOnlyUrgent}
              onChange={(e) => setMaintenanceOnlyUrgent(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-300"
            />
            Urgent only
          </label>
        </div>
        {filteredMaintenance.length === 0 ? (
          <p className="text-slate-400 text-sm">No resources are currently under maintenance.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
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
              {filteredMaintenance.map((item, i) => (
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
          </div>
        )}
      </motion.div>

      {/* Inactive Resources Warning */}
      {data.inactiveResources > 0 && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 flex items-center gap-3"
        >
          <PowerOff className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{data.inactiveResources}</span> resource
            {data.inactiveResources > 1 ? "s are" : " is"} currently inactive and not visible to users.
            <Link to="/resources" className="ml-1 text-indigo-600 hover:underline">
              Manage resources →
            </Link>
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}