import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InviteQuery, InviteRecordVO, RoleVO } from './types';

// 查询邀请记录列表
export const listInvite = (query?: InviteQuery): AxiosPromise<InviteRecordVO[]> => {
  return request({
    url: '/auth/invite/list',
    method: 'get',
    params: query
  });
};
// 获取租户角色列表
export function getTenantRoleList(): AxiosPromise<RoleVO[]> {
  return request({
    url: '/system/role/tenantRole',
    method: 'get'
  });
}
//发送邀请
export function sendInvite(data: { tenantId: string; userName: string; registerType: string }) {
  return request({
    url: '/auth/email/invite',
    method: 'post',
    headers: {
      repeatSubmit: true
    },
    data: data
  });
}
//发送多人邀请
export function sendMoreInvite(data: { userNameList: string[] }) {
  return request({
    url: '/auth/email/invites',
    method: 'post',
    data: data
  });
}
/**
 * 修改角色
 * @param data
 */
export const updateUserRole = (data: { userName: string; tenantId: string; roleId: string }) => {
  return request({
    url: '/system/user/userRole',
    method: 'put',
    data: data
  });
};
