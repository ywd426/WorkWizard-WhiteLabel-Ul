<template>
  <div class="camera-map-view" :class="{ 'embedded-view': props.isEmbedded }">
    <!-- 最上方标签页区域 - 当组件作为独立页面时显示 -->
    <div class="outer-tab-container priority-buttons" v-if="!props.isEmbedded">
      <el-button
        v-for="type in outerTabs"
        :key="type.value"
        :type="activeOuterTab === type.value ? 'primary' : 'default'"
        size="middle"
        @click="clickTab(type.value)"
        class="priority-btn"
      >
        {{ type.label }}
      </el-button>
    </div>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="query-parent">
        <QueryForm @search="handleQuery" @reset="resetQuery">
          <el-form ref="queryFormRef" :model="filterParams" :inline="true" :label-width="isMobileDevice() ? 'auto' : '160px'" size="default">
            <el-form-item v-if="activeOuterTab !== 'multiple_map'" label="Locations" prop="locationId">
              <sample-filter ref="filterPanelRef" :options="locationList" width="220px" />
            </el-form-item>
            <el-form-item v-if="activeOuterTab !== 'robot' && activeOuterTab !== 'multiple_map'" label="Robot Type" prop="robotType">
              <el-select v-model="filterParams.robotType" clearable filterable placeholder="Please Select Robot Type">
                <el-option v-for="item in robotTypeList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="activeOuterTab !== 'multiple_map'" label="Robot Name" prop="robotName">
              <el-select
                v-model="filterParams.robotName"
                multiple
                clearable
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Please Select Robot Name"
              >
                <el-option v-for="item in robotNameList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="activeOuterTab !== 'multiple_map'" label="Robot SN" prop="robotSn">
              <el-select v-model="filterParams.robotSn" clearable filterable placeholder="Please Select Robot SN">
                <el-option v-for="item in robotSNList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="activeOuterTab == 'multiple_map'" label="Floors" prop="floorId">
              <sample-filter ref="filterPanelRef" :options="floorIdList" :showFloor="true" width="340px" placeholder="Building/Floor" />
            </el-form-item>
            <el-form-item v-show="activeOuterTab == 'multiple_map' || activeOuterTab == 'robot'" label="Time Range" prop="dateRange">
              <DateRangePicker v-model:dateRange="dateRange" activeIndex="0" @refresh="handleQuery" />
            </el-form-item>
          </el-form>
        </QueryForm>
      </div>
    </transition>

    <!-- 顶部标题和筛选区域 -->
    <!-- <div class="header-container" v-if="!props.isEmbedded">
      <div class="title-section">
        <h3>{{ title }}</h3>
        <el-tooltip v-if="tooltip" placement="top" effect="light">
          <template #content>
            <div class="tooltip-content">{{ tooltip }}</div>
          </template>
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
    </div> -->

    <!-- 地图区域 -->
    <div class="map-section">
      <!-- 图例区域 -->
      <div class="legend-container" v-if="activeOuterTab !== 'robot' && activeOuterTab !== 'multiple_map'">
        <div
          v-for="(legend, index) in legends"
          :key="index"
          class="legend-item"
          :class="{ 'disabled': isLegendDisabled(legend), 'not-allow': activeOuterTab === 'location_view' }"
          @click="toggleMarkerType(legend)"
        >
          <div class="legend-marker" :class="[legend.type, legend.shape]" :style="{ color: legend.color }"></div>
          <div class="legend-label">{{ legend.label }}</div>
        </div>
      </div>

      <!-- 地图容器 -->
      <div ref="mapContainer" class="map-container" v-if="activeOuterTab === 'location_view'" v-loading="mapLoading"></div>
      <div v-else-if="activeOuterTab === 'location_view' || activeOuterTab === 'spatial_area'" class="flex-1 map-container">
        <innerMap ref="innerMapRef" :id="filterParams.locationId" :type="activeOuterTab" :getParams="getParams" />
      </div>
      <div v-else-if="activeOuterTab === 'multiple_map'" class="flex-1 map-container">
        <SingleMapView ref="multipleRef" :id="filterParams.locationId" :type="activeOuterTab" :getParams="getParams" />
      </div>
      <div v-else class="h-full">
        <robotHistoryMap ref="robotMapRef" :getParams="getParams" />
      </div>
      <!-- 悬浮提示 -->
      <div v-if="activeTooltip" class="map-tooltip" :style="tooltipStyle">
        <div class="tooltip-content">{{ activeTooltip }}</div>
        <div class="tooltip-arrow"></div>
      </div>

      <!-- 地图底部控制按钮 -->
      <div class="map-controls" v-if="activeOuterTab !== 'robot' && activeOuterTab !== 'multiple_map'">
        <div class="control-group">
          <el-button v-if="activeOuterTab == 'location_view'" class="control-btn" @click="handleFullScreen">
            Full Screen
            <el-icon class="ml-2"><FullScreen /></el-icon>
          </el-button>
          <el-button class="control-btn" @click="refreshView">
            Refresh view
            <el-icon class="ml-2"><Refresh /></el-icon>
          </el-button>
        </div>
        <!-- <div class="zoom-controls">
          <el-button class="zoom-btn" @click="zoomOut">
            <el-icon><Minus /></el-icon>
          </el-button>
          <span class="zoom-level">{{ zoomLevel }}%</span>
          <el-button class="zoom-btn" @click="zoomIn">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div> -->
      </div>
    </div>

    <!-- 相机信息卡片 -->
    <div v-if="cardData" class="camera-info-card" :style="cardPosition" :class="{ 'expanded': isCardExpanded }">
      <DefaultBoard
        ref="defaultBoardForm"
        :detailForm="detailForm"
        :singleMode="true"
        :showRefresh="false"
        viewTooltip="Robot Detail"
        @viewDetail="viewDetails"
      >
        <template #customArea>
          <div class="w-full flex gap-4">
            <div v-for="(item, index) in cardData.recentEvents" class="recentCell flex-1">
              <div class="value" :class="recentItem(index)">{{ item }}</div>
              <div class="w-full text-center mt-1" :class="recentItem(index, true)">{{ recentEvents[index] }}</div>
            </div>
          </div>
        </template>
        <template #actionArea>
          <el-button type="primary" size="small" @click="handleRobotClick(cardData.sensorId)" round>
            View Details
            <el-icon class="ml-1"><InfoFilled /></el-icon>
          </el-button>
        </template>
      </DefaultBoard>
    </div>
  </div>

  <!-- 机器人详情侧边栏 -->
  <el-drawer
    v-model="showDetailPanel"
    title="Robot Detail"
    direction="rtl"
    size="80%"
    :show-close="false"
    :before-close="closeDetailPanel"
    class="robot-detail-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <h3>Robot Detail</h3>
        <el-button @click="closeDetailPanel" :icon="Close" circle />
      </div>
    </template>

    <div v-if="selectedRobot" class="detail-content">
      <RobotDetailComponent :robot-data="selectedRobot" @close="closeDetailPanel" />
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, getCurrentInstance } from 'vue';
import GoogleMapsApiLoader from 'google-maps-api-loader';
import SampleFilter from '@/views/cleaning/common/SampleFilter';
import QueryForm from '@/components/QueryForm/index.vue';
import RightSearchbar from '@/components/RightSearchbar/index.vue';
import DefaultBoard from '@/views/monitor/robotmanage/monitoring/tooltipCard.vue';
import { getRobotTypes, getRobotSnList, getRobotNames, getLocations, getGoogleMap, getRobotSpatial, getFloors } from '@/api/robot';
import MultiLayerMapView from '@/views/monitor/robotmanage/monitoring/MultiLayerMapView.vue';
import SingleMapView from '@/views/monitor/robotmanage/monitoring/SingleMapView.vue';
import { isMobileDevice, convertWithUnit } from '@/utils';
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance();
import innerMap from './innerMap.vue';
import RobotDetailComponent from '@/views/monitor/robotmanage/robots/RobotDetailComponent.vue';
import { InfoFilled, FullScreen, Refresh, Plus, Minus, Close } from '@element-plus/icons-vue';
import robotHistoryMap from './robotHistoryMap.vue';

