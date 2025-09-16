<template>
  <el-dialog v-model="drawerVisible" class="fullChart" :destroy-on-close="true" append-to-body>
    <el-row>
      <el-col :span="24" style="justify-content: space-between; align-items: center; display: flex">
        <div class="tab-container">
          <button
            v-for="tab in tabs"
            :key="tab.component"
            :class="{ active: currentTab === tab.component }"
            class="tab-button"
            @click="changeTab(tab.component)"
          >
            {{ tab.label }}
          </button>
        </div>
        <el-icon class="cursor-pointer" @click="drawerVisible = false"><Close /></el-icon>
      </el-col>
    </el-row>
    <!-- Selected Robot Details -->
    <div v-loading="loading" class="robot-details">
      <div v-if="currentTab == 'SubPage1'" class="task-tab">
        <div class="detail-section">
          <span class="task-name" :title="trajectoryDetail.taskName">{{ trajectoryDetail.taskName || 'N/A' }}</span>
          <span class="task-status" :class="useUtils.scheduleFormat(useUtils.revertStatus(trajectoryDetail.status))">{{
            useUtils.revertStatus(trajectoryDetail.status) || 'Unknown'
          }}</span>
          <div class="task-time">
            <span class="label">Timestamp:</span>
            <span class="value">{{ useUtils.formatDate(trajectoryDetail.updateTime) || 'N/A' }}</span>
          </div>
        </div>
        <div class="task-grid">
          <div v-for="(item, index) in statsItems" :key="index" class="stats-item w-full flex flex-row justify-between items-center">
            <div class="flex-1 flex items-center">
              <div class="icon-container">
                <svg-icon :icon-class="item.icon" />
              </div>
              <span class="stats-label">{{ item.label }}</span>
            </div>
            <div class="stats-content">
              <span class="stats-value">{{ item.value }} {{ item.unit }} </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 事件列表 -->
      <div v-if="currentTab == 'SubPage2'" class="event-tab">
        <div v-if="trajectoryDetail.eventList && trajectoryDetail.eventList.length > 0" class="event-list">
          <div v-for="(event, index) in trajectoryDetail.eventList" :key="index" class="event-item">
            <div class="event-top">
              <div class="event-detail">
                {{ event.eventDetail || 'No details available' }}
              </div>
              <div class="event-time">
                Timestamp:<span style="margin-left: 10px">{{ event.taskTime ? useUtils.formatDate(event.taskTime) : 'N/A' }}</span>
              </div>
            </div>

            <div class="event-action">
              <span class="event-level" :class="getEventLevelClass(event.eventLevel)">
                {{ event.eventLevel || 'N/A' }}
              </span>
              <el-button class="event-info" @click="openEventDetail(event)">
                <svg-icon icon-class="eye-open" />
              </el-button>
            </div>
          </div>
        </div>
        <div v-else class="no-events">No events recorded</div>
      </div>
    </div>
  </el-dialog>
  <EventDetailsDialog v-model:visible="dialogVisible" :event-data="eventData" @submit="handleSubmit" />
</template>

<script setup name="RobotTrajectoryDetailDrawer" lang="ts">
import { ref, watch } from 'vue';
import * as useUtils from '@/utils/index';
import { convertWithUnit } from '@/utils';
import EventDetailsDialog from '@/views/monitor/robotmanage/robots/eventDetail.vue';
import { getRobotTrajectoryDetail, getRobotEventDetail } from '@/api/robot';

const currentTab = ref('SubPage1');
const tabs = ref([
  { label: 'Task', component: 'SubPage1' },
  { label: 'Incidents', component: 'SubPage2' }
]);

interface EventItem {
  id?: string;
  eventLevel?: string;
  taskTime?: string;
  eventDetail?: string;
}

interface TrajectoryDetail {
  robotSn?: string;
  robotName?: string;
  taskName?: string;
  startTime?: string;
  endTime?: string;
  updateTime?: string;
  duration?: string;
  totalArea?: string;
  coverage?: string;
  status?: string;
  eventList?: EventItem[];
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  trajectoryId: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:visible']);

const drawerVisible = ref(false);
const trajectoryDetail = ref<TrajectoryDetail>({});
const loading = ref(false);
const eventData = ref<any>(null);
const dialogVisible = ref(false);
const statsItems = ref([
  {
    icon: 'active-start-time',
    color: 'cyan',
    label: 'Start',
    value: '0',
    unit: ''
  },
  {
    icon: 'active-completion-time',
    color: 'blue',
    label: 'End',
    value: '0',
    unit: ''
  },
  {
    icon: 'task-response-time',
    color: 'green',
    label: 'Duration',
    value: '0',
    unit: 'min'
  },
  {
    icon: 'total-planned-area',
    color: 'purple',
    label: 'Total Area',
    value: '0',
    unit: ''
  },
  {
    icon: 'coverage',
    color: 'purple',
    label: 'Coverage',
    value: '0',
    unit: '%'
  }
]);
const changeTab = (tabName: string) => {
  currentTab.value = tabName;
};

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    drawerVisible.value = newVal;
    if (newVal && props.trajectoryId) {
      loadTrajectoryDetail();
    }
  }
);

