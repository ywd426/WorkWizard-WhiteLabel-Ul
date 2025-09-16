<template>
  <div class="chart-main" @dblclick="handleDoubleClick()">
    <div v-if="props.config.title" class="title main-header-h7">
      <el-tooltip :content="chartTitle" placement="top">
        {{ splitLoaction(chartTitle) }}
      </el-tooltip>
    </div>
    <div v-if="hasData" ref="chartDom" class="chartDom" :style="{ 'height': 'calc(100% - ' + chartDomTop + 'px)' }"></div>
    <div v-else class="chartDom">
      <div class="no-data"><span>No Data</span></div>
    </div>
    <div v-if="props.dashboard" class="btn-add">
      <el-button type="text" plain size="small" @click="addDashborad">&#43;</el-button>
    </div>
    <div v-if="props.group" class="svg-add">
      <svg-icon icon-class="Inbox" class-name="current-btn-item" @click="changeGroup"></svg-icon>
    </div>
    <div class="zoom-text">
      <span>{{ zoomToolTip }}</span>
    </div>
    <ChartMenu
      v-if="props.config.showMenu"
      :config="menuConfig"
      @refresh="refresh"
      @delete-chart="deleteChart"
      @export-chart="exportChart"
    ></ChartMenu>
    <el-dialog v-model="dialogGroup.visible" class="groupChart" width="300px" :destroy-on-close="true" :close-on-click-modal="true" append-to-body>
      <el-select
        v-model="groupName"
        placeholder="Select or add group"
        filterable
        allow-create
        default-first-option
        :validate-event="false"
        @change="saveGroup"
      >
        <el-option v-for="item in groupList" :key="item.name" :label="item.name" :value="item.name"></el-option>
      </el-select>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { FoldingLineRequestType, formatFoldingLineCartOptions } from './Option';
import { showGroups } from '@/api/monitor/dashboard';
import { getChartInfo, updateChartGroup } from '@/api/monitor/chartinfo';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import useAppStore from '@/store/modules/app';
import * as XLSX from 'xlsx';
interface Props {
  config: {
    id?: string;
    title?: string;
    chartOptions: FoldingLineRequestType;
    showMenu: boolean;
  };
  dashboard?: boolean;
  group?: boolean;
}
const dialogGroup = reactive<DialogOption>({
  visible: false
});
const groupName = ref('');
const groupList = ref([]);
const props = defineProps<Props>();
const hasData = ref(true);
const chartTitle = ref('');
const chartDomTop = ref('0');
const zoomToolTip = ref('');
const menuConfig = ref(JSON.parse(JSON.stringify(props.config)));
// chart定义
const chartDom = ref<HTMLDivElement>(null);
let chartInstance: echarts.EChartsType = null;
const option = ref(formatFoldingLineCartOptions(props.config.chartOptions));

const timeZone = ref(useAppStore().currentTimeZone);

const emit = defineEmits(['delete-chart', 'refresh', 'show-dashboard', 'double-click', 'set-group']);

const getGroupList = () => {
  showGroups().then((res) => {
    groupList.value = res.data;
  });
};
const saveGroup = () => {
  updateChartGroup(props.config.id, groupName.value).then((res) => {
    dialogGroup.visible = false;
    proxy?.$modal.msgSuccess('Operation Successful');
    emit('set-group', props.config.id, groupName.value);
  });
};

const changeGroup = () => {
  groupName.value = '';
  console.log('changeGroup', props.config.id);
  getGroupList();
  dialogGroup.visible = true;
};

