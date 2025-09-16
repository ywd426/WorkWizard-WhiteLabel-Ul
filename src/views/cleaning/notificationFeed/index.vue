<template>
  <div id="notification-feed-node" class="dashboard-container">
     <div class="w-[40%] mb-4" v-show="showFilter">
      <filter-panel :pageId="pageId" :showSampleFilter="true" :preloadAllZones="true" :showLabel="false" :showLocation="false" @search-event="handleSearch" />
    </div>
    <TaskList
      ref="taskListRef"
      header="Notification Feeds Overview"
      :showTabs="false"
      :showPending="true"
      :showHeaderActions="true"
      :useModernStyle="true"
      :pageId="pageId"
      :taskData="taskData"
      :totalCount="total"
      noData="No Notification"
      height="600px"
      :get-task-data="getActiveTasksData"
      :load-more-details="loadMoreDetails"
      :has-more-details="hasMoreDetails"
      @editSubmit="editTaskSubmit"
      @refresh="handleRefresh"
      @pagination="handlePagination"
    >
      <!-- <template #location-actions="{ localtionId }">
        <svg-icon icon-class="refresh" class="icon-right" @click.stop="refreshItems(localtionId)" />
      </template> -->

      <template #action-buttons="{ task, localtionId }">
        <el-button circle size="middle" @click="viewTask(task)">
          <svg-icon icon-class="view-card" class="svg-default" />
        </el-button>
        <div class="flex flex-row ">
          <el-button circle size="middle" @click="deleteTask(task, localtionId)">
            <svg-icon icon-class="ignore-alert" class="svg-default" icon="ignore" color="white" />
          </el-button>
        </div>
      </template>
    </TaskList>
  </div>
  <delete-dialog v-model:visible="showDeleteDialog" @delete="handleDelete" :name="deleteTaskId" 
    title="Delete Notification Feed" type="notification feed" prompt="Are you sure you want to delete this notification feed?" />

  <work-order-template
    v-model:visible="showCreateDialog"
    :header="header"
    :type="type"
    :show-scheduled-settings="false"
    :show-type-section="false"
    :cur-task="curTask"
  />
  <edit-task-template v-model:visible="showEditDialog" @save="handleSave" :work-order-data="curTask" />
  <el-drawer
    v-model="showDetailPanel"
    title=""
    direction="rtl"
    size="80%"
    :before-close="closeDetailPanel"
    class="robot-detail-drawer"
  >
    <div v-if="selectedRobot" class="detail-content">
      <RobotDetailComponent :robot-data="selectedRobot" @close="closeDetailPanel" />
    </div>
    <ScheduleDetail v-if="selectedScheduleData" :task-id="selectedScheduleData.id" :view-type="selectedScheduleData.viewType" />
  </el-drawer>

  <EventDetailsDialog v-model:visible="dialogVisible" :event-data="eventData" @submit="handleSubmit" />
</template>

<script setup>
import TaskList from '@/views/cleaning/taskCenter/TaskList.vue';
import ActionMenu from '@/views/cleaning/taskCenter/ActionMenu.vue';
import WorkOrderTemplate from '@/views/cleaning/taskCenter/WorkOrderTemplate.vue';
import DeleteDialog from '@/views/cleaning/common/DeleteDialog.vue';
import EditTaskTemplate from '@/views/cleaning/taskCenter/EditTask.vue';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import { useCleanStore } from '@/store/modules/cleaning';
import EventDetailsDialog from '@/views/monitor/robotmanage/robots/eventDetail.vue';
import RobotDetailComponent from '@/views/monitor/robotmanage/robots/RobotDetailComponent.vue';
import ScheduleDetail from '@/views/monitor/robotmanage/schdule/detail.vue';
import { getZoneNotificationList, getNotificationFeedList, deleteNotificationFeed } from '@/api/clean/notification';
import { getRobotEventDetail } from '@/api/robot';
const props = defineProps({
  pageId: {
    type: String,
    default: 'notification-feed'
  }
});
const changeTab = (tab) => {
  console.log(tab, 'tab');
};
const taskListRef = ref(null);
const showFilter = ref(false);
// 任务数据
const taskData = ref([]);
const total = ref(0);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const showEditDialog = ref(false);
const header = ref('Create Work Order');
const type = ref('add');
const deleteTaskId = ref('');
const curTask = ref(null);
const cleanStore = useCleanStore();
const showDetailDrawer = ref(false);
const showDetailPanel = ref(false);
const selectedRobot = ref(null);
const dialogVisible = ref(false);
const eventData = ref(null);  