// 定义组件属性
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  tooltip: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '520px'
  },
  // 是否显示内部标签页，当组件作为标签页内容时可设为false
  showInnerTabs: {
    type: Boolean,
    default: false
  },
  // 是否为嵌入模式（作为其他组件的一部分）
  isEmbedded: {
    type: Boolean,
    default: false
  },
  cameraTypes: {
    type: Array,
    default: () => [
      { label: 'Baltimore', value: 'baltimore' },
      { label: 'All terminal', value: 'all_terminal' },
      { label: 'Demo_UI', value: 'demo_ui' },
      { label: 'LDG-test', value: 'ldg-test' }
    ]
  },
  markersData: {
    type: Array,
    default: () => [
      {
        id: 'CAM-1',
        lat: 37.7749,
        lng: -122.4194,
        title: 'Camera 1',
        color: '#FF384C', // red
        icon: null,
        type: 'Offline',
        tooltip: 'Camera 1 - Critical Alert',
        location: 'Floor 2, Building A',
        lastUpdated: '2023-05-24 12:45:59'
      },
      {
        id: 'CAM-2',
        lat: 37.7659,
        lng: -122.4104,
        title: 'Camera 2',
        color: '#00BA4A', // green
        icon: null,
        type: 'Online',
        tooltip: 'Camera 2 - Normal Operation',
        location: 'Floor 1, Building B',
        lastUpdated: '2023-05-24 12:40:23'
      }
    ]
  },
  getMapData: {
    type: Function,
    default: null
  },
  center: {
    type: Object,
    default: () => ({ lat: 37.7749, lng: -122.4194 })
  },
  zoom: {
    type: Number,
    default: 15
  },
  legends: {
    type: Array,
    default: () => [
      { type: 'Online', label: 'Online', color: '#00BA4A', shape: 'circle' },
      { type: 'Offline', label: 'Offline', color: '#ff384c', shape: 'circle' }
    ]
  }
});
const filterPanelRef = ref(null);
const defaultBoardForm = ref(null);
const showSearch = ref(true);
const detailForm = ref([{ name: 0, total: 1, color: '' }]);
const queryFormRef = ref(null);
const searchbarRef = ref(null);
const legends = ref(props.legends);
const innerMapRef = ref(null);
const robotMapRef = ref(null);
const multipleRef = ref(null);
const mapLoading = ref(false);
// 定义事件
const emit = defineEmits(['markerClicked', 'tabChange', 'filterChange', 'viewDetails']);

