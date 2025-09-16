<template>
  <div id="task-center-parent-node" class="dashboard-container">
    <Settings :page-id="pageId" :showCostBaselineSetting="true" />
    <filter-panel :showForecasts="true" :sampleMode="true" :page-id="pageId" />
    <metrics-cards ref="metricsRef" :metrics="metrics" :tabs="tabs" :activeTab="curTab" @change-tab="changeTab" :max-width="maxWidth" />
    <priority-card v-if="curTab === 2" :showTitle="false" :metrics="priorities" />
    <div class="dashboard-content">
      <active-tasks :page-id="pageId" />
    </div>
    <div class="dashboard-content">
      <div class="f3">
        <AI-recommend :page-id="pageId" />
      </div>
      <div class="f2">
        <task-template :page-id="pageId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Settings from '@/views/cleaning/settings';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import MetricsCards from '@/views/cleaning/common/MetricsCards';
import ActiveTasks from '@/views/cleaning/taskCenter/ActiveTasks.vue';
import AIRecommend from '@/views/cleaning/taskCenter/AIRecommend';
import TaskTemplate from '@/views/cleaning/taskCenter/TaskTemplate';
import { storeToRefs } from 'pinia';
import PriorityCard from '@/views/cleaning/taskCenter/PriorityCard.vue';
import { useCleanStore } from '@/store/modules/cleaning';
import { getTaskStatistics } from '@/api/clean/task';
import { useDebounceFn } from '@vueuse/core';
const metricsRef = ref(null);
const cleanStore = useCleanStore();
const { filters } = storeToRefs(cleanStore);
const alertRef = ref(null);
const activeStatus = ref(0);
const curTab = ref(1);
const priorities = ref([]);
const maxWidth = ref('360px');

const props = defineProps({
  pageId: {
    type: String,
    default: 'taskCenter'
  }
});

// 控制警报面板显示的状态
const showMarkerAlerts = ref(false);
// 存储选中的标记信息
const selectedMarker = ref({
  id: '',
  name: '',
  position: null,
  data: null
});

const metrics = ref([]);

const tabs = ref([
  {
    label: 'Today at a Glance',
    value: 1
  },
  {
    label: 'Performance',
    value: 2
  },
  {
    label: 'Cost',
    value: 3
  }
]);

const getTrend = (cur, pre) => {
  // 获取涨幅百分比
  const percent = pre == 0 ? 100 : ((cur - pre) / pre) * 100;
  return {
    diff: cur - pre,
    percentage: percent.toFixed(2),
    percent: percent.toFixed(2) + '%',
    trend: percent > 0 ? 'positive' : 'negative'
  };
};

const setMetrics = (node) => {
  const data = node.workOrderStats || {};
  const dueToday = getTrend(data.dueToday?.currentValue, data.dueToday?.previousValue);
  const highPriority = getTrend(data.highPriorityDueToday?.currentValue, data.highPriorityDueToday?.previousValue);
  const completed = getTrend(data.completedToday?.currentValue, data.completedToday?.previousValue);
  const newCreated = getTrend(data.newCreated?.currentValue, data.newCreated?.previousValue);
  const remainin = getTrend(data.remainingToday?.currentValue, data.remainingToday?.previousValue);
  metrics.value = [
    {
      value: data.dueToday.currentValue ?? '--',
      unit: '',
      icon: 'task',
      title: 'Work Orders Due Today',
      trend: { value: dueToday.percent, type: dueToday.trend },
      description: `Compared to Yesterday: ${dueToday.diff}`
    },
    {
      value: data.highPriorityDueToday.currentValue ?? '--',
      unit: '',
      icon: 'task-priority',
      title: 'High Priority Due Today',
      trend: { value: highPriority.percent, type: highPriority.trend },
      description: `Compared to Yesterday: ${highPriority.diff}`
    },
    {
      value: data.completedToday.currentValue ?? '--',
      unit: '',
      icon: 'task-complated',
      title: 'Completed Today',
      trend: { value: completed.percent, type: completed.trend },
      description: `Compared to Yesterday: ${completed.diff}`
    },
    {
      value: data.newCreated.currentValue ?? '--',
      unit: '',
      icon: 'task-created',
      title: 'New Work Order Created',
      trend: { value: newCreated.percent, type: newCreated.trend },
      description: `Compared to Yesterday: ${newCreated.diff}`
    },
    {
      value: data.remainingToday.currentValue ?? '--',
      unit: '',
      icon: 'task-remain',
      title: 'Work Orders Remaining Today',
      trend: { value: remainin.percent, type: remainin.trend },
      description: `Compared to Yesterday: ${remainin.diff}`
    }
  ];
};

