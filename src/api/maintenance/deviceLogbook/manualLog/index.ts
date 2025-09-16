import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LogQuery } from './types';
export function list(query: LogQuery): AxiosPromise<any> {
  return request({
    url: '/device/manualLog/formInfo',
    method: 'get',
    params: query
  });
}
export function calendarList(query: LogQuery): AxiosPromise<any> {
  return request({
    url: '/device/manualLog/calendarInfo',
    method: 'get',
    params: query
  });
}
export function dayList(query: LogQuery): AxiosPromise<any> {
  return request({
    url: '/device/manualLog/dayInfo',
    method: 'get',
    params: query
  });
}
export function saveLogInfo(data: any) {
  return request({
    url: '/device/manualLog',
    method: 'post',
    data: data
  });
}
export function logDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/manualLog/detail/' + id,
    method: 'get'
  });
}
export function deleteLog(id: string) {
  return request({
    url: '/device/manualLog/' + id,
    method: 'delete'
  });
}
