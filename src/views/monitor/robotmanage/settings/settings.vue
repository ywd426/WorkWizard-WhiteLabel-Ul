<template>
  <el-dialog v-model="dialogVisible" :show-close="false" width="700px" height="90vh" class="robot-settings-dialog" :before-close="handleClose">
    <template #header>
      <div class="dialog-title">
        <span>Settings</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="settings-content">
      <!-- <div class="select-object-section">
        <div class="label">Select Object</div>
        <el-select v-model="form.objectType" placeholder="Select object type" style="width: 220px">
          <el-option label="Robot/Sensor/Equipment/etc." value="robot" />
        </el-select>
      </div> -->

      <div class="config-description">
        <div class="title">Configure costs and parameters for accurate ROI calculations</div>
        <div class="subtitle">These Settings are used for daily cost calculations and ROI analysis.</div>
      </div>

      <div class="tabs-section">
        <div class="tabs">
          <div v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
            {{ tab.label }}
          </div>
        </div>

        <div class="tab-content">
          <!-- Basic Details Tab -->
          <div v-show="activeTab === 'basic'">
            <div class="section-title">Cost Settings</div>
            <div class="cost-settings-section">
              <div class="settings-form">
                <div class="form-group">
                  <label>Electricity Rate</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.electricityRate" step="1" min="0" />
                    <span class="unit">USD / kWh</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Water Rate</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.waterRate" step="1" min="0" />
                    <span class="unit">USD / gallon</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Hourly Wage</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.humanHourlyWage" step="1" min="0" />
                    <span class="unit">USD / hour</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Human Cleaning Rate</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.humanCleaningRate" step="1" min="0" />
                    <span class="unit">ft²/hour</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-title">Robot Investment</div>
            <div class="robot-investment-section">
              <div class="settings-form">
                <div class="form-group">
                  <label>Purchase Price</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.purchasePrice" step="1" min="0" />
                    <span class="unit">USD</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Expected Lifespan</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.expectedLifespan" step="1" min="0" />
                    <span class="unit">years</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Annual Maintenance Cost</label>
                  <div class="input-with-unit">
                    <el-input type="number" v-model="form.annualMaintenanceCost" step="1" min="0" />
                    <span class="unit">USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Cost & Expenses Tab -->
          <div v-show="activeTab === 'additional'" class="additional-costs-tab">
            <div class="section-title">Add New Cost</div>
            <div class="cost-entry-form">
              <div class="form-group">
                <label>Date</label>
                <el-date-picker v-model="costForm.date" type="date" placeholder="Select date" format="YYYY-MM-DD" :prefix-icon="Calendar" />
              </div>
              <div class="form-group">
                <label>Cost Type</label>
                <el-select v-model="costForm.type" placeholder="Type & Select Options">
                  <el-option label="Maintenance" value="maintenance" />
                  <el-option label="Repair" value="repair" />
                  <el-option label="Part Replacement" value="part" />
                  <el-option label="Upgrade" value="upgrade" />
                  <el-option label="Training" value="training" />
                  <el-option label="Other" value="other" />
                </el-select>
              </div>
              <div class="form-group">
                <label>Amount</label>
                <div class="input-with-unit">
                  <el-input-number v-model="costForm.amount" :min="0" :precision="2" :step="100" />
                  <span class="unit">USD</span>
                </div>
              </div>
              <div class="form-group description-group">
                <label>Description</label>
                <el-input :rows="2" type="textarea" v-model="costForm.description" placeholder="e.g. Replaced front sensor" />
              </div>
              <div class="form-actions">
                <el-button type="primary" @click="addCostEntry">Add Cost Entry</el-button>
              </div>
            </div>

            <div class="section-title">Cost History</div>
            <div class="cost-history-carousel">
              <el-carousel :autoplay="false" type="card" height="200px">
                <el-carousel-item v-for="(entry, index) in costEntries" :key="index" class="cost-card">
                  <div class="cost-card-content">
                    <div class="cost-card-header">
                      <h3 class="cost-amount">${{ entry.amount.toLocaleString() }}</h3>
                      <p class="cost-description">{{ entry.description }}</p>
                    </div>
                    <div class="cost-card-type" :class="entry.type">
                      {{ entry.type.charAt(0).toUpperCase() + entry.type.slice(1) }}
                    </div>
                    <div class="cost-card-footer">
                      <div class="cost-date">
                        <el-icon><Calendar /></el-icon>
                        <span>Date: {{ useUtils.formatDate(entry.date) }}</span>
                      </div>
                      <svg-icon icon-class="delete-card" class="svg-danger" @click.stop="removeCostEntry(index)" />
                    </div>
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="saveSettings">Save Settings</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { Close, Calendar, Delete } from '@element-plus/icons-vue';
import * as useUtils from '@/utils/index';
import { saveCost } from '@/api/robot';

