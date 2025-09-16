<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    width="800px"
    class="settings-dialog alert-settings-dialog"
    :before-close="handleClose"
    align-center
  >
    <template #header>
      <div class="dialog-title">
        <span>Settings</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="alert-config-section">
      <div class="section-title">Alert Configuration</div>
      <div class="section-desc">Configure thresholds for alerts based on location, category, and metrics.</div>

      <!-- 位置信息 -->
      <div class="config-section">
        <filter-panel ref="filterRef" :showSampleFilter="true" @search-event="updateZone" />
      </div>

      <!-- 分类信息 -->
      <div class="config-section">
        <div class="section-label">Category</div>
        <div class="form-grid">
          <div class="form-item">
            <div class="item-label">Type</div>
            <el-select v-model="form.type" placeholder="Type here" class="w-full" @change="updateType">
              <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div class="form-item">
            <div class="item-label">Target</div>
            <el-select v-model="form.target" placeholder="Type here" class="w-full" @change="updateTarget">
              <el-option v-for="item in targets" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 告警类型 -->
    <div class="alert-types-section">
      <div class="section-title">Alert Types</div>

      <div class="alert-cards mt-6">
        <!-- 高温告警卡片 -->
        <div class="alert-card">
          <div class="card-header">
            <div class="alert-title">
              <span class="pr-2"> High {{ form.label }} Alert</span>
              <el-tooltip content="Define the upper limit for each severity level to trigger alerts." effect="light" placement="top">
                <el-icon class="info-default-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="card-body">
            <div class="trigger-logic">
              <div class="logic-title">Trigger Logic</div>
              <div class="logic-content">
                <span>Notify when readings exceed thresholds</span>
                <div class="logic-input-group">
                  <span>for</span>
                  <el-input-number v-model="form.highTempDuration" :min="1" :max="60" style="width: 90px" controls-position="right" size="default" />
                  <el-select v-model="form.highTimeUnit" size="small">
                    <el-option v-for="item in times" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>

            <div class="value-settings">
              <div class="settings-title">Value Settings</div>
              <div class="severity-levels">
                <div v-if="form.highAlerts.length > 0" class="w-full flex flex-col gap-2">
                  <div v-for="(alert, index) in form.highAlerts" :key="index" class="severity-level">
                    <div :class="['level-icon', alert.iconClass]">
                      <svg-icon :icon-class="alert.icon" class="svg" />
                    </div>
                    <div class="level-label">{{ alert.label }}</div>
                    <el-input-number v-model="alert.value" :min="0" :max="10000" controls-position="right" size="small" />
                    <el-button circle type="danger" size="small" @click="removeAlert('highAlerts', alert)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <el-button
                      v-if="form.highAlerts.length < 3 && index === form.highAlerts.length - 1"
                      circle
                      type="primary"
                      size="small"
                      @click="addAlert('highAlerts')"
                      style="margin-left: -8px"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div v-else>
                  <el-button circle type="primary" size="small" @click="addAlert('highAlerts')" style="margin-left: -8px">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 低温告警卡片 -->
        <div class="alert-card">
          <div class="card-header">
            <div class="alert-title">
              <span class="pr-2"> Low {{ form.label }} Alert</span>
              <el-tooltip content="Define the lower limit for each severity level to trigger alerts." effect="light" placement="top">
                <el-icon class="info-default-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="card-body">
            <div class="trigger-logic">
              <div class="logic-title">Trigger Logic</div>
              <div class="logic-content">
                <span>Notify when readings exceed thresholds</span>
                <div class="logic-input-group">
                  <span>for</span>
                  <el-input-number v-model="form.lowTempDuration" :min="1" :max="60" controls-position="right" size="small" />
                  <el-select v-model="form.lowTimeUnit" size="small">
                    <el-option v-for="item in times" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>

            <div class="value-settings">
              <div class="settings-title">Value Settings</div>
              <div class="severity-levels">
                <div v-if="form.lowAlerts.length > 0" class="w-full flex flex-col gap-2">
                  <div v-for="(alert, index) in form.lowAlerts" :key="index" class="severity-level">
                    <div :class="['level-icon', alert.iconClass]">
                      <svg-icon :icon-class="alert.icon" class="svg" />
                    </div>
                    <div class="level-label">{{ alert.label }}</div>
                    <el-input-number v-model="alert.value" :min="0" :max="10000" controls-position="right" size="small" />
                    <el-button circle type="danger" size="small" @click="removeAlert('lowAlerts', alert)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <el-button
                      v-if="form.lowAlerts.length < 3 && index === form.lowAlerts.length - 1"
                      circle
                      type="primary"
                      size="small"
                      @click="addAlert('lowAlerts')"
                      style="margin-left: -8px"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div v-else>
                  <el-button circle type="primary" size="small" @click="addAlert('lowAlerts')" style="margin-left: -8px">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="save">Save Alerts</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Close, InfoFilled } from '@element-plus/icons-vue';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import { saveAlert, getAlertDetail } from '@/api/clean/settings';

