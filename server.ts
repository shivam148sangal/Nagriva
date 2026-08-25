import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import {
  PortalType,
  UserRole,
  Designation,
  DepartmentName,
  ComplaintCategory,
  ComplaintStatus,
  SeverityLevel,
  PriorityLevel,
  Complaint,
  User,
  Department,
  NotificationItem,
  AuditLog,
  SlaRule,
  HotspotPrediction,
} from './src/types';
import { initDualDatabases } from './src/db';
import { MySqlGovernanceService } from './src/services/mysqlService';
import { MongoComplaintService } from './src/services/mongoService';

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gramsewa-governance-secret-key-2026';

app.use(express.json({ limit: '20mb' }));

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

export function getPortalForDesignation(designation: Designation): PortalType {
  switch (designation) {
    case 'Citizen':
      return 'citizen';
    case 'Ward Member':
      return 'ward';
    case 'Gram Pradhan':
    case 'Gram Panchayat Secretary':
    case 'Panchayat Development Officer (PDO)':
      return 'panchayat';
    case 'District Officer':
    case 'District Panchayati Raj Officer (DPRO)':
    case 'Block Development Officer (BDO)':
    case 'Assistant Development Officer':
      return 'district';
    case 'Department Officer':
    case 'Department Head':
    case 'Field Officer':
      return 'department';
    case 'Government Admin':
      return 'government-admin';
    default:
      return 'citizen';
  }
}

export function getRoleForDesignation(designation: Designation): UserRole {
  switch (designation) {
    case 'Citizen':
      return 'citizen';
    case 'Ward Member':
      return 'ward_member';
    case 'Gram Pradhan':
    case 'Gram Panchayat Secretary':
    case 'Panchayat Development Officer (PDO)':
      return 'gram_pradhan';
    case 'District Officer':
    case 'District Panchayati Raj Officer (DPRO)':
    case 'Block Development Officer (BDO)':
    case 'Assistant Development Officer':
      return 'district_officer';
    case 'Department Officer':
    case 'Department Head':
    case 'Field Officer':
      return 'department_officer';
    case 'Government Admin':
      return 'government_admin';
    default:
      return 'citizen';
  }
}

