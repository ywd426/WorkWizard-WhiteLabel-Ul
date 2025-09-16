/**
 * 负载曲线类型
 */
export interface LoadCurveForm {
  building: string;
  pickDate: string;
}
/**
 * 更多信息返回对象
 */
export interface MoreDetailsVO {
  title: string;
  origin: number;
  optimize: number;
  deduction: number;
  percentage: string;
  dollar: number;
  price: string;
}
/**
 * 折线图查询参数
 */
export interface LineChartQuery {
  building?: string;
  startDate?: string;
  endDate?: string;
  pickDate?: string;
  lineTypes?: string;
  forecastDate?: string;
}
/**
 * 折线图返回参数
 */
export interface LineChartForm {
  xAxisDataList?: [];
  legendDataList?: [];
  legendColorList?: [];
}
/**
 * 百分比信息
 */
export interface PercentageForm {
  type?: string;
  usage?: string;
  deduction?: string;
  percentage?: string;
}
/**
 * 传感器下拉查询参数
 */
export interface BuildingDictQuery {
  buildingKey?: string;
}
/**
 * 建筑物级别传感器字典信息
 */
export interface BuildingDictForm {
  label?: string;
  value?: string;
}
/**
 * More Details信息
 */
export interface MoreDetailsForm {
  detailType?: string;
  dollar?: number;
  deduction?: number;
  origin?: number;
  optimize?: number;
  percentage?: string;
}
