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

    <el-row style="align-items: center" class="data-picker">
      <DateRangePicker ref="datePickerRef" v-model:dateRange="dateRange" activeIndex="0" @refresh="getList" />
    </el-row>
    <div class="h-[144px] relative w-full">
      <metrics-cards ref="metricsRef" :metrics="metrics" />
    </div>

    <el-table
      ref="tableRef"
      v-if="!isMobileDevice()"
      v-loading="loading"
      stripe
      :data="alarmList"
      :style="{ height: tableHeight + 'px' }"
      @sort-change="handleSortChange"
      @row-dblclick="handleRowClick"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expanded-row pl-6" v-loading="rowLoadingMap.get(props.row.id) || false">
            <div class="task-completion-section grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-4">
              <div v-for="(section, index) in getDisplayedDetails(props.row.id)" :key="index" class="task-section" :class="section.className">
                <div class="section-header">
                  <span class="section-title">{{ section.title }}</span>
                  <span class="section-tag" :class="section.tagClass">{{ section.tagText }}</span>
                </div>
                <div class="section-content">
                  <div class="section-name">{{ section.name }}</div>
                  <div class="section-id">{{ section.id }}</div>
                  <div v-for="(item, i) in ['taskTime', 'uploadTime']" :key="i" class="info-row">
                    <div class="info-label">
                      <svg-icon :icon-class="i === 0 ? 'task-time' : 'upload-time'" />
                      <span class="pl-2">{{ detailTimeLabels[item] }}</span
                      >:
                    </div>
                    <div class="info-value">{{ useUtils.formatDate(section[item]) }}</div>
                  </div>
                  <div class="action-row">
                    <el-button size="default" class="view-details-btn" @click="openDialog(section)" round>
                      <span class="pr-2"> View Details </span> <svg-icon icon-class="view-card" class="svg-default" />
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="getDisplayedDetails(props.row.id).length === 0" class="w-full h-[50px] flex justify-center items-center">No Event</div>

            <!-- 加载更多按钮 -->
            <div class="load-more-container" v-if="hasMoreDetails(props.row.id)">
              <el-button class="load-more-button" @click="loadMoreDetails(props.row.id)" round>
                Load more data
                <svg-icon icon-class="refresh" class="icon-right" />
              </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="robotType"
        label="Robot Type"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[1]"
      ></el-table-column>
      <el-table-column
        prop="robotName"
        label="Robot Name"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[2]"
      ></el-table-column>
      <el-table-column
        prop="robotSn"
        label="Robot SN"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[3]"
      ></el-table-column>
      <el-table-column
        prop="location"
        label="Location"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[4]"
      ></el-table-column>
      <el-table-column label="Recent Event" prop="recentEvents" min-width="180">
        <template #default="scope">
          <div class="event-cell flex gap-1">
            <div v-for="(item, index) in scope.row.recentEvents" class="recentCell" :class="recentItem(index)">
              <el-tooltip :content="getTooltip(item, index)" effect="light" placement="top">
                <span>{{ item }}</span>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="currentTask"
        :label="isToday ? 'Current Task' : 'Recent Task'"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[5]"
      ></el-table-column>
      <el-table-column prop="totalTasks" label="Total Task" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[6]">
      </el-table-column>
      <el-table-column
        prop="totalRunningHours"
        label="Total Running Hours"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[7]"
      >
        <template #default="scope">
          <span>{{ useUtils.formatRunningHours(scope.row.totalRunningHours) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalArea" label="Total Cleaned Area" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[8]">
        <template #default="scope">
          <span>{{ convertWithUnit({ value: scope.row.totalArea, type: 'area' }) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isToday"
        prop="waterLevel"
        label="Water Level"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[9]"
      >
        <template #default="scope">
          <span>{{ scope.row.waterLevel }}%</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isToday"
        prop="sewageLevel"
        label="Sewage Level"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[10]"
      >
        <template #default="scope">
          <span>{{ scope.row.sewageLevel }}%</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isToday"
        prop="batteryLevel"
        label="Power Level"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :width="widths[11]"
      >
        <template #default="scope">
          <span>{{ scope.row.batteryLevel }}%</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="status" label="Status" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[12]">
        <template #default="scope">
          <div class="status-cell">
            <div class="status-tag" :class="getStatusClass(scope.row.status)">
              {{ scope.row.status }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Action" fixed="right" align="center" class-name="small-padding fixed-width" :width="widths[13]">
        <template #default="scope">
          <div class="action-buttons">
            <svg-icon icon-class="view" style="width: 20px; height: 20px; cursor: pointer; margin-right: 10px" @click="handleRowClick(scope.row)" />
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div v-else class="card-list">
       <el-card
          v-for="(item, index) in alarmList"
          :key="index"
          class="mb-4"
          shadow="hover"
        >
          <div><strong>Robot Type:</strong> {{ item.robotType }}</div>
          <div><strong>Robot Name:</strong> {{ item.robotName }}</div>
          <div><strong>Robot SN:</strong> {{ item.robotSn }}</div>
          <div><strong>Location:</strong> {{ item.location }}</div>
          <div><strong>Recent Event:</strong> 
           <div class="event-cell flex">
            <div v-for="(event, index) in item.recentEvents" class="recentCell" :class="recentItem(index)">{{ event }}</div>
          </div></div>
          <div><strong>{{ isToday ? 'Current Task' : 'Recent Task' }}:</strong> {{ item.currentTask }}</div>
          <div><strong>Total Running Hours:</strong> {{ useUtils.formatRunningHours(item.totalRunningHours) }}</div>
          <div><strong>Total Area:</strong> {{ item.totalArea }}</div>
          <div><strong>Water Level:</strong> {{ item.waterLevel }}</div>
          <div><strong>Sewage Level:</strong> {{ item.sewageLevel }}</div>
          <div><strong>Power Levell:</strong> {{ item.batteryLevel }}</div>
          <div><strong>Status:</strong> 
          <div class="status-cell">
            <div class="status-tag" :class="getStatusClass(item.status)">
              {{ item.status }}
            </div>
          </div>
          </div>
          <div><strong>Action:</strong> 
          <svg-icon icon-class="view" style="width: 20px; height: 20px; cursor: pointer" @click="handleRowClick(item)" />
          </div>
        </el-card>
    </div> -->
    <div v-else class="card-list">
      <el-card v-for="(item, index) in alarmList" :key="index" class="custom-card" shadow="hover">
        <!-- Header -->
        <div class="card-header">
          <div class="flex justify-between">
            <div class="title">{{ item.robotName }}</div>
          </div>
          <div class="subtitle">{{ item.robotType }} | SN: {{ item.robotSn }}</div>
        </div>

        <!-- Section -->
        <div class="card-section" v-if="item.showMore">
          <div class="info-row">
            <span>Location</span><span>{{ item.location }}</span>
          </div>
          <div class="info-row">
            <span>Recent Events</span>
            <div class="event-cell flex">
              <div v-for="(event, index) in item.recentEvents" class="recentCell-mobile" :class="recentItem(index)">{{ event }}</div>
            </div>
          </div>
          <div class="info-row">
            <span>{{ isToday ? 'Current Task' : 'Recent Task' }}</span>
            <span>{{ item.currentTask }}</span>
          </div>
          <div class="info-row">
            <span>Total Running</span><span>{{ useUtils.formatRunningHours(item.totalRunningHours) }}</span>
          </div>
          <div class="info-row">
            <span>Total Cleaned Area</span><span>{{ convertWithUnit({ value: item.totalArea, type: 'area' }) }}</span>
          </div>
          <div class="info-row" v-if="isToday">
            <span>Water Level</span><span>{{ item.waterLevel }}%</span>
          </div>
          <div class="info-row" v-if="isToday">
            <span>Sewage Level</span><span>{{ item.sewageLevel }}%</span>
          </div>
          <div class="info-row" v-if="isToday">
            <span>Battery Level</span><span>{{ item.batteryLevel }}%</span>
          </div>
          <div class="info-row">
            <span>Status</span>
            <div class="status-cell">
              <div class="status-tag" :class="getStatusClass(item.status)">
                {{ item.status }}
              </div>
            </div>
          </div>
        </div>
        <div class="card-section" v-if="!item.showMore">
          <div class="info-row">
            <span>Location</span><span>{{ item.location }}</span>
          </div>
        </div>
        <div class="card-section" v-if="item.showEvent">
          <div class="expanded-row md:pl-6" v-loading="rowLoadingMap.get(item.id) || false">
            <div class="task-completion-section md:grid-cols-2 grid-cols-1 gap-4">
              <div v-for="(section, index) in getDisplayedDetails(item.id)" :key="index" class="task-section" :class="section.className">
                <div class="section-header">
                  <span class="section-title">{{ section.title }}</span>
                  <span class="section-tag" :class="section.tagClass">{{ section.tagText }}</span>
                </div>
                <div class="section-content">
                  <div class="section-name">{{ section.name }}</div>
                  <div class="section-id">{{ section.id }}</div>
                  <div v-for="(item, i) in ['taskTime', 'uploadTime']" :key="i" class="info-row">
                    <div class="info-label">
                      <svg-icon :icon-class="i === 0 ? 'task-time' : 'upload-time'" />
                      <span class="pl-2">{{ detailTimeLabels[item] }}</span
                      >:
                    </div>
                    <div class="info-value">{{ useUtils.formatDate(section[item]) }}</div>
                  </div>
                  <div class="action-row">
                    <el-button size="default" class="view-details-btn" @click="openDialog(section)" round>
                      <span class="pr-2"> View Details </span> <svg-icon icon-class="view-card" class="svg-default" />
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载更多按钮 -->
            <div class="load-more-container" v-if="hasMoreDetails(item.id)">
              <el-button class="load-more-button" @click="loadMoreDetails(item.id)" round>
                Load more data
                <svg-icon icon-class="refresh" class="icon-right" />
              </el-button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <el-button
            type="default"
            round
            plain
            size="small"
            @click="
              if (!item.showEvent) {
                setEventList(item.id);
              }
              item.showEvent = !item.showEvent;
            "
          >
            {{ item.showEvent ? 'Hide Events' : 'Show Events' }}
            <svg-icon class="ml-2" :icon-class="item.showEvent ? 'map-up-floor-disable' : 'map-down-floor-disable'" />
          </el-button>
          <el-button type="default" round plain size="small" @click="item.showMore = !item.showMore">
            {{ item.showMore ? 'Hide Detail' : 'Show Detail' }}
            <svg-icon class="ml-2" :icon-class="item.showMore ? 'map-up-floor-disable' : 'map-down-floor-disable'" />
          </el-button>
          <el-button type="default" plain round size="small" @click="handleRowClick(item)">
            <svg-icon icon-class="view" style="width: 18px; height: 18px; margin-right: 4px" />
            <!-- View Details -->
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
  </div>

  <!-- 机器人详情侧边栏 -->
  <el-drawer v-model="showDetailPanel" title="" direction="rtl" size="80%" :before-close="closeDetailPanel" class="robot-detail-drawer">
    <div v-if="selectedRobot" class="detail-content">
      <RobotDetailComponent :robot-data="selectedRobot" @close="closeDetailPanel" />
    </div>
  </el-drawer>

  <EventDetailsDialog v-model:visible="dialogVisible" :event-data="eventData" @submit="handleSubmit" />
</template>

<script setup name="robots" lang="ts">
import { isMobileDevice, convertWithUnit } from '@/utils';
import MetricsCards from '@/views/cleaning/common/MetricsCards.vue';
import {
  getRobotList,
  getRobotTypes,
  getRobotEventList,
  getRobotSnList,
  getRobotNames,
  getRobotEventDetail,
  getRobotStatistics,
  getLocations
} from '@/api/robot';
import * as useUtils from '@/utils/index';
import EventDetailsDialog from '@/views/monitor/robotmanage/robots/eventDetail.vue';
import RobotDetailComponent from '@/views/monitor/robotmanage/robots/RobotDetailComponent.vue';
import RobotFilter from '@/components/RobotFilter/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const datePickerRef = ref(null);
const placeholderText = ref('Search robots');
const tableRef = ref<ElTableInstance>();
const tableHeight = ref(0);
const robotFilterRef = ref(null);
const dialogVisible = ref(false);
const metrics = ref([]);
const eventData = ref<any>(null);
const defaultSort = ref<any>({ prop: '', order: '' });
const companyList = ref([]);
const regionList = ref(['US', 'CA']);
const stateList = ref(['CA', 'BC']);
const cityList = ref(['Irvine', 'Richmond']);
const ws = isMobileDevice() ? ['', '', '', '', '', '', '', '', '', '', '', ''] : [80, 140, 140, 180, 200, 160, 120, 200, 200, 140, 100, 100, 100, 80];
const widths = ref(ws);
const robotTypeList = ref(['PUDU CC1']);
const robotNameList = ref(['Alpha 01', 'Alpha 02', 'Alpha 03', 'Alpha 07', 'Alpha 11', 'Beta 01']);
const robotSNList = ref(['345567782', '945567790', '545567112', '244567112', '884567317', '376668255']);
const loading = ref(true);
const eventLoading = ref(true);
const rowLoadingMap = ref(new Map()); // 每行展开内容的loading状态
//接收数据集合
const alarmList = ref<SensorAlarmForm[]>([]);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const locationList = ref([]);
interface SensorAlarmForm {
  id: string;
  robotType: string;
  robotName: string;
  robotSn: string;
  locationId: string;
  currentTask: string;
  totalTasks: string;
  totalRunningHours: string;
  totalMileage: string;
  totalArea: string;
  status: string;
  showMore?: boolean;
  showEvent?: boolean;
  recentEvents?: Array<string>;
  location?: string;
  waterLevel?: string;
  sewageLevel?: string;
  batteryLevel?: string;
}
interface SensorAlarmQuery extends PageQuery {
  company?: string;
  account?: string;
  region?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  robotSn?: string;
  locationId?: string;
  robotName?: string;
  robotType?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
  showMore?: boolean;
  showEvent?: boolean;
}
//初始化查询表单和分页内容
const initFormData: SensorAlarmForm = {
  id: undefined,
  robotType: undefined,
  robotName: undefined,
  robotSn: undefined,
  locationId: undefined,
  currentTask: undefined,
  totalTasks: undefined,
  totalRunningHours: undefined,
  totalMileage: undefined,
  totalArea: undefined,
  status: undefined
};
const initData: PageData<SensorAlarmForm, SensorAlarmQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    locationId: '',
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
// Get status class based on status
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'online':
    case 'active':
      return 'status-active';
    case 'suspended':
      return 'status-suspended';
    case 'pending':
      return 'status-pending';
    case 'deactivated':
      return 'status-deactivated';
    case 'offline':
      return 'status-offline';
    default:
      return '';
  }
};

const isToday = computed(() => {
  return datePickerRef.value?.isTodayInRange();
});
const data = reactive<PageData<SensorAlarmForm, SensorAlarmQuery>>(initData);
const { queryParams, form, rules } = toRefs<PageData<SensorAlarmForm, SensorAlarmQuery>>(data);

const changeLocation = (type) => {
  console.log('changeLocation');
};
const getTaskDetails = (row) => {
  console.log(row, row.id);
  return [];
};

const openDialog = async (item) => {
  const res = await getRobotEventDetail(item.eventId);
  console.log(item, res, 'open dialog');
  eventData.value = res.data;
  dialogVisible.value = true;
};

const recentItem = (index) => {
  return 'recentItem' + index;
};
const getTooltip = (item, index) => {
  switch (index) {
    case 0:
      return `Critical Events: ${item}`;
    case 1:
      return `Error: ${item}`;
    case 2:
      return `Warning: ${item}`;
    case 3:
      return `Event: ${item}`;
  }
};
const expandedRows = ref(new Set());
const detailMap = ref({});
const detailDisplayCountMap = ref({});
const initialDetailDisplayCount = 4;
const loadMoreCount = 4;
const detailTimeLabels = {
  taskTime: 'Task Time',
  uploadTime: 'Upload Time'
};

// 加载更多详情数据
const loadMoreDetails = (rowId) => {
  if (detailDisplayCountMap.value[rowId]) {
    detailDisplayCountMap.value[rowId] += loadMoreCount;
  }
};

// 获取显示的详情数据
const getDisplayedDetails = (rowId) => {
  if (!detailMap.value[rowId]) return [];
  const displayCount = detailDisplayCountMap.value[rowId] || initialDetailDisplayCount;
  return detailMap.value[rowId].slice(0, displayCount);
};

// 判断是否有更多详情数据
const hasMoreDetails = (rowId) => {
  if (!detailMap.value[rowId]) return false;
  const displayCount = detailDisplayCountMap.value[rowId] || initialDetailDisplayCount;
  return displayCount < detailMap.value[rowId].length;
};

const setEventList = async (id) => {
  // 设置该行的loading状态
  rowLoadingMap.value.set(id, true);

  try {
    const params = { ...queryParams.value };
    params.locationId = robotFilterRef.value?.filterPanelRef?.getZoneId();
    const range = proxy?.addDateRange(params, dateRange.value);
    const res = await getRobotEventList({ ...range, robotSn: id });
    const arr = [];
    res.data.forEach((d) => {
      arr.push({
        className: d.eventLevel,
        dataKey: d.eventDetail,
        title: useUtils.capitalize(d.eventType),
        name: d.eventDetail,
        id: `Event ID: ${d.id}`,
        eventId: d.id,
        tagClass: d.eventLevel,
        tagText: d.eventLevel == 'fatal' ? 'critical' : d.eventLevel,
        taskTime: d.taskTime,
        uploadTime: d.uploadTime
      });
    });
    detailMap.value[id] = arr;
    // 初始化显示计数
    detailDisplayCountMap.value[id] = initialDetailDisplayCount;
  } finally {
    // 完成后取消该行的loading状态
    rowLoadingMap.value.set(id, false);
  }
};

const handleExpandChange = async (row, expandedRowsArray) => {
  // 如果行不在展开状态，直接返回
  if (expandedRowsArray.includes(row)) {
    // 如果行被展开，添加到expandedRows集合中
    expandedRows.value.add(row.location);

    // 只有在没有数据时才加载
    if (!detailMap.value[row.id]) {
      setEventList(row.id);
    }
    // setEventList(row.id);
  } else {
    // 如果行被折叠，从expandedRows集合中移除
    expandedRows.value.delete(row.location);
    return;
  }

  nextTick(() => {
    if (expandedRows.value.has(row.location) && tableRef.value) {
      tableRef.value.toggleRowExpansion(row, true);
    }
  });
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

  // 重置展开行状态
  expandedRows.value.clear();
  // 清除所有行的loading状态
  rowLoadingMap.value.clear();
  getList();
};

const showDetailPanel = ref(false);
const selectedRobot = ref(null);

const handleRowClick = (row: any) => {
  selectedRobot.value = {
    robotSn: row.id,
    totalTasks: row.totalTasks,
    totalRunningHours: row.totalRunningHours,
    totalArea: row.totalArea,
    isToday: datePickerRef.value?.isTodayInRange(),
    ...row
  };
  showDetailPanel.value = true;
};

const closeDetailPanel = () => {
  showDetailPanel.value = false;
  selectedRobot.value = null;
  getList(); // 刷新列表
};
const handleSubmit = (data) => {
  console.log('Received submission data:', data);
  ElMessage.success('Report submitted successfully');
};

const handleSortChange = (column: any) => {
  queryParams.value.isAsc = column.order;
  if (column.order === '') {
    queryParams.value.orderByColumn = '';
  } else {
    queryParams.value.orderByColumn = column.prop;
  }
  getList();
};

const setMetrics = (data) => {
  metrics.value = [
    {
      value: data.robotCount ?? '--',
      unit: '',
      icon: 'total-robots',
      title: 'Total Robots'
    },
    {
      value: data.onlineRobotCount ?? '--',
      unit: '',
      icon: 'online-robots',
      title: 'Online Robots'
    },
    {
      value: data.fatalEventCount ?? '--',
      unit: '',
      color: '#ff384c',
      icon: 'fatal-events',
      title: 'Critical Events'
    },
    {
      value: data.errorCount ?? '--',
      unit: '',
      color: '#ff8401',
      icon: 'critical-errors',
      title: 'Errors'
    }
  ];
};
const getList = async () => {
  loading.value = true;
  getStatistics();
  const params = { ...queryParams.value };
  const location = robotFilterRef.value?.filterPanelRef?.getLastLevelSelection() || {};
  const [key, value] = [location.levelName, location.value];
  params[key] = value;
  const range = proxy?.addDateRange(params, dateRange.value);
  const data = await getRobotList(range);
  alarmList.value = data.rows;
  data.rows.forEach((item) => {
    item.id = item.robotSn;
    item.recentEvents = (item.recentEvents || '').split(',');
  });
  total.value = data.total;

  // 重置展开行状态
  expandedRows.value.clear();
  detailMap.value = {};

  loading.value = false;
};

const getStatistics = async () => {
  const params = { ...queryParams.value };
  const location = robotFilterRef.value?.filterPanelRef?.getLastLevelSelection() || {};
  const [key, value] = [location.levelName, location.value];
  params[key] = value;
  const range = proxy?.addDateRange(params, dateRange.value);
  const res = await getRobotStatistics(range);
  console.log(res, 'getStatistics');
  setMetrics(res.data);
};
onMounted(async () => {
  calculateTableHeight();
  window.addEventListener('resize', calculateTableHeight);
  getList();
  try {
    const [types, sns, names, locations] = await Promise.all([getRobotTypes(), getRobotSnList(), getRobotNames(), getLocations()]);

    robotTypeList.value = types.data;
    robotNameList.value = names.data;
    robotSNList.value = sns.data;
    locationList.value = locations.data;
  } catch (error) {
    console.error('Failed to fetch robot data:', error);
  }
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateTableHeight);
});
const calculateTableHeight = () => {
  const windowHeight = window.innerHeight;
  const tableRect = tableRef.value?.$el?.getBoundingClientRect();
  if (!tableRef.value?.$el || !document.contains(tableRef.value.$el)) {
    return;
  }
  //90px为分页控件的预留高度
  tableHeight.value = windowHeight - tableRect.top - 90;
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
@import '@/views/monitor/robotmanage/robot.scss';

.recentCell {
  display: flex;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 40px;
  height: 24px;
  border-radius: 10px;
}

.recentCell-mobile {
  @extend .recentCell;
  width: 20px;
  height: 18px;
  padding: 2px 4px;
}

.recentItem0 {
  @extend .clean-critical;
}

.recentItem1 {
  @extend .clean-medium;
}

.recentItem2 {
  @extend .clean-warning;
}

.recentItem3 {
  @extend .clean-primary;
}

.status-cell {
  .status-tag {
    width: 56px;
    height: 24px;
    display: flex;
    padding: 4px 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    color: var(--VI-text-B12, #11191e);
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    border-radius: 100px;

    text-align: center;

    &.status-active {
      @extend .clean-primary;
    }

    &.status-suspended {
      @extend .clean-critical;
    }

    &.status-pending {
      @extend .clean-info;
    }

    &.status-deactivated {
      @extend .clean-warning;
    }

    &.status-offline {
      @extend .clean-info;
    }
  }
}
.expanded-row {
  padding: 16px;
  background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
      color: #409eff;
    }
  }

  .task-section {
    display: flex;
    padding: 16px;
    flex-direction: column;
    border-radius: 16px;
    border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
    background: var(--layout-bg_Panel, #fff);
    box-shadow: 0px 1px 2px 0px var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));

    .section-header {
      display: flex;
      padding: 8px 0px;
      align-items: center;
      gap: 16px;

      .section-title {
        overflow: hidden;
        color: var(--VI-text-B12, #11191e);
        text-overflow: ellipsis;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
      }

      .section-tag {
        display: flex;
        height: 24px;
        padding: 4px 8px;
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-radius: 100px;
      }

      .critical,
      .error {
        @extend .clean-medium;
      }

      .fatal {
        @extend .clean-critical;
      }

      .warning {
        @extend .clean-warning;
      }

      .event {
        @extend .clean-primary;
      }
    }

    .section-name {
      overflow: hidden;
      color: var(--VI-text-B49);
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
    }

    .section-id {
      overflow: hidden;
      color: var(--VI-text-B69, #a2aaaf);
      text-overflow: ellipsis;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }

    .section-content {
      padding: 0;
      width: 100%;

      .info-row {
        display: flex;
        align-items: center;

        .info-label {
          width: 120px;
          overflow: hidden;
          display: flex;
          align-items: center;
          color: var(--VI-text-B12);
          text-overflow: ellipsis;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 16px;
        }

        .info-value {
          flex: 1;
          overflow: hidden;
          color: var(--VI-text-B12, #11191e);
          text-align: right;
          text-overflow: ellipsis;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 16px; /* 133.333% */
        }
      }

      .action-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;

        .view-details-btn {
          display: flex;
          align-items: center;
          color: var(--VI-text-B12, #11191e);
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;

          .svg-default {
            fill: #11191e;
            color: #11191e;
            width: 16px !important;
            height: 16px !important;
            cursor: pointer;
            &:hover {
              fill: $color-blue;
            }
          }
        }
      }
    }
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 24px;
  }

  .load-more-button {
    color: var(--VI-text-B12, #11191e);
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
  }

  .icon-right {
    margin-left: 5px;
    color: var(--VI-text-B12, #11191e);
  }

  .no-data-message {
    display: flex;
    justify-content: center;
    padding: 20px;
    width: 100%;
  }
}

@media screen and (min-width: 768px) {
  :deep(.metrics-cards .metric-card) {
    min-width: auto;
    max-width: none;
  }
}
:deep(.el-table__row) {
  td:first-child {
    height: 100%;
    align-items: center;
  }
}
</style>

<style scoped>
.robot-detail-drawer {
  :deep(.el-drawer__header) {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 0;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    height: calc(100vh - 80px);
    overflow: hidden;
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--tableHeaderTextColor);
}

.detail-content {
  height: 100%;
  overflow: auto;
}
</style>
