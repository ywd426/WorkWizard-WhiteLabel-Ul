<template>
  <el-row style="width: 100%">
    <el-row style="width: 100%">
      <el-col :span="15" style="padding-right: 10px">
        <el-row class="main-block">
          <el-col :span="24" class="title-bg">
            <span class="view-title line">Alert Snapshot</span>
            <el-select v-model="reginType" placeholder="" class="data-select" @change="changeStatistic()">
              <el-option v-for="item in dateRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-col>
          <el-col v-loading="sensorLoading" :span="24" style="padding: 20px 32px">
            <el-row style="margin-bottom: 20px; display: flex; align-items: center">
              <span class="total-data-num">{{ alarmStatistics }}</span>
              <div style="flex: 1; margin-left: 16px">
                <el-col class="total-data-title"> Number of Alerts </el-col>
                <el-col class="total-data-subtitle"> Total Alerts: {{ statisticsData.totalData }} </el-col>
              </div>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-row class="detail-data-block">
                  <el-col :span="24" style="display: flex; justify-content: space-between; align-items: center">
                    <span class="data-value">{{ statisticsData.activeData.currentData }}</span
                    ><svg-icon icon-class="total_alert" class-name="total-svg"></svg-icon>
                  </el-col>
                  <el-col :span="24">
                    <el-row><span class="total-data-title">Number of Sensors with Alerts</span></el-row>
                    <el-row style="display: flex; justify-content: space-between; align-items: center">
                      <span class="total-data-desc">{{ comparedMsg }}</span>
                      <div
                        class="detail-data-trend"
                        :class="
                          statisticsData.activeData.currentData >= statisticsData.activeData.previousData ? 'detail-success-bg' : 'detail-warn-bg'
                        "
                      >
                        <svg-icon
                          :icon-class="statisticsData.activeData.currentData >= statisticsData.activeData.previousData ? 'increase' : 'decrease'"
                          class-name="log-svg"
                        ></svg-icon>
                        <span class="trend-value">{{
                          Math.abs(statisticsData.activeData.currentData - statisticsData.activeData.previousData)
                        }}</span>
                      </div>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="12">
                <el-row class="detail-data-block">
                  <el-col :span="24" style="display: flex; justify-content: space-between; align-items: center">
                    <span class="data-value">{{ statisticsData.inactiveData.currentData }}</span
                    ><svg-icon icon-class="unresolved_alert" class-name="total-svg"></svg-icon>
                  </el-col>
                  <el-col :span="24">
                    <el-row><span class="total-data-title">Number of Unresolved Alerts</span></el-row>
                    <el-row style="display: flex; justify-content: space-between; align-items: center">
                      <span class="total-data-desc">{{ comparedMsg }}</span>
                      <div
                        class="detail-data-trend"
                        :class="
                          statisticsData.inactiveData.currentData >= statisticsData.inactiveData.previousData ? 'detail-success-bg' : 'detail-warn-bg'
                        "
                      >
                        <svg-icon
                          :icon-class="statisticsData.inactiveData.currentData >= statisticsData.inactiveData.previousData ? 'increase' : 'decrease'"
                          class-name="log-svg"
                        ></svg-icon>
                        <span class="trend-value">
                          {{ Math.abs(statisticsData.inactiveData.currentData - statisticsData.inactiveData.previousData) }}
                        </span>
                      </div>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="9" style="padding-left: 10px">
        <el-row class="main-block" style="height: 100%">
          <el-col :span="24" class="title-bg">
            <span class="view-title line">Severity Distribution</span>
            <el-select v-model="reginSensorType" placeholder="" class="data-select" @change="changeBreakdown()">
              <el-option v-for="item in dateRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-col>
          <el-col :span="24" style="height: calc(100% - 48px)">
            <div ref="chartDomRightGauge" class="chartDom"></div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row style="width: 100%; margin: 20px 0">
      <el-col :span="15" style="padding-right: 10px">
        <el-row class="main-block">
          <el-col :span="24" class="title-bg">
            <span class="view-title line">Number of Alerts and Number of Sensors with Alerts Over Time</span>
            <el-select v-model="reginAllOverTimeType" placeholder="" class="data-select" @change="changeAllOverTime()">
              <el-option v-for="item in dateTrendRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-col>
          <el-col :span="24" style="height: 264px">
            <div ref="chartDomLeftLine" class="chartDom"></div>
          </el-col>
        </el-row>
        <el-row class="main-block">
          <el-col :span="24" class="title-bg">
            <span class="view-title line">Number of Unresolved and Resolved Alerts Over Time</span>
            <el-select v-model="reginUnresolvedAlertType" placeholder="" class="data-select" @change="changeUnresolvedAlertTime()">
              <el-option v-for="item in dateTrendRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-col>
          <el-col :span="24" style="height: 264px">
            <div ref="chartDomLeftBar" class="chartDom"></div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="9" style="padding-left: 10px">
        <el-row class="main-block">
          <el-col :span="24" class="title-bg">
            <span class="view-title line">Number of Alerts By Sensors</span>
            <el-select v-model="reginPartOverTimeType" placeholder="" class="data-select" @change="changePartOverTime()">
              <el-option v-for="item in dateTrendRanges" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-col>
          <el-col :span="24">
            <el-table ref="tableRef" style="height: 512px" stripe :data="sensorAlertRankList">
              <el-table-column prop="sensorId" label="ID" align="center" width="140"></el-table-column>
              <el-table-column prop="sensorName" label="Name" align="center"></el-table-column>
              <el-table-column prop="equipmentName" label="Equipment" align="center"></el-table-column>
              <el-table-column prop="num" label="Num.Alerts" align="center" width="160"> </el-table-column>
            </el-table>
            <pagination
              v-if="total > 0"
              v-model:total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              class="pagination"
              @pagination="getList"
            />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-row>