const props = defineProps({
  visible: { type: Boolean, default: false },
  robotData: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);
const activeTab = ref('basic');
const tabs = [
  { label: 'Basic Details', value: 'basic' },
  { label: 'Additional Cost & Expenses', value: 'additional' }
];

// 表单数据
const form = ref({
  objectType: 'robot',
  electricityRate: '0.120',
  waterRate: '0.000',
  humanHourlyWage: '0.000',
  humanCleaningRate: '0.000',
  purchasePrice: '0.120',
  expectedLifespan: '0.000',
  annualMaintenanceCost: '0.000',
  robotId: '',
  robotName: '',
  robotType: '',
  robotSn: ''
});

// 额外费用表单数据
const costForm = ref({
  date: new Date(),
  type: 'maintenance',
  amount: 0,
  description: ''
});

const costEntries = ref([]);

// 添加费用条目
const addCostEntry = () => {
  if (!costForm.value.type ?? !costForm.value.amount ?? !costForm.value.description) {
    ElMessage.warning('Please fill in all required fields');
    return;
  }

  costEntries.value.push({
    date: costForm.value.date,
    type: costForm.value.type,
    amount: costForm.value.amount,
    description: costForm.value.description
  });

  // 重置表单
  costForm.value = {
    date: new Date(),
    type: 'maintenance',
    amount: 0,
    description: ''
  };
};

// 删除费用条目
const removeCostEntry = (index) => {
  costEntries.value.splice(index, 1);
  ElMessage.success('Cost entry removed');
};

// 处理关闭对话框
const handleClose = () => {
  costForm.value = {
    date: new Date(),
    type: 'maintenance',
    amount: 0,
    description: ''
  };
  costEntries.value = [];
  activeTab.value = 'basic';
  dialogVisible.value = false;
};

// 保存设置
const saveSettings = async () => {
  try {
    // 这里可以添加表单验证逻辑
    const data = {
      id: form.value.id,
      electricityRate: form.value.electricityRate,
      waterRate: form.value.waterRate,
      humanHourlyWage: form.value.humanHourlyWage,
      humanCleaningRate: form.value.humanCleaningRate,
      purchasePrice: form.value.purchasePrice,
      expectedLifespan: form.value.expectedLifespan,
      annualMaintenanceCost: form.value.annualMaintenanceCost,
      additionalCosts: costEntries.value.map((entry) => ({
        costDate: entry.date,
        costType: entry.type,
        amount: entry.amount,
        description: entry.description
      }))
    };

    const res = await saveCost(data);

    if (res.code === 200) {
      ElMessage.success('Settings saved successfully');
      emit('save', form.value);
      handleClose();
    } else {
      ElMessage.error('Failed to save settings');
    }
  } catch (error) {
    ElMessage.error('Failed to save settings');
    console.error('Save settings error:', error);
  }
};

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;

    if (newVal && Object.keys(props.robotData).length > 0) {
      // 如果有传入数据，则初始化表单
      form.value = {
        objectType: props.robotData.objectType ?? 'robot',
        electricityRate: props.robotData.electricityRate ?? '0.120',
        waterRate: props.robotData.waterRate ?? '0.000',
        humanHourlyWage: props.robotData.humanHourlyWage ?? '0.000',
        humanCleaningRate: props.robotData.humanCleaningRate ?? '0.000',
        purchasePrice: props.robotData.purchasePrice ?? '0.120',
        expectedLifespan: props.robotData.expectedLifespan ?? '0.000',
        annualMaintenanceCost: props.robotData.annualMaintenanceCost ?? '0.000',
        robotId: props.robotData.robotId ?? '',
        robotName: props.robotData.robotName ?? '',
        robotType: props.robotData.robotType ?? '',
        robotSn: props.robotData.robotSn ?? '',
        id: props.robotData.id ?? ''
      };
    }
  },
  { deep: true }
);

