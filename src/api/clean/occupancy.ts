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

// 更新房间容纳量
export const updateCapacity = (data: { 'zoneId': number; 'capacity': number }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/updateCapacity`,
    method: 'put',
    data
  });
};

// 获取房间人数和停留时间图表
export const getZoneChart = (obj: commonParams) => {
  return request({
    url: `/cleaning/occupancy/dashboard/zoneChart`,
    method: 'get',
    params: obj
  });
};

// 获取容纳率数据统计
export const getStatistics = (obj: commonParams) => {
  return request({
    url: `/cleaning/occupancy/dashboard/statistics`,
    method: 'get',
    params: obj
  });
};

// 获取容纳率峰值图表: 分类(0：按小时统计 1：按天统计)
export const getPeakChart = (obj: commonParams & { type: number }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/peakChart`,
    method: 'get',
    params: obj
  });
};

// 获取外部地图数据
export const getOutdoorMap = (obj: commonParams) => {
  return request({
    url: `/cleaning/occupancy/dashboard/outdoorMap`,
    method: 'get',
    params: obj
  });
};

// 获取容纳率折线图表
export const getOccupancyChart = (obj: commonParams & { floorId?: number | string }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/occupancyChart`,
    method: 'get',
    params: obj
  });
};

// 获取房间容纳率时间序列列表
export const getOccupancyList = (obj: commonParams & { pageQuery: pageQuery }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/list`,
    method: 'get',
    params: obj
  });
};

// 获取内部地图数据
export const getIndoorMap = (obj: commonParams & { floorId?: number | string }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/indoorMap`,
    method: 'get',
    params: obj
  });
};

// 获取容纳率告警列表: 分类(0：全部1：未解决2：已解决3：预测)
export const getAlertList = (obj: commonParams & { type: string; pageQuery: pageQuery }) => {
  return request({
    url: `/cleaning/occupancy/dashboard/alertList`,
    method: 'get',
    params: obj
  });
};

// 获取告警详情
export const getAlertDetail = (id: string, obj?: commonParams) => {
  return request({
    url: `/cleaning/occupancy/dashboard/alertDetail/${id}`,
    method: 'get',
    params: obj
  });
};
