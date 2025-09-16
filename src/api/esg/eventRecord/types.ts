export interface EsgEventRecord {
  predictions?: EsgEventPrediction[];
}

export interface EsgEventPrediction {
  businessId?: string;
  iso?: string;
  eventType?: string;
  yearMonth?: string;
  date?: string;
  probability?: string;
  timezone?: string;
  ranking?: number[];
  eventProbability?: string[];
  hourEnding?: string[];
  results?: string[];
  settlement?: string[];
}

/**
 * 查询参数
 */
export interface EventInfoQuery {
  building?: string;
  checkDate?: string;
  isoType?: string;
  eventType?: string;
  pageSize?: number;
  pageNum?: number;
  orderByColumn?: string;
  isAsc?: boolean;
  yearMonth?: string;
}

/**
 * 翻页信息
 */
export interface EsgEventRecordTable {
  hourEnding?: string;
  eventProbability?: string;
  results?: string;
  settlement?: string;
}