// 过滤参数
const filterParams = ref({
  locationId: '',
  robotType: '',
  robotName: '',
  robotSn: '',
  floorId: ''
});

// 时间选择相关
const dateRange = ref(['', '']);

// 日期范围选择
const duration = ref('1'); // '0': day, '1': week, '2': month

// 过滤选项列表
const locationList = ref([]);
const robotTypeList = ref(['PUDU CC1']);
const robotNameList = ref([]);
const robotSNList = ref([]);
const floorIdList = ref([]);
const loading = ref(false);
const chartLoading = ref(false);
const markersData = ref([]);

// 响应式状态
const mapContainer = ref(null);
const map = ref(null);
const selectedCameraTypes = ref(props.cameraTypes.map((type) => type.value));
const disabledMarkerTypes = ref([]);
const markers = ref([]);
const markerGroups = ref({}); // { [type]: Marker[] }
const activeTooltip = ref(null);
const tooltipStyle = ref({
  top: '0px',
  left: '0px'
});
const allowLegendClick = ref(true);
const zoomLevel = ref(100);
const cardData = ref(null);
const isCardExpanded = ref(false);
const cardPosition = ref({
  top: '100px',
  left: '40px'
});

// 抽屉相关状态
const showDetailPanel = ref(false);
const selectedRobot = ref(null);

// 顶部标签页相关状态
const outerTabs = ref([
  { label: 'Overview', value: 'location_view' },
  { label: 'Live', value: 'robot' },
  // { label: 'Spatial Live Location', value: 'spatial_list' },
  // { label: 'Spatial Area Cleaned', value: 'spatial_area' },
  { label: 'Coverage', value: 'multiple_map' }
]);
const recentEvents = ref(['Critical', 'Error', 'Warning', 'Events']);

const activeOuterTab = ref('location_view'); // 默认选中的顶部标签页

const quickFilterSelected = ref('baltimore'); // 默认选中的快速筛选选项

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAgCuzXGlKleiS2TuANYrUbrj3AZG0u04A';

// 计算可见的标记点
const visibleMarkersData = computed(() => {
  return markersData.value.filter((marker) => !disabledMarkerTypes.value.includes(marker.type));
});

// 检查图例是否被禁用
const isLegendDisabled = (legend) => {
  const currentVisibility = getCurrentVisibility();
  if (activeOuterTab.value === 'spatial_area') {
    // 对于spatial_area模式，需要根据legend.label来判断
   const data = legends.value.find((l) => l.label === legend.label);
    const key = data ? data.label : legend.label;
    return currentVisibility[key] === false;
  }
  return currentVisibility[legend.type] === false;
};

// 分别为不同地图模式创建独立的可见性状态
const googleMapVisibility = ref({}); // Google地图的marker可见性
const innerMapVisibility = ref({}); // 内部地图的polygon/circle可见性

// 获取当前模式的可见性状态
const getCurrentVisibility = () => {
  return activeOuterTab.value === 'location_view' ? googleMapVisibility.value : innerMapVisibility.value;
};

// 切换标记点类型的显示/隐藏
const toggleMarkerType = (legend) => {
  const currentVisibility = getCurrentVisibility();

  if (activeOuterTab.value === 'location_view') {
    // Google地图模式
    const type = legend.type;
    if (currentVisibility[type] == null) {
      currentVisibility[type] = true;
    }

    // 更新Google地图marker可见性
    currentVisibility[type] = !currentVisibility[type];
    const show = currentVisibility[type];

    if (markerGroups.value[type]) {
      markerGroups.value[type].forEach((marker) => {
        marker.setMap(show ? map.value : null);
      });
    }
  } else if (activeOuterTab.value === 'spatial_list') {
    // 内部地图圆形模式
    const type = legend.type;
    if (currentVisibility[type] == null) {
      currentVisibility[type] = true;
    }

    currentVisibility[type] = !currentVisibility[type];
    innerMapRef.value?.toggleCircleVisibility(type);
  } else if (activeOuterTab.value === 'spatial_area') {
    // 内部地图多边形模式
    const label = legend.label;
    if (currentVisibility[label] == null) {
      currentVisibility[label] = true;
    }

    currentVisibility[label] = !currentVisibility[label];
    innerMapRef.value?.togglePolygonVisibility(label);
  }
};

// 处理顶部标签页变化
const handleOuterTabChange = (tab) => {
  console.log('Outer tab changed to:', tab);
  // 这里可以根据不同的标签页切换不同的视图或加载不同的数据
  // 例如，如果切换到列表视图，可以隐藏地图，显示列表等
};

// 处理筛选变化
const handleFilterChange = () => {
  emit('filterChange', selectedCameraTypes.value);
  refreshMarkers();
};

// 处理位置变化
const changeLocation = (type) => {
  console.log('changeLocation', type);
  // 根据位置变化更新数据
  getList();
};

