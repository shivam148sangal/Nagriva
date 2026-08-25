import React, { useState } from 'react';
import {
  Complaint,
  User,
  NotificationItem,
  ComplaintStatus,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import { SlaCountdownBadge } from '../SlaCountdownBadge';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Mic,
  ChevronRight,
  Filter,
  Search,
  FileCheck,
  ShieldAlert,
  ThumbsUp,
  MessageSquare,
  Volume2,
} from 'lucide-react';

interface CitizenPortalProps {
  currentUser: User;
  complaints: Complaint[];
  language: Language;
  onOpenReportModal: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenVerificationModal: (complaint: Complaint) => void;
  onReopenComplaint?: (complaint: Complaint) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  complaints,
  language,
  onOpenReportModal,
  onSelectComplaint,
  onOpenVerificationModal,
  onReopenComplaint,
}) => {
  const t = translations[language];
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Strict Citizen Filter: Only citizen's own complaints
  const myComplaints = complaints.filter(
    c => c.citizenId === currentUser.id || c.citizenPhone === currentUser.phone
  );

  const filtered = myComplaints.filter(c => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status)) ||
      (statusFilter === 'IN_PROGRESS' && ['Accepted', 'Work in Progress'].includes(c.status)) ||
      (statusFilter === 'RESOLVED' && c.status === 'Resolved') ||
      (statusFilter === 'CLOSED' && c.status === 'Closed') ||
      (statusFilter === 'REOPENED' && c.status === 'Reopened');

    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.village.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  const pendingVerification = myComplaints.filter(c => c.status === 'Resolved');
  const inProgressCount = myComplaints.filter(c => ['Accepted', 'Work in Progress'].includes(c.status)).length;
  const closedCount = myComplaints.filter(c => c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Citizen Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-indigo-400/30">
              <Sparkles size={13} className="text-amber-300" />
              <span>Citizen Grievance Portal</span>
              <span>•</span>
              <span>{currentUser.village}, {currentUser.ward}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'hi' ? `नमस्ते, ${currentUser.name}` : `Welcome, ${currentUser.name}`}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {language === 'hi'
                ? 'अपने गांव या वार्ड की किसी भी समस्या को अपनी आवाज में रिकॉर्ड करके दर्ज करें। AI द्वारा तुरंत विभाग आवंटन एवं समाधान।'
                : 'Report public infrastructure issues via Voice or Text. Real-time AI classification, department assignment, and citizen verification.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              id="citizen-record-complaint-btn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition transform active:scale-95 cursor-pointer"
            >
              <Mic size={18} className="animate-pulse text-amber-200" />
              <span>{language === 'hi' ? 'समस्या दर्ज करें (बोलकर / लिखकर)' : 'Report Problem (Voice / Text)'}</span>
            </button>
          </div>
        </div>

        {/* Verification Alert if any ticket is resolved awaiting citizen confirmation */}
        {pendingVerification.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-400 text-slate-900 font-bold shrink-0">
                <FileCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  {language === 'hi' ? 'सत्यापन आवश्यक: कार्य पूरा हो चुका है' : 'Action Required: Verification Pending'}
                </h4>
                <p className="text-xs text-slate-200 mt-0.5">
                  {language === 'hi'
                    ? `आपके ${pendingVerification.length} मामले विभाग द्वारा पूरे कर दिए गए हैं। कृपया मौके पर जांचकर पुष्टि करें।`
                    : `${pendingVerification.length} grievance(s) marked resolved by authorities. Please confirm resolution on ground.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenVerificationModal(pendingVerification[0])}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer shadow-md"
            >
              {language === 'hi' ? 'अभी सत्यापित करें' : 'Verify Resolution'}
            </button>
          </div>
        )}
      </div>

      {/* Citizen Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{language === 'hi' ? 'कुल दर्ज शिकायतें' : 'Total Registered'}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{myComplaints.length}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">{currentUser.village}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{language === 'hi' ? 'प्रगति पर' : 'In Progress'}</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'hi' ? 'कार्य जारी' : 'Field work active'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{language === 'hi' ? 'सत्यापन हेतु लंबित' : 'Awaiting Verification'}</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{pendingVerification.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'hi' ? 'नागरिक फीडबैक' : 'Awaiting you'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">{language === 'hi' ? 'सफलतापूर्वक बंद' : 'Resolved & Closed'}</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{closedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">{language === 'hi' ? 'पूर्ण समाधान' : '100% Verified'}</div>
        </div>
      </div>

      {/* Complaints List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 text-base">
              {language === 'hi' ? 'मेरी शिकायतें व निवारण स्थिति' : 'My Registered Grievances'}
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {filtered.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'शिकायत खोजें...' : 'Search grievances...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              {[
                { key: 'ALL', label: language === 'hi' ? 'सभी' : 'All' },
                { key: 'PENDING', label: language === 'hi' ? 'लंबित' : 'Pending' },
                { key: 'IN_PROGRESS', label: language === 'hi' ? 'प्रगति' : 'Active' },
                { key: 'RESOLVED', label: language === 'hi' ? 'समाधान' : 'Resolved' },
                { key: 'CLOSED', label: language === 'hi' ? 'बंद' : 'Closed' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Cards / Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-slate-800 font-semibold text-sm">
              {language === 'hi' ? 'कोई शिकायत नहीं मिली' : 'No grievances found'}
            </h4>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {language === 'hi'
                ? 'आपने इस श्रेणी में अभी कोई समस्या दर्ज नहीं की है।'
                : 'You have no complaints under the selected criteria.'}
            </p>
            <button
              onClick={onOpenReportModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>{language === 'hi' ? 'नई समस्या दर्ज करें' : 'Report New Grievance'}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(cmp => (
              <div
                key={cmp.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {cmp.complaintId}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cmp.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        cmp.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cmp.status === 'Resolved'
                          ? 'bg-indigo-100 text-indigo-800'
                          : cmp.status === 'Work in Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : cmp.status === 'Reopened'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {cmp.status}
                    </span>
                    <SlaCountdownBadge
                      deadline={cmp.slaDeadline}
                      isResolvedOrClosed={['Resolved', 'Closed'].includes(cmp.status)}
                      slaBreached={cmp.slaBreached}
                    />
                  </div>

                  <h4
                    onClick={() => onSelectComplaint(cmp)}
                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition cursor-pointer"
                  >
                    {cmp.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cmp.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {cmp.location.village}, {cmp.location.ward}
                    </span>
                    <span>•</span>
                    <span>Assigned: <strong className="text-slate-700">{cmp.department}</strong></span>
                    <span>•</span>
                    <span>Reported: {cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  {cmp.status === 'Resolved' && (
                    <button
                      onClick={() => onOpenVerificationModal(cmp)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck size={14} />
                      <span>{language === 'hi' ? 'सत्यापित करें' : 'Verify Resolution'}</span>
                    </button>
                  )}

                  {cmp.status === 'Closed' && (
                    <button
                      onClick={() => onOpenVerificationModal(cmp)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <ThumbsUp size={13} />
                      <span>{language === 'hi' ? 'प्रतिक्रिया देखें' : 'Feedback'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectComplaint(cmp)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'विवरण' : 'Details'}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