const selectedScheduleData = ref(null);
const viewType = ref('1');
const handleSave = () => {
  console.log('Saving task...');
};

const handleDrawerClose = () => {
  showDetailDrawer.value = false;
  selectedScheduleData.value = null;
};
// 模拟获取数据的函数
const fetchData = async () => {
  const params = cleanStore.getPageFilterParams(props.pageId);
  const queryParams = taskListRef.value?.queryParams || {};
  const pageQuery = {
    'pageSize': queryParams.pageSize,
    'pageNum': queryParams.pageNum,
    'createTime': null,
    'firstNum': 0
  };
  const res = await getNotificationFeedList({ ...params, ...pageQuery });

  console.log('Fetching data with params:', params,pageQuery, res);
  const data = res.rows.map(d => {
    return {
      name: [
        d.buildingName,
        d.floorName || '',
        d.zoneName || ''
      ].filter(Boolean).join(', '),
      id: d.zoneId, 
      expanded: false
    }
  })


  // 根据状态过滤数据
  // if (params.status) {
  //   filteredData = data
  //     .map((location) => {
  //       const filteredTasks = location.tasks.filter((task) => task.status === params.status);
  //       return {
  //         ...location,
  //         tasks: filteredTasks
  //       };
  //     })
  //     .filter((location) => location.tasks.length > 0);
  // }

  // 设置数据和总数
  taskData.value = data;
  total.value = res.total || res.rows.length;
};

const refreshItems = async (localtionId) => {
  console.log('refreshItems', localtionId);

}

const getIconType = (type) => { 
  if(type.startsWith('robot')) {
    return 'robot'
  } else if(type.startsWith('consumable')) {
    return 'consumable'
  } else if(type.startsWith('waste')) {
    return 'waste'
  } else {
    return 'sensor'
  }
}

const severityMap = {
  high: 'high',
  medium: 'medium',
  low: 'low',
  neutral: 'low'
}
// 详情数据映射和分页控制
const detailMap = ref({});
const detailDisplayCountMap = ref({});
const detailTimeMap = ref({});
const initialDetailDisplayCount = 8;
const loadMoreCount = 8;
const currData = ref({});

// 加载更多详情数据
const loadMoreDetails = (zoneId) => {
  if (detailDisplayCountMap.value[zoneId]) {
    detailDisplayCountMap.value[zoneId] += loadMoreCount;
  }
};

// 获取显示的详情数据
const getDisplayedDetails = (zoneId) => {
  if (!detailMap.value[zoneId]) return [];
  const displayCount = detailDisplayCountMap.value[zoneId] || initialDetailDisplayCount;
  return detailMap.value[zoneId].slice(0, displayCount);
};

// 判断是否有更多详情数据
const hasMoreDetails = (zoneId) => {
  if(!currData[zoneId]) return false;
  return currData[zoneId].total > loadMoreCount;
  // return currData[zoneId]?.pageNum * loadMoreCount < currData[zoneId].total;
};

const getActiveTasksData = async (task) => {
  // console.log(task)
  const params = cleanStore.getPageFilterParams(props.pageId);
  if(task.pageNum == null) {
    task.pageNum = 1;
  }
  const res = await getZoneNotificationList({ ...params, zoneId: task.id, pageSize: loadMoreCount, pageNum: 1, createTime: detailTimeMap.value[task.id] || '' });

  // console.log('Fetching data with params:', params, res);

  if(res.code != 200) {
    return [];
  }
  

  if(!currData[task.id]) {
    currData[task.id] = {};
  }

  currData[task.id].total = res.total || res.rows.length;
  currData[task.id].pageNum = task.pageNum;
  currData[task.id].createTime = res.rows[res.rows.length - 1].createTime;

  task.pageNum++;
  const arr = [];

  res.rows.forEach((d) => {
    arr.push({
      id: d.id,
      name: d.title,
      kind: d.senderType, // 类型
      severity: d.severity, // 严重程度
      icon: getIconType(d.notificationType), // 图标
      location: d.content,
      status: d.status || d.severity, 
      createdTime: d.createTime || '',
      editable: d.editable || false,
      payload: JSON.parse(d.payload || '{}')

    });
  });

  if(detailMap.value[task.id] == null) {
    detailMap.value[task.id] = []
  }
  // 存储完整数据到detailMap
  detailMap.value[task.id].push(...arr);
  // 初始化显示计数
  detailDisplayCountMap.value[task.id] = initialDetailDisplayCount;
  detailTimeMap.value[task.id] = res.rows[res.rows.length - 1].createTime;

  // 返回初始显示的数据
  return detailMap.value[task.id];
}