const viewDetails = (robot) => {
  console.log('viewDetails', robot);
  selectedRobot.value = {
    robotSn: robot.id,
    totalTasks: robot.totalTasks,
    totalRunningHours: robot.totalRunningHours,
    totalArea: robot.totalArea,
    ...robot
  };
  showDetailPanel.value = true;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  // 如果有搜索栏引用，获取搜索文本
  filterParams.value.search = searchbarRef?.value?.searchText;
  if (activeOuterTab.value === 'location_view') {
    refreshMarkers();
    getList();
  } else if (activeOuterTab.value === 'spatial_area') {
    innerMapRef.value?.loadMap(activeOuterTab.value);
  } else if (activeOuterTab.value === 'robot') {
    robotMapRef.value?.getData(true); // update robot list
  } else if (activeOuterTab.value === 'multiple_map') {
    multipleRef.value?.refreshMap();
    
  }

  // showSearch.value = false;
};

/** 重置按钮操作 */
const resetQuery = (trigger = true) => {
  queryFormRef.value?.resetFields();
  // 重置筛选参数
  filterParams.value = {
    locationId: '',
    robotType: '',
    robotName: '',
    robotSn: '',
    floorId: ''
  };

  filterPanelRef.value.clearSelection();
  // 重置相机类型选择
  selectedCameraTypes.value = props.cameraTypes.map((type) => type.value);

  // 刷新标记
  if (trigger) {
    handleQuery();
  }
};

// 处理快速筛选选择
const selectQuickFilter = (value) => {
  quickFilterSelected.value = value;

  // 根据选择的快速筛选项更新标记点显示
  if (value === 'all_terminal') {
    // 显示所有类型
    selectedCameraTypes.value = props.cameraTypes.map((type) => type.value);
  } else {
    // 只显示选中的类型
    selectedCameraTypes.value = [value];
  }

  // 触发筛选变化事件
  handleFilterChange();
};

const clickTab = async (type) => {
  if (activeOuterTab.value === type) {
    return;
  }
  resetQuery(false);
  activeOuterTab.value = type;

  if (type === 'location_view') {
    legends.value = props.legends;
    // 初始化 markerVisibility 状态
    initializeMarkerVisibility();
    nextTick(async () => {
      await refreshMarkers();
    });
  } else if (type === 'spatial_list') {
    legends.value = props.legends;
    // 初始化 markerVisibility 状态
    initializeMarkerVisibility();
    // 显示列表视图
    // ...
  } else if (type === 'spatial_area') {
    legends.value = props.legends;
    nextTick(async () => {
      const areaLegends = await innerMapRef.value?.getLegends();
      console.log('clickTab', areaLegends);
      legends.value = areaLegends;
      // 初始化 markerVisibility 状态
      initializeMarkerVisibility();
 });
   
    // 显示区域视图
    // ...
  }
  cardData.value = null;
};

// 初始化标记可见性状态
const initializeMarkerVisibility = () => {
  const currentVisibility = getCurrentVisibility();

  legends.value.forEach((legend) => {
    if (activeOuterTab.value === 'spatial_area') {
      // 对于spatial_area模式，使用legend.label作为key
      if (currentVisibility[legend.label] === undefined) {
        currentVisibility[legend.label] = true;
      }
    } else {
      // 对于其他模式，使用legend.type作为key
      if (currentVisibility[legend.type] === undefined) {
        currentVisibility[legend.type] = true;
      }
    }
  });
};

// 创建自定义图标
const createMarkerIcon = (color) => {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0,
    strokeColor: color,
    strokeWeight: 4,
    scale: 6
  };
};

// 获取标记点颜色
const getMarkerColor = (type) => {
  const legend = props.legends.find((l) => l.type === type);
  return legend ? legend.color : '#09F';
};

// 显示悬浮提示
const showTooltip = (content, position) => {
  activeTooltip.value = content;

  // 计算 tooltip 位置
  const mapRect = mapContainer.value.getBoundingClientRect();
  const x = position.x - mapRect.left;
  const y = position.y - mapRect.top - 30; // 向上偏移一些

  tooltipStyle.value = {
    top: `${y}px`,
    left: `${x}px`
  };
};

// 隐藏悬浮提示
const hideTooltip = () => {
  activeTooltip.value = null;
};

// 清除所有标记
const clearMarkers = () => {
  Object.values(markerGroups.value).forEach((group) => {
    group.forEach((marker) => {
      if (marker) {
        google?.maps?.event?.clearInstanceListeners(marker);
        marker.setMap(null);
      }
    });
  });
  markerGroups.value = {};
  // 清空标记数据
  markers.value = [];
};

