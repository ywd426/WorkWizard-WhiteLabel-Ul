<template>
  <div class="bar-chart-container">
    <div v-if="!xAxisData.length" class="no-data">
      <span>No Data Available</span>
    </div>
    <div ref="chartRef" class="chart" :style="{ display: xAxisData.length > 0 ? 'block' : 'none' }"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    // [{ name, data: [], itemStyle? }]
    type: Array,
    required: true
  },
  xAxisData: {
    type: Array,
    required: true
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  colors: {
    type: Array,
    default: () => ['#FF6B84', '#09f']
  },
  barWidth: {
    type: String,
    default: '30%'
  },
  borderRadius: {
    type: Array,
    default: () => [4, 4, 0, 0]
  },
  height: {
    type: String,
    default: '300px'
  }
});

const chartRef = ref(null);
let chart = null;
let resizeObserver = null;

const createOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    show: props.showLegend,
    left: 'left', // 设置图例左对齐
    align: 'left', // 文本左对齐
    textStyle: {
      color: 'rgba(17, 25, 30, 0.80)',
      fontFamily: 'Montserrat',
      fontSize: 10
    },
    color: props.colors
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
  xAxis: {
    type: 'category',
    data: props.xAxisData,
    axisLine: { lineStyle: { color: '#DCDFE6' } },
    axisLabel: {
      color: 'rgba(17, 25, 30, 0.40)',
      fontFamily: 'Montserrat',
      fontSize: 8,
      fontWeight: 600,
      lineHeight: 14
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    interval: 20,
    axisLine: { lineStyle: { color: 'rgba(17, 25, 30, 0.40)' } },
    axisLabel: {
      color: 'rgba(17, 25, 30, 0.40)',
      fontFamily: 'Montserrat',
      fontSize: 8,
      fontWeight: 600,
      lineHeight: 14
    },
    splitLine: { lineStyle: { color: '#EBEEF5', type: 'dashed' } }
  },
  series: props.data.map((series, idx) => ({
    name: series.name,
    type: 'bar',
    barWidth: props.barWidth,
    data: series.data.map((value) => ({
      value,
      itemStyle: {
        color: series.itemStyle?.color || props.colors[idx] || '#09f',
        borderRadius: props.borderRadius
      }
    })),
    emphasis: { focus: 'series' },
    label: {
      show: true,
      position: 'top',
      formatter: '{c}',
      fontSize: 10,
      fontWeight: 600,
      color: 'rgba(17, 25, 30, 0.60)'
    }
  })),
  color: props.colors
});

const initChart = () => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption(createOption());
  // 初始化后立即调整大小
  chart.resize();
};

const updateChart = () => {
  if (!chart) {
    // 如果图表还没初始化，先初始化
    initChart();
    return;
  }
  chart.setOption(createOption(), true); // 使用true完全替换选项，避免合并问题
  // 强制延迟执行resize，确保DOM已更新
  setTimeout(() => {
    chart.resize();
  }, 0);
};
const handleResize = () => {
  chart && chart.resize();
};

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

// 防抖处理的resize函数
const debouncedResize = debounce(() => {
  if (chart) {
    chart.resize();
  }
}, 100);
onMounted(() => {
  nextTick(() => {
    initChart();
    
    // 添加ResizeObserver监听容器大小变化
    if (window.ResizeObserver && chartRef.value) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(chartRef.value.parentElement || chartRef.value);
    }

    // 保留window resize事件监听作为后备方案
    window.addEventListener('resize', debouncedResize);
    
    // 延迟更新图表，确保容器已完全渲染
    setTimeout(() => {
      updateChart();
      // 再次强制resize以确保正确显示
      if (chart) chart.resize();
    }, 300);
  });
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (chart) chart.dispose();
});
// 监听数据变化
watch(() => [props.data, props.xAxisData, props.colors], () => {
  // 当数据从无到有时，需要特殊处理
  const hasData = props.xAxisData && props.xAxisData.length > 0;
  
  if (hasData) {
    // 确保DOM更新后再更新图表
    nextTick(() => {
      updateChart();
      // 强制延迟执行resize
      setTimeout(() => {
        if (chart) chart.resize();
      }, 50);
    });
  }
}, { deep: true });

defineExpose({
  updateChart
});
</script>

<style scoped>
@import '@/assets/styles/chart.scss';
.bar-chart-container {
  width: 100%;
}

.no-data {
  height: 290px !important;
}
.chart {
  width: 100%;
  height: v-bind('height');
  min-height: 200px;
}
.custom-legend {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  gap: 16px;
}
.legend-item {
  display: flex;
  align-items: center;
}
.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.legend-label {
  font-size: 10px;
  font-weight: 500;
  color: #11191e;
}
</style>
