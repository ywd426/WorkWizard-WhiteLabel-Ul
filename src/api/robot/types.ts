export interface CustomFieldsForm {
  name: string;
  content: string;
}
export interface RobotCustomFields {
  relateId: string;
  type: string;
  details: CustomFieldsForm[];
}
export interface MntRobotSpatialQuery extends PageQuery {
  /** 楼栋id */
  buildingId?: string;
  /** 楼层id */
  floorId?: number;
  /** 房间id */
  zoneId?: number;
  /** 机器人序列号 */
  robotSn?: string;
  /** 机器人名称 */
  robotName?: string[];
}

export interface MntRobotTrajectoryQuery {
  /** 地图名称 */
  mapName: string;
}

export interface MntRobotTrajectoryBo {
  /** 地图名称 */
  mapName: string;
  /** 更新时间 */
  updateTime: string; // ISO格式日期字符串
}