</template>
<script setup lang="ts">
import * as echarts from 'echarts';
import { DataModel } from '@/api/monitor/sensormanage/types';
import {
  queryAlertStatistics,
  queryDayAlertAndSensorNumber,
  queryAlertSeverityNumber,
  queryAlertSensorRanking,
  queryDayAlertStatus,
  getAlarmStatistics
} from '@/api/monitor/sensormanage';
let chartInstancePie: echarts.EChartsType = null;
let chartInstanceLine: echarts.EChartsType = null;
let chartInstanceBar: echarts.EChartsType = null;
const chartDomRightGauge = ref<HTMLDivElement>(null);
const chartDomLeftLine = ref<HTMLDivElement>(null);
const chartDomLeftBar = ref<HTMLDivElement>(null);
const comparedMsg = ref('Compared to last month');
const reginType = ref(2);
const reginSensorType = ref(2);
const reginAllOverTimeType = ref(2);
const reginUnresolvedAlertType = ref(2);
const reginPartOverTimeType = ref(2);
const alarmStatistics = ref(0);
const sensorLoading = ref(true);
const dateRanges = ref([
  { 'id': 0, 'name': 'Last Day' },
  { 'id': 1, 'name': 'Last 7 day' },
  { 'id': 2, 'name': 'Last 30 day' }
]);
const dateTrendRanges = ref([
  { 'id': 1, 'name': 'Last 7 day' },
  { 'id': 2, 'name': 'Last 30 day' }
]);
const severityData = ref([0, 0, 0]);
interface StatisticsData {
  totalData: number;
  activeData: DataModel;
  inactiveData: DataModel;
}
const initStatisticsData: StatisticsData = {
  totalData: 0,
  activeData: {
    currentData: 0,
    previousData: 0
  },
  inactiveData: {
    currentData: 0,
    previousData: 0
  }
};
//统计数据
const statisticsData = ref<StatisticsData>(initStatisticsData);
interface SensorAlertForm {
  sensorId: string;
  equipmentName: string;
  sensorName: string;
  num: number;
}
const total = ref(0);
const queryParams = ref<PageQuery>({ pageSize: 10, pageNum: 1 });
const sensorAlertRankList = ref<SensorAlertForm[]>([]);

