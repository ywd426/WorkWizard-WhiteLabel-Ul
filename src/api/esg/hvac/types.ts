/**
 * 折线图查询参数
 */
export interface LineChartQuery {
  building?: string;
  pickDate?: string;
  modeType?: string;
  forecastDate?: string;
  markAreaType?: string;
}
/**
 * 折线图返回参数
 */
export interface LineChartForm {
  legendDataList?: string[];
  legendColorList?: string[];
  xaxisScaleList?: string[];
  yaxisNumber?: number;
  lineList?: LineEveryChart[];
  markArea?: MarkAreaAry[];
}

/**
 * X轴数据参数
 */
export interface LineEveryChart {
  lineType?: string;
  xaxisSort?: number;
  yaxisSort?: number;
  dashedFlag?: boolean;
  areaStyle?: string;
  xaxisDataList?: string[];
}

/**
 * 副标题总参数
 */
export interface SubtextForm {
  length?: number;
  params?: SubtextParam[];
}

/**
 * 副标题单一参数
 */
export interface SubtextParam {
  label?: string;
  value?: string;
  styleParam?: {};
}

/**
 * 阴影区阶段参数
 */
export interface MarkAreaAry {
  markAreaId?: string;
  sort?: string;
  name?: string;
  startAxis: string;
  endAxis: string;
  color?: string;
}

/**
 * 抽屉查询参数
 */
export interface DrawerQuery {
  startDate?: string;
  building?: string;
  drawerType?: string;
  areaName?: string;
  markAreaId?: string;
}

/**
 * 抽屉Actions参数
 */
export interface OperationDrawerAction {
  thoughts?: string;
  operation?: string;
  savingDeduction?: string;
  factorLine?: LineChartForm;
  actionLine?: LineChartForm;
}

/**
 * 抽屉汇总参数
 */
export interface OperationDrawerAll {
  markAreaId?: string;
  building?: string;
  title?: string;
  actionList?: OperationDrawerAction[];
  factorList?: string[];
}

/**
 * 地图展示查询参数
 */
export interface EsgHvacGraphBo {
  mapId?: string;
}

/**
 * 地图回参总参数
 */
export interface EsgHvacGraphMapVo {
  id?: string;
  name?: string;
  type?: string;
  imageOssId?: string;
  coordinates?: EsgHvacGraphMapCoordinateVo[];
  frame?: EsgHvacGraphMapCoordinateVo;
}

/**
 * 地图回参区域参数
 */
export interface EsgHvacGraphMapCoordinateVo {
  id?: string;
  name?: string;
  co2Value?: string;
  coords?: string[];
  x?: number,
  y?: number,
  devices?: EsgHvacGraphMapDeviceVo[];
}

/**
 * 地图回参设备参数
 */
export interface EsgHvacGraphMapDeviceVo {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  offset?: string;
  status?: string;
}

/**
 * 地图区域按钮参数
 */
export interface MapAreaButton {
  id?: string;
  title?: string;
  tipFlag?: boolean;
}

/**
 * 地图区域楼层参数
 */
export interface MapAreaFloor {
  id?: string;
  title?: string;
  tipFlag?: boolean;
}

/**
 * 楼层-区域-各类信息参数
 */
export interface FloorAreaCell {
  id?: string;
  showId?: string;
  showTips?: string;
  showType?: string;
}

/**
 * 楼层-区域-各类信息参数合
 */
export interface FloorAreaList {
  id?: string;
  floorAreaTitle?: string;
  floorAreaList?: FloorAreaCell[];
}

/**
 * Zonal Status 通用查询参数
 */
export interface ZonalBaseQuery {
  building?: string;
  pickDate?: string;
  mode?: string;
  type?: string;
  floorId?: string;
  areaId?: string;
  equipmentId?: string;
  line?: string;
  part?: string;
}

/**
 * Zonal Status 详情显示信息
 */
export interface ZonalDetail {
  id?: number;
  type?: string;
  load?: string;
  status?: string;
  unit?: string;
}

/**
 * Zonal Status 区域显示信息
 */
export interface ZonalAreaInfo {
  id?: string;
  title?: string;
  tipFlag?: boolean;
  areaList?: string[];
  itemChildList?: EsgHvacZonalAreaItem[];
}

/**
 * Zonal Status 区域详情信息
 */
export interface EsgHvacZonalAreaItem {
  id?: string;
  floorAreaTitle?: string;
  floorAreaList?: ZonalAreaDetailChild[];
}

/**
 * HVAC Map 通用查询参数
 */
export interface MapBaseQuery {
  building?: string;
  floorId?: string;
  areaId?: string;
  equipmentId?: string;
  mapId?: string;
  dataType?: string;
}

/**
 * 楼层-区域-各类信息参数
 */
export interface ZonalAreaDetailChild {
  showId?: string;
  showTips?: string;
  showType?: string;
}

/**
 * 楼层-区域-设备详情
 */
export interface FloorAreaEquipment {
  sensorType?: string;
  installationPosition?: string;
  externalDimensions?: string;
  groundClearanceSize?: string;
  specificLocation?: string;
  notice?: string;
}
