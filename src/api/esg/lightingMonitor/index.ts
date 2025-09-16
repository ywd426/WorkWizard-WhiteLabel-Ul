import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EsgLightingQuery, EsgLightingFloorInfo } from './types';

/**
 * 根据楼层ID查询楼层信息
 */
export function getInfoById(query: EsgLightingQuery): AxiosPromise<EsgLightingFloorInfo> {
  return request({
    url: '/esg/lighting/getInfoById',
    method: 'get',
    params: query
  });
}