// 添加单个标记
const addSingleMarker = (markerData) => {
  try {
    // 获取标记点颜色
    const markerColor = markerData.color || getMarkerColor(markerData.type);
    // 检查该类型的标记是否应该显示
    const isVisible = !disabledMarkerTypes.value.includes(markerData.type);
    // 创建自定义标记图标，根据类型设置不同样式
    const customIcon = {
      ...createMarkerIcon(markerColor),
      // 添加一些额外的样式属性，使标记更加美观
      strokeOpacity: 1,
      fillOpacity: 0,
      scale: 10
    };
    // 创建标记
    const marker = new google.maps.Marker({
      position: { lat: markerData.lat, lng: markerData.lng },
      map: isVisible ? map.value : null, // 根据可见性设置地图
      title: markerData.title,
      sn: markerData.sn,
      id: markerData.id,
      icon: markerData.icon || customIcon,
      // 添加动画效果
      animation: isVisible ? google.maps.Animation.DROP : null,
      // 设置初始不透明度为0，然后逐渐增加
      opacity: isVisible ? 0 : 1
    });
    // 如果标记可见，添加淡入动画
    if (isVisible) {
      let opacity = 0;
      const fadeIn = setInterval(() => {
        opacity += 0.1;
        marker.setOpacity(Math.min(opacity, 1));
        if (opacity >= 1) {
          clearInterval(fadeIn);
        }
      }, 50);
    }
    // 添加鼠标悬停事件
    marker.addListener('mouseover', (e) => {
      if (markerData.tooltip) {
        showTooltip(markerData.tooltip, {
          x: e.domEvent.clientX,
          y: e.domEvent.clientY
        });
      }
    });
    // 添加鼠标离开事件
    marker.addListener('mouseout', () => {
      hideTooltip();
    });
    // 添加点击事件
    marker.addListener('click', async (e) => {
      const res = await getRobotSpatial(marker.id);
      // console.log(res, 'click marker to get robotSpatial data');
      const node = res.data;
      const data = {
        'sensorId': node.robotSn,
        'sensorName': node.robotName,
        'sensorType': node.robotType,
        'location': node.location,
        'statusValue': node.status,
        'power': node.batteryLevel,
        'recentEvents': node.recentEvents.split(',')
      };
      const color = node.status === 'Online' ? '#00BA4A' : '#ff384c';
      const detailList = [
        { name: 'Current Task', value: node.currentTask || 0, icon: 'CurrentTask', color, recordTime: node.taskTime },
        { name: 'Total Tasks', value: node.totalTasks || 0, icon: 'TotalTasks', color },
        { name: 'Total Running Hours', value: useUtils.formatRunningHours(node.totalRunningHours || 0), icon: 'TotalRunningHours', color },
        { name: 'Total Area', value: convertWithUnit({ value: node.totalArea || 0, type: 'area' }), icon: 'TotalArea', color },
        { name: 'Water Level', value: (node.waterLevel || 0) + '%', icon: 'WaterLevel', color },
        { name: 'Sewage Level', value: (node.sewageLevel || 0) + '%', icon: 'SewageLevel', color }
      ];
      // 计算卡片位置
      calculateCardPosition(e.domEvent);
      cardData.value = data;
      emit('markerClicked', data);
      nextTick(() => {
        defaultBoardForm.value?.initData(1, [data], detailList, node);
      });
    });
    // 添加双击事件打开详情抽屉
    marker.addListener('dblclick', async (e) => {
      const res = await getRobotSpatial(marker.id);
      const robotData = res.data;
      openDetailPanel(robotData);
    });
    // 保存标记实例和数据
    const type = markerData.type;
    if (!markerGroups.value[type]) markerGroups.value[type] = [];
    markerGroups.value[type].push(marker);
    markers.value.push(markerData);
  } catch (error) {
    console.error('Failed to create marker:', error);
  }
};

const recentItem = (index, isName = false) => {
  return 'recentItem' + (isName ? 'Name' : '') + index;
};

// 刷新所有标记
const refreshMarkers = async () => {
  // console.log('refreshMarkers: Starting map refresh...');

  // 设置loading状态
  mapLoading.value = true;

  try {
    // 完全销毁当前地图实例
    if (map.value) {
      // console.log('refreshMarkers: Destroying existing map...');
      // 清除所有标记
      clearMarkers();

      // 销毁地图实例
      map.value = null;
    }

    // 等待DOM更新
    await nextTick();

    // 重新初始化地图
    // console.log('refreshMarkers: Reinitializing map...');
    await initMap();

    // console.log('refreshMarkers: Map refresh completed');
  } catch (error) {
    console.error('refreshMarkers: Error during map refresh:', error);
    proxy?.$modal.msgError('Failed to refresh map. Please try again later.');
  } finally {
    mapLoading.value = false;
  }
};

const getParams = () => {
  // 构建查询参数，包含日期范围
  const params = { ...filterParams.value, type: duration.value };
  
  
  if(activeOuterTab.value === 'multiple_map') {
    const location = filterPanelRef.value?.getSelectedPath() || {};
    params.buildingId = location[0];
    params.floorId = location[1];
  } else {
    const location = filterPanelRef.value?.getLastLevelSelection() || {};
    const [key, value] =  [location.levelName, location.value];
    params[key] = value;
  }
  if (activeOuterTab.value !== 'multiple_map' && activeOuterTab.value !== 'robot') {
    return params;
  }
  const parameters = proxy?.addDateRange(params, dateRange.value);

  return parameters;
};

// 获取数据列表
const getList = async () => {
  try {
    loading.value = true;

    // 首先清除所有现有的Google markers
    clearMarkers();

    // 构建查询参数，包含日期范围
    const params = getParams();
    const res = await getGoogleMap(params);
    const arr = [];

    res.data.forEach((item) => {
      arr.push({
        id: item.robotSn,
        lat: item.latitude,
        lng: item.longitude,
        title: item.robotName,
        sn: item.robotSn,
        type: item.robotType,
        status: item.status,
        color: item.status === 'Online' ? '#00BA4A' : '#FF384C'
      });
    });
    markersData.value = arr;

    // 刷新标记
    refreshMarkers();

    // 使用nextTick确保DOM更新后再关闭加载状态
    nextTick(() => {
      loading.value = false;
    });
  } catch (error) {
    console.error('Failed to get data:', error);
    loading.value = false;
  }
};

