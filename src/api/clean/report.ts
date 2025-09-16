import request from '@/utils/request';

// 获取报告列表
export function getReportList(query) {
  return request({
    url: '/clean/report/list',
    method: 'get',
    params: query
  });
}

// 生成报告
export function generateReportApi(data) {
  return request({
    url: '/clean/report/generate',
    method: 'post',
    data: data
  });
}

// 下载报告
export function downloadReportApi(reportId) {
  return request({
    url: `/clean/report/download/${reportId}`,
    method: 'get',
    responseType: 'blob'
  });
}

// 发送报告邮件
export function emailReportApi(data) {
  return request({
    url: '/clean/report/email',
    method: 'post',
    data: data
  });
}

// 获取报告详情
export function getReportDetail(reportId) {
  return request({
    url: `/clean/report/detail/${reportId}`,
    method: 'get'
  });
}

// 获取机器人事件详情
export function getRobotEventDetail(eventId) {
  return request({
    url: `/clean/report/events/${eventId}`,
    method: 'get'
  });
}