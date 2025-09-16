<template>
  <div class="gradient-column-chart-container">
    <div v-if="!xAxisData.length" class="no-data">
      <span>No Data Available</span>
    </div>
    <div class="chart" ref="chartRef" :style="{ display: xAxisData.length > 0 ? 'block' : 'none' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
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
  // 渐变色起始颜色
  startColor: {
    type: String,
    default: '#409EFF'
  },
  // 渐变色结束颜色
  endColor: {
    type: String,
    default: '#a64ddf'
  },
  // 是否使用渐变色
  useGradient: {
    type: Boolean,
    default: true
  },
  // 图表标题
  title: {
    type: String,
    default: "Today's Passenger Flow"
  },
  // 是否显示标题
  showTitle: {
    type: Boolean,
    default: false
  },
  // 是否启用dataZoom
  enableDataZoom: {
    type: Boolean,
    default: false
  },
  // dataZoom初始显示的数据比例
  dataZoomStart: {
    type: Number,
    default: 0
  },
  // dataZoom结束显示的数据比例
  dataZoomEnd: {
    type: Number,
    default: 100
  },
  // 是否在小屏幕下自动隐藏标签
  autoHideLabelsOnSmallScreen: {
    type: Boolean,
    default: true
  }
});

const chartRef = ref(null);
let chart = null;

// 获取图表尺寸类别
const getChartSize = () => {
  if (!chartRef.value) return 'large';
  const width = chartRef.value.clientWidth;

  if (width < 300) return 'small';
  else if (width < 800) return 'medium';
  else return 'large';
};

// 判断是否需要隐藏标签（x轴和柱内label）
const shouldHideLabels = () => {
  // 如果数据量大于20，默认隐藏标签
  if (props.xAxisData.length > 20) return true;

  // 如果启用了dataZoom并且当前显示的数据范围大于阈值，也隐藏标签
  if (props.enableDataZoom && chart) {
    const dataZoomOption = chart.getOption().dataZoom;
    if (dataZoomOption && dataZoomOption.length > 0) {
      const start = dataZoomOption[0].start;
      const end = dataZoomOption[0].end;
      const visibleDataCount = Math.ceil((props.xAxisData.length * (end - start)) / 100);
      return visibleDataCount > 20;
    }
  }

  return false;
};

// 根据图表尺寸获取标签样式
const getLabelStyle = () => {
  if (shouldHideLabels()) {
    return {
      show: false
    };
  }
  const size = getChartSize();
  return {
    small: {
      show: !props.autoHideLabelsOnSmallScreen,
      fontSize: 4,
      distance: 2,
      fontWeight: 'normal'
    },
    medium: {
      show: true,
      fontSize: 10,
      distance: 8,
      fontWeight: 'bold'
    },
    large: {
      show: true,
      fontSize: 12,
      distance: 10,
      fontWeight: 'bold'
    }
  }[size];
};

// 处理dataZoom事件
const handleDataZoom = (params) => {
  if (!chart) return;

  // 获取当前dataZoom的状态
  const dataZoomOption = chart.getOption().dataZoom;
  if (!dataZoomOption || dataZoomOption.length === 0) return;

  const start = dataZoomOption[0].start;
  const end = dataZoomOption[0].end;

  // 计算当前可见的数据点数量
  const visibleDataCount = Math.ceil((props.xAxisData.length * (end - start)) / 100);

  // 根据可见数据点数量决定是否显示标签
  const showLabels = visibleDataCount <= 20;

  // 更新图表配置
  const option = chart.getOption();

  // 更新X轴标签显示
  if (option.xAxis && option.xAxis.length > 0) {
    const size = getChartSize();
    if (showLabels) {
      // 显示标签，根据图表尺寸设置样式
      option.xAxis[0].axisLabel = {
        ...axisLabel,
        show: true,
        fontSize: size === 'small' ? 6 : size === 'medium' ? 7 : 8,
        interval: visibleDataCount > 12 ? 'auto' : 0,
        rotate: visibleDataCount > 12 ? (size === 'small' ? 30 : 15) : 0
      };
    } else {
      // 隐藏标签
      option.xAxis[0].axisLabel = { show: false };
    }
  }

  // 更新柱状图内部标签显示
  if (option.series && option.series.length > 0) {
    option.series.forEach((series) => {
      if (series.type === 'bar') {
        if (showLabels) {
          const labelStyle = getLabelStyle();
          series.label = {
            ...series.label,
            show: labelStyle.show,
            fontSize: labelStyle.fontSize,
            distance: labelStyle.distance,
            fontWeight: labelStyle.fontWeight
          };
        } else {
          series.label = { show: false };
        }
      }
    });
  }

  // 应用更新后的配置
  chart.setOption(option, true);
};

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
      barGap: '10%',
      label: {
        show: true,
        position: 'insideTop', // 改为inside显示在柱子内部
        distance: 10, // 调整与柱子边缘的距离
        formatter: '{c}' + (props.yAxis.unit || ''),
        color: '#FFFFFF',
        fontFamily: 'Montserrat',
        ...getLabelStyle()
      },
      data: series.data.map((value, index) => {
        if (typeof value === 'object' && value !== null) {
          return value;
        }

        // 创建渐变色
        const itemStyle = props.useGradient
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 1, color: '#fff' },
                { offset: 0, color: series.itemStyle?.color || getDefaultColor(index) }
              ]),
              borderRadius: props.borderRadius
            }
          : {
              color: series.itemStyle?.color || getDefaultColor(index),
              borderRadius: props.borderRadius
            };

        return {
          value,
          itemStyle
        };
      })
    };
  });

  option.series = processedSeries;
  chart.setOption(option);

  // 添加dataZoom事件监听
  chart.on('datazoom', handleDataZoom);
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
  const colors = ['#0099FF', '#FF384C', '#00BA4A', '#EDB601', '#909399', '#E6A23C'];
  return colors[index % colors.length];
};

