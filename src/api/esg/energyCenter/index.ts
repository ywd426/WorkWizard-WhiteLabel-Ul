import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LineChartQuery, LineChartForm, PercentageForm, BuildingDictQuery, BuildingDictForm, MoreDetailsForm } from './types';

/**
 * 获取折线图数据
 */
export function lineChartData(query: LineChartQuery): AxiosPromise<LineChartForm> {
  return request({
    url: '/esg/energyCenter/lineChart',
    method: 'get',
    params: query
  });
}

/**
 * 获取百分比数据
 */
export function percentageData(query: LineChartQuery): AxiosPromise<PercentageForm> {
  return request({
    url: '/esg/energyCenter/percentageData',
    method: 'get',
    params: query
  });
}

/**
 * 获取建筑物下拉
 */
export function buildingData(query: BuildingDictQuery): AxiosPromise<BuildingDictForm[]> {
  return request({
    url: '/esg/energyCenter/buildingData',
    method: 'get',
    params: query
  });
}

/**
 * 获得建筑物默认第一项
 */
export function defaultBuilding(query: BuildingDictQuery): AxiosPromise<BuildingDictForm> {
  return request({
    url: '/esg/energyCenter/defaultBuildingData',
    method: 'get',
    params: query
  });
}

/**
 * 获取More Details数据
 */
export function moreDetailInfo(query: LineChartQuery): AxiosPromise<MoreDetailsForm> {
  return request({
    url: '/esg/energyCenter/moreDetailData',
    method: 'get',
    params: query
  });
}
