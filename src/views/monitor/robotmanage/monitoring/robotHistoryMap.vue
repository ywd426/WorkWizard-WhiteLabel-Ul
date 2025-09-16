<template>
  <div class="robot-status-page h-full">
    <div>
      <el-button v-if="!showStatistics" class="show-stats-btn" type="primary" size="small" @click="showStatistics = true">
        <el-icon class="mr-1"><DataAnalysis /></el-icon>
        <span>Show Overview</span>
      </el-button>
      <transition name="fade">
        <div v-show="showStatistics" class="statistics-card">
          <div class="card-header">
            <h3 class="card-title">Robot Overview</h3>
            <el-button type="text" class="close-btn" @click="showStatistics = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div v-for="(item, index) in orgData" :key="index">
            <div class="task-info-section">
              <div class="task-name">
                {{ item.robotName }}
              </div>
              <div class="robot-battery">
                <div class="right-power">
                  <el-progress
                    type="circle"
                    :percentage="item.batteryLevel"
                    status="success"
                    :color="useUtils.getActiveColor(item.batteryLevel)"
                    :width="18"
                    :stroke-width="3"
                  >
                    <svg-icon icon-class="lightning" class-name="light-icon" />
                  </el-progress>
                  <span :style="{ 'color': useUtils.getActiveColor(item.batteryLevel) }">{{ item.batteryLevel }}%</span>
                </div>
                <span class="robot-status" :class="'robot-status-' + (item.robotStatus ? item.robotStatus.toLocaleLowerCase() : 'unknown')">
                  {{ item.robotStatus || 'Unknown' }}
                </span>
              </div>
              <div class="task-time">
                {{ item.robotSn }}
              </div>
              <div class="task-time">
                {{ item.buildingName }}
              </div>
              <div class="task-info">
                <div class="stats-item w-full flex flex-row justify-between items-center">
                  <div class="flex-1 flex items-center">
                    <div class="icon-container">
                      <svg-icon icon-class="active-robots" />
                    </div>
                    <span class="stats-label">Last Task</span>
                  </div>
                  <div class="stats-content">
                    <span class="stats-value">{{ item.taskName }} </span>
                  </div>
                </div>
                <div class="stats-item w-full flex flex-row justify-between items-center">
                  <div class="flex-1 flex items-center">
                    <div class="icon-container">
                      <svg-icon icon-class="active-robots" />
                    </div>
                    <span class="stats-label">Last Location</span>
                  </div>
                  <div class="stats-content">
                    <el-tooltip placement="top" :content="item.locationInfo">
                      <span class="stats-value">{{ item.locationInfo }} </span>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- Main Content -->
    <div class="main-content">
      <!-- Robot List Panel -->
      <div class="robot-list-panel" :class="{ 'collapsed': !robotListExpanded }">
        <div class="robot-list-toggle" @click="toggleRobotList">
          <el-icon class="toggle-icon" :class="{ 'rotated': !robotListExpanded }">
            <DArrowLeft />
          </el-icon>
        </div>
        <div v-show="robotListExpanded" v-loading="showRobotLoading" class="robot-list-content">
          <!-- map name列表 -->
          <div
            v-for="robot in paginatedRobots"
            :key="robot.id"
            class="robot-list-item"
            :class="{ 'highlighted': selectedRobot?.id === robot.id }"
            @click="selectRobotFromList(robot)"
          >
            <div class="robot-item-status">
              <span v-if="robot.hasLiveRobot == '1'" class="live-badge"> Live </span>
            </div>
            <div class="robot-item-header">
              <span class="robot-name" :title="robot.id">{{ robot.id }}</span>
              <div v-if="robot.name" class="robot-time">
                <span class="time-lable">Timestamp:</span>
                <span class="time-lable">{{ robot.name }}</span>
              </div>
              <div v-if="robot.hasLiveRobot == '1'" class="robot-desc">
                <span class="desc">{{ robot.hasLiveRobot == '1' ? 'The Robot is Here' : '' }}</span>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div v-if="orgRobots.length > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20]"
              :total="orgRobots.length"
              layout="prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div v-loading="isInitLoading" class="map-container">
        <div class="sampling-card">
          <el-select v-model="samplingValue" filterable :placeholder="'Sampling: ' + samplingPlaceholder" @change="samplingChange">
            <el-option v-for="item in samplingList" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
        </div>
        <div ref="mapContainer" class="responsive-map-wrapper">
          <div v-if="showImage" class="map-view" :style="{ height: imgHeight }">
            <img :src="bgURL" class="map-bg" @load="onImageLoad" />
            <!-- Trajectory paths -->
            <svg
              v-if="showTrajectories && trajectorys.length > 0"
              class="trajectory-paths"
              :viewBox="`0 0 ${mapWidth} ${mapHeight}`"
              preserveAspectRatio="xMidYMid meet"
            >
              <polyline
                v-if="trajectorys.length > 1"
                :points="getTrajectoryPoints()"
                fill="none"
                stroke="#4CAF50"
                stroke-width="3"
                stroke-opacity="0.6"
                stroke-dasharray="5,5"
              />
            </svg>
            <div
              v-for="(point, index) in trajectorys"
              :key="index"
              class="robot-overlay"
              :class="{ 'robot-highlighted': selectedTrajectory?.id === point.id || (!selectedTrajectory && index == trajectorys.length - 1) }"
              :style="getRobotStyle(point)"
              @click="selectRobot(point)"
            >
              <el-tooltip placement="top" :content="useUtils.formatDate(point.updateTime) || 'No time data'" :disabled="!point.updateTime">
                <div class="hollow-circle" :class="point.hasEvent == '1' ? 'event-error' : 'event-normal'"></div>
              </el-tooltip>
            </div>
          </div>
          <div v-if="!showImage" class="no-data">
            {{ noImageInfo }}
          </div>
        </div>
      </div>

      <!-- 使用自定义组件 -->
      <RobotTrajectoryDetailDrawer ref="detailDrawerRef" v-model:visible="drawerVisible" :trajectory-id="selectedTrajectoryId" />
    </div>

    <div class="map-header">
      <div class="map-controls">
        <el-button class="control-btn" @click="toggleFullscreen">
          Full Screen
          <el-icon class="ml-2"><FullScreen /></el-icon>
        </el-button>
        <el-button class="control-btn" @click="refreshData">
          Refresh
          <el-icon class="ml-2"><Refresh /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, type CSSProperties, computed } from 'vue';
