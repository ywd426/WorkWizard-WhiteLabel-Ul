<template>
  <CleanCard :header="header" :showSelect="false" :showActionMenu="false">
    <template #header-actions v-if="showHeaderActions">
      <slot name="header-actions"></slot>
    </template>
    <div class="chart-container">
      <div class="task-status-list">
        <!-- 状态标签栏，可控制显示/隐藏 -->
        <div class="filter-tabs-node" v-if="showTabs">
          <div class="filter-tabs">
            <div
              v-for="tab in statusTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ active: activeStatus === tab.value }"
              @click="activeStatus = tab.value"
            >
              {{ tab.label }}
            </div>
          </div>
          <svg-icon icon-class="refresh" class="refresh-icon" @click="refresh" />
        </div>

        <div class="status-list">
          <div v-for="(location, locationIndex) in filteredLocations" :key="locationIndex" class="location-group">
            <div class="location-header" @click="toggleLocationExpand(location, locationIndex)" v-loading="location.loading">
              <div class="flex flex-row">
                <div class="expand-icon" :class="{ 'expanded': location.expanded }">
                  <el-icon v-show="location.expanded"><ArrowUp /></el-icon>
                  <el-icon v-show="!location.expanded"><ArrowRight /></el-icon>
                </div>
                <div class="location-title">
                  <svg-icon icon-class="location" class="location-icon" />
                  <span>{{ location.name }}</span>
                </div>
                
              </div>
              <div v-if="location.itemCount" class="task-count">{{ location.itemCount }} Work Orders</div>
              <slot name="location-actions" :localtionId="location.id"></slot>
            </div>

            <div class="location-content" v-if="location.expanded">
              <div
                v-for="(task, taskIndex) in avialibleTaskMaps[location.id] || []"
                :key="taskIndex"
                class="task-item"
                :class="{ 'completed': task.status === 'completed', 'modern-style': props.useModernStyle }"
              >
                <!-- 原有风格 -->
                <div v-if="!props.useModernStyle" class="task-card">
                  <div class="task-card-left-border" :class="getSeverity(task.severity)"></div>
                  <div class="task-card-content">
                    <div class="task-card-header">
                      <div class="task-icon-container">
                        <svg-icon :icon-class="getStatusIcon(task.severity, task.icon)" :class="getSeverity(task.severity)" class="svg" />
                      </div>
                      <div class="task-main-info">
                        <div class="task-name">{{ task.name }}</div>
                        <div v-if="task.location" class="task-details">
                          {{ task.location }}
                        </div>
                        <div v-if="!task.location" class="task-details flex">
                          {{ task.kind }}
                          <div v-if="task.sensors">
                            <span :class="getMarkerClass(task.status)"> {{ task.type === 'low' ? '<' : '>' }} {{ task.percentage }}%</span>
                            for <span>{{ task.duration }} ({{ task.sensors }})</span>
                          </div>
                          <div v-if="task.duration">
                            <span :class="getMarkerClass(task.status)" class="pl-2"> {{ task.duration }} </span>
                          </div>
                        </div>

                        <div v-if="task.lastCheck" class="task-due-date">
                          Due Date: {{ useUtils.formatDateValue(new Date(task.lastCheck)) }} -
                          {{ useUtils.formatDateValue(new Date(task.nextCheck)) }}
                        </div>
                        <div v-if="task.createdTime" class="task-due-date">
                          {{ useUtils.formatDateValue(new Date(task.createdTime)) }}
                        </div>
                      </div>
                      <div v-if="showPending" class="task-status-badge" :class="getStatusClass(task.status)">
                        {{ statusMap[task.status] || task.status }}
                      </div>
                    </div>
                    <div v-if="task.assignedTo" class="task-card-container">
                      <div class="assign-section">
                        <div class="assign-label">Assign to:</div>
                        <div v-if="!task.editable" class="assign-users">
                          <div v-for="(user, userIndex) in task.assignedTo" :key="userIndex" class="user-tag">
                            <span>@{{ user }}</span>
                          </div>
                        </div>
                        <div v-else class="assign-input">
                          <el-input-tag v-model="task.assignedTo" tag-effect="plain" tag-type="primary" @blur="saveAssigned(task)" />
                        </div>
                      </div>
                    </div>

                    <div class="task-card-footer">
                      <div class="action-buttons">
                        <slot name="action-buttons" :task="task" :localtionId="location.id"></slot>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 新的现代风格 -->
                <div v-if="props.useModernStyle" class="modern-task-card">
                  <div class="modern-card-header flex justify-between w-full">
                    <div class="flex items-center">
                        <div class="task-icon-container flex">
                          <svg-icon :icon-class="getStatusIcon(task.severity, task.icon)" :class="getSeverity(task.severity)" class="svg" />
                        </div>
                        <div v-if="showPending" class="task-status-badge" :class="getNotificateStatusClass(task.status)">
                            {{ statusMap[task.status] || task.status }}
                        </div>
                    </div>
                    <div class="action-buttons flex gap-2">
                      <slot name="action-buttons" :task="task" :localtionId="location.id"></slot>
                    </div>
                  </div>
                  
                  <div class="modern-card-content">
                    <div class="modern-task-title">{{ task.name }}</div>
                    <div class="modern-task-description">
                      {{ task.location || task.context || 'Task description' }}
                    </div>
                    
                    <div class="modern-task-meta">
                      <div class="meta-item">
                        <span class="meta-label">Source:</span>
                        <span class="meta-value">{{ task.kind || 'System' }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Due Date:</span>
                        <span class="meta-value">{{ useUtils.formatDateValue(new Date(task.createdTime)) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Load more data button -->
            <div v-if="location.expanded && hasMoreDetails && hasMoreDetails(location.id)" class="load-more-container">
              <el-button 
                class="load-more-button"
                @click="handleLoadMoreDetails(location.id)"
                round
              >
                Load more data
                <svg-icon icon-class="refresh" class="icon-right" />
              </el-button>
            </div>
          </div>
          <div v-if="filteredLocations.length === 0" class="noData">{{ noData }}</div>
        </div>
        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handlePagination"
        />
      </div>
    </div>
  </CleanCard>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, toRefs, nextTick } from 'vue';
import CleanCard from '@/views/cleaning/common/CleanCard.vue';
import { ArrowRight, ArrowUp } from '@element-plus/icons-vue';
import { useCleanStore } from '@/store/modules/cleaning';
import { storeToRefs } from 'pinia';
import * as useUtils from '@/utils/index';
const props = defineProps({
  header: {
    type: String,
    default: 'Task List'
  },
  height: {
    type: String,
    default: '300px'
  },
  showTabs: {
    type: Boolean,
    default: true
  },
  showPending: {
    type: Boolean,
    default: true
  },
  showHeaderActions: {
    type: Boolean,
    default: true
  },
  pageId: {
    type: String,
    required: true
  },
  // 接收从父组件传入的任务数据
  taskData: {
    type: Array,
    default: () => []
  },
  // 接收从父组件传入的总数
  totalCount: {
    type: Number,
    default: 0
  },
  getTaskData: {
    type: Function,
    default: null
  },
  noData: {
    type: String,
    default: 'No Work Order'
  },
  loadMoreDetails: {
    type: Function,
    default: null
  },
  hasMoreDetails: {
    type: Function,
    default: null
  },
  useModernStyle: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['refresh', 'pagination', 'editSubmit']);

// 使用 clean store
const cleanStore = useCleanStore();
const { filters } = storeToRefs(cleanStore);
const loading = ref(false);

// 分页参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10
  },
  total: 0
});

