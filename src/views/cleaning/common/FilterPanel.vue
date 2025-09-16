<template>
  <div v-if="!showSettingFilter && !showSampleFilter" class="filter-panel">
    <!-- 顶部日期和时间选择区域 -->
    <slot name="top"></slot>
    <div class="date-filter">
      <div class="date-time-row">
        <div
          class="filter-left flex flex-row items-center gap-3"
          :style="{ 'flex-direction': sampleMode ? 'column' : 'row', 'align-items': sampleMode ? 'start' : 'center' }"
        >
          <div class="flex flex-row items-center gap-3">
            <div class="relative">
              <DateRangePicker v-model:dateRange="dateRange" :limit="limitDateRange" @refresh="handleDateRefresh" class="date-picker" />
            </div>

            <div class="time-buttons">
              <el-button
                v-for="item in timeRanges"
                :key="item.value"
                size="small"
                :type="activeTime === item.value ? 'primary' : 'default'"
                class="priority-btn"
                @click="setTimeRange(item.value)"
              >
                {{ item.label }}
              </el-button>
            </div>
          </div>

          <div class="forecast-toggle" v-if="showForecasts && !sampleMode">
            <el-checkbox v-model="showForecast" @change="handleForecastChange" class="forecast-checkbox">Show Forecast</el-checkbox>
            <div class="forecast-input">
              <el-input-number
                v-model="forecastDayValue"
                :min="1"
                :max="30"
                size="small"
                :disabled="!showForecast"
                @change="handleForecastDayChange"
              ></el-input-number>
            </div>
          </div>

          <div
            v-if="showAlerts || sampleMode || showStatus"
            class="flex flex-row justify-between alerts-checkbox"
            :style="{ 'width': sampleMode ? '100%' : 'auto' }"
          >
            <div class="flex gap-4 items-center">
              <div v-if="sampleMode" class="flex flex-row items-center gap-3 flex-1">
                <div class="filters-row two-columns w-full mb-0">
                  <div class="filter-item w-full max-w-[256px]">
                    <div id="sample-location" class="filter-control w-full">
                       <el-cascader
                        v-model="combinedLocation"
                        :options="combinedLocationOptions"
                        clearable
                        filterable
                        :props="{ checkStrictly: checkStrictly }"
                        placeholder="Country/State/City/Building/Floor/Zone"
                        @change="handleCombinedLocationChange"
                        popper-class="responsive-cascader"
                      />
                    </div>
                  </div>

                  <div class="filter-item max-w-[256px]">
                    <div class="filter-control">
                      <el-select v-model="roomType" placeholder="Room Type" @change="handleRoomTypeChange">
                        <el-option v-for="item in roomTypeList" :key="item" :label="item" :value="item"></el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="filter-item" v-if="showAggregation">
                    <div class="filter-control">
                      <el-select v-model="aggregationLevel" placeholder="No Aggregation (Show all)" @change="handleAggregationLevelChange">
                        <el-option v-for="item in aggregationList" :key="item.label" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="filter-item" v-if="showAggregation">
                    <div class="filter-control">
                      <el-select v-model="aggregationMethod" placeholder="Average" @change="handleAggregationMethodChange">
                        <el-option v-for="item in aggregationMethods" :key="item.label" :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="forecast-toggle" v-if="showForecasts">
                <el-checkbox v-model="showForecast" @change="handleForecastChange" class="forecast-checkbox">Show Forecast</el-checkbox>
                <div class="forecast-input">
                  <el-input-number
                    v-model="forecastDayValue"
                    :min="1"
                    :max="30"
                    size="small"
                    :disabled="!showForecast"
                    @change="handleForecastDayChange"
                  ></el-input-number>
                </div>
              </div>
              <div v-if="showAlerts" class="flex gap-4 items-center">
                <span>Show Alert Types: </span>
                <el-checkbox-group v-model="filterAlert" :min="0" :max="4" @change="changeAlertType">
                  <el-checkbox v-for="alert in alerts" :key="alert.value" :label="alert.label" :value="alert.value">
                    {{ alert.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div v-if="showStatus" class="flex items-center status-buttons">
              <el-button
                v-for="item in statusList"
                :key="item.value"
                size="small"
                :type="activeStatus === item.value ? 'primary' : 'default'"
                class="priority-btn"
                @click="setStatus(item.value)"
              >
                {{ item.label }}
              </el-button>
            </div>
          </div>
          <el-button v-if="!sampleMode" type="info" plain class="config-alert" @click="toggleFilterContent">
            <span class="pr-2">All Filter</span>
            <el-icon v-show="isFilterContentVisible"><ArrowDown /></el-icon>
            <el-icon v-show="!isFilterContentVisible"><ArrowUp /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    <div v-if="!isFilterContentVisible && !sampleMode" class="filter-tags">
      <el-tag v-for="(alert, index) in tips" :key="index" closable @close="removeAlert(alert)" class="alert-tag">
        {{ alert.label }}: {{ alert.value }}
      </el-tag>
    </div>

    <!-- 筛选条件和操作按钮区域 -->
    <div class="filter-content" v-if="isFilterContentVisible">
      <!-- 左侧筛选表单 -->
      <div class="filter-form">
        <!-- 位置筛选行 -->
        <div class="location-row">
          <div class="filter-label">Location</div>
          <div class="location-selects">
            <el-cascader
              v-model="locationCascade"
              :options="locationOptions"
              :props="{ checkStrictly: true }"
              clearable
              filterable
              placeholder="location"
              @change="handleLocationCascadeChange"
              popper-class="responsive-cascader"
            />
          </div>
        </div>

        <!-- 楼层和房间类型行 -->
        <div class="filters-row two-columns">
          <div class="filter-item">
            <div class="filter-label">Zone</div>
            <div class="filter-control">
              <el-cascader v-model="floorZone" :options="zoneList" :props="{ checkStrictly: true }" clearable
              filterable @change="handleFloorZoneChange" popper-class="responsive-cascader" />
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">Room Type</div>
            <div class="filter-control">
              <el-select v-model="roomType" placeholder="Type here" @change="handleRoomTypeChange">
                <el-option v-for="item in roomTypeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </div>
          </div>
        </div>

        <!-- 聚合设置行 -->
        <div class="filters-row two-columns">
          <div class="filter-item">
            <div class="filter-label">Aggregation Level</div>
            <div class="filter-control">
              <el-select v-model="aggregationLevel" placeholder="No Aggregation (Show all)" @change="handleAggregationLevelChange">
                <el-option v-for="item in aggregationList" :key="item.label" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-label">Aggregation Method</div>
            <div class="filter-control">
              <el-select v-model="aggregationMethod" placeholder="Average" @change="handleAggregationMethodChange">
                <el-option v-for="item in aggregationMethods" :key="item.label" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="filter-actions">
        <el-button type="primary" class="apply-btn" @click="applyFilter">
          <span class="pr-2">Apply Filter</span>
          <svg-icon icon-class="filter"></svg-icon>
        </el-button>
        <el-button @click="resetResults" type="info" plain class="reset-btn">
          <span class="pr-2">Reset Results</span>
          <svg-icon icon-class="refresh"></svg-icon>
        </el-button>
      </div>
    </div>
  </div>
  <div v-if="showSettingFilter" class="filter-pane flex gap-2 w-full">
    <div class="location-row flex flex-1 gap-4 mb-3">
      <div class="filter-label w-[104px] text-right pt-2">Location</div>
      <div class="location-selects flex-1">
        <el-cascader
          v-model="locationCascade"
          :options="locationOptions"
          :props="{ checkStrictly: true }"
          clearable
          filterable
          placeholder="location"
          @change="handleLocationCascadeChange"
          popper-class="responsive-cascader"
        />
      </div>
    </div>

    <!-- 楼层和房间类型行 -->
    <div class="filters-row flex-1 two-columns" v-if="!showSampleFilter">
      <div class="filter-item flex gap-3 items-center">
        <div class="filter-label w-[104px] text-right">Building/Room</div>
        <div class="filter-control flex-1">
          <el-cascader v-model="floorZone" :options="zoneList" :props="{ checkStrictly: true }" clearable
              filterable @change="handleFloorZoneChange" popper-class="responsive-cascader" />
        </div>
      </div>
    </div>
  </div>
  <!-- 合并的级联选择器 (showSampleFilter 模式) -->
  <div v-if="showSampleFilter" class="filters-row flex-1 two-columns">
    <div class="filter-item flex gap-4 items-center">
      <div v-if="showLabel" class="filter-label text-right" :style="{ width: labelWidth }">Location</div>
      <div class="filter-control flex-1">
        <el-cascader
          v-model="combinedLocation"
          :options="combinedLocationOptions"
          :props="{ checkStrictly: true }"
          clearable
          filterable
          placeholder="Country/State/City/Building/Floor/Zone"
          @change="handleCombinedLocationChange"
          popper-class="responsive-cascader"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DateRangePicker from '@/components/DateRangePicker/dateRangePicker.vue';
import * as useUtils from '@/utils/index';
import { getLocationList, getZoneList, getRoomTypes } from '@/api/clean/index';
import { useCleanStore } from '@/store/modules/cleaning';
import { ref, onMounted, getCurrentInstance, watch, computed } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const filterAlert = ref(['env']);
const alerts = ref([
  { label: 'Environment', value: 'env' },
  { label: 'Occupancy', value: 'occupancy' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Waste', value: 'waste' }
]);
const props = defineProps({
  pageId: {
    type: String,
    required: true
  },
  zoneId: {
    type: String,
    default: ''
  },
  showForecasts: {
    type: Boolean,
    required: true
  },
  showAlerts: {
    type: Boolean,
    required: false
  },
  showAggregation: {
    type: Boolean,
    default: false
  },
  showSettings: {
    type: Boolean,
    required: false
  },
  sampleMode: {
    type: Boolean,
    default: false
  },
  showStatus: {
    type: Boolean,
    default: false
  },
  showSettingFilter: {
    type: Boolean,
    default: false
  },
  showSampleFilter: {
    type: Boolean,
    default: false
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  labelWidth: {
    type: String,
    default: '88px'
  },
  preloadAllZones: {
    type: Boolean,
    default: false
  },
  limitDateRange: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: true
  },
  locationList: {
    type: Array,
    default: () => null
  },
  showLocation: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['changeTab', 'searchEvent']);
// 使用 clean store
const cleanStore = useCleanStore();
// 添加过滤器内容显示状态控制
const isFilterContentVisible = ref(false);
const dialogVisible = ref(false);
// 切换过滤器内容显示/隐藏
const toggleFilterContent = () => {
  isFilterContentVisible.value = !isFilterContentVisible.value;
};

const aggregations = [
  { label: 'Aggregate by Building', value: 3 },
  { label: 'Aggregate by Floor', value: 2 },
  { label: 'Aggregate by Zone', value: 1 }
];

// 本地状态变量
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const activeTime = ref('7days');
const showForecast = ref(true);
const forecastDayValue = ref(1);
const activeDay = ref('+1d');
const activeIndex = ref('-1');
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
const buildingList = ref([]);
const zoneList = ref([]);
const roomTypeList = ref([]);
const aggregationList = ref(aggregations);
const aggregationMethods = ref([
  { label: 'Average', value: 'avg' },
  { label: 'Maximum', value: 'max' },
  { label: 'Minimum', value: 'min' }
]);
const location = ref({
  country: '',
  state: '',
  city: '',
  building: '',
  zone: ''
});
const floorZone = ref([]);
const roomType = ref('');
const aggregationLevel = ref('');
const aggregationMethod = ref('');

// 级联选择器相关变量
const locationCascade = ref([]);
const locationOptions = ref([]);
const combinedLocation = ref([]);
// 新增：完整的级联选择器选项（包含 floor 和 zone）
const combinedLocationOptions = ref([]);
// 监听 location 变化，同步到 locationCascade
watch(
  () => [location.value.country, location.value.state, location.value.city, location.value.building],
  () => {
    if (location.value.country && location.value.state && location.value.city && location.value.building) {
      const buildingId = buildingList.value.find((item) => item.label === location.value.building)?.value;
      locationCascade.value = [location.value.country, location.value.state, location.value.city, buildingId];
    } else if (location.value.country && location.value.state && location.value.city) {
      locationCascade.value = [location.value.country, location.value.state, location.value.city];
    } else if (location.value.country && location.value.state) {
      locationCascade.value = [location.value.country, location.value.state];
    } else if (location.value.country) {
      locationCascade.value = [location.value.country];
    } else {
      locationCascade.value = [];
    }

    // 在 showSampleFilter 模式下，同步到 combinedLocation
    if (props.showSampleFilter) {
      if (floorZone.value && floorZone.value.length > 0) {
        combinedLocation.value = [...locationCascade.value, ...floorZone.value];
      } else {
        combinedLocation.value = [...locationCascade.value];
      }
    }
  },
  { immediate: true }
);

// 监听 floorZone 变化，同步到 combinedLocation (仅在 showSampleFilter 模式下)
watch(
  () => floorZone.value,
  (newVal) => {
    if (props.showSampleFilter && locationCascade.value.length > 0) {
      combinedLocation.value = [...locationCascade.value, ...newVal];
    }
  },
  { immediate: true }
);
const changeAlertType = () => {
  console.log(filterAlert.value, changeAlertType);
  applyFilter();
};

// 清空级联选择器内容的方法
const clearCascaderContent = () => {
  // 清空所有级联选择器相关的响应式变量
  locationCascade.value = [];
  combinedLocation.value = [];
  floorZone.value = [];
  
  // 清空location对象
  location.value = {
    country: '',
    state: '',
    city: '',
    building: '',
    zone: ''
  };
  
  // 清空其他筛选条件
  roomType.value = '';
  aggregationLevel.value = '';
  aggregationMethod.value = '';
  
  console.log('Cascader content cleared');
};

// 定义时间范围选项
const timeRanges = [
  { label: 'Live Data', value: '1min' },
  { label: '1 hour', value: '1hour' },
  { label: '24 hours', value: '24hours' },
  { label: '7 days', value: '7days' },
  { label: '30 days', value: '30days' }
];

const statusList = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'inProgress' },
  { label: 'Complated', value: 'complated' }
];
const activeStatus = ref('all');

const allLocationList = ref([]);
const getInitLcationList = async () => {
  location.value.country = '';
  location.value.state = '';
  location.value.city = '';
  location.value.building = '';
  regionList.value = [];
  stateList.value = [];
  cityList.value = [];
  zoneList.value = [];
  locationCascade.value = [];

  // 构建级联选择器的选项数据
  const countries = [...new Set(allLocationList.value.map((item) => item.country))];
  locationOptions.value = countries.map((country) => {
    const countryData = allLocationList.value.filter((item) => item.country === country);
    const states = [...new Set(countryData.map((item) => item.state))];

    return {
      value: country,
      label: country,
      children: states.map((state) => {
        const stateData = countryData.filter((item) => item.state === state);
        const cities = [...new Set(stateData.map((item) => item.city))];

        return {
          value: state,
          label: state,
          children: cities.map((city) => {
            const cityData = stateData.filter((item) => item.city === city && item.state === state);
            const buildings = cityData.map((item) => ({
              value: item.buildingId,
              label: item.buildingName
            }));

            // 去重建筑列表
            const uniqueBuildings = [];
            const buildingIds = new Set();

            buildings.forEach((building) => {
              if (!buildingIds.has(building.value)) {
                buildingIds.add(building.value);
                uniqueBuildings.push(building);
              }
            });

            return {
              value: city,
              label: city,
              children: uniqueBuildings
            };
          })
        };
      })
    };
  });

  // 构建完整的级联选择器选项（包含 floor 和 zone）
  combinedLocationOptions.value = countries.map((country) => {
    const countryData = allLocationList.value.filter((item) => item.country === country);
    const states = [...new Set(countryData.map((item) => item.state))];

    return {
      value: country,
      label: country,
      children: states.map((state) => {
        const stateData = countryData.filter((item) => item.state === state);
        const cities = [...new Set(stateData.map((item) => item.city))];

        return {
          value: state,
          label: state,
          children: cities.map((city) => {
            const cityData = stateData.filter((item) => item.city === city && item.state === state);
            const buildings = cityData.map((item) => ({
              value: item.buildingId,
              label: item.buildingName,
              children: [] // 初始化空的 children，后续会动态加载 floor 和 zone
            }));

            // 去重建筑列表
            const uniqueBuildings = [];
            const buildingIds = new Set();

            buildings.forEach((building) => {
              if (!buildingIds.has(building.value)) {
                buildingIds.add(building.value);
                uniqueBuildings.push(building);
              }
            });

            return {
              value: city,
              label: city,
              children: uniqueBuildings
            };
          })
        };
      })
    };
  });

  // 保持原有逻辑，填充原来的列表（用于兼容原有代码）
  allLocationList.value.forEach((item) => {
    regionList.value.push(item.country);
    stateList.value.push(item.state);
    cityList.value.push(item.city);
    buildingList.value.push({
      label: item.buildingName,
      value: item.buildingId
    });
  });
  //去重
  regionList.value = [...new Set(regionList.value)];
  stateList.value = [...new Set(stateList.value)];
  buildingList.value = buildingList.value.filter((item, index, self) => index === self.findIndex((t) => t.value === item.value));
};

// 处理级联选择器变化
const handleLocationCascadeChange = (value) => {
  if (!value || value.length === 0) {
    location.value.country = '';
    location.value.state = '';
    location.value.city = '';
    location.value.building = '';
    return;
  }

  // 根据级联选择器的值更新 location 对象
  location.value.country = value[0] || '';
  location.value.state = value.length > 1 ? value[1] : '';
  location.value.city = value.length > 2 ? value[2] : '';

  if (value.length > 3) {
    const buildingId = value[3];
    const building = allLocationList.value.find((item) => item.buildingId === buildingId);
    if (building) {
      location.value.building = building.buildingName;
    }

    // 触发建筑变更事件，加载区域列表
    handleBuildingChange(buildingId);
  } else {
    location.value.building = '';
  }

  // 根据选择的层级触发相应的处理函数
  if (value.length === 1) {
    handleCountryChange(value[0]);
  } else if (value.length === 2) {
    handleStateChange(value[1]);
  } else if (value.length === 3) {
    handleCityChange(value[2]);
  }
};

const labelMap = {
  country: 'Country',
  state: 'State/Province',
  city: 'City',
  zone: 'Zone',
  buildingId: 'Building',
  aggregationLevel: 'Aggregation Level',
  aggregationType: 'Aggregation Method',
  zoneType: 'Room Type'
};
const zoomLabels = [];
const tips = computed(() => {
  const parameters = cleanStore.getPageFilterParams(props.pageId);
  const result = Object.entries(parameters)
    .filter(([key, value]) => {
      if (['params', 'dateRange', 'timeZone'].includes(key) || (key === 'aggregationLevel' && value === 0)) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0 && value.some((item) => item !== '' && item != null);
      }
      return value !== '' && value != null && value !== undefined;
    })
    .map(([key, value]) => {
      console.log('key', key, value);
      let v = value;
      if (key === 'aggregationLevel') {
        v = aggregationList.value.find((item) => item.value === value)?.label;
      }
      if (key === 'aggregationType') {
        v = aggregationMethods.value.find((item) => item.value === value)?.label;
      }
      if (key === 'zone') {
        console.log('zone', floorZone.value, zoneList.value);
        v = zoomLabels.join(' > ');
      }
      return {
        key,
        label: labelMap[key],
        value: v
      };
    }).reverse();
  console.log('result', result);
  return result;
});

const removeAlert = (alert) => {
  const resetObj = {};
  resetObj[alert.key] = '';

  // 根据 key 重置对应的值
  if (alert.key === 'country') {
    location.value.country = '';
    location.value.state = '';
    location.value.city = '';
    location.value.building = '';
    combinedLocation.value = [];
    getInitLcationList();
  } else if (alert.key === 'state') {
    location.value.state = '';
    location.value.city = '';
    location.value.building = '';
    combinedLocation.value = [];
    handleCountryChange(location.value.country);
  } else if (alert.key === 'city') {
    location.value.city = '';
    location.value.building = '';
    combinedLocation.value = [];
    handleStateChange(location.value.state);
  } else if (alert.key === 'buildingId') {
    location.value.building = '';
    combinedLocation.value = [];
    handleCityChange(location.value.city);
  } else if (alert.key === 'zone') {
    floorZone.value = [];
    zoomLabels.length = 0;
    // 重置 combinedLocation 中的 zone 部分
    if (combinedLocation.value.length > 4) {
      combinedLocation.value = combinedLocation.value.slice(0, 4);
    }
  } else if (alert.key === 'zoneType') {
    roomType.value = '';
  } else if (alert.key === 'aggregationLevel') {
    aggregationLevel.value = '';
  } else if (alert.key === 'aggregationType') {
    aggregationMethod.value = '';
  }

  // 更新 store
  cleanStore.updatePageFilter(props.pageId, {
    dateRange: dateRange.value as [string, string],
    activeTime: activeTime.value,
    showForecast: showForecast.value,
    forecastDay: activeDay.value,
    forecastDayValue: forecastDayValue.value,
    location: {
      country: location.value.country,
      state: location.value.state,
      city: location.value.city,
      building: location.value.building,
      zone: floorZone.value
    },
    floorZone: floorZone.value,
    roomType: roomType.value,
    aggregationLevel: aggregationLevel.value,
    aggregationMethod: aggregationMethod.value
  });
};

// 日期刷新处理函数
const handleDateRefresh = () => {
  console.log('Date refreshed:', dateRange.value);
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);

    // 计算时间差（毫秒）
    const timeDiff = endDate.getTime() - startDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // 根据时间差选择对应的 tab
    if (hoursDiff <= 1) {
      activeTime.value = '1hour';
    } else if (hoursDiff <= 24) {
      activeTime.value = '24hours';
    } else if (hoursDiff <= 24 * 7) {
      activeTime.value = '7days';
    } else if (hoursDiff <= 24 * 30) {
      activeTime.value = '30days';
    }
    cleanStore.updateDateRange(props.pageId, dateRange.value as [string, string]);
    console.log(`date range: ${activeTime.value}, timestamp: ${hoursDiff}hour`);
  }
};

