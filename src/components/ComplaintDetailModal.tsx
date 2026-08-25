import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Building,
  UserCheck,
  ShieldAlert,
  Wrench,
  Layers,
  Image as ImageIcon,
  Share2,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { Complaint, User, Department } from '../types';
import { Language, translations } from '../utils/translations';
import { TimelineTracker } from './TimelineTracker';
import { LeafletMap } from './LeafletMap';

interface ComplaintDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  currentUser: User;
  language: Language;
  departments: Department[];
  onOpenVerificationModal: (complaint: Complaint) => void;
  onOpenResolveModal: (complaint: Complaint) => void;
  onUpdateStatus: (complaintId: string, status: string, department?: string) => Promise<void>;
  onEscalate: (complaintId: string, reason: string) => Promise<void>;
  onMergeDuplicates: (complaintId: string, similarIds: string[]) => Promise<void>;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  isOpen,
  onClose,
  complaint,
  currentUser,
  language,
  departments,
  onOpenVerificationModal,
  onOpenResolveModal,
  onUpdateStatus,
  onEscalate,
  onMergeDuplicates,
}) => {
  if (!isOpen || !complaint) return null;
  const t = translations[language];

  const [selectedDept, setSelectedDept] = useState(complaint.department);
  const [selectedStatus, setSelectedStatus] = useState(complaint.status);
  const [isUpdating, setIsUpdating] = useState(false);

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
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Work in Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Reopened':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  };

  const isSlaBreached = complaint.slaBreached || (new Date(complaint.slaDeadline).getTime() < Date.now() && !['Resolved', 'Closed'].includes(complaint.status));

  const handleDepartmentChange = async (newDept: string) => {
    setSelectedDept(newDept);
    setIsUpdating(true);
    try {
      await onUpdateStatus(complaint.id, complaint.status, newDept);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    try {
      await onUpdateStatus(complaint.id, newStatus, complaint.department);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEscalateClick = async () => {
    const reason = prompt('Enter escalation remarks for District Administration:');
    if (reason) {
      await onEscalate(complaint.id, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-md border border-slate-700">
                {complaint.complaintId}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(complaint.priority)}`}>
                {complaint.priority} Priority ({complaint.priorityScore}/100)
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(complaint.status)}`}>
                {complaint.status}
              </span>
              {isSlaBreached && (
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                  ⚠ SLA BREACHED
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {complaint.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-emerald-400" />
                {complaint.location.village} ({complaint.location.ward})
              </span>
              <span>•</span>
              <span>Reported: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Recent'}</span>
            </div>
          </div>

          <button
            id="close-complaint-detail-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Top Quick Banner / Verification Notice */}
          {complaint.status === 'Resolved' && currentUser.role === 'citizen' && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Authority has resolved this problem. On-ground verification required!</span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Please verify if the repair work is genuinely completed on site before closing.
                </p>
              </div>
              <button
                id="verify-complaint-now-btn"
                type="button"
                onClick={() => onOpenVerificationModal(complaint)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition"
              >
                Verify Resolution Now
              </button>
            </div>
          )}

          {/* SLA Tracking Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSlaBreached ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <Clock size={20} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  SLA Target & Deadline
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {complaint.slaHours} Hours Standard SLA | Due: {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Standard'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSlaBreached ? (
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-full border border-rose-300">
                  Overdue / Escalated
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                  On Track
                </span>
              )}
            </div>
          </div>

          {/* Description & Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Description */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Grievance Description
                </h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed font-medium">
                  {complaint.description}
                </div>
              </div>

              {complaint.additionalDetails && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Additional Details / Landmarks
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    {complaint.additionalDetails}
                  </div>
                </div>
              )}

              {/* Citizen & Location Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Complainant</span>
                  <span className="font-semibold text-slate-800">{complaint.citizenName}</span>
                  <span className="text-slate-500 block text-[11px]">{complaint.citizenPhone}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                  <span className="font-semibold text-slate-800">{complaint.department}</span>
                  <span className="text-slate-500 block text-[11px]">{complaint.assignedOfficer || 'Field Officer'}</span>
                </div>
              </div>

              {/* Duplicate Information */}
              {complaint.aiAnalysis?.duplicateInfo?.isDuplicate && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Layers size={15} className="text-amber-700" />
                      Geospatial Duplicate Cluster ({complaint.aiAnalysis.duplicateInfo.duplicateCount} reports)
                    </span>
                    {currentUser.role === 'authority' && (
                      <button
                        type="button"
                        onClick={() => onMergeDuplicates(complaint.id, complaint.aiAnalysis.duplicateInfo.similarComplaintIds)}
                        className="text-[11px] font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded"
                      >
                        Merge Cluster
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-amber-800">
                    {complaint.aiAnalysis.duplicateInfo.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Images & Location Map */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Reported Photo / Evidence
                </h4>
                <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
                    alt="Complaint Evidence"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* GIS Map Location */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-600" />
                  GIS Pinpoint ({complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)})
                </h4>
                <LeafletMap
                  complaints={[complaint]}
                  language={language}
                  height="160px"
                />
              </div>
            </div>
          </div>

          {/* AI Analysis Summary Box */}
          {complaint.aiAnalysis && (
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  AI Classification & Governance Recommendation
                </span>
                <span className="text-slate-400">Confidence: {Math.round(complaint.aiAnalysis.categoryConfidence * 100)}%</span>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{complaint.aiAnalysis.aiRecommendation}"
              </p>
            </div>
          )}

          {/* Timeline Audit Tracker */}
          <div className="pt-2 border-t border-slate-200">
            <TimelineTracker
              currentStatus={complaint.status}
              timeline={complaint.timeline}
              language={language}
              isEscalated={complaint.isEscalated}
            />
          </div>

          {/* Authority Controls Box */}
          {currentUser.role === 'authority' && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                Authority Management Actions
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Change Department Routing
                  </label>
                  <select
                    value={selectedDept}
                    onChange={e => handleDepartmentChange(e.target.value)}
                    disabled={isUpdating}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Update Workflow Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="AI Analyzed">AI Analyzed</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenResolveModal(complaint)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Wrench size={14} />
                  <span>Submit Work Completion & Proof</span>
                </button>

                <button
                  type="button"
                  onClick={handleEscalateClick}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  <span>Escalate Grievance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