async function runAiAnalysis(
  description: string,
  additionalDetails: string = '',
  userCategory?: string,
  location?: { latitude: number; longitude: number; village?: string; ward?: string }
): Promise<any> {
  const fullText = `${description} ${additionalDetails}`.toLowerCase();

  const categoryKeywords: Record<ComplaintCategory, string[]> = {
    'Water Supply': ['water', 'pipe', 'leak', 'drinking', 'tap', 'handpump', 'jal', 'pani', 'borewell', 'पानी', 'पाइप', 'हैंडपंप', 'पेयजल', 'लीकेज', 'नल'],
    'Roads': ['road', 'pothole', 'asphalt', 'tar', 'bridge', 'pavement', 'accident', 'gaddha', 'sadak', 'सड़क', 'गड्ढा', 'मार्ग', 'खराब सड़क', 'दुर्घटना'],
    'Electricity': ['electricity', 'power', 'transformer', 'wire', 'spark', 'current', 'meter', 'bijli', 'voltage', 'बिजली', 'ट्रांसफार्मर', 'तार', 'करंट', 'शॉर्ट सर्किट', 'कटौती'],
    'Sanitation': ['toilet', 'sanitation', 'cleanliness', 'hygiene', 'filth', 'swachh', 'shauchalaya', 'gandagi', 'शौचालय', 'सफाई', 'गंदगी', 'स्वच्छता', 'दुर्गंध'],
    'Waste Management': ['garbage', 'trash', 'waste', 'dump', 'plastic', 'kachra', 'safai', 'कूड़ा', 'कचरा', 'डंपिंग', 'प्लास्टिक'],
    'Drainage': ['drain', 'drainage', 'gutter', 'overflow', 'waterlogging', 'naali', 'nala', 'jalbharaav', 'नाली', 'नाला', 'जलभराव', 'उफान'],
    'Street Lights': ['street light', 'light', 'lamp', 'darkness', 'bulb', 'solar light', 'batti', 'roshni', 'स्ट्रीट लाइट', 'बत्ती', 'अंधेरा', 'सोलर लाइट'],
    'Healthcare': ['hospital', 'doctor', 'medicine', 'phc', 'health', 'clinic', 'dawai', 'chikitsa', 'अस्पताल', 'डॉक्टर', 'दवाई', 'स्वास्थ्य', 'इलाज'],
    'Education': ['school', 'teacher', 'classroom', 'student', 'mid-day meal', 'anganwadi', 'shiksha', 'vidyalaya', 'स्कूल', 'शिक्षक', 'विद्यालय', 'आंगनवाड़ी', 'मध्याह्न भोजन'],
    'Agriculture': ['crop', 'farmer', 'fertilizer', 'kisan', 'seeds', 'mandi', 'irrigation', 'फसल', 'किसान', 'खाद', 'बीज', 'सिंचाई'],
    'Other': [],
  };

  let detectedCategory: ComplaintCategory = (userCategory as ComplaintCategory) || 'Roads';
  let highestScore = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let matchCount = 0;
    for (const kw of keywords) {
      if (fullText.includes(kw.toLowerCase())) matchCount += 1;
    }
    if (matchCount > highestScore) {
      highestScore = matchCount;
      detectedCategory = cat as ComplaintCategory;
    }
  }

  const confidence = Math.min(0.98, Math.max(0.72, 0.65 + highestScore * 0.08));

  const criticalKeywords = ['emergency', 'spark', 'fire', 'electrocution', 'accident', 'burst', 'poisonous', 'hospital', 'grave', 'urgent', 'खतरा', 'आग', 'करंट', 'दुर्घटना', 'गंभीर', 'तुरंत', 'विस्फोट'];
  const highKeywords = ['broken', 'overflow', 'major', 'deep', 'blocked', 'contaminated', 'foul', 'darkness', 'heavy', 'damage', 'खराब', 'टूटा', 'गड्ढा', 'गंदा पानी', 'उफान', 'अंधेरा'];

  let severity: SeverityLevel = 'Medium';
  if (criticalKeywords.some(kw => fullText.includes(kw))) severity = 'Critical';
  else if (highKeywords.some(kw => fullText.includes(kw))) severity = 'High';
  else if (fullText.length < 30) severity = 'Low';

  let priorityScore = 55;
  if (severity === 'Critical') priorityScore = 92;
  else if (severity === 'High') priorityScore = 78;
  else if (severity === 'Medium') priorityScore = 58;
  else priorityScore = 35;

  if (fullText.includes('school') || fullText.includes('hospital') || fullText.includes('main road') || fullText.includes('मुख्य')) {
    priorityScore = Math.min(99, priorityScore + 8);
  }

  let priorityLevel: PriorityLevel = 'Medium';
  if (priorityScore >= 85) priorityLevel = 'Critical';
  else if (priorityScore >= 70) priorityLevel = 'High';
  else if (priorityScore >= 50) priorityLevel = 'Medium';
  else priorityLevel = 'Low';

  let suggestedDepartment: DepartmentName = 'PWD / Road Infrastructure';
  let estimatedSlaHours = 48;

  const departments = await MySqlGovernanceService.getAllDepartments();
  const matchedDept = departments.find((d: any) => d.categoriesHandled?.includes(detectedCategory));
  if (matchedDept) {
    suggestedDepartment = matchedDept.name;
    estimatedSlaHours = matchedDept.defaultSlaHours;
    if (severity === 'Critical') estimatedSlaHours = Math.max(12, Math.round(estimatedSlaHours / 2));
  }

  let duplicateInfo = {
    isDuplicate: false,
    duplicateCount: 0,
    primaryComplaintId: undefined as string | undefined,
    similarComplaintIds: [] as string[],
    radiusMeters: 500,
    reason: 'No similar grievances found in this village cluster.',
  };

  const existingComplaints = await MongoComplaintService.getAllComplaints();
  if (location && location.latitude && location.longitude) {
    const nearby = existingComplaints.filter(c => {
      if (c.status === 'Closed') return false;
      if (c.category !== detectedCategory) return false;
      const dLat = Math.abs(c.location.latitude - location.latitude);
      const dLon = Math.abs(c.location.longitude - location.longitude);
      return dLat < 0.005 && dLon < 0.005;
    });

    if (nearby.length > 0) {
      duplicateInfo.isDuplicate = true;
      duplicateInfo.duplicateCount = nearby.length;
      duplicateInfo.primaryComplaintId = nearby[0].complaintId;
      duplicateInfo.similarComplaintIds = nearby.map(n => n.complaintId);
      duplicateInfo.radiusMeters = 500;
      duplicateInfo.reason = `${nearby.length} similar ${detectedCategory} report(s) registered in this vicinity.`;
      priorityScore = Math.min(98, priorityScore + nearby.length * 4);
    }
  }

  return {
    detectedCategory,
    categoryConfidence: Math.round(confidence * 100) / 100,
    severity,
    priorityLevel,
    priorityScore,
    suggestedDepartment,
    estimatedSlaHours,
    keyIssues: [
      `${detectedCategory} infrastructure disruption`,
      `Classified as ${priorityLevel} priority (${priorityScore}/100)`,
      `SLA assigned: ${estimatedSlaHours} hours`,
    ],
    aiRecommendation: `Immediate triage complete. Issue routed to ${suggestedDepartment}. Estimated SLA: ${estimatedSlaHours} hours.`,
    duplicateInfo,
  };
}

async function recordAuditLog(
  user: User | null,
  action: string,
  resource: string,
  details: string,
  ip: string = '127.0.0.1',
  status: 'SUCCESS' | 'WARNING' | 'DENIED' = 'SUCCESS'
) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user?.id || 'anonymous',
    userName: user?.name || 'System / Unauthenticated',
    userRole: user?.role || 'system',
    designation: user?.designation || 'System',
    action,
    resource,
    details,
    ipAddress: ip,
    timestamp: new Date().toISOString(),
    status,
  };
  await MongoComplaintService.addAuditLog(log);
  io.to('admin:all').emit('auditLog:new', log);
}

function broadcastComplaintUpdate(event: string, complaint: Complaint, actor?: User, extraData?: any) {
  const payload = {
    event,
    complaint,
    actor: actor ? { id: actor.id, name: actor.name, role: actor.role, designation: actor.designation } : undefined,
    extraData,
    timestamp: new Date().toISOString(),
  };

  io.to(`user:${complaint.citizenId}`).emit(event, payload);

  if (complaint.location.ward) {
    io.to(`ward:${complaint.location.ward}`).emit(event, payload);
  }

  if (complaint.location.village) {
    io.to(`panchayat:${complaint.location.village}`).emit(event, payload);
  }

  if (complaint.location.district) {
    io.to(`district:${complaint.location.district}`).emit(event, payload);
  }

  if (complaint.department) {
    io.to(`department:${complaint.department}`).emit(event, payload);
  }

  io.to('admin:all').emit(event, payload);
  io.emit('complaints:sync', { type: event, complaintId: complaint.complaintId });
}