// 监听drawerVisible变化
watch(drawerVisible, (newVal) => {
  emits('update:visible', newVal);
});

const handleSubmit = (data) => {
  ElMessage.success('Report submitted successfully');
};

const openEventDetail = async (event: EventItem) => {
  const res = await getRobotEventDetail(event.id);
  drawerVisible.value = false;
  eventData.value = res.data;
  dialogVisible.value = true;
};

// 获取轨迹详情
const loadTrajectoryDetail = async () => {
  if (!props.trajectoryId) return;
  currentTab.value = 'SubPage1';
  loading.value = true;
  try {
    const res = await getRobotTrajectoryDetail(props.trajectoryId);
    trajectoryDetail.value = res?.data || [];
    if (trajectoryDetail.value) {
      statsItems.value[0].value = useUtils.formatDate(trajectoryDetail.value.startTime);
      statsItems.value[1].value = useUtils.formatDate(trajectoryDetail.value.endTime);
      statsItems.value[2].value = `${trajectoryDetail.value.duration || 0}`;
      statsItems.value[3].value = convertWithUnit({ value: trajectoryDetail.value.totalArea || 0, type: 'area' });
      statsItems.value[4].value = `${trajectoryDetail.value.coverage || 0}`;
    }

    if (!res.data) {
      drawerVisible.value = false;
    }
  } catch (error) {
    console.error('Failed to load trajectory details:', error);
  } finally {
    loading.value = false;
  }
};
// 获取事件级别样式类
const getEventLevelClass = (level: string) => {
  if (!level) return 'event-level-default';
  const levelLower = level.toLowerCase();

  if (levelLower.includes('fatal')) {
    return 'event-level-error';
  } else if (levelLower.includes('error')) {
    return 'event-level-warning';
  } else if (levelLower.includes('warning')) {
    return 'event-level-info';
  } else {
    return 'event-level-default';
  }
};

// 清空数据
const clearData = () => {
  trajectoryDetail.value = {};
};

defineExpose({
  clearData
});
</script>

<style lang="scss">
.fullChart {
  height: 374px;
  width: 360px;
  padding: 0;
  border-radius: 10px;

  header {
    display: none;
  }

  .el-dialog__body {
    max-height: 100% !important;
    height: 100%;
    padding: 0 !important;
  }
}
</style>

<style scoped lang="scss">
.robot-details {
  gap: 8px;
  padding: 16px;
}

.task-tab {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 16px;
  border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
}

.detail-section {
  display: flex;
  padding: 8px 0;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  row-gap: 4px;
  align-self: stretch;
  flex-wrap: wrap;

  .task-name {
    color: var(--VI-text-B12, #11191e);
    font-size: 16px;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    max-width: 208px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-status {
    display: flex;
    padding: 4px 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
}

.task-time {
  color: var(--VI-text-B12, #11191e);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.task-grid {
  display: flex;
  width: 312px;
  padding: 16px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: linear-gradient(
      90deg,
      var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
      var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
      var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
      var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
      var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
      var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
      var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
    ),
    var(--layout-bg_Element, #fff);
}

.event-tab {
  gap: 8px;
}

.event-list {
  gap: 8px;
}

.event-item {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
  background: var(--layout-bg_TextSelection, #fff);
  box-shadow: 0 1px 2px 0 var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));
}

.event-top {
  gap: 4px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.event-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.event-level {
  display: flex;
  height: 24px;
  padding: 4px 17px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;

  &.event-level-error {
    color: var(--color-danger);
    background: var(--colors-flat-danger-flat10, rgba(255, 56, 76, 0.1));
  }

  &.event-level-warning {
    color: var(--color-orange);
    background: rgba(255, 132, 1, 0.15);
  }

  &.event-level-info {
    color: var(--color-yellow);
    background: var(--colors-flat-warning-flat10, rgba(237, 182, 1, 0.1));
  }

  &.event-level-default {
    color: var(--color-dark-blue);
    background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
  }
}

.event-time {
  color: var(--el-text-color-b12);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-base-border-color);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.event-detail {
  color: var(--reverseBaseBackground);
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
}

.event-info {
  margin-left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.no-events {
  text-align: center;
  color: #909399;
  font-style: italic;
  padding: 20px;
}

.tab-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 12px;
}

.tab-button {
  width: fit-content;
  height: 64px;
  padding: 0 8px;
  border: none;
  background: none;
  color: var(--el-text-color-b12);
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  position: relative;
  cursor: pointer;
}

.tab-button::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: var(--colors-base-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-button.active,
.tab-button:hover {
  color: var(--colors-base-primary);
}

.tab-button.active::after,
.tab-button:hover::after {
  transform: scaleX(1);
}

.cursor-pointer {
  margin-right: 20px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
}

.icon-container {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #1890ff;

  svg {
    width: 24px;
    height: 24px;
  }
}

.stats-label {
  display: -webkit-box;
  width: 80px;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  font-size: 12px;
  color: var(--el-text-color-b49);
  font-weight: 400;
  line-height: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.stats-value {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-b12);
  font-weight: 400;
  line-height: 16px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