const getTop = () => {
  if (props.showTitle) {
    return props.showLegend ? '70px' : '50px';
  } else {
    return props.showLegend ? '40px' : '20px';
  }
};

// 创建基础图表配置
const createBaseOption = () => {
  // 根据图表尺寸调整x轴标签
  const size = getChartSize();
  const hideLabels = shouldHideLabels();
  const xAxisLabelConfig = hideLabels
    ? { show: false }
    : {
        small: {
          ...axisLabel,
          fontSize: 6,
          interval: props.xAxisData.length > 12 ? 'auto' : 0,
          rotate: props.xAxisData.length > 12 ? 30 : 0
        },
        medium: {
          ...axisLabel,
          fontSize: 7,
          interval: props.xAxisData.length > 20 ? 'auto' : 0,
          rotate: props.xAxisData.length > 20 ? 15 : 0
        },
        large: {
          ...axisLabel,
          interval: 0,
          rotate: 0
        }
      }[size];

  // 创建dataZoom配置
  const dataZoom = props.enableDataZoom
    ? [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: props.dataZoomStart,
          end: props.dataZoomEnd,
          height: 20,
          bottom: 0,
          borderColor: 'transparent',
          backgroundColor: 'rgba(47, 69, 84, 0.1)',
          dataBackground: {
            lineStyle: {
              color: '#409EFF',
              width: 1
            },
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.2)'
            }
          },
          fillerColor: 'rgba(64, 158, 255, 0.1)',
          handleStyle: {
            color: '#409EFF',
            borderColor: '#409EFF'
          },
          textStyle: {
            color: 'rgba(17, 25, 30, 0.40)',
            fontSize: 10
          }
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: props.dataZoomStart,
          end: props.dataZoomEnd,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true
        }
      ]
    : [];

  return {
    title: {
      show: props.showTitle,
      text: props.showTitle ? props.title : '',
      left: 'center',
      top: 0,
      textStyle: {
        color: '#11191E',
        fontFamily: 'Montserrat',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
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
          if (param.value !== '-') {
            const color = param.color.colorStops ? param.color.colorStops[0].color : param.color;

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
      top: props.showTitle ? 30 : 10,
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
      left: '3%',
      right: '4%',
      bottom: props.enableDataZoom ? '40px' : '3%',
      top: getTop(),
      containLabel: true
    },
    dataZoom,
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      },
      axisLabel: xAxisLabelConfig,
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      nameLocation: 'middle',
      nameGap: 30,
      name: props.yAxis.name,
      min: props.yAxis.min,
      max: props.yAxis.max,
      interval: props.yAxis.interval,
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
    series: []
  };
};

// 更新图表
const updateChart = () => {
  if (!chart) return;

  // 创建基础配置
  const option = createBaseOption();

  // 处理系列数据
  const processedSeries = props.series.map((series) => {
    return {
      ...series,
      type: 'bar',
      barWidth: props.barWidth,
      barGap: '10%',
      label: {
        show: true,
        position: 'insideTop',
        distance: 10,
        formatter: '{c}' + (props.yAxis.unit || ''),
        color: '#FFFFFF',
        fontFamily: 'Montserrat',
        ...getLabelStyle()
      },
      data: series.data.map((value, index) => {
        if (typeof value === 'object' && value !== null) {
          return value;
        }

        // 创建渐变色
        const itemStyle = props.useGradient
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 1, color: '#fff' },
                { offset: 0, color: series.itemStyle?.color || getDefaultColor(index) }
              ]),
              borderRadius: props.borderRadius
            }
          : {
              color: series.itemStyle?.color || getDefaultColor(index),
              borderRadius: props.borderRadius
            };

        return {
          value,
          itemStyle
        };
      })
    };
  });

  option.series = processedSeries;

  // 使用 setOption 的第二个参数设置为 true，表示不合并之前的选项
  chart.setOption(option, true);
};

// 监听属性变化
watch(() => props.series, updateChart, { deep: true });
watch(() => props.yAxis, updateChart, { deep: true });
watch(() => props.xAxisData, updateChart, { deep: true });
watch(() => props.chartLegend, updateChart, { deep: true });
watch(() => props.startColor, updateChart);
watch(() => props.endColor, updateChart);
watch(() => props.useGradient, updateChart);
watch(() => props.title, updateChart);
watch(() => props.showTitle, updateChart);
watch(() => props.enableDataZoom, updateChart);
watch(() => props.dataZoomStart, updateChart);
watch(() => props.dataZoomEnd, updateChart);
watch(() => props.autoHideLabelsOnSmallScreen, updateChart);

// 监听窗口大小变化
const handleResize = () => {
  if (!chart) return;
  chart.resize();
  // 在resize后重新应用配置，确保标签和轴标签根据新尺寸调整
  updateChart();
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
    // 移除事件监听
    chart.off('datazoom', handleDataZoom);
    chart.dispose();
    chart = null;
  }
});

defineExpose({
  updateChart,
  getChartSize
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/chart.scss';
.gradient-column-chart-container {
  position: relative;

  .chart {
    height: v-bind('height');
  }
}
</style>
