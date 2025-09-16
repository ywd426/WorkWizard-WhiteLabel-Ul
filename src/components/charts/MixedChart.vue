<template>
  <div v-if="!xAxisData.length" class="no-data">
    <span>No Data Available</span>
  </div>
  <div ref="chartRef" class="mixed-chart" :style="{ display: xAxisData.length > 0 ? 'block' : 'none' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps({
  xAxisData: {
    type: Array,
    required: true
  },
  chartLegend: {
    type: Array,
    default: () => []
  },
  barData: {
    type: Array,
    required: true
  },
  height: {
    type: String,
    default: '400px'
  },
  lineData: {
    type: Array,
    required: true
  },
  lineStyle: {
    type: Object,
    default: () => ({
      color: '#409EFF',
      type: 'solid'
    })
  },
  yAxis: {
    type: Object,
    default: () => ({
      name: '',
      min: 0,
      max: 100,
      interval: 25
    })
  },
  yAxisRight: {
    type: Object,
    default: () => ({
      name: '',
      min: 0,
      max: 100,
      interval: 25
    })
  },
  showLegend: {
    type: Boolean,
    default: true
  }
});

const chartRef = ref(null);
let chart = null;
const nameTextStyle = {
  color: '#11191E',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontFamily: 'Montserrat',
  fontSize: 14,
  lineHeight: 16
};
const axisLabel = {
  color: 'rgba(17, 25, 30, 0.40)',
  fontFamily: 'Montserrat',
  fontSize: 8,
  fontWeight: 600,
  lineHeight: 14
};

const createOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    top: '15%',
    left: '3%',
    right: '3%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.xAxisData,
    axisLabel: {
      interval: 0,
      rotate: 0,
      fontSize: 12,
      color: '#606266',
      ...axisLabel
    }
  },
  yAxis: [
    {
      type: 'value',
      ...props.yAxis,
      axisLabel,
      nameTextStyle: {
        ...nameTextStyle,
        align: 'left', // 新增左对齐配置
        verticalAlign: 'middle'
      }
    },
    {
      type: 'value',
      ...props.yAxisRight,
      axisLabel,
      nameTextStyle: {
        ...nameTextStyle,
        align: 'right', // 新增左对齐配置
        verticalAlign: 'middle'
      }
    }
  ],

  legend: {
    show: props.showLegend,
    top: 0,
    left: 'center',
    itemHeight: 10,
    data: props.chartLegend.map((item) => {
      return item.name;
    }),
    textStyle: {
      fontFamily: 'Montserrat',
      fontSize: 10,
      fontWeight: 500
    }
  },
  series: [
    {
      name: 'People Distribution',
      type: 'bar',
      barWidth: '40%',
      data: props.barData,
      label: {
        color: '#11191E',
        show: true,
        position: 'top',
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    {
      name: 'Dwell Time',
      type: 'line',
      yAxisIndex: 1,
      symbol: 'circle',
      symbolSize: 8,
      data: props.lineData,
      label: {
        show: true,
        position: 'top',
        formatter: function (params) {
          return `${params.value} min`;
        },
        color: '#E1E9EE',
        backgroundColor: '#000E33',
        padding: [6, 12],
        borderRadius: 4,
        border: [1, 'solid', '#00153D'],
        fontSize: 8,
        lineHeight: 14,
        itemHeight: 26,
        fontWeight: '600',
        fontFamily: 'Montserrat'
      },
      lineStyle: {
        color: props.lineStyle.color,
        type: props.lineStyle.type,
        width: 2
      },
      itemStyle: {
        color: props.lineStyle.color, //'transparent',
        borderColor: props.lineStyle.color
      }
    }
  ]
});

const initChart = () => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption(createOption());
};

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

const debouncedResize = debounce(handleResize, 100);

onMounted(() => {
  nextTick(() => initChart()); // 确保组件挂载后再初始化 char
  window.addEventListener('resize', debouncedResize);
});

onUnmounted(() => {
  chart?.dispose();
  window.removeEventListener('resize', debouncedResize);
});

defineExpose({
  updateChart: () => chart?.setOption(createOption()),
  getDataURL: (options) => chart?.getDataURL(options)
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
.mixed-chart {
  width: 100%;
  height: v-bind(height);
}
</style>
