<template>
  <div ref="p2" class="p-2">
    <!-- 机器人筛选组件 -->
    <RobotFilter
      ref="robotFilterRef"
      :placeholder-text="placeholderText"
      :query-params="queryParams"
      :location-list="locationList"
      :robot-type-list="robotTypeList"
      :robot-name-list="robotNameList"
      :robot-s-n-list="robotSNList"
      @query="handleQuery"
      @reset="resetQuery"
    />
    <el-row style="align-items: center" class="data-picker mb-4 flex justify-between items-center">
      <DateRangePicker v-model:dateRange="dateRange" activeIndex="0" @refresh="getList" />
      <el-button type="primary" @click="openSettings" class="w-[160px] mt-4 mb-2">Robot Settings</el-button>
    </el-row>
    <div v-loading="chartLoading" style="width: 100%" class="grid md:grid-cols-2 grid-cols-1 gap-4">
      <div v-for="item in chartList" :key="item.id" style="margin-bottom: 16px">
        <FoldingLineChart v-if="!chartLoading" class="dashboard-chart-item-node" :config="getConfig(item.id)" />
      </div>
    </div>
  </div>

  <RobotSettings v-model:visible="showSettings" :robot-data="robotData" @save="handleSettingsSave" />
</template>

<script setup name="costAnalysis" lang="ts">
import FoldingLineInitData from '../demoData/CostFoldingLineInitData';
import { FoldingLineRequestType } from '@/components/Chart/Option';
import { getCostInfo, saveCost, getRobotTypes, getRobotSnList, getRobotNames, getLocations, getCostCharts } from '@/api/robot';
import { isMobileDevice } from '@/utils';
import RobotSettings from '@/views/monitor/robotmanage/settings/settings.vue';
import RobotFilter from '@/components/RobotFilter/index.vue';
import useAppStore from '@/store/modules/app';

import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const placeholderText = ref('Search robots');
const robotFilterRef = ref(null);
const chartLoading = ref(true);
const defaultSort = ref<any>({ prop: '', order: '' });
const locationList = ref([]);
const companyList = ref([]);
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
const showSettings = ref(false);
const robotTypeList = ref(['PUDU CC1']);
const robotNameList = ref(['Alpha 01', 'Alpha 02', 'Alpha 03', 'Alpha 07', 'Alpha 11', 'Beta 01']);
const robotSNList = ref(['345567782', '945567790', '545567112', '244567112', '884567317', '376668255']);
const robotModeList = ref([]);
const robotSubModeList = ref([]);
const loading = ref(true);
const duration = ref('1'); // '0': day, '1': week, '2': month
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const robotData = ref({
  objectType: 'robot',
  electricityRate: '0.120',
  waterRate: '0.000',
  humanHourlyWage: '0.000',
  humanCleaningRate: '0.000',
  purchasePrice: '0.120',
  expectedLifespan: '0.000',
  annualMaintenanceCost: '0.000',
  id: '',
  robotId: '',
  robotName: '',
  robotType: '',
  robotSn: ''
});
const openSettings = async () => {
  // 只有在设置对话框未打开时才获取数据
  if (!showSettings.value) {
    const res = await getCostInfo();
    console.log(res);
    Object.assign(robotData.value, res.data);
  }

  showSettings.value = !showSettings.value;
};
interface SensorAlarmQuery extends PageQuery {
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  severity?: string;
  alarmType?: string;
  previousDays?: number;
  sensorType?: string;
  dataType?: string;
  equipmentName?: string;
  search?: string;
}
const queryParams = ref<SensorAlarmQuery>({
  pageNum: 1,
  pageSize: 10,
  company: '',
  account: '',
  region: '',
  state: '',
  city: '',
  zipCode: '',
  severity: undefined,
  alarmType: undefined,
  previousDays: 1,
  sensorType: undefined,
  dataType: undefined,
  equipmentName: undefined,
  search: undefined
});

const filterParams = ref({
  locationId: '',
  robotType: '',
  robotName: '',
  robotSn: ''
});
// chart数据
const chartOptions: FoldingLineRequestType[] = FoldingLineInitData;

