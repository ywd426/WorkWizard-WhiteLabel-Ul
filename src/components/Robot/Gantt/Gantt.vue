<template>
  <div v-if="!noData" v-loading="chartLoading" class="content">
    <div class="box" :style="{ height: Number(chartOpt.total.length) > 10 ? 'calc(100% - 420px)' : 'auto' }">
      <GanttChart
        v-if="show"
        ref="gantt"
        :data="paginatedData"
        :active-date="activeDate"
        :item-width="width"
        :item-height="height"
        :list-headers="listHeaders"
        :schedule-title="scheduleTitle"
        :unit-time="unitTime"
        :colors="colors"
        :dateRange="dateRange"
        :date-range-list="dateRange"
        @schedule-click="onScheduleClick"
      />
    </div>
    <el-pagination
      v-if="Number(chartOpt.total.length) > 10"
      class="pagination"
      :current-page="currentPage"
      :page-size="fixedPageSize"
      :page-sizes="[]"
      layout="total, prev, pager, next, jumper"
      :total="Number(chartOpt.total.length)"
      @current-change="handlePageChange"
    >
    </el-pagination>
  </div>
  <div v-if="noData" class="noData">No Data</div>
</template>

<script setup lang="ts">
import { formatDate, roundDownToNearestHalfHour } from './date';
import { ref, computed } from 'vue';
import { getGanttData } from '@/api/robot';
import * as useUtils from '@/utils/index';
interface Props {
  config?: {
    type: string;
  };
}
const emit = defineEmits(['openDetail']);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps<Props>();
const viewType = ref('1');
const scheduleTitle = (item) => {
  return item.name + 'function';
};
const chartLoading = ref(true);
const noData = ref(false);
const gantt = ref(null);
const show = ref(false);
const width = ref(56);
const height = ref(68);
const currentPage = ref(1);
const fixedPageSize = ref(10);
const activeDate = ref('2022-01-30');

const status = ['In Progress', 'Scheduled', 'Uncompleted', 'Done'];
const data = ref([]);
const listHeaders = ref([]);
const unitTime = ref('day');
const colors = ref({
  Scheduled: ['rgba(102, 194, 255, 0.8)', 'rgba(102, 194, 255, 0.8)'],
  'In Progress': ['rgba(0,153,255,1)', 'rgba(102, 194, 255, 1)'],
  Done: ['rgba(0, 186, 74, 1)', 'rgba(102, 214, 146, 1)'],
  Uncompleted: ['rgba(255, 56, 76, 1)', 'rgba(255, 136, 148, 1)']
});
let schduleList = [];
let chartOpt = ref({
  data: [],
  dateRange: [],
  listHeaders: [],
  total: []
});
const dateRange = ref([]);

const getColor = (item, index) => {
  switch (item.status) {
    case 'In Progress':
      return colors.value['In Progress'][index];
    case 'Done':
      return colors.value.Done[index];
    case 'Scheduled':
      return colors.value.Scheduled[index];
    case 'Uncompleted':
      return colors.value.Uncompleted[index];
    default:
      return colors.value['In Progress'][index];
  }
};

const onScheduleClick = (item) => {
  console.log('click', item);
  if (!item.id) {
    return;
  }
  const data = {
    id: item.id,
    viewType: viewType.value
  };
  emit('openDetail', data);
};

const convertDataCache = new Map();
const convertData = (opts) => {
  if (!opts.data) return data.value;
  const cacheKey = JSON.stringify(opts.data);
  if (convertDataCache.has(cacheKey)) {
    return convertDataCache.get(cacheKey);
  }
  const startIndex = (currentPage.value - 1) * fixedPageSize.value;
  const endIndex = startIndex + fixedPageSize.value;
  const pageData = opts.data.slice(startIndex, endIndex);
  const chartData = [];
  pageData.forEach((robot) => {
    if (!robot.details || !robot.details.length) return;
    const sortedDetails = [...robot.details].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const filteredDetails = sortedDetails.filter((detail, index) => {
      if (index === 0) return true;

      const currentStart = new Date(detail.startTime).getTime();
      const currentEnd = new Date(detail.endTime).getTime();

      for (let i = 0; i < index; i++) {
        const prevStart = new Date(sortedDetails[i].startTime).getTime();
        const prevEnd = new Date(sortedDetails[i].endTime).getTime();

        if (currentStart >= prevStart && currentEnd <= prevEnd) {
          return false; // 如果当前任务的时间范围完全被包含在之前的任务中，则过滤掉
        }
      }
      return true;
    });
    const scheduleItems = filteredDetails.map((detail, index) => {
      const status = useUtils.revertStatus(detail.status, props.config.type);
      return {
        id: detail.id || (parseInt(robot.robotSn.slice(-4)) * 1000 + index),
        name: detail.taskName || (viewType.value === '2' ? 'Charging' : detail.taskName),
        progress: detail.progress,
        backgroundColor: getColor(
          {
            status
          },
          1
        ),
        progressColor: getColor(
          {
            status
          },
          0
        ),
        textColor: 'rgba(255, 255, 255, 1)',
        desc: robot.location,
        status,
        days: [roundDownToNearestHalfHour(detail.startTime), roundDownToNearestHalfHour(detail.endTime)]
      };
    });

    chartData.push({
      name: robot.robotName,
      SN: robot.robotSn,
      type: 'normal', // normal | multipleDays
      schedule: scheduleItems
    });
  });
  convertDataCache.set(cacheKey, chartData);
  return chartData;
};

