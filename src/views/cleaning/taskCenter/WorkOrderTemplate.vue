<template>
  <el-dialog v-model="dialogVisible" :show-close="false" width="800px" class="work-order-template-dialog" :before-close="handleClose" align-center>
    <template #header>
      <div class="dialog-title">
        <span>{{ header }}</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="work-order-tabs priority-buttons" v-if="type !== 'add'">
      <el-button
        v-for="type in tabList"
        :key="type.value"
        :type="activeType === type.value ? 'primary' : 'default'"
        size="middle"
        @click="clickTab(type.value)"
        class="priority-btn"
      >
        {{ type.label }}
      </el-button>
    </div>

    <task-performance v-if="activeType === 'performance'" :id="templateId" :zoneId="curZoneId" :metricTypes="metricTypes"/>

    <div v-if="showTypeSection && activeType === 'type'" class="template-type-section">
      <div class="section-label">
        Choose Template Type  
        <el-tooltip content="Please select the template type." placement="top" effect="light">
            <el-icon class="info-default-icon"><InfoFilled /></el-icon>
          </el-tooltip>
      </div>

      <div class="template-types" :class="{ 'not-allowd': type === 'view' }">
        <!-- 定时工作订单 -->
        <div class="template-type-card" :class="{ 'active': form.templateType === 'scheduled' }" @click="selectTemplateType('scheduled')">
          <div class="card-header">
            <div class="icon scheduled">
              <svg-icon icon-class="scheduled" />
            </div>
            <div class="title">Scheduled Work Orders</div>
          </div>
          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Run on a regular scheduled</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Best for routine tasks or weekly checks</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Precise control over task frequency</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Predictable workloads</span>
              </div>
            </div>
            <div class="card-footer" :style="{ 'color': cleanStore.colors.green, 'background': 'rgba(0, 186, 74, 0.05)' }">
              <span class="best-for">Best for: </span>
              <span class="best-for-desc">Regular cleaning, preventative maintenance</span>
            </div>
          </div>
        </div>

        <!-- 基于警报的工作订单 -->
        <div class="template-type-card" :class="{ 'active': form.templateType === 'alert_based' }" @click="selectTemplateType('alert_based')">
          <div class="card-header">
            <div class="icon alert_based">
              <svg-icon icon-class="alert_based" />
            </div>
            <div class="title">Alert-Based Work Orders</div>
          </div>
          <div class="card-content">
            <div class="feature-list">
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Triggered by system alerts</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Tasks created immediately</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>Reacts real-time with triggers</span>
              </div>
              <div class="feature-item">
                <el-icon><Select /></el-icon>
                <span>Condition-based maintenance</span>
              </div>
            </div>
            <div class="card-footer" :style="{ 'color': cleanStore.colors.orange, 'background-color': 'rgba(237, 182, 1, 0.10)' }">
              <span class="best-for">Best for: </span>
              <span class="best-for-desc">Reactive tasks, emergency response</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scheduled Work Orders 内容 -->
    <template v-if="form.templateType === 'scheduled' && activeType === 'type'">
      <!-- Work Order Details 部分 -->
      <div class="work-order-details-section" :class="{ 'not-allowd': type === 'view' }">
        <div class="section-title">Work Order Details</div>
        <el-form :model="form" label-width="120px" class="template-form" size="large" :disabled="type === 'view'">
          <div class="form-grid">
            <el-form-item label="Work Order Name">
              <el-input v-model="form.templateName" placeholder="e.g., Maintenance Check" />
            </el-form-item>

            <div class="flex w-full">
              <el-form-item label="Assignee(s)" class="flex-1">
                <el-select v-model="form.assignees" filterable allow-create placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in assigneeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="Reporter(s)" class="flex-1">
                <el-select v-model="form.reporters" filterable allow-create placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in reporterOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </div>

            <div class="flex w-full">
              <filter-panel ref="filterRef" :showSampleFilter="true" :zoneId="zoneId" labelWidth="104px" />
            </div>

            <el-form-item label="Effective Date">
              <el-date-picker
                v-model="form.effectiveDate"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                format="YYYY-MM-DD"
                class="full-width"
              />
            </el-form-item>

            <div class="flex w-full">
              <el-form-item label="Status" class="flex-1">
                <el-select v-model="form.status" placeholder="Type Name">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="Work Order Type" class="flex-1">
                <el-select v-model="form.workOrderType" placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in workOrderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="Source" style="width: 50%">
              <el-select v-model="form.source" placeholder="Inspection" style="width: 100%">
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <div class="full flex gap-2 items-center">
              <el-form-item id="duration-node" label="Duration" class="flex" style="width: 50%">
                <el-input-number v-model="form.duration" placeholder="Inspection" style="width: 100%" />
              </el-form-item>
              <el-select v-model="form.durationUnit" style="width: 120px; margin-left: 10px">
                <el-option label="Minutes" value="min" />
                <el-option label="Hours" value="h" />
              </el-select>
            </div>

            <el-form-item label="Task Explanation" class="full-width">
              <el-input v-model="form.taskExplanation" type="textarea" :rows="3" placeholder="Type here" />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- Scheduled Work Order Settings 部分 -->
      <div v-if="showScheduledSettings" class="scheduled-settings-section">
        <div class="section-title">Scheduled Work Order Settings</div>

        <div class="run-frequency">
          <div class="subsection-title">How Often Should Tasks Run?</div>

          <el-form :model="form" label-width="120px" class="template-form" size="large" :disabled="type === 'view'">
            <div class="form-grid">
              <el-form-item label="Frequency Type">
                <div class="w-full flex gap-4 flex-nowrap items-end">
                  <el-select v-model="form.frequencyType" style="width: 180px">
                    <el-option label="Every Few Hours" value="hours" />
                    <el-option label="Daily" value="days" />
                    <el-option label="Weekly" value="weeks" />
                    <el-option label="Monthly" value="months" />
                  </el-select>
                  <div>
                    <el-input-number v-model="form.hoursInterval" :min="1" :max="24" style="width: 120px" controls-position="right" size="default" />
                  </div>
                  <span class="interval-label">{{ intervals[form.frequencyType] }}</span>
                </div>
              </el-form-item>

              <!-- <el-form-item label="Daily Time Window">
                <el-time-picker
                  v-model="form.dailyTime"
                  is-range
                  range-separator="-"
                  start-placeholder="Start time"
                  end-placeholder="End time"
                  style="width: 350px"
                />
              </el-form-item> -->

              <el-form-item label="Days">
                <div class="day-buttons flex gap-3">
                  <div v-for="day in days" class="day-buttons-item" :class="{ 'day-buttons-item-selected': form.days[day.value] }">
                    <el-checkbox v-model="form.days[day.value]">{{ day.label }}</el-checkbox>
                  </div>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>

      <!-- Metrics Monitoring 部分 -->
      <div class="metrics-monitoring-section">
        <div class="section-title mb-6 flex items-center gap-2">
          Metrics Monitoring(Optional)
          <el-tooltip content="Track metrics like temperature, occupancy, or supply levels." placement="top" effect="light">
            <el-icon class="info-default-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>

        <div class="metrics-selector" :class="{ 'not-allowd': type === 'view' }">
          <div class="metrics-name flex gap-6 items-center w-full">
            <div class="w-20 text-right">Metrics Name</div>
            <el-button type="primary" @click="triggerAlert('scheduled')" :disabled="type === 'view'">Add Metrics</el-button>
          </div>
        </div>

        <div class="metrics-tags ml-26">
          <el-tag v-for="(tag, index) in metricsTags" :key="index" :type="tag.type" closable @close="removeMetricsTag(index)" class="metrics-tag">
            {{ tag.text }}
          </el-tag>
        </div>
      </div>
    </template>

    <!-- Alert-Based Work Orders 内容 -->
    <template v-if="form.templateType === 'alert_based' && activeType === 'type'">
      <div class="basic-details-section" :class="{ 'not-allowd': type === 'view' }">
        <div class="section-title">Basic Details</div>
        <el-form :model="form" label-width="120px" class="template-form" size="large" :disabled="type === 'view'">
          <div class="form-grid">
            <el-form-item label="Template Name">
              <el-input v-model="form.templateName" placeholder="e.g., Restroom Cleaning, Lobby Traffic Areas" />
            </el-form-item>
            <div class="flex w-full">
              <el-form-item label="Assignee(s)" class="flex-1">
                <el-select v-model="form.assignees" filterable allow-create placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in assigneeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="Reporter(s)" class="flex-1">
                <el-select v-model="form.reporters" filterable allow-create placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in reporterOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </div>
            <!-- <el-form-item label="Location">
              <div class="flex gap-2 w-full">
                <el-input v-model="form.location" style="width: 240px" placeholder="Please Select Building" />
                <el-input v-model="form.floor" style="width: 240px" placeholder="Please Select Floor" />
                <el-input v-model="form.area" style="width: 240px" placeholder="Please Select Area" />
                <el-select v-model="form.location" placeholder="Select Building" class="flex-1">
                  <el-option v-for="item in locationOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="form.floor" placeholder="Select Floor" style="margin-left: 10px" class="flex-1">
                  <el-option v-for="item in floorOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="form.area" placeholder="Select Area" style="margin-left: 10px" class="flex-1">
                  <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>
            </el-form-item> -->
            <filter-panel ref="filterRef" :showSettingFilter="true" :zoneId="zoneId" />
            <el-form-item label="Effective Date">
              <el-date-picker
                v-model="form.effectiveDate"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                format="YYYY-MM-DD"
                class="full-width"
              />
            </el-form-item>

            <div class="flex w-full">
              <el-form-item label="Status" class="flex-1" style="width: 50%">
                <el-select v-model="form.status" placeholder="Type Name" style="width: 50%">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <!-- <el-form-item label="Work Order Type" class="flex-1">
                <el-select v-model="form.workOrderType" placeholder="Type Name" style="width: 100%">
                  <el-option v-for="item in workOrderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item> -->
            </div>

            <!-- <el-form-item label="Source" style="width: 50%">
              <el-select v-model="form.source" placeholder="Inspection" style="width: 100%">
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item> -->

            <!-- <el-form-item label="Duration" style="width: 50%">
              <el-select v-model="form.duration" placeholder="Select Work Order Duration" style="width: 100%">
                <el-option v-for="item in durationOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item> -->
            <el-form-item id="duration-node-alert" label="Duration" class="flex-1">
              <el-input-number v-model="form.timePerOrder" :min="1" step="1" size="default" />
              <el-select v-model="form.durationUnit" style="width: 120px; margin-left: 10px">
                <el-option label="Minutes" value="min" />
                <el-option label="Hours" value="h" />
              </el-select>
            </el-form-item>
            <el-form-item label="Task Explanation" class="full-width">
              <el-input v-model="form.taskExplanation" type="textarea" :rows="3" placeholder="Type here" />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 基于警报的工作订单设置 -->
      <div class="alert-settings-section">
        <div class="section-title mb-6">Alert-Based Work Order Settings</div>

        <el-form id="prevent-Work-order" :model="form" label-width="200px" class="template-form" size="large">
          <div class="flex gap-2 items-center">
            <span class="subsection-title mt-0 mb-0">Prevent Work Order Overload</span>
            <el-tooltip content="This prevents creating too many tasks when the same alert keeps triggering." effect="light" placement="top">
              <el-icon class="info-default-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="form-grid">
            <el-form-item label="Wait Time Between Work Orders" label-width="244px">
              <el-input-number v-model="form.waitTime" :min="1" controls-position="right" size="default" style="width: 80px" />
              <el-select v-model="form.waitTimeUnit" style="width: 120px; margin-left: 10px">
                <el-option label="Minutes" value="minutes" />
                <el-option label="Hours" value="hours" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>

        <!-- <div class="template-form alert_based-form">
          <div id="alert-settings-title" class="subsection-title mb-6">Alert-Based Work Order Settings</div>
          <el-form-item label="Date Range" label-width="100px">
            <el-time-picker
              v-model="form.dateRange"
              is-range
              range-separator="-"
              start-placeholder="Start time"
              end-placeholder="End time"
              style="width: 350px"
            />
          </el-form-item>
          <span class="alert_based-form-prompt">Work orders will only be created when alerts occur within this date range.</span>
        </div> -->

        <div class="section-subtitle flex gap-2 items-center">
          <span class="section-title">Which Alerts Should Trigger Work Orders?</span>
          <el-tooltip content="Choose which system alerts will automatically create work orders." effect="light" placement="top">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>

        <div class="alert-selector mt-6" :class="{ 'not-allowd': type === 'view' }">
          <div class="flex gap-4 text-right">
            <div class="alert-label mr-2 w-24">Connected Alerts</div>
            <el-button type="danger" size="middle" @click="triggerAlert('alert')">Add Alert</el-button>
          </div>
        </div>

        <!-- 警报标签列表 -->
        <div class="alert-tags ml-26">
          <el-tag v-for="(tag, index) in alertTags" :key="index" :type="tag.type" :class="tag.type" closable @close="removeAlertTag(index)">
            {{ tag.text }}
          </el-tag>
        </div>
      </div>

      <!-- 优先级标准 -->
      <div v-if="showPrioritySettings" class="priority-criteria-section">
        <div class="section-title">Priority Criteria</div>

        <div class="priority-buttons">
          <el-button
            v-for="priority in priorityOptions"
            :key="priority.value"
            :type="form.priority === priority.value ? 'primary' : ''"
            @click="form.priority = priority.value"
          >
            {{ priority.label }}
          </el-button>
        </div>

        <!-- 高优先级详情 -->
        <div class="priority-details">
          <div class="priority-title">High Priority</div>

          <div class="threshold-items w-full">
            <div class="threshold-item">
              <div class="threshold-label">{{ priorityPrompt[form.priority].tempHighOptions }} {{ priorityPrompt.room }}</div>
              <el-select v-model="form.tempHighThreshold" placeholder="Select threshold" style="width: 100%">
                <el-option v-for="item in priorityData[form.priority].tempHighOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="threshold-item">
              <div class="threshold-label">{{ priorityPrompt[form.priority].airQualityOptions }} {{ priorityPrompt.room }}</div>
              <el-select v-model="form.airQualityThreshold" placeholder="Select threshold" style="width: 100%">
                <el-option v-for="item in priorityData[form.priority].airQualityOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="threshold-item">
              <div class="threshold-label">{{ priorityPrompt[form.priority].waterLevelOptions }} {{ priorityPrompt.room }}</div>
              <el-select v-model="form.waterLevelThreshold" placeholder="Select threshold" style="width: 100%">
                <el-option v-for="item in priorityData[form.priority].waterLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="threshold-item">
              <div class="threshold-label">{{ priorityPrompt[form.priority].soapLevelOptions }} {{ priorityPrompt.room }}</div>
              <el-select v-model="form.soapLevelThreshold" placeholder="Select threshold" style="width: 100%">
                <el-option v-for="item in priorityData[form.priority].soapLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="threshold-item">
              <div class="threshold-label">{{ priorityPrompt[form.priority].energyUsageOptions }} {{ priorityPrompt.room }}</div>
              <el-select v-model="form.energyUsageThreshold" placeholder="Select threshold" style="width: 100%">
                <el-option v-for="item in priorityData[form.priority].energyUsageOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="alertTags.length > 0" class="creation-conditions-details flex flex-col">
        <div class="section-title pb-4">
          Auto-Priority Assignment
          <el-tooltip
            content="Work order priority is automatically determined by the highest severity level among all imported alerts. Configure how each severity level maps to priority levels below."
            effect="light"
            placement="top"
          >
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="w-full h-full bg-white">
          <div v-for="item in priorities" :key="item" class="introduction w-full flex flex-row items-center">
            <div class="flex gap-4 left">
              <svg-icon :icon-class="item.icon" />
              {{ item.label }}
            </div>

            <el-icon class="w-6 h-6"><Right /></el-icon>

            <div class="w-[220px]">
              <el-select v-model="item.value" size="small" class="priority-select" disabled="true">
                <el-option :label="item.priority" :value="item.value">Low</el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 何时创建工作订单 -->
      <div class="creation-conditions-section">
        <div class="section-title">When should work orders be created?</div>

        <div class="condition-options">
          <el-radio v-model="form.creationCondition" :label="'all'"> Trigger the task if all sensors meet the conditions. </el-radio>
          <el-radio v-model="form.creationCondition" :label="'any'">
            Trigger the task if any
            <el-input-number v-model="form.sensorCount" :min="1" :max="100" controls-position="right" size="default" style="width: 86px" />
            of the sensors meet the conditions.
          </el-radio>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="save">{{ type === 'create' ? 'Create' : 'Save' }}</el-button>
      </div>
    </template>
  </el-dialog>

  <add-sensor-monitoring
    ref="sensorRef"
    v-model:visible="showSensorDialog"
    :default-selected="sensorsSelected"
    :type="sensorType"
    @submit="onSensorsSelected"
  />
