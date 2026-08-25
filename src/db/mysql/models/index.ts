export interface FindOptions {
  where?: Record<string, any>;
  include?: Array<{
    model: any;
    as?: string;
    include?: any[];
  }>;
  order?: Array<[string, 'ASC' | 'DESC']>;
}

export class RelationalBaseModel<T extends { id?: any }> {
  protected static records: any[] = [];
  protected static autoId: number = 1;

  public data: any = {};
  public extraProps: Map<string, any> = new Map();

  constructor(attributes: any) {
    this.data = { ...attributes };
    if (!this.data.createdAt) this.data.createdAt = new Date().toISOString();
    if (!this.data.updatedAt) this.data.updatedAt = new Date().toISOString();
    Object.assign(this, this.data);
  }

  public get(key: string): any {
    if (this.extraProps.has(key)) return this.extraProps.get(key);
    return this.data[key] !== undefined ? this.data[key] : (this as any)[key];
  }

  public set(key: string, value: any): void {
    this.extraProps.set(key, value);
    this.data[key] = value;
    (this as any)[key] = value;
  }

  public async save(): Promise<this> {
    const records = (this.constructor as any).records;
    const idx = records.findIndex((r: any) => r.id === this.data.id);
    this.data.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      records[idx] = this;
    }
    return this;
  }

  static async sync(options?: any): Promise<void> {
    if (options?.force) {
      this.records = [];
      this.autoId = 1;
    }
  }

  static async create<M extends RelationalBaseModel<any>>(this: new (attrs: any) => M, attributes: any): Promise<M> {
    const Cls = this as any;
    const id = attributes.id !== undefined ? attributes.id : Cls.autoId++;
    const inst = new Cls({ ...attributes, id });
    Cls.records.push(inst);
    return inst;
  }

  static async bulkCreate<M extends RelationalBaseModel<any>>(this: new (attrs: any) => M, records: any[]): Promise<M[]> {
    const results: M[] = [];
    for (const r of records) {
      const created = await (this as any).create(r);
      results.push(created);
    }
    return results;
  }

  static async findByPk<M extends RelationalBaseModel<any>>(this: new (attrs: any) => M, pk: any, options?: FindOptions): Promise<M | null> {
    const Cls = this as any;
    const found = Cls.records.find((r: any) => String(r.id) === String(pk));
    if (!found) return null;
    return Cls.resolveIncludes(found, options?.include);
  }

  static async findOne<M extends RelationalBaseModel<any>>(this: new (attrs: any) => M, options?: FindOptions): Promise<M | null> {
    const Cls = this as any;
    let list = [...Cls.records];
    if (options?.where) {
      list = list.filter((item: any) => {
        return Object.entries(options.where!).every(([k, v]) => {
          const itemVal = item.data ? item.data[k] : item[k];
          if (v === undefined) return true;
          return itemVal === v;
        });
      });
    }
    if (list.length === 0) return null;
    return Cls.resolveIncludes(list[0], options?.include);
  }

  static async findAll<M extends RelationalBaseModel<any>>(this: new (attrs: any) => M, options?: FindOptions): Promise<M[]> {
    const Cls = this as any;
    let list = [...Cls.records];
    if (options?.where) {
      list = list.filter((item: any) => {
        return Object.entries(options.where!).every(([k, v]) => {
          const itemVal = item.data ? item.data[k] : item[k];
          if (v === undefined) return true;
          return itemVal === v;
        });
      });
    }
    if (options?.order) {
      const [col, dir] = options.order[0];
      list.sort((a: any, b: any) => {
        const valA = a.data ? a.data[col] : a[col];
        const valB = b.data ? b.data[col] : b[col];
        if (dir === 'DESC') return valA < valB ? 1 : -1;
        return valA > valB ? 1 : -1;
      });
    }
    return Promise.all(list.map((item: any) => Cls.resolveIncludes(item, options?.include)));
  }

  static async count(options?: FindOptions): Promise<number> {
    const all = await this.findAll(options);
    return all.length;
  }

  static async resolveIncludes(instance: any, includes?: any[]): Promise<any> {
    if (!includes || includes.length === 0) return instance;

    for (const inc of includes) {
      const alias = inc.as;
      const targetModel = inc.model;
      if (!alias) continue;

      if (alias === 'role') {
        const roleId = instance.role_id || instance.data?.role_id;
        const role = RoleModel.records.find(r => r.id === roleId);
        instance.set('role', role || null);
      } else if (alias === 'official_profile') {
        const official = GovernmentOfficialModel.records.find(o => o.user_id === instance.id);
        if (official) {
          if (inc.include) {
            await GovernmentOfficialModel.resolveIncludes(official, inc.include);
          }
          instance.set('official_profile', official);
        } else {
          instance.set('official_profile', null);
        }
      } else if (alias === 'designation') {
        const desigId = instance.designation_id || instance.data?.designation_id;
        const desig = DesignationModel.records.find(d => d.id === desigId);
        instance.set('designation', desig || null);
      } else if (alias === 'department') {
        const deptId = instance.department_id || instance.data?.department_id;
        const dept = DepartmentModel.records.find(d => d.id === deptId);
        instance.set('department', dept || null);
      } else if (alias === 'jurisdictions') {
        const offId = instance.official_id || instance.data?.official_id;
        const juris = JurisdictionModel.records.filter(j => j.official_id === offId);
        instance.set('jurisdictions', juris);
      } else if (alias === 'user') {
        const uId = instance.user_id || instance.data?.user_id;
        const user = UserModel.records.find(u => u.id === uId);
        if (user && inc.include) {
          await UserModel.resolveIncludes(user, inc.include);
        }
        instance.set('user', user || null);
      } else if (alias === 'escalate_to') {
        const desigId = instance.auto_escalate_designation_id || instance.data?.auto_escalate_designation_id;
        const desig = DesignationModel.records.find(d => d.id === desigId);
        instance.set('escalate_to', desig || null);
      }
    }
    return instance;
  }
}

