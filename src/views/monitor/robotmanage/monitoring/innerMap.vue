<template>
  <div class="content-area h-full">
    <div ref="canvasGroundRef" class="canvas-ground w-full p-4" v-loading="loading">
      <div v-if="props.type === 'spatial_area'">
        <!-- 显示覆盖率统计按钮 -->
        <el-button v-if="!showCoverageStats" class="show-stats-btn" type="primary" size="small" @click="showCoverageStats = true">
          <el-icon class="mr-1"><DataAnalysis /></el-icon>
          <span>Show Stats</span>
        </el-button>
        <!-- 覆盖率统计卡片 -->
        <transition name="fade">
          <div class="coverage-stats-card" v-show="showCoverageStats">
            <div class="card-header">
              <h3 class="card-title">Coverage Stats</h3>
              <el-button type="text" @click="showCoverageStats = false" class="close-btn">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="stats-item w-full flex flex-row justify-between items-center" v-for="(item, index) in statsItems" :key="index">
              <div class="flex-1 flex items-center">
                <div class="icon-container">
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
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fabric } from 'fabric';
import { useRoute } from 'vue-router';
import { DataAnalysis, Close } from '@element-plus/icons-vue';
import { MapAreaButton, MapAreaFloor, EsgHvacGraphMapCoordinateVo } from '@/api/esg/hvac/types';
import { getFloorListWithTip, getAreaListWithTip, getMapInfo, getFloorImgData } from '@/api/esg/hvacMap';
import { getRobotPosition, getAreaMap } from '@/api/robot';


const route = useRoute();
const comeParams = ref<any>({});
// 画布
const canvasGroundRef = ref<HTMLElement | null>(null);
const canvasRef = ref(null);
let canvas = null;
// 右侧功能区
const rightGround = ref<HTMLElement | null>(null);
const rightBottomRef = ref<HTMLElement | null>(null);
const percentage = ref<number>(100);
// 楼层
const floorAllAry = ref<MapAreaFloor[]>([]);
const currentFloor = ref<string>('');
// 平面图
const imgData = ref<string>('');
// 区域
const btnAllAry = ref<MapAreaButton[]>([]);
const areaShadowColor = 'rgba(5, 31, 48, 0.6)';
const comfortableColor = 'rgba(0, 186, 74, 0.20)';
const uncomfortableColor = 'rgba(237, 182, 1, 0.20)';
const loading = ref(true);

let currentZoom = null;

const mapData = ref<any>(null);
interface StatItem {
  icon: string;
  color: string;
  label: string;
  value: string | number;
  unit?: string;
}

// 覆盖率统计数据
const coverageStats = ref({
  totalPlannedArea: '2,450',
  cleanedToday: '1,988',
  coverage: '75',
  activeRobots: '3/4'
});

const statsItems = ref<StatItem[]>([
  {
    icon: 'total-planned-area',
    color: 'blue',
    label: 'Total Planned Area',
    value: '2,450',
    unit: 'm²'
  },
  {
    icon: 'cleaned-today',
    color: 'cyan',
    label: 'Cleaned Today',
    value: '1,988',
    unit: 'm²'
  },
  {
    icon: 'coverage',
    color: 'green',
    label: 'Coverage',
    value: '75',
    unit: '%'
  },
  {
    icon: 'active-robots',
    color: 'purple',
    label: 'Active Robots',
    value: '3/4',
    unit: ''
  }
]);

// 控制覆盖率统计卡片的显示与隐藏
const showCoverageStats = ref(true);

const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  mapData: {
    type: Object,
    default: null
  },
  getParams: {
    type: Function,
    default: null
  }
});

/**
 * 获取建筑物楼层信息
 */
const queryFloorAll = async (building: string) => {
  let floorAllRes = null;
  const queryParams = {
    building: building
  };
  await getFloorListWithTip(queryParams).then((res) => {
    floorAllRes = res;
  });
  if (floorAllRes && floorAllRes.rows) {
    floorAllAry.value = floorAllRes.rows;
  }
};

/**
 * 楼层更换事件
 */
const floorChangeOrClick = (_switchFloor: string) => {
  currentFloor.value = _switchFloor;
  getAreaBtnAll();
  loadMap(currentFloor.value);
};

/**
 * 获取楼层所有区域
 */
const getAreaBtnAll = async () => {
  btnAllAry.value.length = 0;
  let areaAllRes = null;
  const queryParams = {
    floorId: currentFloor.value
  };
  await getAreaListWithTip(queryParams).then((res) => {
    areaAllRes = res;
  });
  if (areaAllRes && areaAllRes.rows) {
    btnAllAry.value = areaAllRes.rows;
  }
};

/**
 * 区域按钮点击事件回调
 */
const areaBtnClick = (_buttonName: string) => {
  removeAllPolygons();
  renderGraph(_buttonName, areaShadowColor);
};