</template>

<script setup>
import TaskPerformance from '@/views/cleaning/taskCenter/TaskPerformance.vue';
import AddSensorMonitoring from '@/views/cleaning/taskCenter/AddSensorMonitoring.vue';
import { useCleanStore } from '@/store/modules/cleaning';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import { updateTemplate, createWorkOrder, createTemplate } from '@/api/clean/task';
import { ElMessage } from 'element-plus';
import { Close, InfoFilled, Select, Right } from '@element-plus/icons-vue';
import { initDatePickerDate } from '@/utils/clean';
const cleanStore = useCleanStore();
const showPerformanceDialog = ref(false);
const filterRef = ref(null);
const sensorRef = ref(null);
const metricTypes = ref([]);
const props = defineProps({
  visible: { type: Boolean, default: false },
  header: {
    type: String,
    default: 'Create Work Order Template'
  },
  type: {
    type: String,
    default: ''
  },
  modelType: {
    type: String,
    default: ''
  },
  showTypeSection: {
    type: Boolean,
    default: true
  },
  showScheduledSettings: {
    type: Boolean,
    default: true
  },
  curTask: {
    type: Object,
    default: () => ({})
  },
  modelValue: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false }
});
const activeType = ref('type');
const tabList = ref([
  {
    value: 'type',
    label: 'Detail'
  },
  {
    value: 'performance', // 必须拥有工单 才能有performance
    label: 'Performance'
  }
]);