// 时间范围按钮事件处理
const setTimeRange = (range) => {
  activeTime.value = range;

  // 根据选择的时间范围设置 activeIndex
  let index = '-1';
  switch (range) {
    case '24hours':
      index = '0'; // Today
      break;
    case '7days':
      index = '2'; // This week
      break;
    case '30days':
      index = '3'; // This month
      break;
  }

  const endDate = new Date();
  const startDate = new Date();

  if (index === '2') {
    // 获取当前日期往前的7天的日期范围
    startDate.setDate(endDate.getDate() - 6);
    dateRange.value = [useUtils.formatDateValue(startDate), useUtils.formatDateValue(endDate)];
  } else if (index === '3') {
    // 获取当前日期往前的30天的日期范围
    startDate.setDate(endDate.getDate() - 29);
    dateRange.value = [useUtils.formatDateValue(startDate), useUtils.formatDateValue(endDate)];
  } else if (index === '0') {
    // 获取当前日期
    activeIndex.value = index;
    const newDateRange = useUtils.getDateRange(index);
    if (newDateRange.length > 1) {
      dateRange.value = [newDateRange[0] + ' 00:00:00', newDateRange[1] + ' 23:59:59'];
    }
  } else {
    // 对于 1hour，使用当前时间前一小时
    if (range === '1min') {
      startDate.setHours(startDate.getHours());
    } else {
      startDate.setHours(startDate.getHours() - 1);
    }

    dateRange.value = [useUtils.formatDateValue(startDate), useUtils.formatDateValue(endDate)];
    activeIndex.value = '-1';
  }
  cleanStore.updateDateRange(props.pageId, dateRange.value as [string, string]);

  console.log(`Time range set to ${range}, activeIndex: ${activeIndex.value}`);
};

