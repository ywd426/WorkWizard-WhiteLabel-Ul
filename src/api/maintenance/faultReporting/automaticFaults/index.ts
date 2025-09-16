import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RuleQuery } from './types';
export function list(query: RuleQuery): AxiosPromise<any> {
  return request({
    url: '/device/report/rule/ruleInfo',
    method: 'get',
    params: query
  });
}
export function saveRuleInfo(data: any) {
  return request({
    url: '/device/report/rule',
    method: 'post',
    data: data
  });
}
export function ruleDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/report/rule/detail/' + id,
    method: 'get'
  });
}
export function deleteRule(id: string) {
  return request({
    url: '/device/report/rule/' + id,
    method: 'delete'
  });
}
export function templateList(query: RuleQuery): AxiosPromise<any> {
  return request({
    url: '/device/report/template/formInfo',
    method: 'get',
    params: query
  });
}
export function saveTemplateInfo(data: any) {
  return request({
    url: '/device/report/template',
    method: 'post',
    data: data
  });
}
export function templateDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/report/template/detail/' + id,
    method: 'get'
  });
}
export function deleteTemplate(id: string) {
  return request({
    url: '/device/report/template/' + id,
    method: 'delete'
  });
}
export function rulesByTemplate(equipmentId: string) {
  const query = {
    equipmentId
  };
  return request({
    url: '/device/report/template/rules',
    method: 'get',
    params: query
  });
}
export function updateTemplateStatus(id: string, status: boolean) {
  const query = {
    status
  };
  return request({
    url: '/device/report/template/' + id,
    method: 'put',
    params: query
  });
}
export function ruleReportTriggerDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/faultReport/autoDetail/' + id,
    method: 'get'
  });
}