const templateId = ref('');
const zoneId = ref('');
const curZoneId = ref('');
const showSensorDialog = ref(false);
const emit = defineEmits(['update:visible', 'save', 'close']);

const dialogVisible = ref(props.visible);
const sensorType = ref('');
const showPrioritySettings = ref(false);
const days = [
  { label: 'Mon', value: 'mon' },
  { label: 'Tue', value: 'tue' },
  { label: 'Wed', value: 'wed' },
  { label: 'Thu', value: 'thu' },
  { label: 'Fri', value: 'fri' },
  { label: 'Sat', value: 'sat' },
  { label: 'Sun', value: 'sun' }
];

const intervals = {
  hours: 'hours',
  days: 'days',
  weeks: 'weeks',
  months: 'months'
};
const now = new Date();
const getTimeRange = (start, end) => {
  const startHour = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8, 0, 0) : '';
  const endHour = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 18, 0, 0) : '';
  return [startHour, endHour];
};

const [startHour, endHour] = getTimeRange(now, now);

const getFormData = () => {
  return {
    templateType: 'scheduled', // scheduled 或 alert_based
    templateName: '',
    templateId: '',
    location: '',
    floor: '',
    area: '',
    timePerOrder: '1',
    preventOverload: true,
    waitTime: 30,
    waitTimeUnit: 'minutes',
    // dateRange: [startHour, endHour],
    selectedAlerts: [],
    priority: 'low',
    tempHighThreshold: '',
    airQualityThreshold: '',
    waterLevelThreshold: '',
    soapLevelThreshold: '',
    energyUsageThreshold: '',
    creationCondition: 'all',
    sensorCount: 1,
    // Scheduled Work Orders 新增字段
    assignees: [],
    reporters: [],
    roomName: '',
    effectiveDate: '',
    // dailyTime: [startHour, endHour],
    status: '',
    workOrderType: 'template',
    source: 'inspection',
    duration: '',
    durationUnit: 'hours',
    taskExplanation: '',
    frequencyType: 'hours',
    hoursInterval: 1,
    startTime: '',
    endTime: '',
    days: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      sat: false,
      sun: false
    },
    metricsName: ''
  };
};
// 表单数据
const form = reactive({ ...getFormData() });