const optionLineXData = ref<string[]>([]);
const alertSeriesData = ref([]);
const sensorSeriesData = ref([]);

const optionLineXStatusData = ref<string[]>([]);
const resolvedSeriesData = ref([]);
const unresolvedSeriesData = ref([]);
const changeStatistic = () => {
  if (reginType.value === 0) {
    comparedMsg.value = 'Compared to yesterday';
  } else if (reginType.value === 1) {
    comparedMsg.value = 'Compared to last week';
  } else if (reginType.value === 2) {
    comparedMsg.value = 'Compared to last month';
  }
  getAlertStatistics();
};
const changeBreakdown = () => {
  getAlertSeverityNumber();
};
const changeAllOverTime = () => {
  getDayAlertAndSensorNumber();
};
const changeUnresolvedAlertTime = () => {
  getDayAlertStatus();
};
const changePartOverTime = () => {
  getAlertSensorRanking();
};
const createLineChart = () => {
  chartInstanceLine.setOption({
    'grid': {
      'top': '30',
      'left': '32',
      'right': '46',
      'bottom': '0',
      'containLabel': true
    },
    'legend': {
      'show': 'true',
      'top': '10',
      'left': 'center'
    },
    'tooltip': {
      'trigger': 'axis'
    },
    'xAxis': {
      'type': 'category',
      'axisLabel': {
        'margin': 16
      },
      'data': optionLineXData.value
    },
    'yAxis': [
      {
        'type': 'value',
        'name': 'Number of Alerts',
        'axisLabel': {
          'formatter': '{value}'
        }
      },
      {
        'type': 'value',
        'name': 'Number of Sensors',
        'position': 'right',
        'axisLabel': {
          'formatter': '{value}'
        }
      }
    ],
    'series': [
      {
        'type': 'line',
        'name': 'Number of Alerts',
        'smooth': true,
        'showSymbol': false,
        'itemStyle': {
          'type': 'solid',
          'color': '#0099FF'
        },
        'data': alertSeriesData.value,
        'areaStyle': {
          'opacity': 0.2,
          'color': {
            'colorStops': [
              {
                'offset': 0,
                'color': '#0099FF'
              },
              {
                'offset': 1,
                'color': '#ffffff'
              }
            ],
            'x': 0,
            'y': 0,
            'x2': 0,
            'y2': 1,
            'type': 'linear',
            'global': false
          }
        }
      },
      {
        'type': 'line',
        'yAxisIndex': 1,
        'name': 'Number of Sensors with Alerts',
        'smooth': true,
        'showSymbol': false,
        'itemStyle': {
          'type': 'solid',
          'color': '#944DFF'
        },
        'data': sensorSeriesData.value,
        'areaStyle': {
          'opacity': 0.2,
          'color': {
            'colorStops': [
              {
                'offset': 0,
                'color': '#944DFF'
              },
              {
                'offset': 1,
                'color': '#ffffff'
              }
            ],
            'x': 0,
            'y': 0,
            'x2': 0,
            'y2': 1,
            'type': 'linear',
            'global': false
          }
        }
      }
    ]
  });
};
const createBarChart = () => {
  const rawData = [unresolvedSeriesData.value, resolvedSeriesData.value];
  const clorData = [
    ['#FFFFFF', '#0099FF'],
    ['#FFFFFF', '#FF384C']
  ];
  const grid = {
    left: 32,
    right: 32,
    top: 70,
    bottom: 0,
    containLabel: true
  };
  const series = ['Unresolved Alerts', 'Resolved Alerts'].map((name, sid) => {
    return {
      name,
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
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
        }
      },
      label: {
        show: true,
        position: 'top',
        distance: -14 * (1 - sid)
      },
      data: rawData[sid]
    };
  });
  chartInstanceBar.setOption({
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
    legend: {
      top: '5%',
      left: 'center'
    },
    grid,
    yAxis: {
      type: 'value'
    },
    xAxis: {
      type: 'category',
      'axisLabel': {
        'margin': 16
      },
      data: optionLineXStatusData.value
    },
    series
  });
};
const createPieChart = () => {
  const colors = ['#FF26A8', '#944DFF', '#0099FF'];
  const rawData = severityData.value;
  const nameList = ['Severe', 'Medium', 'Light'];
  let totalNum = 0;
  const pieData = rawData.map((name, sid) => {
    totalNum += name;
    return {
      value: name,
      name: nameList[sid],
      itemStyle: {
        color: colors[sid]
      }
    };
  });
  const endAngleData = rawData.map((name, sid) => {
    return 90 - (name / totalNum) * 360;
  });
  chartInstancePie.setOption({
    tooltip: {
      trigger: 'item'
    },
    grid: {
      top: 50,
      bottom: 80,
      left: 50,
      right: 50
    },
    legend: {
      top: 'bottom',
      left: 'center',
      icon: 'circle',
      itemStyle: {
        borderWidth: 0
      },
      padding: [10, 0, 0, 0]
    },
    series: [
      {
        name: 'Severity Distribution',
        type: 'pie',
        radius: ['53%', '60%'],
        startAngle: 90,
        endAngle: endAngleData[0],
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: true,
          formatter: function (params) {
            return params.value;
          }
        },
        labelLine: {
          show: true,
          length: 30,
          length2: 80
        },
        data: [pieData[0]]
      },
      {
        name: 'Severity Distribution',
        type: 'pie',
        radius: ['42%', '49%'],
        startAngle: 90,
        endAngle: endAngleData[1],
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: true,
          formatter: function (params) {
            return params.value;
          }
        },
        labelLine: {
          show: true,
          length: 30,
          length2: 70
        },
        data: [pieData[1]]
      },
      {
        name: 'Severity Distribution',
        type: 'pie',
        radius: ['31%', '38%'],
        startAngle: 90,
        endAngle: endAngleData[2],
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: true,
          formatter: function (params) {
            return params.value;
          }
        },
        labelLine: {
          show: true,
          length: 30,
          length2: 60
        },
        data: [pieData[2]]
      },
      {
        type: 'pie',
        z: -1,
        radius: ['27%', '63%'],
        label: {
          show: true,
          position: 'center',
          formatter: function (params) {
            return '{high|' + params.value + '}\nTotal';
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
        tooltip: {
          show: false
        },
        itemStyle: {
          color: '#edf2f5'
        },
        emphasis: {
          disabled: true
        },
        data: [totalNum]
      }
    ]
  });
};
const getList = async () => {};
const getAlertStatistics = async () => {
  queryAlertStatistics(reginType.value).then((res) => {
    if (res.data) {
      statisticsData.value.totalData = res.data.todayAlarmNum;
      statisticsData.value.activeData.currentData = res.data.todaySensorNum;
      statisticsData.value.activeData.previousData = res.data.yesterdaySensorNum;
      statisticsData.value.inactiveData.currentData = res.data.todayUnresolvedAlarmNum;
      statisticsData.value.inactiveData.previousData = res.data.yesterdayUnresolvedAlarmNum;
      sensorLoading.value = false;
    }
  });
  const alarm = await getAlarmStatistics(reginType.value.toString());
  alarmStatistics.value = alarm?.data?.totalNum;
};
const getDayAlertAndSensorNumber = async () => {
  queryDayAlertAndSensorNumber(reginAllOverTimeType.value).then((res) => {
    optionLineXData.value = res.data.dateList;
    alertSeriesData.value = res.data.alertSeriesData;
    sensorSeriesData.value = res.data.sensorSeriesData;
    createLineChart();
  });
};
const getDayAlertStatus = async () => {
  queryDayAlertStatus(reginUnresolvedAlertType.value).then((res) => {
    optionLineXStatusData.value = res.data.dateList;
    resolvedSeriesData.value = res.data.resolvedSeriesData;
    unresolvedSeriesData.value = res.data.unresolvedSeriesData;
    createBarChart();
  });
};
const getAlertSeverityNumber = async () => {
  queryAlertSeverityNumber(reginSensorType.value).then((res) => {
    if (res.data) {
      const order = ['high', 'medium', 'low'];
      severityData.value = order.map((severity) => {
        const item = res.data.find((d) => d.severity === severity);
        return item ? item.num : 0; // 如果找不到对应的severity，返回0
      });
    }
    createPieChart();
  });
};
const getAlertSensorRanking = async () => {
  queryAlertSensorRanking(reginPartOverTimeType.value, queryParams.value.pageNum, queryParams.value.pageSize).then((res) => {
    sensorAlertRankList.value = res.rows;
    total.value = res.total;
  });
};

