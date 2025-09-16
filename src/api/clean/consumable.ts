import request from '@/utils/request';

type commonParams = {
  'buildingId': 'string';
  'zoneType': 'string';
  'state': 'string';
  'city': 'string';
  'zone': ['string'];
  'country': 'string';
  'aggregationLevel': 'string';
  'aggregationType': 'string';
};

type pageQuery = {
  'pageSize': number;
  'pageNum': number;
  'orderByColumn': string;
  'isAsc': string;
  'firstNum': number;
};

// 获取耗材状态列表
export const getStatusList = (obj: commonParams & { type?: string }) => {
  return request({
    url: `/cleaning/consumable/dashboard/statusList`,
    method: 'get',
    params: obj
  });
};

// 获取耗材数据统计
export const getStatistics = (obj: commonParams) => {
  return request({
    url: `/cleaning/consumable/dashboard/statistics`,
    method: 'get',
    params: obj
  });
};

// 获取耗材剩余量图表: 分类(0：按小时统计 1：按天统计 2：按周统计)
export const getPatternChart = (obj: commonParams & { type: number; name?: string }) => {
  return request({
    url: `/cleaning/consumable/dashboard/patternChart`,
    method: 'get',
    params: obj
  });
};

// 获取房间耗材状态列表
export const getConsumableList = (obj: commonParams & { name: string; pageQuery: pageQuery }) => {
  return request({
    url: `/cleaning/consumable/dashboard/list`,
    method: 'get',
    params: obj
  });
};

// 获取耗材告警列表: 分类(0：按小时统计 1：按天统计 2：按周统计)
export const getAlertList = (obj: commonParams & { type?: number; pageQuery?: pageQuery }) => {
  return request({
    url: `/cleaning/consumable/dashboard/alertList`,
    method: 'get',
    params: obj
  });
};

// 获取告警详情
export const getAlertDetail = (id: number, obj?: commonParams) => {
  return request({
    url: `/cleaning/consumable/dashboard/alertDetail/${id}`,
    method: 'get',
    params: obj
  });
};

// 获取耗材区域详情
export const getZoneDetail = (id: number) => {
  return request({
    url: `/cleaning/consumable/dashboard/zoneDetail/${id}`,
    method: 'get'
  });
};