// 处理刷新请求
const handleRefresh = (params) => {
  fetchData(params);
};

// 处理分页变化
const handlePagination = (params) => {
  fetchData(params);
};

const handleCreateTask = () => {
  type.value = 'add';
  header.value = 'Create Work Order';
  showCreateDialog.value = true;
};

const handleUploadExcel = () => {
  console.log('upload excel');
};

const typeMap = {
  'mnt_robot_events': 'event',
  'mnt_robots_task': 'task',
  'mnt_robots_charging_sessions': 'charging',
  'mnt_robots_management': 'robot',

}

const viewTask = async (task) => {
  /**
   * 需要获取两个字段：
   * id: 唯一码
   * type: 任务类型
   */
  curTask.value = task;
  const table = task.payload?.['table_name'];
  // console.log('view task:', task);
  const type = typeMap[table] // 'robot' | 'task' | 'event' | charging
  const id = task.payload?.['related_biz_id'];
  console.log('type:', type, 'id:', id)

  if(type === 'robot') {
    selectedRobot.value = {
      robotSn: id,
      isToday: true
    }
    showDetailPanel.value = true;
  } else if(type === 'task') { 
    selectedScheduleData.value = {
      id,
      viewType: '1' // 1: task, 2: charging
    }

    showDetailPanel.value = true;
  } else if(type === 'charging') { 
    selectedScheduleData.value = {
      id,
      viewType: '2' // 1: task, 2: charging
    }

    showDetailPanel.value = true;
  } else if(type === 'event') { 
    const res = await getRobotEventDetail(id);
    eventData.value = res.data;
    dialogVisible.value = true;
  }
};

const closeDetailPanel = () => {
  showDetailPanel.value = false;
  selectedRobot.value = null;
  selectedScheduleData.value = null;
};

const editTask = (task) => {
  type.value = 'edit';
  header.value = 'Edit Work Order';
  curTask.value = task;
  showEditDialog.value = true;
  console.log('edit task:', task);
};

const ignoreTask = (task) => {
  console.log('ignore submit:', task);
};

let locationId = null;
const deleteTask = (task, localtionId) => {
  deleteTaskId.value = task.id || task.name;
  locationId = localtionId;
  showDeleteDialog.value = true;
  console.log('delete task:', task);
};

const handleDelete = async (id) => {
  const res = await deleteNotificationFeed(id);
  if(res.code === 200) {
    showDeleteDialog.value = false;
    ElMessage.success('Delete Notification Feed Successfully!');
  }
  if (taskListRef.value?.avialibleTaskMaps[locationId]) {
    taskListRef.value.avialibleTaskMaps[locationId] = taskListRef.value.avialibleTaskMaps[locationId].filter((t) => t.id !== id);
  }
};

const handleTaskSubmit = () => {
  showCreateDialog.value = false;
  // 刷新任务列表
  fetchData();
};

onMounted(() => {
  fetchData();
});

// watch(
//   () => cleanStore.getPageFilterParams(props.pageId),
//   (newFilters) => {
//     fetchData();
//   },
//   { deep: true }
// );
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
    margin-top: 4px;

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
.task-status-list {
  width: 100%;
  background-color: #fff;
  height: v-bind('height');
  overflow: auto;

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
              width: 2rem;
              height: 2rem;
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

:deep(.status-list) {
   min-height: 540px !important;
}
</style>
