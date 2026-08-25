import React, { useState } from 'react';
import {
  Complaint,
  User,
  Department,
  DepartmentName,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import { SlaCountdownBadge } from '../SlaCountdownBadge';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Upload,
  Camera,
  Layers,
  MapPin,
  Play,
  Check,
  Eye,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

interface DepartmentPortalProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
  onAcceptTask: (complaintId: string) => void;
  onStartWork: (complaintId: string, workNotes: string) => void;
  onResolveComplaint: (complaintId: string, description: string, evidenceImageUrl: string, actionTaken: string) => void;
}

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({
  currentUser,
  complaints,
  departments,
  language,
  onSelectComplaint,
  onAcceptTask,
  onStartWork,
  onResolveComplaint,
}) => {
  const t = translations[language];
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [workModalComplaint, setWorkModalComplaint] = useState<Complaint | null>(null);
  const [workNotes, setWorkNotes] = useState<string>('');

  const [resolveModalComplaint, setResolveModalComplaint] = useState<Complaint | null>(null);
  const [resolutionDesc, setResolutionDesc] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80');

  // Strict Department Enforcement
  const deptComplaints = complaints.filter(
    c =>
      currentUser.role === 'government_admin' ||
      c.department === currentUser.department ||
      !currentUser.department
  );

  const pendingAcceptance = deptComplaints.filter(c => ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status));
  const inProgress = deptComplaints.filter(c => ['Accepted', 'Work in Progress'].includes(c.status));
  const resolved = deptComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status));
  const slaBreached = deptComplaints.filter(c => c.slaBreached);

  const filtered = deptComplaints.filter(c => {
    if (selectedStatusTab === 'PENDING') return ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status);
    if (selectedStatusTab === 'ACTIVE') return ['Accepted', 'Work in Progress'].includes(c.status);
    if (selectedStatusTab === 'RESOLVED') return ['Resolved', 'Closed'].includes(c.status);
    if (selectedStatusTab === 'BREACHED') return c.slaBreached;
    return true;
  });

  const handleWorkSubmit = () => {
    if (!workModalComplaint) return;
    onStartWork(workModalComplaint.id, workNotes || 'Technical crew and equipment deployed on ground.');
    setWorkModalComplaint(null);
    setWorkNotes('');
  };

  const handleResolveSubmit = () => {
    if (!resolveModalComplaint) return;
    onResolveComplaint(
      resolveModalComplaint.id,
      resolutionDesc || 'Work completed in accordance with departmental standards.',
      evidenceUrl,
      actionTaken || 'Field repair and rectification completed.'
    );
    setResolveModalComplaint(null);
    setResolutionDesc('');
    setActionTaken('');
  };

  return (
    <div className="space-y-6">
      {/* Department Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-md mb-3 border border-teal-500/30">
              <Wrench size={13} className="text-teal-300" />
              <span>Line Department Execution Portal</span>
              <span>•</span>
              <span className="font-bold text-amber-200">{currentUser.department || 'Department Office'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Designation: <span className="text-teal-300 font-semibold">{currentUser.designation}</span> • District: <span className="text-slate-200">{currentUser.district}</span> • Jurisdiction: <span className="text-slate-200">Departmental Field Operations</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-right">
              <div className="text-xs text-slate-400">Department SLA Rate</div>
              <div className="text-xl font-bold text-teal-400 mt-0.5">
                {deptComplaints.length > 0
                  ? `${Math.round(((deptComplaints.length - slaBreached.length) / deptComplaints.length) * 100)}%`
                  : '100%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Work Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{deptComplaints.length}</div>
          <div className="text-[11px] text-teal-600 mt-0.5 font-medium">{currentUser.department}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Pending Acceptance</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingAcceptance.length}</div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting squad dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Field Work</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{inProgress.length}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">Crews on site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Completed & Verified</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolved.length}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Proof uploaded</div>
        </div>
      </div>

      {/* Filter Tabs & Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Departmental Work Order Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accept orders, initiate on-ground repairs, and upload resolution proof with before/after evidence.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            {[
              { key: 'ALL', label: 'All Tasks' },
              { key: 'PENDING', label: `Pending (${pendingAcceptance.length})` },
              { key: 'ACTIVE', label: `In Progress (${inProgress.length})` },
              { key: 'RESOLVED', label: `Resolved (${resolved.length})` },
              { key: 'BREACHED', label: `Breached (${slaBreached.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatusTab(tab.key)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  selectedStatusTab === tab.key
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

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
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {cmp.location.village} • {cmp.location.ward}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {cmp.status}
                  </span>
                  <SlaCountdownBadge
                    deadline={cmp.slaDeadline}
                    isResolvedOrClosed={['Resolved', 'Closed'].includes(cmp.status)}
                    slaBreached={cmp.slaBreached}
                  />
                  {cmp.isEscalated && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <ShieldAlert size={12} />
                      Escalated
                    </span>
                  )}
                </div>

                <h4
                  onClick={() => onSelectComplaint(cmp)}
                  className="font-bold text-slate-900 text-sm hover:text-teal-700 transition cursor-pointer"
                >
                  {cmp.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cmp.description}</p>

                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                  <span>Reported by: <strong className="text-slate-700">{cmp.citizenName}</strong> ({cmp.citizenPhone})</span>
                  <span>•</span>
                  <span>Assigned Officer: <strong className="text-slate-700">{cmp.assignedOfficer || 'General Squad'}</strong></span>
                  <span>•</span>
                  <span>Severity: <strong className="text-rose-700">{cmp.severity}</strong></span>
                </div>
              </div>

              {/* Department Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                {['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(cmp.status) && (
                  <button
                    onClick={() => onAcceptTask(cmp.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check size={14} />
                    <span>Accept Task</span>
                  </button>
                )}

                {cmp.status === 'Accepted' && (
                  <button
                    onClick={() => setWorkModalComplaint(cmp)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play size={14} />
                    <span>Start Field Work</span>
                  </button>
                )}

                {cmp.status === 'Work in Progress' && (
                  <button
                    onClick={() => setResolveModalComplaint(cmp)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileCheck size={14} />
                    <span>Mark Resolved (Upload Proof)</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectComplaint(cmp)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Work Modal */}
      {workModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Initiate Field Repair Crew</h3>
            <p className="text-xs text-slate-500 mt-1">Work Order: {workModalComplaint.complaintId}</p>

            <textarea
              rows={4}
              value={workNotes}
              onChange={e => setWorkNotes(e.target.value)}
              placeholder="Enter details of deployed field technicians, machinery dispatched, and estimated completion time..."
              className="w-full mt-4 p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setWorkModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWorkSubmit}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
              >
                Deploy Crew
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Resolved Modal */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <CheckCircle2 size={20} />
              <span>Mark Work Completed & Submit Proof</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Ticket: {resolveModalComplaint.complaintId}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Technical Action Taken</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={e => setActionTaken(e.target.value)}
                  placeholder="e.g. 100kVA transformer replaced; oil leakage sealed; power line energized"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolutionDesc}
                  onChange={e => setResolutionDesc(e.target.value)}
                  placeholder="Detailed engineering summary for citizen verification and district records..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Evidence Photo URL (Ground Inspection)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={e => setEvidenceUrl(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                    <img src={evidenceUrl} alt="Proof" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-md"
              >
                Submit for Citizen Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