import * as useUtils from '@/utils/index';
import { robotService } from '@/views/monitor/robotmanage/monitoring/api/robotService';
import { getRobotMaps, getRobotTrajectory, getMapRobotDetail } from '@/api/robot';
import RobotTrajectoryDetailDrawer from './robotTrajectoryDetail.vue';
import { v } from 'vxe-table';

const bgURL = ref('');
const showImage = ref(false);
const showRobotLoading = ref(true);
const isInitLoading = ref(true);
const noImageInfo = ref('All Robots Are Idle');
const imgHeight = ref('');

const mapContainer = ref<HTMLElement>();
const robotListExpanded = ref(true);
const selectedRobot = ref(null);
const trajectorys = ref([]);
const orgRobots = ref([]);
const drawerVisible = ref(false);
const showTrajectories = ref(true);
const detailDrawerRef = ref();

// 分页相关变量
const currentPage = ref(1);
const pageSize = ref(10);

const selectedTrajectory = ref(null);
const selectedTrajectoryId = ref('');

// 地图常量
const MAP_ORIGIN_X = 0;
const MAP_ORIGIN_Y = 0;
const MAP_RESOLUTION = 1;

// 响应式变量
const mapWidth = ref(2078);
const mapHeight = ref(1850);
const showStatistics = ref(false);
const orgData = ref<RobotDetail[]>([]);
const samplingList = ref([
  { key: '0', value: 'All Points' },
  { key: '5', value: 'Every 5 min' },
  { key: '10', value: 'Every 10 min' },
  { key: '30', value: 'Every 30 min' }
]);
const samplingValue = ref('0');
const samplingPlaceholder = ref('All Points');
interface RobotDetail {
  robotSn: string;
  robotName: string;
  taskName: string;
  batteryLevel: number;
  buildingName: string;
  locationInfo: string;
  robotStatus: string;
}

const props = defineProps({
  getParams: {
    type: Function,
    default: () => ({})
  }
});

// 计算分页后的机器人列表
const paginatedRobots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return orgRobots.value.slice(start, end);
});
const samplingChange = async (value: string) => {
  isInitLoading.value = true;
  await getTrajectoryData();
  //取消选中的轨迹点
  selectedTrajectory.value = null;
  selectedTrajectoryId.value = '';
  isInitLoading.value = false;
};
// 分页大小变化处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

// 当前页变化处理
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
};

// 清理所有数据状态
const clearAllData = () => {
  trajectorys.value = [];
  selectedTrajectory.value = null;
  selectedTrajectoryId.value = '';
  drawerVisible.value = false;
  showImage.value = false;
  bgURL.value = '';
  // 重置分页状态
  currentPage.value = 1;

  // 清空详情抽屉数据
  if (detailDrawerRef.value) {
    detailDrawerRef.value.clearData();
  }
};

