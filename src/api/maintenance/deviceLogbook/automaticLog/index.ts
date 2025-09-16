import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RuleQuery } from './types';
export function list(query: RuleQuery): AxiosPromise<any> {
  return request({
    url: '/device/log/rule/ruleInfo',
    method: 'get',
    params: query
  });
}
export function saveRuleInfo(data: any) {
  return request({
    url: '/device/log/rule',
    method: 'post',
    data: data
  });
}
export function ruleDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/log/rule/detail/' + id,
    method: 'get'
  });
}
export function deleteRule(id: string) {
  return request({
    url: '/device/log/rule/' + id,
    method: 'delete'
  });
}
export function templateList(query: RuleQuery): AxiosPromise<any> {
  return request({
    url: '/device/log/template/formInfo',
    method: 'get',
    params: query
  });
}
export function saveTemplateInfo(data: any) {
  return request({
    url: '/device/log/template',
    method: 'post',
    data: data
  });
}
export function templateDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/log/template/detail/' + id,
    method: 'get'
  });
}
export function deleteTemplate(id: string) {
  return request({
    url: '/device/log/template/' + id,
    method: 'delete'
  });
}
export function rulesByTemplate(equipmentId: string, category: string) {
  const query = {
    equipmentId,
    category
  };
  return request({
    url: '/device/log/template/rules',
    method: 'get',
    params: query
  });
}
export function updateTemplateStatus(id: string, status: boolean) {
  const query = {
    status
  };
  return request({
    url: '/device/log/template/' + id,
    method: 'put',
    params: query
  });
}
export function ruleTriggerDetail(id: string): AxiosPromise<any> {
  return request({
    url: '/device/manualLog/autoDetail/' + id,
    method: 'get'
  });
}
