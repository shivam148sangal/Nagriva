import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Clock,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Complaint, AnalyticsOverview } from '../types';
import { Language, translations } from '../utils/translations';

interface AnalyticsViewProps {
  complaints: Complaint[];
  overview: AnalyticsOverview;
  language: Language;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  complaints,
  overview,
  language,
}) => {
  const t = translations[language];

  // Category Distribution Data
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Village Wise Grievance Data
  const villageCounts: Record<string, { reported: number; resolved: number }> = {};
  complaints.forEach(c => {
    const v = c.location.village.replace(' Gram Panchayat', '');
    if (!villageCounts[v]) villageCounts[v] = { reported: 0, resolved: 0 };
    villageCounts[v].reported += 1;
    if (['Resolved', 'Closed'].includes(c.status)) villageCounts[v].resolved += 1;
  });

  const villageData = Object.entries(villageCounts).map(([village, val]) => ({
    village,
    reported: val.reported,
    resolved: val.resolved,
  }));

  // Weekly Trend Data
  const trendData = [
    { day: 'Mon', reported: 8, resolved: 6, slaBreaches: 1 },
    { day: 'Tue', reported: 14, resolved: 11, slaBreaches: 0 },
    { day: 'Wed', reported: 12, resolved: 13, slaBreaches: 1 },
    { day: 'Thu', reported: 19, resolved: 17, slaBreaches: 1 },
    { day: 'Fri', reported: 22, resolved: 20, slaBreaches: 2 },
    { day: 'Sat', reported: 15, resolved: 18, slaBreaches: 0 },
    { day: 'Sun', reported: 10, resolved: 12, slaBreaches: 0 },
  ];

  // Priority Distribution
  const priorityCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  complaints.forEach(c => {
    priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
  });

  const priorityData = Object.entries(priorityCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const resolutionRate = overview.totalComplaints > 0
    ? Math.round(((overview.resolvedComplaints + overview.closedComplaints) / overview.totalComplaints) * 100)
    : 85;

  const reopeningRate = overview.totalComplaints > 0
    ? Math.round((overview.reopenedComplaints / overview.totalComplaints) * 100)
    : 4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-900 text-white rounded-xl p-6 sm:p-7 shadow-sm border border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold mb-2">
            <BarChart3 size={13} className="text-indigo-300" />
            <span>Panchayati Raj Governance Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Grievance Resolution & Departmental SLA Metrics
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
            Real-time performance tracking across Gram Panchayats, measuring time-to-resolution, SLA compliance, citizen satisfaction, and reopening rates.
          </p>
        </div>
      </div>

      {/* Top Level KPI Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Resolution Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Resolution Rate
            </span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-emerald-600">{resolutionRate}%</span>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Grievances Handled</span>
        </div>

        {/* Average Resolution Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {t.avgResolutionTime}
            </span>
            <Clock size={15} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-indigo-900">2.1</span>
            <span className="text-xs font-medium text-slate-500">Days</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">↓ 18% faster than SLA</span>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {t.slaCompliance}
            </span>
            <ShieldCheck size={15} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-blue-900">{overview.slaComplianceRate}%</span>
            <span className="text-xs font-medium text-blue-600">On Time</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">{overview.slaBreachedCount} Overdue cases</span>
        </div>

        {/* Citizen Satisfaction */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {t.satisfactionScore}
            </span>
            <Star size={15} className="text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-amber-600">4.6</span>
            <span className="text-xs font-medium text-slate-500">/ 5.0</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Citizen Feedback Rating</span>
        </div>

        {/* Reopening Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Reopen Rate
            </span>
            <RotateCcw size={15} className="text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-rose-600">{reopeningRate}%</span>
            <span className="text-xs font-medium text-rose-600">Audit</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Citizen Rejected Repairs</span>
        </div>
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend: Reported vs Resolved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Weekly Grievance Inflow vs Resolution Pace
              </h3>
              <p className="text-xs text-slate-500">
                Tracking daily volume and SLA adherence
              </p>
            </div>
            <TrendingUp size={18} className="text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="reported" name="Grievances Filed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="resolved" name="Repairs Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Grievances Distribution by Category
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown across rural infrastructure sectors
              </p>
            </div>
            <BarChart3 size={18} className="text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip />
                <Bar dataKey="value" name="Complaint Count" fill="#4338ca" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row: Village Load & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Village Load */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Gram Panchayat Workload & Resolution Status
            </h3>
            <p className="text-xs text-slate-500">
              Comparative progress across Panchayats
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="village" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="reported" name="Total Reported" fill="#4338ca" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Severity & Priority Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Classification distribution managed by GramSewa AI
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block">Critical</span>
              <p className="text-2xl font-bold text-rose-900 mt-1">{priorityCounts.Critical || 0}</p>
              <span className="text-[10px] text-rose-600 font-semibold">12-24h SLA</span>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-widest block">High</span>
              <p className="text-2xl font-bold text-orange-900 mt-1">{priorityCounts.High || 0}</p>
              <span className="text-[10px] text-orange-600 font-semibold">48h SLA</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">Medium</span>
              <p className="text-2xl font-bold text-amber-900 mt-1">{priorityCounts.Medium || 0}</p>
              <span className="text-[10px] text-amber-600 font-semibold">72h SLA</span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Low</span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{priorityCounts.Low || 0}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">96h SLA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
