<template>
  <div ref="p2" class="p-2">
    <!-- 机器人筛选组件 -->
    <RobotFilter
      ref="robotFilterRef"
      :placeholder-text="placeholderText"
      :query-params="filterParams"
      :location-list="locationList"
      :robot-type-list="robotTypeList"
      :robot-name-list="robotNameList"
      :robot-s-n-list="robotSNList"
      @query="handleQuery"
      @reset="resetQuery"
    >
      <template #extra-filters>
        <el-form-item label="Task Status" prop="taskStatus">
          <el-select v-model="filterParams.taskStatus" clearable filterable placeholder="Please Select Task Status">
            <el-option v-for="item in taskStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <template #extra-filter-tags>
        <el-tag
          v-if="filterParams.taskStatus"
          closable
          type="primary"
          @close="clearTaskStatusFilter"
          class="filter-tag"
        >
          Task Status: {{ filterParams.taskStatus }}
        </el-tag>
      </template>
    </RobotFilter>
    <el-row style="align-items: center" class="data-picker mb-4">
      <DateRangePicker v-model:dateRange="dateRange" activeIndex="0" @refresh="getList" />
    </el-row>

    <div v-loading="chartLoading" style="width: 100%" class="grid md:grid-cols-2 grid-cols-1 gap-4">
      <div v-for="item in chartList" :key="item.id" style="margin-bottom: 16px">
        <FoldingLineChart v-if="!chartLoading" class="dashboard-chart-item-node" :config="getConfig(item.id)" />
      </div>
    </div>
  </div>
</template>

<script setup name="taskOverview" lang="ts">
import FoldingLineInitData from '../demoData/FoldingLineInitData';
import { FoldingLineRequestType } from '@/components/Chart/Option';
import { isMobileDevice, convertWithUnit } from '@/utils';
import { getRobotTypes, getRobotSnList, getRobotNames, getLocations, getOverViewCharts } from '@/api/robot';
import RobotFilter from '@/components/RobotFilter/index.vue';
import useAppStore from '@/store/modules/app';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const placeholderText = ref('Search robots');
const robotFilterRef = ref(null);
import * as useUtils from '@/utils/index';
const defaultSort = ref<any>({ prop: '', order: '' });
const companyList = ref([]);
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
const locationList = ref([]);
const robotTypeList = ref(['PUDU CC1']);
const robotNameList = ref(['Alpha 01', 'Alpha 02', 'Alpha 03', 'Alpha 07', 'Alpha 11', 'Beta 01']);
const robotSNList = ref(['345567782', '945567790', '545567112', '244567112', '884567317', '376668255']);
const taskStatus = ref([{label: 'Scheduled', value: 'scheduled'}, {label: 'In Progress', value: 'inProgress'}, {label: 'Uncompleted', value: 'uncompleted'}, {label: 'Done', value: 'done'}]);
const robotModeList = ref([]);
const robotSubModeList = ref([]);
const loading = ref(true);
const chartLoading = ref(true);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

interface SensorAlarmQuery extends PageQuery {
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  severity?: string;
  locationId?: string;
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
  locationId: '',
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
  robotSn: '',
  taskStatus: ''
});
// chart数据
const chartOptions: FoldingLineRequestType[] = FoldingLineInitData;

interface ChartForm {
  id?: string;
  title?: string;
  chartOptions: FoldingLineRequestType;
  showMenu: boolean;
}
const duration = ref('0'); // '0': day, '1': week, '2': month
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
  // 创建一个新的对象返回，确保每次调用都返回一个新的引用
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
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.search = robotFilterRef.value?.searchbarRef?.searchText || '';
  getList();
};

