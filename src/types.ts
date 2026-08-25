export type PortalType =
  | 'citizen'
  | 'ward'
  | 'panchayat'
  | 'district'
  | 'department'
  | 'government-admin';

export type UserRole = 'citizen' | 'ward_member' | 'gram_pradhan' | 'district_officer' | 'department_officer' | 'government_admin';

export type Designation =
  | 'Gram Pradhan'
  | 'Gram Panchayat Secretary'
  | 'Panchayat Development Officer (PDO)'
  | 'Ward Member'
  | 'Block Development Officer (BDO)'
  | 'Assistant Development Officer'
  | 'District Officer'
  | 'District Panchayati Raj Officer (DPRO)'
  | 'Department Officer'
  | 'Department Head'
  | 'Field Officer'
  | 'Government Admin'
  | 'Citizen';

export type DepartmentName =
  | 'Panchayati Raj'
  | 'Rural Development'
  | 'Jal Jeevan & Water Department'
  | 'PWD / Road Infrastructure'
  | 'Rural Electricity'
  | 'Swachh Bharat & Sanitation'
  | 'Health Department'
  | 'Education Department'
  | 'Public Works Department'
  | 'Waste Management'
  | 'Agriculture Department'
  | 'Other Government Department';

export type ComplaintCategory =
  | 'Water Supply'
  | 'Roads'
  | 'Electricity'
  | 'Sanitation'
  | 'Waste Management'
  | 'Drainage'
  | 'Street Lights'
  | 'Healthcare'
  | 'Education'
  | 'Agriculture'
  | 'Other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Analyzed'
  | 'Assigned'
  | 'Under Review'
  | 'Accepted'
  | 'Work in Progress'
  | 'Resolved'
  | 'Citizen Verification'
  | 'Closed'
  | 'Reopened';

export interface LocationData {
  state: string;
  district: string;
  block: string;
  village: string;
  ward: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  title: string;
  description: string;
  updatedBy: string;
  role?: string;
  department?: string;
  evidenceImageUrl?: string;
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  duplicateCount: number;
  primaryComplaintId?: string;
  similarComplaintIds: string[];
  radiusMeters: number;
  reason: string;
}

export interface AIAnalysisResult {
  detectedCategory: ComplaintCategory;
  categoryConfidence: number;
  severity: SeverityLevel;
  priorityLevel: PriorityLevel;
  priorityScore: number; // 0 - 100
  suggestedDepartment: DepartmentName;
  estimatedSlaHours: number;
  keyIssues: string[];
  aiRecommendation: string;
  duplicateInfo: DuplicateInfo;
}

export interface FeedbackData {
  rating: number; // 1 - 5
  satisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';
  comments: string;
  responseTimeRating: number;
  wasCompletelyResolved: boolean;
  createdAt: string;
}

export interface ResolutionData {
  resolvedAt: string;
  resolvedBy: string;
  resolutionDescription: string;
  evidenceImageUrl?: string;
  actionTaken: string;
  workNotes?: string;
}

export interface VerificationData {
  verifiedAt: string;
  verifiedBy: string;
  status: 'completely_resolved' | 'partially_resolved' | 'not_resolved';
  citizenComments?: string;
}

export interface Complaint {
  id: string;
  complaintId: string; // e.g. GS-2026-08421
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  additionalDetails?: string;
  audioRecordingUrl?: string;
  voiceLanguageUsed?: 'hi' | 'en';
  location: LocationData;
  imageUrl?: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  priorityScore: number;
  department: DepartmentName | string;
  assignedOfficer?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  slaDeadline: string;
  slaBreached: boolean;
  isEscalated: boolean;
  escalationReason?: string;
  reopenedCount: number;
  aiAnalysis: AIAnalysisResult;
  timeline: TimelineEvent[];
  resolution?: ResolutionData;
  verification?: VerificationData;
  feedback?: FeedbackData;
  linkedDuplicates?: string[];
  areaType?: 'rural' | 'urban';
}

export interface User {
  id: string;
  officialId?: string; // e.g. GOV-WARD-0001, GOV-PRADHAN-0002, GOV-ADMIN-0001
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: UserRole | string;
  designation?: Designation | string;
  department?: DepartmentName | string;
  portal?: PortalType;
  status?: 'active' | 'pending' | 'suspended';
  areaType?: 'rural' | 'urban';
  state?: string;
  district: string;
  block?: string;
  village: string;
  ward: string;
  language?: 'hi' | 'en';
  createdAt?: string;
  lastLogin?: string;
}

export interface Department {
  id: string;
  name: DepartmentName;
  nameHi: string;
  headOfficer: string;
  contactNumber: string;
  categoriesHandled: ComplaintCategory[];
  defaultSlaHours: number;
  activeStaffCount: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: UserRole | string;
  targetPortal?: PortalType | string;
  targetJurisdiction?: {
    district?: string;
    village?: string;
    ward?: string;
    department?: string;
  };
  title: string;
  message: string;
  type: 'complaint_created' | 'complaint_update' | 'sla_warning' | 'sla_breached' | 'verification_needed' | 'escalation' | 'assigned' | 'system_alert';
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

export type Notification = NotificationItem;

export interface AnalyticsOverview {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  reopenedComplaints: number;
  slaBreachedCount: number;
  slaComplianceRate: number; // e.g. 88.5%
  averageResolutionDays?: number;
  avgResolutionHours?: number;
  citizenSatisfactionRate: number; // e.g. 4.3 / 5
  ruralCount?: number;
  urbanCount?: number;
  ruralResolutionRate?: number;
  urbanResolutionRate?: number;
}

export interface HotspotPrediction {
  village: string;
  ward?: string;
  block: string;
  district?: string;
  overallRisk: 'High' | 'Medium' | 'Low';
  waterRisk: 'High' | 'Medium' | 'Low';
  roadRisk: 'High' | 'Medium' | 'Low';
  sanitationRisk: 'High' | 'Medium' | 'Low';
  electricityRisk: 'High' | 'Medium' | 'Low';
  recentComplaintCount: number;
  predictedIssueNext30Days: string;
  recommendedPreventiveAction: string;
  growthRatePercent?: number;
  mainCategory?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  designation: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
}

export interface SlaRule {
  id: string;
  category: ComplaintCategory;
  severity: SeverityLevel;
  standardHours: number;
  warningThresholdHours: number;
  autoEscalateTo: Designation;
  notifyDepartment: boolean;
  active: boolean;
}

export interface AdministrativeHierarchy {
  states: string[];
  districts: { name: string; state: string }[];
  blocks: { name: string; district: string }[];
  panchayats: { name: string; block: string; district: string }[];
  villages: { name: string; panchayat: string }[];
  wards: { name: string; panchayatOrTown: string }[];
  departments: DepartmentName[];
}
