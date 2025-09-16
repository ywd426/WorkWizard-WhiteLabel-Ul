import { defineStore } from 'pinia';
import { reactive } from 'vue';
import useAppStore from '@/store/modules/app';
import * as useUtils from '@/utils/index';

interface FilterItem {
    dateRange: [string, string],
    activeTime: string,
    showForecast: boolean,
    forecastDay: string,
    forecastDayValue: number,
    location: {
      country: string,
      state: string,
      city: string,
      building: string,
      zone: Array<string>,
    },
    floorZone: Array<string>,
    roomType: string,
    aggregationLevel: number | string,
    aggregationMethod: string,
    alertTypes?: Array<string>
}
interface PageFilter extends FilterItem {
  pageId: string;
}
export const useCleanStore = defineStore('clean', () => {
  const pageFilters = reactive(new Map<string, FilterItem>());

  // 获取默认过滤器配置
  const getDefaultFilter = (): FilterItem => ({
    dateRange: [useUtils.formatDateValue(new Date()), useUtils.formatDateValue(new Date())] as [string, string],
    activeTime: '1hour',
    showForecast: true,
    forecastDay: '+1d',
    forecastDayValue: 1,
    location: {
      country: '',
      state: '',
      city: '',
      building: '',
      zone: [],
    },
    floorZone: [],
    roomType: '',
    aggregationLevel: '',
    aggregationMethod: '',
    alertTypes: []
  });

  // 更新指定页面的过滤器状态
  const updatePageFilter = (pageId: string, filterData: Partial<FilterItem>) => {
    if (!pageFilters.has(pageId)) {
      pageFilters.set(pageId, getDefaultFilter());
    }
    const currentFilter = pageFilters.get(pageId);
    if (currentFilter) {
      Object.assign(currentFilter, filterData);
    }
  };

  // 重置指定页面的过滤器状态
  const resetPageFilter = (pageId: string) => {
    pageFilters.set(pageId, getDefaultFilter());
  };

  // 获取指定页面的过滤器参数
  const getPageFilterParams = (pageId: string) => {
    const filters = pageFilters.get(pageId) || getDefaultFilter();
    const commonParams = {
      "timeZone": useAppStore().currentTimeZone,
      "buildingId": filters.location.building,
      "zoneType": filters.roomType,
      "state": filters.location.state,
      "city": filters.location.city,
      "zone": [ Array.isArray(filters.floorZone) ? filters.floorZone.join(',') : filters.floorZone ],
      "country": filters.location.country,
      "aggregationLevel": filters.aggregationLevel,
      "aggregationType": filters.aggregationMethod,
    };
    return addDateRange(commonParams, filters.dateRange);
  };
  // 设置初始值
  const filters = reactive({
    dateRange: [useUtils.formatDateValue(new Date()), useUtils.formatDateValue(new Date())] as [string, string],
    activeTime: '1hour',
    showForecast: true,
    forecastDay: '+1d',
    forecastDayValue: 1,
    location: {
      country: '',
      state: '',
      city: '',
      building: '',
      zone: [],
    },
    floorZone: [],
    roomType: '',
    aggregationLevel: '',
    aggregationMethod: ''
  } as FilterItem);

  // 更新过滤条件
  const updateFilter = (filterData: Partial<FilterItem>) => {
    Object.assign(filters, filterData);
  };

  // 更新位置信息
  const updateLocation = (locationData: Partial<typeof filters.location>) => {
    Object.assign(filters.location, locationData);
  };

  const updateDateRange = (pageId: string,  dateRange: [string, string]) => {
    if (!pageFilters.has(pageId)) {
      pageFilters.set(pageId, getDefaultFilter());
    }
    const currentFilter = pageFilters.get(pageId);
    currentFilter.dateRange = dateRange;
  };

  const colors = {
    gray: '#A2AAAF',
    red: '#FF384C',
    yellow: '#E6A23C',
    orange: '#ff8401',
    green: '#67C23A',
    blue: '#409EFF',
    purple: '#909399',
    black: '#11191e',
    violet: '#944dff'
  };

  const heatMapColors = ['#ADEFC9', '#EDB601', '#FF8401', '#FF384C'];

  const colorPalette = [
    '#00AB9A', '#00BA4A', '#0099FF', '#526FFF ', '#944DFF', 
    '#FF26A8', '#FF384C', '#FF4400', '#FF8401', '#EDB601'
  ];

  // 重置过滤条件
  const resetFilter = () => {
    Object.assign(filters, {
      dateRange: ['', ''],
      activeTime: '1hour',
      showForecast: true,
      forecastDay: '+1d',
      forecastDayValue: 1,
      location: {
        country: '',
        state: '',
        city: '',
        building: '',
        zone: [],
      },
      floorZone: [],
      roomType: '',
      aggregationLevel: '',
      aggregationMethod: ''
    });
  };
  const addDateRange = (params: any, dateRange: any[], propName?: string) => {
    const search = params;
    search.params = typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
    dateRange = Array.isArray(dateRange) ? dateRange : [];
    if (typeof propName === 'undefined') {
        search.params['beginTime'] = dateRange[0];
        search.params['endTime'] = dateRange[1];
    } else {
        search.params['begin' + propName] = dateRange[0];
        search.params['end' + propName] = dateRange[1];
    }
    return search;
};
  // 获取过滤参数
  const getFilterParams = () => {
   const commonParams = {
       "timeZone": useAppStore().currentTimeZone,
        "buildingId": filters.location.building,
        "zoneType": filters.roomType,
        "state": filters.location.state,
        "city": filters.location.city,
        "zone": [ Array.isArray(filters.floorZone) ? filters.floorZone.join(',') : filters.floorZone ],
        "country": filters.location.country,
        "aggregationLevel": filters.aggregationLevel,
        "aggregationType": filters.aggregationMethod,
    };
    const dateRange = filters.dateRange;
    const params = addDateRange(commonParams, dateRange);

    return params;
  };

  const exportChart = (chart, name = 'chart-export.png') => {
  if (chart.value) {
    const url = chart.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

  return {
    filters,
    colors,
    heatMapColors,
    colorPalette,
    useMockData: {status: false},
    locationFilters: [
      {
          "value": "1",
          "label": "First building",
          "children": [
              {
                  "value": "1",
                  "label": "First Floor"
              },
              {
                  "value": "2",
                  "label": "Second Floor"
              }
          ]
      },
      {
          "value": "2",
          "label": "Second building",
          "children": [
              {
                  "value": "3",
                  "label": "First Floor"
              },
              {
                  "value": "4",
                  "label": "Second Floor"
              },
              {
                  "value": "5",
                  "label": "Third Floor"
              },
              {
                  "value": "6",
                  "label": "Fourth Floor"
              }
          ]
      },
      {
          "value": "3",
          "label": "Third building",
          "children": [
            {
              "value": "7",
              "label": "First Floor"
            },
            {
              "value": "8",
              "label": "Second Floor"
            },
            {
              "value": "9",
              "label": "Third Floor"
            }
          ]
      },
      {
          "value": "4",
          "label": "Fourth building",
          "children": [
            {
              "value": "10",
              "label": "First Floor"
            },
            {
              "value": "11",
              "label": "Second Floor"
            },
            {
              "value": "12",
              "label": "Third Floor"
            }
          ]
      }
    ],
    pageFilters,
    updatePageFilter,
    resetPageFilter,
    getPageFilterParams,
    updateFilter,
    updateLocation,
    updateDateRange,
    resetFilter,
    getFilterParams,
    exportChart
  };
});

export default useCleanStore;