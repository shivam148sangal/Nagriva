import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  Eye,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileQuestion
} from 'lucide-react';
import { Complaint, User } from '../types';
import { Language, translations } from '../utils/translations';
import { VoiceInputButton } from './VoiceInputButton';

interface CitizenDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  language: Language;
  onOpenReportModal: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenVerificationModal: (complaint: Complaint) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  complaints,
  language,
  onOpenReportModal,
  onSelectComplaint,
  onOpenVerificationModal,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Citizen statistics
  const total = complaints.length;
  const pending = complaints.filter(c => ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status)).length;
  const inProgress = complaints.filter(c => c.status === 'Work in Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const reopened = complaints.filter(c => c.status === 'Reopened').length;
  const closed = complaints.filter(c => c.status === 'Closed').length;

  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.complaintId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
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
      {/* Welcome & Citizen Identity Banner */}
      <div className="bg-indigo-900 text-white rounded-xl p-6 sm:p-7 shadow-sm border border-indigo-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold">
            <MapPin size={13} className="text-indigo-300" />
            <span>{currentUser.village}, {currentUser.ward} ({currentUser.district})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {language === 'hi' ? `नमस्ते, ${currentUser.name}` : `Welcome, ${currentUser.name}`}
          </h1>
          <p className="text-indigo-200/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'अपने गांव की समस्याओं (सड़क, पानी, बिजली, स्वच्छता) को बोलकर या लिखकर दर्ज करें। AI स्वचालित रूप से संबंधित विभाग को शिकायत सौंपेगा।'
              : 'Report village infrastructure problems via voice or text. GramSewa AI automatically analyzes, prioritizes, and routes complaints to the responsible panchayat officer.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          id="citizen-main-report-btn"
          type="button"
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm active:scale-95 transition shrink-0 border border-indigo-500"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span>{t.reportProblemBtn}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              {t.pending}
            </span>
            <Clock size={15} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-indigo-900">{pending}</span>
            <span className="text-xs font-medium text-indigo-600">Under Review</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              {t.inProgress}
            </span>
            <Sparkles size={15} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-blue-900">{inProgress}</span>
            <span className="text-xs font-medium text-blue-600">Assigned</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              {t.resolved}
            </span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-emerald-600">{resolved}</span>
            <span className="text-xs font-medium text-emerald-600">Fixed</span>
          </div>
        </div>

        {/* Reopened */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              {t.reopened}
            </span>
            <RotateCcw size={15} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-amber-600">{reopened}</span>
            <span className="text-xs font-medium text-amber-600">Action</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar with Global Voice-to-Text */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input with Voice */}
          <div className="relative flex-1 flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="citizen-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            <div className="absolute right-1.5 flex items-center">
              <VoiceInputButton
                language={language}
                currentValue={searchQuery}
                onTranscript={txt => setSearchQuery(txt)}
                fieldLabel="Search Complaints"
                size="sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            id="citizen-category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
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

          {/* Status Filter */}
          <select
            id="citizen-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.filterStatus}</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Analyzed">AI Analyzed</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>
      </div>

      {/* Recent Complaints List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-700">
              {language === 'hi' ? 'हालिया दर्ज शिकायतें' : 'Recent Reports'}
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Live Update
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {filteredComplaints.length} of {complaints.length} grievances
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileQuestion size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-medium">No complaints match your search criteria.</p>
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
              >
                {t.reportProblemBtn}
              </button>
            </div>
          ) : (
            filteredComplaints.map(cmp => {
              const isBreached = cmp.slaBreached || (new Date(cmp.slaDeadline).getTime() < Date.now() && !['Resolved', 'Closed'].includes(cmp.status));
              const isAwaitingCitizenVerification = cmp.status === 'Resolved';

              return (
                <div
                  key={cmp.id}
                  className={`p-4 transition hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                    isAwaitingCitizenVerification ? 'bg-emerald-50/30 border-l-4 border-l-emerald-600' : ''
                  }`}
                  onClick={() => onSelectComplaint(cmp)}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-indigo-900 text-xs">
                        {cmp.complaintId}
                      </span>
                      <span className="text-xs text-indigo-600 font-medium">
                        {cmp.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cmp.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        cmp.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        cmp.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {cmp.priority} ({cmp.priorityScore}/100)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cmp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        cmp.status === 'Closed' ? 'bg-slate-100 text-slate-700' :
                        cmp.status === 'Work in Progress' ? 'bg-blue-100 text-blue-800' :
                        cmp.status === 'Reopened' ? 'bg-amber-100 text-amber-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {cmp.status.toUpperCase()}
                      </span>
                      {isBreached && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 truncate">
                      {cmp.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {cmp.location.village} ({cmp.location.ward})
                      </span>
                      <span>•</span>
                      <span>Target SLA: {cmp.slaHours} Hours</span>
                      <span>•</span>
                      <span>{cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>

                    {isAwaitingCitizenVerification && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                        <ShieldCheck size={14} className="text-emerald-700" />
                        <span>Authority marked resolved — Click to verify resolution on site!</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isAwaitingCitizenVerification ? (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onOpenVerificationModal(cmp);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95 flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} />
                        <span>Verify & Close</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectComplaint(cmp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-900 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
