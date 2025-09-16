<template>
  <div class="work-order-list-container">
    <div class="card-header" v-if="showHeader">
      <div class="card-title">{{ header }}</div>
      <div class="header-actions" v-if="showHeaderActions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="card-content">
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
            <div class="location-header" @click="toggleLocationExpand(locationIndex)">
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
              <div v-if="location.tasks.filter((d) => !d.disable).length" class="task-count">
                {{ location.tasks.filter((d) => !d.disable).length }} {{ countLabel }}
              </div>
            </div>

            <div class="location-content" v-show="location.expanded">
              <div
                v-for="(task, taskIndex) in getAvaliableData(location.tasks)"
                :key="taskIndex"
                class="task-item"
                :class="{ 'completed': task.status === 'completed' || task.status === 3 }"
              >
                <div class="task-card">
                  <div class="task-card-left-border" :class="getMarkerClass(task.severity)"></div>
                  <div class="task-card-content">
                    <div class="task-card-header">
                      <div class="task-icon-container">
                        <svg-icon :icon-class="getStatusIcon(task.severity)" :class="task.severity" class="svg" />
                      </div>
                      <div class="task-main-info">
                        <div class="task-name">{{ task.name }}</div>
                        <div v-if="task.location" class="task-details">
                          {{ task.location }}
                        </div>
                        <div v-if="!task.location && task.kind" class="task-details">
                          {{ task.kind }}
                          <span :class="getMarkerClass(task.status)"> {{ task.type === 'low' ? '<' : '>' }} {{ task.percentage }}%</span>
                          for <span>{{ task.duration }} ({{ task.sensors }})</span>
                        </div>

                        <div class="task-due-date" v-if="task.lastCheck || task.nextCheck">Due Date: {{ task.lastCheck }} - {{ task.nextCheck }}</div>
                      </div>
                      <div v-if="showStatusBadge" class="task-status-badge" :class="getStatusClass(task.status)">
                        {{ getStatusText(task.status) }}
                      </div>
                    </div>
                    <div class="task-card-container" v-if="showAssignSection">
                      <div class="assign-section">
                        <div class="assign-label">{{ assignLabel }}</div>
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

                    <div class="task-card-footer" v-if="$slots['action-buttons']">
                      <div class="action-buttons">
                        <slot name="action-buttons" :task="task"></slot>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredLocations.length === 0" class="noData">{{ emptyText }}</div>
        </div>
        <pagination
          v-if="total > 0 && showPagination"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handlePagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, toRefs, nextTick } from 'vue';
import { ArrowRight, ArrowUp } from '@element-plus/icons-vue';

const props = defineProps({
  header: {
    type: String,
    default: 'Work Order List'
  },
  height: {
    type: String,
    default: '300px'
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showTabs: {
    type: Boolean,
    default: true
  },
  showStatusBadge: {
    type: Boolean,
    default: true
  },
  showHeaderActions: {
    type: Boolean,
    default: true
  },
  showAssignSection: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  assignLabel: {
    type: String,
    default: 'Assign to:'
  },
  countLabel: {
    type: String,
    default: 'Work Orders'
  },
  emptyText: {
    type: String,
    default: 'No Work Order Found'
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
  // 自定义状态标签
  customStatusTabs: {
    type: Array,
    default: () => []
  },
  // 自定义状态映射
  customStatusMap: {
    type: Object,
    default: () => ({})
  }
});

// 定义事件
const emit = defineEmits(['refresh', 'pagination', 'editSubmit', 'statusChange']);

// 加载状态
const loading = ref(false);

// 分页参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10
  },
  total: 0
});

const getAvaliableData = (items) => {
  return items.filter((d) => !d.disable);
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
const defaultStatusTabs = [
  { label: 'All Status', value: 0 },
  { label: 'Pending', value: 1 },
  { label: 'In Progress', value: 2 },
  { label: 'Completed', value: 3 }
];

const statusTabs = computed(() => {
  return props.customStatusTabs.length > 0 ? props.customStatusTabs : defaultStatusTabs;
});

// 当前选中的状态
const activeStatus = ref(0);

// 所有位置及任务数据
const locations = ref([]);

const saveAssigned = async (task) => {
  // 保存逻辑
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
      const filteredTasks = location.tasks.filter((task) => {
        // 支持数字状态和字符串状态
        return task.status === activeStatus.value || 
               task.status === String(activeStatus.value) || 
               (typeof task.status === 'string' && task.status.toLowerCase() === getStatusText(activeStatus.value).toLowerCase());
      });
      return {
        ...location,
        tasks: filteredTasks
      };
    })
    .filter((location) => location.tasks.length > 0);
});

