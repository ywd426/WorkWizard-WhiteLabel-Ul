import request from '@/utils/request';
import { RobotCustomFields, MntRobotSpatialQuery, MntRobotTrajectoryQuery, MntRobotTrajectoryBo } from './types';

export const getRobotList = (dateRange: Array<any>) => {
  return request({
    url: `/robot/list`,
    method: 'get',
    params: dateRange
  });
};

export const getScheduleList = (params) => {
  return request({
    url: `/robot/schedule/list`,
    method: 'get',
    params: params
  });
};

export const getTasks = (params) => {
  return request({
    url: `/robot/overview/tasks`,
    method: 'get',
    params
  });
};

export const getPercentageArea = (params) => {
  return request({
    url: `/robot/overview/percentageArea`,
    method: 'get',
    params
  });
};

export const getDuration = (params) => {
  return request({
    url: `/robot/overview/duration`,
    method: 'get',
    params
  });
};

export const getActualArea = (params) => {
  return request({
    url: `/robot/overview/actualArea`,
    method: 'get',
    params
  });
};

export const getOverViewCharts = (params) => {
  return request({
    url: `/robot/overview/charts`,
    method: 'get',
    params
  });
};

export const getCostCharts = (params) => {
  return request({
    url: `/robot/cost/charts`,
    method: 'get',
    params
  });
};

export const getRobotDetail = (id: string) => {
  return request({
    url: `/robot/detail/${id}`,
    method: 'get'
  });
};

export const getRobotEventList = (params) => {
  return request({
    url: `/robot/events`,
    method: 'get',
    params
  });
};

export const getRobotEventDetail = (id: string) => {
  return request({
    url: `/robot/events/${id}`,
    method: 'get'
  });
};

export const saveRobotEvent = (data: {
  'eventId': number;
  'contactMethod': string;
  'referenceId': string;
  'contactValue': string;
  'responseDeadline': string;
}) => {
  return request({
    url: `/robot/events/report`,
    method: 'post',
    data
  });
};

export const getScheduleDetail = (taskId: string, viewType: string) => {
  return request({
    url: `/robot/schedule/detail`,
    method: 'get',
    params: { taskId, viewType }
  });
};

export const geCostConsumption = (params) => {
  return request({
    url: `/robot/cost/consumption`,
    method: 'get',
    params
  });
};

export const getGanttData = (pageQuery) => {
  return request({
    url: `robot/schedule/charts`,
    method: 'get',
    params: pageQuery
  });
};

export const getTaskSubModeList = () => {
  return request({
    url: `/robot/dict/type/taskSubModeList`,
    method: 'get'
  });
};
export const getTaskModeList = () => {
  return request({
    url: `/robot/dict/type/taskModeList`,
    method: 'get'
  });
};
export const getRobotTypes = () => {
  return request({
    url: `/robot/dict/type/robotTypes`,
    method: 'get'
  });
};
export const getRobotSnList = () => {
  return request({
    url: `/robot/dict/type/robotSnList`,
    method: 'get'
  });
};
export const getRobotNames = () => {
  return request({
    url: `/robot/dict/type/robotNames`,
    method: 'get'
  });
};

export const getRobotStatistics = (params) => {
  return request({
    url: `/robot/statistics`,
    method: 'get',
    params
  });
};

export const getLocations = () => {
  return request({
    url: `/robot/dict/type/locations`,
    method: 'get'
  });
};

export const getFloors = () => {
  return request({
    url: `/robot/dict/type/floors`,
    method: 'get'
  });
};

export function getCustomFields(relateId: string, type: string) {
  const query = {
    relateId,
    type
  };
  return request({
    url: '/robot/robotCustomFields',
    method: 'get',
    params: query
  });
}
export function saveCustomFields(formData: RobotCustomFields) {
  return request({
    url: '/robot/saveCustomFields',
    method: 'post',
    data: formData
  });
}
export function removeCustomFieldsById(id: string) {
  return request({
    url: '/robot/deleteCustomFields/' + id,
    method: 'delete'
  });
}
export function removeRobotCustomFields(relateId: string, type: string) {
  const query = {
    relateId,
    type
  };
  return request({
    url: '/robot/deleteRobotCustomFields',
    method: 'delete',
    params: query
  });
}

// 获取机器人成本设置
export const getCostInfo = () => {
  return request({
    url: `/robot/setting/info`,
    method: 'get'
  });
};

export function saveCost(formData: RobotCustomFields) {
  return request({
    url: '/robot/setting/save',
    method: 'post',
    data: formData
  });
}

export function saveSNName(robotSn: string, robotName: string) {
  return request({
    url: 'robot/updateRobotName',
    method: 'put',
    data: { robotSn, robotName }
  });
}

// 获取机器人状态和经纬度信息
export const getGoogleMap = (params) => {
  return request({
    url: `robot/spatial/overview`,
    method: 'get',
    params
  });
};

// 获取室内机器人位置
export const getRobotPosition = (params) => {
  return request({
    url: `robot/spatial/liveMap`,
    method: 'get',
    params
  });
};

// 获取机器人详情
export const getRobotSpatial = (robotSn) => {
  return request({
    url: `/robot/spatial/detail/${robotSn}`,
    method: 'get'
  });
};

// 获取室内清扫位置统计
export const getAreaMap = (params) => {
  return request({
    url: `/robot/spatial/areaMaps`,
    method: 'get',
    params
  });
};

export const getRobotPos = (robotSn: string) => {
  return request({
    url: `/robot/spatial/robotMap/${robotSn}`,
    method: 'get'
  });
};

export const getRealTimeRobot = (floorId: string) => {
  return request({
    url: `/robot/spatial/realtime/${floorId}`,
    method: 'get'
  });
};

export const convertUrlToBlobUrl = (imgUrl: string): Promise<Blob> => {
  const query = {
    url: imgUrl
  };
  return request({
    url: '/resource/oss/blob',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

// 获取清洁任务列表
export const getCleanTaskList = (params) => {
  return request({
    url: `/robot/spatial/cleanTaskList`,
    method: 'get',
    params
  });
};
/**
 * 查询地图集合
 * @param query 查询参数
 * @returns 地图集合
 */
export const getRobotMaps = (query: MntRobotSpatialQuery) => {
  return request({
    url: `/robot/spatial/maps`,
    method: 'get',
    params: query
  });
};

/**
 * 点击地图查询机器人轨迹集合
 * @param query 查询参数
 * @returns 轨迹列表
 */
export const getRobotTrajectory = (query: MntRobotTrajectoryQuery) => {
  return request({
    url: `/robot/spatial/trajectory`,
    method: 'get',
    params: query
  });
};

/**
 * 轨迹详情
 * @param bo 查询参数
 * @returns 轨迹详情
 */
export const getRobotTrajectoryDetail = (id: string) => {
  return request({
    url: `/robot/spatial/trajectory/` + id,
    method: 'get'
  });
};
export const getMapRobotDetail = (query: MntRobotTrajectoryQuery) => {
  return request({
    url: `/robot/spatial/map/detail`,
    method: 'get',
    params: query
  });
};