interface ChartForm {
  id?: string;
  title?: string;
  chartOptions: FoldingLineRequestType;
  showMenu: boolean;
}
const chartOptionsA: FoldingLineRequestType = chartOptions[0];
const chartOptionsB: FoldingLineRequestType = chartOptions[1];
const chartOptionsC: FoldingLineRequestType = chartOptions[2];
const chartOptionsD: FoldingLineRequestType = chartOptions[3];
const chartList = ref([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
const chartData = ref<ChartForm[]>([
  { id: '1', title: 'Performance', chartOptions: chartOptionsA, showMenu: false },
  { id: '2', title: 'Performance', chartOptions: chartOptionsB, showMenu: false },
  { id: '3', title: 'Schedules', chartOptions: chartOptionsC, showMenu: false },
  { id: '4', title: 'Schedules', chartOptions: chartOptionsD, showMenu: false }
]);
const getConfig = (id: string) => {
  const config = chartData.value.find((item) => item.id === id);
  if (config) {
    // 返回一个新的对象引用，以确保组件能检测到变化
    // 深拷贝 chartOptions 以确保引用变化
    return {
      ...config,
      chartOptions: JSON.parse(JSON.stringify(config.chartOptions))
    };
  }
  return config;
};
const changeLocation = (type) => {
  console.log('changeLocation');
};
// 处理设置保存
const handleSettingsSave = (formData) => {
  // 更新机器人数据
  robotData.value = { ...formData };
  getList();
  // ElMessage.success('Robot settings updated successfully');
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.search = robotFilterRef.value?.searchbarRef?.searchText || '';
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  robotFilterRef.value?.queryFormRef?.resetFields();
  robotFilterRef.value?.filterPanelRef?.clearCascaderContent();
  queryParams.value.pageNum = 1;
  getList();
};

const updateChartData = (a, b, index) => {
  const newConfig = JSON.parse(JSON.stringify(b));
  // 1. 更新x轴数据（只显示时间部分）
  newConfig.xAxis.data = a.dateList;

  // 2. 更新series数据
  newConfig.series[0].chartType = 'bar';
  newConfig.series[0].barMaxWidth = 20;
  newConfig.series[0].data = a.seriesList;
  newConfig.useString = true;

  // 3. 计算最大值、最小值和平均值
  let title = '';
  switch (index) {
    case 0:
      title = getTitle(a, 'kWh');
      break;
    case 1:
      title = getTitle(a, 'h');
      break;
    case 2:
      title = getTitle(a, '$', true);
      break;
    case 3:
      title = getTitle(a, '%');
      break;
    default:
      title = 'Default Title';
  }

  // 4. 更新标题副文本
  newConfig.title.subtext = title;

  return newConfig;
};

const getTitle = (data, unit, prefix = false) => {
  const values = data.seriesList;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return `Max ${prefix ? unit : ''}${max.toFixed(2)}${prefix ? '' : unit}, Min ${prefix ? unit : ''}${min.toFixed(2)}${prefix ? '' : unit}, Avg ${prefix ? unit : ''}${avg.toFixed(2)}${prefix ? '' : unit}`;
};

const getList = async () => {
  // loading.value = true;
  chartLoading.value = true; // 确保在加载数据时显示加载状态
  const params = { ...queryParams.value, type: duration.value };
  const location = robotFilterRef.value?.filterPanelRef?.getLastLevelSelection() || {};
  const [key, value] = [location.levelName, location.value];
  params[key] = value;
  const range = proxy?.addDateRange(params, dateRange.value);
  const res = await getCostCharts(range);
  console.log('getList', res);
  const updatedChartData = [...chartData.value];

  // 更新图表数据
  updatedChartData[0] = {
    ...chartData.value[0],
    chartOptions: updateChartData(
      {
        dateList: res.data.dateList,
        seriesList: res.data.seriesConsumptionList
      },
      chartOptionsA,
      0
    )
  };

  updatedChartData[1] = {
    ...chartData.value[1],
    chartOptions: updateChartData(
      {
        dateList: res.data.dateList,
        seriesList: res.data.seriesHourSavedList
      },
      chartOptionsB,
      1
    )
  };

  updatedChartData[2] = {
    ...chartData.value[2],
    chartOptions: updateChartData(
      {
        dateList: res.data.dateList,
        seriesList: res.data.seriesCostList
      },
      chartOptionsC,
      2
    )
  };

  updatedChartData[3] = {
    ...chartData.value[3],
    chartOptions: updateChartData(
      {
        dateList: res.data.dateList,
        seriesList: res.data.seriesRoiList
      },
      chartOptionsD,
      3
    )
  };

  // 一次性更新整个数组，触发响应式更新
  chartData.value = updatedChartData;

  // 使用nextTick确保DOM更新后再关闭加载状态
  nextTick(() => {
    loading.value = false;
    chartLoading.value = false;
  });

  loading.value = false;
};

onMounted(async () => {
  // const params = { ...filterParams.value, type: duration.value };
  // const queryParams = proxy?.addDateRange(params, dateRange.value);
  // const data = await geCostConsumption(queryParams);
  // chartData.value[0].chartOptions = updateChartData(data, chartOptionsA);
  const [types, sns, names, locations] = await Promise.all([getRobotTypes(), getRobotSnList(), getRobotNames(), getLocations()]);
  robotTypeList.value = types.data;
  robotNameList.value = names.data;
  robotSNList.value = sns.data;
  locationList.value = locations.data;
  getList();
});

watch(
  () => useAppStore().currentTimeZone,
  () => {
    getList();
  },
  { deep: true }
);
</script>
<style scoped lang="scss">
@import '@/views/monitor/robotmanage/robot.scss';

.dashboard-chart-item-node {
  height: 400px;
}
</style>