const avialibleTaskMaps = ref({});

const getAvaliableData = async (task) => {
  console.log(task, 'row');
  let tasks = [];
  if (props.getTaskData) {
    tasks = await props.getTaskData(task);
  } else {
    tasks = task.tasks;
  }

  console.log(tasks, 'getAvaliableData in task list file');
  // 过滤掉禁用的任务
  const filteredTasks = tasks.filter((d) => !d.disable);
  // 使用解构赋值确保响应式更新
  avialibleTaskMaps.value[task.id] = filteredTasks;
  return filteredTasks;
};

// 处理加载更多数据
const handleLoadMoreDetails = (locationId) => {
  if (props.loadMoreDetails) {
    props.loadMoreDetails(locationId);
    // 重新获取该位置的数据以更新显示
    const location = locations.value.find(loc => loc.id === locationId);
    if (location) {
      getAvaliableData(location);
    }
  }
};
const getSeverity = (status) => { 
  const statusArr = ['fatal', 'error', 'warning', 'event', 'done', 'info', 'critical'];
  return statusArr.find(d => d.toLowerCase() === status.toLowerCase()) || 'normal'
};
const { queryParams, total } = toRefs(data);

// 监听props中的totalCount变化
watch(
  () => props.totalCount,
  (newVal) => {
    total.value = newVal;
  },
  { immediate: true }
);

