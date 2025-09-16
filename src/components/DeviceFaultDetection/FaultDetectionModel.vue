<template>
  <div ref="p2" class="p-2">
    <el-row :gutter="20">
      <el-col :span="15">
        <el-row class="main-block">
          <el-row class="title-bg">
            <span class="view-title">Detection accuracy</span>
          </el-row>
          <el-row style="width: 100%; height: 228px">
            <el-col :span="24" style="display: flex">
              <div style="width: 228px; height: auto">
                <div ref="chartDomAccuracyPie" class="chartDom"></div>
              </div>
              <div style="flex: 1; display: flex; align-items: center">
                <el-col :span="8" class="block-info">
                  <el-col :span="24" class="common-log">
                    <el-row class="log-top"><span>False Alarms</span></el-row>
                    <el-row class="log-middle">
                      <span>6</span>
                    </el-row>
                    <el-row class="total-row">
                      <el-row><svg-icon icon-class="log-total" class-name="total-svg"></svg-icon></el-row>
                    </el-row>
                    <el-row class="vertical-line">
                      <div></div>
                    </el-row>
                  </el-col>
                </el-col>
                <el-col :span="8" class="block-info">
                  <el-col :span="24" class="common-log">
                    <el-row class="log-top"><span>Missed Faults</span></el-row>
                    <el-row class="log-middle">
                      <span>32</span>
                    </el-row>
                    <el-row class="total-row">
                      <el-row><svg-icon icon-class="rule-total" class-name="total-svg"></svg-icon></el-row>
                    </el-row>
                    <el-row class="vertical-line">
                      <div></div>
                    </el-row>
                  </el-col>
                </el-col>
                <el-col :span="8" class="block-info">
                  <el-col :span="24" class="common-log">
                    <el-row class="log-top"><span>False Detections</span></el-row>
                    <el-row class="log-middle">
                      <span>2</span>
                    </el-row>
                    <el-row class="total-row">
                      <el-row><svg-icon icon-class="equipment-total" class-name="total-svg"></svg-icon></el-row>
                    </el-row>
                    <el-row class="vertical-line">
                      <div></div>
                    </el-row>
                  </el-col>
                </el-col>
              </div>
            </el-col>
          </el-row>
        </el-row>
      </el-col>
      <el-col :span="9">
        <el-row class="main-block">
          <el-row class="title-bg">
            <span class="view-title">Pie Chart for Prediction Accuracy</span>
          </el-row>
          <el-row style="width: 100%; height: 228px">
            <el-col :span="24">
              <div ref="chartRightDomPie" class="chartDom"></div>
            </el-col>
          </el-row>
        </el-row>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px">
      <el-row class="main-block">
        <el-row class="title-bg">
          <span class="view-title">Bar Chart for Historical Prediction Rate</span>
          <el-select v-model="statisticsType" placeholder="" class="data-select" @change="changeStatistic()">
            <el-option v-for="item in dateRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-row>
        <el-row style="width: 100%; height: 420px">
          <el-col :span="24">
            <div ref="chartDomBar" class="chartDom"></div>
          </el-col>
        </el-row>
      </el-row>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import * as echarts from 'echarts';
interface Props {
  config: {
    name: string;
    severity: string;
    type: string;
  };
}
const props = defineProps<Props>();
const statisticsType = ref(1);

const dateRanges = ref([
  { 'id': 0, 'name': 'In The past 3 month' },
  { 'id': 1, 'name': 'In The past 6 month' },
  { 'id': 2, 'name': 'In The past 12 month' }
]);

const chartDomAccuracyPie = ref<HTMLDivElement>(null);
const chartRightDomPie = ref<HTMLDivElement>(null);
const chartDomBar = ref<HTMLDivElement>(null);

let chartInstanceA: echarts.EChartsType = null;
const optionA = ref();
let chartInstanceB: echarts.EChartsType = null;
const optionB = ref();
let chartInstanceC: echarts.EChartsType = null;
const optionC = ref();
interface PieLogForm {
  eventLogs: number;
  operationLogs: number;
  manualLogs: number;
  automaticLogs: number;
}
interface PieForm {
  solvedNum: number;
  unresolvedNum: number;
  falseDetections: number;
}
const pieLogData = ref<PieLogForm>();
const pieRightData = ref<PieForm>();
interface TrendModel {
  dateList: string[];
  seriesOneData: number[];
}

