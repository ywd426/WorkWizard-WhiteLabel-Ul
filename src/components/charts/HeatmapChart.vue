<template>
  <div v-if="!xAxisData.length" class="no-data">
    <span>No Data Available</span>
  </div>
  <div v-else ref="chartRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 热力图数据
  data: {
    type: Array,
    default: () => []
  },
  // 图表高度
  height: {
    type: String,
    default: '500px'
  },
  // 颜色范围
  colorRange: {
    type: Array,
    default: () => ['#ADEFC9', '#EDB601', '#FF8401', '#FF384C']
  },
  // 最小值
  minValue: {
    type: Number,
    default: 0
  },
  // 最大值
  maxValue: {
    type: Number,
    default: 15
  },
  // X轴数据
  xAxisData: {
    type: Array,
    default: () => []
  },
  // Y轴数据
  yAxisData: {
    type: Array,
    default: () => []
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: true
  },
  // 是否显示工具提示
  showTooltip: {
    type: Boolean,
    default: true
  },
  // 是否显示数值标签
  showLabel: {
    type: Boolean,
    default: true
  },
  // 坐标轴字体大小
  axisFontSize: {
    type: Number,
    default: 12
  },
  // 单元格内字体大小
  cellFontSize: {
    type: Number,
    default: 12
  }
});

const chartRef = ref(null);
let chart = null;

// 添加防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

const resizeObserver = ref(null);

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  // 先移除旧的监听器
  window.removeEventListener('resize', debouncedResize);

  // 销毁已存在的图表实例
  if (chart) {
    chart.dispose();
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
  // 创建新的图表实例
  chart = echarts.init(chartRef.value);

  // 更新图表
  updateChart();

  // 添加窗口大小变化监听
  window.addEventListener('resize', debouncedResize);
  
  // 使用 ResizeObserver 监听容器大小变化
  resizeObserver.value = new ResizeObserver(debounce(() => {
    if (chart && chartRef.value) {
      const container = chartRef.value;
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        chart.resize();
      }
    }
  }, 100));
  resizeObserver.value.observe(chartRef.value);
};

// 处理窗口大小变化
const handleResize = () => {
  if (!chart || !chartRef.value) return;

  // 检查容器是否可见
  const container = chartRef.value;
  if (container.offsetWidth === 0 || container.offsetHeight === 0) {
    // 如果不可见，延迟重试
    setTimeout(handleResize, 100);
    return;
  }

  // 确保 echarts 实例存在且容器可见
  chart.resize();
};

const debouncedResize = debounce(handleResize, 100);

// 更新图表数据和配置
const updateChart = () => {
  if (!chart) return;

  // 准备X轴数据
  const xData = props.xAxisData.length > 0 ? props.xAxisData : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Avg'];

  // 准备Y轴数据
  const yData = props.yAxisData.length > 0 ? props.yAxisData : generateHours();

  // 准备热力图数据
  const heatmapData = props.data.length > 0 ? props.data : generateMockData(xData, yData);
  const offsetValue = props.maxValue - props.minValue;

  // 图表配置
  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `<div style="font-size:10px;line-height: 14px; font-family: Montserrat;">
          <p style="font-weight:bold;"> ${params.value[0]} ${params.value[1]}</p><p>Value: ${params.value[2]}</p>
        </div>`;
      },
      show: props.showTooltip
    },
    grid: {
      top: props.showLegend ? '60px' : '10px',
      left: '1%',
      right: '2%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      position: 'top',
      type: 'category',
      data: xData,
      splitArea: {
        show: true
      },
      splitLine: {
        show: false // 关闭竖线
      },
      axisTick: {
        // 坐标轴刻度
        show: false
      },
      axisLabel: {
        color: '#11191E',
        fontSize: props.axisFontSize,
        interval: 0,
        margin: 0,
        fontFamily: 'Montserrat',
        fontWeight: 600,
        // backgroundColor: 'rgba(211, 219, 224, 0.40)',
        padding: [2, 6] // 调整文本周围的空白区域
      }
    },
    yAxis: {
      type: 'category',
      data: yData,
      splitArea: {
        show: true
      },
      splitLine: {
        show: false // 关闭竖线
      },
      axisTick: {
        // 坐标轴刻度
        show: false // 是否显示坐标轴刻度
      },
      axisLabel: {
        color: '#11191E',
        fontSize: props.axisFontSize,
        interval: 0,
        fontFamily: 'Montserrat',
        fontWeight: 600,
        align: 'center',
        verticalAlign: 'middle',
        margin: 12,
        width: 60,
        // backgroundColor: 'rgba(211, 219, 224, 0.40)',
        padding: [5, 5]
      }
    },
    visualMap: {
      min: props.minValue,
      max: props.maxValue,
      // calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: '0',
      show: props.showLegend,
      // inRange: {
      //   color: props.colorRange
      // },
      pieces: [
        { min: props.minValue, max: props.minValue + offsetValue * 0.25, color: props.colorRange[0] },
        { min: props.minValue + offsetValue * 0.25, max: props.minValue + offsetValue * 0.5, color: props.colorRange[1] },
        { min: props.minValue + offsetValue * 0.5, max: props.minValue + offsetValue * 0.75, color: props.colorRange[2] },
        { min: props.minValue + offsetValue * 0.75, max: props.maxValue, color: props.colorRange[3] }
      ],
      textStyle: {
        fontSize: props.axisFontSize,
        fontFamily: 'Montserrat'
      }
    },
    series: [
      {
        name: 'Heatmap',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: props.showLabel,
          color: '#000',
          fontSize: props.cellFontSize,
          fontFamily: 'Montserrat',
          fontWeight: 500
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 设置图表配置
  chart.setOption(option);
};

// 生成小时数据
const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i}:00`);
  }
  return hours;
};

const randomValue = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] / (0xFFFFFFFF + 1); // 转换为 [0, 1) 区间的小数
};

// 生成模拟数据
const generateMockData = (xData, yData) => {
  const data = [];
  for (const x of xData) {
    for (const y of yData) {
      // 生成随机值，模拟热力图数据
      const value = Math.round(randomValue() * props.maxValue);
      data.push([x, y, value]);
    }
  }
  return data;
};

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

// 监听其他属性变化
watch(
  [
    () => props.xAxisData,
    () => props.yAxisData,
    () => props.colorRange,
    () => props.minValue,
    () => props.maxValue,
    () => props.showLegend,
    () => props.showTooltip,
    () => props.showLabel,
    () => props.axisFontSize,
    () => props.cellFontSize
  ],
  () => {
    updateChart();
  }
);

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 组件销毁前清理资源
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
});

// 暴露方法给父组件
defineExpose({
  updateChart,
  getChart: () => chart,
  resize: handleResize
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
</style>
