import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RouteRecordRaw } from 'vue-router';
import { RoutersJs } from './types';


// 获取路由
export function getRouters(): AxiosPromise<RouteRecordRaw[]> {
  return request({
    url: '/system/menu/getRouters',
    method: 'get'
  });
}


// 获取路由
// export function getRoutersJs(): AxiosPromise<RoutersJs> {
//   return request({
//     url: '/system/menu/getRouters',
//     method: 'get'
//   });
// }
