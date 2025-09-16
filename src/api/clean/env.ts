import request from '@/utils/request';

type commonParams = {
  'timeZone': 'string';
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
  'orderByColumn'?: string;
  'isAsc'?: string;
  'firstNum'?: number;
};

// 获取统计数据
export const getStatistics = (obj: commonParams) => {
  return request({
    url: `/cleaning/environment/dashboard/statistics`,
    method: 'get',
    params: obj
  });
};

// 环境得分
export const getEnvScore = (obj: commonParams & { floorId?: number | string; type: number }) => {
  return request({
    url: `/cleaning/environment/dashboard/scoreChart`,
    method: 'get',
    params: obj
  });
};

// 环境图表
export const getParamChart = (obj: commonParams & { floorId?: number | string; dataType: string }) => {
  return request({
    url: `/cleaning/environment/dashboard/parametersChart`,
    method: 'get',
    params: obj
  });
};

// 获取外部地图数据
export const getOutdoorMap = (obj: commonParams) => {
  return request({
    url: `/cleaning/environment/dashboard/outdoorMap`,
    method: 'get',
    params: obj
  });
};

// 获取环境传感器的各个得分
export const getSensorList = (obj: commonParams & { floorId?: number | string; pageQuery: pageQuery }) => {
  return request({
    url: `/cleaning/environment/dashboard/list`,
    method: 'get',
    params: obj
  });
};

// 获取内部地图数据
export const getIndoorMap = (obj: commonParams & { floorId?: number | string }) => {
  return request({
    url: `/cleaning/environment/dashboard/indoorMap`,
    method: 'get',
    params: obj
  });
};

// 获取地理位置相关的传感器数据明细
export const getLocationDetail = (
  obj: commonParams & {
    locationQuery: {
      location?: string;
      type: string;
    };
  }
) => {
  return request({
    url: `/cleaning/environment/dashboard/detail`,
    method: 'get',
    params: obj
  });
};

// 获取环境告警列表: 分类(0：全部1：未解决2：已解决3：预测)
export const getAlertList = (obj: commonParams & { type: number; pageQuery: pageQuery }) => {
  return request({
    url: `/cleaning/environment/dashboard/alertList`,
    method: 'get',
    params: obj
  });
};

// 获取告警详情
export const getAlertDetail = (id: number) => {
  return request({
    url: `/cleaning/environment/dashboard/alertDetail/${id}`,
    method: 'get'
  });
};
