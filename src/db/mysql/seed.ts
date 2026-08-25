import {
  sequelize,
} from './connection';
import {
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  StateModel,
  DistrictModel,
  BlockModel,
  GramPanchayatModel,
  VillageModel,
  UrbanLocalBodyModel,
  WardModel,
  DepartmentModel,
  DesignationModel,
  UserModel,
  GovernmentOfficialModel,
  JurisdictionModel,
  SlaConfigurationModel,
} from './models';

export async function seedMySqlData() {
  await sequelize.sync({ force: true });
  console.log('[MySQL Relational DB] Relational schema synchronized with constraints and foreign keys.');

  const roles = await RoleModel.bulkCreate([
    { role_code: 'citizen', name: 'Citizen', description: 'Village and Urban Citizen with Grievance Lodging privileges' },
    { role_code: 'ward_member', name: 'Ward Member', description: 'Ward-level elected representative' },
    { role_code: 'gram_pradhan', name: 'Gram Pradhan', description: 'Panchayat President & Executive Head' },
    { role_code: 'district_officer', name: 'District Officer', description: 'District Magistrate / DPRO / BDO Administrative Level' },
    { role_code: 'department_officer', name: 'Department Officer', description: 'Line Department Technical Execution Engineers' },
    { role_code: 'government_admin', name: 'Government Admin', description: 'Apex Governance & User Provisioning Authority' },
  ]);

  const roleMap = new Map(roles.map(r => [r.role_code, r.id]));

  const permissions = await PermissionModel.bulkCreate([
    { permission_code: 'COMPLAINT_CREATE', name: 'Create Grievance', resource: 'complaints', action: 'create' },
    { permission_code: 'COMPLAINT_READ_OWN', name: 'Read Own Grievance', resource: 'complaints', action: 'read_own' },
    { permission_code: 'COMPLAINT_READ_JURISDICTION', name: 'Read Jurisdiction Grievance', resource: 'complaints', action: 'read_jurisdiction' },
    { permission_code: 'COMPLAINT_REVIEW_WARD', name: 'Ward Review & Note', resource: 'complaints', action: 'review_ward' },
    { permission_code: 'COMPLAINT_FORWARD_PRADHAN', name: 'Forward to Dept', resource: 'complaints', action: 'forward' },
    { permission_code: 'COMPLAINT_REASSIGN_DISTRICT', name: 'District Reassignment', resource: 'complaints', action: 'reassign' },
    { permission_code: 'COMPLAINT_WORK_DEPT', name: 'Work in Progress & Resolve', resource: 'complaints', action: 'execute' },
    { permission_code: 'COMPLAINT_VERIFY_CITIZEN', name: 'Citizen On-Ground Verification', resource: 'complaints', action: 'verify' },
    { permission_code: 'OFFICIAL_PROVISION', name: 'Provision Official Account', resource: 'officials', action: 'manage' },
    { permission_code: 'SLA_CONFIG_MANAGE', name: 'Manage SLA Rules', resource: 'sla', action: 'manage' },
    { permission_code: 'AUDIT_LOG_VIEW', name: 'View Audit Logs', resource: 'audit', action: 'read' },
  ]);

  const rolePermissions: any[] = [];
  const adminRoleId = roleMap.get('government_admin')!;
  permissions.forEach(p => rolePermissions.push({ role_id: adminRoleId, permission_id: p.id }));

  const citizenRoleId = roleMap.get('citizen')!;
  const cCreate = permissions.find(p => p.permission_code === 'COMPLAINT_CREATE')!;
  const cReadOwn = permissions.find(p => p.permission_code === 'COMPLAINT_READ_OWN')!;
  const cVerify = permissions.find(p => p.permission_code === 'COMPLAINT_VERIFY_CITIZEN')!;
  rolePermissions.push(
    { role_id: citizenRoleId, permission_id: cCreate.id },
    { role_id: citizenRoleId, permission_id: cReadOwn.id },
    { role_id: citizenRoleId, permission_id: cVerify.id }
  );

  await RolePermissionModel.bulkCreate(rolePermissions);

  const upState = await StateModel.create({
    state_code: 'UP',
    name: 'Uttar Pradesh',
  });

  const varanasiDistrict = await DistrictModel.create({
    district_code: 'DIST-VARANASI-01',
    state_id: upState.id,
    name: 'Varanasi',
  });

  const kashiBlock = await BlockModel.create({
    block_code: 'BLK-KASHI-01',
    district_id: varanasiDistrict.id,
    name: 'Kashi Vidyapeeth',
  });

  const rampurGp = await GramPanchayatModel.create({
    gp_code: 'GP-RAMPUR-01',
    block_id: kashiBlock.id,
    name: 'Rampur Gram Panchayat',
  });

  const sundarpurGp = await GramPanchayatModel.create({
    gp_code: 'GP-SUNDARPUR-02',
    block_id: kashiBlock.id,
    name: 'Sundarpur Gram Panchayat',
  });

  const belurGp = await GramPanchayatModel.create({
    gp_code: 'GP-BELUR-03',
    block_id: kashiBlock.id,
    name: 'Belur Gram Panchayat',
  });

  const kalyanpurGp = await GramPanchayatModel.create({
    gp_code: 'GP-KALYANPUR-04',
    block_id: kashiBlock.id,
    name: 'Kalyanpur Gram Panchayat',
  });

  const rampurVillage = await VillageModel.create({
    village_code: 'VIL-RAMPUR-01',
    gp_id: rampurGp.id,
    name: 'Rampur Gram Panchayat',
  });

  const sundarpurVillage = await VillageModel.create({
    village_code: 'VIL-SUNDARPUR-02',
    gp_id: sundarpurGp.id,
    name: 'Sundarpur Gram Panchayat',
  });

  const belurVillage = await VillageModel.create({
    village_code: 'VIL-BELUR-03',
    gp_id: belurGp.id,
    name: 'Belur Gram Panchayat',
  });

  const kalyanpurVillage = await VillageModel.create({
    village_code: 'VIL-KALYANPUR-04',
    gp_id: kalyanpurGp.id,
    name: 'Kalyanpur Gram Panchayat',
  });

  // Urban Local Body
  const vmcUlb = await UrbanLocalBodyModel.create({
    ulb_code: 'ULB-VMC-01',
    district_id: varanasiDistrict.id,
    name: 'Varanasi Municipal Corporation',
    type: 'Municipal Corporation',
  });

  // Wards (Rural & Urban)
  const ward1 = await WardModel.create({ ward_code: 'WRD-RAMPUR-01', ward_number: '1', village_id: rampurVillage.id, ulb_id: null, name: 'Ward 1' });
  const ward2 = await WardModel.create({ ward_code: 'WRD-RAMPUR-02', ward_number: '2', village_id: rampurVillage.id, ulb_id: null, name: 'Ward 2' });
  const ward3 = await WardModel.create({ ward_code: 'WRD-RAMPUR-03', ward_number: '3', village_id: rampurVillage.id, ulb_id: null, name: 'Ward 3' });
  const ward4 = await WardModel.create({ ward_code: 'WRD-RAMPUR-04', ward_number: '4', village_id: rampurVillage.id, ulb_id: null, name: 'Ward 4' });
  const ward5 = await WardModel.create({ ward_code: 'WRD-RAMPUR-05', ward_number: '5', village_id: rampurVillage.id, ulb_id: null, name: 'Ward 5' });
  const wardUrban1 = await WardModel.create({ ward_code: 'WRD-VMC-101', ward_number: '101', village_id: null, ulb_id: vmcUlb.id, name: 'Urban Ward 101' });

  const depts = await DepartmentModel.bulkCreate([
    {
      department_code: 'DEPT-WATER-01',
      name: 'Jal Jeevan & Water Department',
      name_hi: 'जल जीवन एवं जलापूर्ति विभाग',
      head_officer: 'Er. R.K. Mishra (Superintending Engineer)',
      contact_number: '1800-180-5678',
      categories_handled: JSON.stringify(['Water Supply']),
      default_sla_hours: 24,
      active_staff_count: 18,
    },
    {
      department_code: 'DEPT-PWD-02',
      name: 'PWD / Road Infrastructure',
      name_hi: 'लोक निर्माण एवं सड़क अवसंरचना विभाग',
      head_officer: 'Er. S.K. Sharma (Executive Engineer)',
      contact_number: '1800-180-4321',
      categories_handled: JSON.stringify(['Roads', 'Drainage']),
      default_sla_hours: 48,
      active_staff_count: 24,
    },
    {
      department_code: 'DEPT-ELEC-03',
      name: 'Rural Electricity',
      name_hi: 'ग्रामीण विद्युत वितरण निगम (DISCOM)',
      head_officer: 'Er. M.K. Verma (Sub-Divisional Officer)',
      contact_number: '1912',
      categories_handled: JSON.stringify(['Electricity', 'Street Lights']),
      default_sla_hours: 18,
      active_staff_count: 14,
    },
    {
      department_code: 'DEPT-SWACHH-04',
      name: 'Swachh Bharat & Sanitation',
      name_hi: 'स्वच्छ भारत एवं स्वच्छता मिशन',
      head_officer: 'Dr. Anand Kumar (District Sanitation Officer)',
      contact_number: '1800-180-7890',
      categories_handled: JSON.stringify(['Sanitation', 'Waste Management']),
      default_sla_hours: 24,
      active_staff_count: 20,
    },
    {
      department_code: 'DEPT-HEALTH-05',
      name: 'Health Department',
      name_hi: 'स्वास्थ्य एवं परिवार कल्याण विभाग',
      head_officer: 'Dr. Sandeep Tripathi (Chief Medical Officer)',
      contact_number: '108',
      categories_handled: JSON.stringify(['Healthcare']),
      default_sla_hours: 12,
      active_staff_count: 16,
    },
    {
      department_code: 'DEPT-EDU-06',
      name: 'Education Department',
      name_hi: 'बेसिक शिक्षा विभाग',
      head_officer: 'Smt. Pratibha Singh (Basic Shiksha Adhikari)',
      contact_number: '1800-180-3344',
      categories_handled: JSON.stringify(['Education']),
      default_sla_hours: 48,
      active_staff_count: 12,
    },
    {
      department_code: 'DEPT-PANCH-07',
      name: 'Panchayati Raj',
      name_hi: 'पंचायती राज विभाग',
      head_officer: 'Shri Amitabh Srivastava (DPRO)',
      contact_number: '1800-180-2211',
      categories_handled: JSON.stringify(['Agriculture', 'Other']),
      default_sla_hours: 36,
      active_staff_count: 15,
    },
  ]);

  const deptMap = new Map(depts.map(d => [d.department_code, d.id]));

  const designations = await DesignationModel.bulkCreate([
    { designation_code: 'DESIG-CITIZEN', title: 'Citizen', tier_level: 1, default_portal: 'citizen', description: 'Citizen User' },
    { designation_code: 'DESIG-WARD-MEM', title: 'Ward Member', tier_level: 1, default_portal: 'ward', description: 'Ward Level Elected Representative' },
    { designation_code: 'DESIG-PRADHAN', title: 'Gram Pradhan', tier_level: 2, default_portal: 'panchayat', description: 'Panchayat President' },
    { designation_code: 'DESIG-SEC', title: 'Gram Panchayat Secretary', tier_level: 2, default_portal: 'panchayat', description: 'Panchayat Administrative Secretary' },
    { designation_code: 'DESIG-PDO', title: 'Panchayat Development Officer (PDO)', tier_level: 2, default_portal: 'panchayat', description: 'Block-Panchayat Liaison Officer' },
    { designation_code: 'DESIG-BDO', title: 'Block Development Officer (BDO)', tier_level: 3, default_portal: 'district', description: 'Block Executive Officer' },
    { designation_code: 'DESIG-DIST-OFF', title: 'District Officer', tier_level: 4, default_portal: 'district', description: 'District Level Magistrate/Officer' },
    { designation_code: 'DESIG-DPRO', title: 'District Panchayati Raj Officer (DPRO)', tier_level: 4, default_portal: 'district', description: 'District Panchayati Raj Officer' },
    { designation_code: 'DESIG-DEPT-OFF', title: 'Department Officer', tier_level: 3, default_portal: 'department', description: 'Assistant/Executive Engineer' },
    { designation_code: 'DESIG-DEPT-HEAD', title: 'Department Head', tier_level: 4, default_portal: 'department', description: 'Superintending Engineer / Chief Officer' },
    { designation_code: 'DESIG-GOV-ADMIN', title: 'Government Admin', tier_level: 5, default_portal: 'government-admin', description: 'Apex Governance & User Provisioning Admin' },
  ]);

  const desigMap = new Map(designations.map(d => [d.title, d.id]));

  await SlaConfigurationModel.bulkCreate([
    {
      category: 'Water Supply',
      severity: 'Critical',
      standard_hours: 12,
      warning_threshold_hours: 8,
      auto_escalate_designation_id: desigMap.get('District Officer')!,
      department_id: deptMap.get('DEPT-WATER-01')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Water Supply',
      severity: 'High',
      standard_hours: 24,
      warning_threshold_hours: 18,
      auto_escalate_designation_id: desigMap.get('Department Head')!,
      department_id: deptMap.get('DEPT-WATER-01')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Roads',
      severity: 'High',
      standard_hours: 48,
      warning_threshold_hours: 36,
      auto_escalate_designation_id: desigMap.get('District Panchayati Raj Officer (DPRO)')!,
      department_id: deptMap.get('DEPT-PWD-02')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Electricity',
      severity: 'Critical',
      standard_hours: 12,
      warning_threshold_hours: 8,
      auto_escalate_designation_id: desigMap.get('District Officer')!,
      department_id: deptMap.get('DEPT-ELEC-03')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Electricity',
      severity: 'Medium',
      standard_hours: 24,
      warning_threshold_hours: 18,
      auto_escalate_designation_id: desigMap.get('Department Head')!,
      department_id: deptMap.get('DEPT-ELEC-03')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Sanitation',
      severity: 'High',
      standard_hours: 24,
      warning_threshold_hours: 18,
      auto_escalate_designation_id: desigMap.get('Block Development Officer (BDO)')!,
      department_id: deptMap.get('DEPT-SWACHH-04')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Street Lights',
      severity: 'Medium',
      standard_hours: 48,
      warning_threshold_hours: 36,
      auto_escalate_designation_id: desigMap.get('Gram Pradhan')!,
      department_id: deptMap.get('DEPT-ELEC-03')!,
      notify_department: true,
      active: true,
    },
    {
      category: 'Healthcare',
      severity: 'Critical',
      standard_hours: 6,
      warning_threshold_hours: 4,
      auto_escalate_designation_id: desigMap.get('District Officer')!,
      department_id: deptMap.get('DEPT-HEALTH-05')!,
      notify_department: true,
      active: true,
    },
  ]);

  await UserModel.bulkCreate([
    {
      id: 'usr-citizen-1',
      username: 'priya_sharma',
      name: 'Priya Sharma',
      email: 'priya.sharma@gramsewa.in',
      phone: '9876543210',
      password_hash: 'password123',
      role_id: roleMap.get('citizen')!,
      is_official: false,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'Ward 1',
    },
    {
      id: 'usr-citizen-2',
      username: 'mohan_lal',
      name: 'Mohan Lal',
      email: 'mohan.lal@gramsewa.in',
      phone: '9876543211',
      password_hash: 'password123',
      role_id: roleMap.get('citizen')!,
      is_official: false,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'Ward 2',
    },
  ]);

  const officialUsers = await UserModel.bulkCreate([
    {
      id: 'usr-admin-1',
      username: 'rajesh_admin',
      name: 'Rajesh Verma',
      email: 'rajesh.verma@gov.in',
      phone: '9876543299',
      password_hash: 'admin123',
      role_id: roleMap.get('government_admin')!,
      is_official: true,
      status: 'active',
      language: 'en',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'All Panchayats',
      ward: 'All Wards',
    },
    {
      id: 'usr-pradhan-1',
      username: 'rameshwar_pradhan',
      name: 'Rameshwar Singh',
      email: 'pradhan.rampur@gov.in',
      phone: '9876543212',
      password_hash: 'pradhan123',
      role_id: roleMap.get('gram_pradhan')!,
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'All Wards',
    },
    {
      id: 'usr-ward-1',
      username: 'sita_ward1',
      name: 'Sita Devi',
      email: 'sita.devi@gov.in',
      phone: '9876543213',
      password_hash: 'ward123',
      role_id: roleMap.get('ward_member')!,
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'Ward 1',
    },
    {
      id: 'usr-ward-2',
      username: 'anil_ward2',
      name: 'Anil Kumar',
      email: 'anil.kumar@gov.in',
      phone: '9876543214',
      password_hash: 'ward123',
      role_id: roleMap.get('ward_member')!,
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'Ward 2',
    },
    {
      id: 'usr-ward-3',
      username: 'geeta_ward3',
      name: 'Geeta Sharma',
      email: 'geeta.sharma@gov.in',
      phone: '9876543215',
      password_hash: 'ward123',
      role_id: roleMap.get('ward_member')!,
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'Ward 3',
    },
    {
      id: 'usr-dist-1',
      username: 'amit_dist',
      name: 'Amit Saxena',
      email: 'dpro.varanasi@gov.in',
      phone: '9876543216',
      password_hash: 'dist123',
      role_id: roleMap.get('district_officer')!,
      is_official: true,
      status: 'active',
      language: 'en',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'All Blocks',
      village: 'All Panchayats',
      ward: 'All Wards',
    },
    {
      id: 'usr-dept-water',
      username: 'vikram_water',
      name: 'Er. Vikram Malhotra',
      email: 'ee.jaljeevan@gov.in',
      phone: '9876543217',
      password_hash: 'dept123',
      role_id: roleMap.get('department_officer')!,
      is_official: true,
      status: 'active',
      language: 'en',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'All Wards',
    },
    {
      id: 'usr-dept-pwd',
      username: 'neha_pwd',
      name: 'Er. Neha Gupta',
      email: 'ae.pwd@gov.in',
      phone: '9876543218',
      password_hash: 'dept123',
      role_id: roleMap.get('department_officer')!,
      is_official: true,
      status: 'active',
      language: 'en',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'All Wards',
    },
    {
      id: 'usr-dept-elec',
      username: 'sanjay_elec',
      name: 'Er. Sanjay Yadav',
      email: 'sdo.discom@gov.in',
      phone: '9876543219',
      password_hash: 'dept123',
      role_id: roleMap.get('department_officer')!,
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'All Wards',
    },
    {
      id: 'usr-pdo-1',
      username: 'suresh_pdo',
      name: 'Suresh Chandra',
      email: 'pdo.kashi@gov.in',
      phone: '9876543220',
      password_hash: 'pdo123',
      role_id: roleMap.get('gram_pradhan')!, // Access to panchayat tier
      is_official: true,
      status: 'active',
      language: 'hi',
      area_type: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      village: 'Rampur Gram Panchayat',
      ward: 'All Wards',
    },
  ]);

  const officials = await GovernmentOfficialModel.bulkCreate([
    {
      user_id: 'usr-admin-1',
      official_id: 'GOV-ADMIN-0001',
      designation_id: desigMap.get('Government Admin')!,
      department_id: null,
      portal: 'government-admin',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-pradhan-1',
      official_id: 'GOV-PRADHAN-0001',
      designation_id: desigMap.get('Gram Pradhan')!,
      department_id: deptMap.get('DEPT-PANCH-07') || null,
      portal: 'panchayat',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-ward-1',
      official_id: 'GOV-WARD-0001',
      designation_id: desigMap.get('Ward Member')!,
      department_id: null,
      portal: 'ward',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-ward-2',
      official_id: 'GOV-WARD-0002',
      designation_id: desigMap.get('Ward Member')!,
      department_id: null,
      portal: 'ward',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-ward-3',
      official_id: 'GOV-WARD-0003',
      designation_id: desigMap.get('Ward Member')!,
      department_id: null,
      portal: 'ward',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-dist-1',
      official_id: 'GOV-DIST-0001',
      designation_id: desigMap.get('District Panchayati Raj Officer (DPRO)')!,
      department_id: deptMap.get('DEPT-PANCH-07') || null,
      portal: 'district',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-dept-water',
      official_id: 'GOV-DEPT-0001',
      designation_id: desigMap.get('Department Officer')!,
      department_id: deptMap.get('DEPT-WATER-01')!,
      portal: 'department',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-dept-pwd',
      official_id: 'GOV-DEPT-0002',
      designation_id: desigMap.get('Department Officer')!,
      department_id: deptMap.get('DEPT-PWD-02')!,
      portal: 'department',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-dept-elec',
      official_id: 'GOV-DEPT-0003',
      designation_id: desigMap.get('Department Officer')!,
      department_id: deptMap.get('DEPT-ELEC-03')!,
      portal: 'department',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
    {
      user_id: 'usr-pdo-1',
      official_id: 'GOV-PDO-0001',
      designation_id: desigMap.get('Panchayat Development Officer (PDO)')!,
      department_id: deptMap.get('DEPT-PANCH-07') || null,
      portal: 'panchayat',
      is_active: true,
      issued_by_user_id: 'usr-admin-1',
    },
  ]);

  await JurisdictionModel.bulkCreate([
    {
      official_id: 'GOV-ADMIN-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      scope_level: 'ALL',
    },
    {
      official_id: 'GOV-PRADHAN-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      block_id: kashiBlock.id,
      gp_id: rampurGp.id,
      village_id: rampurVillage.id,
      scope_level: 'PANCHAYAT',
    },
    {
      official_id: 'GOV-WARD-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      block_id: kashiBlock.id,
      gp_id: rampurGp.id,
      village_id: rampurVillage.id,
      ward_id: ward1.id,
      scope_level: 'WARD',
    },
    {
      official_id: 'GOV-WARD-0002',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      block_id: kashiBlock.id,
      gp_id: rampurGp.id,
      village_id: rampurVillage.id,
      ward_id: ward2.id,
      scope_level: 'WARD',
    },
    {
      official_id: 'GOV-WARD-0003',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      block_id: kashiBlock.id,
      gp_id: rampurGp.id,
      village_id: rampurVillage.id,
      ward_id: ward3.id,
      scope_level: 'WARD',
    },
    {
      official_id: 'GOV-DIST-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      scope_level: 'DISTRICT',
    },
    {
      official_id: 'GOV-DEPT-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      scope_level: 'DEPARTMENT',
    },
    {
      official_id: 'GOV-DEPT-0002',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      scope_level: 'DEPARTMENT',
    },
    {
      official_id: 'GOV-DEPT-0003',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      scope_level: 'DEPARTMENT',
    },
    {
      official_id: 'GOV-PDO-0001',
      state_id: upState.id,
      district_id: varanasiDistrict.id,
      block_id: kashiBlock.id,
      gp_id: rampurGp.id,
      scope_level: 'PANCHAYAT',
    },
  ]);

  console.log('[MySQL Relational DB] Successfully seeded roles, permissions, administrative hierarchy, departments, designations, SLA rules, and verified government officials.');
}