// 监听对话框状态变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.robot-settings-dialog {
  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0 8px 0 0;

    .robot-info {
      font-size: 1rem;
      font-weight: 400;
      color: #666;
      margin-left: 10px;
    }

    .close-btn {
      color: #222;
      font-size: 18px;
      &:hover {
        background: #f5f7fa;
      }
    }
  }

  .settings-content {
    padding: 0 20px;
  }

  .select-object-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .label {
      font-weight: 500;
      margin-right: 15px;
      color: #333;
    }
  }

  .config-description {
    margin-bottom: 20px;
    color: var(--VI-text-B12, #11191e);

    .title {
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 16px;
      letter-spacing: -0.144px;
      margin-bottom: 8px;
    }

    .subtitle {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }
  }

  .tabs-section {
    margin-bottom: 20px;
  }

  .tabs {
    display: flex;
    justify-content: center;

    border-radius: 20px;
    padding: 4px;

    .tab {
      display: flex;
      height: 28px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      background-color: #f0f2f5;
      border-radius: 100px;
      cursor: pointer;
      gap: 8px;
      text-align: center;
      font-size: 12px;
      font-style: normal;
      height: 2rem;
      font-weight: 600;
      line-height: 16px;

      /* 133.333% */
      &.active {
        color: var(--layout-bg_TextSelection, #fff);

        border-radius: 100px;
        background: var(--layout-bg_focus, #09f);
        box-shadow:
          0px 10px 15px -3px rgba(0, 153, 255, 0.4),
          0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1));
      }
    }
  }

  .tab-buttons {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
  }

  .tab-button {
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    position: relative;
    transition: all 0.3s;
  }

  .tab-button.active {
    color: #409eff;
    font-weight: 500;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #409eff;
  }

  .tab-content {
    padding: 10px 0;
  }

  .section-title {
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    margin-bottom: 24px;
  }

  .cost-settings-section,
  .robot-investment-section {
    margin-bottom: 25px;
  }

  .cost-entry-form,
  .settings-form {
    :deep(.el-form-item) {
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      .el-form-item__label {
        font-weight: 400;
        color: #333;
        text-align: right;
        padding-right: 12px;
      }

      .el-form-item__content {
        display: flex;
        align-items: center;
      }

      .el-input {
        width: 220px;
      }
    }

    .unit {
      margin-left: 20px;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
      width: 120px;
    }
  }

  .cost-entry-form {
    :deep(.el-input__inner),
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      width: 240px;
    }

    .el-select,
    .el-input-number,
    .el-textarea,
    .el-input {
      width: 240px;
    }

    :deep(.el-input-number.is-controls-right .el-input-number__increase),
    :deep(.el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase) {
      --el-input-number-controls-height: 15px;
      height: 32px !important;
      line-height: 32px !important;
    }
  }

  .form-group {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .form-group label {
    text-align: right;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    width: 100px;
  }

  .input-with-unit {
    display: flex;
    align-items: center;
  }

  .input-with-unit input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }

  /* Additional Costs Tab Styles */
  .additional-costs-tab {
    padding: 0 10px;
  }

  .cost-entry-form {
    background-color: #f5f7fa;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    margin-bottom: 30px;
  }

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }

  .cost-history-carousel {
    margin-top: 20px;
  }

  .cost-card {
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: white;
  }

  .cost-card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    color: var(--VI-text-B12, #11191e);
  }

  .cost-card-header {
    text-align: left;
    margin-bottom: 16px;
  }

  .cost-amount {
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    margin: 0 0 8px 0;
  }

  .cost-description {
    color: var(--VI-text-B49, #71797e);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  .cost-card-type {
    display: flex;
    padding: 4px 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 100px;
    width: fit-content;
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  .cost-card-type.maintenance {
    @extend .clean-primary;
  }

  .cost-card-type.repair {
    @extend.clean-critical;
  }

  .cost-card-type.part {
    @extend .clean-normal;
  }

  .cost-card-type.software {
    @extend .clean-info;
  }

  .cost-card-type.training {
    @extend.clean-warning;
  }

  .cost-card-type.other {
    @extend .clean-flight;
  }

  .cost-card-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }

  .cost-date {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  .cost-date .el-icon {
    margin-right: 5px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
  }
}

:deep(.el-dialog) {
  height: 90vh !important;
}
</style>