const props = defineProps({
  pageId: {
    type: String,
    default: 'alert-settings'
  },
  type: {
    type: String,
    default: 'temperature'
  },
  visible: {
    type: Boolean,
    default: false
  },
  settingType: {
    type: Object,
    default: () => ({})
  }
});
const filterRef = ref(null);
const types = computed(() => {
  return Object.values(props.settingType);
});

const targets = computed(() => {
  const arr = Object.values(props.settingType);
  const item = arr.find((c) => c.value === form.type) || {};

  return item.children || [];
});

const updateType = () => {
  form.dataType = '';
  getData();
};

const categoryMap = {
  environment: 1,
  occupancy: 2,
  consumble: 3
};
let zoneId = null;

const updateTarget = async (item) => {
  console.log(item);
  getData();
};

const updateZone = (id) => {
  zoneId = Number(id);
  getData(id);
};
const getData = async () => {
  const category = categoryMap[props.pageId];
  const dataType = form.target;

  if (zoneId == null || category === '' || dataType === '') return;
  const res = await getAlertDetail({ zoneId, category, dataType });
  const data = res.data;

  console.log('get data from alert settings dialog', data);

  const initData = {
    category: data.dataType,
    highTempDuration: data.duration,
    lowTempDuration: data.duration,
    highTimeUnit: data.durationUnit,
    lowTimeUnit: data.durationUnit,
    highAlerts: [
      { label: 'Very Severe', icon: 'alert-high', iconClass: 'very-severe', key: 'high', value: data.upperWarningRange },
      { label: 'Severe', icon: 'alert-medium', iconClass: 'severe', key: 'medium', value: data.upperSevereRange },
      { label: 'Warning', icon: 'alert-low', iconClass: 'warning', key: 'low', value: data.upperCriticalRange }
    ],
    lowAlerts: [
      { label: 'Very Severe', icon: 'alert-high', iconClass: 'very-severe', key: 'high', value: data.lowerWarningRange },
      { label: 'Severe', icon: 'alert-medium', iconClass: 'severe', key: 'medium', value: data.lowerSevereRange },
      { label: 'Warning', icon: 'alert-low', iconClass: 'warning', key: 'low', value: data.lowerCriticalRange }
    ]
  };
  Object.assign(form, initData);

  // const arr = [];

  // res.data.forEach(d => {
  //   const item = {
  //     label: d.dataType, checked: d.openForecast
  //   }
  //   if (props.pageId === 'environment') {
  //      item.type = d.virtualType;
  //   }
  //   arr.push(item);
  // });
  // forecasts.value = arr;

  // // Object.assign(form, newData)
  // console.log('get data from cleaning priority configuration:', zoneId, data)
};

const times = reactive([
  { label: 'Minutes', value: 'm' },
  { label: 'Hours', value: 'h' }
]);