// 状态标签
const statusTabs = [
  { label: 'All Status', value: 0 },
  { label: 'Pending', value: 1 },
  { label: 'In Progress', value: 2 },
  { label: 'Completed', value: 3 }
];

// 当前选中的状态
const activeStatus = ref(0);

// 所有位置及任务数据
const locations = ref([]);

const saveAssigned = async (task) => {
  // 模拟保存逻辑
  task.editable = false; // 标记为不可编辑
  console.log('Saving assigned users:', task.assignedTo);
  emit('editSubmit', { task });
};

// 监听props中的taskData变化
watch(
  () => props.taskData,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      locations.value = newVal;
    }
  },
  { immediate: true, deep: true }
);

// 根据状态过滤后的位置数据
const filteredLocations = computed(() => {
  if (activeStatus.value === 0) {
    return locations.value;
  }

  return locations.value
    .map((location) => {
      const filteredTasks = location.tasks.filter((task) => task.status === activeStatus.value);
      return {
        ...location,
        tasks: filteredTasks
      };
    })
    .filter((location) => location.tasks.length > 0);
});

// 切换位置展开状态
const toggleLocationExpand = async (location, index) => {
  location.loading = true;
  const scrollPosition = {
    top: window.pageYOffset || document.documentElement.scrollTop,
    left: window.pageXOffset || document.documentElement.scrollLeft
  };

  // 更新展开状态
  locations.value[index].expanded = !locations.value[index].expanded;

  // 如果是展开状态，加载该位置的任务数据
  if (locations.value[index].expanded) {
    const location = locations.value[index];
    if (!avialibleTaskMaps.value[location.id]) {
      const tasks = await getAvaliableData(location);
      // 确保数据已加载到响应式对象中
      avialibleTaskMaps.value = { ...avialibleTaskMaps.value };
    }
  }
  location.loading = false;
  // 等待 DOM 更新后恢复滚动位置
  nextTick(() => {
    window.scrollTo({
      top: scrollPosition.top,
      left: scrollPosition.left,
      behavior: 'auto' // 使用 'auto' 而不是 'smooth' 以避免动画效果
    });
  });
};

// 获取状态对应的CSS类名
const getMarkerClass = (status) => {
  switch (status) {
    case 'high':
      return 'border-critical';
    case 'medium':
      return 'border-orange';
    case 'low':
      return 'border-warning';
    default:
      return `border-${status}`;
  }
};
const statusMap = {
  'pending': 'Pending',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'in_progress':
      return 'status-in-progress';
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    case 'fatal':  
    case 'critical':
      return 'fatal';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':  
    case 'event':
      return 'info';
    default:
      return `status-completed`;
  }
};

const getNotificateStatusClass = (status) => { 
  switch (status) {
    case 'fatal':  
    case 'critical':
      return 'fatal';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':  
    case 'event':
      return 'info';
    default:
      return `normal`;
  }
};

const getStatusIcon = (status, icon) => {
  console.log('getStatusIcon', status, icon);
  if (icon) return icon;
  if (status === 'high' || status === 'critical') return 'alert-high';
  if (status === 'normal') return 'alert-normal';
  if (status === 'low' || status === 'warning') return 'alert-low';
  if (status === 'medium') return 'alert-medium';
  return status;
};

