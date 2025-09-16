import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EsgHvacGraphMapVo, MapBaseQuery, MapAreaFloor, ZonalAreaInfo } from '@/api/esg/hvac/types';

/**
 * 获取建筑物楼层信息
 */
export function getFloorListWithTip(query: MapBaseQuery): AxiosPromise<MapAreaFloor> {
  return request({
    url: '/esg/hvacMap/getFloorListWithTip',
    method: 'get',
    params: query
  });
}

/**
 * 获取楼层区域信息
 */
export function getAreaListWithTip(query: MapBaseQuery): AxiosPromise<ZonalAreaInfo> {
  return request({
    url: '/esg/hvacMap/getAreaListWithTip',
    method: 'get',
    params: query
  });
}

/**
 * 获取地图展示信息
 */
export const getMapInfo = (query?: MapBaseQuery): AxiosPromise<EsgHvacGraphMapVo> => {
  return request({
    url: '/esg/hvacMap/getMapInfo',
    method: 'get',
    params: query
  });
};

/**
 * 获取设备消息
 */
export const getMessageInfo = (query?: MapBaseQuery): AxiosPromise<any> => {
  return request({
    url: '/esg/hvacMap/getMessageInfo',
    method: 'get',
    params: query
  });
};

/**
 * 获取楼层图片流
 */
export const getFloorImgData = (query?: string): Promise<Blob> => {
  return request({
    url: '/esg/hvacMap/download/' + query,
    method: 'get',
    responseType: 'blob'
  });
};