// 初始化地图
const initMap = async () => {
  try {
    // 加载谷歌地图 API
    const googleMaps = await GoogleMapsApiLoader({
      apiKey: GOOGLE_MAPS_API_KEY
    });

    // 保存 google 对象到全局变量，以便其他函数使用
    window.google = googleMaps;

    const node = getAvaliableData(markersData.value);

    // 初始化地图
    map.value = new googleMaps.maps.Map(mapContainer.value, {
      center: {
        lat: node?.lat || props.center.lat,
        lng: node?.lng || props.center.lng
      },
      zoom: props.zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false, // 使用自定义全屏按钮
      zoomControl: false, // 使用自定义缩放按钮
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // 添加标记
    // console.log('initMap: Adding markers...');
    markersData.value.forEach((marker) => {
      addSingleMarker(marker);
    });

    // 启用图例点击
    allowLegendClick.value = true;
  } catch (error) {
    console.error('Failed to load google map:', error);
  }
};

// 地图控制功能
const handleFullScreen = () => {
  if (activeOuterTab.value === 'location_view') {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      mapContainer.value.requestFullscreen();
    }
  } else {
    innerMapRef.value?.toggleFullscreen();
  }
};

const refreshView = async () => {
  if (activeOuterTab.value === 'location_view') {
    await getList();
  } else {
   innerMapRef.value?.loadMap();
    
  }
};

const getAvaliableData = (data) => {
  return data.find((d) => d.lat && d.lng);
};

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 10, 200);
  if (activeOuterTab.value === 'location_view') {
    const currentZoom = map.value.getZoom();
    map.value.setZoom(currentZoom + 1);
  } else {
    innerMapRef.value?.setCanvasZoom(zoomLevel.value);
  }
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 10, 50);
  if (activeOuterTab.value === 'location_view') {
    const currentZoom = map.value.getZoom();
    map.value.setZoom(currentZoom - 1);
  } else {
    innerMapRef.value?.setCanvasZoom(zoomLevel.value);
  }
};

// 相机信息卡片功能
const closeInfoCard = () => {
  cardData.value = null;
  isCardExpanded.value = false;
};

const viewCameraDetails = () => {
  if (cardData.value) {
    emit('viewDetails', cardData.value);
  }
};

// 切换卡片展开/收起状态
const toggleCardExpand = () => {
  isCardExpanded.value = !isCardExpanded.value;
};

// 计算卡片位置
const calculateCardPosition = (event) => {
  if (!mapContainer.value) return;

  const mapRect = mapContainer.value.getBoundingClientRect();
  const mapWidth = mapRect.width;
  const mapHeight = mapRect.height;

  // 获取点击位置相对于地图容器的坐标
  const x = event.clientX - mapRect.left;
  const y = event.clientY - mapRect.top;

  // 卡片宽度和高度（估计值）
  const cardWidth = 300;
  const cardHeight = 200;

  // 计算卡片位置，确保不超出地图边界
  let left = x + 20; // 默认在点击位置右侧
  let top = y - 20;

  // 如果卡片会超出右边界，则放在左侧
  if (left + cardWidth > mapWidth) {
    left = x - cardWidth - 20;
  }

  // 如果卡片会超出下边界，则向上调整
  if (top + cardHeight > mapHeight) {
    top = mapHeight - cardHeight - 20;
  }

  // 确保不超出上边界和左边界
  top = Math.max(20, top);
  left = Math.max(20, left);

  // 更新卡片位置
  cardPosition.value = {
    top: `${top}px`,
    left: `${left}px`
  };
};

// 刷新相机数据
const refreshCamera = () => {
  // 这里可以添加刷新单个相机数据的逻辑
  console.log('Refreshing camera data:', cardData.value);
};

