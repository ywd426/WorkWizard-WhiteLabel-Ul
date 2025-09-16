<template>
  <div class="line-chart-container">
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
    default: () => ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
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
  grid: {
    type: Object,
    default: () => ({})
  },
  // 标记线
  markLines: {
    type: Array,
    default: () => []
  },
  // 是否显示当前时间
  showCurrentTime: {
    type: Boolean,
    default: false
  },
  // 预测线分割点
  forecastSplitIndex: {
    type: Number,
    default: null
  },
  legendOffset: {
    type: Number,
    default: 0
  },
  middleLineValue: {
    type: String,
    default: ''
  }
});

const chartRef = ref(null);
let chart = null;

// 当前日期和时间
const currentDate = computed(() => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
});

const currentTime = computed(() => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
});
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
  const processedSeries = props.series.flat(); // 展平数组，因为Forecast会返回两个系列
  option.series = processedSeries;

  // 添加标记线
  addMarkLines(option);

  // 添加当前时间线
  addCurrentTimeLine(option);

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
// 创建基础图表配置
const createBaseOption = () => {
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const time = params[0].axisValue;
        let result = `<div style="font-weight:bold; font-size:10px;line-height: 14px; display:flex;font-family: Montserrat; justify-content: center;">${formatDateTime(time)}</div>`;

        params.forEach((param) => {
          if (
            param.seriesName !== 'Forecast (forecast)' &&
            param.seriesName !== 'Current Time' &&
            param.seriesName !== 'Warning' &&
            param.seriesName !== 'Critical' &&
            param.value !== '-' &&
            param.value != null
          ) {
            // 查找对应的原始系列数据，获取正确的颜色
            const originalSeries = props.series.find((s) => s.name === param.seriesName);
            const color = originalSeries ? originalSeries.lineStyle.color : param.color;

            result += `<div style="display:flex;align-items:center;justify-content:space-between;margin:5px 0;">
                    <div style="display:flex;align-items:center;">
                    <span style="width:8px;height:8px;border-radius:50%;background-color:#fff;border:2px solid ${color};margin-right:8px;"></span>
                    <span style="font-size:10px;line-height: 14px">${param.seriesName}</span>
                    </div>
                    <span style="font-weight:bold;font-size:12px;line-height: 16px;padding-left:8px;">${param.value}</span>
                </div>`;
          }
        });
        return result;
      }
    },
    legend: {
      show: props.showLegend,
      top: 0,
      left: 'center',
      itemHeight: 10,
      data: props.chartLegend.map((item) => item.label),
      textStyle: {
        fontFamily: 'Montserrat',
        fontSize: 10,
        fontWeight: 500
      }
    },
    grid: {
      left: props.grid?.left || '2%',
      right: props.grid?.right || '2%',
      bottom: '3%',
      top: props.showLegend ? '80px' : '30px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: props.xAxisData,
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      },
      axisLabel: {
        ...axisLabel,
        formatter: function (value) {
          if (value.includes('+1d')) {
            const baseTime = value.replace('+1d', '');
            return baseTime + '{sup|+1d}';
          }
          return value;
        },
        rich: {
          sup: {
            fontSize: 6,
            fontWeight: 500,
            verticalAlign: 'top',
            padding: [0, 0, 5, 0]
          }
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: '#EBEEF5',
          type: 'dashed'
        }
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
            color: '#EBEEF5'
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

// 添加当前时间垂直线
const addCurrentTimeLine = (option) => {
  if (props.showCurrentTime) {
    const middleIndex = props.xAxisData.findLastIndex((time) => time === props.middleLineValue);

    option.series.push({
      name: 'Current Time',
      type: 'line',
      data: [],
      markLine: {
        silent: true,
        symbol: ['none', 'none'],
        data: [
          {
            name: 'Current Time',
            xAxis: middleIndex,
            lineStyle: {
              color: '#000',
              type: 'dashed',
              width: 1
            },
            label: {
              show: true,
              position: 'middle',
              formatter: function () {
                return ``;
              },
              color: '#303133',
              fontSize: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: [2, 4],
              borderRadius: 2
            }
          }
        ]
      }
    });
  }
};

// 处理预测线
const processForecastSeries = (series) => {
  // 确定分割点
  const splitIndex = props.forecastSplitIndex || Math.floor(series.data.length / 2);

  // 实线部分
  const solidPart = {
    name: series.name,
    type: 'line',
    data: series.data.slice(0, splitIndex).concat(new Array(series.data.length - splitIndex).fill('-')),
    smooth: series.smooth,
    lineStyle: {
      color: series.lineStyle.color,
      width: series.lineStyle.width,
      type: 'solid'
    },
    itemStyle: series.itemStyle,
    symbol: series.symbol,
    symbolSize: series.symbolSize,
    connectNulls: true
  };

  // 虚线部分
  const dashedPart = {
    name: series.name + ' (forecast)',
    type: 'line',
    data: new Array(splitIndex).fill('-').concat(series.data.slice(splitIndex)),
    smooth: series.smooth,
    lineStyle: {
      color: series.lineStyle.color,
      width: series.lineStyle.width,
      type: 'dashed'
    },
    itemStyle: series.itemStyle,
    symbol: series.symbol,
    symbolSize: series.symbolSize,
    connectNulls: true
  };

  if (series.showShadow) {
    solidPart.areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: series.lineStyle.color + 'CC' // 80% 透明度
          },
          {
            offset: 1,
            color: series.lineStyle.color + '00' // 完全透明
          }
        ]
      }
    };

    dashedPart.areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: series.lineStyle.color + '66' // 40% 透明度
          },
          {
            offset: 1,
            color: series.lineStyle.color + '00' // 完全透明
          }
        ]
      }
    };
  }

  return [solidPart, dashedPart];
};

