export interface ReadingVO {
  code: string;
  name: string;
  icon: string;
  value: string;
  recordTime?: string;
}
export interface ChartInfoVO {
  sensorChartId: string;
  chartInfo: string;
}
export interface SensorInfoVO {
  sensorId: string;
  sensorName: string;
  registrationDate: string;
  installationDate: string;
  sensorType: string;
  equipmentName: string;
  modelVersion: string;
  companyAccount: string;
  brand: string;
  location: string;
  openAlarm: boolean;
  openForecast: boolean;
  vendorName: string;
  vendorAddress: string;
  vendorContact: string;
  website: string;
}
export interface AdditionalInfoVO {
  infoKey: string;
  infoValue: string;
}
/**
 * 传感器异常记录类型
 */
export interface SensorAlarmForm {
  id: string;
  sensorId: string;
  sensorType: string;
  sensorName: string;
  equipmentName: string;
  location: string;
  endTimestamp: string;
  alarmType: string;
  severity: string;
  status: string;
}
/**
 * 传感器预测记录类型
 */
export interface SensorForecastForm {
  minValue: string;
  maxValue: string;
  meanValue: string;
}
/**
 * 传感器异常设置
 */
export interface AlarmSettingForm {
  dataType: string;
  upperThreshold: string;
  upperFor: number;
  upperForType: string;
  upperTime: number;
  upperPer: number;
  upperPerype: string;
  lowerThreshold: string;
  lowerFor: number;
  lowerForType: string;
  lowerTime: number;
  lowerPer: number;
  lowerPerype: string;
}
export interface SensorAlarmSettingForm {
  sensorId: string;
  dataType: string;
  upperThreshold: number;
  lowerThreshold: number;
  frequency: number;
  duration: number;
  durationUnit: string;
  timeWindow: number;
  timeWindowUnit: string;
}
export interface CustomFieldsForm {
  name: string;
  content: string;
}
export interface SensorCustomFields {
  sensorId: string;
  details: CustomFieldsForm[];
}
