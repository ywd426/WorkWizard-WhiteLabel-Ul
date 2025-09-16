import request from '@/utils/request';

export const getLocationList = () => {
  return request({
    url: `/cleaning/dict/type/locations`,
    method: 'get'
  });
};
export const getZoneList = (buildingId: string) => {
  return request({
    url: `/cleaning/dict/type/zones`,
    method: 'get',
    params: { buildingId }
  });
};

export const getRoomTypes = () => {
  return request({
    url: `/cleaning/dict/type/roomType`,
    method: 'get'
  });
};
