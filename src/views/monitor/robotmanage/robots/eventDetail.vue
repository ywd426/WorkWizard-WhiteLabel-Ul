<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    width="800px"
    :style="{ 'max-width': '95vw' }"
    class="event-details-dialog"
    :before-close="handleClose"
    align-center
  >
    <template #header>
      <div class="dialog-title">
        <span>{{ config.dialogTitle }}</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="event-content">
      <!-- Power Management Section -->
      <div class="event-section power-section" :style="{ borderLeftColor: getBackground(eventData.className) }">
        <div class="section-header">
          <div class="section-title">{{ eventData.eventType }}</div>
          <div class="section-tag" :class="eventData.className">Level: {{ eventData.eventLevel }}</div>
        </div>
        <div class="section-subtitle">{{ eventData.eventStatus }}</div>
        <div class="section-id">Event ID: {{ eventData.eventId }}</div>

        <div class="info-grid">
          <div class="info-item w-full">
            <div class="item-icon">
              <svg-icon icon-class="task-time" />
              <div class="item-label">{{ config.labels.taskTime }}</div>
            </div>
            <div class="item-content flex-row">
              <div class="item-value">{{ eventData.taskTime }}</div>
            </div>
          </div>

          <div class="info-item">
            <div class="item-icon">
              <svg-icon icon-class="upload-time" />
              <div class="item-label">{{ config.labels.uploadTime }}</div>
            </div>
            <div class="item-content">
              <div class="item-value">{{ eventData.uploadTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <el-steps v-if="submitted" class="flex-1" style="max-width: 800px" :active="activeStep" align-center>
        <el-step v-for="item in steps" :key="item.key" :title="item.title" :description="item.description" />
      </el-steps>

      <!-- Identifiers Details Section -->
      <div class="details-section">
        <div class="section-title">{{ config.sections.identifiers.title }}</div>

        <div class="details-grid grid md:grid-cols-2 grid-cols-1 gap-4">
          <div class="details-item">
            <div class="item-label">{{ config.labels.eventGuid }}</div>
            <div class="item-value">{{ eventData.guid }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.labels.robotSerialNumber }}</div>
            <div class="item-value">{{ eventData.serialNumber }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.labels.macAddress }}</div>
            <div class="item-value">{{ eventData.macAddress }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.labels.softwareVersion }}</div>
            <div class="item-value">{{ eventData.softwareVersion }}</div>
          </div>
        </div>
      </div>

      <!-- Technical Details Section -->
      <div class="details-section">
        <div class="section-title">{{ config.sections.technical.title }}</div>

        <div class="details-grid grid md:grid-cols-2 grid-cols-1 gap-4">
          <div class="details-item">
            <div class="item-label">{{ config.labels.productCode }}</div>
            <div class="item-value">{{ eventData.productCode }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.labels.osVersion }}</div>
            <div class="item-value">{{ eventData.osVersion }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.labels.hardwareVersion }}</div>
            <div class="item-value">{{ eventData.hardwareVersion }}</div>
          </div>
        </div>
      </div>

      <!-- Report Issue Section -->
      <div v-if="!submitted" class="details-section">
        <div class="section-title">{{ config.sections.reportIssue.title }}</div>

        <div class="grid md:grid-cols-2 grid-cols-1 gap-4 w-full justify-between mt-4">
          <div class="form-section">
            <div class="form-title">{{ config.sections.reportIssue.contactMethodTitle }}</div>
            <div class="contact-options">
              <el-radio v-model="eventData.contactMethod" label="email">
                <div class="radio-content">
                  <span>{{ config.labels.email }}</span>
                  <el-input v-model="eventData.email" :placeholder="config.placeholders.email" :disabled="eventData.contactMethod !== 'email'" />
                </div>
              </el-radio>

              <el-radio v-model="eventData.contactMethod" label="phone">
                <div class="radio-content">
                  <span>{{ config.labels.phone }}</span>
                  <div class="phone-input" :class="{ 'disabled': eventData.contactMethod !== 'phone' }">
                    <el-select v-model="eventData.countryCode">
                      <el-option v-for="code in config.countryCodes" :key="code.value" :label="code.label" :value="code.value" />
                    </el-select>
                    <el-input
                      v-model="eventData.phone"
                      type="text"
                      inputmode="numeric"
                      :placeholder="config.placeholders.phone"
                      @input="eventData.phone = eventData.phone.replace(/[^0-9]/g, '')"
                    />
                  </div>
                </div>
              </el-radio>
            </div>
          </div>

          <div class="form-section">
            <div class="form-title">{{ config.sections.reportIssue.deadlineTitle }}</div>
            <div class="deadline-options">
              <el-radio v-for="option in config.deadlineOptions" :key="option.value" v-model="eventData.deadline" :label="option.value">{{
                option.label
              }}</el-radio>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submitted" class="details-section">
        <div class="section-title">{{ config.sections.reportIssue.title }}</div>
        <div class="details-grid grid md:grid-cols-2 grid-cols-1 gap-4">
          <div class="details-item">
            <div class="item-label">{{ config.sections.reported.id }}</div>
            <div class="item-value">{{ eventData.issueID }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.sections.reported.method }}</div>
            <div class="item-value">{{ eventData.contactMethod === 'email' ? '' : '+1' }} {{ getContactValue }}</div>
          </div>

          <div class="details-item">
            <div class="item-label">{{ config.sections.reported.response }}</div>
            <div class="item-value">{{ getDeadlineInfo }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer" v-if="!submitted">
        <el-button @click="handleClose">{{ config.buttons.cancel }}</el-button>
        <el-button type="primary" @click="submitReport">{{ config.buttons.submit }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Close, Timer, Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as useUtils from '@/utils/index';
import { saveRobotEvent } from '@/api/robot';
import { useCleanStore } from '@/store/modules/cleaning';

const cleanStore = useCleanStore();
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  eventData: {
    type: Object,
    default: () => ({
      eventType: 'Power Management',
      eventLevel: 'Fatal',
      eventStatus: 'Battery:Low',
      eventId: 'PF-PMDG0023',
      taskTime: '2025-06-16 07:30:15',
      uploadTime: '2025-06-16 07:30:18',
      guid: '123cbd79-166b-4f10-8bf7-a4a0048397f9',
      serialNumber: 'R110644205002',
      macAddress: '90:03:7f:4:299:EB',
      softwareVersion: '2.0.5.614_P01C00008250312421CNU',
      productCode: 'CC1',
      osVersion: '27',
      hardwareVersion: 'Not specified',
      issueID: 'EVT-2025-863819',
      contactMethod: 'Email (user@company.com)',
      issueResponse: 'Within 24 hours'
    })
  },
  config: {
    type: Object,
    default: () => ({
      dialogTitle: 'Event Details',
      labels: {
        taskTime: 'Event Time',
        uploadTime: 'Upload Time',
        eventGuid: 'Event GUID',
        robotSerialNumber: 'Robot Serial Number',
        macAddress: 'MAC Address',
        softwareVersion: 'Software Version',
        productCode: 'Robot Model',
        osVersion: 'OS Version',
        hardwareVersion: 'Hardware Version',
        email: 'Email',
        phone: 'Phone'
      },
      placeholders: {
        email: 'user@company.com',
        phone: 'Enter phone number'
      },
      sections: {
        identifiers: {
          title: 'Identifiers Details'
        },
        technical: {
          title: 'Technical Details'
        },
        reportIssue: {
          title: 'Report Issue',
          contactMethodTitle: 'Preferred Contact Method',
          deadlineTitle: 'Response Deadline'
        },
        reported: {
          title: 'Issue Status',
          id: 'Reference ID',
          method: 'Contact Method',
          response: 'Requested Response'
        }
      },
      countryCodes: [
        { label: 'US/Canada', value: '+1' }
        // { label: 'UK', value: '+44' }
      ],
      deadlineOptions: [
        { value: '24h', label: 'Within 24 hours' },
        { value: '3days', label: 'Within 3 business days' },
        { value: '1week', label: 'Within 1 week' },
        { value: 'no_deadline', label: 'No specific deadline' }
      ],
      buttons: {
        cancel: 'Cancel',
        submit: 'Submit Report'
      },
      messages: {
        emailRequired: 'Please enter your email address',
        phoneRequired: 'Please enter your phone number',
        submitSuccess: 'Report submitted successfully'
      }
    })
  }
});

