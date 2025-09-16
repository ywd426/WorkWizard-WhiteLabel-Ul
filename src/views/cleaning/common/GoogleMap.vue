<template>
  <CleanCard :header="header" :showSelect="false" :showActionMenu="false">
    <div class="chart-container">
      <div class="legend-container">
        <div
          v-for="(legend, index) in legends"
          :key="index"
          class="legend-item"
          :class="{ 'disabled': isLegendDisabled(legend.type) }"
          @click="toggleMarkerType(legend.type)"
        >
          <div class="legend-marker" :class="legend.type"></div>
          <div class="legend-label">{{ legend.label }}</div>
        </div>
      </div>
      <div ref="mapContainer" class="map-container"></div>
      <div v-if="activeTooltip" class="map-tooltip" :style="tooltipStyle">
        <div class="tooltip-content">{{ activeTooltip }}</div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  </CleanCard>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import GoogleMapsApiLoader from 'google-maps-api-loader';
import CleanCard from '@/views/cleaning/common/CleanCard.vue';
import { useCleanStore } from '@/store/modules/cleaning';
const mapContainer = ref(null); // 地图容器
const map = ref(null); // 地图实例
const GOOGLE_MAPS_API_KEY = 'AIzaSyDFU-qpBSp61iriyMuvj--sqBtxjLRgmFY';
const cleanStore = useCleanStore();
const props = defineProps({
  header: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '306px'
  },
  pageId: {
    type: String,
    default: ''
  },
  markersData: {
    type: Array,
    default: () => [
      {
        id: 1,
        lat: 37.7749,
        lng: -122.4194,
        title: 'San Francisco',
        color: '#FF0000', // red
        icon: null, // can be custom icon URL
        type: 'Critical',
        tooltip: 'San Francisco - Critical Air Quality'
      },
      {
        id: 2,
        lat: 37.3382,
        lng: -121.8863,
        title: 'San Jose',
        color: '#00FF00', // green
        icon: null,
        type: 'Normal',
        tooltip: 'San Jose - Normal Air Quality'
      }
    ]
  },
  getGoogleData: {
    type: Function,
    default: null
  },
  center: {
    type: Object,
    default: () => ({ lat: 37.7749, lng: -122.4194 })
  },
  zoom: {
    type: Number,
    default: 8
  },
  legends: {
    type: Array,
    default: () => [
      { type: 'Forecasted', label: 'Forecasted', color: '#09F' },
      { type: 'Normal', label: 'Normal', color: '#00BA4A' },
      { type: 'Warning', label: 'Warning', color: '#EDB601' },
      { type: 'Critical', label: 'Critical', color: '#FF384C' }
    ]
  }
});
const emit = defineEmits(['markerClicked']); // 定义 markerClicked 事件

const disabledMarkerTypes = ref([]);
const markers = ref([]);
const infoWindows = ref([]);
const activeTooltip = ref(null);
const markerInstances = ref([]);
const allowLegendClick = ref(false);
const tooltipStyle = ref({
  top: '0px',
  left: '0px'
});

// 检查图例是否被禁用
const isLegendDisabled = (type) => {
  return disabledMarkerTypes.value.includes(type);
};

// 计算可见的标记点
const visibleMarkersData = computed(() => {
  return props.markersData.filter((marker) => !disabledMarkerTypes.value.includes(marker.type));
});

// 创建自定义图标
const createMarkerIcon = (color) => {
  return {
    path: google?.maps?.SymbolPath?.CIRCLE,
    fillColor: color,
    fillOpacity: 0,
    strokeColor: color,
    strokeWeight: 4,
    scale: 8
  };
};

// 获取标记点颜色
const getMarkerColor = (type) => {
  const legend = props.legends.find((l) => l.type === type);
  return legend ? legend.color : '#09F';
};

