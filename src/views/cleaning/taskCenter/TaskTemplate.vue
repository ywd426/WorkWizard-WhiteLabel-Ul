<template>
  <TaskList
    ref="taskListRef"
    header="Work Order Templates"
    :showTabs="false"
    :showPending="true"
    :showHeaderActions="true"
    :pageId="pageId"
    :taskData="taskData"
    :totalCount="total"
    :get-task-data="getActiveTasksData"
    @refresh="handleRefresh"
    @pagination="handlePagination"
  >
    <template #header-actions>
      <el-button type="primary" size="middle" plain @click="handleCreateTask">
        <el-icon><Plus /></el-icon>
        <span class="pl-2"> Create Template </span>
      </el-button>
    </template>
    <template #action-buttons="{ task, localtionId }">
      <el-button circle size="middle" @click="viewTask(task)">
        <svg-icon icon-class="view-card" class="svg-default" />
      </el-button>
      <div class="flex flex-row">
        <el-button circle size="middle" @click="editTask(task)">
          <svg-icon icon-class="edit-card" class="svg-default pt-1 pl-1" />
        </el-button>

        <el-button circle size="middle" type="danger" class="custom-danger-btn" plain @click="deleteTask(task, localtionId)">
          <svg-icon icon-class="delete-card" class="svg-danger" />
        </el-button>
      </div>
    </template>
  </TaskList>
  <delete-dialog v-model:visible="showDeleteDialog" title="Delete template" type="template" :name="deleteTaskId" @delete="handleDelete" />
  <work-order-template
    v-model:visible="showCreateDialog"
    :cur-task="curTask"
    :header="header"
    :type="type"
    model-type="template"
    @save="handleSave"
  />
</template>

<script setup>
import TaskList from '@/views/cleaning/taskCenter/TaskList.vue';
import { Plus } from '@element-plus/icons-vue';
import WorkOrderTemplate from '@/views/cleaning/taskCenter/WorkOrderTemplate.vue';
import { getTemplates, getZoneTemplates, getTemplateDetail, deleteTemplate } from '@/api/clean/task';
import { useCleanStore } from '@/store/modules/cleaning';
import DeleteDialog from '@/views/cleaning/common/DeleteDialog.vue';

const cleanStore = useCleanStore();
// 任务数据
const taskData = ref([]);
const taskListRef = ref(null);
const total = ref(0);
const showCreateDialog = ref(false);
const header = ref('Create Work Order Template');
const type = ref('add'); // 任务类型：create, edit, view, assign
const deleteTaskId = ref('');
const showDeleteDialog = ref(false);
const curTask = ref(null);

const props = defineProps({
  pageId: {
    type: String,
    default: 'taskCenter'
  }
});
// 模拟获取数据的函数
const fetchData = async () => {
  // 这里可以替换为实际的API调用
  const params = cleanStore.getPageFilterParams(props.pageId);
  const queryParams = taskListRef.value?.queryParams;
  const pageQuery = {
    'pageSize': queryParams.pageSize,
    'pageNum': queryParams.pageNum,
    'firstNum': 0
  };
  const res = await getTemplates({ ...params, ...pageQuery });

  console.log('Fetching data with params:', params, pageQuery, res);

  // 根据状态过滤数据
  let filteredData = [];
  res.rows.forEach((d) => {
    filteredData.push({
      name: `${d.buildingName}, ${d.floorName}, ${d.zoneName}`,
      id: d.zoneId,
      itemCount: d.itemCount,
      expanded: false
    });
  });
  if (params.status) {
    filteredData = mockData
      .map((location) => {
        const filteredTasks = location.tasks.filter((task) => task.status === params.status);
        return {
          ...location,
          tasks: filteredTasks
        };
      })
      .filter((location) => (location.tasks || []).length > 0);
  }

  // 设置数据和总数
  taskData.value = filteredData;
  total.value = filteredData.reduce((acc, location) => acc + (location.tasks || []).length, 0);
};

// 处理刷新请求
const handleRefresh = (params) => {
  fetchData();
};

// 处理分页变化
const handlePagination = (params) => {
  fetchData();
};

const handleCreateTask = () => {
  header.value = 'Create Work Order Template';
  type.value = 'add';
  showCreateDialog.value = true;
};

const handleUploadExcel = () => {
  console.log('upload excel');
};

const viewTask = async (task) => {
  header.value = 'View Work Order Template';
  type.value = 'view';

  const res = await getTemplateDetail(task.id);
  curTask.value = res.data;
  showCreateDialog.value = true;
  console.log('view task:', task, res);
};

const editTask = async (task) => {
  header.value = 'Edit Work Order Template';
  type.value = 'edit';
  const res = await getTemplateDetail(task.id);
  curTask.value = res.data;
  showCreateDialog.value = true;

  console.log('edit task:', task, res);
};

