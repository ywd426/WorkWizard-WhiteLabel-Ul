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

type taskParams = {
    "workOrderId": number,
    "templateId": number,
    "name": string,
    "workOrderType": string,
    "buildingId": string,
    "zoneId": number,
    "assigneeId": string,
    "reporterId": string,
    "startTime": string,
    "dueTime": string,
    "status": string,
    "source": string,
    "description": string,
    "priority": string,
    "duration": number,
    "durationUnit": string,
    "workOrderMetricsBo": [
        {
        "workOrderId": number,
        "dataType": string,
        }
    ]
}

type template = {
    "templateId": number,
    "templateType": string,
    "baseWorkOrderId": number,
    "workOrderBo": {
      "workOrderId": number,
      "templateId": number,
      "name": string,
      "workOrderType": string,
      "buildingId": string,
      "zoneId": number,
      "assigneeId": string,
      "reporterId": string,
      "startTime": string,
      "dueTime": string,
      "status": string,
      "source": string,
      "description": string,
      "priority": string,
      "duration": number,
      "durationUnit": string,
      "workOrderMetricsBo": [
        {
          "workOrderId": number,
          "dataType": string
        }
      ]
    },
    "templateAlertsBoList": [
      {
        "templateId": number,
        "dataType": string,
        "category": number,
        "alarmType": string,
        "intervalValue": number,
        "severityPriorityMap": string
      }
    ],
    "scheduledTemplateSettingsBo": {
      "templateId": number,
      "expectedDurationHours": number,
      "intervalValue": number,
      "intervalUnit": string,
      "dailyStartTime": string,
      "dailyEndTime": string,
      "activeDays": "string"
    },
    "alertBasedTemplateSettingsBo": {
      "templateId": number,
      "logicType": string,
      "numValue": number,
      "cooldownPeriod": number,
      "cooldownPeriodUnit": string
    },
    "workOrderMetricsBo": [
      {
        "workOrderId": number,
        "dataType": string
      }
    ]
  }

// 修改工单
export const updateWorkOrder = (data: any) => {
  return request({
    url: `/cleaning/task/workOrders`,
    method: 'put',
    data
  });
};

// 新增工单
export const createWorkOrder = (data: taskParams) => {
  return request({
    url: `/cleaning/task/workOrders`,
    method: 'post',
    data
  });
};

// 获取模板工单
export const getTemplates = (params: commonParams & { pageQuery: pageQuery, timeZone: string }) => {
  return request({
    url: `/cleaning/task/templates`,
    method: 'get',
    params
  });
};

// 修改模板
export const updateTemplate = (data: any) => {
  return request({
    url: `/cleaning/task/templates`,
    method: 'put',
    data
  });
};

// 新增模板
export const createTemplate = (data: template) => {
  return request({
    url: `/cleaning/task/templates`,
    method: 'post',
    data
  });
};

// 获取区域模板工单
export const getZoneTemplates = (params: commonParams & {zoneId: string, timeZone: string}) => {
  return request({
    url: `/cleaning/task/zoneTemplates`,
    method: 'get',
    params
  });
};

// 获取区域推荐工单
export const getZoneRecommends = (params: commonParams & {zoneId: string, timeZone: string} ) => {
  return request({
    url: `/cleaning/task/zoneRecommends`,
    method: 'get',
    params
  });
};

// 获取区域活跃工单
export const getZoneActives = (params: commonParams & {zoneId: string, timeZone: string}) => {
  return request({
    url: `/cleaning/task/zoneActives`,
    method: 'get',
    params
  });
};

// 获取工单详情
export const getWorkOrderDetail = (workOrderId: number, params?: commonParams) => {
  return request({
    url: `/cleaning/task/workOrders/${workOrderId}`,
    method: 'get',
    params
  });
};

// 删除工单
export const deleteWorkOrder = (workOrderId: string) => {
  return request({
    url: `/cleaning/task/workOrders/${workOrderId}`,
    method: 'delete'
  });
};

// 获取模板详情
export const getTemplateDetail = (templateId: number, params?: commonParams) => {
  return request({
    url: `/cleaning/task/templates/${templateId}`,
    method: 'get',
    params
  });
};

// 删除模板
export const deleteTemplate = (templateId: number) => {
  return request({
    url: `/cleaning/task/templates/${templateId}`,
    method: 'delete'
  });
};

// 获取模板性能统计
export const getTemplateStatistics = (templateId: string) => {
  return request({
    url: `/cleaning/task/templates/statistics`,
    method: 'get',
    params: {
      templateId
    }
  });
};

// 获取模板性能信息
export const getTemplatePerformance = (templateId: string) => {
  return request({
    url: `/cleaning/task/templates/performance`,
    method: 'get',
    params: {
      templateId
    }
  });
};

// 获取模板工单各个数据类型效果
export const getTemplateEffectiveness = (params: {
    templateId: string,
    zoneId: string,
    dataType: string,
    hours: number
}) => {
  return request({
    url: `/cleaning/task/templates/effectiveness`,
    method: 'get',
    params
  });
};

// 获取模板告警触发器
export const getTemplateAlertTriggers = (params: {zoneId: number}) => {
  return request({
    url: `/cleaning/task/templates/alertTriggers`,
    method: 'get',
    params
  });
};

// 获取工单统计信息: "1":Today at a Glance，"2":Performance，"3":Cost,默认值"1"
export const getTaskStatistics = (params: commonParams & {timeZone: string, type: string}) => {
  return request({
    url: `/cleaning/task/statistics`,
    method: 'get',
    params
  });
};

// 获取AI推荐工单
export const getAIRecommends = (params: commonParams & {timeZone: string, pageQuery : pageQuery }) => {
  return request({
    url: `/cleaning/task/recommends`,
    method: 'get',
    params
  });
};

// 获取活跃工单
export const getActiveTasks = (params: commonParams & {timeZone: string, pageQuery : pageQuery }) => {
  return request({
    url: `/cleaning/task/actives`,
    method: 'get',
    params
  });
};