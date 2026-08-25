import mongoose, { Schema, Document } from 'mongoose';
import { Complaint, NotificationItem, AuditLog, HotspotPrediction } from '../../../types';

const TimelineEventSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    updatedBy: { type: String, required: true },
    role: { type: String },
    department: { type: String },
    evidenceImageUrl: { type: String },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    state: { type: String, required: true, default: 'Uttar Pradesh' },
    district: { type: String, required: true, default: 'Varanasi' },
    block: { type: String, required: true, default: 'Kashi Vidyapeeth' },
    village: { type: String, required: true },
    ward: { type: String, required: true },
    landmark: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const DuplicateInfoSchema = new Schema(
  {
    isDuplicate: { type: Boolean, default: false },
    duplicateCount: { type: Number, default: 0 },
    primaryComplaintId: { type: String },
    similarComplaintIds: [{ type: String }],
    radiusMeters: { type: Number, default: 500 },
    reason: { type: String },
  },
  { _id: false }
);

const AIAnalysisSchema = new Schema(
  {
    detectedCategory: { type: String, required: true },
    categoryConfidence: { type: Number, required: true },
    severity: { type: String, required: true },
    priorityLevel: { type: String, required: true },
    priorityScore: { type: Number, required: true },
    suggestedDepartment: { type: String, required: true },
    estimatedSlaHours: { type: Number, required: true },
    keyIssues: [{ type: String }],
    aiRecommendation: { type: String },
    duplicateInfo: DuplicateInfoSchema,
  },
  { _id: false }
);

const ResolutionSchema = new Schema(
  {
    resolvedAt: { type: String, required: true },
    resolvedBy: { type: String, required: true },
    resolutionDescription: { type: String, required: true },
    evidenceImageUrl: { type: String },
    actionTaken: { type: String, required: true },
    workNotes: { type: String },
  },
  { _id: false }
);

const VerificationSchema = new Schema(
  {
    verifiedAt: { type: String, required: true },
    verifiedBy: { type: String, required: true },
    status: { type: String, required: true },
    citizenComments: { type: String },
  },
  { _id: false }
);

const FeedbackSchema = new Schema(
  {
    rating: { type: Number, required: true },
    satisfaction: { type: String, required: true },
    comments: { type: String },
    responseTimeRating: { type: Number, required: true },
    wasCompletelyResolved: { type: Boolean, required: true },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

export const ComplaintMongooseSchema = new Schema<Complaint>(
  {
    id: { type: String, required: true, unique: true, index: true },
    complaintId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    citizenName: { type: String, required: true },
    citizenPhone: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    additionalDetails: { type: String },
    audioRecordingUrl: { type: String },
    voiceLanguageUsed: { type: String, enum: ['hi', 'en'], default: 'hi' },
    location: { type: LocationSchema, required: true },
    imageUrl: { type: String },
    severity: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
    priorityScore: { type: Number, required: true },
    department: { type: String, required: true, index: true },
    assignedOfficer: { type: String },
    status: {
      type: String,
      required: true,
      index: true,
      enum: [
        'Submitted',
        'AI Analyzed',
        'Assigned',
        'Under Review',
        'Accepted',
        'Work in Progress',
        'Resolved',
        'Citizen Verification',
        'Closed',
        'Reopened',
      ],
      default: 'Submitted',
    },
    createdAt: { type: String, required: true, index: true },
    updatedAt: { type: String, required: true },
    slaHours: { type: Number, required: true },
    slaDeadline: { type: String, required: true, index: true },
    slaBreached: { type: Boolean, default: false, index: true },
    isEscalated: { type: Boolean, default: false, index: true },
    escalationReason: { type: String },
    reopenedCount: { type: Number, default: 0 },
    aiAnalysis: { type: AIAnalysisSchema, required: true },
    timeline: [TimelineEventSchema],
    resolution: ResolutionSchema,
    verification: VerificationSchema,
    feedback: FeedbackSchema,
    linkedDuplicates: [{ type: String }],
    areaType: { type: String, enum: ['rural', 'urban'], default: 'rural' },
  },
  { timestamps: true, collection: 'complaints' }
);

ComplaintMongooseSchema.index({ 'location.village': 1, 'location.ward': 1 });
ComplaintMongooseSchema.index({ department: 1, status: 1 });
ComplaintMongooseSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export const ComplaintMongoModel = mongoose.models.Complaint || mongoose.model<Complaint>('Complaint', ComplaintMongooseSchema);

export const NotificationMongooseSchema = new Schema<NotificationItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    targetRole: { type: String, index: true },
    targetPortal: { type: String, index: true },
    targetJurisdiction: {
      district: { type: String },
      village: { type: String },
      ward: { type: String },
      department: { type: String },
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    complaintId: { type: String, index: true },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true, collection: 'notifications' }
);

export const NotificationMongoModel =
  mongoose.models.Notification || mongoose.model<NotificationItem>('Notification', NotificationMongooseSchema);

export const AuditLogMongooseSchema = new Schema<AuditLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    designation: { type: String, required: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: { type: String, required: true, enum: ['SUCCESS', 'WARNING', 'DENIED'], default: 'SUCCESS' },
  },
  { timestamps: true, collection: 'audit_logs' }
);

export const AuditLogMongoModel =
  mongoose.models.AuditLog || mongoose.model<AuditLog>('AuditLog', AuditLogMongooseSchema);

export const HotspotPredictionMongooseSchema = new Schema<HotspotPrediction>(
  {
    village: { type: String, required: true },
    ward: { type: String },
    block: { type: String, required: true },
    district: { type: String },
    overallRisk: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    waterRisk: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    roadRisk: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    sanitationRisk: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    electricityRisk: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    recentComplaintCount: { type: Number, required: true },
    growthRatePercent: { type: Number },
    mainCategory: { type: String },
    predictedIssueNext30Days: { type: String, required: true },
    recommendedPreventiveAction: { type: String, required: true },
  },
  { timestamps: true, collection: 'hotspot_predictions' }
);

export const HotspotMongoModel =
  mongoose.models.HotspotPrediction || mongoose.model<HotspotPrediction>('HotspotPrediction', HotspotPredictionMongooseSchema);
