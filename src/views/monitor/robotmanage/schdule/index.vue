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
    <el-row style="display: flex; align-items: center" class="data-picker">
      <DateRangePicker
        v-model:dateRange="dateRange"
        :active-index="viewTitle == 'View In Chart' ? '3' : '0'"
        @refresh="getList"
      />
      <div class="top-right-btn" style="display: flex; align-items: center">
        <el-radio-group v-model="viewType" class="radio-group" @change="viewTypeChange">
          <el-radio value="1">View Cleaning Tasks</el-radio>
          <el-radio value="2">View Charging Records</el-radio>
        </el-radio-group>
        <div class="vertical-line">|</div>
        <div class="filter-event" @mouseover.stop="mouseover()" @mouseleave.stop="mouseleave()">
          <div class="log-event">
            <div class="w-[90px] pl-2 h-[24px] flex items-center whitespace-nowrap">{{ viewTitle }}</div>
            <div><svg-icon icon-class="droplist" class-name="current-item" /></div>
          </div>
          <div v-if="showLogEvent" class="filter-menu">
            <div v-if="viewTitle != 'View In Table'" class="event-item" @click="changeView('View In Table')">
              <div class="sub-item">View In Table</div>
            </div>
            <div v-if="viewTitle != 'View In Chart'" class="event-item" @click="changeView('View In Chart')">
              <div class="sub-item">View In Chart</div>
            </div>
            <div v-if="viewTitle != 'View In Board'" class="event-item" @click="changeView('View In Board')">
              <div class="sub-item">View In Board</div>
            </div>
          </div>
        </div>
      </div>
    </el-row>
    <el-col v-if="viewTitle == 'View In Table'" :span="24">
      <el-table
        v-if="!isMobileDevice()"
        ref="tableRef"
        v-loading="loading"
        stripe
        :style="{ height: tableHeight + 'px' }"
        :data="alarmList"
        @sort-change="handleSortChange"
        @row-dblclick="handleRowClick"
      >
        <el-table-column
          v-if="viewType == '1'"
          prop="taskName"
          label="Task Name"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[1]"
        ></el-table-column>
        <el-table-column
          prop="robotName"
          label="Robot Name"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="viewType == '1' ? widths[2] : wsCharging[0]"
        ></el-table-column>
        <el-table-column
          prop="robotSn"
          label="Robot SN"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="viewType == '1' ? widths[3] : wsCharging[1]"
        ></el-table-column>
        <el-table-column
          v-if="viewType == '1'"
          prop="mapName"
          label="Map Name"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[3]"
        ></el-table-column>
        <el-table-column
          prop="location"
          label="Location"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="viewType == '1' ? widths[4] : wsCharging[2]"
        ></el-table-column>
        <el-table-column
          v-if="viewType == '1'"
          prop="planArea"
          label="Actual / Plan Area"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[5]"
        >
          <template #default="scope"> {{ convertWithUnit({ value: scope.row.actualArea, type: 'area', hideUnit: true }) }} / {{ convertWithUnit({ value: scope.row.planArea, type: 'area' }) }} </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          label="Start Time"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="viewType == '1' ? widths[6] : wsCharging[3]"
        >
          <template #default="scope">
            {{ useUtils.formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          label="End Time"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="viewType == '1' ? widths[7] : wsCharging[4]"
        >
          <template #default="scope">
            {{ useUtils.formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="viewType == '1'"
          prop="efficiency"
          label="Efficiency"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[8]"
        >
          <template #default="scope"> {{ convertWithUnit({ value: scope.row.efficiency, type: 'area'}) }}/h </template>

        </el-table-column>
        <el-table-column
          v-if="viewType == '1'"
          prop="remainingTime"
          label="Remaining Time"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[9]"
        >
          <template #default="scope">
            {{ useUtils.formatRunningHours(scope.row.remainingTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          v-if="viewType == '1'"
          prop="consumption"
          label="Consumption"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[9]"
        >
          <template #default="scope"> {{ (scope.row.consumption / 60).toFixed(0) }}kWh </template>
        </el-table-column> -->
        <el-table-column
          v-if="viewType == '1'"
          fixed="right"
          prop="progress"
          label="Progress"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[9]"
        >
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="viewType == '1'"
          fixed="right"
          prop="status"
          label="Status"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="widths[10]"
        >
          <template #default="scope">
            <span :class="useUtils.scheduleFormat(useUtils.revertStatus(scope.row.status))">{{ useUtils.revertStatus(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="viewType == '2'"
          prop="duration"
          label="Duration"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="wsCharging[5]"
        >
        </el-table-column>
        <el-table-column
          v-if="viewType == '2'"
          prop="initialPower"
          label="Initial Power"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="wsCharging[6]"
        >
        </el-table-column>
        <el-table-column
          v-if="viewType == '2'"
          prop="finalPower"
          label="Final Power"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
          :width="wsCharging[7]"
        >
        </el-table-column>
        <el-table-column
          label="Action"
          fixed="right"
          align="center"
          class-name="small-padding fixed-width"
          :width="viewType == '1' ? widths[11] : wsCharging[8]"
        >
          <template #default="scope">
            <svg-icon icon-class="view" style="width: 20px; height: 20px; cursor: pointer" @click="handleRowClick(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="card-list">
        <el-card v-for="(item, index) in alarmList" :key="index" class="custom-card" shadow="hover">
          <!-- Header -->
          <div class="card-header">
            <div class="title">{{ viewType == '1' ? item.taskName : 'Charging Record' }}</div>
            <div class="subtitle">{{ item.robotName }} | SN: {{ item.robotSn }}</div>
          </div>

          <!-- Section -->
          <div class="card-section" v-if="item.showMore">
            <div class="info-row">
              <span>Location</span><span>{{ item.location }}</span>
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Map Name</span><span>{{ item.mapName }}</span>
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Area</span><span> {{ convertWithUnit({ value: item.actualArea, type: 'area', hideUnit: true }) }} / {{ convertWithUnit({ value: item.planArea, type: 'area' }) }}</span>
            </div>
            <div class="info-row">
              <span>Start Time</span><span>{{ useUtils.formatDate(item.startTime) }}</span>
            </div>
            <div class="info-row">
              <span>End Time</span><span>{{ useUtils.formatDate(item.endTime) }}</span>
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Efficiency</span><span>{{ convertWithUnit({ value: item.efficiency, type: 'area' }) }}/h</span>
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Remaining Time</span><span>{{ useUtils.formatRunningHours(item.remainingTime) }}</span>
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Progress</span>
              <el-progress :percentage="item.progress" style="width: 120px" />
            </div>
            <div class="info-row" v-if="viewType == '1'">
              <span>Status</span>
              <span :class="useUtils.scheduleFormat(useUtils.revertStatus(item.status))">{{ useUtils.revertStatus(item.status) }}</span>
            </div>
            <div class="info-row" v-if="viewType == '2'">
              <span>Duration</span><span>{{ item.duration }}</span>
            </div>
            <div class="info-row" v-if="viewType == '2'">
              <span>Initial Power</span><span>{{ item.initialPower }}</span>
            </div>
            <div class="info-row" v-if="viewType == '2'">
              <span>Final Power</span><span>{{ item.finalPower }}</span>
            </div>
          </div>
          <div class="card-section" v-if="!item.showMore">
            <div class="info-row">
              <span>Location</span><span>{{ item.location }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <el-button type="default" round plain size="small" @click="item.showMore = !item.showMore">
              {{ item.showMore ? 'Hide' : 'Show Detail' }}
              <svg-icon class="ml-2" :icon-class="item.showMore ? 'map-up-floor-disable' : 'map-down-floor-disable'" />
              <!-- <svg-icon icon-class="view" style="width: 18px; height: 18px; margin-right: 4px" /> -->
            </el-button>
            <el-button text type="primary" size="small" @click="handleRowClick(item)">
              View Details
              <svg-icon class="ml-2" icon-class="view" style="width: 18px; height: 18px; margin-right: 4px" />
            </el-button>
          </div>
        </el-card>
      </div>
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-col>
    <el-col v-if="viewTitle == 'View In Chart'" :span="24">
      <Gantt ref="ganttChart" :config="{ type: viewType }" @openDetail="handleRowClick"></Gantt>
    </el-col>
    <el-col v-if="viewTitle == 'View In Board'" :span="24">
      <Board ref="boardChart" :config="{ type: viewType }" @openDetail="handleRowClick"></Board>
    </el-col>

    <!-- 抽屉组件显示详情页面 -->
    <el-drawer v-model="showDetailDrawer" title="" direction="rtl" size="80%" :before-close="handleDrawerClose">
      <ScheduleDetail v-if="selectedScheduleData" :task-id="selectedScheduleData.id" :view-type="viewType" />
    </el-drawer>
  </div>
</template>
<script setup name="schdule" lang="ts">
import { isMobileDevice, convertWithUnit } from '@/utils';
import { getScheduleList, getRobotTypes, getRobotSnList, getRobotNames, getTaskSubModeList, getTaskModeList, getLocations } from '@/api/robot';
import * as useUtils from '@/utils/index';
import sleep from '@/utils/sleep';
import ScheduleDetail from './detail.vue';
import RobotFilter from '@/components/RobotFilter/index.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const placeholderText = ref('Search robots or tasks');
const tableRef = ref<ElTableInstance>();
const tableHeight = ref(0);
const robotFilterRef = ref(null);
const ganttChart = ref(null);
const boardChart = ref(null);
const defaultSort = ref<any>({ prop: 'startTime', order: 'descending' });
const companyList = ref([]);
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
const locationList = ref([]);
const ws = isMobileDevice()
  ? ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  : [100, 160, 160, 160, 280, 220, 180, 180, 180, 180, 140, 100, 160, 100, 80];
const wsCharging = isMobileDevice() ? ['', '', '', '', '', '', '', '', ''] : ['10%', '10%', '20%', '10%', '10%', '10%', '10%', '10%', '8%'];
const widths = ref(ws);
const robotTypeList = ref(['PUDU CC1']);
const robotNameList = ref(['Alpha 01', 'Alpha 02', 'Alpha 03', 'Alpha 07', 'Alpha 11', 'Beta 01']);
const robotSNList = ref(['345567782', '945567790', '545567112', '244567112', '884567317', '376668255']);
const robotModeList = ref([]);
const robotSubModeList = ref([]);
const loading = ref(true);

let demoList = [];
//接收数据集合
const alarmList = ref<SensorAlarmForm[]>([]);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

interface SensorAlarmForm {
  id: string;
  taskName: string;
  robotName: string;
  robotSn: string;
  mapName: string;
  location: string;
  locationId?: string;
  planArea: string;
  startTime: string;
  endTime: string;
  efficiency: string;
  remainingTime: string;
  consumption: string;
  progress: number;
  duration: string;
  initialPower: string;
  finalPower: string;
  status: string;
  type: string;
  showMore?: boolean;
  actualArea?: string;
}
interface SensorAlarmQuery extends PageQuery {
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  robotSn?: string;
  robotName?: string;
  robotType?: string;
  location?: string;
  locationId?: string;
  mode?: string;
  subMode?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
  showMore?: boolean;
}
//初始化查询表单和分页内容
const initFormData: SensorAlarmForm = {
  id: undefined,
  taskName: undefined,
  robotName: undefined,
  robotSn: undefined,
  mapName: undefined,
  location: undefined,
  locationId: undefined,
  planArea: undefined,
  startTime: undefined,
  endTime: undefined,
  efficiency: undefined,
  remainingTime: undefined,
  consumption: undefined,
  progress: undefined,
  duration: undefined,
  initialPower: undefined,
  finalPower: undefined,
  status: undefined,
  type: undefined
};
const initData: PageData<SensorAlarmForm, SensorAlarmQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    location: '',
    company: '',
    account: '',
    region: '',
    state: '',
    city: '',
    zipCode: '',
    search: undefined,
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {}
};
const data = reactive<PageData<SensorAlarmForm, SensorAlarmQuery>>(initData);
const { queryParams, form, rules } = toRefs<PageData<SensorAlarmForm, SensorAlarmQuery>>(data);

const activeName = ref('0');

const viewType = ref('1');

const showLogEvent = ref(false);
const showDetailDrawer = ref(false);
const selectedScheduleData = ref(null);

const handleSortChange = (column: any) => {
  queryParams.value.orderByColumn = column.prop;
  if (column.order === '') {
    queryParams.value.orderByColumn = '';
  } else {
     queryParams.value.orderByColumn = column.prop;
  }
  getList();
};
const viewTitle = ref('View In Table');
const progressFormat = (percentage) => {
  return percentage === 100 ? 'Full' : `${percentage}%`;
};
const viewTypeChange = () => {
  queryParams.value.orderByColumn = defaultSort.value.prop;
  queryParams.value.isAsc = defaultSort.value.order;
  getList();
};
const mouseover = () => {
  showLogEvent.value = true;
};
const mouseleave = async () => {
  await sleep(200);
  showLogEvent.value = false;
};
const changeView = (type) => {
  showLogEvent.value = false;
  viewTitle.value = type;
  getList();
};
const updateGantt = (opts: { dateRange?: Array<any>; data?: Array<any>; type?: string; params?: { [key: string]: any } }) => {
  ganttChart.value?.update(opts);
};

watch(
  () => dateRange,
  (newValue) => {
    dateRange.value = newValue.value;
    if (viewTitle.value === 'View In Chart') {
      updateGantt({ dateRange: dateRange.value, data: demoList, type: viewType.value });
    }
  }
);
const changeLocation = (type) => {
  console.log('changeLocation');
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
  tableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order);

  getList();
};

const handleRowClick = (row: any) => {
  selectedScheduleData.value = row;
  showDetailDrawer.value = true;
};

const handleDrawerClose = () => {
  showDetailDrawer.value = false;
  selectedScheduleData.value = null;
};

const getList = async () => {
  loading.value = true;
  const searchObj = { ...queryParams.value, type: '' };
  searchObj.type = viewType.value;
  const location = robotFilterRef.value?.filterPanelRef?.getLastLevelSelection() || {};
  const [key, value] = [location.levelName, location.value];
  searchObj[key] = value;
  const params = proxy?.addDateRange(searchObj, dateRange.value);
  const data = await getScheduleList(params);
  loading.value = false;
  demoList = data.rows;
  alarmList.value = data.rows;
  total.value = data.total;
  if (viewTitle.value === 'View In Chart') {
    updateGantt({ dateRange: dateRange.value, data: demoList, type: viewType.value, params });
  } else if (viewTitle.value === 'View In Board') {
    boardChart.value.updateList({ data, type: viewType.value });
  }
};
const calculateTableHeight = () => {
  const windowHeight = window.innerHeight;
  const tableRect = tableRef.value?.$el?.getBoundingClientRect();
  if (!tableRef.value?.$el || !document.contains(tableRef.value.$el)) {
    return;
  }
  //90px为分页控件的预留高度
  tableHeight.value = windowHeight - tableRect.top - 90;
};

onMounted(async () => {
  calculateTableHeight();
  window.addEventListener('resize', calculateTableHeight);

  try {
    const [types, sns, names, subModes, models, locations] = await Promise.all([
      getRobotTypes(),
      getRobotSnList(),
      getRobotNames(),
      getTaskSubModeList(),
      getTaskModeList(),
      getLocations()
    ]);

    robotTypeList.value = types.data;
    robotNameList.value = names.data;
    robotSNList.value = sns.data;
    robotModeList.value = models.data;
    robotSubModeList.value = subModes.data;
    locationList.value = locations.data;
  } catch (error) {
    console.error('Failed to fetch robot data:', error);
  }
  getList();
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateTableHeight);
});
</script>
<style scoped lang="scss">
@import '@/views/monitor/robotmanage/robot.scss';
.radio-group {
  margin-right: 4px;
  width: 90%;
}
.vertical-line {
  color: var(--colors-base-primary);
  margin-right: 4px;
}
@media screen and (min-width: 768px) {
  .radio-group {
    margin-right: 24px;
  }
  .vertical-line {
    margin-right: 24px;
  }
}
:deep(.el-table__body),
:deep(.el-table__header) {
  width: 100% !important;
}
.current-item {
  width: 16px;
  height: 16px;
  margin-left: 8px;
}
.filter-event {
  position: relative;
  width: 116px;
  height: 100%;
}
.log-event {
  padding-right: 4px;
  background-color: var(--colors-base-primary);
  color: var(--baseBackground);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.filter-menu {
  position: absolute;
  right: 0;
  top: 32px;
  width: 116px;
  height: 82px;
  background-color: var(--baseBackground);
  border-radius: 8px;
  z-index: 10;
  padding-top: 10px;
}
.event-item {
  height: 50%;
  width: 116px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: var(--el-color-primary-light-8);
  }
}
.event-item .sub-item {
  width: 70px;
  margin: 0 auto;
}

:deep(.el-drawer__title) {
  font-size: 18px;
  font-weight: 600;
}
</style>
