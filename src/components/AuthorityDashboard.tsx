import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Wrench,
  Building,
  Layers,
  MapPin,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  ChevronDown
} from 'lucide-react';
import { Complaint, Department, User } from '../types';
import { Language, translations } from '../utils/translations';
import { VoiceInputButton } from './VoiceInputButton';

interface AuthorityDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenResolveModal: (complaint: Complaint) => void;
  onUpdateStatus: (complaintId: string, status: string, department?: string) => Promise<void>;
  onEscalate: (complaintId: string, reason: string) => Promise<void>;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  currentUser,
  complaints,
  departments,
  language,
  onSelectComplaint,
  onOpenResolveModal,
  onUpdateStatus,
  onEscalate,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // Authority Statistics
  const total = complaints.length;
  const pending = complaints.filter(c => ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status)).length;
  const inProgress = complaints.filter(c => c.status === 'Work in Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const slaBreached = complaints.filter(c => c.slaBreached || (new Date(c.slaDeadline).getTime() < Date.now() && !['Resolved', 'Closed'].includes(c.status))).length;
  const reopened = complaints.filter(c => c.status === 'Reopened').length;

  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedVillage !== 'all' && !c.location.village.toLowerCase().includes(selectedVillage.toLowerCase())) return false;
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedDept !== 'all' && c.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.complaintId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.village.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Work in Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Reopened':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-indigo-900 text-white rounded-xl p-6 sm:p-7 shadow-sm border border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold mb-2">
            <Building size={13} className="text-indigo-300" />
            <span>Panchayat Operations & Grievance Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Gram Panchayat Administration & SLA Triage Desk
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time citizen complaints across Gram Panchayats, enforce departmental SLAs, audit duplicate clusters, and submit verified work proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-indigo-300 block font-semibold uppercase tracking-widest">Logged in Officer</span>
            <span className="text-sm font-bold text-white">{currentUser.name}</span>
            <span className="text-xs text-indigo-200 block">{currentUser.designation || 'Panchayat Officer'}</span>
          </div>
        </div>
      </div>

      {/* Metric Stats Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            {t.totalComplaints}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">{total}</span>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            {t.pending}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-indigo-900">{pending}</span>
            <span className="text-xs font-medium text-indigo-600">Pending</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            {t.inProgress}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-blue-900">{inProgress}</span>
            <span className="text-xs font-medium text-blue-600">Active</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            {t.resolved}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-emerald-600">{resolved}</span>
            <span className="text-xs font-medium text-emerald-600">Closed</span>
          </div>
        </div>

        {/* SLA Breached */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">
              {t.slaBreached}
            </span>
            <AlertTriangle size={15} className="text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-rose-600">{slaBreached}</span>
            <span className="text-xs font-medium text-rose-700">Breach</span>
          </div>
        </div>

        {/* Reopened */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
              {t.reopened}
            </span>
            <RotateCcw size={15} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-amber-600">{reopened}</span>
            <span className="text-xs font-medium text-amber-700">Audit</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar with Voice Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="authority-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, citizen name, village, keyword..."
              className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            <div className="absolute right-1.5 flex items-center">
              <VoiceInputButton
                language={language}
                currentValue={searchQuery}
                onTranscript={txt => setSearchQuery(txt)}
                fieldLabel="Authority Search"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 border-t border-slate-100">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.filterCategory}</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Roads">Roads</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Drainage">Drainage</option>
            <option value="Street Lights">Street Lights</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
          </select>

          {/* Village */}
          <select
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.filterVillage}</option>
            <option value="Rampur">Rampur Gram Panchayat</option>
            <option value="Sundarpur">Sundarpur Gram Panchayat</option>
            <option value="Belur">Belur Gram Panchayat</option>
            <option value="Kalyanpur">Kalyanpur Gram Panchayat</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.filterPriority}</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.filterStatus}</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Analyzed">AI Analyzed</option>
            <option value="Assigned">Assigned</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 col-span-2 sm:col-span-1 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaint Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-700">
              Grievance Operations & SLA Enforcement Queue
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Live Queue
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {filteredComplaints.length} registered issues
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-3 px-4">Grievance ID</th>
                <th className="py-3 px-4">Location / Ward</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">SLA Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No complaints match current filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(cmp => {
                  const isBreached = cmp.slaBreached || (new Date(cmp.slaDeadline).getTime() < Date.now() && !['Resolved', 'Closed'].includes(cmp.status));

                  return (
                    <tr
                      key={cmp.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => onSelectComplaint(cmp)}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-bold text-indigo-900">
                        {cmp.complaintId}
                        {cmp.aiAnalysis?.duplicateInfo?.isDuplicate && (
                          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-500" title="Duplicate Cluster Found" />
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{cmp.location.village.replace(' Gram Panchayat', '')}</div>
                        <div className="text-[11px] text-slate-500">{cmp.location.ward}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {cmp.category}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          cmp.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          cmp.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          cmp.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {cmp.priority} ({cmp.priorityScore})
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-700 font-medium" title={cmp.department}>
                        {cmp.department}
                      </td>

                      {/* SLA Status */}
                      <td className="py-3.5 px-4">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            <AlertTriangle size={11} />
                            <span>BREACHED</span>
                          </span>
                        ) : ['Resolved', 'Closed'].includes(cmp.status) ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Met Target
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            <span>{cmp.slaHours}h Target</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          cmp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          cmp.status === 'Closed' ? 'bg-slate-100 text-slate-700' :
                          cmp.status === 'Work in Progress' ? 'bg-blue-100 text-blue-800' :
                          cmp.status === 'Reopened' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {cmp.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          {cmp.status !== 'Resolved' && cmp.status !== 'Closed' && (
                            <button
                              type="button"
                              onClick={() => onOpenResolveModal(cmp)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-semibold shadow-xs transition active:scale-95 flex items-center gap-1"
                            >
                              <Wrench size={12} />
                              <span>Resolve</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectComplaint(cmp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-900 hover:bg-slate-100 rounded-md transition"
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