// 切换位置展开状态
const toggleLocationExpand = (index) => {
  const scrollPosition = {
    top: window.pageYOffset || document.documentElement.scrollTop,
    left: window.pageXOffset || document.documentElement.scrollLeft
  };

  // 更新展开状态
  locations.value[index].expanded = !locations.value[index].expanded;

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
  if (!status) return '';
  
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'high':
    case 'critical':
      return 'border-critical';
    case 'medium':
      return 'border-orange';
    case 'low':
    case 'warning':
      return 'border-warning';
    case 'normal':
      return 'border-normal';
    default:
      return `border-${statusStr}`;
  }
};

const defaultStatusMap = {
  1: 'Pending',
  2: 'In Progress',
  3: 'Completed',
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed'
};

const getStatusText = (status) => {
  if (!status) return '';
  
  // 优先使用自定义状态映射
  if (props.customStatusMap[status]) {
    return props.customStatusMap[status];
  }
  
  return defaultStatusMap[status] || status;
};

const getStatusClass = (status) => {
  if (!status) return '';
  
  const statusValue = typeof status === 'number' ? status : String(status).toLowerCase();
  
  switch (statusValue) {
    case 1:
    case 'pending':
    case '1':
      return 'status-pending';
    case 2:
    case 'in-progress':
    case '2':
      return 'status-in-progress';
    case 3:
    case 'completed':
    case '3':
      return 'status-completed';
    default:
      return `status-${statusValue}`;
  }
};

const getStatusIcon = (status) => {
  if (!status) return 'alert-normal';
  
  const statusStr = String(status).toLowerCase();
  if (statusStr === 'high' || statusStr === 'critical') return 'alert-high';
  if (statusStr === 'normal') return 'alert-normal';
  if (statusStr === 'low' || statusStr === 'warning') return 'alert-low';
  if (statusStr === 'medium') return 'alert-medium';
  
  return 'alert-normal';
};

// 刷新数据
const refresh = () => {
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
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      emit('statusChange', newVal);
      refresh();
    }
  }
);

// 组件挂载时触发刷新
onMounted(() => {
  refresh();
});

// 暴露方法给父组件
defineExpose({
  refresh,
  activeStatus,
  locations
});
</script>

<style lang="scss" scoped>
.work-order-list-container {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f2f5;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .card-content {
    padding: 0;
  }
}

.task-status-list {
  width: 100%;
  background-color: #fff;
  height: v-bind('height');
  overflow: auto;
  border-radius: 8px;

  .filter-tabs-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f2f5;
    
    .filter-tabs {
      display: flex;
      gap: 16px;
      
      .filter-tab {
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #606266;
        transition: all 0.3s;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        &.active {
          background-color: #ecf5ff;
          color: #409eff;
          font-weight: 500;
        }
      }
    }

    svg {
      width: 20px;
      height: 20px;
      fill: #909399;
      cursor: pointer;
      transition: transform 0.3s;
      
      &:hover {
        transform: rotate(90deg);
      }
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
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        padding: 16px;

        .task-item {
          width: 100%;
          transition: transform 0.3s;
          max-width: 412px;
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
              background-color: #f56c6c;
            }

            .border-warning {
              background-color: #e6a23c;
            }

            .border-orange {
              background-color: #f5a623;
            }

            .border-normal {
              background-color: #67c23a;
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
                  color: #e6a23c;
                }

                &.status-in-progress {
                  color: #67c23a;
                }

                &.status-completed {
                  color: #409eff;
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
                color: #909399;
              }

              &.status-in-progress {
                background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
                color: #409eff;
              }

              &.status-completed {
                background: var(--colors-flat-success-flat10, rgba(0, 186, 74, 0.1));
                color: #67c23a;
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
                  color: #409eff;
                  padding: 2px 8px;
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
            #e6a23c;
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
            #409eff;
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
            #67c23a;
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
</style>