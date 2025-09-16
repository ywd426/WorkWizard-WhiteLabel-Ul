import request from '@/utils/request';
import { AxiosPromise } from 'axios';
export function list(query: any): AxiosPromise<any> {
  return request({
    url: '/device/forum/list',
    method: 'get',
    params: query
  });
}
export function replyList(query: any): AxiosPromise<any> {
  return request({
    url: '/device/forum/replyList',
    method: 'get',
    params: query
  });
}
export function saveForum(data: any) {
  return request({
    url: '/device/forum',
    method: 'post',
    data: data
  });
}