// status按钮事件处理
const setStatus = (status) => {
  activeStatus.value = status;
  console.log(`Status set to ${status}`);
  emit('changeTab', activeStatus.value);
};

// 添加新的处理函数
const handleForecastDayChange = (val) => {
  // 根据数值设置对应的预测天数
  activeDay.value = `+${val}d`;
  console.log(`Forecast day set to +${val}d`);
};

// 修改 handleForecastChange 函数
const handleForecastChange = (val) => {
  console.log('Forecast display:', val);
  // 如果关闭预测，可以重置预测天数
  if (!val) {
    activeDay.value = '+1d';
    forecastDayValue.value = 1;
  }
};

// 预测天数按钮事件处理
const setForecastDay = (day) => {
  activeDay.value = day;
  console.log(`Forecast day set to ${day}`);
};

// 配置警报按钮事件处理
const openFilter = () => {
  console.log('Open Filter clicked');
  // 这里可以添加打开配置警报对话框的逻辑
};

// 位置选择事件处理
const handleCountryChange = (val) => {
  console.log('Country changed:', val);
  // 可以在这里加载对应国家的州/省列表
  location.value.state = '';
  location.value.city = '';
  location.value.building = '';
  location.value.zone = '';
  const countries = allLocationList.value.filter((item) => item.country === val);
  stateList.value = [...new Set(countries.map((item) => item.state))];
  cityList.value = [...new Set(countries.map((item) => item.city))];
  buildingList.value = [...new Set(countries.map((item) => item.buildingName))];

  // 更新级联选择器的值，但不触发 handleLocationCascadeChange
  if (val) {
    locationCascade.value = [val];
  } else {
    locationCascade.value = [];
  }
};