// 在组件挂载后初始化地图和数据
onMounted(async () => {
  await nextTick();

  try {
    // 初始化 markerVisibility 状态
    initializeMarkerVisibility();

    // 这里可以添加API调用，获取过滤选项数据
    // 例如：
    const [types, sns, names, locations, floors] = await Promise.all([
      getRobotTypes(),
      getRobotSnList(),
      getRobotNames(),
      getLocations(),
      getFloors()
    ]);
    robotTypeList.value = types.data;
    robotNameList.value = names.data;
    robotSNList.value = sns.data;
    locationList.value = locations.data;
    floorIdList.value = floors.data;
    // 获取数据
    await getList();
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});

// 监听 markersData 变化
watch(
  () => markersData,
  () => {
    if (map.value) {
      refreshMarkers();
    }
  },
  { deep: true }
);

// 监听 visibleMarkersData 变化
watch(
  visibleMarkersData,
  () => {
    if (map.value) {
      refreshMarkers();
    }
  },
  { deep: true }
);

// 监听 center 变化
watch(
  () => props.center,
  (newCenter) => {
    if (map.value && newCenter) {
      map.value.setCenter(newCenter);
    }
  }
);

// 监听 zoom 变化
watch(
  () => props.zoom,
  (newZoom) => {
    if (map.value && newZoom) {
      map.value.setZoom(newZoom);
      zoomLevel.value = 100; // 重置缩放级别显示
    }
  }
);

// 抽屉相关方法
const openDetailPanel = (robotData) => {
  selectedRobot.value = robotData;
  showDetailPanel.value = true;
};

const closeDetailPanel = () => {
  showDetailPanel.value = false;
  selectedRobot.value = null;
};

// 处理机器人行点击事件
const handleRobotClick = async (robotId) => {
  try {
    const res = await getRobotSpatial(robotId);
    const robotData = res.data;
    openDetailPanel(robotData);
  } catch (error) {
    console.error('Failed to get robot details:', error);
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.camera-map-view {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;

  &.embedded-view {
    padding: 10px;
    background-color: transparent;
  }
}

.outer-tab-container {
  margin-bottom: 10px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav) {
    border-radius: 4px;
  }

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 500;

    &.is-active {
      color: $color-blue;
    }
  }
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  padding: 8px 20px;
  background: $color-light-gray;
  border-radius: 8px 8px 0 0;

  .title-section {
    display: flex;
    align-items: center;
    gap: 8px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #11191e;
    }

    .info-icon {
      color: $color-gray;
      cursor: pointer;

      &:hover {
        color: $color-blue;
      }
    }
  }
}

.inner-tab-container {
  padding: 16px 20px 0;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav) {
    border: none;
  }

  :deep(.el-tabs__item) {
    height: 32px;
    line-height: 32px;
    padding: 0 16px;
    border-radius: 16px;
    border: 1px solid $color-gray;
    margin-right: 8px;
    color: $color-gray;
    transition: all 0.3s;

    &.is-active {
      color: white;
      background: $color-blue;
      border-color: $color-blue;
      box-shadow:
        0px 10px 15px -3px rgba(0, 153, 255, 0.4),
        0px 4px 6px -2px rgba(17, 25, 30, 0.1);
    }

    &:hover:not(.is-active) {
      border-color: #c6e2ff;
      color: $color-blue;
    }
  }
}

.map-section {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;

  // 确保地图容器可以正确定位子元素
  &:has(.map-container) {
    position: relative;
  }
}

.legend-container {
  display: flex;
  justify-content: center;
  height: 30px;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .legend-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
    padding: 6px 10px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;

    &.disabled {
      opacity: 0.6;
      position: relative;

      .legend-marker {
        border-color: #909399 !important;
        background-color: rgba(144, 147, 153, 0.2);
      }

      .legend-label {
        color: #909399;
        text-decoration: line-through;
        text-decoration-color: rgba(144, 147, 153, 0.5);
      }
    }

    &.not-allow {
      cursor: not-allowed;
      pointer-events: none;
    }

    &:hover:not(.disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

      &::before {
        opacity: 0.05;
      }

      .legend-marker {
        transform: scale(1.1);
      }
    }

    &:active:not(.disabled) {
      transform: translateY(0) scale(0.95);
      transition: transform 0.1s ease;
    }

    .legend-marker {
      width: 12px;
      height: 12px;
      margin-right: 6px;
      transition: all 0.3s ease;

      &.circle {
        border-radius: 50%;
        background-color: transparent;
        border: 3px solid;
      }

      &.rect {
        border-radius: 2px;
        background-color: currentColor;
        border: none;
      }

      &.Forecasted {
        border-color: $color-blue;
      }

      &.Online {
        border-color: $color-green;
      }

      &.Warning {
        border-color: $color-yellow;
      }

      &.Offline {
        border-color: $color-red;
      }
    }

    .legend-label {
      font-size: 12px;
      color: #606266;
      transition: color 0.3s ease;
    }

    &:hover:not(.disabled) .legend-label {
      color: $color-blue;
    }
  }
}

.map-container {
  width: 100%;
  height: calc(100% - 30px);
  min-height: 300px;
  min-height: 200px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  position: relative; // 确保子元素可以相对于它定位
}

// 地图右上角控制区域
.map-top-controls {
  position: absolute;
  top: 60px;
  right: 30px;
  z-index: 10;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 500px;

  &.embedded {
    // 嵌入模式下的样式调整
    width: 240px;
    padding: 8px;
  }
  .filter-section {
    display: flex;
    align-items: center;
    padding: 16px;

    .show-robots {
      display: flex;
      flex-direction: column;

      .title {
        color: var(--VI-text-B12, #11191e);
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 16px; /* 100% */
        letter-spacing: -0.144px;
        margin-bottom: 12px;
      }

      :deep(.el-checkbox-group) {
        display: flex;
        gap: 12px;
      }

      :deep(.el-checkbox__label) {
        font-size: 12px;
      }
    }
  }

  .map-status {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;

    .status-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;

      .status-icon {
        width: 10px;
        height: 10px;
        border-radius: 50%;

        &.online {
          background-color: $color-green;
        }

        &.offline {
          background-color: $color-red;
        }
      }
    }
  }

  .map-filter {
    .filter-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      :deep(.el-button) {
        padding: 4px 8px;
        font-size: 12px;
        border: 1px solid #dcdfe6;

        &.active {
          color: white;
          background-color: $color-blue;
          border-color: $color-blue;
        }
      }
    }
  }
}

