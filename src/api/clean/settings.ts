import request from '@/utils/request';

// 保存区域优先级信息
export const savePriority = (data: {
    "zoneId": number,
    "environmentProportion": number,
    "occupancyProportion": number,
    "consumableProportion": number,
    "wasteProportion": number
}) => {
  return request({
    url: '/cleaning/setting/savePriority',
    method: 'post',
    data
  });
};

// 保存预测信息
export const saveForecast = (data: {
    "zoneId": number,
    "category": number,
    "virtualType": boolean,
    "dataTypeEnableList": [
      {
        "dataType": string,
        "enable": boolean
      }
    ]
  }) => {
  return request({
    url: '/cleaning/setting/saveForecast',
    method: 'post',
    data
  });
};

// 保存成本基线
export const saveBaseline = (data: {
    "id": number,
    "team": string,
    "position": string,
    "payRate": number,
    "workingHours": number,
    "daysWeek": number
  }) => {
  return request({
    url: '/cleaning/setting/saveBaseline',
    method: 'post',
    data
  });
};

// 保存异常设置信息
export const saveAlert = (data: {
    "zoneId": string,
    "dataType": string,
    "virtualType": string,
    "upperThreshold": number,
    "lowerThreshold": number,
    "duration": number,
    "durationUnit": string,
    "upperWarningRange": number,
    "upperSevereRange": number,
    "upperCriticalRange": number,
    "lowerWarningRange": number,
    "lowerSevereRange": number,
    "lowerCriticalRange": number,
    "category": number
  }) => {
  return request({
    url: '/cleaning/setting/saveAlert',
    method: 'post',
    data
  });
};

type commonParams = {
   zoneId : number;
};

// 获取区域优先级信息
export const getPriority = (obj: commonParams) => {
  return request({
    url: '/cleaning/setting/priority',
    method: 'get',
    params: obj
  });
};

// 获取预测信息
export const getForecastDetail = (obj: commonParams & { category: number }) => {
  return request({
    url: '/cleaning/setting/forecastDetail',
    method: 'get',
    params: obj
  });
};

// 查询成本基线列表
export const getBaselines = (obj: {
    "pageSize": number,
    "pageNum": number,
    "orderByColumn": string,
    "isAsc": string,
    "firstNum": number
  }) => {
  return request({
    url: '/cleaning/setting/baselines',
    method: 'get',
    params: obj
  });
};

// 获取成本基线详情
export const getBaselineDetail = (id: number) => {
  return request({
    url: `/cleaning/setting/baselineDetail/${id}`,
    method: 'get'
  });
};

// 获取异常设置信息
export const getAlertDetail = (obj: {
    "zoneId": string,
    "category": number,
    "dataType": string
  }) => {
  return request({
    url: '/cleaning/setting/alertDetail',
    method: 'get',
    params: obj
  });
};

// 删除成本基线
export const deleteBaseline = (id: number) => {
  return request({
    url: `/cleaning/setting/baseline/${id}`,
    method: 'delete'
  });
};