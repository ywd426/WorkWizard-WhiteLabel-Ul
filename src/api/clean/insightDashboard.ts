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
// 获取指定区域的影响因素映射关系
export const getZoneMapping = (params: commonParams & { timeZone: string, zoneId : number }) => {
  return request({
    url: '/cleaning/insight/dashboard/zoneMapping',
    method: 'get',
    params
  });
};

// 获取指定区域的告警列表
export const getZoneAlerts = (params: { zoneId: number | string; pageNum?: number; pageSize?: number }) => {
  return request({
    url: '/cleaning/insight/dashboard/zoneAlerts',
    method: 'get',
    params
  });
};

// 获取清洁优先级列表（分页）
export const getPriorities = (params: commonParams & { timeZone: string, pageQuery: pageQuery }) => {
  return request({
    url: '/cleaning/insight/dashboard/priorities',
    method: 'get',
    params
  });
};

// 获取洞察告警列表（分页）
export const getDashboardAlerts = (params: commonParams & { categories: string[]; timeZone : string}) => {
  return request({
    url: '/cleaning/insight/dashboard/alerts',
    method: 'get',
    params
  });
}; 