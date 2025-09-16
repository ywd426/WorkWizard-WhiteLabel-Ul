<template>
  <div class="single-map-page">
    <!-- Statistics Panel -->
    <div>
      <el-button v-if="!showStatistics" class="show-stats-btn" type="primary" size="small" @click="showStatistics = true">
        <el-icon class="mr-1"><DataAnalysis /></el-icon>
        <span>Show Overview</span>
      </el-button>

      <transition name="fade">
        <div v-show="showStatistics" class="statistics-card">
          <div class="card-header">
            <h3 class="card-title">Cleaning Overview</h3>
            <el-button type="text" class="close-btn" @click="showStatistics = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div v-if="currentTaskInfo" class="task-info-section">
            <div class="task-name">
              {{ currentTaskInfo.taskName || 'Unnamed Task' }}
            </div>
            <div class="task-time">
              <span v-if="currentTaskInfo.startTime">
                {{ useUtils.formatDate(currentTaskInfo.startTime) }}
              </span>
              <span v-if="currentTaskInfo.endTime"> - {{ useUtils.formatDate(currentTaskInfo.endTime) }} </span>
              <span v-if="!currentTaskInfo.startTime && !currentTaskInfo.endTime"> No time information </span>
            </div>
          </div>
          <div v-else class="task-info-section">
            <div class="task-name">No task information</div>
            <div class="task-time">-</div>
          </div>
          <div v-for="(item, index) in statsItems" :key="index" class="stats-item w-full flex flex-row justify-between items-center">
            <div class="flex-1 flex items-center">
              <div class="icon-container" :class="item.color">
                <svg-icon :icon-class="item.icon" />
              </div>
              <span class="stats-label">{{ item.label }}</span>
            </div>
            <div class="stats-content">
              <span class="stats-value">{{ item.value }} {{ item.unit }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Map List Panel -->
      <div class="map-list-panel" :class="{ 'collapsed': !mapListExpanded }">
        <div class="map-list-toggle" @click="toggleMapList">
          <el-icon class="toggle-icon" :class="{ 'rotated': !mapListExpanded }">
            <DArrowLeft />
          </el-icon>
        </div>
        <div v-show="mapListExpanded" v-loading="isMapLoading" class="map-list-content">
          <div
            v-for="(map, index) in paginatedMapList"
            :key="map.url"
            class="map-list-item"
            :class="{ 'highlighted': selectedMap?.mapName === map.mapName }"
            @click="selectMapFromList(map, index)"
          >
            <div class="map-item-header">
              <div class="map-name flex flex-col">
                <span class="title" :title="map.mapName">{{ map.mapName }}</span>
                <span class="desc">{{ useUtils.formatDate(map.startTime) }}</span>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div v-if="mapList.length > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20]"
              :total="mapList.length"
              layout="prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-container">
        <div class="responsive-map-wrapper">
          <div ref="mapContainer" v-loading="isInitLoading" class="map-view">
            <img
              v-if="baseLayerUrl"
              :src="baseLayerUrl"
              alt="Coverage Map"
              class="map-layer base-map"
              @load="onBaseImageLoad"
              @error="onImageError"
            />
            <div v-else-if="!baseLayerUrl" class="map-layer base-map no-image">
              {{ noImageInfo }}
            </div>
          </div>
          <!-- 上一张/下一张操作按钮 -->
          <div v-if="orgData && orgData.length > 1" class="map-navigation">
            <el-button
              class="nav-btn prev-btn"
              :disabled="currentMapIndex === orgData.length - 1"
              @click="goToPrevMap"
              @mouseenter="currentMapIndex !== orgData.length - 1 && (isPrevHover = true)"
              @mouseleave="currentMapIndex !== orgData.length - 1 && (isPrevHover = false)"
            >
              <svg-icon :icon-class="isPrevHover ? 'map-left-hover' : 'map-left'" />
            </el-button>
            <el-button
              class="nav-btn next-btn"
              :disabled="currentMapIndex === 0"
              @click="goToNextMap"
              @mouseenter="currentMapIndex !== 0 && (isNextHover = true)"
              @mouseleave="currentMapIndex !== 0 && (isNextHover = false)"
            >
              <svg-icon :icon-class="isNextHover ? 'map-right-hover' : 'map-right'" />
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-header">
      <div class="map-controls">
        <el-button class="control-btn" @click="toggleFullscreen">
          Full Screen
          <el-icon class="ml-2"><FullScreen /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { DataAnalysis, Close, DArrowLeft, FullScreen } from '@element-plus/icons-vue';
import * as useUtils from '@/utils/index';
import { getAreaMap, getCleanTaskList } from '@/api/robot';
import { convertWithUnit } from '@/utils';
import useAppStore from '@/store/modules/app';

// 响应式数据
const mapContainer = ref<HTMLElement>();
const isInitLoading = ref(true);
const isMapLoading = ref(false);
const showStatistics = ref(true);
const mapListExpanded = ref(true);
const selectedMap = ref<MapItem | null>(null);
const noImageInfo = ref('No Specified Task');

// 地图数据
const baseLayerUrl = ref('');

// 地图列表数据
interface MapItem {
  url: string;
  mapName: string;
  startTime: string;
}

const mapList = ref<MapItem[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 缓存相关
const cachedBaseMapUrl = ref('');
const orgData = ref<any>(null);

// 地图尺寸
const MAP_WIDTH = ref(2078);
const MAP_HEIGHT = ref(1850);

const statsItems = ref([
  {
    icon: 'cleaned-today',
    color: 'cyan',
    label: 'Cleaned Area',
    value: '0',
    unit: ''
  },
  {
    icon: 'total-planned-area',
    color: 'blue',
    label: 'Planned Area',
    value: '0',
    unit: ''
  },
  {
    icon: 'coverage',
    color: 'green',
    label: 'Coverage',
    value: '0',
    unit: '%'
  },
  {
    icon: 'active-robots',
    color: 'purple',
    label: 'Task Duration',
    value: '0',
    unit: ''
  }
]);
const currentMapIndex = ref(0);
// 添加hover状态
const isPrevHover = ref(false);
const isNextHover = ref(false);
// Props
const props = defineProps({
  getParams: {
    type: Function,
    default: null
  }
});
const currentTaskInfo = computed(() => {
  if (orgData.value && orgData.value.length > 0 && currentMapIndex.value >= 0) {
    const currentMapData = orgData.value[currentMapIndex.value];
    return {
      taskName: currentMapData.taskName,
      startTime: currentMapData.startTime,
      endTime: currentMapData.endTime
    };
  }
  return null;
});
// 添加导航方法
const goToPrevMap = () => {
  if (currentMapIndex.value < orgData.value.length - 1) {
    currentMapIndex.value++;
    updateMapFromOrgData();
    if (currentMapIndex.value === orgData.value.length - 1) {
      isPrevHover.value = false;
    }
  }
};
const goToNextMap = () => {
  if (currentMapIndex.value > 0) {
    currentMapIndex.value--;
    updateMapFromOrgData();
    if (currentMapIndex.value === 0) {
      isNextHover.value = false;
    }
  }
};
// 更新地图显示的方法
const updateMapFromOrgData = () => {
  if (orgData.value && orgData.value.length > 0) {
    const currentMapData = orgData.value[currentMapIndex.value];

    // 更新统计信息
    statsItems.value[0].value = convertWithUnit({ value: currentMapData.planArea || 0, type: 'area' });
    statsItems.value[1].value = convertWithUnit({ value: currentMapData.actualArea || 0, type: 'area' });
    statsItems.value[2].value = currentMapData.coverage || 0;
    statsItems.value[3].value = `${currentMapData.duration || 0} min`;

    // 更新地图图片
    baseLayerUrl.value = currentMapData.url || '';

    if (!currentMapData.url) {
      noImageInfo.value = 'No Corresponding Map Generated.';
    }

    updateMapDimensions();
  }
};
// 计算属性
// 分页后的地图列表
const paginatedMapList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return mapList.value.slice(start, end);
});

