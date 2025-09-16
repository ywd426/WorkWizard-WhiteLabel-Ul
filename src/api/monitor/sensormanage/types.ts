/**
 * 传感器查询参数
 */
export interface SensorInfoQuery extends PageQuery {
  sensorName?: string;
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  sensorType?: string;
  equipmentName?: string;
  search?: string;
  type?: string;
  orderByColumn: string;
  isAsc: string;
}
/**
 * 传感器异常查询参数
 */
export interface SensorAlarmQuery extends PageQuery {
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  severity?: string;
  alarmType?: string;
  previousDays?: number;
  sensorType?: string;
  dataType?: string;
  equipmentName?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
  showHiddenAlarm: boolean;
}
/**
 * 传感器预测查询参数
 */
export interface SensorForecastQuery extends PageQuery {
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  futureDays?: number;
  sensorType?: string;
  dataType?: string;
  equipmentName?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
/**
 * 传感器记录类型
 */
export interface SensorForm {
  sensorId: string;
  sensorType: string;
  sensorName: string;
  equipmentName: string;
  location: string;
  currentReading: string;
  status: string;
  statusValue: string;
  power?: number;
  lastDate?: string;
  width?: number | string;
}

/**
 * 传感器异常记录类型
 */
export interface SensorAlarmForm {
  id: string;
  sensorId: string;
  dataType: string;
  sensorType: string;
  sensorName: string;
  equipmentName: string;
  location: string;
  endTimestamp: string;
  alarmType: string;
  severity: string;
  alarmTypeValue: string;
  status: string;
}

/**
 * 传感器预测记录类型
 */
export interface SensorForecastForm {
  sensorId: string;
  sensorType: string;
  dataType: string;
  sensorName: string;
  equipmentName: string;
  location: string;
  time: string;
  minValue: string;
  maxValue: string;
  meanValue: string;
  forecast: string;
}
export interface LocationVo {
  regionList: string[];
  stateList: string[];
  cityList: string[];
}
export interface QueryForecast {
  sensorId: string;
  dataType: string;
}
export interface LocationForm {
  country: string;
  state: string;
  city: string;
}
export interface DataModel {
  currentData: number;
  previousData: number;
}
export interface StatisticsData {
  totalData: number;
  activeData: DataModel;
  inactiveData: DataModel;
  lowPowerData: DataModel;
}
export interface TrendModel {
  dateList: [];
  seriesOneData: [];
  seriesTwoData: [];
}
export interface AlertStatisticsModel {
  todayAlarmNum: number;
  todaySensorNum: number;
  yesterdaySensorNum: number;
  todayUnresolvedAlarmNum: number;
  yesterdayUnresolvedAlarmNum: number;
}
