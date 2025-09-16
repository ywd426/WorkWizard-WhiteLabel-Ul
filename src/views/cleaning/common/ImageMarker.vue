<template>
  <div class="image-marker-container">
    <div class="controls-container">
      <div class="floor-selector metric-selector">
        <el-select v-model="selectedFloor" size="small" @change="updateImage">
          <el-option v-for="floor in floors" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </div>

      <div class="legend-container">
        <div
          v-for="(legend, index) in legends"
          :key="index"
          class="legend-item"
          @click="toggleMarkerType(legend.type)"
          :class="{ 'disabled': isLegendDisabled(legend.type) }"
        >
          <div class="legend-marker" :class="legend.type"></div>
          <div class="legend-label">{{ legend.label }}</div>
        </div>
      </div>
    </div>
    <div class="image-wrapper" ref="imageWrapper">
      <img ref="targetRef" :src="currentImageSrc" @load="onImageLoad" class="base-image" alt="floor" />
      <div
        v-for="(marker, index) in visibleMarkers"
        :key="index"
        class="marker-point"
        :class="marker.type"
        :style="getMarkerStyle(marker)"
        @click="handleMarkerClick(marker)"
      >
        <div class="marker-tooltip" v-if="marker.showTooltip">
          {{ marker.tooltip }}
        </div>
      </div>
    </div>
    <div class="view-controls">
      <button class="control-btn responsive" @click="toggleResponsiveView">
        Responsive Screen
        <svg-icon icon-class="full-screen" class="svg" />
      </button>
      <button
        class="control-btn"
        @click="
          zoomLevel = 100;
          updateZoom();
        "
      >
        Refresh view
        <svg-icon icon-class="refresh" class="svg" />
      </button>
      <div class="zoom-controls">
        <div class="forecast-input">
          <el-input-number v-model="zoomLevel" :min="50" :max="200" :step="10" size="small" @change="handleZoomChange"> </el-input-number>
          <span class="zoom-suffix">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useCleanStore } from '@/store/modules/cleaning';
import { getIndoorMap } from '@/api/clean/env';
import { useDebounceFn } from '@vueuse/core';
const cleanStore = useCleanStore();
const { filters } = storeToRefs(cleanStore);

const props = defineProps({
  pageId: {
    type: String,
    required: true
  },
  height: {
    type: String,
    default: '306px'
  },
  imageSrc: {
    type: String,
    required: true
  },
  markers: {
    type: Array,
    default: () => []
  },
  floors: {
    type: Array,
    default: () => [{ label: '2nd Floor', value: 2 }]
  },
  legends: {
    type: Array,
    default: () => [
      { type: 'forecasted', label: 'Forecasted Alert' },
      { type: 'good', label: 'Good Air Quality' },
      { type: 'moderate', label: 'Moderate Air Quality' },
      { type: 'poor', label: 'Poor Air Quality' }
    ]
  }
});
const currentImageSrc = ref(props.imageSrc);
const emit = defineEmits(['marker-click', 'refresh', 'zoom-change', 'floor-change']);
const targetRef = ref(null);
const imageWrapper = ref(null);
const selectedFloor = ref(props.floors[0]?.value || '');
const zoomLevel = ref(100);
const imageLoaded = ref(false);
const disabledMarkerTypes = ref([]);

// 计算可见的标记点
const visibleMarkers = computed(() => {
  const data = props.floors
    .find((d) => d.value === selectedFloor.value)
    ?.markers?.filter((marker) => !disabledMarkerTypes.value.includes(marker.type));
  console.log(
    props.floors.find((d) => d.value === selectedFloor.value),
    selectedFloor.value,
    disabledMarkerTypes.value
  );
  return data;
});

// 获取标记点样式
const getMarkerStyle = (marker) => {
  return {
    left: `${marker.x}%`,
    top: `${marker.y}%`,
    transform: 'translate(-50%, -50%)'
  };
};
// 检查图例是否被禁用
const isLegendDisabled = (type) => {
  return disabledMarkerTypes.value.includes(type);
};

// 处理标记点点击
const handleMarkerClick = (marker) => {
  emit('marker-click', marker);
  marker.showTooltip = !marker.showTooltip;
};

// 切换标记点类型的显示/隐藏
const toggleMarkerType = (type) => {
  const index = disabledMarkerTypes.value.indexOf(type);
  if (index > -1) {
    disabledMarkerTypes.value.splice(index, 1);
  } else {
    disabledMarkerTypes.value.push(type);
  }
};

// 图片加载完成
const onImageLoad = () => {
  imageLoaded.value = true;
};

// 刷新视图
const refreshView = async () => {
  emit('refresh');
  await getIndoorData();
};

// 切换响应式视图
const toggleResponsiveView = () => {
  // 实现图片全屏显示
  const img = targetRef.value;

  // 检查浏览器兼容性并调用全屏 API
  if (img.requestFullscreen) {
    img.requestFullscreen();
  } else if (img.webkitRequestFullscreen) {
    /* Safari */
    img.webkitRequestFullscreen();
  } else if (img.msRequestFullscreen) {
    /* IE11 */
    img.msRequestFullscreen();
  }
};