const handleStateChange = (val) => {
  console.log('State changed:', val);
  // 可以在这里加载对应州/省的城市列表
  location.value.city = '';
  location.value.building = '';
  location.value.zone = '';
  const states = allLocationList.value.filter((item) => item.state === val);
  cityList.value = [...new Set(states.map((item) => item.city))];
  buildingList.value = [
    ...new Set(
      states.map((item) => {
        return {
          label: item.buildingName,
          value: item.buildingId
        };
      })
    )
  ];

  // 更新级联选择器的值，但不触发 handleLocationCascadeChange
  if (val && location.value.country) {
    locationCascade.value = [location.value.country, val];
  } else if (location.value.country) {
    locationCascade.value = [location.value.country];
  } else {
    locationCascade.value = [];
  }
};

const handleCityChange = (val) => {
  console.log('City changed:', val);
  // 可以在这里加载对应城市的建筑列表
  location.value.building = '';
  location.value.zone = '';
  const states = allLocationList.value.filter((item) => item.city === val);

  buildingList.value = [
    ...new Set(
      states.map((item) => {
        return {
          label: item.buildingName,
          value: item.buildingId
        };
      })
    )
  ];

  // 更新级联选择器的值，但不触发 handleLocationCascadeChange
  if (val && location.value.country && location.value.state) {
    locationCascade.value = [location.value.country, location.value.state, val];
  } else if (location.value.country && location.value.state) {
    locationCascade.value = [location.value.country, location.value.state];
  } else if (location.value.country) {
    locationCascade.value = [location.value.country];
  } else {
    locationCascade.value = [];
  }
};