// 切换标记点类型的显示/隐藏
const toggleMarkerType = (type) => {
  if (!allowLegendClick.value) return;
  const index = disabledMarkerTypes.value.indexOf(type);
  if (index > -1) {
    disabledMarkerTypes.value.splice(index, 1);
  } else {
    disabledMarkerTypes.value.push(type);
  }

  // 重新添加标记
  if (map.value) {
    refreshMarkers();
  }
};
// 刷新所有标记
const refreshMarkers = () => {
  // 先清除所有现有标记
  clearMarkers();

  // 如果没有地图或没有可见标记，直接返回
  if (!map.value || !visibleMarkersData.value?.length) return;

  // 添加新标记
  visibleMarkersData.value.forEach((markerData) => {
    addSingleMarker(markerData);
  });
};
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
// 隐藏 tooltip
const hideTooltip = () => {
  activeTooltip.value = null;
};
const clearMarkers = () => {
  // 确保所有标记都被移除
  if (markerInstances.value.length > 0) {
    markerInstances.value.forEach((marker) => {
      if (marker) {
        // 移除所有事件监听器
        google.maps.event.clearInstanceListeners(marker);
        // 从地图中移除
        marker.setMap(null);
      }
    });
    // 清空数组
    markerInstances.value = [];
  }

  // 清空标记数据
  markers.value = [];
};
const addSingleMarker = (markerData) => {
  try {
    // 获取标记点颜色
    const markerColor = markerData.color || getMarkerColor(markerData.type);

    // 创建标记
    const marker = new google.maps.Marker({
      position: { lat: markerData.lat, lng: markerData.lng },
      map: map.value,
      title: markerData.title,
      icon: markerData.icon || createMarkerIcon(markerColor)
    });

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
    marker.addListener('click', (e) => {
      console.log(e.domEvent.clientX, e.domEvent.clientY);
      // 可以在这里添加点击标记的逻辑
      emit('markerClicked', markerData);
    });

    // 保存标记实例和数据
    markerInstances.value.push(marker);
    markers.value.push(markerData);
  } catch (error) {
    console.error('Error creating marker:', error);
  }
};

// 初始化地图
const initMap = async () => {
  try {
    const params = cleanStore.getPageFilterParams(props.pageId);
    const res = await props.getGoogleData({ ...params });
    console.log('AlertsPanel getGoogleData API:', res);
    // 加载谷歌地图 API
    const googleMaps = await GoogleMapsApiLoader({
      apiKey: GOOGLE_MAPS_API_KEY
    });

    // 保存 google 对象到全局变量，以便其他函数使用
    window.google = googleMaps;

    // 初始化地图
    map.value = new googleMaps.maps.Map(mapContainer.value, {
      center: props.center,
      zoom: props.zoom
    });

    // 添加标记
    refreshMarkers();
  } catch (error) {
    console.error('Failed to load google map:', error);
  }
};

// 在组件挂载后初始化地图
onMounted(() => {
  nextTick(async () => {
    await initMap();
  });
});

// 监听 markersData 变化
watch(
  () => props.markersData,
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
    }
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.map-container {
  width: 100%;
  height: v-bind('height'); /* 设置地图容器高度 */
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.legend-container {
  display: flex;
  padding: 12px 16px;
  height: 50px;
  gap: 16px;

  .legend-item {
    display: flex;
    align-items: center;
    cursor: not-allowed;
    pointer-events: none;
    user-select: none;
    transition: all 0.3s ease;

    &.disabled {
      opacity: 0.5;

      .legend-marker {
        border-color: #909399 !important;
      }

      .legend-label {
        color: #909399;
      }
    }

    &:hover:not(.disabled) {
      opacity: 0.8;
    }

    .legend-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 6px;
      background-color: transparent;
      border: 3px solid;
      transition: border-color 0.3s ease;

      &.Forecasted {
        border-color: $color-blue;
      }

      &.Normal {
        border-color: $color-green;
      }

      &.Warning {
        border-color: $color-yellow;
      }

      &.Critical {
        border-color: $color-red;
      }
    }

    .legend-label {
      font-size: 12px;
      color: #606266;
      transition: color 0.3s ease;
    }

    &:hover:not(.disabled) .legend-label {
      color: #409eff;
    }
  }
}

:deep(.marker-tooltip) {
  padding: 8px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #303133;
  min-width: 120px;
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
</style>
