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
  Landmark,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Eye,
  Filter,
  Search,
  UserCheck,
} from 'lucide-react';

interface PanchayatPortalProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
  onForwardComplaint: (complaintId: string, department: string, remarks: string) => void;
  onEscalateComplaint: (complaintId: string, reason: string) => void;
}

export const PanchayatPortal: React.FC<PanchayatPortalProps> = ({
  currentUser,
  complaints,
  departments,
  language,
  onSelectComplaint,
  onForwardComplaint,
  onEscalateComplaint,
}) => {
  const t = translations[language];
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [forwardModalComplaint, setForwardModalComplaint] = useState<Complaint | null>(null);
  const [targetDept, setTargetDept] = useState<string>('');
  const [forwardRemarks, setForwardRemarks] = useState<string>('');
  const [escalateModalComplaint, setEscalateModalComplaint] = useState<Complaint | null>(null);
  const [escalateReason, setEscalateReason] = useState<string>('');

  // Strict Panchayat Jurisdiction Enforcement
  const panchayatComplaints = complaints.filter(
    c =>
      currentUser.village === 'All Panchayats' ||
      currentUser.role === 'government_admin' ||
      c.location.village.toLowerCase().includes(currentUser.village.toLowerCase())
  );

  const activeCount = panchayatComplaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length;
  const resolvedCount = panchayatComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  const breachedCount = panchayatComplaints.filter(c => c.slaBreached).length;

  const wards = Array.from(new Set(panchayatComplaints.map(c => c.location.ward))).filter(Boolean);

  const filtered = panchayatComplaints.filter(c => {
    const matchesWard = selectedWard === 'ALL' || c.location.ward === selectedWard;
    const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
    return matchesWard && matchesDept;
  });

  const handleForwardSubmit = () => {
    if (!forwardModalComplaint || !targetDept) return;
    onForwardComplaint(forwardModalComplaint.id, targetDept, forwardRemarks);
    setForwardModalComplaint(null);
    setTargetDept('');
    setForwardRemarks('');
  };

  const handleEscalateSubmit = () => {
    if (!escalateModalComplaint || !escalateReason) return;
    onEscalateComplaint(escalateModalComplaint.id, escalateReason);
    setEscalateModalComplaint(null);
    setEscalateReason('');
  };

  return (
    <div className="space-y-6">
      {/* Panchayat Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-3 border border-emerald-500/30">
              <Landmark size={13} className="text-emerald-300" />
              <span>Gram Panchayat Command Portal</span>
              <span>•</span>
              <span className="font-bold text-amber-200">{currentUser.village}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Designation: <span className="text-emerald-300 font-semibold">{currentUser.designation}</span> • Block: <span className="text-slate-200">{currentUser.block || 'Kashi Vidyapeeth'}</span> • District: <span className="text-slate-200">{currentUser.district}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-right">
              <div className="text-xs text-slate-400">Panchayat SLA Compliance</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {panchayatComplaints.length > 0
                  ? `${Math.round(((panchayatComplaints.length - breachedCount) / panchayatComplaints.length) * 100)}%`
                  : '100%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panchayat Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Panchayat Total Cases</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{panchayatComplaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{wards.length} Wards Supervised</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Field Actions</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{activeCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Under line departments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">SLA Breached Cases</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{breachedCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">Immediate follow-up needed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Resolved & Closed</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Citizen verified</div>
        </div>
      </div>

      {/* Filter & Complaints Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Grievances in {currentUser.village}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and dispatch grievances directly to responsible line departments or escalate to BDO / District Officer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Wards</option>
              {wards.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
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
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {cmp.location.ward}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {cmp.category}
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
                  className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition cursor-pointer"
                >
                  {cmp.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cmp.description}</p>

                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                  <span>Citizen: <strong className="text-slate-700">{cmp.citizenName}</strong></span>
                  <span>•</span>
                  <span>Routed to: <strong className="text-slate-700">{cmp.department}</strong></span>
                  <span>•</span>
                  <span>Priority: <strong className="text-indigo-700">{cmp.priority} ({cmp.priorityScore}/100)</strong></span>
                </div>
              </div>

              {/* Panchayat Actions: Forward to Dept, Escalate to District */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                <button
                  onClick={() => {
                    setForwardModalComplaint(cmp);
                    setTargetDept(cmp.department);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                >
                  <Send size={13} />
                  <span>Forward / Assign</span>
                </button>

                <button
                  onClick={() => setEscalateModalComplaint(cmp)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                >
                  <AlertTriangle size={13} />
                  <span>Escalate to District</span>
                </button>

                <button
                  onClick={() => onSelectComplaint(cmp)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={13} />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forward Modal */}
      {forwardModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Forward / Reassign to Line Department</h3>
            <p className="text-xs text-slate-500 mt-1">Ticket: {forwardModalComplaint.complaintId}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Department</label>
                <select
                  value={targetDept}
                  onChange={e => setTargetDept(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pradhan Directives / Instructions</label>
                <textarea
                  rows={3}
                  value={forwardRemarks}
                  onChange={e => setForwardRemarks(e.target.value)}
                  placeholder="Enter specific instructions or site landmark details for the department officer..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setForwardModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleForwardSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
              >
                Dispatch Work Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {escalateModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Escalate to District Magistrate / BDO</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Ticket: {escalateModalComplaint.complaintId}</p>

            <textarea
              rows={4}
              value={escalateReason}
              onChange={e => setEscalateReason(e.target.value)}
              placeholder="State reason for escalation to District Magistrate Cell (e.g., funding deficiency, line department delay, critical infrastructure failure)..."
              className="w-full mt-4 p-3 text-xs rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEscalateModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateSubmit}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                Confirm District Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