export class RoleModel extends RelationalBaseModel<any> {
  public static records: RoleModel[] = [];
  public static autoId = 1;

  public id!: number;
  public role_code!: string;
  public name!: string;
  public description!: string;

  static belongsToMany(other: any, opts: any) {}
  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class PermissionModel extends RelationalBaseModel<any> {
  public static records: PermissionModel[] = [];
  public static autoId = 1;

  public id!: number;
  public permission_code!: string;
  public name!: string;
  public resource!: string;
  public action!: string;

  static belongsToMany(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class RolePermissionModel extends RelationalBaseModel<any> {
  public static records: RolePermissionModel[] = [];
  public static autoId = 1;

  public id!: number;
  public role_id!: number;
  public permission_id!: number;

  static init(schema: any, opts: any) {}
}

export class StateModel extends RelationalBaseModel<any> {
  public static records: StateModel[] = [];
  public static autoId = 1;

  public id!: number;
  public state_code!: string;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class DistrictModel extends RelationalBaseModel<any> {
  public static records: DistrictModel[] = [];
  public static autoId = 1;

  public id!: number;
  public district_code!: string;
  public state_id!: number;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class BlockModel extends RelationalBaseModel<any> {
  public static records: BlockModel[] = [];
  public static autoId = 1;

  public id!: number;
  public block_code!: string;
  public district_id!: number;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class GramPanchayatModel extends RelationalBaseModel<any> {
  public static records: GramPanchayatModel[] = [];
  public static autoId = 1;

  public id!: number;
  public gp_code!: string;
  public block_id!: number;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class VillageModel extends RelationalBaseModel<any> {
  public static records: VillageModel[] = [];
  public static autoId = 1;

  public id!: number;
  public village_code!: string;
  public gp_id!: number;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class UrbanLocalBodyModel extends RelationalBaseModel<any> {
  public static records: UrbanLocalBodyModel[] = [];
  public static autoId = 1;

  public id!: number;
  public ulb_code!: string;
  public district_id!: number;
  public name!: string;
  public type!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class WardModel extends RelationalBaseModel<any> {
  public static records: WardModel[] = [];
  public static autoId = 1;

  public id!: number;
  public ward_code!: string;
  public ward_number!: string;
  public village_id!: number | null;
  public ulb_id!: number | null;
  public name!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class DepartmentModel extends RelationalBaseModel<any> {
  public static records: DepartmentModel[] = [];
  public static autoId = 1;

  public id!: number;
  public department_code!: string;
  public name!: string;
  public name_hi!: string;
  public head_officer!: string;
  public contact_number!: string;
  public categories_handled!: string;
  public default_sla_hours!: number;
  public active_staff_count!: number;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class DesignationModel extends RelationalBaseModel<any> {
  public static records: DesignationModel[] = [];
  public static autoId = 1;

  public id!: number;
  public designation_code!: string;
  public title!: string;
  public tier_level!: number;
  public default_portal!: string;
  public description!: string;

  static hasMany(other: any, opts: any) {}
  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class UserModel extends RelationalBaseModel<any> {
  public static records: UserModel[] = [];
  public static autoId = 1;

  public id!: string;
  public username!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public password_hash!: string;
  public role_id!: number;
  public is_official!: boolean;
  public status!: 'active' | 'pending' | 'suspended';
  public language!: string;
  public area_type!: string;
  public state!: string;
  public district!: string;
  public block!: string;
  public village!: string;
  public ward!: string;
  public last_login!: Date | null;

  static belongsTo(other: any, opts: any) {}
  static hasOne(other: any, opts: any) {}
  static hasMany(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class GovernmentOfficialModel extends RelationalBaseModel<any> {
  public static records: GovernmentOfficialModel[] = [];
  public static autoId = 1;

  public id!: number;
  public user_id!: string;
  public official_id!: string;
  public designation_id!: number;
  public department_id!: number | null;
  public portal!: string;
  public is_active!: boolean;
  public issued_by_user_id!: string | null;

  static belongsTo(other: any, opts: any) {}
  static hasMany(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class JurisdictionModel extends RelationalBaseModel<any> {
  public static records: JurisdictionModel[] = [];
  public static autoId = 1;

  public id!: number;
  public official_id!: string;
  public state_id!: number;
  public district_id!: number | null;
  public block_id!: number | null;
  public gp_id!: number | null;
  public village_id!: number | null;
  public ward_id!: number | null;
  public ulb_id!: number | null;
  public scope_level!: 'WARD' | 'PANCHAYAT' | 'BLOCK' | 'DISTRICT' | 'DEPARTMENT' | 'STATE' | 'ALL';

  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}

export class SlaConfigurationModel extends RelationalBaseModel<any> {
  public static records: SlaConfigurationModel[] = [];
  public static autoId = 1;

  public id!: number;
  public category!: string;
  public severity!: string;
  public standard_hours!: number;
  public warning_threshold_hours!: number;
  public auto_escalate_designation_id!: number;
  public department_id!: number | null;
  public notify_department!: boolean;
  public active!: boolean;

  static belongsTo(other: any, opts: any) {}
  static init(schema: any, opts: any) {}
}