async function createAndDispatchNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
  const newNotif: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await MongoComplaintService.addNotification(newNotif);

  if (newNotif.userId) {
    io.to(`user:${newNotif.userId}`).emit('notification:new', newNotif);
  }
  if (newNotif.targetJurisdiction?.ward) {
    io.to(`ward:${newNotif.targetJurisdiction.ward}`).emit('notification:new', newNotif);
  }
  if (newNotif.targetJurisdiction?.village) {
    io.to(`panchayat:${newNotif.targetJurisdiction.village}`).emit('notification:new', newNotif);
  }
  if (newNotif.targetJurisdiction?.district) {
    io.to(`district:${newNotif.targetJurisdiction.district}`).emit('notification:new', newNotif);
  }
  if (newNotif.targetJurisdiction?.department) {
    io.to(`department:${newNotif.targetJurisdiction.department}`).emit('notification:new', newNotif);
  }
  if (newNotif.targetRole === 'government_admin' || newNotif.targetPortal === 'government-admin') {
    io.to('admin:all').emit('notification:new', newNotif);
  }

  return newNotif;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-user-id']) {
    const userFound = await MySqlGovernanceService.findUserById(String(req.headers['x-user-id']));
    if (userFound) {
      req.user = userFound;
      return next();
    }
  }

  if (!token) {
    const users = await MySqlGovernanceService.getAllUsers();
    req.user = users[0];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await MySqlGovernanceService.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or revoked' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Government account suspended' });
    }
    req.user = user;
    next();
  } catch (err) {
    const match = token.match(/mock-token-(usr-[a-z0-9-]+)/);
    if (match) {
      const user = await MySqlGovernanceService.findUserById(match[1]);
      if (user) {
        req.user = user;
        return next();
      }
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(...allowedRoles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    if (req.user.role === 'government_admin') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      recordAuditLog(req.user, 'ACCESS_DENIED', req.originalUrl, `Attempted role violation: ${req.user.role}`, req.ip, 'DENIED');
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

export function authorizePortal(...allowedPortals: (PortalType | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    if (req.user.role === 'government_admin') return next();

    if (!req.user.portal || !allowedPortals.includes(req.user.portal as PortalType)) {
      recordAuditLog(req.user, 'PORTAL_ACCESS_DENIED', req.originalUrl, `Attempted portal violation: ${req.user.portal}`, req.ip, 'DENIED');
      return res.status(403).json({
        success: false,
        message: `Access denied. Your approved portal is /${req.user.portal}`,
      });
    }
    next();
  };
}

app.post('/api/auth/citizen/register', async (req, res) => {
  try {
    const { name, phone, email, password, language, areaType, state, district, block, village, ward } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full Name and Mobile Number are required.' });
    }

    const existing = await MySqlGovernanceService.findCitizen(phone);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A citizen account with this mobile number already exists. Please log in.' });
    }

    const newUser = await MySqlGovernanceService.createCitizen({
      name,
      phone,
      email,
      password,
      language,
      areaType,
      state,
      district,
      block,
      village,
      ward,
    });

    await recordAuditLog(newUser, 'CITIZEN_REGISTERED', newUser.id, `Citizen registered in MySQL: ${newUser.name} (${newUser.village})`, req.ip);

    const token = jwt.sign(
      { userId: newUser.id, role: 'citizen', portal: 'citizen', designation: 'Citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser,
      portal: 'citizen',
      redirectUrl: '/citizen/dashboard',
      message: 'Citizen account created successfully.',
    });
  } catch (err: any) {
    console.error('Citizen register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error registering citizen account' });
  }
});