// 更新图表
const updateChart = () => {
  if (!chart) return;

  // 创建基础配置
  const option = createBaseOption(); // 使用完整的基础配置而不是部分配置

  // 处理系列数据
  let processedSeries = [];
  console.log(props, 'props.series');

  // 过滤掉原有的标记线系列
  props.series.forEach((series) => {
    if (series.name !== 'Warning' && series.name !== 'Critical' && series.name !== 'Current Time') {
      // 处理预测线
      if (series.name === 'Forecast') {
        const forecastParts = processForecastSeries(series);
        processedSeries.push(...forecastParts);
      } else {
        processedSeries.push(series);
      }
    }
  });

  option.series = processedSeries;

  // 添加标记线
  addMarkLines(option);

  // 添加当前时间线
  addCurrentTimeLine(option);

  // 使用 setOption 的第二个参数设置为 false，表示合并之前的选项
  chart.setOption(option, false);

  // 确保图表尺寸正确
  chart.resize();
};
// 将时间字符串转换为完整的日期时间格式
const formatDateTime = (timeStr) => {
  const today = new Date();
  const year = today.getFullYear();

  // 处理带有+1的时间（第二天）
  let isNextDay = false;
  let time = timeStr;

  if (timeStr.includes('+1')) {
    isNextDay = true;
    time = timeStr.replace('+1', '');
  }

  // 转换时间
  let hour;
  if (time.includes('AM')) {
    hour = parseInt(time.replace('AM', ''));
    if (hour === 12) hour = 0; // 12AM 是 00:00
  } else if (time.includes('PM')) {
    hour = parseInt(time.replace('PM', ''));
    if (hour !== 12) hour = hour + 12; // 12PM 是 12:00，其他需要+12
  } else {
    hour = parseInt(time);
  }

  // 如果是第二天，增加一天
  let targetDate = new Date(year, today.getMonth(), today.getDate());
  if (isNextDay) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const targetYear = targetDate.getFullYear();
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const targetDay = String(targetDate.getDate()).padStart(2, '0');

  return `${targetYear}-${targetMonth}-${targetDay} ${String(hour).padStart(2, '0')}:00:00`;
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

defineExpose({
  updateChart
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
.line-chart-container {
  position: relative;
  width: 100%;

  .chart-info {
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 1;

    .current-date {
      font-size: 12px;
      color: #606266;
    }

    .current-time {
      font-size: 14px;
      font-weight: bold;
      color: #303133;
    }
  }

  .chart {
    height: v-bind('height');
  }
}
</style>