// 图片加载完成时的回调
const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  mapWidth.value = img.naturalWidth;
  mapHeight.value = img.naturalHeight;
  console.log(`Image loaded: ${mapWidth.value}x${mapHeight.value}`);
};
const getTrajectoryPoints = () => {
  return trajectorys.value
    .map((point) => {
      const x = (point.x - MAP_ORIGIN_X) / MAP_RESOLUTION;
      const y = (point.y - MAP_ORIGIN_Y) / MAP_RESOLUTION;
      return `${x},${y}`;
    })
    .join(' ');
};
const getRobotStyle = (robot): CSSProperties => {
  const px = (robot.x - MAP_ORIGIN_X) / MAP_RESOLUTION;
  const py = (robot.y - MAP_ORIGIN_Y) / MAP_RESOLUTION;
  const leftPercent = (px / mapWidth.value) * 100;
  const topPercent = (py / mapHeight.value) * 100;
  return {
    position: 'absolute',
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    width: '8px',
    height: '8px',
    transform: 'translate(-50%, -50%)'
  };
};

const selectRobot = async (robot) => {
  selectedTrajectory.value = robot;
  selectedTrajectoryId.value = robot.id;
  drawerVisible.value = true;
};

const selectRobotFromList = async (robot) => {
  // 清理之前的选择状态
  clearAllData();

  selectedRobot.value = robot;
  isInitLoading.value = true;

  try {
    await getTrajectoryData();
    const resStats = await getMapRobotDetail(Object.assign(props.getParams(), { mapName: robot.id }));
    orgData.value = resStats?.data || [];
    const currentMapUrl = robot.mapUrl;

    if (currentMapUrl == null) {
      isInitLoading.value = false;
      noImageInfo.value = 'The Map Is Updating';
      imgHeight.value = 'auto';
      showImage.value = false;
      return;
    }

    if (currentMapUrl) {
      await updateMapDimensions(currentMapUrl);
    }

    bgURL.value = currentMapUrl;

    if (bgURL.value) {
      showImage.value = true;
    }
  } catch (error) {
    console.error('Failed to select robot:', error);
    noImageInfo.value = 'Failed to load data';
    showImage.value = false;
  } finally {
    isInitLoading.value = false;
  }
};
const getTrajectoryData = async () => {
  const robot = selectedRobot.value;
  const res = await getRobotTrajectory(Object.assign(props.getParams(), { mapName: robot.id, intervalTime: samplingValue.value }));
  // 确保轨迹数据是数组
  trajectorys.value = Array.isArray(res.data) ? res.data : [];
  trajectorys.value = filterDuplicateCoordinates(trajectorys.value);
};
const toggleRobotList = () => {
  robotListExpanded.value = !robotListExpanded.value;
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    mapContainer.value?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
  nextTick(() => {
    updateRobotPositions();
  });
};

const updateRobotPositions = () => {
  // 如果需要更新机器人位置，可以在这里实现
};

// 刷新数据
const refreshData = async () => {
  clearAllData();
  await getData(true);
};

// Function to get image dimensions dynamically
const loadImageDimensions = (imageSrc: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imgHeight.value = 'auto';
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      imgHeight.value = '100%';
      reject(new Error('Failed to load image'));
    };
    img.src = imageSrc;
  });
};

// Update map dimensions when background image loads
const updateMapDimensions = async (imageSrc: string) => {
  showImage.value = false;
  try {
    const dimensions = await loadImageDimensions(imageSrc);
    mapWidth.value = dimensions.width;
    mapHeight.value = dimensions.height;
    showImage.value = true;
    isInitLoading.value = false;
    console.log(`Map dimensions updated: ${dimensions.width}x${dimensions.height}`);
  } catch (error) {
    showImage.value = false;
    isInitLoading.value = false;
    console.warn('Failed to load image dimensions, using defaults:', error);
  }
};

const revertData = (data) => {
  const arr = [];
  if (!Array.isArray(data)) return arr;

  data.forEach((item) => {
    const locations = [];
    if (item.locationList && Array.isArray(item.locationList)) {
      item.locationList.forEach((location) => {
        locations.push({
          x: location.x,
          y: location.y,
          updateTime: location.updateTime
        });
      });
    }
    arr.push({
      id: item.mapName,
      name: useUtils.formatDate(item.startTime),
      hasLiveRobot: item.hasLiveRobot,
      position: locations,
      mapUrl: item.mapUrl
    });
  });
  return arr;
};

