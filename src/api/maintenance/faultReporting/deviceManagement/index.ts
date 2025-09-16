import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DeviceQuery } from './types';
export function list(query: DeviceQuery): AxiosPromise<any> {
  return request({
    url: '/device/report/management/formInfo',
    method: 'get',
    params: query
  });
}
export function deviceList(): AxiosPromise<any> {
  return request({
    url: '/maintenance/dict/type/equipments',
    method: 'get'
  });
}
export function sensorList(equipmentId: string): AxiosPromise<any> {
  const query = {
    equipmentId
  };
  return request({
    url: '/maintenance/dict/type/sensors',
    method: 'get',
    params: query
  });
}
export function dataTypeList(sensorId: string): AxiosPromise<any> {
  const query = {
    sensorId
  };
  return request({
    url: '/maintenance/dict/type/dataTypeList',
    method: 'get',
    params: query
  });
}
export function equipmentTreeList(building: string): AxiosPromise<any> {
  const query = {
    building
  };
  return request({
    url: '/maintenance/dict/type/equipmentTree',
    method: 'get',
    params: query
  });
}
export function deviceInfo(id: string): AxiosPromise<any> {
  return request({
    url: '/maintenance/dict/type/deviceInfo/' + id,
    method: 'get'
  });
}
export function locationTreeList(): AxiosPromise<any> {
  return request({
    url: '/maintenance/dict/type/locations',
    method: 'get'
  });
}
export function reportNameList(): AxiosPromise<any> {
  return request({
    url: '/maintenance/dict/type/reportNameList',
    method: 'get'
  });
}