const handleZoomChange = (val) => {
  // 根据数值设置对应的预测天数
  zoomLevel.value = val;
  console.log(`zoomLevel set to ${val}`);
  updateZoom();
};

// 更新缩放
const updateZoom = () => {
  if (imageWrapper.value) {
    imageWrapper.value.style.transform = `scale(${zoomLevel.value / 100})`;
    emit('zoom-change', zoomLevel.value);
  }
};

const updateImage = () => {
  console.log('updateImage called', selectedFloor.value);

  // 如果提供了楼层对应的图片映射，则使用映射中的图片
  if (props.floors && selectedFloor.value) {
    currentImageSrc.value = props.floors.find((floor) => floor.value === selectedFloor.value)?.img;
  } else {
    // 否则使用默认图片
    currentImageSrc.value = props.imageSrc;
  }

  // 发出图片变更事件
  emit('image-change', {
    floor: selectedFloor.value,
    imageSrc: currentImageSrc.value
  });
};

const getIndoorData = useDebounceFn(async (filter = {}) => {
  const res = await getIndoorMap({
    ...filter,
    floorId: selectedFloor.value
  });
  console.log('getIndoorMap', res);
}, 100);

// 监听楼层变化
watch(selectedFloor, (newValue) => {
  emit('floor-change', newValue);
  const params = cleanStore.getPageFilterParams(props.pageId);
  getIndoorData(params);
});

onMounted(() => {
  // 初始化
  const params = cleanStore.getPageFilterParams(props.pageId);

  getIndoorData(params);
  updateImage();
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.image-marker-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 16px;
    overflow: hidden;
    transform-origin: center;
    transition: transform 0.3s ease;

    .base-image {
      width: 100%;
      height: v-bind('height');
      object-fit: cover;
      display: block;
    }

    .marker-point {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
      z-index: 10;
      background-color: transparent;
      /* 背景透明 */
      border: 4px solid;
      /* 添加边框 */

      &:hover {
        transform: translate(-50%, -50%) scale(1.2);
        z-index: 20;
      }

      &.forecasted {
        border-color: $color-blue;
        /* 修改为边框颜色 */
      }

      &.good {
        border-color: $color-green;
      }

      &.moderate {
        border-color: $color-yellow;
      }

      &.poor {
        border-color: $color-red;
      }

      .marker-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        margin-bottom: 8px;
        z-index: 30;

        &:after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }
      }
    }
  }

  .controls-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;

    background-color: #f5f7fa;

    .floor-selector {
      width: 150px;
    }

    .metric-selector {
      margin-top: 0;
    }

    .legend-container {
      display: flex;
      padding-left: 160px;
      height: 50px;
      gap: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        &.disabled {
          opacity: 0.5;

          .legend-marker {
            border-color: #909399 !important;
          }

          .legend-label {
            color: #909399;
          }
        }
        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
          background-color: transparent;
          border: 3px solid;
          &.forecasted {
            border-color: $color-blue;
          }

          &.good {
            border-color: $color-green;
          }

          &.moderate {
            border-color: $color-yellow;
          }

          &.poor {
            border-color: $color-red;
          }
        }

        .legend-label {
          font-size: 12px;
          color: #606266;
        }

        &:hover .legend-label {
          color: #409eff;
        }
      }
    }
  }

  .view-controls {
    position: absolute;
    right: 3rem;
    bottom: 2.25rem;
    display: flex;
    align-items: center;
    gap: 12px;

    button {
      display: flex;
      height: 32px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      border: 1px solid var(--colors-base-01-primary, #09f);
      background: var(--layout-bg_Panel, #fff);

      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      /* 133.333% */
    }

    .control-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 1px solid #dcdfe6;
      color: var(--VI-text-B49);
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      cursor: pointer;

      &:hover {
        color: #409eff;
        border-color: #c6e2ff;
      }

      .svg {
        font-size: 14px;
      }
    }

    .responsive {
      color: #09f; // 蓝色
    }

    .zoom-controls {
      display: flex;
      align-items: center;

      .zoom-suffix {
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        color: #606266;
        font-size: 12px;
        pointer-events: none;
      }

      .zoom-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid #dcdfe6;
        background-color: white;
        cursor: pointer;

        &:first-child {
          border-radius: 4px 0 0 4px;
        }

        &:last-child {
          border-radius: 0 4px 4px 0;
        }

        &:hover {
          color: #409eff;
          border-color: #c6e2ff;
        }

        .svg {
          font-size: 14px;
        }
      }

      .zoom-level {
        padding: 0 8px;
        font-size: 12px;
        color: #606266;
        border-top: 1px solid #dcdfe6;
        border-bottom: 1px solid #dcdfe6;
        height: 28px;
        display: flex;
        align-items: center;
      }
    }

    :deep(.el-input-number) {
      height: 30px;
    }

    :deep(.el-input__inner) {
      color: var(--VI-text-B12, #11191e);
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
      /* 133.333% */
    }
  }
  :deep(.el-input__inner),
  :deep(.el-input__wrapper) {
    height: 32px !important;
  }

  :deep(.el-input-number.is-controls-right .el-input-number__increase),
  :deep(.el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase) {
    --el-input-number-controls-height: 15px;
    height: 30px !important;
    line-height: 30px !important;
  }
}
</style>