// 新增现代风格的状态类名函数
const getModernStatusClass = (status) => {
  switch (status) {
    case 'scheduled':
    case 'pending':
      return 'modern-scheduled';
    case 'in_progress':
    case 'in-progress':
      return 'modern-in-progress';
    case 'completed':
      return 'modern-completed';
    case 'uncompleted':
    case 'cancelled':
      return 'modern-uncompleted';
    default:
      return 'modern-scheduled';
  }
};

// 新增现代风格的状态图标函数
const getModernStatusIcon = (status) => {
  switch (status) {
    case 'scheduled':
    case 'pending':
      return 'clock';
    case 'in_progress':
    case 'in-progress':
      return 'loading';
    case 'completed':
      return 'check';
    case 'uncompleted':
    case 'cancelled':
      return 'close';
    default:
      return 'clock';
  }
};

// 刷新数据
const refresh = () => {
  // 清空缓存的任务数据，以便重新加载
  avialibleTaskMaps.value = {};

  emit('refresh', {
    status: activeStatus.value !== 0 ? activeStatus.value : undefined,
    pageQuery: queryParams.value
  });
};

// 处理分页变化
const handlePagination = () => {
  emit('pagination', {
    status: activeStatus.value !== 0 ? activeStatus.value : undefined,
    pageQuery: queryParams.value
  });
};

// 监听状态标签变化
watch(
  () => activeStatus.value,
  () => {
    refresh();
  }
);

// 组件挂载时触发刷新并预加载已展开位置的数据
onMounted(async () => {
  refresh();

  // 预加载已展开位置的数据
  await nextTick();
  for (let location of locations.value) {
    if (location.expanded) {
      await getAvaliableData(location);
    }
  }
});