const handleBuildingChange = async (val: string) => {
  zoomLabels.length = 0;
  console.log('Building changed:', val);
  // 可以在这里加载对应建筑的楼层/区域列表
  floorZone.value = [];
  const building = allLocationList.value.find((item) => item.buildingId === val);
  const id = (building || {}).buildingId;

  if (id) {
    const zones: any = await getZoneList(id);
    zoneList.value = zones.data;
    console.log('zoneList', zoneList.value);

    // 如果是通过单独的选择器选择的建筑，更新级联选择器的值
    if (building && !locationCascade.value.includes(val)) {
      locationCascade.value = [location.value.country, location.value.state, location.value.city, val];
    }

    // 更新 combinedLocationOptions 中的 floor 和 zone 数据
    await updateCombinedLocationOptions(val, zones.data);
  }

  if (val == null) {
    aggregationList.value = aggregations.filter((d) => d.value !== 3);
  } else if (val != null && aggregationList.value.findIndex((d) => d.value === 3) === -1) {
    aggregationList.value.push(aggregations[0]);
  }
};

// 新增：更新 combinedLocationOptions 中的 floor 和 zone 数据
const updateCombinedLocationOptions = async (buildingId: string, zoneData: any[]) => {
  // 在 combinedLocationOptions 中找到对应的建筑并更新其 children
  const updateBuildingChildren = (options: any[]): any[] => {
    return options.map((country) => ({
      ...country,
      children: country.children.map((state) => ({
        ...state,
        children: state.children.map((city) => ({
          ...city,
          children: city.children.map((building) => {
            if (building.value === buildingId) {
              return {
                ...building,
                children: zoneData // 直接使用从 API 获取的 zone 数据
              };
            }
            return building;
          })
        }))
      }))
    }));
  };
  const path = updateBuildingChildren(combinedLocationOptions.value);
  console.log(path, 'updateCombinedLocationOptions')

  combinedLocationOptions.value = path;
};

const handleFloorZoneChange = (val) => {
  console.log('Floor/Zone changed:', val);
  const getLabels = (value) => {
    const labels = [];

    // 第一层查找
    const firstOption = zoneList.value.find((option) => option.value === value[0]);
    if (firstOption) {
      labels.push(firstOption.label);

      // 第二层查找
      if (value[1] && firstOption.children) {
        const secondOption = firstOption.children.find((option) => option.value === value[1]);
        if (secondOption) {
          labels.push(secondOption.label);
        }
      }
    }

    return labels;
  };

  zoomLabels.push(...getLabels(val));

  // 更新级联选择器的值，但不触发 handleLocationCascadeChange
  // if (val && location.value.country && location.value.state && location.value.city && location.value.building) {
  //   locationCascade.value = [
  //     location.value.country,
  //     location.value.state,
  //     location.value.city,
  //     location.value.building,
  //     val
  //   ];
  // }

  if (props.sampleMode) {
    applyFilter();
  }
};

// 处理合并级联选择器的变化 (showSampleFilter 模式)
const handleCombinedLocationChange = async (val) => {
  console.log('Combined location changed:', val);
  if (!val || val.length === 0) {
    location.value.country = '';
    location.value.state = '';
    location.value.city = '';
    location.value.building = '';
    floorZone.value = [];
    zoomLabels.length = 0;
    return;
  }

  // 处理 country, state, city, building 部分
  location.value.country = val[0] || '';
  location.value.state = val.length > 1 ? val[1] : '';
  location.value.city = val.length > 2 ? val[2] : '';

  // 处理 building 部分
  if (val.length > 3) {
    const buildingId = val[3];
    const building = allLocationList.value.find((item) => item.buildingId === buildingId);
    if (building) {
      location.value.building = building.buildingName;
    }

    // 如果还没有加载该建筑的 zone 数据，则加载
    const buildingInOptions = findBuildingInOptions(buildingId);
    if (!buildingInOptions || !buildingInOptions.children || buildingInOptions.children.length === 0) {
      await handleBuildingChange(buildingId);
    }

    // 处理 floor/zone 部分 (如果有)
    if (val.length > 4) {
      floorZone.value = val.slice(4);
      zoomLabels.length = 0; // 清空之前的标签

      // 获取并设置区域标签
      const getLabels = (value) => {
        const labels = [];
        const firstOption = zoneList.value.find((option) => option.value === value[0]);
        if (firstOption) {
          labels.push(firstOption.label);
          if (value[1] && firstOption.children) {
            const secondOption = firstOption.children.find((option) => option.value === value[1]);
            if (secondOption) {
              labels.push(secondOption.label);
            }
          }
        }
        return labels;
      };

      zoomLabels.push(...getLabels(floorZone.value));
    }
  } else {
    location.value.building = '';
    floorZone.value = [];
    zoomLabels.length = 0;
  }

  // 同步到 locationCascade
  locationCascade.value = val.slice(0, 4);

  // 应用筛选
  if (props.sampleMode) {
    applyFilter();
  }

  const zoneId = getZoneId();
  emit('searchEvent', zoneId);
};

