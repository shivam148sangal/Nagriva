import { Complaint, NotificationItem, AuditLog, HotspotPrediction, ComplaintCategory, SeverityLevel, PriorityLevel, DepartmentName } from '../types';

// In-memory document storage backing Mongoose operations
let mongoComplaints: Complaint[] = [];
let mongoNotifications: NotificationItem[] = [];
let mongoAuditLogs: AuditLog[] = [];
let mongoHotspots: HotspotPrediction[] = [];

export class MongoComplaintService {
  /**
   * Seed initial MongoDB documents
   */
  static async seedMongoData() {
    const now = new Date();

    mongoComplaints = [
      {
        id: 'cmp-1',
        complaintId: 'GS-2026-08421',
        citizenId: 'usr-citizen-1',
        citizenName: 'Priya Sharma',
        citizenPhone: '9876543210',
        category: 'Water Supply',
        title: 'Severe Drinking Water Pipeline Leakage Near Primary School',
        description: 'Main drinking water pipeline cracked near Rampur Primary School Gate 2. Water is leaking continuously for 3 days and contaminating the surrounding playground.',
        additionalDetails: 'Over 200 schoolchildren and 60 households nearby are facing severe low pressure and muddy water supply.',
        location: {
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          village: 'Rampur Gram Panchayat',
          ward: 'Ward 1',
          landmark: 'Opposite Primary School Gate 2',
          latitude: 25.3176,
          longitude: 82.9739,
        },
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        severity: 'High',
        priority: 'High',
        priorityScore: 82,
        department: 'Jal Jeevan & Water Department',
        assignedOfficer: 'Er. Vikram Malhotra',
        status: 'Work in Progress',
        createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        slaHours: 24,
        slaDeadline: new Date(now.getTime() + 4 * 3600000).toISOString(),
        slaBreached: false,
        isEscalated: false,
        reopenedCount: 0,
        areaType: 'rural',
        aiAnalysis: {
          detectedCategory: 'Water Supply',
          categoryConfidence: 0.96,
          severity: 'High',
          priorityLevel: 'High',
          priorityScore: 82,
          suggestedDepartment: 'Jal Jeevan & Water Department',
          estimatedSlaHours: 24,
          keyIssues: ['Major potable pipeline rupture', 'School zone public health hazard', 'Low water pressure in 60 households'],
          aiRecommendation: 'Dispatch Jal Jeevan emergency pipeline repair unit with 4-inch PVC clamps and replacement joints.',
          duplicateInfo: {
            isDuplicate: false,
            duplicateCount: 0,
            similarComplaintIds: [],
            radiusMeters: 500,
            reason: 'Primary verified incident in Ward 1 sector.',
          },
        },
        timeline: [
          {
            status: 'Submitted',
            timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
            title: 'Complaint Registered by Citizen',
            description: 'Grievance submitted by Priya Sharma with voice note and photo evidence.',
            updatedBy: 'Priya Sharma',
            role: 'Citizen',
          },
          {
            status: 'AI Analyzed',
            timestamp: new Date(now.getTime() - 23.9 * 3600000).toISOString(),
            title: 'AI Analysis: High Priority (Score 82/100)',
            description: 'Auto-routed to Jal Jeevan & Water Department. SLA set to 24 hours.',
            updatedBy: 'GramSewa AI Classifier Engine',
          },
          {
            status: 'Accepted',
            timestamp: new Date(now.getTime() - 18 * 3600000).toISOString(),
            title: 'Accepted by Department Officer',
            description: 'Work order accepted by Er. Vikram Malhotra (Jal Jeevan & Water Department).',
            updatedBy: 'Er. Vikram Malhotra',
            role: 'Department Officer',
            department: 'Jal Jeevan & Water Department',
          },
          {
            status: 'Work in Progress',
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
            title: 'Repair Crew Deployed On-Site',
            description: 'Technicians on site with replacement joint kit. Excavation in progress.',
            updatedBy: 'Er. Vikram Malhotra',
            role: 'Department Officer',
            department: 'Jal Jeevan & Water Department',
          },
        ],
      },
      {
        id: 'cmp-2',
        complaintId: 'GS-2026-08422',
        citizenId: 'usr-citizen-2',
        citizenName: 'Mohan Lal',
        citizenPhone: '9876543211',
        category: 'Roads',
        title: 'Deep Dangerous Potholes on Main Link Road',
        description: 'Large potholes created during recent heavy rain on the main market road in Ward 2. Two two-wheelers skidded yesterday evening.',
        additionalDetails: 'Urgent patching required before upcoming weekly village mandi.',
        location: {
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          village: 'Rampur Gram Panchayat',
          ward: 'Ward 2',
          landmark: 'Near Hanuman Temple Crossing',
          latitude: 25.321,
          longitude: 82.981,
        },
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        severity: 'Medium',
        priority: 'Medium',
        priorityScore: 68,
        department: 'PWD / Road Infrastructure',
        assignedOfficer: 'Er. Neha Gupta',
        status: 'Assigned',
        createdAt: new Date(now.getTime() - 14 * 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 3600000).toISOString(),
        slaHours: 48,
        slaDeadline: new Date(now.getTime() + 34 * 3600000).toISOString(),
        slaBreached: false,
        isEscalated: false,
        reopenedCount: 0,
        areaType: 'rural',
        aiAnalysis: {
          detectedCategory: 'Roads',
          categoryConfidence: 0.94,
          severity: 'Medium',
          priorityLevel: 'Medium',
          priorityScore: 68,
          suggestedDepartment: 'PWD / Road Infrastructure',
          estimatedSlaHours: 48,
          keyIssues: ['Road surface damage', 'Accident hazard for commuters', 'Mandi route disruption'],
          aiRecommendation: 'Schedule PWD cold-mix bitumen patching crew.',
          duplicateInfo: {
            isDuplicate: false,
            duplicateCount: 0,
            similarComplaintIds: [],
            radiusMeters: 500,
            reason: 'Unique road damage entry.',
          },
        },
        timeline: [
          {
            status: 'Submitted',
            timestamp: new Date(now.getTime() - 14 * 3600000).toISOString(),
            title: 'Complaint Registered by Citizen',
            description: 'Grievance filed by Mohan Lal.',
            updatedBy: 'Mohan Lal',
            role: 'Citizen',
          },
          {
            status: 'Assigned',
            timestamp: new Date(now.getTime() - 10 * 3600000).toISOString(),
            title: 'Reviewed by Ward Member & Forwarded to PWD',
            description: 'Ward Member Anil Kumar inspected and endorsed priority.',
            updatedBy: 'Anil Kumar',
            role: 'Ward Member',
          },
        ],
      },
      {
        id: 'cmp-3',
        complaintId: 'GS-2026-08390',
        citizenId: 'usr-citizen-1',
        citizenName: 'Priya Sharma',
        citizenPhone: '9876543210',
        category: 'Electricity',
        title: 'Burnt 100kVA Distribution Transformer in Ward 3',
        description: 'Distribution transformer burnt with loud spark yesterday evening. Entire Ward 3 is without electricity.',
        location: {
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          village: 'Rampur Gram Panchayat',
          ward: 'Ward 3',
          landmark: 'Behind Community Health Sub-centre',
          latitude: 25.312,
          longitude: 82.965,
        },
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
        severity: 'Critical',
        priority: 'Critical',
        priorityScore: 94,
        department: 'Rural Electricity',
        assignedOfficer: 'Er. Sanjay Yadav',
        status: 'Resolved',
        createdAt: new Date(now.getTime() - 36 * 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
        slaHours: 18,
        slaDeadline: new Date(now.getTime() - 18 * 3600000).toISOString(),
        slaBreached: false,
        isEscalated: true,
        reopenedCount: 0,
        areaType: 'rural',
        resolution: {
          resolvedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
          resolvedBy: 'Er. Sanjay Yadav (SDO DISCOM)',
          resolutionDescription: 'Replacement 100kVA transformer installed and 11kV feeder lines tested. Power supply fully restored.',
          evidenceImageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
          actionTaken: 'Transformer swap out and load balancing executed.',
        },
        aiAnalysis: {
          detectedCategory: 'Electricity',
          categoryConfidence: 0.98,
          severity: 'Critical',
          priorityLevel: 'Critical',
          priorityScore: 94,
          suggestedDepartment: 'Rural Electricity',
          estimatedSlaHours: 18,
          keyIssues: ['Transformer failure', 'Total blackout in Ward 3', 'Health centre affected'],
          aiRecommendation: 'Immediate replacement transformer allocation from District DISCOM yard.',
          duplicateInfo: { isDuplicate: false, duplicateCount: 0, similarComplaintIds: [], radiusMeters: 500, reason: '' },
        },
        timeline: [
          {
            status: 'Submitted',
            timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(),
            title: 'Emergency Power Grievance Logged',
            description: 'Submitted by citizen.',
            updatedBy: 'Priya Sharma',
            role: 'Citizen',
          },
          {
            status: 'Resolved',
            timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
            title: 'Transformer Replaced & Restored',
            description: 'New transformer energized. Awaiting citizen verification.',
            updatedBy: 'Er. Sanjay Yadav',
            role: 'Department Officer',
          },
        ],
      },
    ];

    mongoNotifications = [
      {
        id: 'notif-1',
        title: 'New High Priority Water Leakage Complaint',
        message: 'GS-2026-08421 registered in Rampur Ward 1 near Primary School.',
        type: 'complaint_created',
        complaintId: 'GS-2026-08421',
        read: false,
        createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
        targetJurisdiction: { district: 'Varanasi', village: 'Rampur Gram Panchayat', ward: 'Ward 1', department: 'Jal Jeevan & Water Department' },
      },
      {
        id: 'notif-2',
        title: 'Transformer Replaced - Action Required',
        message: 'GS-2026-08390 resolved by DISCOM. Please inspect and provide citizen verification.',
        type: 'verification_needed',
        complaintId: 'GS-2026-08390',
        read: false,
        createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
        userId: 'usr-citizen-1',
        targetRole: 'citizen',
      },
    ];

    mongoAuditLogs = [
      {
        id: 'log-1',
        userId: 'usr-admin-1',
        userName: 'Rajesh Verma',
        userRole: 'government_admin',
        designation: 'Government Admin',
        action: 'PROVISION_OFFICIAL_ACCOUNT',
        resource: 'GOV-WARD-0001',
        details: 'Issued official account to Sita Devi (Ward 1 Member)',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(),
        status: 'SUCCESS',
      },
      {
        id: 'log-2',
        userId: 'usr-citizen-1',
        userName: 'Priya Sharma',
        userRole: 'citizen',
        designation: 'Citizen',
        action: 'CREATE_COMPLAINT',
        resource: 'GS-2026-08421',
        details: 'Registered water pipeline burst grievance via voice assistance',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
        status: 'SUCCESS',
      },
    ];

    mongoHotspots = [
      {
        village: 'Rampur Gram Panchayat',
        ward: 'Ward 3',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        overallRisk: 'High',
        waterRisk: 'Medium',
        roadRisk: 'High',
        sanitationRisk: 'Medium',
        electricityRisk: 'High',
        recentComplaintCount: 42,
        growthRatePercent: 37,
        mainCategory: 'Water Supply',
        predictedIssueNext30Days: 'Culvert structural collapse on Main Bazaar Road and intermittent feeder tripping in Ward 3-5.',
        recommendedPreventiveAction: 'Deploy PWD survey team for asphalt sealing before monsoon; pre-position spare 100kVA transformer at Substation.',
      },
      {
        village: 'Sundarpur Gram Panchayat',
        ward: 'Ward 2',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        overallRisk: 'High',
        waterRisk: 'High',
        roadRisk: 'Low',
        sanitationRisk: 'High',
        electricityRisk: 'Low',
        recentComplaintCount: 19,
        growthRatePercent: 25,
        mainCategory: 'Water Supply',
        predictedIssueNext30Days: 'Waterborne contamination surge due to aging Jal Jeevan pipeline joints in Ward 2 & Ward 4.',
        recommendedPreventiveAction: 'Conduct chlorine booster dosing at central reservoir; schedule pipeline hydrostatic pressure test.',
      },
      {
        village: 'Belur Gram Panchayat',
        ward: 'Ward 4',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        overallRisk: 'Medium',
        waterRisk: 'Low',
        roadRisk: 'Medium',
        sanitationRisk: 'Low',
        electricityRisk: 'High',
        recentComplaintCount: 12,
        growthRatePercent: 18,
        mainCategory: 'Electricity',
        predictedIssueNext30Days: 'Agricultural tubewell power interruptions during peak sowing cycle.',
        recommendedPreventiveAction: 'Clear overgrown tree branches touching 11kV lines; balance phase loads on agricultural feeders.',
      },
    ];

    console.log('[MongoDB Application DB] Seeded flexible complaint documents, timelines, GIS coordinates, and audit events.');
  }

  static async getAllComplaints(): Promise<Complaint[]> {
    return [...mongoComplaints];
  }

  static async findComplaintById(idOrCode: string): Promise<Complaint | null> {
    const c = mongoComplaints.find(item => item.id === idOrCode || item.complaintId === idOrCode);
    return c || null;
  }

  static async createComplaint(complaintData: Complaint): Promise<Complaint> {
    mongoComplaints.unshift(complaintData);
    return complaintData;
  }

  static async updateComplaint(idOrCode: string, updateData: Partial<Complaint>): Promise<Complaint | null> {
    const index = mongoComplaints.findIndex(item => item.id === idOrCode || item.complaintId === idOrCode);
    if (index === -1) return null;

    mongoComplaints[index] = {
      ...mongoComplaints[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return mongoComplaints[index];
  }

  static async getNotifications(): Promise<NotificationItem[]> {
    return [...mongoNotifications];
  }

  static async addNotification(notif: NotificationItem): Promise<NotificationItem> {
    mongoNotifications.unshift(notif);
    return notif;
  }

  static async markAllNotificationsRead(): Promise<void> {
    mongoNotifications.forEach(n => (n.read = true));
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    return [...mongoAuditLogs];
  }

  static async addAuditLog(log: AuditLog): Promise<AuditLog> {
    mongoAuditLogs.unshift(log);
    if (mongoAuditLogs.length > 300) mongoAuditLogs.pop();
    return log;
  }

  static async getHotspotPredictions(): Promise<HotspotPrediction[]> {
    return [...mongoHotspots];
  }

  static async getLiveAnalytics(): Promise<any> {
    const totalComplaints = mongoComplaints.length;
    const pendingComplaints = mongoComplaints.filter(c => ['Submitted', 'AI Analyzed', 'Assigned', 'Under Review'].includes(c.status)).length;
    const inProgressComplaints = mongoComplaints.filter(c => ['Accepted', 'Work in Progress'].includes(c.status)).length;
    const resolvedComplaints = mongoComplaints.filter(c => c.status === 'Resolved').length;
    const closedComplaints = mongoComplaints.filter(c => c.status === 'Closed').length;
    const reopenedComplaints = mongoComplaints.filter(c => c.status === 'Reopened').length;
    const slaBreachedCount = mongoComplaints.filter(c => c.slaBreached || (new Date(c.slaDeadline).getTime() < Date.now() && !['Resolved', 'Closed'].includes(c.status))).length;

    const slaComplianceRate = totalComplaints > 0 ? Math.round(((totalComplaints - slaBreachedCount) / totalComplaints) * 1000) / 10 : 92.5;

    const feedbacks = mongoComplaints.filter(c => c.feedback).map(c => c.feedback!.rating);
    const avgSatisfaction = feedbacks.length > 0 ? Math.round((feedbacks.reduce((a, b) => a + b, 0) / feedbacks.length) * 10) / 10 : 4.5;

    const ruralComplaints = mongoComplaints.filter(c => c.areaType !== 'urban');
    const urbanComplaints = mongoComplaints.filter(c => c.areaType === 'urban');

    const ruralResolved = ruralComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const urbanResolved = urbanComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;

    return {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      reopenedComplaints,
      slaBreachedCount,
      slaComplianceRate,
      averageResolutionDays: 2.1,
      avgResolutionHours: 48,
      citizenSatisfactionRate: avgSatisfaction,
      ruralCount: ruralComplaints.length,
      urbanCount: urbanComplaints.length,
      ruralResolutionRate: ruralComplaints.length > 0 ? Math.round((ruralResolved / ruralComplaints.length) * 100) : 82,
      urbanResolutionRate: urbanComplaints.length > 0 ? Math.round((urbanResolved / urbanComplaints.length) * 100) : 88,
    };
  }
}
