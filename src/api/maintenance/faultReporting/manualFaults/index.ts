import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FaultQuery } from './types';
export function list(query: FaultQuery): AxiosPromise<any> {
  return request({
    url: '/device/faultReport/formInfo',
    method: 'get',
    params: query
  });
}
export function calendarList(query: FaultQuery): AxiosPromise<any> {
  return request({
    url: '/device/faultReport/calendarInfo',
    method: 'get',
    params: query
  });
}
export function dayList(query: FaultQuery): AxiosPromise<any> {
  return request({
    url: '/device/faultReport/dayInfo',
    method: 'get',
    params: query
  });
}
export function saveReportInfo(data: any) {
  return request({
    url: '/device/faultReport',
    method: 'post',
    data: data
  });
}
export function reportDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/faultReport/detail/' + id,
    method: 'get'
  });
}
export function deleteReport(id: string) {
  return request({
    url: '/device/faultReport/' + id,
    method: 'delete'
  });
}