let locationId = null;
const deleteTask = (task, localtionId) => {
  deleteTaskId.value = task.id || task.name;
  showDeleteDialog.value = true;
  locationId = localtionId;
  console.log('delete tempalte:', task);
};

const handleDelete = async (name) => {
  console.log(`delete tempalte: ${name}`, locationId);
  showDeleteDialog.value = false;
  const res = await deleteTemplate(name);
  console.log('delete confirmed', res);
  if (res.code !== 200) {
    ElMessage.error('Delete failed');
    return;
  } else {
    ElMessage.success('Delete success');
  }
  if (taskListRef.value?.avialibleTaskMaps[locationId]) {
    taskListRef.value.avialibleTaskMaps[locationId] = taskListRef.value.avialibleTaskMaps[locationId].filter((t) => t.id !== name);
  }
};

const handleTaskSubmit = () => {
  showCreateDialog.value = false;
  // 刷新任务列表
  fetchData();
};

const getActiveTasksData = async (task) => {
  const params = cleanStore.getPageFilterParams(props.pageId);
  const res = await getZoneTemplates({ ...params, zoneId: task.id });
  console.log('Fetching data with params:', params, res);
  const arr = [];

  res.data.forEach((d) => {
    arr.push({
      id: d.templateId,
      name: d.name,
      assignedTo: d.assignId,
      status: d.status,
      kind: d.source, // 类型
      type: d.type || d.priorit, // 低于/高于
      severity: d.priority, // 严重程度
      percentage: d.percent,
      duration: d.duration + d.durationUnit,
      sensors: '',
      lastCheck: d.startTime || 'May 3, 2023, 08:30 AM',
      nextCheck: d.dueTime || 'May 3, 2023, 08:35 AM',
      editable: false,
      assignedTo: [d.assigneeId]
    });
  });
  return arr;
};

const handleSave = (saveData) => {
  console.log('Saving template...');
   if (typeof saveData === 'object') {
    const { type, zoneId, workOrderId } = saveData;
    
    // 如果有特定位置的任务被修改，需要刷新该位置的任务列表
    if (zoneId && taskListRef.value?.avialibleTaskMaps) {
      if (taskListRef.value.avialibleTaskMaps[zoneId]) {
        // 清除该位置的缓存数据，以便下次展开时重新获取
        delete taskListRef.value.avialibleTaskMaps[zoneId];
      }
    }
    
    // 如果是编辑操作，可能需要更新特定任务的数据
    if (type === 'edit' && workOrderId) {
      // 遍历所有位置，查找并更新对应的任务
      for (const locationId in taskListRef.value?.avialibleTaskMaps || {}) {
        const tasks = taskListRef.value.avialibleTaskMaps[locationId];
        const taskIndex = tasks.findIndex(t => t.id === workOrderId);
        if (taskIndex !== -1) {
          // 清除该位置的缓存数据，以便下次展开时重新获取
          delete taskListRef.value.avialibleTaskMaps[locationId];
          break;
        }
      }
    }
  }
  
  // 无论是添加、编辑还是其他操作，都刷新数据以确保filteredLocations更新
  fetchData();
};

// 初始加载数据
onMounted(() => {
  fetchData();
});

watch(
  () => cleanStore.getPageFilterParams(props.pageId),
  (newFilters) => {
    fetchData();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.task-status-list {
  width: 100%;
  background-color: #fff;
  height: v-bind('height');
  overflow: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

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
              font-weight: 400;
              line-height: 16px;
            }

            .task-details {
              color: var(--colors-flat-B12-flat40, rgba(17, 25, 30, 0.4));
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 16px;

              span {
                font-weight: 600;

                &.status-pending {
                  color: $color-yellow;
                }

                &.status-in-progress {
                  color: $color-blue;
                }

                &.status-completed {
                  color: $color-green;
                }
              }
            }

            .task-due-date {
              color: var(--colors-flat-B12-flat40, rgba(17, 25, 30, 0.4));
              font-size: 8px;
              font-style: normal;
              font-weight: 600;
              line-height: 14px; /* 175% */
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
                background: var(--colors-flat-success-flat10, rgba(0, 186, 74, 0.1));
                color: $color-green;
              }

              &.status-completed {
                background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
                color: $color-blue;
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
            $color-yellow;
          box-shadow:
            0px 6px 12px rgba(102, 78, 0, 0.63),
            0px 0px 9px rgba(245, 188, 1, 0.42),
            inset 0px 0px 41px rgba(237, 182, 1, 0.67);
        }

        &.status-in-progress {
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

        &.status-completed {
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
</style>