const getData = async (isInitStatus = false) => {
  if (isInitStatus) {
    showRobotLoading.value = true;
    isInitLoading.value = true;
  }

  try {
    // 清理之前的数据
    clearAllData();

    const res = await getRobotMaps(props.getParams());
    const data = res?.data || [];

    if (isInitStatus) {
      orgRobots.value = revertData(data);
    }

    let currentMapUrl = null;
    const itemWithMapUrl = data.find((item) => item?.mapUrl);

    if (itemWithMapUrl) {
      currentMapUrl = itemWithMapUrl.mapUrl;
      if (orgRobots.value.length > 0) {
        selectedRobot.value = orgRobots.value[0];
      }
      trajectorys.value = Array.isArray(itemWithMapUrl.locationList) ? itemWithMapUrl.locationList : [];
      trajectorys.value = filterDuplicateCoordinates(trajectorys.value);
      if (selectedRobot.value) {
        const resStats = await getMapRobotDetail(Object.assign(props.getParams(), { mapName: selectedRobot.value.id }));
        orgData.value = resStats?.data || [];
      }
    }

    if (itemWithMapUrl != null && currentMapUrl == null) {
      isInitLoading.value = false;
      noImageInfo.value = 'The Map Is Updating';
      showRobotLoading.value = false;
      showImage.value = false;
      return;
    }

    if (currentMapUrl) {
      const dimensions = await loadImageDimensions(currentMapUrl);
      mapWidth.value = dimensions.width;
      mapHeight.value = dimensions.height;
      bgURL.value = currentMapUrl;
      showImage.value = true;
    } else {
      showImage.value = false;
      noImageInfo.value = 'No map available';
    }
  } catch (error) {
    console.error('Failed to load robot data:', error);
    noImageInfo.value = 'Failed to load data';
    showImage.value = false;
  } finally {
    if (isInitStatus) {
      isInitLoading.value = false;
      showRobotLoading.value = false;
    }
  }
};
// 过滤重复坐标点的方法
const filterDuplicateCoordinates = (locationList) => {
  if (!Array.isArray(locationList)) return [];
  // 使用Map来存储坐标点的最新数据
  const coordinateMap = new Map();
  // 遍历所有位置点，用x,y作为键，存储最后一个出现的点
  locationList.forEach((point) => {
    if (point && point.x !== undefined && point.y !== undefined) {
      // 创建坐标键
      const coordinateKey = `${point.x},${point.y}`;
      coordinateMap.set(coordinateKey, point);
    }
  });
  // 返回去重后的数组（保留顺序）
  return Array.from(coordinateMap.values());
};
onMounted(async () => {
  try {
    robotService.startRealTimeUpdates();
    await getData(true);
  } catch (error) {
    isInitLoading.value = false;
    console.error('Failed to initialize robot status page:', error);
  }
});

onUnmounted(() => {
  robotService.stopRealTimeUpdates();
});

defineExpose({
  getData,
  refreshData
});
</script>

<style scoped lang="scss">
.robot-status-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding-top: 0;
  overflow: auto;
  min-height: 0;
  height: 100%;
}

.map-container {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  position: relative;

  .no-data {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-text-color-b49);
    font-size: 14px;
  }
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--el-base-border-color);
  position: absolute;
  bottom: 0;
  right: 0;
}

