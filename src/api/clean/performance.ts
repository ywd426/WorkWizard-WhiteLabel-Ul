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
  

// 获取TaskQualityImpact图表数据
export const getTaskQualityImpact = (params:  commonParams & { timeZone: string, dataType: string | number }) => {
  return request({
    url: '/cleaning/insight/performance/taskQualityImpact',
    method: 'get',
    params
  });
};

// 获取Task Performance图表数据
export const getTaskPerformance = (params: commonParams & { timeZone: string, scoreType : string }) => {
  return request({
    url: '/cleaning/insight/performance/taskPerformance',
    method: 'get',
    params
  });
};

// 获取绩效统计信息
export const getPerformanceStatistics = (params: commonParams & { timeZone: string }) => {
  return request({
    url: '/cleaning/insight/performance/statistics',
    method: 'get',
    params
  });
};

// 获取Location Performance Comparison图表数据
export const getLocationPerformanceComparison = (params: commonParams & { timeZone: string, type : string }) => {
  return request({
    url: '/cleaning/insight/performance/locationPerformanceComparison',
    method: 'get',
    params
  });
};

// 获取Historical Performance Trends图表数据
export const getHistoricalPerformanceTrends = (params: commonParams & { timeZone: string, type : string, zoneId: number }) => {
  return request({
    url: '/cleaning/insight/performance/historicalPerformanceTrends',
    method: 'get',
    params
  });
};

// 获取指定区域的影响因素映射关系
export const getZoneMapping = (params:  commonParams & { timeZone: string, zoneId: number }) => {
  return request({
    url: '/cleaning/insight/dashboard/zoneMapping',
    method: 'get',
    params
  });
};

// 获取指定区域的告警列表
export const getZoneAlerts = (params: commonParams & { timeZone: string, categories: string[], zoneId: number }) => {
  return request({
    url: '/cleaning/insight/dashboard/zoneAlerts',
    method: 'get',
    params
  });
};

// 获取清洁优先级列表（分页）
export const getPriorities = (params: commonParams & { timeZone: string, pageQuery: pageQuery } ) => {
  return request({
    url: '/cleaning/insight/dashboard/priorities',
    method: 'get',
    params
  });
};

// 获取洞察告警列表（分页）
export const getDashboardAlerts = (params:  commonParams & { timeZone: string, categories: string[], pageQuery: pageQuery }) => {
  return request({
    url: '/cleaning/insight/dashboard/alerts',
    method: 'get',
    params
  });
};
