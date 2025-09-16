<template>
  <div ref="chartRef" class="gauge-container"></div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  height: { type: String, default: '200px' },
  width: { type: String, default: '100%' },
  value: { type: Number, required: true },
  max: { type: Number, required: true },
  title: { type: String, default: '' }
});

const chartRef = ref(null);
let chartInstance = null;

const renderChart = () => {
  const dom = chartRef.value;
  if (!dom) return;

  if (!chartInstance) {
    chartInstance = echarts.init(dom);
  }

  const { value, max, title } = props;
  const percent = props.percent || value / max;

  const boundingWidth = dom.clientWidth;
  const boundingHeight = dom.clientHeight;
  const parsePercent = (str, base) => (parseFloat(str) / 100) * base;

  const cx = parsePercent('50%', boundingWidth);
  const cy = parsePercent('70%', boundingHeight);
  const radius = Math.min(boundingWidth, boundingHeight) / 2;

  const angle = Math.PI * (1 - percent);
  const offsetX = Math.cos(angle) * (radius - 10);
  const offsetY = -Math.sin(angle) * (radius - 10);

  const minX = cx + Math.cos(Math.PI) * radius;
  const minY = cy - Math.sin(Math.PI) * radius;
  const maxX = cx + Math.cos(0) * radius;
  const maxY = cy - Math.sin(0) * radius;
  const fontFamily = 'Montserrat';

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max,
        radius: '100%',
        center: ['50%', '70%'],
        progress: {
          show: true,
          width: 25,
          roundCap: true,
          z: 2,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#1890ff' },
              { offset: 0.5, color: '#a64ddf' },
              { offset: 1, color: '#ff4d4f' }
            ])
          }
        },
        axisLine: {
          lineStyle: {
            width: 25,
            color: [[1, '#e0e0e0']]
          }
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        detail: {
          show: true,
          valueAnimation: true,
          offsetCenter: [0, '-30%'],
          z: 100,
          fontFamily,
          formatter: `${Math.round(percent * 100)}%\n ${title}`,
          fontSize: 24,
          color: '#111',
          lineHeight: 30
        },
        title: {
          show: true,
          offsetCenter: [0, '-30%'],
          fontFamily,
          fontSize: 24,
          z: 2000,
          color: 'red',
          formatter: () => 'test'
        },
        data: [{ value }]
      },
      {
        type: 'gauge',
        startAngle: 0,
        endAngle: 0,
        min: 0,
        max,
        radius: '100%',
        center: ['50%', '70%'],
        progress: {
          show: true,
          width: 25,
          roundCap: true,
          z: 1,
          itemStyle: {
            color: '#e0e0e0'
          }
        },
        axisLine: { show: false },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        detail: { show: false },
        data: [{ value: max - value }]
      },
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max,
        radius: '100%',
        center: ['50%', '70%'],
        pointer: { show: false },
        progress: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        z: 100,
        detail: {
          show: true,
          offsetCenter: [`${offsetX}px`, `${offsetY}px`],
          formatter: `{value}`,
          fontSize: 12,
          fontFamily,
          color: '#fff',
          fontWeight: 600,
          width: '10px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          // justifyContent: 'space-between',
          borderRadius: 24,
          backgroundColor: '#11191E',
          // boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
          border: '2px solid red'
        },
        data: [{ value }]
      }
    ],
    graphic: [
      {
        type: 'text',
        left: minX + 9,
        top: minY - 10,
        z: 1000,
        style: {
          text: '0',
          font: '600 12px Montserrat',
          fill: '#fff'
        }
      },
      {
        type: 'text',
        z: 1000,
        left: maxX - 24,
        top: maxY - 10,
        style: {
          text: String(max),
          font: '600 12px Montserrat',
          fill: '#fff'
        }
      }
    ]
  };

  chartInstance.setOption(option);
  chartInstance.resize();
};

onMounted(() => {
  nextTick(() => {
    const el = chartRef.value;
    if (!el) return;

    // 容器尚未渲染完成或尺寸未准备好，挂起初始化
    const initChart = () => {
      const { offsetWidth, offsetHeight } = el;
      if (offsetWidth === 0 || offsetHeight === 0) {
        requestAnimationFrame(initChart); // 等一帧再检测
      } else {
        chartInstance = echarts.init(el);
        renderChart();

        const resizeObserver = new ResizeObserver(() => {
          chartInstance?.resize();
          renderChart();
        });
        resizeObserver.observe(el);
      }
    };

    initChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderChart);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

watch(
  () => [props.value, props.max],
  () => {
    nextTick(() => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value);
        renderChart();

        const resizeObserver = new ResizeObserver(() => {
          chartInstance?.resize();
          renderChart(); // 重新计算位置等信息
        });

        resizeObserver.observe(chartRef.value);
      }
    });
  }
);
</script>

<style scoped>
.gauge-container {
  width: 100%;
  height: 100%;
  min-height: v-bind('height');
}

.gauge-container .echarts-title {
  display: block !important;
}
</style>
