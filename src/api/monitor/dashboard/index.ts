import request from '@/utils/request';
import { AxiosPromise } from 'axios';

export function list(groupName: string): AxiosPromise<any> {
  const query = { groupName };
  return request({
    url: '/monitor/dashboard/list',
    method: 'get',
    params: query
  });
}
export function updateChartSize(data: any) {
  return request({
    url: '/monitor/dashboard/resize',
    method: 'put',
    data: data
  });
}
export function hiddenChart(id: string) {
  return request({
    url: '/monitor/dashboard/hidden/' + id,
    method: 'put'
  });
}
export function showGroups() {
  return request({
    url: '/monitor/dashboard/groups',
    method: 'get'
  });
}
export function updateGroup(groupName: string, baseGroupName: string) {
  const query = { baseGroupName, groupName };
  return request({
    url: '/monitor/dashboard/group',
    method: 'put',
    params: query
  });
}
export function removeGroup(groupName: string) {
  return request({
    url: '/monitor/dashboard/group/' + groupName,
    method: 'delete'
  });
}