const resize = () => {
  if (chartInstancePie) {
    chartInstancePie.resize();
  }
  if (chartInstanceLine) {
    chartInstanceLine.resize();
  }
  if (chartInstanceBar) {
    chartInstanceBar.resize();
  }
}
const initData = async () => {
  await getAlertStatistics();
  await getDayAlertAndSensorNumber();
  await getDayAlertStatus();
  await getAlertSeverityNumber();
  await getAlertSensorRanking();
 
  await nextTick(() => {
    chartInstancePie = echarts.init(chartDomRightGauge.value);
    chartInstanceLine = echarts.init(chartDomLeftLine.value);
    chartInstanceBar = echarts.init(chartDomLeftBar.value);
    getList();
    window.addEventListener('resize', resize);
  });
};
onMounted(async () => {
  initData();
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
});
</script>
<style scoped ts="scss">
.main-block {
  border: 1px solid var(--el-base-border-color);
  border-radius: 8px;
  .title-bg {
    width: 100%;
    height: 48px;
    background-color: var(--el-title-background-color);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .data-select {
      width: 120px;
      margin-right: 16px;
      height: 26px;
      border-radius: 4px;
      color: var(--colors-base-primary);
    }
  }
  ::v-deep(.el-select__placeholder span) {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
  }
  .view-title {
    margin-left: 20px;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
  }
  .line {
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .total-data-num {
    font-weight: 700;
    font-size: 40px;
    line-height: 60px;
    color: var(--colors-base-primary);
  }
  .total-data-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    color: var(--el-text-color-b12);
  }

  .total-data-subtitle {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #71797E;
  }
  .total-data-desc {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: var(--el-text-color-b49);
  }
  .detail-data-block {
    padding: 24px;
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      rgba(76, 144, 205, 0.05) 7.76%,
      rgba(70, 119, 186, 0.05) 21.59%,
      rgba(65, 93, 168, 0.05) 39.1%,
      rgba(61, 75, 155, 0.05) 56.61%,
      rgba(58, 64, 147, 0.05) 75.96%,
      rgba(58, 61, 145, 0.05) 97.16%,
      rgba(58, 61, 145, 0.05) 99.93%
    );
    .data-value {
      font-weight: 600;
      font-size: 28px;
      line-height: 34px;
      color: var(--el-text-color-b12);
    }
    .detail-data-trend {
      line-height: 24px;
      border-radius: 4px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      .trend-value {
        margin-left: 4px;
        font-weight: 600;
        font-size: 12px;
      }
    }
    .detail-success-bg {
      background-color: var(--color-success-flat10);
      .trend-value {
        color: var(--color-success);
      }
    }
    .detail-warn-bg {
      background-color: var(--color-danger-flat10);
      .trend-value {
        color: var(--color-danger);
      }
    }
  }
}
.total-svg {
  width: 50px;
  height: 50px;
}
.chartDom {
  width: 100%;
  height: calc(100% - 10px);
  padding: 10px 0;
  position: initial !important;
}
</style>
