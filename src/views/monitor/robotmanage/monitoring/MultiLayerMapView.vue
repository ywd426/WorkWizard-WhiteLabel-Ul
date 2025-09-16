<template>
  <div class="multi-layer-map-page">
    <!-- Statistics Panel -->
    <div>
      <!-- 显示统计信息按钮 -->
      <el-button v-if="!showStatistics" class="show-stats-btn" :style="{ marginTop: legends.length > 0 ? '38px' : '8px' }" type="primary" size="small" @click="showStatistics = true">
        <el-icon class="mr-1"><DataAnalysis /></el-icon>
        <span>Show Stats</span>
      </el-button>
      <!-- 统计信息卡片 -->
      <transition name="fade">
        <div class="statistics-card" v-show="showStatistics" :style="{ marginTop: legends.length > 0 ? '38px' : '8px' }">
          <div class="card-header">
            <h3 class="card-title">Map Statistics</h3>
            <el-button type="text" @click="showStatistics = false" class="close-btn">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="stats-item w-full flex flex-row justify-between items-center" v-for="(item, index) in statsItems" :key="index">
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

    <!-- Legend Panel -->
    <div class="legend-container" v-if="legends.length > 0">
      <div
        v-for="(legend, index) in legends"
        :key="index"
        class="legend-item"
        :class="{ 'disabled': isLegendDisabled(legend) }"
        @click="toggleLegendVisibility(legend)"
      >
        <div class="legend-marker" :class="[legend.type, legend.shape]" :style="{ color: legend.color }"></div>
        <div class="legend-label">{{ legend.label }}</div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div class="responsive-map-wrapper">
        <div ref="mapContainer" class="map-view" v-loading="isInitLoading">
          <!-- Base Layer -->
          <img 
            v-if="baseLayerVisible && baseLayerUrl" 
            :src="baseLayerUrl" 
            class="map-layer base-map" 
            @load="onBaseImageLoad"
            @error="onImageError"
          />
          <div v-else-if="!baseLayerUrl" class="map-layer base-map no-image">
            No Base Image Available
          </div>

          <!-- Overlay Layers -->
          <img 
            v-for="layer in overlayLayers"
            :key="layer.id"
            v-show="layer.visible && layer.url"
            :src="layer.url"
            class="map-layer overlay-map"
            :style="getLayerStyle(layer)"
            @error="onImageError"
          />
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
        <el-button class="control-btn" @click="refreshLayers">
          Refresh Layers
          <el-icon class="ml-2"><Refresh /></el-icon>
        </el-button>
        <!-- <el-button class="control-btn" @click="resetLayers">
          Reset View
          <el-icon class="ml-2"><Aim /></el-icon>
        </el-button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, type CSSProperties } from 'vue';