const eventData = ref(props.eventData);
const activeStep = ref(1);

const steps = ref([
  {
    key: 'report',
    title: 'Reported',
    description: ''
  },
  {
    key: 'report',
    title: 'Under review',
    description: ''
  },
  {
    key: 'mail',
    title: 'E-mail sent out',
    description: ''
  },
  {
    key: 'resolve',
    title: 'Issue resolved',
    description: ''
  }
]);

const emit = defineEmits(['update:visible', 'submit']);

const dialogVisible = ref(props.visible);
const submitted = ref(false);

// Close dialog
const handleClose = () => {
  dialogVisible.value = false;
};

const getDeadlineInfo = computed(() => {
  const node = props.config.deadlineOptions.find((d) => d.value === eventData.value.deadline) || {};
  return node.label;
});

const getContactValue = computed(() => {
  const node = eventData.value;
  return node.contactMethod === 'email' ? node.email : `${node.phone}`;
});

const getBackground = (type) => {
  switch (type) {
    case 'error':
    case 'critical':
      return cleanStore.colors.orange;
    case 'fatal':
      return cleanStore.colors.red;
    case 'warning':
      return cleanStore.colors.yellow;
    case 'normal':
    case 'event':
      return cleanStore.colors.blue;
    default:
      return '';
  }
};

