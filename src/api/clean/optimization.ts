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

// 批量更新任务优化计划状态
export const updateOptimizationStatus = (ids: string[], status: string) => {
  return request({
    url: '/cleaning/optimization/status',
    method: 'put',
    params: {ids, status}
  });
};

// 更新任务优化计划
export const updateOptimization = (data: {
    "optimizationId": number | null,
    "optimizationType": string | null,
    "optimizationItem": string | null,
    "originalValue": string | null,
    "recommendedValue": string | null,
    "impact": string | null,
    "status": string | null,
    "zoneId": number | null,
    "zoneName": string | null,
    "floorName": string | null,
    "buildingName": string | null
  }) => {
  return request({
    url: '/cleaning/optimization/optimization',
    method: 'put',
    data
  });
};

// 批量删除任务优化计划
export const deleteOptimizations = ( ids: number[] ) => {
  return request({
    url: '/cleaning/optimization/optimization',
    method: 'delete',
    params: {ids}
  });
};

// 获取任务优化统计信息
export const getOptimizationStatistics = (params: commonParams & {timeZone: string}) => {
  return request({
    url: '/cleaning/optimization/statistics',
    method: 'get',
    params
  });
};

// 获取任务优化计划列表
export const getOptimizationPlans = (params: commonParams & { timeZone: string, optimizationType: string }) => {
  return request({
    url: '/cleaning/optimization/plans',
    method: 'get',
    params
  });
};

// 获取任务优化计划详情
export const getOptimizationPlanDetail = (id: number, params?: commonParams) => {
  return request({
    url: `/cleaning/optimization/planDetail/${id}`,
    method: 'get',
    params
  });
};

// 获取优化流水列表
export const getOptimizations = (params: commonParams & { timeZone: string, pageQuery: pageQuery }) => {
  return request({
    url: '/cleaning/optimization/optimizations',
    method: 'get',
    params
  });
};