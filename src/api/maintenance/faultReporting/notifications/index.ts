import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { NotificationsQuery } from './types';
export function list(query: NotificationsQuery): AxiosPromise<any> {
  return request({
    url: '/device/report/notification/formInfo',
    method: 'get',
    params: query
  });
}
export function deleteNotification(id: string) {
  return request({
    url: '/device/report/notification/' + id,
    method: 'delete'
  });
}
export function updateNotificationStatus(id: string, status: boolean) {
  const query = {
    status
  };
  return request({
    url: '/device/report/notification/' + id,
    method: 'put',
    params: query
  });
}
export function addNotification(data: any) {
  return request({
    url: '/device/report/notification',
    method: 'post',
    data: data
  });
}
