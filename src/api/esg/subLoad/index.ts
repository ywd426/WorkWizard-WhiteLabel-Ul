import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SubLoadQuery, SubLoadTreeInfo } from './types';
import { LineChartForm } from '@/api/esg/hvac/types';

/**
 * 查询树形节点信息
 */
export function getSubLoadTreeInfo(query: SubLoadQuery): AxiosPromise<SubLoadTreeInfo> {
  return request({
    url: '/esg/subLoad/getSubLoadTreeInfo',
    method: 'get',
    params: query
  });
}

/**
 * 查询树形节点信息
 */
export function getSubLineChartDate(query: SubLoadQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/subLoad/getSubLineChartDate',
    method: 'get',
    params: query
  });
}
