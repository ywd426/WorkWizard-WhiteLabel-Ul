import request from '@/utils/request';
import { ReadingVO, SensorInfoVO, SensorAlarmForm, SensorForecastForm, SensorAlarmSettingForm, SensorCustomFields } from './types';
import { AxiosPromise } from 'axios';

export function currentReadingList(sensorId: string): AxiosPromise<ReadingVO[]> {
  return request({
    url: '/monitor/sensor/current/' + sensorId,
    method: 'get'
  });
}
export function sensorInfoDetail(sensorId: string): AxiosPromise<SensorInfoVO> {
  return request({
    url: '/monitor/sensor/detail/' + sensorId,
    method: 'get'
  });
}

export function sensorChartInfo(sensorId: string, dataType: string): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType
  };
  return request({
    url: '/monitor/sensor/chart',
    method: 'get',
    params: query
  });
}

export function sensorAlarms(query: any): AxiosPromise<SensorAlarmForm[]> {
  return request({
    url: '/monitor/sensor/alarms',
    method: 'get',
    params: query
  });
}
export function sensorForecast(sensorId: string, dataType: string, days: number): AxiosPromise<SensorForecastForm> {
  const query = {
    sensorId,
    dataType,
    days
  };
  return request({
    url: '/monitor/sensor/forecast',
    method: 'get',
    params: query
  });
}

export function showDashboard(id: string): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/showDashboard/' + id,
    method: 'put'
  });
}
export function changeChartAlarmStatus(sensorId: string, dataType: string, isShow: boolean): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType,
    isShow
  };
  return request({
    url: '/monitor/sensor/showAlarm',
    method: 'put',
    params: query
  });
}
export function changeChartForecastStatus(sensorId: string, dataType: string, isShow: boolean): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType,
    isShow
  };
  return request({
    url: '/monitor/sensor/showForecast',
    method: 'put',
    params: query
  });
}
export function changeSensorAlarmOpenStatus(sensorId: string, dataType: string, isOpen: boolean): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType,
    isOpen
  };
  return request({
    url: '/monitor/sensor/openAlarm',
    method: 'put',
    params: query
  });
}
export function changeSensorForecastOpenStatus(sensorId: string, dataType: string, isOpen: boolean): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType,
    isOpen
  };
  return request({
    url: '/monitor/sensor/openForecast',
    method: 'put',
    params: query
  });
}
export function hiddenAlarm(id: string, isHidden: boolean): AxiosPromise<any> {
  const query = {
    id,
    isHidden
  };
  return request({
    url: '/monitor/sensor/hiddenAlarm',
    method: 'put',
    params: query
  });
}
export function sensorSetting(sensorId: string, dataType: string): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType
  };
  return request({
    url: '/monitor/sensor/setting',
    method: 'get',
    params: query
  });
}
export function removeSensorAlarm(id: string): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/alarm/' + id,
    method: 'delete'
  });
}
export function sensorAlarmSetting(sensorId: string, dataType: string): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType
  };
  return request({
    url: '/monitor/sensor/alarmSetting',
    method: 'get',
    params: query
  });
}
export function saveAlarmSetting(formData: SensorAlarmSettingForm): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/alarmSetting',
    method: 'post',
    data: formData
  });
}
export function getSensorAlarmDetail(sensorId: string, dataType: string, endTimestamp: string): AxiosPromise<any> {
  const query = {
    sensorId,
    dataType,
    endTimestamp
  };
  return request({
    url: '/monitor/sensor/alarmDetail',
    method: 'get',
    params: query
  });
}

export function getCustomFields(sensorId: string): AxiosPromise<any> {
  const query = {
    sensorId
  };
  return request({
    url: '/monitor/sensor/sensorCustomFields',
    method: 'get',
    params: query
  });
}
export function saveCustomFields(formData: SensorCustomFields): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/saveCustomFields',
    method: 'post',
    data: formData
  });
}
export function removeCustomFieldsById(id: string): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/deleteCustomFields/' + id,
    method: 'delete'
  });
}
export function removeSensorCustomFields(sensorId: string): AxiosPromise<any> {
  return request({
    url: '/monitor/sensor/deleteSensorCustomFields/' + sensorId,
    method: 'delete'
  });
}
export function editSeverity(id: string, severity: string): AxiosPromise<any> {
  const query = {
    id,
    severity
  };
  return request({
    url: '/monitor/sensor/changeSeverity',
    method: 'put',
    params: query
  });
}
export function editResolvedStatus(id: string, isResolved: boolean): AxiosPromise<any> {
  const query = {
    id,
    isResolved
  };
  return request({
    url: '/monitor/sensor/setResolvedStatus',
    method: 'put',
    params: query
  });
}