// 方法
const selectMapFromList = async (map: MapItem, index: number) => {
  selectedMap.value = map;
  // 选择地图时加载该地图的统计数据
  await loadMapData(map.mapName);
};

const toggleMapList = () => {
  mapListExpanded.value = !mapListExpanded.value;
};

// 分页处理方法
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

const onBaseImageLoad = () => {
  console.log('Base image loaded successfully');
  updateMapDimensions();
};

const onImageError = (event: Event) => {
  console.error('Failed to load image:', event);
  ElMessage.warning('Failed to load map image');
};

const updateMapDimensions = async () => {
  if (baseLayerUrl.value) {
    try {
      const dimensions = await loadImageDimensions(baseLayerUrl.value);
      MAP_WIDTH.value = dimensions.width;
      MAP_HEIGHT.value = dimensions.height;
      console.log(`Map dimensions updated: ${dimensions.width}x${dimensions.height}`);
    } catch (error) {
      console.warn('Failed to load image dimensions, using defaults:', error);
    }
  }
  isInitLoading.value = false;
};

const loadImageDimensions = (imageSrc: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageSrc;
  });
};

const loadMapData = async (mapName?: string) => {
  isMapLoading.value = true;
  isInitLoading.value = true;
  try {
    const res = await getAreaMap(getCurrentParams(mapName));
    orgData.value = JSON.parse(JSON.stringify(res.data));
    // 重置当前索引到第一个
    currentMapIndex.value = 0;
    if (orgData.value && orgData.value.length > 0) {
      updateMapFromOrgData();
    } else {
      // 如果没有数据，重置统计信息
      resetStats();
    }
  } catch (error) {
    console.error('Failed to load map data:', error);
    ElMessage.error('Failed to load map data');
    resetStats();
  } finally {
    isMapLoading.value = false;
    isInitLoading.value = false;
  }
};
// 添加重置统计信息的方法
const resetStats = () => {
  statsItems.value[0].value = '0';
  statsItems.value[1].value = '0';
  statsItems.value[2].value = '0';
  statsItems.value[3].value = '0 min';
  baseLayerUrl.value = '';
  noImageInfo.value = 'No Corresponding Map Generated.';
};
// 修改 refreshMap 方法
const refreshMap = async () => {
  await getCleanTaskListData();

  // 如果当前有选中的地图，重新加载该地图的数据
  if (selectedMap.value) {
    await loadMapData(selectedMap.value.mapName);
  } else if (mapList.value.length > 0) {
    // 如果没有选中的地图但有地图列表，选择第一个
    await selectMapFromList(mapList.value[0], 0);
  }
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    mapContainer.value?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const getCurrentParams = (mapName?: string) => {
  const params = props.getParams?.() || {};
  const baseParams = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    ...params
  };

  // 如果传入了 mapName，则添加到参数中
  if (mapName) {
    return {
      ...baseParams,
      mapName: mapName
    };
  }

  return baseParams;
};

