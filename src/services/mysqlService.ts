import {
  UserModel,
  RoleModel,
  GovernmentOfficialModel,
  DesignationModel,
  DepartmentModel,
  JurisdictionModel,
  SlaConfigurationModel,
  StateModel,
  DistrictModel,
  BlockModel,
  GramPanchayatModel,
  VillageModel,
  WardModel,
} from '../db/mysql/models';
import { User, Designation, DepartmentName, SlaRule } from '../types';

export class MySqlGovernanceService {
  static async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id, {
      include: [
        { model: RoleModel, as: 'role' },
        {
          model: GovernmentOfficialModel,
          as: 'official_profile',
          include: [
            { model: DesignationModel, as: 'designation' },
            { model: DepartmentModel, as: 'department' },
            { model: JurisdictionModel, as: 'jurisdictions' },
          ],
        },
      ],
    });

    if (!user) return null;
    return this.mapUserEntity(user);
  }

  static async findCitizen(phone?: string, email?: string): Promise<User | null> {
    const whereClause: any = { is_official: false };
    if (phone) whereClause.phone = phone.trim();
    else if (email) whereClause.email = email.trim().toLowerCase();

    const user = await UserModel.findOne({
      where: whereClause,
      include: [{ model: RoleModel, as: 'role' }],
    });

    if (!user) return null;
    return this.mapUserEntity(user);
  }

  static async findOfficialByOfficialId(officialId: string): Promise<User | null> {
    const sanitizedId = officialId.trim().toUpperCase();

    const officialRecord = await GovernmentOfficialModel.findOne({
      where: { official_id: sanitizedId },
      include: [
        {
          model: UserModel,
          as: 'user',
          include: [{ model: RoleModel, as: 'role' }],
        },
        { model: DesignationModel, as: 'designation' },
        { model: DepartmentModel, as: 'department' },
        { model: JurisdictionModel, as: 'jurisdictions' },
      ],
    });

    if (!officialRecord || !officialRecord.get('user')) return null;

    const userInstance = officialRecord.get('user') as any;
    userInstance.set('official_profile', officialRecord);
    return this.mapUserEntity(userInstance);
  }

  static async createCitizen(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    language?: 'hi' | 'en';
    areaType?: 'rural' | 'urban';
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    ward?: string;
  }): Promise<User> {
    const citizenRole = await RoleModel.findOne({ where: { role_code: 'citizen' } });
    const roleId = citizenRole ? citizenRole.id : 1;

    const id = `usr-citizen-${Date.now()}`;
    const newUser = await UserModel.create({
      id,
      username: data.name.toLowerCase().replace(/\s+/g, '_'),
      name: data.name.trim(),
      email: data.email?.trim() || `${data.name.toLowerCase().replace(/\s+/g, '')}@gramsewa.in`,
      phone: data.phone.trim(),
      password_hash: data.password || 'password123',
      role_id: roleId,
      is_official: false,
      status: 'active',
      language: data.language || 'hi',
      area_type: data.areaType || 'rural',
      state: data.state || 'Uttar Pradesh',
      district: data.district || 'Varanasi',
      block: data.block || 'Kashi Vidyapeeth',
      village: data.village || 'Rampur Gram Panchayat',
      ward: data.ward || 'Ward 1',
    });

    return (await this.findUserById(id))!;
  }

  static async createOfficial(
    data: {
      name: string;
      officialId?: string;
      phone?: string;
      email?: string;
      designation: Designation | string;
      department?: DepartmentName | string;
      state?: string;
      district?: string;
      block?: string;
      village?: string;
      ward?: string;
      password?: string;
      status?: 'active' | 'pending' | 'suspended';
    },
    issuedByAdminId?: string
  ): Promise<User> {
    let desigRecord = await DesignationModel.findOne({ where: { title: data.designation } });
    if (!desigRecord) {
      desigRecord = await DesignationModel.findOne({ where: { designation_code: 'DESIG-GOV-ADMIN' } });
    }

    let deptRecord = null;
    if (data.department) {
      deptRecord = await DepartmentModel.findOne({ where: { name: data.department } });
    }

    let roleCode = 'government_admin';
    if (data.designation === 'Ward Member') roleCode = 'ward_member';
    else if (data.designation === 'Gram Pradhan' || data.designation.includes('PDO') || data.designation.includes('Secretary')) roleCode = 'gram_pradhan';
    else if (data.designation.includes('District') || data.designation.includes('DPRO') || data.designation.includes('BDO')) roleCode = 'district_officer';
    else if (data.designation.includes('Department') || data.designation.includes('Engineer')) roleCode = 'department_officer';

    const role = await RoleModel.findOne({ where: { role_code: roleCode } });
    const roleId = role ? role.id : 6;

    let finalOfficialId = data.officialId ? data.officialId.trim().toUpperCase() : '';
    if (!finalOfficialId) {
      let prefix = 'GOV-OFFICER';
      if (data.designation === 'Ward Member') prefix = 'GOV-WARD';
      else if (data.designation === 'Gram Pradhan') prefix = 'GOV-PRADHAN';
      else if (data.designation.includes('PDO')) prefix = 'GOV-PDO';
      else if (data.designation.includes('District') || data.designation.includes('DPRO')) prefix = 'GOV-DIST';
      else if (data.designation === 'Government Admin') prefix = 'GOV-ADMIN';
      else prefix = 'GOV-DEPT';

      const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
      finalOfficialId = `${prefix}-${randomSuffix}`;
    }

    const existing = await GovernmentOfficialModel.findOne({ where: { official_id: finalOfficialId } });
    if (existing) {
      throw new Error(`Official ID ${finalOfficialId} is already assigned. Official IDs must be unique.`);
    }

    const userId = `usr-gov-${Date.now()}`;
    const portal = desigRecord?.default_portal || 'government-admin';

    await UserModel.create({
      id: userId,
      username: data.name.toLowerCase().replace(/\s+/g, '_'),
      name: data.name.trim(),
      email: data.email?.trim() || `${data.name.toLowerCase().replace(/\s+/g, '')}@gov.in`,
      phone: data.phone?.trim() || `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      password_hash: data.password || 'password123',
      role_id: roleId,
      is_official: true,
      status: data.status || 'active',
      language: 'en',
      area_type: 'rural',
      state: data.state || 'Uttar Pradesh',
      district: data.district || 'Varanasi',
      block: data.block || 'Kashi Vidyapeeth',
      village: data.village || 'Rampur Gram Panchayat',
      ward: data.ward || 'All Wards',
    });

    await GovernmentOfficialModel.create({
      user_id: userId,
      official_id: finalOfficialId,
      designation_id: desigRecord ? desigRecord.id : 1,
      department_id: deptRecord ? deptRecord.id : null,
      portal,
      is_active: data.status !== 'suspended',
      issued_by_user_id: issuedByAdminId || null,
    });

    let scopeLevel: 'WARD' | 'PANCHAYAT' | 'BLOCK' | 'DISTRICT' | 'DEPARTMENT' | 'STATE' | 'ALL' = 'ALL';
    if (data.designation === 'Ward Member') scopeLevel = 'WARD';
    else if (data.designation === 'Gram Pradhan' || data.designation.includes('PDO')) scopeLevel = 'PANCHAYAT';
    else if (data.designation.includes('District') || data.designation.includes('DPRO')) scopeLevel = 'DISTRICT';
    else if (data.designation.includes('Department')) scopeLevel = 'DEPARTMENT';

    await JurisdictionModel.create({
      official_id: finalOfficialId,
      state_id: 1,
      district_id: 1,
      scope_level: scopeLevel,
    });

    return (await this.findUserById(userId))!;
  }

  static async getAllUsers(): Promise<User[]> {
    const users = await UserModel.findAll({
      include: [
        { model: RoleModel, as: 'role' },
        {
          model: GovernmentOfficialModel,
          as: 'official_profile',
          include: [
            { model: DesignationModel, as: 'designation' },
            { model: DepartmentModel, as: 'department' },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return users.map(u => this.mapUserEntity(u));
  }

  static async updateUserStatus(userId: string, status: 'active' | 'pending' | 'suspended'): Promise<User | null> {
    const user = await UserModel.findByPk(userId);
    if (!user) return null;

    user.status = status;
    await user.save();

    const official = await GovernmentOfficialModel.findOne({ where: { user_id: userId } });
    if (official) {
      official.is_active = status === 'active';
      await official.save();
    }

    return this.findUserById(userId);
  }

  static async getAllDepartments(): Promise<any[]> {
    const depts = await DepartmentModel.findAll({ order: [['id', 'ASC']] });
    return depts.map(d => ({
      id: d.department_code,
      name: d.name,
      nameHi: d.name_hi,
      headOfficer: d.head_officer,
      contactNumber: d.contact_number,
      categoriesHandled: JSON.parse(d.categories_handled || '[]'),
      defaultSlaHours: d.default_sla_hours,
      activeStaffCount: d.active_staff_count,
    }));
  }

  static async getSlaRules(): Promise<SlaRule[]> {
    const rules = await SlaConfigurationModel.findAll({
      include: [
        { model: DesignationModel, as: 'escalate_to' },
        { model: DepartmentModel, as: 'department' },
      ],
    });

    return rules.map(r => ({
      id: `sla-${r.id}`,
      category: r.category as any,
      severity: r.severity as any,
      standardHours: r.standard_hours,
      warningThresholdHours: r.warning_threshold_hours,
      autoEscalateTo: (r.get('escalate_to') as any)?.title || 'District Officer',
      notifyDepartment: r.notify_department,
      active: r.active,
    }));
  }

  private static mapUserEntity(user: UserModel): User {
    const roleObj = (user.get('role') as any);
    const roleName = roleObj ? roleObj.role_code : 'citizen';

    const officialProfile = (user.get('official_profile') as any);
    const designationObj = officialProfile ? (officialProfile.get('designation') as any) : null;
    const departmentObj = officialProfile ? (officialProfile.get('department') as any) : null;

    const designation = designationObj ? designationObj.title : (user.is_official ? 'Government Official' : 'Citizen');
    const department = departmentObj ? departmentObj.name : undefined;
    const portal = officialProfile?.portal || (user.is_official ? 'government-admin' : 'citizen');
    const officialId = officialProfile?.official_id;

    return {
      id: user.id,
      officialId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password_hash,
      role: roleName,
      designation,
      department,
      portal: portal as any,
      status: user.status,
      areaType: user.area_type as any,
      state: user.state,
      district: user.district,
      block: user.block,
      village: user.village,
      ward: user.ward,
      language: user.language as any,
      createdAt: user.get('createdAt') ? new Date(user.get('createdAt') as any).toISOString() : new Date().toISOString(),
      lastLogin: user.last_login ? new Date(user.last_login).toISOString() : undefined,
    };
  }
}
