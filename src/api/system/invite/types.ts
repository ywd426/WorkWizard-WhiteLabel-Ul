/**
 * 邀请查询参数
 */
export interface InviteQuery extends PageQuery {
  tenantId?: string;
  userName?: string;
  inviteStatus?: number;
  userStatus?: number;
}

/**
 * 邀请记录类型
 */
export interface InviteForm {
  id: number;
  tenantId: string;
  companyName: string;
  toUserName: string;
  userStatus: string;
  createTime: string;
}

/**
 * 邀请表单类型
 */
export interface InviteRecordVO {
  tenantId: string;
  toUserName: string;
  registerType: string;
}
export interface RoleVO {
  roleId: number;
  roleName: string;
}
export interface RoleForm {
  roleId: string;
  tenantId: string;
  userName: string;
}