const setPerformanceMetrics = (node) => {
  const data = node.performanceStats || {};
  const avgResponseTime = getTrend(data.avgResponseTime?.currentValue, data.avgResponseTime?.previousValue);
  const avgCompletionTime = getTrend(data.avgCompletionTime?.currentValue, data.avgCompletionTime?.previousValue);
  const highPriority = getTrend(data.highPriority?.currentValue, data.highPriority?.previousValue);
  const mediumPriority = getTrend(data.mediumPriority?.currentValue, data.mediumPriority?.previousValue);
  const lowPriority = getTrend(data.lowPriority?.currentValue, data.lowPriority?.previousValue);

  metrics.value = [
    {
      value: data.avgResponseTime?.currentValue ?? '--',
      unit: 'hrs',
      icon: 'response-time',
      title: 'Average Response Time',
      trend: { value: avgResponseTime.percent, type: avgResponseTime.trend },
      description: `Across all active tasks, Compared to Yesterday: ${avgResponseTime.diff}`
    },
    {
      value: data.avgCompletionTime?.currentValue ?? '--',
      unit: 'hrs',
      icon: 'completion-time',
      title: 'Average Completion Time',
      trend: { value: avgCompletionTime.percent, type: avgCompletionTime.trend },
      description: `Across all active tasks, Compared to Yesterday: ${avgCompletionTime.diff}`
    }
  ];
  priorities.value = [
    {
      value: data.highPriority?.currentValue ?? '--',
      type: 'high',
      label: 'High Priority',
      percentage: highPriority.percentage,
      desc: `Compared to Yesterday: ${highPriority.percent}`,
      trend: highPriority.trend
    },
    {
      value: data.mediumPriority?.currentValue ?? '--',
      type: 'medium',
      label: 'Medium Priority',
      percentage: mediumPriority.percentage,
      trend: mediumPriority.trend,
      desc: `Compared to previous period: ${mediumPriority.percent}`
    },
    {
      value: data.lowPriority?.currentValue ?? '--',
      type: 'low',
      title: 'Low Priority',
      percentage: lowPriority.percentage,
      trend: lowPriority.trend,
      desc: `Compared to previous period: ${lowPriority.percent}`
    }
  ];
};

const setCostMetrics = (node) => {
  const data = node.costStats || {};
  const laborHours = getTrend(data.laborHoursToday?.currentValue, data.laborHoursToday?.previousValue);
  const laborHoursSaved = getTrend(data.laborHoursSavedToday?.currentValue, data.laborHoursSavedToday?.previousValue);
  const totalCost = getTrend(data.totalCostToday?.currentValue, data.totalCostToday?.previousValue);
  const totalSavings = getTrend(data.totalSavingsToday?.currentValue, data.totalSavingsToday?.previousValue);

  metrics.value = [
    {
      value: data.laborHoursToday?.currentValue ?? '--',
      unit: 'hrs',
      icon: 'labor-hours',
      title: 'Labor Hours Today',
      trend: { value: `${laborHours.percent} Faster`, type: laborHours.trend },
      description: `Across all active tasks,\nCompared to Yesterday: ${laborHours.diff} hrs`
    },
    {
      value: data.laborHoursSavedToday?.currentValue ?? '--',
      unit: 'hrs',
      icon: 'labor-hours-saved',
      title: 'Labor Hours Saved Today',
      trend: { value: `${laborHoursSaved.percent}`, type: laborHoursSaved.trend },
      description: `Across all active tasks,\nCompared to Yesterday: ${laborHoursSaved.diff} hrs`
    },
    {
      value: data.totalCostToday?.currentValue ?? '--',
      unit: '',
      icon: 'total-cost',
      title: 'Total Cost Today',
      trend: { value: totalCost.percent, type: totalCost.trend },
      description: `Based on hourly rates,\nCompared to Yesterday: $ ${totalCost.diff}`
    },
    {
      value: data.totalSavingsToday?.currentValue ?? '--',
      unit: '',
      icon: 'total-saved',
      title: 'Total Savings Today',
      trend: { value: totalSavings.percent, type: totalSavings.trend },
      description: `Based on hourly rates,\nCompared to Yesterday: $ ${totalSavings.diff}`
    }
  ];
};
const getStaticsData = useDebounceFn(async () => {
  const params = cleanStore.getPageFilterParams(props.pageId);
  const options = {
    ...params,
    type: curTab.value.toString()
  };
  console.log(options, 'task center getTaskStatistics params');

  const res = await getTaskStatistics(options);
  console.log('task center getTaskStatistics', res);
  if (curTab.value === 1) {
    setMetrics(res.data);
  } else if (curTab.value === 2) {
    setPerformanceMetrics(res.data);
  } else if (curTab.value === 3) {
    setCostMetrics(res.data);
  }
}, 100);

const changeTab = (value) => {
  console.log('changeTab', value);
  curTab.value = value;
  if (value === 1) {
    getStaticsData();
    maxWidth.value = '360px';
  } else if (value === 2) {
    maxWidth.value = 'auto';
    getStaticsData();
  } else if (value === 3) {
    maxWidth.value = '360px';
    getStaticsData();
  }
};

onMounted(() => {
  getStaticsData();
});

// 监听过滤条件变化
watch(
  () => cleanStore.getPageFilterParams('taskCenter'),
  (newFilters) => {
    console.log('Filters changed:', newFilters);
    // 根据过滤条件更新警报列表
    getStaticsData();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.dashboard-container {
  padding: 16px;
  background-color: white;
  min-height: calc(100vh - 84px);

  .dashboard-content {
    display: flex;
    gap: 16px;
    margin-top: 16px;

    .left-panel {
      flex: 0 0 50%; // 固定宽度为50%
      max-width: 50%; // 确保不超过50%
    }

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}

// 自定义弹出面板样式
.custom-alerts-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;

  .popup-content {
    position: relative;
    width: 50%;
    max-width: 800px;
    max-height: 80vh;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    overflow: auto;

    .popup-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      background-color: #fff;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

:deep(.metric-card) {
  max-width: 100% !important;
}
</style>