const priorities = ref([
  { value: 'low', icon: 'alert-low', priority: 'Low Priority', label: 'Warning' },
  { value: 'medium', icon: 'alert-medium', priority: 'Medium Priority', label: 'Severe' },
  { value: 'high', icon: 'alert-high', priority: 'High Priority', label: 'Very Severe' }
]);

const priorityOptions = [
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' }
];

const priorityData = ref({
  low: {
    tempHighOptions: [{ label: 'Warning greater 20°C - Low', value: 'temp_20' }],
    airQualityOptions: [{ label: 'Below 90% quality - Low', value: 'air_90' }],
    waterLevelOptions: [{ label: 'Above 50% capacity - Low', value: 'water_50' }],
    soapLevelOptions: [{ label: 'Below 40% level - Low', value: 'soap_40' }],
    energyUsageOptions: [{ label: 'Exceeds 80% of average - Low', value: 'energy_180' }]
  },
  medium: {
    tempHighOptions: [{ label: 'Warning greater 15°C - Medium', value: 'temp_25' }],
    airQualityOptions: [{ label: 'Below 65% quality - Medium', value: 'air_85' }],
    waterLevelOptions: [{ label: 'Above 70% capacity - Medium', value: 'water_70' }],
    soapLevelOptions: [{ label: 'Below 20% level - Medium', value: 'soap_20' }],
    energyUsageOptions: [{ label: 'Exceeds 100% of average - Medium', value: 'energy_100' }]
  },
  high: {
    tempHighOptions: [
      { label: 'Warning greater 25°C - Very Severe', value: 'temp_25' },
      { label: 'Warning greater 30°C - Severe', value: 'temp_30' }
    ],
    airQualityOptions: [
      { label: 'Below 80% quality - Severe', value: 'air_80' },
      { label: 'Below 70% quality - Very Severe', value: 'air_70' }
    ],
    waterLevelOptions: [
      { label: 'Above 90% capacity - Severe', value: 'water_90' },
      { label: 'Above 95% capacity - Very Severe', value: 'water_95' }
    ],
    soapLevelOptions: [
      { label: 'Below 20% level - Very Severe', value: 'soap_20' },
      { label: 'Below 30% level - Severe', value: 'soap_30' }
    ],
    energyUsageOptions: [
      { label: 'Exceeds 150% of average - Medium', value: 'energy_150' },
      { label: 'Exceeds 200% of average - Severe', value: 'energy_200' }
    ]
  }
});
const priorityPrompt = ref({
  room: '(room-101)',
  low: {
    tempHighOptions: 'Temperature - Slightly High',
    airQualityOptions: 'Air Quality - Moderate',
    waterLevelOptions: 'Water Level - Normal',
    soapLevelOptions: 'Hand Soap Sufficient',
    energyUsageOptions: 'Normal Energy Usage'
  },
  medium: {
    tempHighOptions: 'Temperature - High',
    airQualityOptions: 'Air Quality - Poor',
    waterLevelOptions: 'Water Level - Almost Full',
    soapLevelOptions: 'Hand Soap Running Low',
    energyUsageOptions: 'Increased Energy Usage'
  },
  high: {
    tempHighOptions: 'Temperature - Too High',
    airQualityOptions: 'Air Quality',
    waterLevelOptions: 'Water Level - Nearly Full',
    soapLevelOptions: 'Hand Soap Running Low',
    energyUsageOptions: 'Unusual Energy Usage'
  }
});
// Scheduled Work Orders 新增选项数据
const assigneeOptions = [];