/**
 * 加载画布及内容
 */
const loadMap = async (type?: string) => {
  // 清空画布
  //   if (canvas != null) {
  //     canvas.clear();
  //   }
  removeAllCricles();
  removeAllPolygons();
  type = type || props.type;
  // 获取数据渲染画布
  await getMapData(type);
  if (props.type === 'spatial_list') {
    renderAllPointers();
  } else {
    renderAllArea();
  }
  //   renderAllArea();
  updateCoverageStats();

  // 确保地图和对象居中显示
  setTimeout(() => {
    centerCanvasObjects();
  }, 100); // 短暂延时确保地图已加载完成
};

// 更新覆盖率统计数据
const updateCoverageStats = () => {
  // 这里可以根据实际数据来源更新统计信息
  // 例如从mapData中提取或通过API获取
  // 以下为示例代码
  if (mapData.value) {
    // 假设mapData中包含了相关统计信息
    // coverageStats.value.totalPlannedArea = mapData.value.totalArea || '2,450';
    // coverageStats.value.cleanedToday = mapData.value.cleanedArea || '1,988';
    // coverageStats.value.coverage = mapData.value.coveragePercentage || '75';
    // coverageStats.value.activeRobots = mapData.value.activeRobots || '3/4';
  }
};

/**
 * 获取数据
 */
const getMapData = async (type: string) => {
  const param = props.getParams();
  let res;
  if(type === 'spatial_list') {
    res = await getRobotPosition(param);
  } else {
    res = await getAreaMap(param);
  }
  console.log(param, res, 'getMapData')

 
  // const res = await getMapInfo(queryParams);
  if (res.code === 200) {
    mapData.value = res.data;
    const imgResponse = await getFloorImgData(mapData.value.ossId);
    if (imgResponse) {
      imgData.value = URL.createObjectURL(imgResponse);
      // 加载画布内容
      setData();
    } else {
      imgData.value = '';
    }
  }
};

/**
 * 加载内容
 */
const setData = () => {
  // 加载图片
  setBackgroundImage();
  // 加载区域颜色
  setCo2Colore(mapData.value.coords);
};

/**
 * 渲染图片
 */
const setBackgroundImage = () => {
  fabric.Image.fromURL(imgData.value, function (img) {
    // 保存原始图片尺寸
    const imgWidth = img.width - 60;
    const imgHeight = img.height - 30;

    // 设置画布尺寸为图片尺寸
    canvas.setWidth(imgWidth);
    canvas.setHeight(imgHeight);

    // 设置图片不可选择
    img.selectable = false;
    // 设置图片不可拖动
    img.lockMovementX = true;
    img.lockMovementY = true;
    // 设置图片不可缩放
    img.lockScalingX = true;
    img.lockScalingY = true;
    // 设置图片不可旋转
    img.lockRotation = true;

    // 计算画布中心点
    const canvasCenter = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };

    // 设置图片位置为画布中心
    img.left = canvasCenter.x - imgWidth / 2;
    img.top = canvasCenter.y - imgHeight / 2;
    img.setCoords();

    canvas.add(img);
    canvas.sendToBack(img);

    // 确保canvas容器居中
    const canvasContainer: HTMLElement = document.querySelector('.canvas-container');
    if (canvasContainer) {
      canvasContainer.style.margin = '0 auto';
    }

    // 重新渲染画布
    canvas.renderAll();
  });
};

/**
 * 渲染区域及舒适度
 */
const setCo2Colore = (coords: EsgHvacGraphMapCoordinateVo[]) => {
  if (coords && coords.length > 0) {
    coords.forEach((crdn) => {
      const ps = crdn.coords || [crdn.x, crdn.y];
      const pss = convertPolygonPoints(ps);
      const setColor = Number(crdn.co2Value) > 1000 ? uncomfortableColor : comfortableColor;
      drawPolygon(setColor, pss, true, crdn);
    });
  }
};

 const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasGroundRef.value?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

const polygons = ref<fabric.Polygon[]>([]);
const circles = ref<fabric.Circle[]>([]);

/**
 * 清空所有区域阴影
 */
function removeAllPolygons() {
  const objects = canvas.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    const object = objects[i];
    if (object instanceof fabric.Polygon && object.stroke != comfortableColor && object.stroke != uncomfortableColor) {
      canvas.remove(object);
    }
  }
  canvas.renderAll();
  polygons.value = [];
}

const removeAllCricles = () => {
  // 先从canvas中移除所有circle对象
  const objects = canvas.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    const object = objects[i];
    if (object instanceof fabric.Path) {
      canvas.remove(object);
    }
  }
  // 清空circles数组
  circles.value = [];
  // 重新渲染画布
  canvas.renderAll();
};

