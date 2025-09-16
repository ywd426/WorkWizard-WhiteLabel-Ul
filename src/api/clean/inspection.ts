import request from '@/utils/request';

type commonParams = {
    'buildingId': string;
    'zoneType': string;
    'state': string;
    'city': string;
    'zone': string[];
    'country': string;
    'aggregationLevel': string;
    'aggregationType': string;
  };
  
  type pageQuery = {
    'pageSize': number;
    'pageNum': number;
    'orderByColumn': string;
    'isAsc': string;
    'firstNum': number;
  };

// 提交检查数据
export const submitInspection = (data: {
    "id":number,
    "templateId":number,
    "zoneId":number,
    "assignee": string,
    "actualScore":number,
    "itemDetails": [
      {
        "id":number,
        "inspectionId":number,
        "objectiveCriteriaId":number,
        "itemId":number,
        "objectiveCriteriaScore":number,
        "pictureUrl":string
      }
    ]
  }) => {
  return request({
    url: '/cleaning/inspection/submit',
    method: 'post',
    data
  });
};

// 创建检查实例
export const createInspection = (data: {
    "id": number,
    "templateId": number,
    "zoneId": number,
    "assignee": string,
    "actualScore": number,
    "itemDetails": [
      {
        "id": number,
        "inspectionId": number,
        "objectiveCriteriaId": number,
        "itemId": number,
        "objectiveCriteriaScore": number,
        "pictureUrl":string
      }
    ]
  }) => {
  return request({
    url: '/cleaning/inspection/create',
    method: 'post',
    data
  });
};

// 分页查询检查实例列表
export const getInspectionList = (params: commonParams & { pageQuery: pageQuery, timeZone?: string }) => {
  return request({
    url: '/cleaning/inspection/list',
    method: 'get',
    params
  });
};

export const getTemplateList = () => {
  return request({
    url: '/cleaning/inspection/templateNames',
    method: 'get'
  });
}

// 获取实例详情
export const getInspectionDetail = (id: string | number, params?: commonParams) => {
  return request({
    url: `/cleaning/inspection/detail/${id}`,
    method: 'get',
    params
  });
};

// 新增或更新模板
export const saveTemplate = (data: {
  "id": number,
  "name": string,
  "zoneId": number,
  "minimumAcceptableScore": number,
  "inspectionTime": string,
  "contractReference": string,
  "frequency": number,
  "assignee": string,
  "reporter": string,
  "frequencyUnit": string,
  "items": [
    {
      "itemName": string,
      "weight": number,
      "imageReference": string,
      "sortOrder": number,
      "deficiencyTypes": string,
      "items": [
        {
          "criteriaKey": string,
          "criteriaValue": string
        }
      ]
    }
  ]
}) => {
  return request({
    url: `/cleaning/inspection/templateSave`,
    method: 'post',
    data
  });
};

// 获取模板汇总信息（按位置分组）
export const getZoneTemplates = (params: commonParams & {zoneId?: string, timeZone?: string}) => {
  return request({
    url: `/cleaning/inspection/zoneTemplates`,
    method: 'get',
    params
  });
};

// 获取检查实例汇总信息（按位置分组）
export const getZoneList = (params: commonParams & {zoneId?: string, timeZone?: string}) => {
  return request({
    url: `/cleaning/inspection/zoneList`,
    method: 'get',
    params
  });
};

// 分页查询检查模板列表
export const getTemplates = (params: commonParams & { pageQuery: pageQuery, timeZone?: string }) => {
  return request({
    url: `/cleaning/inspection/templates`,
    method: 'get',
    params
  });
};

// 获取模板详情
export const getTemplateDetail = (id: number, params?: commonParams) => {
  return request({
    url: `/cleaning/inspection/templateDetail/${id}`,
    method: 'get',
    params
  });
};

// 删除模板
export const deleteTemplate = (id: number) => {
  return request({
    url: `/cleaning/inspection/template/${id}`,
    method: 'delete'
  });
};

// 获取统计数据
export const getStatistics = (params: commonParams) => {
  return request({
    url: `/cleaning/inspection/statistics`,
    method: 'get',
    params
  });
};

// 获取图表数据
export const getChart = (params: commonParams) => {
  return request({
    url: `/cleaning/inspection/chart`,
    method: 'get',
    params
  });
};