const reporterOptions = [];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

const workOrderTypeOptions = [
  // { label: 'Active', value: 'active' },
  // { label: 'AI Recommended', value: 'ai_recommended' },
  { label: 'Template', value: 'template' }
];
const sourceOptions = [
  { label: 'AI Recommended', value: 'ai_recommended' },
  { label: 'Manual', value: 'scheduled' },
  { label: 'Alert Based', value: 'alert_based' },
  { label: 'Manual', value: 'manual' },
  { label: 'External', value: 'external' },
  { label: 'Inspection', value: 'inspection' }
];

const durationOptions = [
  { label: '15 minutes', value: '15min' },
  { label: '30 minutes', value: '30min' },
  { label: '1 hour', value: '1hour' },
  { label: '2 hours', value: '2hours' }
];

const metricsOptions = [
  { label: 'Occupancy - Count people in space', value: 'occupancy' },
  { label: 'Toilet Paper Level - Paper dispenser status', value: 'toilet_paper' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Air Quality', value: 'air_quality' }
];

const alertTags = ref([]);
const metricsTags = ref([]);

const clickTab = (type) => {
  const tags = sensorType.value === 'alert' ? alertTags : metricsTags;

  templateId.value = form.templateId;
  metricTypes.value = tags.value.map((d) => d.category || d.value);
  curZoneId.value = zoneId.value || form.zoneId;
  activeType.value = type;
};
// 选择模板类型
const selectTemplateType = (type) => {
  form.templateType = type;
};

const triggerAlert = (type) => {
  console.log('trigger alert');
  sensorType.value = type;
  showSensorDialog.value = true;
};
const scheduleSensors = ref([]);
const sensorsSelected = ref([]);

const getSensorList = (sensors) => {
  const isAlert = sensorType.value === 'alert';

  //  { text: 'Temperature Too High - Exceeds 30°C - Very Severe', type: 'danger' },
  return sensors.map((d) => {
    const padding = isAlert ? `- ${d.severity}` : '';

    return {
      text: `${d.label} - ${d.desc} ${padding}`,
      type: d.severity,
      value: d.value,
      category: d.category,
      severity: d.severity
    };
  });
};

const onSensorsSelected = (sensors) => {
  const isAlert = sensorType.value === 'alert';
  const node = isAlert ? scheduleSensors : sensorsSelected;
  const tags = isAlert ? alertTags : metricsTags;

  node.value = sensors.map((d) => d.value);
  //  { text: 'Temperature Too High - Exceeds 30°C - Very Severe', type: 'danger' },
  tags.value = getSensorList(sensors);
  showSensorDialog.value = false;

  console.log('submit sensors', tags.value, metricsTags.value, alertTags.value);
};
// 移除警报标签
const removeAlertTag = (index) => {
  alertTags.value.splice(index, 1);
  sensorRef.value?.updateStatus(index);
};

// 移除指标标签
const removeMetricsTag = (index) => {
  metricsTags.value.splice(index, 1);
  sensorRef.value?.updateStatus(index);
};

const frontendToDbFormat = (formData) => {
  const startTime = props.type === 'add' ? formData.effectiveDate[0] : formData.dateRange[0];
  const endTime = props.type === 'add' ? formData.effectiveDate[1] : formData.dateRange[1];
  return {
    templateId: formData.templateId,
    templateType: formData.templateType,
    workOrderBo: {
      name: formData.templateName,
      buildingId: formData.location,
      zoneId: filterRef.value?.floorZone[1],
      assigneeId: formData.assignees,
      reporterId: formData.reporters,
      startTime: new Date(startTime).toISOString(),
      dueTime: new Date(endTime).toISOString(),
      status: formData.status,
      workOrderType: formData.workOrderType,
      source: formData.source,
      duration: formData.duration,
      description: formData.taskExplanation,
      priority: formData.priority
    },
    templateAlertsVoList: formData.selectedAlerts.map((alert) => ({
      dataType: alert.dataType,
      category: 1,
      alarmType: alert.alarmType,
      severityPriorityMap: JSON.stringify({ priority: alert.priority })
    })),
    alertBasedTemplateSettingsBo: {
      logicType: 'any',
      numValue: formData.sensorCount,
      cooldownPeriod: formData.waitTime,
      cooldownPeriodUnit: formData.waitTimeUnit
    }
  };
};

const getTaskData = () => {
  return {
    'name': form.templateName,
    'workOrderType': form.workOrderType,
    'buildingId': filterRef.value?.floorZone[0],
    'zoneId': filterRef.value?.floorZone[1],
    'assigneeId': form.assignees,
    'reporterId': form.reporters,
    'startTime': new Date(form.effectiveDate[0]).toISOString(),
    'dueTime': new Date(form.effectiveDate[1]).toISOString(),
    'status': form.status,
    'source': form.source,
    'description': form.taskExplanation,
    'priority': 'low',
    'duration': form.duration,
    'durationUnit': form.durationUnit,
    'workOrderMetricsBo': metricsTags.value.map((d) => {
      return {
        'dataType': d.value
      };
    })
  };
};

const revertTime = (time) => {
  const date = new Date(time);
  return date.toTimeString().split(' ')[0]; // 提取 "08:18:03"
};

const getTemplateData = () => {
  const data = {
    'templateType': form.templateType,
    'workOrderBo': {
      'name': form.templateName,
      'workOrderType': form.workOrderType,
      'buildingId': filterRef.value?.floorZone[0],
      'zoneId': filterRef.value?.floorZone[1],
      'assigneeId': form.assignees,
      'reporterId': form.reporters,
      'startTime': new Date(form.effectiveDate[0]).toISOString(),
      'dueTime': new Date(form.effectiveDate[1]).toISOString(),
      'status': form.status,
      'source': form.source,
      'description': form.taskExplanation,
      'priority': 'low',
      'duration': form.duration,
      'durationUnit': form.durationUnit,
      'workOrderMetricsBo': metricsTags.value.map((d) => {
        return {
          'dataType': d.value
        };
      })
    },
    'templateAlertsBoList': alertTags.value.map((d) => {
      return {
        'dataType': d.category,
        'alarmType': d.severity,
        'intervalValue': d.value,
        'severityPriorityMap': JSON.stringify(d)
      };
    })
  };

  if (sensorType.value === 'alert') {
    data.alertBasedTemplateSettingsBo = {
      'logicType': form.creationCondition,
      'numValue': form.sensorCount,
      'cooldownPeriod': form.waitTime,
      'cooldownPeriodUnit': form.waitTimeUnit,
      'startTime': form.dateRange[0] ? revertTime(form.dateRange[0]) : '',
      'endTime': form.dateRange[1] ? revertTime(form.dateRange[1]) : '',
    };
  } else {
    data.scheduledTemplateSettingsBo = {
      'intervalValue': form.hoursInterval,
      'intervalUnit': form.frequencyType,
      'dailyStartTime': form.dailyTime[0] ? revertTime(form.dailyTime[0]) : '',
      'dailyEndTime': form.dailyTime[1] ? revertTime(form.dailyTime[1]) : '',
      'activeDays': JSON.stringify(form.days)
    };
  }

  return data;
};
// 关闭对话框
const close = () => {
  emit('update:visible', false);
};

// 保存模板
const save = async () => {
  if(props.type === 'view') {
    close();
    return;
  }
  // 构建提交数据
  try {
    let res;
  let savedData;

  if (props.type === 'add' && props.modelType === 'task') {
    savedData = getTaskData();
    res = await createWorkOrder(savedData);
  } else if (props.type === 'add' && props.modelType === 'template') {
    savedData = getTemplateData();
    res = await createTemplate(savedData);
  } else {
    const data = frontendToDbFormat(form);
    savedData = {
      ...data,
      alertTags: alertTags.value,
      metricsTags: metricsTags.value,
    };
    console.log('submitData saved', savedData);

    res = await updateTemplate(savedData);
  }

  const name = props.modelType === 'template' ? 'Template' : 'Work Order';
  if (res.code === 200) {
    // 传递更多信息给父组件，包括操作类型和数据，以便父组件可以正确更新filteredLocations
    emit('save', {
      type: props.type,
      data: savedData,
      workOrderId: res.data?.workOrderId || savedData.workOrderId || savedData.workOrderBo?.workOrderId,
      zoneId: savedData.zoneId || savedData.workOrderBo?.zoneId || filterRef.value?.floorZone[1]
    });
    ElMessage.success(`${name} updated successfully!`);
  } else {
    ElMessage.error(`${name} update failed!`);
  }
  console.log(res, 'save data');
  } catch (error) {
    console.error('Error saving data:', error);
    ElMessage.error(`${name} update failed!`);
  }

  close();
};

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false;
};

