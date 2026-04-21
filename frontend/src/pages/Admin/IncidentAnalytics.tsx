import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { incidentService } from "../../services/api/incidents";
import { IncidentAnalyticsResponse } from "../../types/incident";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

export default function IncidentAnalytics() {
  const [analytics, setAnalytics] = useState<IncidentAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const stats = await incidentService.getAnalytics();
      setAnalytics(stats);
    } catch {
      setError("Failed to load analytics. Please check your privileges or backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
             <Activity className="text-blue-500" /> Incident Analytics
          </h1>
          <p className="text-slate-600 mt-1">High-level insights and metrics for all support tickets.</p>
        </div>
      </div>

      {loading && <div className="p-12 text-center text-slate-500 font-medium">Crunching data...</div>}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm shadow-sm">{error}</div>}

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tickets</p>
              <h3 className="text-3xl font-bold text-slate-800">{analytics.totalIncidents}</h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Open / Action Req.</p>
              <h3 className="text-3xl font-bold text-yellow-600">{analytics.openIncidents}</h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Resolved</p>
              <h3 className="text-3xl font-bold text-green-600">{analytics.resolvedIncidents}</h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Resolution</p>
              <h3 className="text-3xl font-bold text-blue-600">{analytics.averageResolutionTimeHours} <span className="text-base font-medium">hrs</span></h3>
           </div>
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Status Distribution Pie Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Status Overview</h3>
             <div className="h-64 min-h-[16rem]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={Object.entries(analytics.statusDistribution).map(([name, value]) => ({ name, value }))}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {Object.entries(analytics.statusDistribution).map((entry, index) => {
                       const colors: Record<string, string> = {
                         OPEN: "#eab308",
                         IN_PROGRESS: "#3b82f6",
                         RESOLVED: "#22c55e",
                         CLOSED: "#64748b",
                         REJECTED: "#ef4444"
                       };
                       return <Cell key={`cell-${index}`} fill={colors[entry[0]] || "#cbd5e1"} />;
                     })}
                   </Pie>
                   <RechartsTooltip />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Category Distribution Bar Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Category Distribution</h3>
             <div className="h-64 min-h-[16rem]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={Object.entries(analytics.categoryDistribution).map(([name, value]) => ({ name, value }))}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                   <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                   <RechartsTooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      )}
    </section>
  );
}