// Submit report
const submitReport = async () => {
  const node = eventData.value;
  if (node.contactMethod === 'email' && !node.email) {
    ElMessage.error(props.config.messages.emailRequired);
    return;
  }

  if (node.contactMethod === 'phone' && !node.phone) {
    ElMessage.error(props.config.messages.phoneRequired);
    return;
  }

  // Prepare data for submission
  const reportData = {
    eventId: node.eventId,
    contactMethod: node.contactMethod,
    referenceId: node.issueID,
    contactValue: getContactValue.value,
    responseDeadline: node.deadline
  };

  const res = await saveRobotEvent(reportData);

  if (res.code === 200) {
    console.log('Submitting report:', reportData);
    emit('submit', reportData);
    // handleClose();
    // ElMessage.success(props.config.messages.submitSuccess);
    submitted.value = true;
  }
};

const getData = (data) => {
  const reportInfo = data.reportInfo || {};
  return {
    eventType: useUtils.capitalize(data.eventType),
    eventLevel: useUtils.capitalize(data.eventLevel),
    className: data.eventLevel,
    eventStatus: data.eventDetail,
    eventId: data.id,
    taskTime: useUtils.formatDate(data.taskTime),
    uploadTime: useUtils.formatDate(data.uploadTime),
    guid: data.eventId,
    serialNumber: data.robotSn,
    macAddress: data.macAddress,
    softwareVersion: data.softwareVersion,
    productCode: data.productCode,
    osVersion: data.osVersion,
    hardwareVersion: data.hardwareVersion,
    issueID: reportInfo.referenceId || data.id,
    contactMethod: reportInfo.contactMethod || 'email',
    email: reportInfo.email || reportInfo.contactValue,
    phone: reportInfo.phone || reportInfo.contactValue,
    deadline: reportInfo.responseDeadline || '24h',
    countryCode: reportInfo.countryCode || props.config.countryCodes[0].value
  };
};