const handleDoubleClick = () => {
  emit('double-click', props.config.id);
};
//location 分割,从建筑物开始
const splitLoaction = (item) => {
  const parts = item.split('|');
  if (parts.length > 2) {
    item = parts.slice(1).join(' | ').trim();
  }
  return item;
};
// 刷新画面
const refresh = () => {
  // 根据id重新获取chart数据
  getChartInfo(props.config.id).then((res) => {
    const { location, chartOptions } = res.data;
    chartTitle.value = location;
    option.value = formatFoldingLineCartOptions(JSON.parse(chartOptions));
    menuConfig.value = { id: props.config.id, title: location, chartOptions: JSON.parse(chartOptions), showMenu: props.config.showMenu };
    emit('refresh', props.config.id, location, chartOptions);
  });
};
const previewChart = (location, chartOptions) => {
  chartTitle.value = location;
  option.value = formatFoldingLineCartOptions(JSON.parse(chartOptions));
  menuConfig.value = { id: props.config.id, title: chartTitle.value, chartOptions: JSON.parse(chartOptions), showMenu: props.config.showMenu };
};
const deleteChart = () => {
  // 根据id删除chart数据
  emit('delete-chart', props.config.id);
};

const exportToImage = (type?: 'png' | 'jpeg' | 'svg') => {
  const imgUrl = chartInstance.getDataURL({ type, pixelRatio: 2 }); // 提高分辨率
  const option = chartInstance.getOption();
  const name = option.title[0].text;

  // 创建下载链接
  const link = document.createElement('a');
  link.href = imgUrl;
  link.download = `${name}.${type}`;
  link.click();
};

const exportToExcel = () => {
  const option = chartInstance.getOption();
  const xAxis = option.xAxis[0]; // 获取X轴
  const seriesData = option.series[0]; // 获取数据
  const name = option.title[0].text;
  console.log('seriesData', seriesData, option);

  const excelData = [
    ['Time', 'Actual Value', 'Alert Value'],
    ...seriesData.data.map((item, i) => {
      return [xAxis.data[i], item, seriesData.markPoint?.data.find((d) => d.xAxis == xAxis.data[i]) ? seriesData.markPoint?.data[i]?.yAxis : ''];
    })
  ];

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chart Data');
  XLSX.writeFile(wb, `${name}.xlsx`);
};

const exportChart = (type) => {
  // 根据id导出chart数据
  if (type === 'png' || type === 'jpg') {
    exportToImage(type);
  }
  if (type === 'excel') {
    exportToExcel();
  }
};