.map-tooltip {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  transform: translate(-50%, 20px);

  .tooltip-content {
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    color: #303133;
    min-width: 120px;
  }

  .tooltip-arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid white;
  }
}

.map-controls {
  position: absolute;
  right: 10px;
  display: flex;
  gap: 10px;
  z-index: 10;

  .control-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .control-btn {
    background-color: white;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    margin-left: 0;
    gap: 5px;
    font-size: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: white;
    border-radius: 4px;
    height: 32px;
    padding: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .zoom-btn {
      padding: 4px;
      min-height: auto;
      border: none;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .zoom-level {
      font-size: 12px;
      margin: 0 8px;
      min-width: 40px;
      text-align: center;
    }
  }
}

.priority-buttons {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  background: var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
  height: 2.5rem;
  padding: 2px;
  width: 100%;

  .priority-btn {
    &.el-button--primary {
      color: #11191e;
      border-radius: 8px;
      background: var(--layout-bg_TextSelection, #fff);
      box-shadow:
        0px 4px 6px -1px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1)),
        0px 2px 4px -1px var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));
    }
  }

  .el-button {
    margin-left: 0;
    border: none;
    font-size: 12px;
    flex: 1;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    border-radius: 4px;
    background: transparent;
  }

  @media screen and (max-width: 639px) {
    .el-button {
      font-size: 8px !important;
    }
  }
}

.camera-info-card {
  position: absolute;
  width: 350px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  z-index: 20;
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 500px;

  &.expanded {
    max-height: 800px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: $color-light-gray;
    border-bottom: 1px solid #ebeef5;

    .camera-title {
      display: flex;
      flex-direction: column;

      .camera-id {
        font-size: 12px;
        color: $color-gray;
        margin-bottom: 2px;
      }

      .camera-name {
        font-size: 16px;
        font-weight: 600;
        color: #11191e;
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .toggle-btn {
        padding: 4px 8px;
        min-height: auto;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          background-color: #f5f7fa;
        }
      }

      .close-btn {
        padding: 4px;
        min-height: auto;
        border: none;
        background: transparent;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .card-basic-info {
    padding: 16px;

    .status-indicator {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .status-icon {
        font-size: 18px;
        margin-right: 8px;

        &.status-critical {
          color: $color-red;
        }

        &.status-warning {
          color: $color-yellow;
        }

        &.status-normal {
          color: $color-green;
        }

        &.status-forecasted {
          color: $color-blue;
        }
      }

      .status-text {
        font-size: 14px;
        font-weight: 500;

        &.status-critical {
          color: $color-red;
        }

        &.status-warning {
          color: $color-yellow;
        }

        &.status-normal {
          color: $color-green;
        }

        &.status-forecasted {
          color: $color-blue;
        }
      }
    }

    .metrics-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .metric-item {
        text-align: center;
        flex: 1;

        .metric-value {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;

          &:nth-child(1) {
            color: $color-red;
          }

          &:nth-child(2) {
            color: $color-red;
          }

          &:nth-child(3) {
            color: $color-yellow;
          }

          &:nth-child(4) {
            color: $color-blue;
          }
        }

        .metric-label {
          font-size: 12px;
          color: $color-gray;
        }
      }
    }

    .location-info {
      .location-text {
        font-size: 14px;
        color: #11191e;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .timestamp {
        font-size: 12px;
        color: $color-gray;
      }
    }
  }

  .card-detailed-info {
    padding: 0 16px 16px;
    border-top: 1px solid #ebeef5;

    .detail-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .detail-item {
        display: flex;
        align-items: center;

        .detail-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(0, 153, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: $color-blue;
        }

        .detail-content {
          flex: 1;

          .detail-label {
            font-size: 12px;
            color: $color-gray;
            margin-bottom: 2px;
          }

          .detail-value {
            font-size: 14px;
            font-weight: 500;
            color: #11191e;
          }
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid #ebeef5;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 6px 12px;
    }
  }
}

.tooltip-content {
  max-width: 300px;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px 12px;
}

.recentCell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  line-height: 16px;

  .value {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: 40px;
    height: 24px;
    border-radius: 100px;
    display: flex;
    padding: 4px 16px;
  }
}

.recentItem0 {
  @extend .clean-critical;
}

.recentItem1 {
  @extend .clean-medium;
}

.recentItem2 {
  @extend .clean-warning;
}

.recentItem3 {
  @extend .clean-primary;
}

.recentItemName0 {
  color: $color-red;
}

.recentItemName1 {
  color: $color-orange;
}

.recentItemName2 {
  color: $color-yellow;
}

.recentItemName3 {
  color: $color-blue;
}

:deep(.el-checkbox) {
  margin-right: 4px !important;
}
</style>
<style scoped>
.robot-detail-drawer {
  :deep(.el-drawer__header) {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 0;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    height: calc(100vh - 80px);
    overflow: hidden;
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--tableHeaderTextColor);
}

.detail-content {
  height: 100%;
  overflow: auto;
}
</style>
