import request from '@/utils/request';

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

// 获取机场统计数据
export const getAirportSummary = (obj: commonParams) => {
    return request({
      url: `/cleaning/airport/summary`,
      method: 'get',
      params: obj
    });
  };
  
  // 获取人员流量图表数据（按小时统计）
  export const getPassengerFlow = (obj: commonParams & { date?: string }) => {
    return request({
      url: `/cleaning/airport/passengerFlow`,
      method: 'get',
      params: obj
    });
  };
  
  // 位置统计, type:  1国家，2州，3城市，4机场
  export const getLocationStats = (obj: {location: string, type: string}) => {
    return request({
      url: `/cleaning/airport/locationStats`,
      method: 'get',
      params: obj
    });
  };
  
  // 获取机场的登机口Tree
  export const getGateTree = (obj: commonParams & { pageQuery: pageQuery }) => {
    return request({
      url: `/cleaning/airport/gateTree`,
      method: 'get',
      params: obj
    });
  };
  
  // 分页查询航班流水信息
  export const getFlightList = (obj: commonParams & { pageQuery: pageQuery }) => {
    return request({
      url: `/cleaning/airport/flightList`,
      method: 'get',
      params: obj
    });
  };
  
  // 根据zoneID获取航班信息
  export const getFlightInfo = (obj: { zoneId: string }) => {
    return request({
      url: `/cleaning/airport/flightInfo`,
      method: 'get',
      params: obj
    });
  };