<template>
  <div class="notification-schedule-container">
    <div class="notification-schedule-content">
      <h3 class="schedule-title">Notification Schedule Details</h3>

      <!-- 工作时间 -->
      <div class="schedule-row">
        <div class="schedule-label">Working Hours</div>
        <div class="schedule-input">
          <el-time-picker
            v-model="scheduleData.workingHours"
            is-range
            arrow-control
            format="HH:mm"
            range-separator="To"
            start-placeholder="Start time"
            end-placeholder="End time"
          />
        </div>
      </div>

      <!-- 安静时间 -->
      <div class="schedule-row">
        <div class="schedule-label">Quiet Hours</div>
        <div class="schedule-input">
          <el-time-picker
            v-model="scheduleData.quietHours"
            is-range
            arrow-control
            format="HH:mm"
            range-separator="To"
            start-placeholder="Start time"
            end-placeholder="End time"
          />
        </div>
      </div>

      <!-- 通知日期 -->
      <div class="schedule-row">
        <div class="schedule-label">Notification Days</div>
        <div class="schedule-input days-selection">
          <el-checkbox v-model="scheduleData.days.mon" label="Mon" border size="middle" />
          <el-checkbox v-model="scheduleData.days.tue" label="Tue" border size="middle" />
          <el-checkbox v-model="scheduleData.days.wed" label="Wed" border size="middle" />
          <el-checkbox v-model="scheduleData.days.thu" label="Thu" border size="middle" />
          <el-checkbox v-model="scheduleData.days.fri" label="Fri" border size="middle" />
          <el-checkbox v-model="scheduleData.days.sat" label="Sat" border size="middle" />
          <el-checkbox v-model="scheduleData.days.sun" label="Sun" border size="middle" />
        </div>
      </div>

      <!-- 汇总类似通知 -->
      <div class="schedule-row">
        <div class="schedule-label-with-switch">
          <el-switch v-model="scheduleData.bundleSimilarNotifications" />
          <span>Bundle Similar Notifications</span>
        </div>
      </div>

      <!-- 汇总间隔: 分钟为单位 -->
      <div class="schedule-row" v-if="scheduleData.bundleSimilarNotifications">
        <div class="schedule-label">Summary Interval</div>
        <div class="schedule-input">
          <el-select
            v-model="scheduleData.summaryInterval"
            placeholder="Every 15 mins / Every 30 mins / Hourly / Every 2 hrs / Every 4 hrs / Daliy / Twice Daliy"
            class="summary-interval-select"
          >
            <el-option label="Every 15 mins" value="15" />
            <el-option label="Every 30 mins" value="30" />
            <el-option label="Hourly" value="60" />
            <el-option label="Every 2 hrs" value="120" />
            <el-option label="Every 4 hrs" value="240" />
            <el-option label="Daily" value="1440" />
            <el-option label="Twice Daily" value="2880" />
          </el-select>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="action-buttons">
        <el-button @click="previousStep">Previous Step</el-button>
        <el-button type="primary" @click="nextStep">Next Step</el-button>
        <el-button @click="resetToDefault">Reset to Default</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { initTimePickerDate, revertTime } from '@/utils/clean';

// 定义属性
const props = defineProps({
  // 接收父组件传递的数据
  modelValue: {
    type: Object,
    required: true
  },
  initData: {
    type: Object,
    default: () => ({})
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'previous-step', 'next-step', 'reset']);
let orgData = {};
// 本地响应式数据，用于组件内部状态管理
const scheduleData = ref({
  workingHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 17, 0)],
  quietHours: [new Date(2000, 0, 1, 22, 0), new Date(2000, 0, 1, 6, 0)],
  days: {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false
  },
  bundleSimilarNotifications: true,
  summaryInterval: '15'
});

// 监听父组件传递的数据变化
// watch(
//   () => props.modelValue,
//   (newValue) => {
//     if (newValue) {
//       // 将父组件的数据同步到本地
//       Object.assign(scheduleData.value, newValue);
//     }
//   },
//   { deep: true, immediate: true }
// );

const getData = () => {
  const data = scheduleData.value;
  const result = {
    'id': data.id,
    'settingId': data.settingId,
    'workStartTime': revertTime(data.workingHours[0]),
    'workEndTime': revertTime(data.workingHours[1]),
    'restStartTime': revertTime(data.quietHours[0]),
    'restEndTime': revertTime(data.quietHours[1]),
    'weekdays': JSON.stringify(data.days),
    'batchNotification': data.bundleSimilarNotifications,
    'batchInterval': data.summaryInterval
  };
  console.log(result, 'getData');

  return result;
};

watch(
  () => props.initData,
  (newValue) => {
    if (newValue) {
      // 将父组件的数据同步到本地
      // Object.assign(scheduleData, newValue);
      console.log(props.initData);
      const data = props.initData;
      if (Object.keys(data).length == 0) return;
      orgData = {
        id: data.id,
        settingId: data.settingId,
        workingHours: [initTimePickerDate(data.workStartTime), initTimePickerDate(data.workEndTime)],
        quietHours: [initTimePickerDate(data.restStartTime), initTimePickerDate(data.restEndTime)],
        days: JSON.parse(data.weekdays),
        bundleSimilarNotifications: data.batchNotification,
        summaryInterval: data.batchInterval
      };
      scheduleData.value = JSON.parse(JSON.stringify(orgData));
      console.log('initData', scheduleData.value);
    }
  },
  { deep: true, immediate: true }
);

// 监听本地数据变化，同步到父组件
watch(
  scheduleData,
  (newValue) => {
    // 将本地数据同步到父组件
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
);

onMounted(() => {
  // 获取数据
  console.log('获取数据', props.initData);
});

// 上一步
const previousStep = () => {
  emit('previous-step');
};

// 下一步
const nextStep = () => {
  emit('next-step');
};

// 重置为默认设置
const resetToDefault = () => {
  ElMessageBox.confirm('Are you sure you want to reset schedule settings to default?', 'Warning', {
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    type: 'warning'
  })
    .then(() => {
      // 重置逻辑
      scheduleData.value = JSON.parse(JSON.stringify(orgData));
      emit('reset');
      ElMessage.success('Schedule settings reset to default');
    })
    .catch(() => {
      ElMessage.info('Reset cancelled');
    });
};

defineExpose({
  getData
});
</script>

<style lang="scss" scoped>
.notification-schedule-container {
  padding: 16px;
  background-color: white;
}

.notification-schedule-content {
  background-color: white;
  border-radius: 4px;
  padding: 16px;
  padding-left: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.schedule-title {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--VI-text-B12);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: -0.144px;
}

.schedule-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  max-width: 718px;
  gap: 24px;
}

.schedule-label {
  width: 150px;
  text-align: right;
  overflow: hidden;
  color: var(--VI-text-B12);
  text-overflow: ellipsis;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.schedule-label-with-switch {
  display: flex;
  align-items: center;
  margin-left: 20px;

  span {
    margin-left: 10px;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
}

.schedule-input {
  flex: 1;
  display: flex;
  align-items: center;
}

.time-picker {
  width: 120px;
}

.time-separator {
  margin: 0 10px;
  color: #909399;
}

.end-time-option {
  width: 200px;
}

.days-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-interval-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

:deep(.el-select__wrapper) {
  width: 100% !important;
}
</style>
