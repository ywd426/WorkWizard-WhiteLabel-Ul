import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FaultQuery } from './types';
export function list(query: FaultQuery): AxiosPromise<any> {
  return request({
    url: '/device/faultDetection/formInfo',
    method: 'get',
    params: query
  });
}
export function detailList(type: string, severity: string, faultName: string): AxiosPromise<any> {
  const query = {
    type,
    severity,
    faultName
  };
  return request({
    url: '/device/faultDetection/detailList',
    method: 'get',
    params: query
  });
}
export function setDetectionStatus(type: string, severity: string, faultName: string, status: boolean): AxiosPromise<any> {
  const query = {
    type,
    severity,
    faultName,
    status
  };
  return request({
    url: '/device/faultDetection/status',
    method: 'put',
    params: query
  });
}
export function detectionList(query: FaultQuery): AxiosPromise<any> {
  return request({
    url: '/device/faultDetection/detections',
    method: 'get',
    params: query
  });
}
export function detectionInfo(id: string): AxiosPromise<any> {
  return request({
    url: '/device/faultDetection/detectionInfo/' + id,
    method: 'get'
  });
}