const groupSensorTrend = ref<TrendModel>();
const createPieAChart = () => {
  const maxNum = 100;
  chartInstanceA.setOption({
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: maxNum,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1EA5FF' },
              { offset: 1, color: '#AADDFF' }
            ],
            globalCoord: false
          }
        },
        progress: {
          show: true,
          width: 20
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 20
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: false,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, 0],
          fontSize: 20,
          fontWeight: 'bolder',
          formatter: function (value) {
            return ((value / maxNum) * 100).toFixed(0) + '%';
          },
          color: 'inherit'
        },
        data: [
          {
            value: pieLogData.value.manualLogs
          }
        ]
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 180,
        endAngle: 0,
        radius: '45%',
        min: 0,
        max: maxNum,
        itemStyle: {
          color: '#E7EDFF'
        },
        progress: {
          show: true,
          width: 2
        },
        pointer: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          formatter: function (value) {
            return 'Accuracy Score';
          },
          show: true,
          width: '50%',
          fontSize: 14,
          offsetCenter: [0, '70%'],
          color: '#71797E',
          textStyle: {
            fontWeight: '300'
          },
          lineHeight: 16
        },
        data: [
          {
            value: maxNum
          }
        ]
      }
    ]
  });
};
const createPieBChart = () => {
  let totalNum = pieRightData.value.solvedNum + pieRightData.value.unresolvedNum + pieRightData.value.falseDetections;
  chartInstanceB.setOption({
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return params.name + ': ' + params.value;
      }
    },
    legend: {
      top: 'center',
      left: 'right',
      itemWidth: 20, // 图例标记的宽度
      itemHeight: 5, // 图例标记的高度
      orient: ''
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        center: ['30%', '50%'],
        radius: ['70%', '90%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: function (params) {
            return 'Total number\nof faults\n{high|' + totalNum + '}';
          },
          rich: {
            high: {
              height: 30,
              color: '#11191E',
              fontWeight: '600',
              fontSize: 20
            }
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: pieRightData.value.solvedNum,
            name: 'Correct Detection',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#B2E0FF' }, // 起始颜色
                  { offset: 1, color: '#19A3FF' } // 结束颜色
                ],
                globalCoord: false
              }
            }
          },
          {
            value: pieRightData.value.unresolvedNum,
            name: 'Missed Faults',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#F4E1A2' }, // 起始颜色
                  { offset: 1, color: '#EDB601' } // 结束颜色
                ],
                globalCoord: false
              }
            }
          },
          {
            value: pieRightData.value.falseDetections,
            name: 'False Detections',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#FFB5BC' }, // 起始颜色
                  { offset: 1, color: '#FF384C' } // 结束颜色
                ],
                globalCoord: false
              }
            }
          }
        ]
      },
      {
        type: 'pie',
        center: ['30%', '50%'],
        radius: ['60%', '64%'], // 内圆的半径比外圆的半径要小
        label: {
          show: false
        },
        tooltip: {
          show: false
        },
        itemStyle: {
          color: '#E7EDFF'
        },
        hoverAnimation: false,
        data: [100] // 使用一个数据项来绘制内圆
      }
    ]
  });
};
const createPieCChart = () => {
  const rawData = [groupSensorTrend.value.seriesOneData];
  const clorData = [
    ['#FFFFFF', '#0099FF'],
    ['#FFFFFF', '#A2AAAF']
  ];
  const grid = {
    left: 32,
    right: 32,
    top: 70,
    bottom: 0,
    containLabel: true
  };
  const series = ['Active Sensor'].map((name, sid) => {
    return {
      name,
      type: 'bar',
      stack: 'total',
      barWidth: '30%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 1,
          x2: 0,
          y2: 0,
          colorStops: [
            { offset: 0, color: clorData[sid][0] },
            { offset: 1, color: clorData[sid][1] }
          ],
          globalCoord: false
        },
        borderRadius: [200, 200, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%', // 显示数值
        distance: 10
      },
      data: rawData[sid]
    };
  });
  chartInstanceC.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = `<span>${params[0].name}</span>`;
        params.forEach((item) => {
          result += `
            <div style="display: flex; justify-content: space-between;">
                <span>${item.marker}${item.seriesName}</span>
                <span style="text-align: right;margin-left:10px;font-weight:600;">${item.data}</span>
            </div>
        `;
        });
        return result;
      }
    },
    title: [
      {
        subtext: 'Prediction Accuracy %'
      }
    ],
    grid,
    yAxis: {
      type: 'value'
    },
    xAxis: {
      type: 'category',
      'axisLabel': {
        'margin': 16
      },
      data: groupSensorTrend.value.dateList
    },
    series
  });
};
const changeStatistic = () => {};
onMounted(async () => {
  pieLogData.value = {
    eventLogs: 10,
    operationLogs: 2,
    manualLogs: 90,
    automaticLogs: 2
  };
  pieRightData.value = {
    solvedNum: 10,
    unresolvedNum: 2,
    falseDetections: 4
  };
  groupSensorTrend.value = {
    dateList: ['May', 'June', 'July', 'August', 'September', 'October'],
    seriesOneData: [10, 2, 4, 6, 8, 18]
  };
  await nextTick(() => {
    chartInstanceA = echarts.init(chartDomAccuracyPie.value);
    chartInstanceB = echarts.init(chartRightDomPie.value);
    chartInstanceC = echarts.init(chartDomBar.value);
    createPieAChart();
    createPieBChart();
    createPieCChart();
  });
});
</script>
<style scoped>
.main-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}
.main-block {
  width: 100%;
  border: 1px solid var(--el-base-border-color);
  border-radius: 8px;
}
.title-bg {
  width: 100%;
  height: 48px;
  background-color: var(--el-title-background-color);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.view-title {
  margin-left: 20px;
  font-weight: 600;
  font-size: 18px;
  line-height: 16px;
}
.chartDom {
  width: 100%;
  height: calc(100% - 10px);
  padding: 10px 0;
  position: initial !important;
}
.block-info {
  height: 100%;
  display: flex;
  align-items: center;
}
.common-log {
  position: relative;
  padding-left: 25px;
}
.log-top {
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  color: var(--el-text-color-b12);
}
.log-middle {
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  margin-top: 15px;
  margin-bottom: 20px;
}
.total-row {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
}
.total-svg {
  width: 50px;
  height: 50px;
}
.data-select {
  width: 204px;
  margin-right: 16px;
  height: 26px;
  border-radius: 4px;
  color: var(--colors-base-primary);
}
</style>