.map-controls {
  display: flex;
  gap: 8px;
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

.responsive-map-wrapper {
  min-width: 0;
  min-height: 100%;
  width: 100%;
  border-radius: 0 0 12px 12px;
  overflow: auto;
}

.map-view {
  max-width: 100%;
  height: auto;
  flex: 0 0 auto;
  position: relative;
  overflow: auto;
}

.map-bg {
  width: 100%;
  object-fit: cover;
  display: block;
  z-index: 1;
}

.trajectory-paths {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.robot-overlay {
  pointer-events: auto;
  cursor: pointer;
  z-index: 3;
  position: absolute;
}
.robot-icon-img {
  width: 32px;
  height: 32px;
  display: block;
}

/* Robot List Panel Styles */
.robot-list-panel {
  width: 320px;
  background: #fff;
  border-right: 1px solid var(--el-base-border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.3s ease;
}

.robot-list-panel.collapsed {
  width: 50px;
}

.robot-list-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  border-radius: 4px;
  top: 96%;
}

.robot-list-toggle:hover {
  background: rgba(64, 158, 255, 0.1);
}

.toggle-icon {
  color: #409eff;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.robot-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.robot-list-item {
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid var(--el-base-border-color, #d3dbe066);
  background: var(--baseBackground, #fff);
  box-shadow: 0 1px 2px 0 var(--el-box-shadow-start-color, #11191e0d);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.robot-list-item:hover {
  border-color: var(--colors-base-primary);
  box-shadow: 0 1px 2px var(--el-card-primary-flat10);
}

.robot-list-item.highlighted {
  border-color: var(--colors-base-primary);
  background: var(--el-card-primary-flat05);
  box-shadow: 0 1px 2px var(--el-card-primary-flat20);
}
.robot-item-status {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  width: 48px;
  height: 16px;
  justify-content: flex-end;
  align-items: center;
  align-content: center;
  gap: 1px;
  flex-wrap: wrap;
}
.robot-item-header {
  display: flex;
  padding: 4px 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex: 1;
}
.live-badge {
  color: var(--color-success);
  text-align: center;
  font-family: Montserrat;
  font-size: 8px;
  font-style: normal;
  font-weight: 600;
  line-height: 14px;
  display: flex;
  padding: 1px 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex: 1 0 0;
  border-radius: 8px;
  background: var(--color-success-flat10, #00ba4a1a);
}
.robot-name {
  color: var(--el-text-color-b12, #11191e);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  width: 100%;
  white-space: nowrap;
}
.robot-time {
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: stretch;
}
.time-lable {
  color: var(--VI-text-B12, #11191e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px; /* 133.333% */
}
.robot-desc {
  display: flex;
  padding-top: 8px;
  align-items: center;
  align-self: stretch;
  .desc {
    display: flex;
    padding: 4px 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 100px;
    background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
    color: var(--colors-base-01-primary, #09f);
    text-align: center;

    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 133.333% */
  }
}
/* 分页样式 */
.pagination-container {
  padding: 16px 8px 8px 8px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.robot-details {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #34495e;
  font-size: 16px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item .label {
  font-size: 13px;
  color: #7f8c8d;
}

.detail-item .value {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

/* 事件列表样式 */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  background-color: #fafafa;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.event-level-error {
  background-color: #ffebee;
  color: #d32f2f;
}

.event-level-warning {
  background-color: #fff3e0;
  color: #f57c00;
}

.event-level-info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.event-level-default {
  background-color: #f5f5f5;
  color: #757575;
}

.event-time {
  font-size: 12px;
  color: #757575;
}

.event-detail {
  font-size: 13px;
  color: #424242;
  line-height: 1.4;
}

.no-events {
  text-align: center;
  color: #9e9e9e;
  font-style: italic;
  padding: 20px;
}

.map-container {
  flex: 1;
}
.hollow-circle {
  width: 100%;
  height: 100%;
  border: 2px solid var(--color-success, #00ba4a);
  border-radius: 50%;
  background-color: transparent;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px #00ba4a0d;
  background: #fff;
}
.event-normal {
  border: 2px solid var(--color-success, #00ba4a);
}
.event-error {
  border: 2px solid var(--color-orange, #ff8401);
}
.robot-overlay.robot-highlighted .hollow-circle {
  animation: highlight-pulse 1s infinite;
  transform: scale(3);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes highlight-pulse {
  0% {
    transform: scale(3);
    opacity: 0.8;
  }
  50% {
    transform: scale(3.2);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0.8;
  }
}
.sampling-card {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
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
.statistics-card {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 400px;
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
.task-info-section {
  margin-bottom: 16px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: #11191e;
  margin-bottom: 4px;
  line-height: 1.4;
  word-break: break-word;
}
.robot-battery {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 4px;
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
  font-size: 12px;
  color: var(--el-text-color-b49);
  font-weight: 400;
  line-height: 16px;
  margin-right: 6px;
}

.stats-value {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-b12);
  font-weight: 400;
  line-height: 16px;
  max-width: 208px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.light-icon {
  width: 4px;
  height: 10px;
}
.right-power {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  span {
    margin-left: 8px;
    font-weight: 500;
    font-size: 14px;
  }
}
.task-time {
  color: var(--el-text-color-b12);
  font-family: Montserrat;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}
.task-info {
  margin-top: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: linear-gradient(
      90deg,
      var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
      var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
      var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
      var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
      var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
      var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
      var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
    ),
    var(--layout-bg_Element, #fff);
}
::v-deep(.right-power .el-progress__text) {
  min-width: unset;
}
.robot-status {
  color: var(--color-success);
  background: #00ba4a0d;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  height: 24px;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
}
.robot-status-idle {
  color: var(--color-orange);
  background: #ff84010d;
}
</style>