import {
  Refresh,
  Aim,
  FullScreen,
  DataAnalysis,
  Close,
  Picture,
  Timer
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as useUtils from '@/utils/index';
import { getAreaMap } from '@/api/robot';
import { convertWithUnit } from '@/utils';
import useAppStore from '@/store/modules/app';

// 定义图层接口
interface MapLayer {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  opacity: number;
  type: 'base' | 'overlay';
}

const statsItems = ref([
  {
    icon: 'total-planned-area',
    color: 'blue',
    label: 'Total Planned Area',
    value: '0',
    unit: ''
  },
  {
    icon: 'cleaned-today',
    color: 'cyan',
    label: 'Cleaned Today',
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
    label: 'Active Robots',
    value: '0',
    unit: ''
  }
]);


// 响应式数据
const mapContainer = ref<HTMLElement>();
const isInitLoading = ref(true);
const isLayerLoading = ref(false);
const lastUpdateTime = ref('');
const showStatistics = ref(true); // Control statistics card visibility

// Legend相关
const legends = ref([]);
const legendVisibility = ref({
  base: true,
  overlay: true,
  robot: true
});


// 图层数据
const baseLayerUrl = ref('');
const baseLayerVisible = ref(true);
const overlayLayers = ref<MapLayer[]>([]);

// 缓存相关
const cachedBaseMapUrl = ref(''); // 缓存的原始API地址
const cachedOverlayUrls = ref<string[]>([]); // 缓存的覆盖图层原始地址

// 地图尺寸
const MAP_WIDTH = ref(2078);
const MAP_HEIGHT = ref(1850);

// 计算属性
const totalLayersCount = computed(() => {
  return (baseLayerUrl.value ? 1 : 0) + overlayLayers.value.length;
});

const visibleLayersCount = computed(() => {
  const baseVisible = baseLayerVisible.value && baseLayerUrl.value ? 1 : 0;
  const overlayVisible = overlayLayers.value.filter(layer => layer.visible).length;
  return baseVisible + overlayVisible;
});
// 图例相关方法
const isLegendDisabled = (legend: any) => {
  // 对于overlayMaps，根据图例标签查找对应的图层
  const targetLayer = overlayLayers.value.find(layer => layer.name === legend.label);
  return targetLayer ? !targetLayer.visible : false;
};

const toggleLegendVisibility = (legend: any) => {
  // 查找对应的overlay图层
  const targetLayer = overlayLayers.value.find(layer => layer.name === legend.label);
  
  if (targetLayer) {
    // 切换对应图层的可见性
    targetLayer.visible = !targetLayer.visible;
    console.log(`Legend ${legend.label} visibility changed to:`, targetLayer.visible);
  } else {
    console.warn(`No matching layer found for legend: ${legend.label}`);
  }
};

// Props
const props = defineProps({
  getParams: {
    type: Function,
    default: null
  }
});



// 方法

const getLayerStyle = (layer: MapLayer): CSSProperties => {
  return {
    opacity: layer.opacity / 100
  };
};

const onLayerVisibilityChange = (layer: MapLayer) => {
  console.log(`Layer ${layer.name} visibility changed to:`, layer.visible);
};

const onLayerOpacityChange = (layer: MapLayer) => {
  console.log(`Layer ${layer.name} opacity changed to:`, layer.opacity);
};

const onBaseImageLoad = () => {
  console.log('Base image loaded successfully');
  updateMapDimensions();
};

const onImageError = (event: Event) => {
  console.error('Failed to load image:', event);
  ElMessage.warning('Failed to load one or more map layers');
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
const colorPalette = [
    '#00AB9A', '#00BA4A', '#0099FF', '#526FFF ', '#944DFF', 
    '#FF26A8', '#FF384C', '#FF4400', '#FF8401', '#EDB601'
  ];

const orgData = ref(null);  
const loadMapLayers = async () => {
  isLayerLoading.value = true;
  isInitLoading.value = true;
  
  try {
    // 调用API获取地图数据
    const res = await getAreaMap(props.getParams());
    console.log('Map layers data:', res);
    
    if (res.data) {
      orgData.value = JSON.parse(JSON.stringify(res.data));
      lastUpdateTime.value = useUtils.formatDate(res.data?.updateTime);
      statsItems.value[0].value = convertWithUnit({value: res.data?.totalArea || 0, type: 'area'});

      statsItems.value[1].value = convertWithUnit({value: res.data?.cleanedArea || 0, type: 'area'});
      statsItems.value[2].value = res.data?.coverage || 0;
      statsItems.value[3].value = `${res.data?.activeRobots} / ${res.data?.totalRobots}` || '0';
      
      // 处理底图 - 添加缓存检查
      if (res.data.mapUrl) {
        // 检查是否与缓存的地址相同
        // if (res.data.mapUrl !== cachedBaseMapUrl.value) {
        //   console.log('Base map URL changed, updating...');
        //   const blobUrl = await convertUrlToBlobUrl(res.data.mapUrl);
        //   if (blobUrl) {
        //     // 清理旧的blob URL
        //     if (baseLayerUrl.value) {
        //       URL.revokeObjectURL(baseLayerUrl.value);
        //     }
        //     baseLayerUrl.value = URL.createObjectURL(blobUrl);
        //     cachedBaseMapUrl.value = res.data.mapUrl;
        //   }
        // } else {
        //   console.log('Base map URL unchanged, skipping update');
        // }
        baseLayerUrl.value = res.data.mapUrl;
        cachedBaseMapUrl.value = res.data.mapUrl;
      }
      
      // 处理覆盖图层 - 添加缓存检查
      if (res.data.overlayMaps && Array.isArray(res.data.overlayMaps)) {
        const newOverlayUrls = res.data.overlayMaps.map(overlay => overlay.url);
         legends.value = res.data.overlayMaps.map((overlay, index) => {
           return {
            label: overlay.mapName, 
            color: colorPalette[index % colorPalette.length], 
            shape: 'rect',
            type: 'overlay'
           }
         });
        
        // 检查覆盖图层是否有变化
        const urlsChanged = JSON.stringify(newOverlayUrls) !== JSON.stringify(cachedOverlayUrls.value);
        
        if (urlsChanged) {
          console.log('Overlay layers changed, updating...');
          
          // 清理旧的覆盖图层blob URLs
          overlayLayers.value.forEach(layer => {
            if (layer.url) {
              URL.revokeObjectURL(layer.url);
            }
          });
          
          const layers: MapLayer[] = [];
          
          for (let i = 0; i < res.data.overlayMaps.length; i++) {
            const overlayData = res.data.overlayMaps[i];
            layers.push({
              id: `overlay-${i}`,
              name: overlayData.mapName || `Overlay Layer ${i + 1}`,
              url: overlayData.url,
              visible: overlayData.visible !== false, // 默认可见
              opacity: overlayData.opacity || 80, // 默认80%透明度
              type: 'overlay'
            });
          }
          
          overlayLayers.value = layers;
          cachedOverlayUrls.value = newOverlayUrls;
        } else {
          console.log('Overlay layers unchanged, skipping update');
        }
      } else {
        // 如果API没有返回覆盖图层，清空现有图层
        if (cachedOverlayUrls.value.length > 0) {
          overlayLayers.value.forEach(layer => {
            if (layer.url) {
              URL.revokeObjectURL(layer.url);
            }
          });
          overlayLayers.value = [];
          cachedOverlayUrls.value = [];
        }
      }
      
      // 更新地图尺寸
      if (baseLayerUrl.value) {
        await updateMapDimensions();
      }
    }
  } catch (error) {
    console.error('Failed to load map layers:', error);
    ElMessage.error('Failed to load map layers');
  } finally {
    isLayerLoading.value = false;
    isInitLoading.value = false;
  }
};

const refreshLayers = async () => {
  await loadMapLayers();
};

const resetLayers = () => {
  // 重置所有图层设置
  baseLayerVisible.value = true;
  overlayLayers.value.forEach(layer => {
    layer.visible = true;
    layer.opacity = 80;
  });
  ElMessage.success('Layer settings reset');
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    mapContainer.value?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 生命周期
onMounted(async () => {
  try {
    await loadMapLayers();
  } catch (error) {
    console.error('Failed to initialize multi-layer map:', error);
    ElMessage.error('Failed to load map data');
  }
});

onUnmounted(() => {
  // 清理blob URLs
  // if (baseLayerUrl.value) {
  //   URL.revokeObjectURL(baseLayerUrl.value);
  // }
  // overlayLayers.value.forEach(layer => {
  //   if (layer.url) {
  //     URL.revokeObjectURL(layer.url);
  //   }
  // });
  
  // 清理缓存
  cachedBaseMapUrl.value = '';
  cachedOverlayUrls.value = [];
});


watch(
  () => useAppStore().currentUnits,
  () => {
    statsItems.value[0].value = convertWithUnit({value: orgData.value?.totalArea || 0, type: 'area'});

    statsItems.value[1].value = convertWithUnit({value: orgData.value?.cleanedArea || 0, type: 'area'});
  },
  { deep: true }
);

// 暴露方法
defineExpose({
  refreshLayers,
  resetLayers
});
</script>

<style scoped lang="scss">
@import '@/assets/styles/clean-panels.scss';


/* 主要内容样式 */
.multi-layer-map-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;

  
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
}


/* 地图容器样式 */
.map-container {
  width: 100%;
  height: 100%;
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
  
  &.overlay-map {
    z-index: 2;
  }
  
  &.no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    // background-color: #f1f5f9;
    // color: #64748b;
    // font-size: 16px;
    // border: 2px dashed #cbd5e1;
  }
}

/* 地图控制按钮样式 */
.map-header {
  position: absolute;
  bottom: 20px;
  right: 8px;
  z-index: 10;
}

.map-controls {
  display: flex;
  gap: 12px;
  // background-color: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 8px;
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 统计信息样式 */
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

/* 过渡动画 */
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

/* 响应式设计 */
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
}
</style>