// 监听尺寸变化
useResizeObserver(chartDom, () => {
  if (chartInstance) {
    chartInstance.resize();
    reloadLable();
  }
});
const addDashborad = () => {
  emit('show-dashboard', props.config.id);
};
const getDataZoomRange = () => {
  // 获取当前图表的配置项
  const currentOption = chartInstance.getOption();
  // 获取 dataZoom 组件的配置
  zoomToolTip.value = '';

  const dataZoomComponents = currentOption.dataZoom;
  if (Array.isArray(dataZoomComponents) && dataZoomComponents.length > 0) {
    // 获取 X 轴的数据
    const xAxisData = currentOption.xAxis[0].data;
    const dataZoomComponent = dataZoomComponents[0];
    if (dataZoomComponent.startValue || dataZoomComponent.endValue) {
      const startDate = new Date(xAxisData[dataZoomComponent.startValue]);
      const endDate = new Date(xAxisData[dataZoomComponent.endValue]);
      const timeDifference = endDate.getTime() - startDate.getTime(); // 显式转换为毫秒数
      let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      zoomToolTip.value = `Duration: ${days} days ${hours} hours`;
      const dateCountMap = new Map<string, number>();
      // 统计每个日期出现的次数
      xAxisData.forEach((item) => {
        if (typeof item === 'string') {
          const datePart = item.split(' ')[0]; // 提取日期部分
          dateCountMap.set(datePart, (dateCountMap.get(datePart) || 0) + 1);
        }
      });
      let labelIndex = 0;
      const customLabels = [];
      dateCountMap.forEach((count, date) => {
        let curNum = Math.floor(count / 2) + labelIndex;
        if (curNum >= dataZoomComponent.startValue && curNum <= dataZoomComponent.endValue) {
          customLabels.push(Math.floor(count / 2) + labelIndex);
        }
        labelIndex += count;
      });
      getCustomLabels(customLabels);
    }
  }
};
const reloadLable = () => {
  // 获取当前图表的配置项
  const currentOption = chartInstance.getOption();
  // 获取 X 轴的数据
  const xAxisData = currentOption.xAxis[0].data;
  if (xAxisData) {
    const dateCountMap = new Map<string, number>();
    // 统计每个日期出现的次数
    xAxisData.forEach((item) => {
      if (typeof item === 'string') {
        const datePart = item.split(' ')[0]; // 提取日期部分
        dateCountMap.set(datePart, (dateCountMap.get(datePart) || 0) + 1);
      }
    });
    let labelIndex = 0;
    const customLabels = [];
    dateCountMap.forEach((count, date) => {
      customLabels.push(Math.floor(count / 2) + labelIndex);
      labelIndex += count;
    });
    getCustomLabels(customLabels);
  }
};
const getCustomLabels = (customLabels) => {
  // 获取chart的宽度
  const zr = chartInstance.getZr();
  const chartWidth = zr.getWidth();
  
  // 动态计算标签宽度，考虑标签内容长度
  const estimatedLabelWidth = 100; // 增加预估标签宽度以防止重叠
  let maxNum = Math.floor((chartWidth - 80) / estimatedLabelWidth); // 减去Y轴宽度
  
  if (maxNum <= 0) {
    maxNum = 1;
  }
  
  let result = [];
  let axisLabelConfig = {
    customValues: [],
    rotate: 0,
    interval: 'auto',
    overflow: 'truncate',
    width: estimatedLabelWidth - 10,
    hideOverlap: true
  };
  
  if (maxNum === 1) {
    // 取中间的一个值
    result = [customLabels[Math.floor(customLabels.length / 2)]];
    axisLabelConfig.customValues = result;
  } else if (maxNum >= customLabels.length) {
    // 取全部的值，但设置间隔以防重叠
    result = customLabels;
    axisLabelConfig.customValues = result;
    // 如果标签数量较多，设置旋转角度
    if (customLabels.length > 6) {
      axisLabelConfig.rotate = 45;
    }
  } else {
    // 计算间隔
    const interval = customLabels.length / maxNum;
    for (let i = 0; i < maxNum; i++) {
      result.push(customLabels[Math.floor(i * interval)]);
    }
    axisLabelConfig.customValues = result;
    
    // 如果空间仍然紧张，设置旋转角度
    if (maxNum > 4 && chartWidth < 600) {
      axisLabelConfig.rotate = 30;
    }
  }
  
  chartInstance.setOption({
    xAxis: {
      axisLabel: axisLabelConfig
    }
  });
};
//设置异常的高亮
const setAlertHighlight = (startDate: string, endDate: string) => {
  const currentOption = chartInstance.getOption();
  const markPoint = currentOption.series[0].markPoint;
  if (!markPoint || !markPoint.data) return;
  // 将日期字符串转换为时间戳
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  // 遍历 markPoint.data，更新需要高亮的数据点
  const updatedData = markPoint.data.map((item) => {
    const itemTimestamp = new Date(item.xAxis).getTime();
    // 如果当前数据点在时间范围内，则高亮显示
    if (itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp) {
      return {
        xAxis: item.xAxis,
        yAxis: item.yAxis, // 保留原有属性
        symbolSize: 14
      };
    }
    // 不在时间范围内，保持原样
    return { xAxis: item.xAxis, yAxis: item.yAxis };
  });
  chartInstance.setOption({
    series: [
      {
        markPoint: {
          data: updatedData
        }
      }
    ]
  });
};
//设置预测点高亮
const setForecastHighlight = (data: string) => {
  const currentOption = chartInstance.getOption();
  if (currentOption.series[1]) {
    const forecastDatas = currentOption.series[1].data;
    const xAxisData = currentOption.xAxis[0].data;
    const updatedData = [];
    forecastDatas.forEach((item, index) => {
      // 如果当前数据点在时间范围内，则高亮显示
      if (item == parseFloat(data)) {
        updatedData.push({
          xAxis: xAxisData[index],
          yAxis: item,
          symbolSize: 14
        });
      }
    });
    chartInstance.setOption({
      series: [
        currentOption.series[0],
        {
          markPoint: {
            symbol: 'circle',
            data: updatedData
          }
        }
      ]
    });
  }
};
onMounted(async () => {
  await nextTick();
  chartInstance = echarts.init(chartDom.value);
  chartInstance.setOption(option.value);
  chartInstance.on('dataZoom', () => {
    getDataZoomRange();
  });
  getDataZoomRange();
  reloadLable();
  chartDomTop.value = '50';
  // 设置没有title时的高度
  if (!props.config.title) {
    chartDomTop.value = '10';
    chartTitle.value = '';
  } else {
    chartTitle.value = props.config.title;
  }
});

