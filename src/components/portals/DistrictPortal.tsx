import React, { useState } from 'react';
import {
  Complaint,
  User,
  Department,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import { SlaCountdownBadge } from '../SlaCountdownBadge';
import {
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Building,
  TrendingUp,
  BarChart3,
  Flame,
  Search,
  Filter,
  Eye,
  Shuffle,
  Users,
} from 'lucide-react';

interface DistrictPortalProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
  onReassignComplaint: (complaintId: string, department: string, priority: string, remarks: string) => void;
}

export const DistrictPortal: React.FC<DistrictPortalProps> = ({
  currentUser,
  complaints,
  departments,
  language,
  onSelectComplaint,
  onReassignComplaint,
}) => {
  const t = translations[language];
  const [selectedSubTab, setSelectedSubTab] = useState<'queue' | 'panchayats' | 'departments' | 'breaches'>('queue');
  const [filterPanchayat, setFilterPanchayat] = useState<string>('ALL');
  const [reassignModalComplaint, setReassignModalComplaint] = useState<Complaint | null>(null);
  const [reassignDept, setReassignDept] = useState<string>('');
  const [reassignPriority, setReassignPriority] = useState<string>('High');
  const [reassignRemarks, setReassignRemarks] = useState<string>('');

  // Strict District Jurisdiction Enforcement
  const districtComplaints = complaints.filter(
    c =>
      currentUser.district === 'All Districts' ||
      currentUser.role === 'government_admin' ||
      c.location.district.toLowerCase() === currentUser.district.toLowerCase()
  );

  const breachedCases = districtComplaints.filter(c => c.slaBreached);
  const escalatedCases = districtComplaints.filter(c => c.isEscalated);

  const panchayats = Array.from(new Set(districtComplaints.map(c => c.location.village))).filter(Boolean);

  const handleReassignSubmit = () => {
    if (!reassignModalComplaint || !reassignDept) return;
    onReassignComplaint(reassignModalComplaint.id, reassignDept, reassignPriority, reassignRemarks);
    setReassignModalComplaint(null);
    setReassignDept('');
    setReassignRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* District Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md mb-3 border border-blue-500/30">
              <Briefcase size={13} className="text-blue-300" />
              <span>District Administration Command Portal</span>
              <span>•</span>
              <span className="font-bold text-amber-200">{currentUser.district} District</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Designation: <span className="text-blue-300 font-semibold">{currentUser.designation}</span> • State: <span className="text-slate-200">{currentUser.state}</span> • Jurisdiction: <span className="text-slate-200">Entire District ({panchayats.length} Panchayats Supervised)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-right">
              <div className="text-xs text-slate-400">Escalated District Cases</div>
              <div className="text-xl font-bold text-rose-400 mt-0.5 flex items-center gap-1.5 justify-end">
                <ShieldAlert size={18} />
                <span>{escalatedCases.length} Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setSelectedSubTab('queue')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'queue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>All District Grievances</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
            {districtComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedSubTab('panchayats')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'panchayats'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building size={15} />
          <span>Panchayat Benchmark Rankings</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('departments')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={15} />
          <span>Line Department Efficiency</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('breaches')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            selectedSubTab === 'breaches'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={15} className="text-rose-600" />
          <span>SLA Breach Surveillance ({breachedCases.length})</span>
        </button>
      </div>

      {/* District Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total District Tickets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{districtComplaints.length}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">{panchayats.length} Gram Panchayats</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Critical Priority</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {districtComplaints.filter(c => c.severity === 'Critical' || c.priority === 'Critical').length}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Under DM Surveillance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">SLA Breaches</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{breachedCases.length}</div>
          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">Automated DM warning</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Overall Compliance</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {districtComplaints.length > 0
              ? `${Math.round(((districtComplaints.length - breachedCases.length) / districtComplaints.length) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">District Target: 90%+</div>
        </div>
      </div>

      {/* Subtab: Complaints Queue */}
      {selectedSubTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                District Grievance Surveillance Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full authority to override department assignments, escalate priority, and order emergency field intervention.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Panchayat:</span>
              <select
                value={filterPanchayat}
                onChange={e => setFilterPanchayat(e.target.value)}
                className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Gram Panchayats</option>
                {panchayats.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {districtComplaints
              .filter(c => filterPanchayat === 'ALL' || c.location.village === filterPanchayat)
              .map(cmp => (
                <div
                  key={cmp.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {cmp.complaintId}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {cmp.location.village} • {cmp.location.ward}
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
                          District Escalation
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => onSelectComplaint(cmp)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-700 transition cursor-pointer"
                    >
                      {cmp.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cmp.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                      <span>Citizen: <strong className="text-slate-700">{cmp.citizenName}</strong></span>
                      <span>•</span>
                      <span>Department: <strong className="text-slate-700">{cmp.department}</strong></span>
                      <span>•</span>
                      <span>Priority: <strong className="text-amber-700">{cmp.priority} ({cmp.priorityScore}/100)</strong></span>
                    </div>
                  </div>

                  {/* District Actions: Reassign / Override */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => {
                        setReassignModalComplaint(cmp);
                        setReassignDept(cmp.department);
                        setReassignPriority(cmp.priority);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
                    >
                      <Shuffle size={13} />
                      <span>Reassign / Override</span>
                    </button>

                    <button
                      onClick={() => onSelectComplaint(cmp)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Audit View</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Subtab: Panchayat Benchmark */}
      {selectedSubTab === 'panchayats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Gram Panchayat Performance & SLA Compliance Leaderboard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Gram Panchayat</th>
                  <th className="p-3">Total Complaints</th>
                  <th className="p-3">Resolved</th>
                  <th className="p-3">Pending</th>
                  <th className="p-3">SLA Breaches</th>
                  <th className="p-3">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {panchayats.map(p => {
                  const pCmps = districtComplaints.filter(c => c.location.village === p);
                  const pRes = pCmps.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
                  const pBreached = pCmps.filter(c => c.slaBreached).length;
                  const pRate = pCmps.length > 0 ? Math.round(((pCmps.length - pBreached) / pCmps.length) * 100) : 100;

                  return (
                    <tr key={p} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-800">{p}</td>
                      <td className="p-3 font-semibold text-slate-700">{pCmps.length}</td>
                      <td className="p-3 text-emerald-600 font-bold">{pRes}</td>
                      <td className="p-3 text-amber-600 font-bold">{pCmps.length - pRes}</td>
                      <td className="p-3 text-rose-600 font-bold">{pBreached}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full ${pRate >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {pRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab: Line Departments */}
      {selectedSubTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map(dept => {
            const deptCmps = districtComplaints.filter(c => c.department === dept.name);
            const deptRes = deptCmps.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
            const deptBreached = deptCmps.filter(c => c.slaBreached).length;
            const deptRate = deptCmps.length > 0 ? Math.round((deptRes / deptCmps.length) * 100) : 100;

            return (
              <div key={dept.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-indigo-700">{dept.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Head: {dept.headOfficer}</div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-400">Assigned</div>
                    <div className="text-sm font-bold text-slate-800">{deptCmps.length}</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <div className="text-xs text-emerald-600">Resolved</div>
                    <div className="text-sm font-bold text-emerald-800">{deptRes}</div>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg">
                    <div className="text-xs text-rose-600">Breached</div>
                    <div className="text-sm font-bold text-rose-800">{deptBreached}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Efficiency</span>
                  <span className="text-indigo-600">{deptRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab: SLA Breaches */}
      {selectedSubTab === 'breaches' && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-6">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base mb-4">
            <ShieldAlert size={20} />
            <span>District SLA Breach Surveillance & Interventions</span>
          </div>

          {breachedCases.length === 0 ? (
            <p className="text-xs text-slate-500">No overdue SLA breaches currently active in the district.</p>
          ) : (
            <div className="divide-y divide-rose-100">
              {breachedCases.map(cmp => (
                <div key={cmp.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {cmp.complaintId}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{cmp.department}</span>
                      <span className="text-xs text-slate-500">({cmp.location.village}, {cmp.location.ward})</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{cmp.title}</h5>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">
                      Overdue Deadline: {cmp.slaDeadline ? new Date(cmp.slaDeadline).toLocaleString() : 'Past Due'} • Priority: {cmp.priority}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setReassignModalComplaint(cmp);
                      setReassignDept(cmp.department);
                      setReassignPriority('Critical');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                  >
                    Direct Intervention Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">District Administrative Reassignment</h3>
            <p className="text-xs text-slate-500 mt-1">Ticket: {reassignModalComplaint.complaintId}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Department</label>
                <select
                  value={reassignDept}
                  onChange={e => setReassignDept(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Override Priority</label>
                <select
                  value={reassignPriority}
                  onChange={e => setReassignPriority(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Immediate Field Response)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">District Directives</label>
                <textarea
                  rows={3}
                  value={reassignRemarks}
                  onChange={e => setReassignRemarks(e.target.value)}
                  placeholder="Enter direct orders from the District Magistrate / DPRO cell..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setReassignModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Execute District Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
