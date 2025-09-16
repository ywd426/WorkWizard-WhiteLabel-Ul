import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { NotificationsQuery } from './types';
export function list(query: NotificationsQuery): AxiosPromise<any> {
  return request({
    url: '/device/notification/formInfo',
    method: 'get',
    params: query
  });
}
export function deleteNotification(id: string) {
  return request({
    url: '/device/notification/' + id,
    method: 'delete'
  });
}
export function updateNotificationStatus(id: string, status: boolean) {
  const query = {
    status
  };
  console.log(status);
  return request({
    url: '/device/notification/' + id,
    method: 'put',
    params: query
  });
}