onUnmounted(() => {
  if (chartInstance != null && chartInstance.dispose) {
    chartInstance.dispose();
  }
});

// 监听数据和属性的变化并平滑更新
watch(
  () => option,
  (newOptions) => {
    if (chartInstance) {
      chartInstance.dispose();

      chartInstance = echarts.init(chartDom.value);
      chartInstance.setOption(newOptions.value);
    }
  },
  { deep: true }
);

watch(() => props.config, (newOptions) => {
    if (chartInstance) {
      chartInstance.dispose();

      chartInstance = echarts.init(chartDom.value);
      chartInstance.setOption(formatFoldingLineCartOptions(props.config.chartOptions));
    }
  }, { deep: true });

watch(
  () => useAppStore().currentTimeZone,
  () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = echarts.init(chartDom.value);
      chartInstance.setOption(formatFoldingLineCartOptions(props.config.chartOptions));
    }
  },
  { deep: true }
);
defineExpose({
  previewChart,
  refresh,
  setAlertHighlight,
  setForecastHighlight
});
</script>

<style lang="scss" scoped>
.chart-main {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  font-size: 16px;
  background: var(--baseBackground);
  border: 1px solid var(--el-base-border-color);
  position: relative;
  &:hover {
    box-shadow:
      0px 4px 6px -2px var(--el-box-shadow-start-color),
      0px 10px 15px -3px var(--el-box-shadow-end-color);
    border: 1px solid var(--el-line-color-base);
  }

  .title {
    height: 48px;
    line-height: 48px;
    font-weight: bold;
    padding-left: 3%;
    background: var(--el-title-background-color);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
  }
  .title:hover {
    color: var(--colors-base-primary);
  }

  .chartDom {
    width: 100%;
    padding: 10px 0;
    position: initial !important;
  }
}
.btn-add {
  position: absolute;
  top: 54px;
  right: 3%;
  z-index: 10;
  button {
    position: relative;
    right: 48px;
    font-size: 28px;
    width: 40px;
    border-radius: 16px;
    color: var(--vxe-font-lighten-color);
  }

  :deep(svg) {
    transform: rotate(90deg);
  }
}
.no-data {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 设置高度为视口高度 */
  font-size: 24px;
}
.zoom-text {
  position: absolute;
  width: 200px;
  left: 50%;
  margin-left: -100px;
  bottom: 2px;
  z-index: 10;
  display: flex;
  justify-content: center;
  span {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    background: linear-gradient(90deg, #4c90cd 7.76%, #4677ba 21.59%, #415da8 39.1%, #3d4b9b 56.61%, #3a4093 75.96%, #3a3d91 97.16%, #3a3d91 99.93%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
.svg-add {
  position: absolute;
  top: 54px;
  right: 3%;
  z-index: 10;
  svg {
    position: relative;
    right: 56px;
  }
}
.current-btn-item {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}
</style>
<style lang="scss">
.groupChart {
  width: 300px;
  padding: 0;
  border-radius: 10px;

  header {
    display: none;
  }

  .el-dialog__body {
    max-height: 100% !important;
    height: 100%;
  }
}

.el-overlay .el-overlay-dialog .el-dialog.fullChart .el-dialog__body {
  padding: 0 !important;
}
</style>