const handleTaskSubmit = () => {
  showPerformanceDialog.value = false;
  // 刷新任务列表
  fetchData();
};

const convertToDateFormat = (start, end) => {
  // 能转化成时间，转化成时间格式， 否则返回空
  const startDate = new Date(start);
  const endDate = new Date(end);

  return [startDate, endDate];
}

const setTemplateData = () => {
  const data = props.curTask;

  if (!data) return;
  zoneId.value = props.zoneId;

  data.alertBasedTemplateSettingsVo = data.alertBasedTemplateSettingsVo || {};
  data.scheduledTemplateSettingsVo = data.scheduledTemplateSettingsVo || {};
  data.workOrderVo = data.workOrderVo || {};

  alertTags.value = data.templateType === 'scheduled' 

  const initialData = {
    templateId: data.templateId,
    baseWorkOrderId: data.baseWorkOrderId,
    templateType: data.templateType,
    templateName: data.workOrderVo.name,
    location: data.workOrderVo.buildingId,
    floor: data.workOrderVo.floorId,
    area: data.workOrderVo.areaId,
    timePerOrder: '1',
    preventOverload: true,
    creationCondition: data.alertBasedTemplateSettingsVo.logicType,
    sensorCount: data.alertBasedTemplateSettingsVo.numValue,
    waitTime: data.alertBasedTemplateSettingsVo.cooldownPeriod,
    waitTimeUnit: data.alertBasedTemplateSettingsVo.cooldownPeriodUnit,
    dateRange: [data.alertBasedTemplateSettingsVo.startTime, data.alertBasedTemplateSettingsVo.endTime],
    selectedAlerts: [],
    priority: 'low',
    tempHighThreshold: '',
    airQualityThreshold: '',
    waterLevelThreshold: '',
    soapLevelThreshold: '',
    energyUsageThreshold: '',
    // Scheduled Work Orders 新增字段
    assignees: data.workOrderVo.assigneeId,
    reporters: data.workOrderVo.reporterId,
    roomName: '',
    effectiveDate: [initDatePickerDate(data.workOrderVo.startTime), initDatePickerDate(data.workOrderVo.dueTime)],
    status: data.workOrderVo.status,
    workOrderType: data.workOrderVo.workOrderType,
    source: data.workOrderVo.source,
    duration: data.workOrderVo.duration,
    durationUnit: data.workOrderVo.durationUnit,
    taskExplanation: data.workOrderVo.description,
    startTime: data.workOrderVo.actualStartTime,
    endTime: data.workOrderVo.actualCompletionTime,
    dailyTime: convertToDateFormat(data.scheduledTemplateSettingsVo.dailyStartTime, data.scheduledTemplateSettingsVo.dailyEndTime),
    frequencyType: data.scheduledTemplateSettingsVo.intervalUnit,
    hoursInterval: data.scheduledTemplateSettingsVo.intervalValue,
    data: JSON.parse(data.scheduledTemplateSettingsVo.activeDays || '{}'),
    metricsName: ''
  };
  Object.assign(form, initialData);
  if (initialData.templateType === 'alert_based') {
    alertTags.value = getSensorList(sensorRef.value?.getSensors(data.templateAlertsVoList || []));
  } else {
    metricsTags.value = getSensorList(sensorRef.value?.getSensors(data.workOrderVo.metrics || []));
  }
  setTimeout(async () => {
    await filterRef.value?.init();
    filterRef.value?.setCascaderByZoneId(data.workOrderVo.zoneId.toString());
  });
};

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    if (!newVal) {
      return;
    }
    if (props.type === 'edit' || props.type === 'view') {
      setTemplateData();
    } else {
      const initialData = getFormData();
      Object.assign(form, initialData);
    }
  }
);