app.post('/api/auth/citizen/login', async (req, res) => {
  try {
    const { phone, email } = req.body;

    let user: User | null = null;
    if (phone) {
      user = await MySqlGovernanceService.findCitizen(phone);
    } else if (email) {
      user = await MySqlGovernanceService.findCitizen(undefined, email);
    }

    if (!user && (phone === 'demo' || !phone)) {
      const allUsers = await MySqlGovernanceService.getAllUsers();
      user = allUsers.find(u => u.role === 'citizen' && u.status === 'active') || null;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Citizen account not found in MySQL database. Please verify mobile number or sign up.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This citizen account is suspended.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: 'citizen', portal: 'citizen', designation: 'Citizen' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAuditLog(user, 'CITIZEN_LOGIN', user.id, `Citizen authenticated: ${user.name}`, req.ip);

    res.json({
      success: true,
      token,
      user,
      portal: 'citizen',
      redirectUrl: '/citizen/dashboard',
      message: 'Logged in successfully.',
    });
  } catch (err: any) {
    console.error('Citizen login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

app.post('/api/auth/official/login', async (req, res) => {
  try {
    const { officialId } = req.body;

    if (!officialId) {
      return res.status(400).json({ success: false, message: 'Official Unique ID is required.' });
    }

    const user = await MySqlGovernanceService.findOfficialByOfficialId(officialId);

    if (!user || user.role === 'citizen') {
      return res.status(404).json({
        success: false,
        message: `Invalid Official ID: "${officialId}". Government credentials must be issued and provisioned in MySQL by the Government Admin.`,
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This government account has been suspended by the Government Administration.',
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your official account is pending formal administrative approval.',
      });
    }

    const determinedPortal = user.portal || getPortalForDesignation((user.designation as Designation) || 'Government Admin');
    const determinedRole = user.role || getRoleForDesignation((user.designation as Designation) || 'Government Admin');

    const token = jwt.sign(
      { userId: user.id, role: determinedRole, portal: determinedPortal, designation: user.designation },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAuditLog(user, 'OFFICIAL_LOGIN', `Official ID: ${user.officialId}`, `Official authenticated into /${determinedPortal}/dashboard`, req.ip);

    res.json({
      success: true,
      token,
      user: {
        ...user,
        portal: determinedPortal,
        role: determinedRole,
      },
      portal: determinedPortal,
      redirectUrl: `/${determinedPortal}/dashboard`,
      message: `Authenticated as ${user.designation} (${user.officialId}). Redirecting to /${determinedPortal}/dashboard.`,
    });
  } catch (err: any) {
    console.error('Official login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Official authentication failed' });
  }
});

// Generic login helper
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, email, officialId, portal } = req.body;

    let user: User | null = null;
    if (officialId) {
      user = await MySqlGovernanceService.findOfficialByOfficialId(officialId);
    } else if (phone) {
      user = await MySqlGovernanceService.findCitizen(phone);
    } else if (email) {
      user = await MySqlGovernanceService.findCitizen(undefined, email);
    }

    if (!user && portal) {
      const allUsers = await MySqlGovernanceService.getAllUsers();
      user = allUsers.find(u => u.portal === portal && u.status === 'active') || null;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with provided credentials in MySQL.' });
    }

    const determinedPortal = user.portal || getPortalForDesignation((user.designation as Designation) || 'Citizen');
    const token = jwt.sign(
      { userId: user.id, role: user.role, portal: determinedPortal, designation: user.designation },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { ...user, portal: determinedPortal },
      portal: determinedPortal,
      redirectUrl: `/${determinedPortal}/dashboard`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login error' });
  }
});

app.get('/api/auth/me', authenticateUser, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

app.post('/api/auth/demo-switch', async (req, res) => {
  try {
    const { portal, designation } = req.body;
    const allUsers = await MySqlGovernanceService.getAllUsers();
    let targetUser = allUsers.find(u => (portal && u.portal === portal) || (designation && u.designation === designation));
    if (!targetUser) targetUser = allUsers[0];

    const token = jwt.sign(
      { userId: targetUser.id, role: targetUser.role, portal: targetUser.portal, designation: targetUser.designation },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAuditLog(targetUser, 'DEMO_SWITCH', `Portal: /${targetUser.portal}`, `Switched to ${targetUser.name}`, req.ip);
    res.json({ success: true, token, user: targetUser, portal: targetUser.portal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/citizen/complaints', authenticateUser, authorizeRoles('citizen'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const all = await MongoComplaintService.getAllComplaints();
  const myComplaints = all.filter(c => c.citizenId === user.id || c.citizenPhone === user.phone);
  res.json({ success: true, data: myComplaints });
});

app.post('/api/citizen/complaints', authenticateUser, authorizeRoles('citizen'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { title, description, additionalDetails, category, location, imageUrl, audioRecordingUrl, voiceLanguageUsed } = req.body;

    if (!description || !location) {
      return res.status(400).json({ success: false, message: 'Description and location are required' });
    }

    const aiResult = await runAiAnalysis(description, additionalDetails, category, location);
    const serial = Math.floor(10000 + Math.random() * 90000);
    const complaintId = `GS-2026-${serial}`;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + aiResult.estimatedSlaHours * 3600000).toISOString();

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      complaintId,
      citizenId: user.id,
      citizenName: user.name,
      citizenPhone: user.phone,
      category: aiResult.detectedCategory,
      title: title || `${aiResult.detectedCategory} issue in ${location.village || user.village}, ${location.ward || user.ward}`,
      description,
      additionalDetails,
      audioRecordingUrl,
      voiceLanguageUsed: voiceLanguageUsed || 'hi',
      location: {
        state: location.state || user.state || 'Uttar Pradesh',
        district: location.district || user.district || 'Varanasi',
        block: location.block || user.block || 'Kashi Vidyapeeth',
        village: location.village || user.village || 'Rampur Gram Panchayat',
        ward: location.ward || user.ward || 'Ward 1',
        landmark: location.landmark,
        latitude: Number(location.latitude) || 25.3176,
        longitude: Number(location.longitude) || 82.9739,
      },
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      severity: aiResult.severity,
      priority: aiResult.priorityLevel,
      priorityScore: aiResult.priorityScore,
      department: aiResult.suggestedDepartment,
      assignedOfficer: 'Pending Auto-Assignment',
      status: 'Submitted',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaHours: aiResult.estimatedSlaHours,
      slaDeadline,
      slaBreached: false,
      isEscalated: aiResult.priorityScore >= 90,
      escalationReason: aiResult.priorityScore >= 90 ? 'Automated high priority surge flag.' : undefined,
      reopenedCount: 0,
      aiAnalysis: aiResult,
      areaType: location.ward?.toLowerCase().includes('urban') ? 'urban' : 'rural',
      timeline: [
        {
          status: 'Submitted',
          timestamp: now.toISOString(),
          title: 'Complaint Registered in MongoDB',
          description: `Grievance submitted by ${user.name} via Citizen Portal. Voice input: ${voiceLanguageUsed === 'en' ? 'English' : 'Hindi'}.`,
          updatedBy: user.name,
          role: 'Citizen',
        },
        {
          status: 'AI Analyzed',
          timestamp: new Date(now.getTime() + 1000).toISOString(),
          title: `AI Analysis: ${aiResult.detectedCategory} (Priority ${aiResult.priorityScore}/100)`,
          description: `Auto-routed to ${aiResult.suggestedDepartment} with ${aiResult.estimatedSlaHours}h SLA.`,
          updatedBy: 'GramSewa AI Engine',
        },
      ],
    };

    await MongoComplaintService.createComplaint(newComplaint);

    broadcastComplaintUpdate('complaint:created', newComplaint, user);

    await createAndDispatchNotification({
      targetJurisdiction: {
        district: newComplaint.location.district,
        village: newComplaint.location.village,
        ward: newComplaint.location.ward,
        department: newComplaint.department,
      },
      title: `New Grievance: ${newComplaint.complaintId} (${newComplaint.category})`,
      message: `${newComplaint.title} in ${newComplaint.location.village}. Priority: ${newComplaint.priority}`,
      type: 'complaint_created',
      complaintId: newComplaint.complaintId,
    });

    await recordAuditLog(user, 'CREATE_COMPLAINT', newComplaint.complaintId, `Registered new grievance: ${newComplaint.title}`, req.ip);

    res.status(201).json({ success: true, data: newComplaint });
  } catch (err: any) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/citizen/complaints/:id/verify', authenticateUser, authorizeRoles('citizen'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { verificationStatus, citizenComments, feedbackData } = req.body;
    const now = new Date().toISOString();

    const updateFields: Partial<Complaint> = {
      verification: {
        verifiedAt: now,
        verifiedBy: user.name,
        status: verificationStatus,
        citizenComments,
      },
      updatedAt: now,
    };

    if (feedbackData) {
      updateFields.feedback = {
        rating: Number(feedbackData.rating) || 5,
        satisfaction: feedbackData.satisfaction || 'very_satisfied',
        comments: feedbackData.comments || '',
        responseTimeRating: Number(feedbackData.responseTimeRating) || 5,
        wasCompletelyResolved: verificationStatus === 'completely_resolved',
        createdAt: now,
      };
    }

    const updatedTimeline = [...complaint.timeline];

    if (verificationStatus === 'completely_resolved') {
      updateFields.status = 'Closed';
      updatedTimeline.push({
        status: 'Closed',
        timestamp: now,
        title: 'Citizen Verified & Closed',
        description: citizenComments || 'Citizen confirmed problem is completely resolved on ground.',
        updatedBy: user.name,
        role: 'Citizen',
      });
      updateFields.timeline = updatedTimeline;
      const updated = await MongoComplaintService.updateComplaint(complaint.id, updateFields);
      broadcastComplaintUpdate('complaint:resolved', updated!, user);
    } else {
      updateFields.status = 'Reopened';
      updateFields.reopenedCount = (complaint.reopenedCount || 0) + 1;
      updateFields.isEscalated = true;
      updateFields.escalationReason = `Citizen verification rejected: ${citizenComments || 'Problem not fixed on ground'}`;
      updatedTimeline.push({
        status: 'Reopened',
        timestamp: now,
        title: '⚠ Grievance Reopened by Citizen',
        description: `Rework ordered: ${citizenComments || 'Incomplete resolution.'}`,
        updatedBy: user.name,
        role: 'Citizen',
      });
      updateFields.timeline = updatedTimeline;
      const updated = await MongoComplaintService.updateComplaint(complaint.id, updateFields);
      broadcastComplaintUpdate('complaint:reopened', updated!, user);

      await createAndDispatchNotification({
        targetJurisdiction: {
          district: complaint.location.district,
          village: complaint.location.village,
          department: complaint.department,
        },
        title: `⚠ Case Reopened: ${complaint.complaintId}`,
        message: `Citizen ${user.name} reported issue still persists. Rework required.`,
        type: 'escalation',
        complaintId: complaint.complaintId,
      });
    }

    await recordAuditLog(user, 'VERIFY_COMPLAINT', complaint.complaintId, `Verification status: ${verificationStatus}`, req.ip);
    const finalComplaint = await MongoComplaintService.findComplaintById(complaint.id);
    res.json({ success: true, data: finalComplaint });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/citizen/complaints/:id/reopen', authenticateUser, authorizeRoles('citizen'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { reason } = req.body;
    const now = new Date().toISOString();
    const updatedTimeline = [
      ...complaint.timeline,
      {
        status: 'Reopened' as ComplaintStatus,
        timestamp: now,
        title: 'Grievance Reopened',
        description: reason || 'Citizen requested case reopening.',
        updatedBy: user.name,
        role: 'Citizen',
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      status: 'Reopened',
      reopenedCount: (complaint.reopenedCount || 0) + 1,
      isEscalated: true,
      escalationReason: reason || 'Citizen requested case reopening.',
      timeline: updatedTimeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:reopened', updated!, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// 2. Ward Member Portal APIs: /api/ward/*
// ----------------------------------------------------
app.get('/api/ward/complaints', authenticateUser, authorizeRoles('ward_member', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const all = await MongoComplaintService.getAllComplaints();
  let wardComplaints = all;
  if (user.role === 'ward_member' && user.ward) {
    wardComplaints = all.filter(c => c.location.ward === user.ward);
  }
  res.json({ success: true, data: wardComplaints });
});

app.post('/api/ward/complaints/:id/review', authenticateUser, authorizeRoles('ward_member', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (user.role === 'ward_member' && complaint.location.ward !== user.ward) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only review complaints in your assigned ward' });
    }

    const { remarks, status, forwardToDept } = req.body;
    const now = new Date().toISOString();

    const updateData: Partial<Complaint> = { updatedAt: now };
    if (status) updateData.status = status;
    if (forwardToDept) updateData.department = forwardToDept;

    const timeline = [
      ...complaint.timeline,
      {
        status: (status || complaint.status) as ComplaintStatus,
        timestamp: now,
        title: `Reviewed by Ward Member (${user.ward})`,
        description: remarks || `Reviewed and noted by ${user.name}`,
        updatedBy: user.name,
        role: 'Ward Member',
      },
    ];
    updateData.timeline = timeline;

    const updated = await MongoComplaintService.updateComplaint(complaint.id, updateData);
    broadcastComplaintUpdate('complaint:updated', updated!, user);
    await recordAuditLog(user, 'WARD_REVIEW', complaint.complaintId, `Reviewed by Ward Member: ${remarks}`, req.ip);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/ward/complaints/:id/escalate', authenticateUser, authorizeRoles('ward_member', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { reason } = req.body;
    const now = new Date().toISOString();
    const timeline = [
      ...complaint.timeline,
      {
        status: complaint.status,
        timestamp: now,
        title: '⚠ Escalated by Ward Member',
        description: reason || 'Escalated to Gram Pradhan / District Cell for expedited intervention.',
        updatedBy: user.name,
        role: 'Ward Member',
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      isEscalated: true,
      escalationReason: reason || 'Escalated by Ward Member to District Authority',
      timeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:escalated', updated!, user);
    await createAndDispatchNotification({
      targetJurisdiction: { district: complaint.location.district, village: complaint.location.village },
      title: `⚠ Ward Escalation: ${complaint.complaintId}`,
      message: `${user.name} (${user.ward}) escalated: ${reason}`,
      type: 'escalation',
      complaintId: complaint.complaintId,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/panchayat/complaints', authenticateUser, authorizeRoles('gram_pradhan', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const all = await MongoComplaintService.getAllComplaints();
  let list = all;
  if (user.role === 'gram_pradhan' && user.village && user.village !== 'All Panchayats') {
    list = all.filter(c => c.location.village.toLowerCase().includes(user.village.toLowerCase()));
  }
  res.json({ success: true, data: list });
});

app.post('/api/panchayat/complaints/:id/forward', authenticateUser, authorizeRoles('gram_pradhan', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { department, remarks, assignedOfficer } = req.body;
    const now = new Date().toISOString();

    const updateData: Partial<Complaint> = {
      status: 'Assigned',
      department: department || complaint.department,
      assignedOfficer: assignedOfficer || complaint.assignedOfficer,
      updatedAt: now,
    };

    updateData.timeline = [
      ...complaint.timeline,
      {
        status: 'Assigned',
        timestamp: now,
        title: `Forwarded to ${department || 'Department'}`,
        description: remarks || `Dispatched by Gram Pradhan ${user.name} to line department.`,
        updatedBy: user.name,
        role: 'Gram Pradhan',
        department: department || complaint.department,
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, updateData);
    broadcastComplaintUpdate('complaint:forwarded', updated!, user);
    await createAndDispatchNotification({
      targetJurisdiction: { department: updateData.department, district: complaint.location.district },
      title: `Assigned Task: ${complaint.complaintId}`,
      message: `Forwarded by Gram Pradhan to ${updateData.department}.`,
      type: 'assigned',
      complaintId: complaint.complaintId,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/panchayat/complaints/:id/escalate', authenticateUser, authorizeRoles('gram_pradhan', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { reason } = req.body;
    const now = new Date().toISOString();
    const timeline = [
      ...complaint.timeline,
      {
        status: complaint.status,
        timestamp: now,
        title: '⚠ Escalated to Block/District Head',
        description: reason || 'Escalated for immediate senior intervention.',
        updatedBy: user.name,
        role: 'Gram Pradhan',
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      isEscalated: true,
      escalationReason: reason || 'Escalated by Gram Pradhan to BDO/DPRO',
      timeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:escalated', updated!, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/district/complaints', authenticateUser, authorizeRoles('district_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const all = await MongoComplaintService.getAllComplaints();
  let list = all;
  if (user.role === 'district_officer' && user.district && user.district !== 'All Districts') {
    list = all.filter(c => c.location.district.toLowerCase() === user.district.toLowerCase());
  }
  res.json({ success: true, data: list });
});

app.post('/api/district/complaints/:id/reassign', authenticateUser, authorizeRoles('district_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { department, priority, assignedOfficer, remarks } = req.body;
    const now = new Date().toISOString();

    const updateData: Partial<Complaint> = {
      department: department || complaint.department,
      priority: priority || complaint.priority,
      assignedOfficer: assignedOfficer || complaint.assignedOfficer,
      updatedAt: now,
    };

    updateData.timeline = [
      ...complaint.timeline,
      {
        status: complaint.status,
        timestamp: now,
        title: `District Administration Reassignment: ${department}`,
        description: remarks || `Reassigned by District Cell (${user.name}) with Priority: ${updateData.priority}.`,
        updatedBy: user.name,
        role: 'District Officer',
        department: updateData.department,
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, updateData);
    broadcastComplaintUpdate('complaint:assigned', updated!, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/department/complaints', authenticateUser, authorizeRoles('department_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const all = await MongoComplaintService.getAllComplaints();
  let list = all;
  if (user.role === 'department_officer' && user.department) {
    list = all.filter(c => c.department === user.department);
  }
  res.json({ success: true, data: list });
});

app.post('/api/department/complaints/:id/accept', authenticateUser, authorizeRoles('department_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const now = new Date().toISOString();
    const timeline = [
      ...complaint.timeline,
      {
        status: 'Accepted' as ComplaintStatus,
        timestamp: now,
        title: 'Work Order Accepted by Department',
        description: `Accepted by ${user.name} (${user.department || complaint.department}). Technical squad assigned.`,
        updatedBy: user.name,
        role: 'Department Officer',
        department: user.department || complaint.department,
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      status: 'Accepted',
      assignedOfficer: user.name,
      timeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:updated', updated!, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/department/complaints/:id/work', authenticateUser, authorizeRoles('department_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { workNotes } = req.body;
    const now = new Date().toISOString();
    const timeline = [
      ...complaint.timeline,
      {
        status: 'Work in Progress' as ComplaintStatus,
        timestamp: now,
        title: 'Field Work Initiated',
        description: workNotes || 'Repair crew deployed on ground with materials.',
        updatedBy: user.name,
        role: 'Department Officer',
        department: user.department || complaint.department,
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      status: 'Work in Progress',
      timeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:updated', updated!, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/department/complaints/:id/resolve', authenticateUser, authorizeRoles('department_officer', 'government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const complaint = await MongoComplaintService.findComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { resolutionDescription, evidenceImageUrl, actionTaken } = req.body;
    const now = new Date().toISOString();

    const timeline = [
      ...complaint.timeline,
      {
        status: 'Resolved' as ComplaintStatus,
        timestamp: now,
        title: 'Marked Resolved by Department',
        description: resolutionDescription || 'Work completed. Dispatched for citizen on-site verification.',
        updatedBy: user.name,
        role: 'Department Officer',
        department: user.department || complaint.department,
        evidenceImageUrl,
      },
    ];

    const updated = await MongoComplaintService.updateComplaint(complaint.id, {
      status: 'Resolved',
      resolution: {
        resolvedAt: now,
        resolvedBy: user.name,
        resolutionDescription: resolutionDescription || 'Work completed as per departmental technical guidelines.',
        evidenceImageUrl: evidenceImageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        actionTaken: actionTaken || 'Field repairs executed on ground.',
      },
      timeline,
      updatedAt: now,
    });

    broadcastComplaintUpdate('complaint:resolved', updated!, user);

    await createAndDispatchNotification({
      userId: complaint.citizenId,
      targetRole: 'citizen',
      targetPortal: 'citizen',
      title: `Grievance Resolved: ${complaint.complaintId}`,
      message: `${complaint.department} completed repair. Please inspect and confirm resolution.`,
      type: 'verification_needed',
      complaintId: complaint.complaintId,
    });

    await recordAuditLog(user, 'RESOLVE_COMPLAINT', complaint.complaintId, `Marked resolved by ${user.name}`, req.ip);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/government-admin/users', authenticateUser, authorizeRoles('government_admin'), async (req, res) => {
  const users = await MySqlGovernanceService.getAllUsers();
  res.json({ success: true, data: users });
});

app.post('/api/government-admin/officials/create', authenticateUser, authorizeRoles('government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      officialId,
      phone,
      email,
      designation,
      department,
      state,
      district,
      block,
      village,
      ward,
      password,
      status,
    } = req.body;

    if (!name || !designation) {
      return res.status(400).json({ success: false, message: 'Full Name and Designation are required.' });
    }

    const newOfficial = await MySqlGovernanceService.createOfficial(
      {
        name,
        officialId,
        phone,
        email,
        designation,
        department,
        state,
        district,
        block,
        village,
        ward,
        password,
        status,
      },
      req.user?.id
    );

    await recordAuditLog(
      req.user!,
      'PROVISION_OFFICIAL_ACCOUNT',
      newOfficial.officialId || newOfficial.id,
      `Admin created official account in MySQL for ${newOfficial.name} (${newOfficial.designation}) with ID ${newOfficial.officialId}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      data: newOfficial,
      message: `Government official account created in MySQL with Official ID: ${newOfficial.officialId}`,
    });
  } catch (err: any) {
    console.error('Provision official error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/government-admin/users', authenticateUser, authorizeRoles('government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, officialId, phone, email, designation, department, state, district, block, village, ward, password, status } = req.body;
    if (!name || !designation) {
      return res.status(400).json({ success: false, message: 'Full Name and Designation are required.' });
    }

    const newOfficial = await MySqlGovernanceService.createOfficial(
      { name, officialId, phone, email, designation, department, state, district, block, village, ward, password, status },
      req.user?.id
    );

    res.status(201).json({ success: true, data: newOfficial });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/government-admin/users/:id/approve', authenticateUser, authorizeRoles('government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userToApprove = await MySqlGovernanceService.updateUserStatus(req.params.id, 'active');
    if (!userToApprove) return res.status(404).json({ success: false, message: 'User not found in MySQL' });

    await recordAuditLog(req.user!, 'APPROVE_USER', userToApprove.id, `Approved account for ${userToApprove.name} (${userToApprove.designation})`, req.ip);
    io.to(`user:${userToApprove.id}`).emit('account:status', { status: 'active' });

    res.json({ success: true, data: userToApprove, message: 'Government officer account approved successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/government-admin/users/:id/suspend', authenticateUser, authorizeRoles('government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userToSuspend = await MySqlGovernanceService.updateUserStatus(req.params.id, 'suspended');
    if (!userToSuspend) return res.status(404).json({ success: false, message: 'User not found in MySQL' });

    await recordAuditLog(req.user!, 'SUSPEND_USER', userToSuspend.id, `Suspended account for ${userToSuspend.name}`, req.ip, 'WARNING');
    io.to(`user:${userToSuspend.id}`).emit('account:status', { status: 'suspended' });

    res.json({ success: true, data: userToSuspend, message: 'Government officer account suspended.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/government-admin/users/:id/reactivate', authenticateUser, authorizeRoles('government_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userToActivate = await MySqlGovernanceService.updateUserStatus(req.params.id, 'active');
    if (!userToActivate) return res.status(404).json({ success: false, message: 'User not found in MySQL' });

    await recordAuditLog(req.user!, 'REACTIVATE_USER', userToActivate.id, `Reactivated account for ${userToActivate.name}`, req.ip);
    io.to(`user:${userToActivate.id}`).emit('account:status', { status: 'active' });

    res.json({ success: true, data: userToActivate, message: 'Account reactivated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/government-admin/audit-logs', authenticateUser, authorizeRoles('government_admin'), async (req, res) => {
  const logs = await MongoComplaintService.getAuditLogs();
  res.json({ success: true, data: logs });
});

app.get('/api/government-admin/sla-rules', authenticateUser, authorizeRoles('government_admin'), async (req, res) => {
  const rules = await MySqlGovernanceService.getSlaRules();
  res.json({ success: true, data: rules });
});

app.get('/api/analytics/live', async (req, res) => {
  const live = await MongoComplaintService.getLiveAnalytics();
  res.json({ success: true, data: live });
});

app.get('/api/analytics/categories', async (req, res) => {
  const complaints = await MongoComplaintService.getAllComplaints();
  const counts: Record<string, number> = {};
  for (const c of complaints) counts[c.category] = (counts[c.category] || 0) + 1;
  const result = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / (complaints.length || 1)) * 100),
  }));
  res.json({ success: true, data: result });
});

app.get('/api/analytics/departments', async (req, res) => {
  const departments = await MySqlGovernanceService.getAllDepartments();
  const complaints = await MongoComplaintService.getAllComplaints();

  const deptStats = departments.map(d => {
    const deptComplaints = complaints.filter(c => c.department === d.name);
    const assigned = deptComplaints.length;
    const inProgress = deptComplaints.filter(c => ['Accepted', 'Work in Progress'].includes(c.status)).length;
    const resolved = deptComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const breached = deptComplaints.filter(c => c.slaBreached).length;
    const resolutionRate = assigned > 0 ? Math.round((resolved / assigned) * 100) : 100;
    const slaCompliance = assigned > 0 ? Math.round(((assigned - breached) / assigned) * 100) : 100;

    return {
      department: d.name,
      assigned,
      inProgress,
      resolved,
      slaBreached: breached,
      resolutionRate,
      slaCompliance,
    };
  });
  res.json({ success: true, data: deptStats });
});

app.get('/api/analytics/hotspots', async (req, res) => {
  const hotspots = await MongoComplaintService.getHotspotPredictions();
  res.json({ success: true, data: hotspots });
});

app.get('/api/complaints', async (req, res) => {
  const complaints = await MongoComplaintService.getAllComplaints();
  res.json({ success: true, data: complaints });
});

app.get('/api/departments', async (req, res) => {
  const departments = await MySqlGovernanceService.getAllDepartments();
  res.json({ success: true, data: departments });
});

app.get('/api/notifications', async (req, res) => {
  const notifications = await MongoComplaintService.getNotifications();
  res.json({ success: true, data: notifications });
});

app.get('/api/analytics/overview', async (req, res) => {
  const live = await MongoComplaintService.getLiveAnalytics();
  res.json({ success: true, data: live });
});

app.post('/api/ai/analyze-complaint', async (req, res) => {
  const { description, additionalDetails, category, location } = req.body;
  const analysis = await runAiAnalysis(description, additionalDetails, category, location);
  res.json({ success: true, data: analysis });
});

app.post('/api/notifications/read-all', async (req, res) => {
  await MongoComplaintService.markAllNotificationsRead();
  res.json({ success: true });
});

io.on('connection', socket => {
  socket.emit('connection:status', { connected: true, timestamp: new Date().toISOString() });

  socket.on('authenticate', async (authData: { token?: string; userId?: string; role?: string; designation?: string; jurisdiction?: any }) => {
    let user: User | null = null;
    if (authData.token) {
      try {
        const decoded = jwt.verify(authData.token, JWT_SECRET) as any;
        user = await MySqlGovernanceService.findUserById(decoded.userId);
      } catch (e) {
      }
    }
    if (!user && authData.userId) {
      user = await MySqlGovernanceService.findUserById(authData.userId);
    }

    if (user) {
      socket.join(`user:${user.id}`);
      socket.join(`role:${user.role}`);
      socket.join(`portal:${user.portal}`);

      if (user.role === 'government_admin') {
        socket.join('admin:all');
      }
      if (user.ward) socket.join(`ward:${user.ward}`);
      if (user.village) socket.join(`panchayat:${user.village}`);
      if (user.district) socket.join(`district:${user.district}`);
      if (user.department) socket.join(`department:${user.department}`);

      socket.emit('authenticated', {
        success: true,
        user: { id: user.id, name: user.name, portal: user.portal, role: user.role },
      });
    }
  });

  socket.on('disconnect', () => {
  });
});

setInterval(async () => {
  const now = Date.now();
  let changed = false;
  const complaints = await MongoComplaintService.getAllComplaints();

  for (const c of complaints) {
    if (['Resolved', 'Closed'].includes(c.status)) continue;

    const deadline = new Date(c.slaDeadline).getTime();
    const remainingMs = deadline - now;

    if (remainingMs <= 0 && !c.slaBreached) {
      c.slaBreached = true;
      c.isEscalated = true;
      c.escalationReason = 'Automatic SLA Breach Escalation to District Authority.';
      c.timeline.push({
        status: c.status,
        timestamp: new Date().toISOString(),
        title: '🔴 SLA BREACHED - Auto-Escalation Dispatched',
        description: `Overdue SLA (${c.slaHours} hours). Auto-notified District Officer and Department Head.`,
        updatedBy: 'GramSewa SLA Engine',
      });
      changed = true;

      await MongoComplaintService.updateComplaint(c.id, {
        slaBreached: true,
        isEscalated: true,
        escalationReason: c.escalationReason,
        timeline: c.timeline,
      });

      broadcastComplaintUpdate('sla:breached', c);
      await createAndDispatchNotification({
        targetJurisdiction: { district: c.location.district, department: c.department },
        title: `🔴 SLA Breached: ${c.complaintId}`,
        message: `${c.title} has exceeded resolution SLA. Escalated to District Authority.`,
        type: 'sla_breached',
        complaintId: c.complaintId,
      });
    }
  }

  if (changed) {
    io.emit('analytics:updated', { timestamp: new Date().toISOString() });
  }
}, 25000);

async function startServer() {
  await initDualDatabases();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[GramSewa Multi-Portal Server] Live on http://localhost:${PORT}`);
  });
}

startServer();
