import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EsgEventRecord, EventInfoQuery, EsgEventRecordTable } from './types';

/**
 * 获取事件信息数据
 */
export function saveEventRecord(data: EsgEventRecord): AxiosPromise<any> {
  return request({
    url: '/esg/eventSignal/saveEventRecord',
    method: 'post',
    data: data
  });
}

/**
 * 查询Record Table信息
 */
export function queryEventRecordList(query: EventInfoQuery): AxiosPromise<EsgEventRecordTable[]> {
  return request({
    url: '/esg/eventSignal/queryEventRecordList',
    method: 'get',
    params: query
  });
}
