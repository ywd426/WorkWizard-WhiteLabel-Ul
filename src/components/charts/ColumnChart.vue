<template>
  <div class="column-chart-container">
    <div v-if="!xAxisData.length" class="no-data">
      <span>No Data Available</span>
    </div>
    <div class="chart" ref="chartRef" :style="{ display: xAxisData.length > 0 ? 'block' : 'none' }"></div>
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
  // x轴数据
  xAxisData: {
    type: Array,
    default: () => []
  },
  // y轴配置
  yAxis: {
    type: Object,
    default: () => ({
      name: '',
      unit: '',
      min: null,
      max: null,
      interval: null
    })
  },
  yAxisRight: {
    type: Object,
    default: () => ({
      name: '',
      unit: '',
      min: null,
      max: null,
      interval: null,
      show: false // 是否显示右侧Y轴
    })
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: true
  },
  // 图表高度
  height: {
    type: String,
    default: '300px'
  },
  // 标记线
  markLines: {
    type: Array,
    default: () => []
  },
  // 柱状图宽度
  barWidth: {
    type: String,
    default: '40%'
  },
  // 柱状图圆角
  borderRadius: {
    type: Array,
    default: () => [4, 4, 0, 0]
  },
  // 图例位置偏移
  legendOffset: {
    type: Number,
    default: 0
  }
});

const chartRef = ref(null);
let chart = null;

const legendPosition = computed(() => {
  if (!props.legendOffset) {
    return '50%';
  }
  return `calc(50% + ${props.legendOffset}px)`;
});

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);

  // 创建基础配置
  const option = createBaseOption();

  // 处理系列数据
  const processedSeries = props.series.map((series) => {
    return {
      ...series,
      type: 'bar',
      barWidth: props.barWidth,
      data: series.data.map((value, index) => {
        if (typeof value === 'object' && value !== null) {
          return value;
        }
        return {
          value,
          itemStyle: {
            color: series.itemStyle?.color || getDefaultColor(index),
            borderRadius: props.borderRadius
          }
        };
      })
    };
  });

  option.series = processedSeries;

  // 添加标记线
  addMarkLines(option);

  chart.setOption(option);
};

const axisLabel = {
  color: 'rgba(17, 25, 30, 0.40)',
  fontFamily: 'Montserrat',
  fontSize: 8,
  fontWeight: 600,
  lineHeight: 14
};

const nameTextStyle = {
  color: '#11191E',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontFamily: 'Montserrat',
  fontSize: 14,
  lineHeight: 16
};

// 获取默认颜色
const getDefaultColor = (index) => {
  const colors = ['#00BA4A', '#EDB601', '#FF384C', '#409EFF', '#909399', '#E6A23C'];
  return colors[index % colors.length];
};

const getColor = (item) => {
  if (item.itemStyle && item.itemStyle.color) {
    return item.itemStyle.color;
  }
  if (item.color?.colorStops) {
    return item.color?.colorStops[0]?.color;
  }
  return item.color;
};