const getZoneId = () => {
  return floorZone.value[floorZone.value.length - 1] || '';
};

// 新增：在 combinedLocationOptions 中查找建筑
const findBuildingInOptions = (buildingId: string) => {
  for (const country of combinedLocationOptions.value) {
    for (const state of country.children || []) {
      for (const city of state.children || []) {
        for (const building of city.children || []) {
          if (building.value === buildingId) {
            return building;
          }
        }
      }
    }
  }
  return null;
};

const handleRoomTypeChange = (val) => {
  console.log('Room Type changed:', val);
  if (props.sampleMode) {
    applyFilter();
  }
};

// 聚合设置事件处理
const handleAggregationLevelChange = (val) => {
  console.log('Aggregation Level changed:', val);
  if (props.showAggregation) {
    applyFilter();
  }
};

const handleAggregationMethodChange = (val) => {
  console.log('Aggregation Method changed:', val);
  if (props.showAggregation) {
    applyFilter();
  }
};

// 应用筛选和重置结果
const applyFilter = () => {
  console.log('Applying filters with current settings');
  console.log('Date Range:', dateRange.value);
  console.log('location:', location.value);
  isFilterContentVisible.value = false;

  // 将组件中的值赋给 store
  cleanStore.updatePageFilter(props.pageId, {
    dateRange: dateRange.value as [string, string],
    activeTime: activeTime.value,
    showForecast: showForecast.value,
    forecastDay: activeDay.value,
    forecastDayValue: forecastDayValue.value,
    location: {
      country: location.value.country,
      state: location.value.state,
      city: location.value.city,
      building: location.value.building,
      zone: floorZone.value
    },
    floorZone: floorZone.value,
    roomType: roomType.value,
    aggregationLevel: aggregationLevel.value,
    aggregationMethod: aggregationMethod.value,
    alertTypes: filterAlert.value
  });
};

const resetResults = () => {
  console.log('Resetting results');
  // 先重置 store
  cleanStore.resetPageFilter(props.pageId);
  zoomLabels.length = 0;
  // 从 store 中获取重置后的值，赋给组件
  const storeFilters = cleanStore.getPageFilterParams(props.pageId);
  dateRange.value = storeFilters.dateRange;
  activeTime.value = storeFilters.activeTime;
  showForecast.value = storeFilters.showForecast;
  activeDay.value = storeFilters.forecastDay;
  forecastDayValue.value = storeFilters.forecastDayValue;
  location.value = {
    country: storeFilters.location.country,
    state: storeFilters.location.state,
    city: storeFilters.location.city,
    building: storeFilters.location.building,
    zone: storeFilters.location.zone
  };
  floorZone.value = storeFilters.floorZone;
  roomType.value = storeFilters.roomType;
  aggregationLevel.value = storeFilters.aggregationLevel;
  aggregationMethod.value = storeFilters.aggregationMethod;

  // 重置本地变量
  activeIndex.value = '-1';
  combinedLocation.value = [];

  // 重新初始化列表
  getInitLcationList();
};

const init = async () => {
  if(props.locationList != null) {
    combinedLocationOptions.value = props.locationList;
    return;
  }
  getRoomTypes().then((res) => {
    console.log('getRoomTypes:', res);
    roomTypeList.value = res.data;

    // 更新 store 中的 roomType
    // cleanStore.updateFilter({ roomType: roomType.value });
  });

  const res = await getLocationList();
  console.log(res.data);
  allLocationList.value = res.data;
  getInitLcationList();

  // 预加载所有建筑的 zone 数据（可选，用于提升用户体验）
  if (props.showSampleFilter || props.preloadAllZones) {
    await preloadAllZoneData();
  }
};

// 新增：预加载所有建筑的 zone 数据
const preloadAllZoneData = async () => {
  const uniqueBuildingIds = [...new Set(allLocationList.value.map((item) => item.buildingId))];

  for (const buildingId of uniqueBuildingIds) {
    try {
      const zones: any = await getZoneList(buildingId);
      await updateCombinedLocationOptions(buildingId, zones.data);
    } catch (error) {
      console.warn(`Failed to preload zone data for building ${buildingId}:`, error);
    }
  }
};

setTimeRange(activeTime.value);

onMounted(async () => {
  if (props.showLocation) {
    await init();
  }
 
  
  // 如果初始化时有zoneId，设置级联选择器
  if (props.zoneId) {
    console.log('Initial zoneId:', props.zoneId);
    await setCascaderByZoneId(props.zoneId);
  }
});

watch(
  () => props.zoneId,
  (val) => {
    if (val) {
      setCascaderByZoneId(val);
    }
  }
);

watch(
  () => props.locationList,
  (val) => {
    if (val) {
      combinedLocationOptions.value = val;
    }
  }
);