// 显示/隐藏指定索引的多边形
const togglePolygonVisibility = (name: string) => {
  polygons.value.forEach((polygonObj) => {
    if (polygonObj.name === name) {
      const currentVisibility = polygonObj.polygon.visible !== false; // 默认true
      const newVisibility = !currentVisibility;
      
      // 一次性设置所有属性
      polygonObj.polygon.set({
        visible: newVisibility,
        opacity: newVisibility ? 1 : 0,
        selectable: false
      });
    }
  });
  canvas.renderAll();
};

// 显示/隐藏指定索引的圆形
const toggleCircleVisibility = (type: string) => {
  console.log('toggleCircleVisibility', type, circles);
  circles.value.forEach((circle, index) => {
    if (circle.type === type) {
      const currentVisibility = circle.visible !== false; // 默认true
      const newVisibility = !currentVisibility;
      
      // 更新circle对象的可见性
      circle.visible = newVisibility;
      
      // 如果circle是fabric对象，也需要设置fabric属性
      if (circle.set) {
        circle.set({
          visible: newVisibility,
          opacity: newVisibility ? 1 : 0
        });
      }
    }
  });
  canvas.renderAll();
};

const getLegends = async () => {
  const checkLoading = async () => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!loading.value) {
          resolve();
        } else {
          setTimeout(check, 1000); // 每隔1秒检查一次
        }
      };
      check();
    });
  };

  await checkLoading();

  const legends = [];
  mapData.value?.coords?.forEach((crdn, index) => {
    legends.push({
      label: crdn.name,
      color: colors[index % colors.length],
      shape: 'rect'
    });
  });
  return legends;
};

/**
 * 渲染区域阴影
 */
const renderGraph = (lastClick: string, shadowColor: string) => {
  mapData.value.coords.forEach((crdn) => {
    if (crdn.name == lastClick) {
      const ps = crdn.coords || [crdn.x, crdn.y];
      const pss = convertPolygonPoints(ps);
      drawPolygon(shadowColor, pss, true, crdn);
    }
  });
};

// const colors = ['rgba(0, 186, 74, 0.20)', 'rgba(237, 182, 1, 0.20)'];
const colors = ['rgba(0, 186, 74, 0.5)', 'rgba(237, 182, 1, 0.5)'];
const nameColors = ['#00BA4A', '#ff384c'];
const renderAllArea = () => {
  mapData.value?.coords?.forEach((crdn, index) => {
    const ps = crdn.coords || [crdn.x, crdn.y];
    const pss = convertPolygonPoints(ps);
    drawPolygon(colors[index % colors.length], pss, true, crdn);
  });
};

const drawPolygon = (color: string, curPoints: any[], init = false, crdn: { [key: string]: any }) => {
  if (curPoints.length > 2) {
    const polygon = new fabric.Polygon(curPoints, {
      fill: color,
      stroke: color,
      strokeWidth: 1,
      scaleX: 1,
      scaleY: 1,
      selectable: false
    });
    canvas.add(polygon);
    polygons.value.push({ polygon, name: crdn.name, color });
  }
};

const renderAllPointers = () => {
  mapData.value.coords.forEach((crdn, index) => {
    const ps = crdn.coords || [crdn.x, crdn.y];
    const pss = convertPolygonPoints(ps);
    pss.forEach((point) => {
      drawCircle(nameColors[index % colors.length], point);
    });
  });
};

const drawCircle = (color: string, point: { x: number; y: number }, outerRadius = 8, innerRadius = 4) => {
  const pathData = `
        M ${point.x}, ${point.y - outerRadius}
        A ${outerRadius} ${outerRadius}, 0, 1, 1, ${point.x - 0.1}, ${point.y - outerRadius}
        M ${point.x}, ${point.y - innerRadius}
        A ${innerRadius} ${innerRadius}, 0, 1, 0, ${point.x + 0.1}, ${point.y - innerRadius}
        Z
    `;

  const ring = new fabric.Path(pathData, {
    fill: color,
    selectable: false
  });
  canvas.add(ring);
  circles.value.push(ring);
};

const convertPolygonPoints = (arr: Array<any>) => {
  const points = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      points.push({ x: Number(arr[i]), y: Number(arr[i + 1]) });
    }
  }
  return points;
};

/**
 * 画布缩放
 */
const setCanvasZoom = (_percentage: number) => {
  if (_percentage <= 0 || canvas == null) {
    return;
  }
  // 获取当前视口的缩放比例
  if (currentZoom == null) {
    currentZoom = canvas.getZoom();
  }
  // 计算新的缩放比例
  const newZoom = currentZoom * (_percentage / 100);
  // 设置新的缩放比例
  canvas.setZoom(newZoom);
  // 重新渲染画布以应用更改
  canvas.renderAll();
};

/**
 * 浏览器比例变更事件
 */
