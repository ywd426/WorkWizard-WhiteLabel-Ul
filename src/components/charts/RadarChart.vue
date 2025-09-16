<template>
  <div v-if="!data.length" class="no-data">
    <span>No Data Available</span>
  </div>
  <div v-if="data.length" ref="chartRef" :style="{ width: '100%', height: height, display: data.length > 0 ? 'block' : 'none' }" />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 图表数据
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  // 指标数据
  indicators: {
    type: Array,
    required: true,
    default: () => []
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: true
  },
  // 图表颜色
  color: {
    type: String,
    default: '#409EFF'
  },
  // 自定义配置项
  customOptions: {
    type: Object,
    default: () => ({})
  }
});

const chartRef = ref(null);
let chart = null;

// 获取当前配置
const getChartOptions = () => {
  return {
    legend: {
      show: props.showLegend,
      bottom: '5%',
      textStyle: {
        color: props.color,
        fontSize: 12
      }
    },
    radar: {
      indicator: props.indicators,
      radius: '60%',
      splitNumber: 4,
      axisName: {
        color: '#11191E',
        fontFamily: 'Montserrat',
        fontSize: 12,
        fontWeight: 400
      },
      splitLine: { lineStyle: { color: '#EBEEF5' } },
      splitArea: { areaStyle: { color: ['#fff', '#F7F9FA'] } },
      axisLine: { lineStyle: { color: '#EBEEF5' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.data,
            areaStyle: { color: `${props.color}33` }, // 添加透明度
            lineStyle: { color: props.color, width: 2 },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: props.color }
          }
        ]
      }
    ]
  };
};

// 渲染图表
const renderChart = () => {
  if (!chartRef.value) return;

  // 获取最新的配置
  const currentOptions = getChartOptions();
  
  // 合并自定义配置
  const option = {
    ...currentOptions,
    ...props.customOptions
  };

  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.setOption(option);
  } else {
    // 更新现有图表，设置第二个参数为true以防止合并
    chart.setOption(option, true);
  }
};

// 处理窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// 监听数据变化
watch(
  () => [props.data, props.indicators],
  () => {
    renderChart();
  },
  { deep: true }
);

// 组件挂载时初始化
onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 暴露方法供父组件调用
defineExpose({
  refreshChart: renderChart,
  getChart: () => chart
});
</script>
<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
</style>