const getDateRangeCache = new Map();
const getDateRange = (opts) => {
  const cacheKey = JSON.stringify(opts);
  if (getDateRangeCache.has(cacheKey)) {
    return getDateRangeCache.get(cacheKey);
  }
  const timeArray = [];
  opts.forEach((robot) => {
    robot.schedule.forEach((task) => {
      timeArray.push(...task.days);
    });
  });

  if (timeArray.length === 0) {
    return [];
  }
  const dateArray = timeArray.map((time) => new Date(time));
  const maxDate = dateArray.reduce((max, current) => (current > max ? current : max), dateArray[0]) || '';
  const minDate = dateArray.reduce((min, current) => (current < min ? current : min), dateArray[0]) || '';
  const maxFormatted = formatDate(maxDate);
  const minFormatted = formatDate(minDate);
  const result = [minFormatted, maxFormatted];
  getDateRangeCache.set(cacheKey, result);
  return result;
};

const setData = (arr) => {
  schduleList = [];
  console.time('convertData execution time');
  arr.forEach((item) => {
    if (item.planArea) {
      item.planArea = `${item.planArea}m² / ${item.actualArea}m²`;
    }

    if (item.efficiency) {
      item.efficiency += 'm²/h';
    }

    if (item.consumption) {
      item.consumption += 'kWh';
    }

    item.status = useUtils.revertStatus(item.status, props.config.type).toUpperCase();

    schduleList.push(item);
  });
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  data.value = convertData({
    data: chartOpt.value.total
  });
};

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * fixedPageSize.value;
  const endIndex = startIndex + fixedPageSize.value;
  return data.value.slice(startIndex, endIndex);
});

const getDateRangeByType = (type: number): [string, string] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;

  switch (type) {
    case 0:
      startDate = today;
      break;
    case 1:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      break;
    case 2:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 3:
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    default:
      startDate = today;
  }

  return [formatDate(startDate), formatDate(now)];
};

const update = async (options) => {
  if (props.config) {
    viewType.value = props.config.type;
  }
  try {
    noData.value = false;
    chartLoading.value = true;
    show.value = false;
    const pageQuery = {
      pageNum: currentPage.value,
      pageSize: fixedPageSize.value,
      orderByColumn: 'robotSn',
      isAsc: 'descending',
      type: options.type
    };

    if (options.params) {
      Object.keys(options.params).forEach((key) => {
        pageQuery[key] = options.params[key];
      });
    }

    let range = options.dateRange || [];
    if (options.dateRange[0] === '' && options.dateRange[1] === '') {
      range = getDateRangeByType(3);
    }

    const chartData = await getGanttData(proxy?.addDateRange(pageQuery, range));

    convertDataCache.clear();
    getDateRangeCache.clear();
    await Promise.resolve();
    setData(chartData.rows);

    listHeaders.value = options.listHeaders || [
      { label: 'Robot', value: 'name' },
      { label: 'SN', value: 'SN' }
    ];

    chartOpt.value = {
      dateRange: options.dateRange,
      data: schduleList,
      listHeaders: listHeaders.value,
      total: chartData.rows
    };
    data.value = convertData(chartOpt.value);
    dateRange.value = getDateRange(data.value);
    if (dateRange.value.length > 0) {
      noData.value = false;
      await nextTick(); // 等待 DOM 更新
      show.value = true;
    } else {
      noData.value = true;
    }
  } catch (error) {
    console.error('Update Gantt Chart failed:', error);
    noData.value = true;
  } finally {
    chartLoading.value = false;
  }
};

defineExpose({
  update: (opts: { [key: string]: any }) => {
    update(opts);
  }
});
</script>

<style scoped>
.content {
  width: 100%;
  height: calc(100vh - 404px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.head {
  margin: 20px 0;
}

.head button {
  margin: 0 10px;
  padding: 0 20px;
  height: 40px;
}

.box {
  flex: 1;
}

.noData {
  color: var(--el-text-color-secondary);
  line-height: 60px;
  width: 100%;
  height: calc(100vh - 404px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pagination {
  height: 3rem;
  display: flex;
  justify-content: center;
}

.link {
  height: 80px;
  line-height: 80px;
  background-color: #eee;
}
</style>