// 根据zoneId设置级联选择器显示对应的完整标签
const setCascaderByZoneId = async (zoneId) => {
  if (!zoneId) return;

  // 1. 遍历所有 building，找到包含该 zoneId 的 buildingId、floorId、zoneId
  let targetBuildingId = null;
  let targetFloorId = null;
  let targetZoneId = null;
  let targetCountry = '';
  let targetState = '';
  let targetCity = '';
  let targetBuildingName = '';

  for await (const building of buildingList.value) {
    const zones: any = await getZoneList(building.value);
    // zones.data 结构：[{ value: floorId, label: ..., children: [{ value: zoneId, label: ... }] }]
    for (const floor of zones.data) {
      if (floor.value == zoneId) {
        targetBuildingId = building.value;
        targetFloorId = floor.value;
        targetZoneId = null;
        break;
      }
      if (floor.children) {
        for (const zone of floor.children) {
          if (zone.value == zoneId) {
            targetBuildingId = building.value;
            targetFloorId = floor.value;
            targetZoneId = zone.value;
            break;
          }
        }
      }
      if (targetBuildingId) break;
    }
    if (targetBuildingId) {
      // 2. 更新 options
      await updateCombinedLocationOptions(building.value, zones.data);
      // 3. 找到 building 的国家/省/市/名
      const buildingInfo = allLocationList.value.find(item => item.buildingId === building.value);
      if (buildingInfo) {
        targetCountry = buildingInfo.country;
        targetState = buildingInfo.state;
        targetCity = buildingInfo.city;
        targetBuildingName = buildingInfo.buildingName;
      }
      break;
    }
  }

  if (!targetBuildingId) {
    // 没找到
    return;
  }

  // 4. 赋值 location/floorZone/combinedLocation
  location.value.country = targetCountry;
  location.value.state = targetState;
  location.value.city = targetCity;
  location.value.building = targetBuildingName;
  locationCascade.value = [targetCountry, targetState, targetCity, targetBuildingId];

  if (targetZoneId) {
    floorZone.value = [targetFloorId, targetZoneId];
    zoomLabels.length = 0;
    // 获取 label
    const zones: any = await getZoneList(targetBuildingId);
    const floor = zones.data.find(f => f.value == targetFloorId);
    if (floor) {
      zoomLabels.push(floor.label);
      const zone = floor.children?.find(z => z.value == targetZoneId);
      if (zone) zoomLabels.push(zone.label);
    }
  } else {
    floorZone.value = [targetFloorId, zoneId];
    zoomLabels.length = 0;
    const zones: any = await getZoneList(targetBuildingId);
    const floor = zones.data.find(f => f.value == targetFloorId);
    if (floor) zoomLabels.push(floor.label);
  }

  // 5. 等 options 渲染
  await nextTick();

  console.log([...locationCascade.value, ...floorZone.value], 'setCascaderByZoneId')
  // 6. 赋值 combinedLocation
  combinedLocation.value = [...locationCascade.value, ...floorZone.value];

  await nextTick();
};

// 查找并设置完整的级联路径
const findAndSetFullPath = async (buildingId, floorId, zoneId = null) => {
  // 查找建筑所属的位置信息
  const building = allLocationList.value.find(item => item.buildingId === buildingId);
  if (!building) return;
  
  // 设置位置信息
  location.value.country = building.country;
  location.value.state = building.state;
  location.value.city = building.city;
  location.value.building = building.buildingName;
  
  // 设置级联选择器的值
  locationCascade.value = [building.country, building.state, building.city, buildingId];
  
  // 设置区域信息
  if (zoneId) {
    floorZone.value = [floorId, zoneId];
  } else {
    floorZone.value = [floorId];
  }
  await nextTick();
  // 设置合并的级联选择器值
  combinedLocation.value = [...locationCascade.value, ...floorZone.value];
  await nextTick(); 
  
  console.log('Set full path:', combinedLocation.value);
};
const updateZoneId = async (buildingId, floorId, newZoneId) => {
  const zones = await getZoneList(buildingId);
  zoneList.value = zones.data;

  floorZone.value = [floorId.toString(), newZoneId.toString()];
  // 更新combinedLocationOptions
  await updateCombinedLocationOptions(buildingId, zones.data);
  // 设置级联选择器显示对应的完整标签
  if (newZoneId) {
    setCascaderByZoneId(newZoneId.toString());
  }
};

const getCurZoneList = async (buildingId = '') => {
  buildingId = buildingId ||  buildingList.value.find((item) => item.label === location.value.building)?.value;
  if(!buildingId) {
    return []
  }
  const zones: any = await getZoneList(buildingId);

  return zones.data;
};
const getParams = () => {
  return proxy?.addDateRange(location.value, dateRange.value);
};

// 获取级联组件用户选择的最后一级数据，返回key:value形式
const getLastLevelSelection = () => {
  const result: any = {};
  
  // 处理普通级联选择器 (locationCascade)
  if (locationCascade.value && locationCascade.value.length > 0) {
    const lastLocationValue = locationCascade.value[locationCascade.value.length - 1];
    
    // 根据级联层级确定key
    if (locationCascade.value.length === 1) {
      result.region = lastLocationValue;
    } else if (locationCascade.value.length === 2) {
      result.state = lastLocationValue;
    } else if (locationCascade.value.length === 3) {
      result.city = lastLocationValue;
    } else if (locationCascade.value.length === 4) {
      result.buildingId = lastLocationValue;
    }
  }
  
  // 处理楼层区域级联选择器 (floorZone)
  if (floorZone.value && floorZone.value.length > 0) {
    const lastFloorZoneValue = floorZone.value[floorZone.value.length - 1];
    
    if (floorZone.value.length === 1) {
      result.floor = lastFloorZoneValue;
    } else if (floorZone.value.length === 2) {
      result.zone = lastFloorZoneValue;
    }
  }
  
  // 处理合并级联选择器 (combinedLocation) - 用于showSampleFilter模式
  if (props.showSampleFilter && combinedLocation.value && combinedLocation.value.length > 0) {
    const lastCombinedValue = combinedLocation.value[combinedLocation.value.length - 1];
    
    // 根据级联层级确定key
    if (combinedLocation.value.length === 1) {
      result.region = lastCombinedValue;
    } else if (combinedLocation.value.length === 2) {
      result.state = lastCombinedValue;
    } else if (combinedLocation.value.length === 3) {
      result.city = lastCombinedValue;
    } else if (combinedLocation.value.length === 4) {
      result.buildingId = lastCombinedValue;
    } else if (combinedLocation.value.length === 5) {
      result.floorId = lastCombinedValue;
    } else if (combinedLocation.value.length === 6) {
      result.zoneId = lastCombinedValue;
    }
  }
  
  return result;
};

