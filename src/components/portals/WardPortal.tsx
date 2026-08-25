import React, { useState } from 'react';
import {
  Complaint,
  User,
  Department,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import { SlaCountdownBadge } from '../SlaCountdownBadge';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  MapPin,
  TrendingUp,
  Flame,
  Star,
  Search,
  Filter,
  Eye,
} from 'lucide-react';

interface WardPortalProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
  onReviewComplaint: (complaintId: string, remarks: string, status?: string) => void;
  onEscalateComplaint: (complaintId: string, reason: string) => void;
}

export const WardPortal: React.FC<WardPortalProps> = ({
  currentUser,
  complaints,
  departments,
  language,
  onSelectComplaint,
  onReviewComplaint,
  onEscalateComplaint,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'complaints' | 'hotspots' | 'analytics' | 'feedback'>('complaints');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [reviewModalComplaint, setReviewModalComplaint] = useState<Complaint | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [escalateReason, setEscalateReason] = useState<string>('');
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  // Strict Ward Jurisdiction Enforcement
  const wardComplaints = complaints.filter(
    c => c.location.ward === currentUser.ward || currentUser.role === 'government_admin'
  );

  const activeWardComplaints = wardComplaints.filter(c => !['Resolved', 'Closed'].includes(c.status));
  const resolvedWardComplaints = wardComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status));
  const breachedSla = wardComplaints.filter(c => c.slaBreached);
  const feedbackList = wardComplaints.filter(c => c.feedback).map(c => c.feedback!);

  const avgRating =
    feedbackList.length > 0
      ? Math.round((feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length) * 10) / 10
      : 4.8;

  const handleReviewSubmit = () => {
    if (!reviewModalComplaint) return;
    onReviewComplaint(reviewModalComplaint.id, reviewRemarks || `Reviewed and recommended for field action by ${currentUser.name}`);
    setReviewModalComplaint(null);
    setReviewRemarks('');
  };

  const handleEscalateSubmit = () => {
    if (!reviewModalComplaint) return;
    onEscalateComplaint(reviewModalComplaint.id, escalateReason || `Escalated by Ward Member (${currentUser.ward}) to District Authority`);
    setIsEscalateModalOpen(false);
    setReviewModalComplaint(null);
    setEscalateReason('');
  };

  return (
    <div className="space-y-6">
      {/* Ward Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md mb-3 border border-indigo-500/30">
              <Building2 size={13} className="text-amber-300" />
              <span>Ward Jurisdiction Portal</span>
              <span>•</span>
              <span className="font-bold text-amber-200">{currentUser.ward}</span>
              <span>({currentUser.village})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Designation: <span className="text-indigo-300 font-semibold">{currentUser.designation}</span> • Administrative Jurisdiction: <span className="text-slate-200 font-medium">{currentUser.ward}, {currentUser.village}, {currentUser.district}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-right">
              <div className="text-xs text-slate-400">Citizen Satisfaction</div>
              <div className="text-xl font-bold text-amber-400 flex items-center gap-1 justify-end mt-0.5">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>{avgRating} / 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('complaints')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'complaints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Ward Complaints Queue</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
            {wardComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('hotspots')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'hotspots'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame size={15} className="text-rose-500" />
          <span>Ward Hotspots & Risks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'feedback'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star size={15} className="text-amber-500" />
          <span>Citizen Feedback ({feedbackList.length})</span>
        </button>
      </div>

      {/* Ward Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Ward Grievances</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{wardComplaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Strictly {currentUser.ward}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active / Under Action</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{activeWardComplaints.length}</div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Requiring field follow-up</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">SLA Breaches</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{breachedSla.length}</div>
          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">Needs escalation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Resolution Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {wardComplaints.length > 0
              ? `${Math.round((resolvedWardComplaints.length / wardComplaints.length) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">SLA compliant</div>
        </div>
      </div>

      {/* Tab: Complaints Queue */}
      {activeSubTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Active Grievances in {currentUser.ward}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review complaints, append ground remarks, forward to Line Departments or escalate.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Roads">Roads</option>
                <option value="Electricity">Electricity</option>
                <option value="Street Lights">Street Lights</option>
                <option value="Sanitation">Sanitation</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {wardComplaints
              .filter(c => selectedCategory === 'ALL' || c.category === selectedCategory)
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
                      className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition cursor-pointer"
                    >
                      {cmp.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{cmp.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                      <span>Citizen: <strong className="text-slate-700">{cmp.citizenName}</strong> ({cmp.citizenPhone})</span>
                      <span>•</span>
                      <span>Department: <strong className="text-slate-700">{cmp.department}</strong></span>
                      <span>•</span>
                      <span>Priority: <strong className="text-amber-700">{cmp.priority} ({cmp.priorityScore}/100)</strong></span>
                    </div>
                  </div>

                  {/* Ward Review & Escalate actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => setReviewModalComplaint(cmp)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                    >
                      <span>Add Remarks</span>
                    </button>

                    <button
                      onClick={() => {
                        setReviewModalComplaint(cmp);
                        setIsEscalateModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                    >
                      <AlertTriangle size={13} />
                      <span>Escalate</span>
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
      )}

      {/* Tab: Ward Hotspots */}
      {activeSubTab === 'hotspots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-3">
              <Flame size={18} />
              <span>Ward 5 High-Risk Infrastructure Hotspots</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              AI predictive model has detected recurring issues along the Main Bypass Link in Ward 5.
            </p>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-xs font-bold text-rose-900">Solar Street Light Theft Cluster</div>
                <p className="text-xs text-rose-700 mt-1">7 solar panels & batteries disconnected along the bypass corridor.</p>
                <div className="mt-2 text-[11px] font-semibold text-rose-800">Action: Request lockable cage installation from DISCOM.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-900">Pond Drainage Blockage</div>
                <p className="text-xs text-amber-700 mt-1">Heavy runoff risk during monsoon near community pond.</p>
                <div className="mt-2 text-[11px] font-semibold text-amber-800">Action: Pre-monsoon canal desilting recommended.</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Ward SLA Performance Benchmarks</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Water Supply SLA</span>
                  <span className="text-emerald-600">96% Met</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Roads & PWD SLA</span>
                  <span className="text-indigo-600">88% Met</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Electricity & Street Lights</span>
                  <span className="text-amber-600">74% Met</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Citizen Feedback */}
      {activeSubTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Ground Citizen Feedback in {currentUser.ward}
          </h3>
          {feedbackList.length === 0 ? (
            <p className="text-xs text-slate-500">No citizen feedback recorded in this ward yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">"{fb.comments}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Remarks Modal */}
      {reviewModalComplaint && !isEscalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Add Ward Review Remarks</h3>
            <p className="text-xs text-slate-500 mt-1">Ticket: {reviewModalComplaint.complaintId}</p>

            <textarea
              rows={4}
              value={reviewRemarks}
              onChange={e => setReviewRemarks(e.target.value)}
              placeholder="Enter local inspection observations, instructions for line department, or priority endorsement..."
              className="w-full mt-4 p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setReviewModalComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
              >
                Submit Remarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {reviewModalComplaint && isEscalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Escalate to District Administration</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Ticket: {reviewModalComplaint.complaintId}</p>

            <textarea
              rows={4}
              value={escalateReason}
              onChange={e => setEscalateReason(e.target.value)}
              placeholder="State reason for escalation (e.g. Line department unresponsive, repeated failure, severe public safety hazard)..."
              className="w-full mt-4 p-3 text-xs rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEscalateModalOpen(false);
                  setReviewModalComplaint(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateSubmit}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
