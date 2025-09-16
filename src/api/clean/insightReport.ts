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

// 新增/更新报告
export const saveInsightReport = (data: {
    "reportName": "string",
    "reportType": "string",
    "zoneId": "number",
    "timeRange": "string",
    "analysisDepth": "string",
    "outputFormat": "string",
    "deliveryMethod": "string",
    "status": "string",
    "createdBy": "string",
    "reportContent": "string",
    "scheduleContent": "string"
  }) => {
  return request({
    url: '/cleaning/insightReport/save',
    method: 'post',
    data
  });
};

// 分页查询报告列表
export const getInsightReportList = (params: commonParams & { timeZone: string, pageQuery: pageQuery }) => {
  return request({
    url: '/cleaning/insightReport/list',
    method: 'get',
    params
  });
};

// 获取报告详情
export const getInsightReportDetail = (id: string | number) => {
  return request({
    url: `/cleaning/insightReport/detail/${id}`,
    method: 'get'
  });
};

// 删除报告
export const deleteInsightReport = (id: string | number) => {
  return request({
    url: `/cleaning/insightReport/${id}`,
    method: 'delete'
  });
};