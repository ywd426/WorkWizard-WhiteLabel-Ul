<template>
  <div v-if="!series.length" class="no-data">
    <span>No Data Available</span>
  </div>
  <div class="pie-chart-container" :style="{ display: series.length > 0 ? 'block' : 'none' }">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  // 图表数据
  series: {
    type: Array,
    required: true
  },
  // 图例数据
  chartLegend: {
    type: Array,
    default: () => []
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: true
  },
  // 图表高度
  height: {
    type: String,
    default: '200px'
  },
  // 中心文本
  centerText: {
    type: Object,
    default: () => ({
      text: '',
      subText: '',
      textStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333'
      },
      subTextStyle: {
        fontSize: 14,
        color: '#999'
      }
    })
  },
  // 饼图配置
  pieConfig: {
    type: Object,
    default: () => ({
      radius: ['60%', '75%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      }
    })
  },
  // 自定义颜色
  colors: {
    type: Array,
    default: () => ['#00BA4A', '#EDB601', '#FF384C', '#409EFF', '#909399']
  },
  // 是否显示标签
  showLabels: {
    type: Boolean,
    default: false
  },
  // 是否显示自定义图例
  showCustomLegend: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
let chart = null;

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);

  // 创建基础配置
  const option = createBaseOption();

  chart.setOption(option);
};

// 创建基础图表配置
const createBaseOption = () => {
  const option = {
    color: props.colors,
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `<div style="font-size:10px;line-height: 14px; font-family: Montserrat;">
                    <div style="display:flex;align-items:center;">
                    <span style="width:8px;height:8px;border-radius:50%;background-color:#fff;border:2px solid ${params.color};margin-right:8px;"></span>
                    <span style="font-weight:bold;font-size:12px;line-height: 16px">${params.name}:</span><br/>
                    <span style="font-size:12px;line-height: 14px;padding-left:8px;">${params.value} (${params.percent}%)</span>
                    </div>
                </div>`;
      }
    },
    grid: {
      top: 20,
      bottom: 40,
      left: 50,
      right: 50
    },
    legend: {
      show: props.showLegend && !props.showCustomLegend,
      bottom: '0',
      left: 'center',
      icon: 'circle',
      itemHeight: 10,
      data: props.series.map((item) => item.name),
      textStyle: {
        color: '#11191E',
        fontFamily: 'Montserrat',
        fontSize: 10,
        fontWeight: 500
      }
    },
    series: [
      {
        name: 'data',
        type: 'pie',
        radius: props.pieConfig.radius,
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: props.pieConfig.itemStyle,
        label: {
          show: true, // 禁用默认标签
          color: '#11191E',
          fontFamily: 'Montserrat',
          fontSize: 12,
          fontWeight: 600
        },
        labelLine: {
          show: true // 禁用标签连线
        },
        data: props.series
      }
    ]
  };

  // 添加中心文本
  if (props.centerText.text) {
    option.graphic = [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: props.centerText.text,
          fontSize: props.centerText.textStyle.fontSize,
          fontWeight: props.centerText.textStyle.fontWeight,
          textAlign: 'center',
          fill: props.centerText.textStyle.color,
          fontFamily: 'Montserrat'
        }
      }
    ];

    // 添加副标题
    if (props.centerText.subText) {
      option.graphic.push({
        type: 'text',
        left: 'center',
        top: '55%',
        style: {
          text: props.centerText.subText,
          fontSize: props.centerText.subTextStyle.fontSize,
          textAlign: 'center',
          fill: props.centerText.subTextStyle.color,
          fontFamily: 'Montserrat'
        }
      });
    }
  }

  return option;
};

// 更新图表
const updateChart = () => {
  if (!chart) return;

  const option = createBaseOption();
  chart.setOption(option, true);
};

// 获取图表实例
const getChart = () => {
  return chart;
};

// 获取图表数据URL
const getDataURL = (options) => {
  if (!chart) return '';
  return chart.getDataURL(options);
};

// 监听属性变化
watch(() => props.series, updateChart, { deep: true });
watch(() => props.centerText, updateChart, { deep: true });
watch(() => props.pieConfig, updateChart, { deep: true });
watch(() => props.colors, updateChart, { deep: true });
watch(() => props.showLabels, updateChart);
watch(() => props.showLegend, updateChart);

// 监听窗口大小变化
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

// 使用防抖处理resize
const debouncedResize = debounce(handleResize, 100);

// ResizeObserver实例
let resizeObserver = null;

onMounted(() => {
  nextTick(() => {
    initChart();

    // 添加ResizeObserver监听容器大小变化
    if (window.ResizeObserver && chartRef.value) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(chartRef.value);
    }

    // 保留window resize事件监听作为后备方案
    window.addEventListener('resize', debouncedResize);

    // 确保初始尺寸正确
    setTimeout(() => {
      handleResize();
    }, 200);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedResize);

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 暴露方法
defineExpose({
  updateChart,
  getChart,
  getDataURL,
  chart: computed(() => chart)
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
.pie-chart-container {
  position: relative;
  width: 100%;
  /* 确保容器有宽度 */

  .chart {
    height: v-bind('height');
    width: 100%;
    /* 确保图表有宽度 */
  }
}
</style>
