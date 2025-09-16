import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LineChartQuery, LineChartForm, DrawerQuery, OperationDrawerAll, ZonalBaseQuery, ZonalDetail, MapAreaFloor, ZonalAreaInfo } from './types';

/**
 * 获取Climate室外折线图数据
 */
export function climateOutDoor(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/climateOutDoor',
    method: 'get',
    params: query
  });
}

/**
 * 获取Climate室内折线图数据
 */
export function climateInDoor(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/climateInDoor',
    method: 'get',
    params: query
  });
}

/**
 * 获取ClimateCO2折线图数据
 */
export function climateCo2(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/climateCo2',
    method: 'get',
    params: query
  });
}

/**
 * 获取Equipment Sys Load折线图数据
 */
export function equipmentSysLoad(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/equipmentSysLoad',
    method: 'get',
    params: query
  });
}

/**
 * 获取Equipment Ventilation折线图数据
 */
export function equipmentVentilation(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/equipmentVentilation',
    method: 'get',
    params: query
  });
}

/**
 * 获取Equipment Air折线图数据
 */
export function equipmentAir(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/equipmentAir',
    method: 'get',
    params: query
  });
}

/**
 * 获取Operation折线图数据
 */
export function operationData(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/operationData',
    method: 'get',
    params: query
  });
}

/**
 * 查询Operation弹出内容列表
 */
export function qeuryTitleList(query: DrawerQuery): AxiosPromise<OperationDrawerAll[]> {
  return request({
    url: '/esg/hvac/queryOperationDrawerList',
    method: 'get',
    params: query
  });
}

/**
 * 查询Operation弹出内容Action详情
 */
export function getOperationAction(query: DrawerQuery): AxiosPromise<OperationDrawerAll[]> {
  return request({
    url: '/esg/hvac/getOperationActionDrawer',
    method: 'get',
    params: query
  });
}

/**
 * 查询Operation弹出内容Factor详情
 */
export function getOperationFactor(query: DrawerQuery): AxiosPromise<OperationDrawerAll[]> {
  return request({
    url: '/esg/hvac/getOperationFactorDrawer',
    method: 'get',
    params: query
  });
}

/**
 * 获取头部最新信息
 */
export function getZonalTopInfo(query: ZonalBaseQuery): AxiosPromise<ZonalDetail> {
  return request({
    url: '/esg/hvac/getZonalTopInfo',
    method: 'get',
    params: query
  });
}

/**
 * 获取建筑物楼层信息
 */
export function getZonalFloorInfo(query: ZonalBaseQuery): AxiosPromise<MapAreaFloor> {
  return request({
    url: '/esg/hvac/getZonalFloorInfo',
    method: 'get',
    params: query
  });
}

/**
 * 获取楼层区域信息及详情列表
 */
export function getZonalAreaInfo(query: ZonalBaseQuery): AxiosPromise<ZonalAreaInfo> {
  return request({
    url: '/esg/hvac/getZonalAreaInfo',
    method: 'get',
    params: query
  });
}

/**
 * Detail折线图信息
 */
export function getMoreDetailLine(query: ZonalBaseQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/hvac/getMoreDetailLine',
    method: 'get',
    params: query
  });
}