// 创建基础图表配置
const createBaseOption = () => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        let result = '';

        if (params[0].axisValue) {
          result = `<div style="font-weight:bold; font-size:10px;line-height: 14px; display:flex;font-family: Montserrat; justify-content: center;">${params[0].axisValue}</div>`;
        }

        params.forEach((param) => {
          if (param.seriesName !== 'Warning' && param.seriesName !== 'Critical' && param.value !== '-') {
            // 查找对应的原始系列数据，获取正确的颜色
            const originalSeries = props.series.find((s) => s.name === param.seriesName);
            const color = originalSeries?.itemStyle?.color || getColor(param);

            result += `<div style="display:flex;align-items:center;justify-content:space-between;margin:5px 0;">
                            <div style="display:flex;align-items:center;">
                                <span style="width:8px;height:8px;border-radius:50%;background-color:#fff;border:2px solid ${color};margin-right:8px;"></span>
                                <span style="font-size:10px;line-height: 14px">${param.seriesName}</span>
                            </div>
                            <span style="font-weight:bold;font-size:12px;line-height: 16px;padding-left:8px;">${param.value}${props.yAxis.unit || ''}</span>
                        </div>`;
          }
        });
        return result;
      }
    },
    legend: {
      show: props.showLegend,
      top: 0,
      left: legendPosition.value,
      itemHeight: 10,
      data: props.chartLegend.map((item) => item.label),
      textStyle: {
        fontFamily: 'Montserrat',
        fontSize: 10,
        fontWeight: 500
      }
    },
    grid: {
      left: '3%',
      right: props.yAxisRight.show ? '8%' : '4%',
      bottom: '3%',
      top: props.showLegend ? '40px' : '20px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      },
      axisLabel: {
        ...axisLabel
      },
      splitLine: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: props.yAxis.name,
        min: props.yAxis.min,
        max: props.yAxis.max,
        interval: props.yAxis.interval,
        position: 'left',
        axisLine: {
          lineStyle: {
            color: 'rgba(17, 25, 30, 0.40)'
          }
        },
        axisLabel: {
          ...axisLabel,
          formatter: function (value) {
            return `${value}${props.yAxis.unit || ''}`;
          }
        },
        nameTextStyle,
        splitLine: {
          lineStyle: {
            color: '#EBEEF5',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: props.yAxisRight.name,
        min: props.yAxisRight.min,
        max: props.yAxisRight.max,
        interval: props.yAxisRight.interval,
        position: 'right',
        show: props.yAxisRight.show,
        axisLine: {
          lineStyle: {
            color: 'rgba(17, 25, 30, 0.40)'
          }
        },
        axisLabel: {
          ...axisLabel,
          formatter: function (value) {
            return `${value}${props.yAxisRight.unit || ''}`;
          }
        },
        nameTextStyle,
        splitLine: {
          show: false
        }
      }
    ],
    series: []
  };
};

// 添加标记线
const addMarkLines = (option) => {
  if (props.markLines && props.markLines.length > 0) {
    // 添加警告线
    const warningLine = props.markLines.find((line) => line.name === 'Warning');
    if (warningLine) {
      option.series.push(createMarkLineSeries('Warning', warningLine));
    }

    // 添加临界线
    const criticalLine = props.markLines.find((line) => line.name === 'Critical');
    if (criticalLine) {
      option.series.push(createMarkLineSeries('Critical', criticalLine));
    }
  }
};

// 创建标记线系列
const createMarkLineSeries = (name, lineConfig) => {
  return {
    name: name,
    type: 'line',
    data: [],
    markLine: {
      silent: true,
      symbol: ['none', 'none'],
      data: [
        {
          yAxis: lineConfig.value,
          lineStyle: lineConfig.lineStyle,
          label: {
            formatter: lineConfig.label.formatter,
            color: lineConfig.label.color || lineConfig.lineStyle.color,
            fontSize: 8,
            lineHeight: 14,
            fontFamily: 'Montserrat',
            fontWeight: 600,
            padding: [2, 4, 2, 4],
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            distance: -16
          }
        }
      ]
    }
  };
};

// 更新图表
const updateChart = () => {
  if (!chart) return;

  // 创建基础配置
  const option = {
    legend: {
      data: props.chartLegend.map((item) => item.label)
    },
    xAxis: {
      data: props.xAxisData
    },
    yAxis: {
      name: props.yAxis.name,
      min: props.yAxis.min,
      max: props.yAxis.max,
      interval: props.yAxis.interval
    },
    series: []
  };

  // 处理系列数据
  const processedSeries = props.series.map((series) => {
    return {
      ...series,
      type: 'bar',
      barWidth: props.barWidth,
      data: series.data.map((value, index) => {
        if (typeof value === 'object' && value !== null) {
          return value;
        }
        return {
          value,
          itemStyle: {
            color: series.itemStyle?.color || getDefaultColor(index),
            borderRadius: props.borderRadius
          }
        };
      })
    };
  });

  option.series = processedSeries;

  // 添加标记线
  addMarkLines(option);

  // 使用 setOption 的第二个参数设置为 true，表示不合并之前的选项
  chart.setOption(option, true);
};

// 监听属性变化
watch(() => props.series, updateChart, { deep: true });
watch(() => props.yAxis, updateChart, { deep: true });
watch(() => props.xAxisData, updateChart, { deep: true });
watch(() => props.markLines, updateChart, { deep: true });
watch(() => props.chartLegend, updateChart, { deep: true });

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

// 获取图表实例
const getChart = () => {
  return chart;
};

defineExpose({
  updateChart,
  getChart
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
.column-chart-container {
  position: relative;

  .chart {
    height: v-bind('height');
  }
}
</style>
