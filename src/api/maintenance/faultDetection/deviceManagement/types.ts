export interface LocationVo {
  regionList: string[];
  stateList: string[];
  cityList: string[];
}
export interface DeviceForm {
  equipmentId: string;
  equipmentName: string;
  location: string;
  recentDate: string;
  reportNum: number;
}
export interface DeviceQuery extends PageQuery {
  equipmentId?: string;
  equipmentName?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
export interface FaultQuery extends PageQuery {
  name?: string;
  equipmentId?: string;
  equipmentName?: string;
  ruleName?: string;
  assignee?: string;
  reporter?: string;
  severity?: string;
  status?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
export interface FaultDetectionForm {
  id: string;
  faultName: string;
  type: string;
  severity: string;
  equipmentId?: string;
  equipmentName?: string;
  startTimestamp: string;
  endTimestamp: string;
  faultStatus?: string;
  status?: string;
  confidenceLevel?: string;
  operationState?: string;
  faultAccuracyRating?: number;
  durationDetectedRating?: number;
}
