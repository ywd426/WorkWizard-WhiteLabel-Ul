import request from '@/utils/request';
import { AxiosPromise } from 'axios';
export function statistics(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/report/dashboard/statistics',
    method: 'get',
    params: query
  });
}
export function proportion(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/report/dashboard/proportion',
    method: 'get',
    params: query
  });
}
export function trend(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/report/dashboard/trend',
    method: 'get',
    params: query
  });
}
export function list(type: number, pageNum: number, pageSize: number): AxiosPromise<any> {
  const query = {
    type,
    pageSize,
    pageNum
  };
  return request({
    url: '/device/report/dashboard/ranking',
    method: 'get',
    params: query
  });
}
export function distribution(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/report/dashboard/distribution',
    method: 'get',
    params: query
  });
}
export function todayReports(): AxiosPromise<number> {
  return request({
    url: '/device/report/dashboard/today',
    method: 'get'
  });
}