// 监听对话框状态变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
    if (!newVal) {
      emit('close');
    }
  }
);

// 如果是编辑模式，加载现有数据
watch(
  () => props.modelValue,
  (newVal) => {
    if (props.isEdit && newVal) {
      Object.assign(form, newVal);
      if (newVal.alertTags) {
        alertTags.value = [...newVal.alertTags];
      }
      if (newVal.metricsTags) {
        metricsTags.value = [...newVal.metricsTags];
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.not-allowd {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.8;
}

.work-order-template-dialog {
  .work-order-tabs {
    justify-content: center;
    padding-top: 16px;
    margin-bottom: 0 !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid $color-light-gray;
  }
  .dialog-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0 8px 0 0;
    .close-btn {
      color: #222;
      font-size: 18px;
      &:hover {
        background: #f5f7fa;
      }
    }
  }

  .section-label {
    color: var(--VI-text-B12, #11191e);
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    margin-bottom: 20px;
  }

  .section-title {
    color: var(--VI-text-B12, #11191e);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    display: flex;
    align-items: center;
    gap: 8px;

    .optional {
      font-weight: normal;
      font-size: 0.9rem;
      color: #909399;
    }
  }

  .subsection-title {
    color: var(--VI-text-B12, #11191e);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    margin: 24px 0 0 0;
  }

  .section-subtitle {
    font-weight: 500;
    font-size: 1rem;
    margin: 16px 0 8px 0;
  }

  .template-type-section {
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .template-types {
    display: flex;
    gap: 16px;
    margin-top: 10px;

    .template-type-card {
      display: flex;
      padding: 24px;
      flex-direction: column;
      align-items: flex-end;
      flex: 1 0 0;
      border-radius: 8px;
      border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
      background: var(--layout-bg_Panel, #fff);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: $color-blue;
        background-color: #ecf5ff;
      }

      .card-header {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        margin-bottom: 12px;
        gap: 8px;

        .icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        svg {
          width: 40px;
          height: 40px;
        }

        .title {
          overflow: hidden;
          color: var(--VI-text-B12, #11191e);
          text-overflow: ellipsis;
          font-style: normal;
          font-weight: 700;
          line-height: 22px;
        }
      }

      .card-content {
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;

          .feature-item {
            display: flex;
            align-items: center;
            overflow: hidden;
            color: var(--VI-text-B49, #71797e);
            text-overflow: ellipsis;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
            gap: 2px;

            .el-icon {
              color: #67c23a;
              margin-right: 8px;
            }
          }
        }

        .card-footer {
          padding: 8px;
          align-items: center;
          color: #606266;

          .best-for {
            font-weight: 600;
          }
        }
      }
    }
  }

  #prevent-Work-order {
    display: flex;
    width: 704px;
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 16px;
    background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
    .subsection-title {
      margin: 0;
    }
  }

  .basic-details-section,
  .alert-settings-section,
  .priority-criteria-section,
  .creation-conditions-section,
  .work-order-details-section,
  .scheduled-settings-section,
  .metrics-monitoring-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  .basic-details-section,
  .work-order-details-section {
    padding-top: 24px;
    padding-bottom: 4px;
  }

  .work-order-details-section {
    border-top: 2px solid $color-light-gray;
  }

  .priority-criteria-section {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-radius: 16px;
    border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
    background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
  }

  .creation-conditions-section {
    background-color: white;
    padding-top: 24px;
    border-top: 1px solid $color-light-gray;
  }

  .metrics-monitoring-section {
    margin-bottom: 0;
    svg {
      color: $color-gray;

      :hover {
        color: $color-blue;
      }
    }
  }

  .template-form {
    border-radius: 8px;
    padding: 16px 0;
  }

  // 表单网格布局
  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .full-width {
      grid-column: span 2;
    }
  }

  .alert_based-form {
    border-bottom: 1px solid $color-light-gray;
    background-color: white;
    padding-bottom: 6px;
    border-radius: 0;
    position: relative;

    .alert_based-form-prompt {
      position: absolute;
      bottom: 10px;
      color: $color-orange;
      font-size: 8px;
      font-style: normal;
      font-weight: 600;
      line-height: 14px;
      margin-left: 120px;
    }
  }

  .alert-warning {
    background-color: #fff6f7;
    border-left: 3px solid #f56c6c;
    padding: 10px 15px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    color: #f56c6c;
  }

  .date-range-picker {
    display: flex;
    align-items: center;

    .date-label {
      width: 80px;
      margin-right: 10px;
    }
  }

  .alert-selector,
  .metrics-selector {
    margin-bottom: 16px;

    .alert-label,
    .label {
      color: var(--VI-text-B12, #11191e);
      text-align: right;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }

    .alert-actions,
    .add-metrics-button {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }

    :deep(.el-select__wrapper) {
      min-height: 40px;
      width: 100% !important;
    }
  }

  .alert-tags,
  .metrics-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;

    .el-tag {
      display: flex;
      height: 28px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 100px;
      background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
      border-color: transparent;
      color: var(--layout-bg_focus, #09f);
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;

      :deep(svg) {
        color: $color-blue;
      }
    }

    .low,
    .info {
      background-color: rgba(0, 153, 255, 0.1);
      color: $color-blue;
      :deep(svg) {
        color: $color-blue;
      }
    }
    .high,
    .danger {
      background-color: rgba(255, 56, 76, 0.1);
      color: $color-red;
      :deep(svg) {
        color: $color-red;
      }
    }
    .middle,
    .medium,
    .warning {
      background-color: rgba(237, 182, 1, 0.1);
      color: $color-orange;
      :deep(svg) {
        color: $color-orange;
      }
    }
  }

  .priority-buttons {
    display: flex;
    margin-bottom: 16px;

    .el-button {
      margin-left: 0;
    }

    .el-button--primary {
      color: white;
      z-index: 1;
      border-radius: 4px;
      background: var(--layout-bg_focus, #09f);
      box-shadow:
        0px 10px 15px -3px rgba(0, 153, 255, 0.4),
        0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1)),
        0px 8px 10px rgba(0, 153, 255, 0.25);

      &::before {
        display: none;
      }

      & + .el-button::before {
        display: none;
      }
    }
  }

  .priority-details {
    width: 100%;
    background-color: #f7fafd;
    border-radius: 8px;
    padding: 16px;

    .priority-title {
      color: var(--VI-text-B12, #11191e);
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
    }

    .threshold-items {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .threshold-item {
        display: flex;
        flex-direction: column;
        .threshold-label {
          display: flex;
          width: 297px;
          height: 36px;
          flex-direction: column;
          justify-content: center;
          color: var(--VI-text-B12, #11191e);
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 16px;
        }

        el-select {
          flex: 1;
        }
      }
    }
  }

  .condition-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 24px 0;
    background-color: #f7fafd;
    border-radius: 8px;
  }
  .label {
    color: var(--VI-text-B12, #11191e);
    text-align: right;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }
  // Scheduled Work Order Settings 样式
  .frequency-settings {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin-top: 10px;

    .hours-interval {
      .interval-inputs {
        display: flex;
        align-items: center;
        gap: 10px;

        .interval-label {
          color: #606266;
        }
      }
    }
  }

  .time-window {
    display: flex;
    flex-direction: row;
    gap: 16px;

    .time-picker {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;

      .time-separator {
        color: #606266;
      }
    }
  }

  .days-selection {
    margin-top: 20px;

    .day-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 10px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.creation-conditions-details {
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
  background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
  .introduction {
    justify-content: space-between;
    padding: 8px 16px;
    background-color: white;

    .left {
      overflow: hidden;
      color: var(--VI-text-B12, #11191e);
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      width: 150px;
      align-items: center;
    }

    svg {
      width: 24px;
      height: 24px;
    }

    :deep(.el-select) {
      display: flex;
      max-width: 220px;
      height: 36px;
      align-items: flex-start;
      flex-shrink: 0;
      align-self: stretch;
    }
  }
}
#alert-settings-title {
  margin-top: 8px;
  margin-bottom: 24px;
}
:deep(.day-buttons-item) {
  display: flex;
  height: 36px;
  padding: 4px 12px;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
  border-radius: 4px;
  border: 1px solid $color-light-gray;
}
:deep(.day-buttons-item-selected) {
  border-color: $color-blue;
}

:deep(.el-range-editor.el-input__wrapper) {
  border-radius: 4px;
  border: 1px solid var(--VI-text-B12, #11191e);
}
:deep(.el-form-item__label) {
  display: flex;
  align-items: center;
  width: 90px;
  height: auto;
  color: var(--VI-text-B12, #11191e);
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

:deep(.el-select__wrapper) {
  min-height: 40px;
  width: 100% !important;
}

:deep(.el-input-number) {
  width: 50%;
}

#duration-node-alert,
#duration-node {
  :deep(.el-input-number.is-controls-right .el-input-number__increase),
  :deep(.el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase) {
    --el-input-number-controls-height: 36px;
    height: 32px !important;
    line-height: 36px !important;
  }
}

:deep(.el-dialog__header) {
  margin-bottom: 24px !important;
}
:deep(.el-range-editor--large .el-range-input) {
  height: 32px;
}
</style>
