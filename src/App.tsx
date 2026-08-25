import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Complaint,
  User,
  NotificationItem,
  Department,
  AnalyticsOverview,
  HotspotPrediction,
  AIAnalysisResult,
  PortalType,
} from './types';
import { Language, translations } from './utils/translations';
import { initSocket, getSocket } from './utils/socket';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { GISProblemMap } from './components/GISProblemMap';
import { AnalyticsView } from './components/AnalyticsView';
import { AIInsightsView } from './components/AIInsightsView';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { CitizenVerificationModal } from './components/CitizenVerificationModal';
import { AuthorityResolveModal } from './components/AuthorityResolveModal';
import { PortalAuthModal } from './components/portals/PortalAuthModal';

import { CitizenPortal } from './components/portals/CitizenPortal';
import { WardPortal } from './components/portals/WardPortal';
import { PanchayatPortal } from './components/portals/PanchayatPortal';
import { DistrictPortal } from './components/portals/DistrictPortal';
import { DepartmentPortal } from './components/portals/DepartmentPortal';
import { GovernmentAdminPortal } from './components/portals/GovernmentAdminPortal';

import { Sparkles, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';

const DEFAULT_CITIZEN: User = {
  id: 'user-1',
  name: 'Ramesh Kumar',
  phone: '9876543210',
  role: 'citizen',
  portal: 'citizen',
  village: 'Rampur Gram Panchayat',
  ward: 'Ward 3',
  district: 'Varanasi',
  state: 'Uttar Pradesh',
  language: 'hi',
  status: 'active',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CITIZEN);
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'analytics' | 'insights'>('dashboard');
  const [isSocketConnected, setIsSocketConnected] = useState(true);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hotspots, setHotspots] = useState<HotspotPrediction[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    reopenedComplaints: 0,
    slaBreachedCount: 0,
    avgResolutionHours: 48,
    slaComplianceRate: 92,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'warning' | 'info' } | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [pendingAiAnalysis, setPendingAiAnalysis] = useState<{ result: AIAnalysisResult; payload: any } | null>(null);
  const [selectedDetailComplaint, setSelectedDetailComplaint] = useState<Complaint | null>(null);
  const [selectedVerifyComplaint, setSelectedVerifyComplaint] = useState<Complaint | null>(null);
  const [selectedResolveComplaint, setSelectedResolveComplaint] = useState<Complaint | null>(null);
  const [isPortalAuthOpen, setIsPortalAuthOpen] = useState(false);

  const showToast = (title: string, desc: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cmpRes, deptRes, notifRes, analyticsRes, hotspotRes] = await Promise.all([
        axios.get('/api/complaints'),
        axios.get('/api/departments'),
        axios.get('/api/notifications'),
        axios.get('/api/analytics/overview'),
        axios.get('/api/analytics/hotspots'),
      ]);

      if (cmpRes.data.success) setComplaints(cmpRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (notifRes.data.success) setNotifications(notifRes.data.data);
      if (analyticsRes.data.success) setOverview(analyticsRes.data.data);
      if (hotspotRes.data.success) setHotspots(hotspotRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const socket = initSocket();

    const handleConnect = () => {
      setIsSocketConnected(true);
      if (currentUser.ward) {
        socket.emit('join-room', `ward:${currentUser.ward}`);
      }
      if (currentUser.village) {
        socket.emit('join-room', `village:${currentUser.village}`);
      }
      if (currentUser.department) {
        socket.emit('join-room', `department:${currentUser.department}`);
      }
      if (currentUser.district) {
        socket.emit('join-room', `district:${currentUser.district}`);
      }
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleComplaintCreated = (newCmp: Complaint) => {
      setComplaints(prev => {
        if (prev.some(c => c.id === newCmp.id)) return prev;
        return [newCmp, ...prev];
      });
      showToast('New Grievance Registered', `${newCmp.complaintId}: ${newCmp.title}`, 'info');
    };

    const handleComplaintUpdated = (updatedCmp: Complaint) => {
      setComplaints(prev => prev.map(c => (c.id === updatedCmp.id ? updatedCmp : c)));
      if (selectedDetailComplaint && selectedDetailComplaint.id === updatedCmp.id) {
        setSelectedDetailComplaint(updatedCmp);
      }
    };

    const handleSlaBreach = (data: { complaintId: string; message: string }) => {
      showToast('SLA Breach Alert', data.message, 'warning');
      loadData();
    };

    const handleAnalyticsUpdate = (newOverview: AnalyticsOverview) => {
      setOverview(newOverview);
    };

    const handleNotification = (notif: NotificationItem) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('complaint:created', handleComplaintCreated);
    socket.on('complaint:updated', handleComplaintUpdated);
    socket.on('sla:breach', handleSlaBreach);
    socket.on('analytics:update', handleAnalyticsUpdate);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('complaint:created', handleComplaintCreated);
      socket.off('complaint:updated', handleComplaintUpdated);
      socket.off('sla:breach', handleSlaBreach);
      socket.off('analytics:update', handleAnalyticsUpdate);
      socket.off('notification', handleNotification);
    };
  }, [currentUser, loadData, selectedDetailComplaint]);

  const handleSwitchPortal = async (portal: PortalType) => {
    try {
      const res = await axios.post('/api/auth/demo-switch', { portal });
      if (res.data.success) {
        setCurrentUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('gramsewa_token', res.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
        showToast(`Entered ${portal.toUpperCase()} Portal`, `Logged in as ${res.data.user.name} (${res.data.user.designation || res.data.user.role})`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAiAnalysis = async (description: string, additionalDetails: string, category: string, location: any): Promise<AIAnalysisResult> => {
    const res = await axios.post('/api/ai/analyze-complaint', {
      description,
      additionalDetails,
      category,
      location,
    });
    return res.data.data;
  };

  const handleInitialFormSubmit = async (formData: any) => {
    const aiResult = await handleRunAiAnalysis(
      formData.description,
      formData.additionalDetails,
      formData.category,
      formData.location
    );

    setPendingAiAnalysis({
      result: aiResult,
      payload: formData,
    });
    setIsReportModalOpen(false);
    setIsAiModalOpen(true);
  };

  const handleConfirmAiSubmission = async () => {
    if (!pendingAiAnalysis) return;
    const { payload, result } = pendingAiAnalysis;

    try {
      const res = await axios.post('/api/complaints', {
        title: payload.title,
        description: payload.description,
        additionalDetails: payload.additionalDetails,
        category: result.detectedCategory,
        location: payload.location,
        imageUrl: payload.imageUrl,
        citizenName: currentUser.name,
        citizenPhone: currentUser.phone,
        voiceLanguageUsed: payload.voiceLanguageUsed || language,
      });

      if (res.data.success) {
        setIsAiModalOpen(false);
        setPendingAiAnalysis(null);
        await loadData();
        showToast(
          language === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज हुई!' : 'Grievance Registered Successfully!',
          `Grievance ID: ${res.data.data.complaintId} • Assigned to ${res.data.data.department}`,
          'success'
        );
      }
    } catch (err: any) {
      alert('Submission failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (complaintId: string, status: string, department?: string) => {
    try {
      const res = await axios.patch(`/api/complaints/${complaintId}/status`, {
        status,
        department,
        actorName: currentUser.name,
        remarks: `Updated by ${currentUser.name} (${currentUser.designation || currentUser.role})`,
      });
      if (res.data.success) {
        await loadData();
        if (selectedDetailComplaint && selectedDetailComplaint.id === complaintId) {
          setSelectedDetailComplaint(res.data.data);
        }
        showToast('Status Updated', `Grievance status moved to "${status}"`, 'success');
      }
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const handleWardReview = async (complaintId: string, remarks: string) => {
    try {
      const res = await axios.post(`/api/ward/complaints/${complaintId}/review`, {
        remarks,
        reviewerName: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        showToast('Ward Review Logged', 'Remarks recorded and visible to all officials.', 'success');
      }
    } catch (err) {
      alert('Review failed');
    }
  };

  const handlePanchayatForward = async (complaintId: string, targetDept: string, remarks: string) => {
    try {
      const res = await axios.post(`/api/panchayat/complaints/${complaintId}/forward`, {
        department: targetDept,
        remarks,
        forwardedBy: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        showToast('Work Order Dispatched', `Reassigned to ${targetDept}`, 'success');
      }
    } catch (err) {
      alert('Forward failed');
    }
  };

  const handleDistrictReassign = async (complaintId: string, department: string, priority: string, remarks: string) => {
    try {
      const res = await axios.post(`/api/district/complaints/${complaintId}/reassign`, {
        department,
        priority,
        remarks,
        orderedBy: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        showToast('District Order Executed', `Overridden to ${department} with ${priority} Priority`, 'success');
      }
    } catch (err) {
      alert('District reassignment failed');
    }
  };

  const handleDepartmentAcceptTask = async (complaintId: string) => {
    try {
      const res = await axios.post(`/api/department/complaints/${complaintId}/accept`, {
        officerName: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        showToast('Task Order Accepted', 'Assigned to your field squad.', 'success');
      }
    } catch (err) {
      alert('Acceptance failed');
    }
  };

  const handleDepartmentStartWork = async (complaintId: string, workNotes: string) => {
    try {
      const res = await axios.post(`/api/department/complaints/${complaintId}/start-work`, {
        workNotes,
        officerName: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        showToast('Field Work Initiated', 'Technicians and machinery deployed on site.', 'info');
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDepartmentResolve = async (complaintId: string, description: string, evidenceImageUrl: string, actionTaken: string) => {
    try {
      const res = await axios.post(`/api/department/complaints/${complaintId}/resolve`, {
        resolvedBy: currentUser.name,
        resolutionDescription: description,
        evidenceImageUrl,
        actionTaken,
      });
      if (res.data.success) {
        await loadData();
        if (selectedDetailComplaint && selectedDetailComplaint.id === complaintId) {
          setSelectedDetailComplaint(res.data.data);
        }
        showToast('Work Marked Completed', 'Citizen verification dispatched to complainant.', 'success');
      }
    } catch (err: any) {
      alert('Failed to mark resolved');
    }
  };

  const handleVerifyComplaint = async (
    complaintId: string,
    verificationStatus: 'completely_resolved' | 'partially_resolved' | 'not_resolved',
    citizenComments: string,
    feedbackData?: any
  ) => {
    try {
      const res = await axios.post(`/api/citizen/complaints/${complaintId}/verify`, {
        citizenName: currentUser.name,
        verificationStatus,
        citizenComments,
        feedbackData,
      });
      if (res.data.success) {
        await loadData();
        if (selectedDetailComplaint && selectedDetailComplaint.id === complaintId) {
          setSelectedDetailComplaint(res.data.data);
        }
        showToast(
          verificationStatus === 'completely_resolved' ? 'Grievance Verified & Closed!' : 'Grievance Reopened',
          citizenComments,
          verificationStatus === 'completely_resolved' ? 'success' : 'warning'
        );
      }
    } catch (err: any) {
      alert('Verification failed');
    }
  };

  const handleEscalateComplaint = async (complaintId: string, reason: string) => {
    try {
      const res = await axios.post(`/api/complaints/${complaintId}/escalate`, {
        reason,
        escalatedBy: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        if (selectedDetailComplaint && selectedDetailComplaint.id === complaintId) {
          setSelectedDetailComplaint(res.data.data);
        }
        showToast('Complaint Escalated', `Escalated to District Administration: ${reason}`, 'warning');
      }
    } catch (err: any) {
      alert('Escalation failed');
    }
  };

  const handleMergeDuplicates = async (complaintId: string, similarIds: string[]) => {
    try {
      const res = await axios.post(`/api/complaints/${complaintId}/merge`, {
        similarIds,
        mergedBy: currentUser.name,
      });
      if (res.data.success) {
        await loadData();
        if (selectedDetailComplaint && selectedDetailComplaint.id === complaintId) {
          setSelectedDetailComplaint(res.data.data);
        }
        showToast('Cluster Merged', 'Duplicate complaints unified into primary tracking ticket.', 'info');
      }
    } catch (err: any) {
      alert('Merge failed');
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const t = translations[language];

  const renderActivePortal = () => {
    const portal = currentUser.portal || (currentUser.role === 'citizen' ? 'citizen' : 'panchayat');

    switch (portal) {
      case 'ward':
        return (
          <WardPortal
            currentUser={currentUser}
            complaints={complaints}
            departments={departments}
            language={language}
            onSelectComplaint={setSelectedDetailComplaint}
            onReviewComplaint={handleWardReview}
            onEscalateComplaint={handleEscalateComplaint}
          />
        );

      case 'panchayat':
        return (
          <PanchayatPortal
            currentUser={currentUser}
            complaints={complaints}
            departments={departments}
            language={language}
            onSelectComplaint={setSelectedDetailComplaint}
            onForwardComplaint={handlePanchayatForward}
            onEscalateComplaint={handleEscalateComplaint}
          />
        );

      case 'district':
        return (
          <DistrictPortal
            currentUser={currentUser}
            complaints={complaints}
            departments={departments}
            language={language}
            onSelectComplaint={setSelectedDetailComplaint}
            onReassignComplaint={handleDistrictReassign}
          />
        );

      case 'department':
        return (
          <DepartmentPortal
            currentUser={currentUser}
            complaints={complaints}
            departments={departments}
            language={language}
            onSelectComplaint={setSelectedDetailComplaint}
            onAcceptTask={handleDepartmentAcceptTask}
            onStartWork={handleDepartmentStartWork}
            onResolveComplaint={handleDepartmentResolve}
          />
        );

      case 'government-admin':
        return (
          <GovernmentAdminPortal
            currentUser={currentUser}
            complaints={complaints}
            departments={departments}
            overview={overview}
            language={language}
            onRefreshData={loadData}
          />
        );

      case 'citizen':
      default:
        return (
          <CitizenPortal
            currentUser={currentUser}
            complaints={complaints}
            language={language}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectComplaint={setSelectedDetailComplaint}
            onOpenVerificationModal={setSelectedVerifyComplaint}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1 rounded-lg bg-indigo-500 text-white mt-0.5 shrink-0">
            <BellRing size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-indigo-300">{toastMessage.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      <Navbar
        currentUser={currentUser}
        language={language}
        onLanguageChange={setLanguage}
        onSwitchPortal={handleSwitchPortal}
        onOpenLogin={() => setIsPortalAuthOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkNotificationsRead}
        isSocketConnected={isSocketConnected}
        onSelectNotificationComplaint={complaintId => {
          const found = complaints.find(c => c.id === complaintId || c.complaintId === complaintId);
          if (found) setSelectedDetailComplaint(found);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'dashboard' && renderActivePortal()}

        {activeTab === 'map' && (
          <GISProblemMap
            complaints={complaints}
            language={language}
            onSelectComplaint={setSelectedDetailComplaint}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            complaints={complaints}
            overview={overview}
            language={language}
          />
        )}

        {activeTab === 'insights' && (
          <AIInsightsView
            hotspots={hotspots}
            language={language}
          />
        )}
      </main>

      <ComplaintFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleInitialFormSubmit}
        language={language}
        onRunAiAnalysis={handleRunAiAnalysis}
      />

      <AIAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={pendingAiAnalysis?.result || null}
        language={language}
        onConfirm={handleConfirmAiSubmission}
        isSubmitting={isLoading}
      />

      <ComplaintDetailModal
        isOpen={!!selectedDetailComplaint}
        onClose={() => setSelectedDetailComplaint(null)}
        complaint={selectedDetailComplaint}
        currentUser={currentUser}
        language={language}
        departments={departments}
        onOpenVerificationModal={cmp => {
          setSelectedDetailComplaint(null);
          setSelectedVerifyComplaint(cmp);
        }}
        onOpenResolveModal={cmp => {
          setSelectedDetailComplaint(null);
          setSelectedResolveComplaint(cmp);
        }}
        onUpdateStatus={handleUpdateStatus}
        onEscalate={handleEscalateComplaint}
        onMergeDuplicates={handleMergeDuplicates}
      />

      <CitizenVerificationModal
        isOpen={!!selectedVerifyComplaint}
        onClose={() => setSelectedVerifyComplaint(null)}
        complaint={selectedVerifyComplaint}
        language={language}
        onVerify={handleVerifyComplaint}
      />

      <AuthorityResolveModal
        isOpen={!!selectedResolveComplaint}
        onClose={() => setSelectedResolveComplaint(null)}
        complaint={selectedResolveComplaint}
        language={language}
        onResolve={handleDepartmentResolve}
      />

      <PortalAuthModal
        isOpen={isPortalAuthOpen}
        onClose={() => setIsPortalAuthOpen(false)}
        onLoginSuccess={(usr, token) => {
          setCurrentUser(usr);
          if (token) {
            localStorage.setItem('gramsewa_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          showToast(`Authenticated: ${usr.portal.toUpperCase()} Portal`, `Logged in as ${usr.name} (${usr.designation || usr.role})`, 'success');
        }}
        language={language}
        initialPortal={currentUser.portal || 'citizen'}
      />

      <footer className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between shrink-0 text-[10px] text-slate-500 font-medium mt-auto">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isSocketConnected ? 'Real-Time Sync Active' : 'Connecting to Realtime Mesh...'}
          </span>
          <span>Backend Version: 2.0.0-MultiPortal</span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline text-slate-500">GramSewa Rural AI-Triage & 6-Portal Governance Architecture</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="hover:text-indigo-600 transition cursor-pointer">Support Portal</span>
          <span className="hover:text-indigo-600 transition cursor-pointer">Gov Data Policy</span>
          <span>&copy; 2026 Ministry of Rural Development & Panchayati Raj</span>
        </div>
      </footer>
    </div>
  );
}
