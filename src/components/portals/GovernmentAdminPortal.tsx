import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Complaint,
  AuditLog,
  SlaRule,
  Department,
  AnalyticsOverview,
  Designation,
  DepartmentName,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  FileText,
  Sliders,
  Settings,
  Layers,
  Database,
  Building,
  CheckCircle2,
  Lock,
  Search,
  RotateCcw,
  Sparkles,
  BarChart2,
  Radio,
  Check,
  UserPlus,
  KeyRound,
  Copy,
  Plus,
} from 'lucide-react';

interface GovernmentAdminPortalProps {
  currentUser: User;
  complaints: Complaint[];
  departments: Department[];
  overview: AnalyticsOverview;
  language: Language;
  onRefreshData?: () => void;
}

export const GovernmentAdminPortal: React.FC<GovernmentAdminPortalProps> = ({
  currentUser,
  complaints,
  departments,
  overview,
  language,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'sla' | 'hierarchy' | 'analytics'>('users');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [slaRulesList, setSlaRulesList] = useState<SlaRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [statusActionMsg, setStatusActionMsg] = useState<string | null>(null);

  // New Official Account Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOfficialName, setNewOfficialName] = useState('');
  const [newOfficialId, setNewOfficialId] = useState('');
  const [newOfficialPhone, setNewOfficialPhone] = useState('');
  const [newOfficialEmail, setNewOfficialEmail] = useState('');
  const [newOfficialDesignation, setNewOfficialDesignation] = useState<Designation>('Ward Member');
  const [newOfficialDept, setNewOfficialDept] = useState<DepartmentName>('Jal Jeevan & Water Department');
  const [newOfficialState, setNewOfficialState] = useState('Uttar Pradesh');
  const [newOfficialDistrict, setNewOfficialDistrict] = useState('Varanasi');
  const [newOfficialBlock, setNewOfficialBlock] = useState('Kashi Vidyapeeth');
  const [newOfficialVillage, setNewOfficialVillage] = useState('Rampur Gram Panchayat');
  const [newOfficialWard, setNewOfficialWard] = useState('Ward 5');
  const [newOfficialPassword, setNewOfficialPassword] = useState('password123');
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes, slaRes] = await Promise.all([
        axios.get('/api/government-admin/users'),
        axios.get('/api/government-admin/audit-logs'),
        axios.get('/api/government-admin/sla-rules'),
      ]);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
      if (slaRes.data.success) setSlaRulesList(slaRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const generateAutoId = (designation: Designation) => {
    let prefix = 'GOV-OFFICER';
    if (designation === 'Ward Member') prefix = 'GOV-WARD';
    else if (designation === 'Gram Pradhan') prefix = 'GOV-PRADHAN';
    else if (designation === 'Gram Panchayat Secretary') prefix = 'GOV-SEC';
    else if (designation.includes('PDO') || designation.includes('Panchayat Development')) prefix = 'GOV-PDO';
    else if (designation.includes('District') || designation.includes('DPRO') || designation.includes('BDO')) prefix = 'GOV-DIST';
    else if (designation === 'Government Admin') prefix = 'GOV-ADMIN';
    else prefix = 'GOV-DEPT';

    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    setNewOfficialId(`${prefix}-${randomSuffix}`);
  };

  const handleOpenCreateModal = () => {
    generateAutoId(newOfficialDesignation);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const res = await axios.post('/api/government-admin/officials/create', {
        name: newOfficialName,
        officialId: newOfficialId,
        phone: newOfficialPhone,
        email: newOfficialEmail,
        designation: newOfficialDesignation,
        department: newOfficialDesignation.includes('Department') || newOfficialDesignation.includes('Field') ? newOfficialDept : undefined,
        state: newOfficialState,
        district: newOfficialDistrict,
        block: newOfficialBlock,
        village: newOfficialVillage,
        ward: newOfficialWard,
        password: newOfficialPassword,
        status: 'active',
      });

      if (res.data.success) {
        setStatusActionMsg(`Official account created successfully! Official ID: ${res.data.data.officialId}`);
        setIsCreateModalOpen(false);
        setNewOfficialName('');
        setNewOfficialPhone('');
        setNewOfficialEmail('');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create official account.');
    }
  };

  const handleCopyCredentials = (user: User) => {
    const text = `GramSewa Official Login\nOfficial ID: ${user.officialId || user.id}\nPassword: ${user.password || 'password123'}\nPortal: /${user.portal}/dashboard`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const res = await axios.post(`/api/government-admin/users/${userId}/approve`);
      if (res.data.success) {
        setStatusActionMsg('Officer account approved successfully!');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const res = await axios.post(`/api/government-admin/users/${userId}/suspend`);
      if (res.data.success) {
        setStatusActionMsg('Account suspended.');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const res = await axios.post(`/api/government-admin/users/${userId}/reactivate`);
      if (res.data.success) {
        setStatusActionMsg('Account reactivated.');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const pendingUsers = usersList.filter(u => u.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Government Apex Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md mb-3 border border-indigo-500/30">
              <ShieldCheck size={13} className="text-amber-300" />
              <span>Apex Administration & Governance Command</span>
              <span>•</span>
              <span className="font-bold text-amber-200">Ministry Level Clearance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Official ID: <span className="font-mono text-amber-300 font-bold">{currentUser.officialId || 'GOV-ADMIN-0001'}</span> • Designation: <span className="text-indigo-300 font-semibold">{currentUser.designation}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-official-account-btn"
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg border border-indigo-400/40"
            >
              <UserPlus size={15} />
              <span>Issue Official ID / Create Account</span>
            </button>

            {pendingUsers.length > 0 && (
              <div className="bg-amber-500/20 border border-amber-400/40 px-3 py-2 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-xs font-bold text-amber-200">{pendingUsers.length} Pending Approvals</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusActionMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{statusActionMsg}</span>
          </div>
          <button onClick={() => setStatusActionMsg(null)} className="cursor-pointer text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Admin Subtabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={15} />
          <span>Official Accounts & RBAC</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={15} />
          <span>Security Audit Logs</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sla'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={15} />
          <span>SLA Rules & Escalation Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hierarchy'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building size={15} />
          <span>Administrative Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 size={15} />
          <span>System Governance Intelligence</span>
        </button>
      </div>

      {/* Tab: Users & Official Accounts */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Approvals Section */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-50/70 rounded-2xl border border-amber-300 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                <AlertTriangle size={17} className="text-amber-600" />
                <span>Pending Official Verification Queue</span>
              </div>
              <div className="divide-y divide-amber-200">
                {pendingUsers.map(user => (
                  <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {user.designation}
                        </span>
                        {user.officialId && (
                          <span className="font-mono text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">
                            {user.officialId}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Dept: <strong className="text-slate-800">{user.department || 'N/A'}</strong> • Jurisdiction: {user.village}, {user.ward} • Phone: {user.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Registered Officials */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Authorized Government Officials Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Government-issued Official IDs, auto-routed portals, and credentials management.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                >
                  <Plus size={14} />
                  <span>New Official ID</span>
                </button>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ID, name, designation..."
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Official Unique ID</th>
                    <th className="p-3">Name & Contact</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Portal Route</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Jurisdiction</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList
                    .filter(u =>
                      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                      u.designation.toLowerCase().includes(searchUser.toLowerCase()) ||
                      (u.officialId && u.officialId.toLowerCase().includes(searchUser.toLowerCase()))
                    )
                    .map(usr => (
                      <tr key={usr.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-indigo-900">
                          {usr.officialId ? (
                            <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
                              {usr.officialId}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Citizen User</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{usr.name}</div>
                          <div className="text-[11px] text-slate-400">{usr.phone}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{usr.designation}</td>
                        <td className="p-3">
                          <span className="font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                            /{usr.portal}/dashboard
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{usr.department || '—'}</td>
                        <td className="p-3 text-slate-600">
                          {usr.village} ({usr.ward})
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              usr.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : usr.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {usr.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          {usr.officialId && (
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(usr)}
                              title="Copy Login Credentials"
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Copy size={11} />
                              <span>{copiedId === usr.id ? 'Copied!' : 'Credentials'}</span>
                            </button>
                          )}
                          {usr.role !== 'government_admin' && (
                            usr.status === 'active' ? (
                              <button
                                onClick={() => handleSuspendUser(usr.id)}
                                className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateUser(usr.id)}
                                className="text-emerald-600 hover:text-emerald-800 font-semibold text-[11px] cursor-pointer"
                              >
                                Activate
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Real-Time Security & Governance Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically tracked actions, user IP addresses, timestamps, and resource identifiers.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400">{log.designation}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{log.action}</td>
                    <td className="p-3 font-mono text-slate-600">{log.resource}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                    <td className="p-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: SLA Rules */}
      {activeTab === 'sla' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Configured Service Level Agreement (SLA) & Automated Escalation Policies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {slaRulesList.map(rule => (
              <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{rule.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rule.priority === 'High' || rule.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {rule.priority} Priority
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div>Department: <strong className="text-slate-800">{rule.department}</strong></div>
                  <div>Resolution SLA: <strong className="text-indigo-600">{rule.maxResolutionHours} Hours</strong></div>
                  <div>Escalation Target: <strong className="text-amber-700">{rule.escalationTarget}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Hierarchy */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-slate-900 text-base mb-2">
            Multi-Tier Administrative Governance Hierarchy
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Hierarchical escalation and jurisdictional authority tree mapping from Ward Level to State Apex.
          </p>

          <div className="space-y-4 max-w-2xl">
            {[
              { tier: 'Tier 1 — Ward Level', role: 'Ward Member', scope: 'Ward Jurisdictions', route: '/ward' },
              { tier: 'Tier 2 — Gram Panchayat Level', role: 'Gram Pradhan / Secretary / PDO', scope: 'Gram Panchayat Villages', route: '/panchayat' },
              { tier: 'Tier 3 — District & Block Level', role: 'District Magistrate / DPRO / BDO', scope: 'District-Wide Administration', route: '/district' },
              { tier: 'Tier 4 — Line Departments', role: 'Executive Engineers & Field Officers', scope: 'Departmental Task Resolution', route: '/department' },
              { tier: 'Tier 5 — Apex Command', role: 'Government Admin (Ministry Cell)', scope: 'State Command & RBAC Authority', route: '/government-admin' },
            ].map(h => (
              <div key={h.tier} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{h.tier}</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{h.role}</div>
                  <div className="text-xs text-slate-500">{h.scope}</div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">
                  {h.route}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              System Governance & Platform Redressal Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total Complaints</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{complaints.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-700 font-semibold">Resolved Complaints</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  {complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-xs text-indigo-700 font-semibold">SLA Compliance</div>
                <div className="text-2xl font-bold text-indigo-700 mt-1">{overview.slaComplianceRate}%</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 font-semibold">Active Officers</div>
                <div className="text-2xl font-bold text-amber-800 mt-1">
                  {usersList.filter(u => u.status === 'active' && u.role !== 'citizen').length}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-4">Rural vs Urban Resolution Comparison</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Rural Panchayats ({overview.ruralCount || 4} cases)</span>
                    <span className="text-emerald-600">{overview.ruralResolutionRate || 82}% Resolution Rate</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${overview.ruralResolutionRate || 82}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Urban Wards ({overview.urbanCount || 1} cases)</span>
                    <span className="text-indigo-600">{overview.urbanResolutionRate || 88}% Resolution Rate</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${overview.urbanResolutionRate || 88}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-4">System SLA Compliance Aggregate</h4>
              <div className="text-4xl font-extrabold text-indigo-600 mb-2">
                {overview.slaComplianceRate}%
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Overall cross-departmental SLA compliance across all supervised Gram Panchayats and Urban Wards in Uttar Pradesh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Create Official Account Modal */}
      {/* ================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-900 text-white">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Issue Official ID & Account</h3>
                  <p className="text-xs text-slate-500">Only Government Admin can provision official accounts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOfficialSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newOfficialDesignation}
                  onChange={e => {
                    const des = e.target.value as Designation;
                    setNewOfficialDesignation(des);
                    generateAutoId(des);
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  <option value="Ward Member">Ward Member (Auto Routes to /ward)</option>
                  <option value="Gram Pradhan">Gram Pradhan (Auto Routes to /panchayat)</option>
                  <option value="Gram Panchayat Secretary">Gram Panchayat Secretary (Auto Routes to /panchayat)</option>
                  <option value="Panchayat Development Officer (PDO)">Panchayat Development Officer (PDO)</option>
                  <option value="District Officer">District Officer (Auto Routes to /district)</option>
                  <option value="District Panchayati Raj Officer (DPRO)">District Panchayati Raj Officer (DPRO)</option>
                  <option value="Block Development Officer (BDO)">Block Development Officer (BDO)</option>
                  <option value="Department Officer">Department Officer (Auto Routes to /department)</option>
                  <option value="Department Head">Department Head (Auto Routes to /department)</option>
                  <option value="Field Officer">Field Officer (Auto Routes to /department)</option>
                  <option value="Government Admin">Government Admin (Auto Routes to /government-admin)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Official Unique ID <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => generateAutoId(newOfficialDesignation)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Auto-Generate ID
                  </button>
                </div>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GOV-WARD-0001"
                    value={newOfficialId}
                    onChange={e => setNewOfficialId(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Officer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Chandra Sharma"
                    value={newOfficialName}
                    onChange={e => setNewOfficialName(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9811223344"
                    value={newOfficialPhone}
                    onChange={e => setNewOfficialPhone(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {(newOfficialDesignation.includes('Department') || newOfficialDesignation.includes('Field')) && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Line Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newOfficialDept}
                    onChange={e => setNewOfficialDept(e.target.value as DepartmentName)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Jal Jeevan & Water Department">Jal Jeevan & Water Department</option>
                    <option value="PWD / Road Infrastructure">PWD / Road Infrastructure</option>
                    <option value="Rural Electricity">Rural Electricity</option>
                    <option value="Swachh Bharat & Sanitation">Swachh Bharat & Sanitation</option>
                    <option value="Health Department">Health Department</option>
                    <option value="Education Department">Education Department</option>
                    <option value="Panchayati Raj">Panchayati Raj</option>
                    <option value="Rural Development">Rural Development</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={newOfficialDistrict}
                    onChange={e => setNewOfficialDistrict(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Panchayat / Village</label>
                  <input
                    type="text"
                    value={newOfficialVillage}
                    onChange={e => setNewOfficialVillage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ward Jurisdiction</label>
                  <input
                    type="text"
                    value={newOfficialWard}
                    onChange={e => setNewOfficialWard(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Password / PIN</label>
                <input
                  type="password"
                  value={newOfficialPassword}
                  onChange={e => setNewOfficialPassword(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check size={14} />
                  <span>Create & Provision Official ID</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
