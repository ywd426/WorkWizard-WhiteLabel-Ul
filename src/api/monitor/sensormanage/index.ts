import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SensorInfoQuery,
  SensorAlarmQuery,
  SensorForecastQuery,
  SensorForm,
  SensorAlarmForm,
  SensorForecastForm,
  LocationVo,
  QueryForecast,
  AlertStatisticsModel
} from './types';

export function sensorInfoList(query: SensorInfoQuery): AxiosPromise<SensorForm[]> {
  return request({
    url: '/monitor/manage/info',
    method: 'get',
    params: query
  });
}
export function sensorAlarmList(query: SensorAlarmQuery): AxiosPromise<SensorAlarmForm[]> {
  return request({
    url: '/monitor/manage/alarm',
    method: 'get',
    params: query
  });
}
export function sensorForecastList(query: SensorForecastQuery): AxiosPromise<SensorForecastForm[]> {
  return request({
    url: '/monitor/manage/forecast',
    method: 'get',
    params: query
  });
}

export function sensorTypeList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/sensorType',
    method: 'get'
  });
}
export function locationTreeList(): AxiosPromise<LocationVo> {
  return request({
    url: '/monitor/dict/type/location',
    method: 'get'
  });
}
export function sensorNameList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/sensorNames',
    method: 'get'
  });
}
export function equipmentList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/equipments',
    method: 'get'
  });
}
export function locationList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/locations',
    method: 'get'
  });
}
export function dataTypeList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/dataTypeList',
    method: 'get'
  });
}
export function maxForecastDays(query: QueryForecast): AxiosPromise<number> {
  return request({
    url: '/monitor/dict/type/maxForecastDays',
    method: 'get',
    params: query
  });
}
export function alarmTypeList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/alarmTypeList',
    method: 'get'
  });
}

export function projectList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/projectList',
    method: 'get'
  });
}

export function tenantList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/companyList',
    method: 'get'
  });
}
export function accountList(): AxiosPromise<any[]> {
  return request({
    url: '/monitor/dict/type/accountList',
    method: 'get'
  });
}
export function queryAlertStatistics(type: number): AxiosPromise<AlertStatisticsModel> {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/alarm/statistics',
    method: 'get',
    params: query
  });
}
export function queryDayAlertAndSensorNumber(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/alarm/dayStatistics',
    method: 'get',
    params: query
  });
}
export function queryDayAlertStatus(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/alarm/dayStatus',
    method: 'get',
    params: query
  });
}
export function queryAlertSeverityNumber(type: number): AxiosPromise<any[]> {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/alarm/severity',
    method: 'get',
    params: query
  });
}
export function queryAlertSensorRanking(type: number, pageNum: number, pageSize: number): AxiosPromise<any[]> {
  const query = {
    type,
    pageSize,
    pageNum
  };
  return request({
    url: '/monitor/manage/alarm/ranking',
    method: 'get',
    params: query
  });
}

export function queryForecastSensorList(type: string, days: number, pageNum: number, pageSize: number): AxiosPromise<any[]> {
  const query = {
    type,
    pageSize,
    pageNum
  };
  return request({
    url: '/monitor/manage/forecast/sensors',
    method: 'get',
    params: query
  });
}
export function querySensorStatistics(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/sensor/statistics',
    method: 'get',
    params: query
  });
}
export function querySensorTypeStatistics(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/sensor/type',
    method: 'get',
    params: query
  });
}
export function querySensorTrend(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/sensor/trend',
    method: 'get',
    params: query
  });
}
export function querySensorStateTrend(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/sensor/state',
    method: 'get',
    params: query
  });
}
export function queryForecastStatistics(type: number) {
  const query = {
    type
  };
  return request({
    url: '/monitor/manage/forecast/statistics',
    method: 'get',
    params: query
  });
}

export function getAlarmStatistics(type: string) {
  return request({
    url: `/monitor/manage/alarm/statistics`,
    method: 'get',
    params: { type }
  });
}