defineExpose({
  location,
  floorZone,
  updateZoneId,
  getZoneId,
  init,
  setCascaderByZoneId,
  getInitLcationList,
  buildingList,
  getCurZoneList,
  resetResults,
  clearCascaderContent,
  getLastLevelSelection
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.filter-form-label {
  width: 120px;
  min-width: 120px;
  padding: 8px 0;
  color: var(--VI-text-B12, #11191e);
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  /* 114.286% */
  padding-right: 24px;
  word-wrap: break-word;
  word-break: break-word;
}

.filter-panel {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;

  .date-filter {
    margin-bottom: 16px;
  }

  .alerts-checkbox {
    display: flex;
    gap: 16px;
    align-items: center;
    color: var(--VI-text-B12, #11191e);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    @media (max-width: 1024px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  // 添加过滤器展开/收起按钮样式
  .filter-toggle-container {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;

    .filter-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 16px;
      border-radius: 0 0 8px 8px;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .filter-content {
    position: absolute;
    left: 36px;
    right: 36px;
    background-color: white;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 16px;
    transition:
      opacity 0.3s ease-in-out,
      visibility 0.3s ease-in-out;
    opacity: 1;
    visibility: visible;
    display: flex;

    @media (max-width: 768px) {
      flex-direction: column;
    }
    &.filter-content-hidden {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      margin-top: 0;
    }

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  .date-time-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .filter-left {
      flex: 1;
      justify-content: space-between;
      @media (max-width: 768px) {
        flex-direction: column;
      }
    }
    .config-alert {
      border-radius: 4px;
      border: 1px solid var(--VI-text-B12, #11191e);
      color: var(--VI-text-B12, #11191e);
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      svg {
        width: 20px;
        height: 20px;
      }
      &:focus,
      &:hover {
        border-radius: 4px;
        border: 1px solid var(--colors-base-01-primary, #09f);
        background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
        color: $color-blue;

        svg {
          fill: $color-blue;
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      width: 100%;

      .filter-left {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        > div {
          width: 100%;
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
      }
    }

    .date-picker {
      flex: 0 0 auto;
      min-width: 280px;
      padding-left: 32px;

      @media (max-width: 768px) {
        width: 100%;
      }

      :deep(.el-range-editor) {
        width: 100%;
      }
    }
  }

  .time-buttons {
    display: flex;
    border-radius: 4px;
    background: var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
    flex: 0 0 auto;
    border: 2px solid var(--VI-text-B88, #d3dbe0);
    .priority-btn {
      &.el-button--primary {
        border-radius: 4px;
        background: var(--layout-bg_focus, #09f);
        box-shadow:
          0px 10px 15px -3px rgba(0, 153, 255, 0.4),
          0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1));
      }
    }
    @media (max-width: 768px) {
      width: 100%;

      .el-button {
        flex: 1;
        width: auto;
      }
    }

    .el-button {
      margin: 0;
      border: none;
      flex: 1;
      position: relative;
      display: flex;
      width: 68px;
      height: 32px !important;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 0px 4px 4px 0px;

      &:not(:first-child)::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2px;
        background-color: rgba(211, 219, 224, 0.8);
      }

      &.active {
        color: white;
        z-index: 1;
        border-radius: 4px 0px 0px 4px;
        background: var(--layout-bg_focus, #09f);
        box-shadow:
          0px 10px 15px -3px rgba(0, 153, 255, 0.4),
          0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1)),
          0px 8px 10px rgba(0, 153, 255, 0.25);

        &::before {
          display: none;
        }

        & + .el-button::before {
          display: none;
        }
      }

      &:first-child {
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }
    }
  }

  .status-buttons {
    @extend .time-buttons;
    .el-button {
      width: 80px;
    }
  }

  .forecast-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .el-checkbox {
      margin-right: 0;
      white-space: nowrap;
    }

    .forecast-input {
      width: 120px;
      padding-left: 2px;

      :deep(.el-input-number) {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;

      .forecast-input {
        width: 100%;
      }
    }
  }

  .day-buttons {
    display: flex;
    padding: 2px;
    justify-content: center;
    align-items: center;
    gap: 2px;
    border-radius: 100px;
    background: var(--layout-bg_divider, rgba(211, 219, 224, 0.4));

    .el-button {
      margin: 0;
      height: 32px;
      border: none;
      background: transparent;
      color: #606266;

      &.forecast-btn {
        border-radius: 100px;
        padding: 5px 12px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        &.active {
          background: var(--layout-bg_focus, #09f);
          color: white;
          box-shadow:
            0px 10px 15px -3px rgba(0, 153, 255, 0.4),
            0px 4px 6px -2px rgba(17, 25, 30, 0.1);
        }

        &:disabled {
          color: #c0c4cc;
          background: transparent;
          box-shadow: none;
        }
      }
    }
  }

  .filter-form {
    flex: 1;
    margin-right: 16px;

    @media (max-width: 768px) {
      margin-right: 0;
      margin-bottom: 16px;
    }
  }

  .filter-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 132px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      flex-direction: row;
      width: 100%;
    }

    .el-button {
      width: 100%;
    }

    .reset-btn {
      margin-left: 0;
    }
  }

  .location-row {
    display: flex;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .filter-label {
      @extend .filter-form-label;
    }

    .location-selects {
      display: flex;
      flex: 1;
      gap: 8px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
      }

      .el-select {
        width: calc(25% - 6px);

        @media (max-width: 1200px) {
          width: calc(50% - 4px);
        }

        @media (max-width: 768px) {
          width: 100%;
        }
      }
    }
  }

  .filters-row {
    display: flex;
    margin-bottom: 16px;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
    }

    &.two-columns {
      .filter-item {
        width: calc(50% - 8px);

        @media (max-width: 768px) {
          width: 100%;
        }
      }
    }

    .filter-item {
      display: flex;
      align-items: flex-start;

      @media (max-width: 768px) {
        flex-direction: row;
        align-items: flex-start;
      }

      .filter-label {
        @extend .filter-form-label;
        padding-right: 16px;
        padding-top: 8px;
      }

      .filter-control {
        flex: 1;
        width: 100%;

        .el-select {
          width: 100%;
        }
      }
    }
  }

  .mb-0 {
    margin-bottom: 0;
  }
}

.filter-tags {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .alert-tag {
    display: flex;
    height: 28px;
    padding: 0px 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 100px;
    background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
    color: var(--layout-bg_focus, #09f);
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
  }
}

#sample-location {
  :deep(.el-cascader) {
    width: 100%;
    .el-input {
      width: 100%;
    }
  }
}

:deep(.el-input-number) {
  max-width: 180px;
}
// 覆盖 Element Plus 默认样式
:deep(.el-button--small) {
  padding: 5px 10px;
  font-size: 12px;
}

:deep(.el-checkbox__label) {
  font-size: 12px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.top-left-btn) {
  .el-tabs {
    display: none; // 隐藏标签页，使用我们自己的按钮
  }
}

:deep(.el-date-editor.el-input, .el-date-editor.el-input__inner) {
  width: 100%;
}

:deep(.el-date-editor) {
  height: 36px !important;
}

:deep(.el-range-editor.el-input__inner) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  min-height: 36px;
  min-width: 180px;
  width: 100% !important;
}

:deep(.el-input__wrapper),
:deep(.el-button) {
  height: 36px !important;
}

.forecast-input {
  :deep(.el-input-number.is-controls-right .el-input-number__increase),
  :deep(.el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase) {
    --el-input-number-controls-height: 34px;
    height: 34px !important;
    line-height: 34px !important;
  }
}
</style>
