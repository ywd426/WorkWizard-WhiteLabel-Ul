<template>
  <div class="task-item" :class="{ 'completed': task.status === 'completed' }">
    <div class="task-card">
      <div class="task-card-left-border" :class="getSeverity(task.severity)"></div>
      <div class="flex w-full">
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
              <div v-if="!task.location" class="task-details">
                {{ task.kind }}
                <span :class="getMarkerClass(task.status)"> {{ task.type === 'low' ? '<' : '>' }} {{ task.percentage }}%</span>
                for <span>{{ task.duration }} ({{ task.sensors }})</span>
              </div>

             <div v-if="task.lastCheck" class="task-due-date">
                Due Date: {{ useUtils.formatDateValue(new Date(task.lastCheck)) }} -
                {{ useUtils.formatDateValue(new Date(task.nextCheck)) }}
              </div>
              <div v-if="task.createdTime" class="task-due-date">
                {{ useUtils.formatDateValue(new Date(task.createdTime)) }}
              </div>
               <div v-if="task.formatTime" class="task-due-date">
                {{ task.formatTime }}
              </div>
            </div>
            <div v-if="showPending" class="task-status-badge" :class="getSeverity(task.severity)">
              {{ task.status }}
            </div>
          </div>
          <div v-if="showAssigned" class="task-card-container">
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
          <slot name="customer-area"></slot>

          <div v-if="showFooter" class="task-card-footer">
            <div class="action-buttons">
              <slot name="action-buttons" :task="task"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as useUtils from '@/utils/index';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  showEditButton: {
    type: Boolean,
    default: true
  },
  showAssignButton: {
    type: Boolean,
    default: true
  },
  showDeleteButton: {
    type: Boolean,
    default: true
  },
  showAssigned: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showPending: {
    type: Boolean,
    default: true
  },
  statusMap: {
    type: Object,
    default: () => ({
      1: 'Pending',
      2: 'In Progress',
      3: 'Completed'
    })
  },
  showStatus: {
    type: Boolean,
    default: true
  }
});

const getSeverity = (status) => { 
  const statusArr = ['fatal', 'error', 'warning', 'event', 'done', 'info', 'critical'];
  return statusArr.find(d => d.toLowerCase() === status.toLowerCase()) || 'normal'
};

const emit = defineEmits(['edit', 'assign', 'delete']);

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

const getStatusIcon = (status, icon) => {
  console.log('getStatusIcon', status, icon);
  if (icon) return icon;
  if (status === 'high' || status === 'critical') return 'alert-high';
  if (status === 'normal') return 'alert-normal';
  if (status === 'low' || status === 'warning') return 'alert-low';
  if (status === 'medium') return 'alert-medium';
  return status;
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
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
      cursor: pointer;
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
        &.critical,
        &.fatal {
          color: $color-red;
        }

        &.error {
          color: $color-orange;
        }

        &.warning {
          color: $color-yellow;
        }

        &.info,
        &.event {
          color: $color-blue;
        }

        &.done {
          color: $color-green;
        }

        &.normal {
          color: $color-gray;
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
</style>
