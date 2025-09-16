import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EventInfoQuery, HourEndResult, EventChartLoad, EsgEventSignalPage } from './types';

/**
 * 获取事件信息数据
 */
export function queryHourEndInfo(query: EventInfoQuery): AxiosPromise<HourEndResult[]> {
  return request({
    url: '/esg/eventSignal/queryHourEndList',
    method: 'get',
    params: query
  });
}

/**
 * 获取事件信息数据
 */
export function queryEventInfo(query: EventInfoQuery): AxiosPromise<EventChartLoad[]> {
  return request({
    url: '/esg/eventSignal/queryEventSignalInfo',
    method: 'get',
    params: query
  });
}

/**
 * 查询事件预测翻页信息
 */
export function pageEventSignalList(query: EventInfoQuery): AxiosPromise<EsgEventSignalPage[]> {
  return request({
    url: '/esg/eventSignal/pageEventSignalList',
    method: 'get',
    params: query
  });
}