const getCleanTaskListData = async () => {
  try {
    const params = getCurrentParams();
    const res = await getCleanTaskList(params);

    if (res.code === 200 && res.rows && Array.isArray(res.rows)) {
      mapList.value = res.rows;

      // 默认选择第一个地图
      if (mapList.value.length > 0 && !selectedMap.value) {
        selectMapFromList(mapList.value[0], 0);
      }
    } else {
      ElMessage.error(res.msg || 'Failed to load map list');
    }
  } catch (error) {
    console.error('Failed to get clean task list:', error);
    ElMessage.error('Failed to load map list');
  }
};

// 生命周期
onMounted(async () => {
  try {
    await getCleanTaskListData();

    // 默认选择第一个地图并加载其统计数据
    if (mapList.value.length > 0 && !selectedMap.value) {
      await selectMapFromList(mapList.value[0], 0);
    }
  } catch (error) {
    console.error('Failed to initialize single map:', error);
    ElMessage.error('Failed to load map data');
  }
});

onUnmounted(() => {
  cachedBaseMapUrl.value = '';
});

watch(
  () => useAppStore().currentUnits,
  () => {
    if (orgData.value) {
      const currentMapData = orgData.value[currentMapIndex.value];
      statsItems.value[0].value = convertWithUnit({
        value: currentMapData?.planArea || 0,
        type: 'area'
      });

      statsItems.value[1].value = convertWithUnit({
        value: currentMapData?.actualArea || 0,
        type: 'area'
      });
    }
  },
  { deep: true }
);

// 暴露方法
defineExpose({
  refreshMap
});
</script>

<style scoped lang="scss">
.single-map-page {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
  overflow: hidden;
}

.main-content {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.map-list-panel {
  width: 320px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.3s ease;
  padding-bottom: 12px;
}

.map-list-panel.collapsed {
  width: 50px;
}

.map-list-toggle {
  position: absolute;
  right: 10px;
  width: 24px;
  height: 24px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  border-radius: 4px;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
  }
}

.toggle-icon {
  color: #409eff;
  font-size: 18px;
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.map-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.pagination-container {
  padding: 16px 8px 8px 8px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.map-list-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
  }

  &.highlighted {
    border-color: #1890ff;
    background: #e6f7ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }
}

.map-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.map-name {
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: #11191e;
  max-width: 98%;

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .desc {
    font-weight: normal;
    font-size: 8px;
    line-height: 14px;
  }
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.responsive-map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f1f5f9;
  overflow: hidden;
}

.map-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;

  &.base-map {
    z-index: 1;
  }

  &.no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 16px;
  }
}

.map-header {
  position: absolute;
  bottom: 20px;
  right: 8px;
  z-index: 10;
}

.map-controls {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.statistics-card {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 10;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #11191e;
  margin: 0;
}

.close-btn {
  padding: 2px;
}

.show-stats-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 0;
}

.stats-item:last-child {
  margin-bottom: 0;
}

.icon-container {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #1890ff;

  svg {
    width: 24px;
    height: 24px;
  }
}

.stats-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    gap: 8px;
  }

  .control-btn {
    justify-content: center;
  }

  .statistics-card {
    width: 280px;
    right: 4px;
    top: 4px;
  }

  .show-stats-btn {
    right: 4px;
    top: 4px;
  }

  .map-list-panel {
    width: 280px;
  }
}
// 添加导航按钮样式
.map-navigation {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 20;
}

.nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #409eff;
    border-color: #409eff;

    :deep(svg) {
      fill: white;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :deep(svg) {
    width: 24px;
    height: 24px;
    fill: #409eff;
    transition: fill 0.3s ease;
  }
}

.task-info-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: #11191e;
  margin-bottom: 4px;
  line-height: 1.4;
  word-break: break-word;
}

.task-time {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.stats-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 4px 0;
}

.stats-item:last-child {
  margin-bottom: 0;
}
</style>