const getHighAlerts = computed(() => {
  return form.highAlerts.find((c) => c.key === form.category);
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);

// 表单数据
const form = reactive({
  country: '',
  region: '',
  state: '',
  city: '',
  buildingRoom: '',
  scheduleStatus: '',
  category: 'temperature',
  type: '',
  target: '',
  triggerMinutes: 5,
  triggerTimeUnit: 'minutes',
  triggerOccurTimes: 1,
  triggerOccurTimeUnit: 'times',
  highTempDuration: 10,
  highTempVerySevere: 90,
  highTempSevere: 60,
  highTempWarning: 40,
  lowTempDuration: 10,
  lowTempVerySevere: 10,
  lowTempSevere: 20,
  lowTempWarning: 10,
  highAlerts: [], //[{high: 80}, {medium: 60}, {low: 30}]
  lowAlerts: []
});

const alerts = ref([
  { label: 'Very Severe', icon: 'alert-high', iconClass: 'very-severe', key: 'high', value: 10 },
  { label: 'Severe', icon: 'alert-medium', iconClass: 'severe', key: 'medium', value: 60 },
  { label: 'Warning', icon: 'alert-low', iconClass: 'warning', key: 'low', value: 80 }
]);

const addAlert = (key) => {
  if (form[key].length < 3) {
    const alert = alerts.value.find((d) => !form[key].find((a) => a.key === d.key));
    form[key].push(alert);
  }
};

const removeAlert = (key, alert) => {
  form[key] = form[key].filter((d) => d.label !== alert.label);
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 保存告警设置
const save = async () => {
  const data = {
    'zoneId': zoneId.toString(),
    'dataType': form.target,
    'virtualType': form.type,
    'upperThreshold': form.highTempWarning,
    'lowerThreshold': form.lowTempWarning,
    'duration': form.highTempDuration,
    'durationUnit': form.highTimeUnit,
    'lowDuration': form.highTempDuration,
    'lowDurationUnit': form.lowTimeUnit,
    'upperWarningRange': form.highAlerts.find((item) => item.key === 'high')?.value,
    'upperSevereRange': form.highAlerts.find((item) => item.key === 'medium')?.value,
    'upperCriticalRange': form.highAlerts.find((item) => item.key === 'low')?.value,
    // 低温告警等级映射
    'lowerWarningRange': form.lowAlerts.find((item) => item.key === 'high')?.value,
    'lowerSevereRange': form.lowAlerts.find((item) => item.key === 'medium')?.value,
    'lowerCriticalRange': form.lowAlerts.find((item) => item.key === 'low')?.value,
    'category': categoryMap[props.pageId]
  };
  const res = await saveAlert(data);

  if (res.code === 200) {
    ElMessage.success('Alert Settings saved successfully!');
    emit('save', form);
    handleClose();
  }
};

// 监听 modelValue 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听 dialogVisible 变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
    if (!newVal) {
      emit('close');
    }
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.settings-dialog {
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

    .cell {
      display: flex;
      justify-content: center;
    }
  }

  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;

    .close-btn {
      margin-left: auto;
    }
  }

  .section-title {
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    margin-bottom: 8px;
  }

  .section-desc {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    margin-bottom: 24px;
  }

  .section-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .alert-config-section {
    padding-top: 20px;
    margin-bottom: 24px;
  }

  .alert-types-section {
    padding-top: 24px;
    margin-bottom: 24px;
    border-top: 2px solid $color-light-gray;
  }

  .config-section {
    margin-bottom: 24px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .form-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      &.full-width {
        grid-column: span 2;
      }

      .item-label {
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        width: 168px;
        text-align: right;
      }

      .w-full {
        width: 100%;
      }
    }
  }

  .alert-cards {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .alert-card {
    flex: 1;
    background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
    border-radius: 8px;
    overflow: hidden;

    .card-header {
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 700;
      line-height: 16px;
      background-color: #f0f2f5;

      .alert-title {
        display: flex;
        align-items: center;
        font-weight: 600;

        .info-icon {
          margin-right: 8px;
          color: $color-blue;
        }
      }
    }

    .card-body {
      padding: 16px;
    }
  }

  .trigger-logic {
    padding: 16px;
    background-color: white;

    .logic-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 16px;
      margin-bottom: 8px;
    }

    .logic-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
    }

    .logic-input-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-input-number {
        width: 80px;
      }

      .el-select {
        width: 100px;
      }
    }
  }

  .value-settings {
    .settings-title {
      padding-top: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .severity-levels {
      display: flex;
      flex-direction: column;
      gap: 12px;

      svg {
        height: 24px !important;
        width: 24px !important;
      }
    }

    .severity-level {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;

      .level-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      }

      .level-label {
        width: 80px;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
      }

      .el-input-number {
        width: 80px;
      }

      .active-indicators {
        display: flex;
        gap: 4px;
        margin-left: auto;

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #dcdfe6;

          &.active {
            background-color: #409eff;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      min-width: 80px;
    }
  }
}
:deep(.el-select__wrapper) {
  width: 100% !important;
}
</style>
