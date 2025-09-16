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
