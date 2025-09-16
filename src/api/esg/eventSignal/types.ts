/**
 * 查询参数
 */
export interface EventInfoQuery {
  building?: string;
  checkDate?: string;
  isoType?: string;
  pageSize?: number;
  pageNum?: number;
  orderByColumn?: string;
  isAsc?: boolean;
  yearMonth?: string;
}

/**
 * Hour End结果
 */
export interface HourEndResult {
  unit?: string;
  load?: string;
  tips?: string;
}

/**
 * Load数据
 */
export interface EventSignalInfo {
  period?: string;
  load?: string;
}

/**
 * Load结果
 */
export interface EventChartLoad {
  xAxisScaleList?: string[];
  list?: EventSignalInfo[];
}

/**
 * 翻页信息
 */
export interface EsgEventSignalPage {
  eventType?: string;
  hourEnding?: string;
  forecastTimestamp?: string;
  results?: string;
}
