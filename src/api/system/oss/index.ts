import request from '@/utils/request';
import { OssQuery, OssVO } from './types';
import { AxiosPromise } from 'axios';

// 查询OSS对象存储列表
export function listOss(query: OssQuery): AxiosPromise<OssVO[]> {
  return request({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  });
}

// 查询OSS对象基于id串
export function listByIds(ossId: string | number): AxiosPromise<OssVO[]> {
  return request({
    url: '/resource/oss/listByIds/' + ossId,
    method: 'get'
  });
}

// 删除OSS对象存储
export function delOss(ossId: string | number | Array<string | number>) {
  return request({
    url: '/resource/oss/' + ossId,
    method: 'delete'
  });
}

// OSS图片对象存储
export const getMapLink = (query?: string): Promise<Blob> => {
  return request({
    url: '/resource/oss/link/' + query,
    method: 'get',
    responseType: 'blob'
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
