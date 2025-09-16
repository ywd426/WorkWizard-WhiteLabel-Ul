import request from '@/utils/request';
import { AxiosPromise } from 'axios';
export function statistics(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/dashboard/statistics',
    method: 'get',
    params: query
  });
}
export function proportion(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/dashboard/proportion',
    method: 'get',
    params: query
  });
}
export function trend(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/dashboard/trend',
    method: 'get',
    params: query
  });
}
export function list(type: number): AxiosPromise<any> {
  const query = {
    type
  };
  return request({
    url: '/device/dashboard/ranking',
    method: 'get',
    params: query
  });
}
