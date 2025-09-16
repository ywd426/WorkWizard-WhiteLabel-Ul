import request from '@/utils/request';
export function getBuilding(regions: string, states: string, citys: string, zipCode: string) {
  const query = { regions, states, citys, zipCode };
  return request({
    url: '/monitor/chart/building',
    method: 'get',
    params: query
  });
}
export function getSensorTree(building: string) {
  const query = { building };
  return request({
    url: '/monitor/chart/sensors',
    method: 'get',
    params: query
  });
}
/**获取图表数据 */
export function getChartInfo(id: string) {
  return request({
    url: '/monitor/chart/detail/' + id,
    method: 'get'
  });
}
/**获取传感器数据类型 */
export function getDataTypeList(sensorId: string) {
  const query = { sensorId };
  return request({
    url: '/monitor/dict/type/dataType',
    method: 'get',
    params: query
  });
}
/**预览图表 */
export function previewChart(data: any) {
  return request({
    url: '/monitor/chart/preview',
    method: 'post',
    data: data
  });
}
/**添加图表 */
export function addSensorChart(data: any) {
  return request({
    url: '/monitor/chart',
    method: 'post',
    data: data
  });
}
/**编辑图表 */
export function editSensorChart(data: any) {
  return request({
    url: '/monitor/chart',
    method: 'put',
    data: data
  });
}
export function removeChart(id: string) {
  return request({
    url: '/monitor/dashboard/' + id,
    method: 'delete'
  });
}
/**获取图表部分数据 */
export function getPartChartInfo(sensorId: string, dataType: string) {
  const query = { sensorId, dataType };
  return request({
    url: '/monitor/chart/otherDetail',
    method: 'get',
    params: query
  });
}
/**图表分配分组 */
export function updateChartGroup(id: string, groupName: string) {
  const query = { id, groupName };
  return request({
    url: '/monitor/chart/chartGroup',
    method: 'put',
    params: query
  });
}