const resizeEvent = () => {
  if (!canvas) {
    canvas = new fabric.Canvas(canvasRef.value);
  }
  // 画布宽高
  if (canvasGroundRef.value) {
    const options = {
      width: canvasGroundRef.value.offsetWidth,
      height: canvasGroundRef.value.offsetHeight
    };
    if (canvas) {
      canvas.setWidth(options.width);
      canvas.setHeight(options.height);

      // 确保canvas居中显示
      const canvasContainer: HTMLElement = document.querySelector('.canvas-container');
      if (canvasContainer) {
        canvasContainer.style.margin = '0 auto';
      }

      // 如果有背景图，确保图片也居中
      centerCanvasObjects();
    } else {
      canvas = new fabric.Canvas(canvasRef.value, options);
    }

    // 百分比缩放
    const resizeValue = Math.round(((options.width * options.height) / (800 * 800)) * 100);
    if (resizeValue > 100) {
      percentage.value = 100;
    } else {
      percentage.value = resizeValue;
    }
  }
  // 右侧下方布局
  if (rightGround.value && rightBottomRef.value) {
    if (rightGround.value.offsetWidth >= 486) {
      rightBottomRef.value.style.display = 'flex';
    } else {
      rightBottomRef.value.style.display = 'flow';
    }
  }
};

/**
 * 居中画布中的对象
 */
const centerCanvasObjects = () => {
  if (!canvas) return;

  // 获取所有对象
  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  // 计算画布中心点
  const canvasCenter = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  // 如果有背景图，居中显示
  const backgroundImage = canvas.backgroundImage;
  if (backgroundImage) {
    const imgWidth = backgroundImage.width * backgroundImage.scaleX;
    const imgHeight = backgroundImage.height * backgroundImage.scaleY;

    backgroundImage.left = canvasCenter.x - imgWidth / 2;
    backgroundImage.top = canvasCenter.y - imgHeight / 2;
    backgroundImage.setCoords();
  }

  canvas.renderAll();
};

onMounted(async () => {
  resizeEvent();
  await loadMap();
  comeParams.value = route.query;
  queryFloorAll(comeParams.value.building);
  loading.value = false;
  window.addEventListener('resize', resizeEvent);
});

onUnmounted(() => {
  // 移除resize事件监听，防止内存泄漏
  window.removeEventListener('resize', resizeEvent);

  // 释放canvas资源
  if (canvas) {
    canvas.dispose();
    canvas = null;
  }
});

watch(
  () => props.type,
  (newVal) => {
    if (newVal) {
      loadMap(newVal);
    }
  }
);

watch(
  () => props.id,
  (newVal) => {
    console.log('innerMap props.id', newVal);
  }
);

defineExpose({
  togglePolygonVisibility,
  toggleCircleVisibility,
  getLegends,
  loadMap,
  toggleFullscreen,
  setCanvasZoom
});
</script>
<style scoped lang="scss">
.comfor-ground {
  display: flex;
  margin-left: -64px;
  align-self: center;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
}

.comfor-every {
  display: flex;
  justify-items: center;
  align-items: center;
  height: 16px;
}

.comfor-table {
  margin-bottom: 8px;
  color: var(--colors-base-10-success, #00ba4a);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
}

.un-comfor-table {
  color: var(--colors-base-08-warning, #edb601);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
}

.area-btn-ground {
  display: flex;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
  padding-top: 20px;
  padding-bottom: 20px;
  justify-content: flex-end;
  align-items: center;
}

.content-area {
  flex-grow: 1;
  display: flex;
  background-color: rgba(225, 233, 238, 0.6);
  background-image: linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px);
  background-size: 10px 10px;
}

.canvas-ground {
  display: flex;
  justify-items: center;
  align-content: center;

  :deep(.canvas-container) {
    margin: 0 auto;
  }

  canvas {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    max-height: 100%;
  }
}

.select-col {
  padding-left: 10px;
  padding-bottom: 32px;
  height: calc(100vh - 225px);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.north-compass {
  width: 64px;
  height: 64px;
}

.right-bottom-ground {
  display: flex;
  bottom: 0;
  left: 0;
  position: absolute;
}

/* 覆盖率统计卡片样式 */
.coverage-stats-card {
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
  color: #333;
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

  svg {
    width: 24px;
    height: 24px;
  }
}

.icon-container i {
  font-size: 18px;
  color: #fff;
}

.icon-container.blue {
  background-color: #1890ff;
}

.icon-container.cyan {
  background-color: #13c2c2;
}

.icon-container.green {
  background-color: #52c41a;
}

.icon-container.purple {
  background-color: #722ed1;
}

.stats-content {
  display: flex;
  flex-direction: column;
}

.stats-label {
  overflow: hidden;
  color: var(--VI-text-B49, #71797e);
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.stats-value {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  text-align: right;
  color: #11191e;
}
</style>