// Watch for visible prop changes
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    submitted.value = !newVal;
    if (!newVal) return;

    const data = getData(props.eventData);
    submitted.value = props.eventData.reportInfo != null;
    activeStep.value = props.eventData.reportInfo?.currentStatus || 1;
    // props.eventData.reportInfo?.reportTimeLines.forEach((d, i) => {
    //   steps[i].title = d.statusText;
    //   steps[i].description = useUtils.formatDate(d.timestamp);
    // });
    const reportTimeLines = (props.eventData.reportInfo?.reportTimeLines || []).map((d, i) => {
      return {
        title: d.statusText,
        description: useUtils.formatDate(d.timestamp)
      };
    });
    steps.value = reportTimeLines;
    activeStep.value = reportTimeLines.length;

    eventData.value = data;
  }
);

// Watch for dialogVisible changes
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.event-details-dialog {
  color: var(--VI-text-B12, #11191e);

  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      margin: 0;
      padding: 16px 20px;
      border-bottom: 1px solid #e4e7ed;
      background-color: #fff;
    }

    .el-dialog__body {
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 16px 20px;
      border-top: 1px solid #e4e7ed;
      background-color: #fff;
    }
  }

  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 32px;
    font-style: normal;
    font-weight: 800;
    line-height: 40px;
    height: 100%;

    .close-btn {
      margin-left: auto;
    }
  }

  .event-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .event-section {
    display: flex;
    padding: 16px;
    flex-direction: column;
    align-self: stretch;
    border-radius: 8px;
    &.power-section {
      border-left: 4px solid $color-blue;
      background: var(--colors-flat-secondary-flat05, rgba(148, 77, 255, 0.05));
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      height: 34px;
      padding: 8px 0px;
      align-items: center;
      gap: 16px;

      overflow: hidden;
      color: var(--VI-text-B12, #11191e);
      text-overflow: ellipsis;
      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
      }

      .section-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.power {
          @extend .clean-critical;
        }
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

    .section-subtitle {
      overflow: hidden;
      color: var(--VI-text-B49, #71797e);
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
    }

    .section-id {
      overflow: hidden;
      color: var(--VI-text-B69, #a2aaaf);
      text-overflow: ellipsis;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
      margin-bottom: 16px;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .info-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;

        .item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          .item-label {
            overflow: hidden;
            color: var(--VI-text-B12, #11191e);
            text-overflow: ellipsis;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
          }
        }

        .item-content {
          display: flex;
          gap: 4px;

          .item-value {
            overflow: hidden;
            color: var(--VI-text-B12, #11191e);
            text-align: right;
            text-overflow: ellipsis;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
          }
        }
      }
    }
  }

  .details-section {
    border-top: 2px solid $color-light-gray;
    padding: 24px 0;
    padding-bottom: 0;

    &:last-child {
      border-bottom: none;
    }

    .section-title {
      color: var(--VI-text-B12, #11191e);
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px;
      margin-bottom: 12px;
    }

    .details-grid {
      .details-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .item-label {
          overflow: hidden;
          color: var(--VI-text-B49, #71797e);
          text-overflow: ellipsis;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 16px;
        }

        .item-value {
          overflow: hidden;
          color: var(--VI-text-B12, #11191e);
          text-overflow: ellipsis;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;
        }
      }
    }

    .form-section {
      margin-bottom: 20px;

      .form-title {
        color: var(--VI-text-B12, #11191e);
        margin-bottom: 12px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 16px; /* 114.286% */
      }

      .contact-options {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .radio-content {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: 8px;

          span {
            width: 60px;
          }

          @media screen and (min-width: 768px) {
            .el-input {
              width: 240px;
            }
          }

          .phone-input {
            display: flex;
            gap: 8px;

            .el-select {
              width: 80px;
            }

            @media screen and (min-width: 768px) {
              .el-input {
                width: 152px;
              }
            }

            &.disabled {
              opacity: 0.7;
            }
          }
        }
      }

      .deadline-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 100px;
    }
  }
}
@media screen and (max-width: 768px) {
  :deep(.el-step__title) {
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    margin-bottom: 4px;
  }
}

@media screen and (min-width: 768px) {
  :deep(.el-step__title) {
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 22px;
    margin-bottom: 4px;
  }
}
:deep(.el-step__description) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