defineExpose({
  queryParams: data.queryParams,
  avialibleTaskMaps
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.task-status-list {
  width: 100%;
  background-color: #fff;
  height: v-bind('height');
  overflow: auto;
  border-radius: 8px;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .filter-tabs-node {
    display: flex;
    justify-content: space-between;
    align-items: center;

    svg {
      width: 20px;
      height: 20px;
      fill: $color-gray;
      cursor: pointer;
    }
  }

  .status-list {
    min-height: 168px;
    .location-group {
      border-bottom: 1px solid #f0f2f5;

      &:last-child {
        border-bottom: none;
      }

      .location-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 16px;
        cursor: pointer;
        background-color: #f8f9fa;

        &:hover {
          background-color: #f0f2f5;
        }

        .location-title {
          display: flex;
          align-items: center;
          gap: 8px;

          span {
            overflow: hidden;
            color: var(--VI-text-B12, #11191e);
            text-overflow: ellipsis;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
          }

          .location-icon {
            color: #606266;
            font-size: 16px;
          }
        }

        .task-count {
          display: flex;
          align-items: center;
          padding: 0 8px;
          color: var(--layout-bg_Panel, #fff);
          text-align: center;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;
          height: 24px;
          background: linear-gradient(149.35deg, #71797e -2.68%, rgba(0, 14, 51, 0.5) 39.58%, rgba(0, 14, 51, 0.3) 65.69%, #71797e 92.97%), #41494e;
          border-radius: 10px;
        }

        .expand-icon {
          transition: transform 0.3s;

          &.expanded {
            transform: rotate(180deg);
          }
        }
      }

      .location-content {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        padding: 16px;
        overflow: auto;

        .task-item {
          width: 100%;
          transition: transform 0.3s;
          // max-width: 412px;
          border-radius: 8px;
          border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
          background: var(--layout-bg_Panel, #fff);

          /* PanelShadow/SM */
          box-shadow: 0px 1px 2px 0px var(--colors-flat-B12-flat05, rgba(17, 25, 30, 0.05));
          &:hover {
            transform: translateY(-2px);
          }

          .task-card {
            display: flex;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: 100%;
            position: relative;

            .border-critical {
              background-color: $color-red;
            }

            .border-warning {
              background-color: $color-yellow;
            }

            .border-orange {
              background-color: $color-orange;
            }

            .border-normal {
              background-color: $color-green;
            }

            .critical,
            .fatal {
              background-color: $color-red;
            }

            .error {
              background-color: $color-orange;
            }

            .warning {
              background-color: $color-yellow;
            }

            .info,
            .event {
              background-color: $color-blue;
            }

            .done {
              background-color: $color-green;
            }

            .normal {
              background-color: $color-gray;
            }


            .task-card-left-border {
              width: 4px;
            }

            .task-card-content {
              flex: 1;
              padding: 16px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              gap: 8px;
            }

            .task-card-header {
              display: flex;
              margin-bottom: 16px;
            }

            .task-icon-container {
              margin-right: 12px;

              svg {
                width: 24px;
                height: 24px;
                border-radius: 50%;

                &.critical,
                &.fatal {
                  fill: $color-red;
                }

                &.error {
                  fill: $color-orange;
                }

                &.warning {
                  fill: $color-yellow;
                }

                &.info,
                &.event {
                  fill: $color-blue;
                }

                &.done {
                  fill: $color-green;
                }

                &.normal {
                  fill: $color-gray;
                }
              }

              .high {
                fill: $color-red;
              }

              .medium {
                fill: $color-orange;
              }

              .low {
                fill: $color-yellow;
              }

              .normal {
                fill: $color-blue;
              }
            }

            .task-main-info {
              flex: 1;
            }

            .task-name {
              overflow: hidden;
              color: var(--VI-text-B12, #11191e);
              text-overflow: ellipsis;
              font-size: 14px;
              font-style: normal;
              font-weight: 600;
              line-height: 16px;
            }

            .task-details {
              color: var(--VI-text-B12, #11191e);
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 16px;
              span {
                color: var(--VI-text-B12, #11191e);
                font-size: 12px;
                font-style: normal;
                font-weight: 700;
                line-height: 16px;
                &.status-pending {
                  color: $color-yellow;
                }

                &.status-in-progress {
                  color: $color-green;
                }

                &.status-completed {
                  color: $color-blue;
                }
              }
            }

            .task-due-date {
              color: var(--colors-flat-B12-flat60, rgba(17, 25, 30, 0.6));
              font-size: 8px;
              font-style: normal;
              font-weight: 600;
              line-height: 14px;
              margin-top: 4px;
            }

            .task-status-badge {
              padding: 4px 8px;
              border-radius: 100px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
              height: fit-content;

              &.status-pending {
                background: var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1));
                color: $color-gray;
              }

              &.status-in-progress {
                background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
                color: $color-blue;
              }

              &.status-completed {
                background: var(--colors-flat-success-flat10, rgba(0, 186, 74, 0.1));
                color: $color-green;
              }

              &.critical,
              &.fatal {
                @extend .clean-critical;
              }

              &.error {
                @extend .clean-medium ;
              }

              &.warning {
                @extend .clean-warning;
              }

              &.info,
              &.event {
                @extend .clean-primary;
              }

              &.done {
                @extend .clean-normal;
              }

              &.normal {
                @extend .clean-info;
              }

            }

            .task-card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #f0f2f5;
            }

            .assign-section {
              display: flex;
              flex-direction: column;
              padding-left: 40px;
              gap: 8px;
              background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
              .assign-label {
                color: var(--VI-text-B49, #71797e);
                font-size: 12px;
                font-style: normal;
                font-weight: 400;
                line-height: 16px;
              }

              .assign-users {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;

                .user-tag {
                  background-color: #ecf5ff;
                  color: $color-blue;
                  padding: 2px 0;
                  border-radius: 12px;
                  font-size: 12px;

                  &:hover {
                    background-color: #d9ecff;
                  }
                }
              }
            }

            .action-buttons {
              flex: 1;
              display: flex;
              justify-content: space-between;
              gap: 8px;
              width: 2rem;
              height: 2rem;

              svg {
                width: 2rem;
                height: 2rem;
              }
            }
          }
        }
      }

      @media screen and (max-width: 768px) {
        .location-content {
          grid-template-columns: repeat(1, 1fr);
        }
      }

      // 修改原有的样式，确保兼容性
      .task-status-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
        font-weight: 600;
        font-size: 14px;

        &.status-pending {
          background: linear-gradient(
              149.35deg,
              rgba(237, 182, 1, 0.9) -2.68%,
              rgba(0, 14, 51, 0.5) 39.58%,
              rgba(0, 14, 51, 0.4) 65.69%,
              rgba(237, 182, 1, 0.9) 92.97%
            ),
            $color-yellow;
          box-shadow:
            0px 6px 12px rgba(102, 78, 0, 0.63),
            0px 0px 9px rgba(245, 188, 1, 0.42),
            inset 0px 0px 41px rgba(237, 182, 1, 0.67);
        }

        &.status-completed {
          background: linear-gradient(
              149.19deg,
              rgba(0, 91, 205, 0.9) -3.66%,
              rgba(0, 14, 51, 0.7) 39.31%,
              rgba(0, 14, 51, 0.5) 65.68%,
              rgba(0, 91, 205, 0.9) 94%
            ),
            $color-blue;
          box-shadow:
            0px 6px 12px rgba(82, 111, 255, 0.6),
            0px 0px 9px rgba(0, 153, 255, 0.4),
            inset 0px 0px 67px rgba(0, 153, 255, 0.7);
        }

        &.status-in-progress {
          background: linear-gradient(
              149.35deg,
              rgba(0, 186, 74, 0.9) -2.68%,
              rgba(0, 14, 51, 0.5) 39.58%,
              rgba(0, 14, 51, 0.3) 65.69%,
              rgba(0, 186, 74, 0.9) 92.97%
            ),
            $color-green;
          box-shadow:
            0px 6px 12px rgba(1, 153, 44, 0.63),
            0px 0px 9px rgba(1, 245, 34, 0.42),
            inset 0px 0px 41px rgba(0, 235, 94, 0.67);
        }
      }
    }
  }
}

.noData {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
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

/* 新增现代风格样式 */
.task-item.modern-style {
  .modern-task-card {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .modern-card-header {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      padding: 16px 16px 8px 16px;
      // border-bottom: 1px solid #f3f4f6;

      .task-icon-container {
        margin-right: 8px;

        svg {
          width: 28px;
          height: 28px;
          border-radius: 50%;

          &.critical,
          &.fatal {
            fill: $color-red;
          }

          &.error {
            fill: $color-orange;
          }

          &.warning {
            fill: $color-yellow;
          }

          &.info,
          &.event {
            fill: $color-blue;
          }

          &.done {
            fill: $color-green;
          }

          &.normal {
            fill: $color-gray;
          }
        }

        .high {
          fill: $color-red;
        }

        .medium {
          fill: $color-orange;
        }

        .low {
          fill: $color-yellow;
        }

        .normal {
          fill: $color-blue;
        }
      }

       .task-status-badge {
          padding: 4px 8px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          height: fit-content;

          &.status-pending {
            background: var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1));
            color: $color-gray;
          }

          &.status-in-progress {
            background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
            color: $color-blue;
          }

          &.status-completed {
            background: var(--colors-flat-success-flat10, rgba(0, 186, 74, 0.1));
            color: $color-green;
          }

          &.critical,
          &.fatal {
            @extend .clean-critical;
          }

          &.error {
            @extend .clean-medium ;
          }

          &.warning {
            @extend .clean-warning;
          }

          &.info,
          &.event {
            @extend .clean-primary;
          }

          &.done {
            @extend .clean-normal;
          }

          &.normal {
            @extend .clean-info;
          }

        }

      .modern-actions {
        display: flex;
        gap: 8px;

        .action-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: #374151;
          }

          svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
          }
        }
      }
    }

    .modern-card-content {
      padding:  0 1rem 1rem 3.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;

      .modern-task-title {
        font-size: 14px;
        line-height: 16px;
        font-weight: 600;
        color: #111827;
        line-height: 1.4;
      }

      .modern-task-description {
        font-size: 12px;
         line-height: 16px;
        color: #6b7280;
        margin-bottom: 8px;
      }

      .modern-task-meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: auto;
        color: var(--VI-text-B69, #A2AAAF);


        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;

          .meta-label {
            font-weight: 500;
          }

          .meta-value {
            color: #374151;
            font-weight: 600;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