const getList = async () => {
  loading.value = true;
  chartLoading.value = true; // 确保在加载数据时显示加载状态
  const params = { ...queryParams.value, type: duration.value };
  const location = robotFilterRef.value?.filterPanelRef?.getLastLevelSelection() || {};
  const [key, value] = [location.levelName, location.value];
  params[key] = value;

  const range = proxy?.addDateRange(params, dateRange.value);

  try {
    const res = await getOverViewCharts(range);
    console.log('getList', res);

    // 创建临时数组以存储更新后的图表数据
    const updatedChartData = [...chartData.value];

    // 更新图表数据
    updatedChartData[0] = {
      ...chartData.value[0],
      chartOptions: updateChartData(
        {
          dateList: res.data.dateList,
          seriesList: res.data.seriesPercentageList
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
          seriesList: res.data.seriesActualAreaList
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
          seriesList: res.data.seriesDurationList
        },
        chartOptionsC,
        2,
        true
      )
    };

    updatedChartData[3] = {
      ...chartData.value[3],
      chartOptions: updateChartData(
        {
          dateList: res.data.dateList,
          seriesList: res.data.seriesTasksList
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
  } catch (error) {
    console.error('Get chart data failed:', error);
    loading.value = false;
    chartLoading.value = false;
  }
};
/** 重置按钮操作 */
const resetQuery = () => {
  robotFilterRef.value?.queryFormRef?.resetFields();
  robotFilterRef.value?.filterPanelRef?.clearCascaderContent();
  queryParams.value.pageNum = 1;
  getList();
};

/** 清除任务状态筛选 */
const clearTaskStatusFilter = () => {
  filterParams.value.taskStatus = '';
  getList();
};

const updateChartData = (a, b, index, toMinutes = false) => {
  // 创建一个深拷贝，避免直接修改原对象
  const newConfig = JSON.parse(JSON.stringify(b));

  // 1. 更新x轴数据（只显示时间部分）
  newConfig.series[0].chartType = 'bar';
  newConfig.series[0].barMaxWidth = 20;
  newConfig.xAxis.data = a.dateList;
  newConfig.useString = true;
  // 2. 更新series数据
  if (toMinutes) {
    newConfig.series[0].data = a.seriesList.map((value) => {
      return (value / 60).toFixed(0); // 转换为分钟
    });
  } else if(index === 1) {
    newConfig.series[0].data = a.seriesList.map((value) => {
      return convertWithUnit({value, type: 'area', hideUnit: true});
    });
    newConfig.yAxis.unit = useAppStore().currentUnits === 'imperial' ? 'ft²' : 'm²';
  } else {
    newConfig.series[0].data = a.seriesList;
  }

  // 3. 计算最大值、最小值和平均值
  let title = '';
  switch (index) {
    case 0:
      title = getPercentageTitle(a);
      break;
    case 1:
      title = getActualAreaTitle(a);
      break;
    case 2:
      title = getDurationTitle(a);
      break;
    case 3:
      title = getTasksTitle(a);
      break;
    default:
      title = 'Default Title';
  }

  // 4. 更新标题副文本
  newConfig.title.subtext = title;

  console.log(newConfig.xAxis.data.length);

  return newConfig;
};

const getPercentageTitle = (data) => {
  const values = data.seriesList;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return `Max ${max.toFixed(2)}%, Min ${min.toFixed(2)}%, Avg ${avg.toFixed(2)}%`;
};

const getActualAreaTitle = (data) => {
  const values = data.seriesList;
  const total = values.reduce((sum, val) => sum + val, 0);
  return `Total ${convertWithUnit({value: total, type: 'area'})}`;
};

const getDurationTitle = (data) => {
  const values = data.seriesList;
  const maxSeconds = Math.max(...values);
  // 计算最小值（秒）
  const minSeconds = Math.min(...values);
  // 计算平均值（秒）
  const avgSeconds = values.reduce((sum, val) => sum + val, 0) / values.length;

  // 转换为分钟（保留2位小数）
  const maxMinutes = (maxSeconds / 60).toFixed(0);
  const minMinutes = (minSeconds / 60).toFixed(0);
  const avgMinutes = (avgSeconds / 60).toFixed(0);

  return `Max ${maxMinutes}min, Min ${minMinutes}min, Avg ${avgMinutes}min`;
};

const getTasksTitle = (data) => {
  const values = data.seriesList;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return `Max ${max.toFixed(2)}, Min ${min.toFixed(2)}, Avg ${avg.toFixed(2)}`;
};

onMounted(async () => {
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

watch(
  () => useAppStore().currentUnits,
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

.el-tag.el-tag--primary {
  --el-tag-text-color: #0099ff !important;
}

.el-tag {
  color: #0099ff !important;
}
</style>
