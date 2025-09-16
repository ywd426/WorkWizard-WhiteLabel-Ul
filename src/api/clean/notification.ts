import request from '@/utils/request';
import { directPut } from '@/utils/request';

type commonParams = {
  'timeZone': 'string';
  'buildingId': 'string';
  'zoneType': 'string';
  'state': 'string';
  'city': 'string';
  'zone': ['string'];
  'country': 'string';
  'aggregationLevel': 'string';
  'aggregationType': 'string';
};

type pageQuery = {
  'pageSize': number;
  'pageNum': number;
  'orderByColumn'?: string;
  'isAsc'?: string;
  'firstNum'?: number;
};

// 获取通知设置详情
export const getNotificationSetting = (zoneId?: number) => {
  return request({
    url: `/cleaning/notification/setting`,
    method: 'get'
  });
};

// 保存通知设置
export const saveNotificationSetting = (data: {
  'id': number;
  'settingName': string;
  'zoneId': number;
  'moduleSettings': [
    {
      'id': number;
      'settingId': number;
      'moduleCode': string;
      'enabled': boolean;
      'notificationTypes': string;
    }
  ];
  'templates': [
    {
      'id': number;
      'settingId': number;
      'templateType': string;
      'subject': string;
      'content': string;
    }
  ];
  'schedule': {
    'id': number;
    'settingId': number;
    'workStartTime': string;
    'workEndTime': string;
    'restStartTime': string;
    'restEndTime': string;
    'weekdays': string;
    'batchNotification': boolean;
    'batchInterval': number;
  };
}) => {
  return request({
    url: '/cleaning/notification/setting',
    method: 'post',
    data
  });
};

export const getZoneNotificationList = (params: commonParams & { zoneId: number }) => {
  return request({
    url: `/cleaning/notification/feed/zoneList`,
    method: 'get',
    params
  });
};

export const getNotificationFeedList = (params: commonParams & { timeZone: string; pageQuery: pageQuery }) => {
  return request({
    url: '/cleaning/notification/feed/list',
    method: 'get',
    params
  });
};

export const getRobotNotice = () => {
  return request({
    url: '/cleaning/notification/feed/robot',
    method: 'get'
  });
};

export const deleteNotificationFeed = (notificationId: number) => {
  return request({
    url: `/cleaning/notification/feed/${notificationId}`,
    method: 'delete'
  });
};

export const setNotificationRead = (id: number | string) => {
  // return request({
  //   url: `/notification-api/robot/notification/${id}/read`,
  //   method: 'put',
  //   headers: {
  //     skipBaseURL: 'true'
  //   }
  // });
  return directPut(`${import.meta.env.VITE_NOTIFICATION_API}/notification-api/robot/notification/${id}/read`)
};
