<template>
  <el-dialog
    v-model="dialogVisible"
    title="Opening Hours Configuration"
    width="800px"
    class="settings-dialog opening-hours-dialog"
    :before-close="handleClose"
  >
    <div class="settings-description">
      Configure the opening hours for each location. This will affect the scheduling and priority of cleaning tasks.
    </div>

    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="Location">
        <el-select v-model="form.location" placeholder="Select location" class="full-width">
          <el-option label="Building A" value="building_a"></el-option>
          <el-option label="Building B" value="building_b"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Floor">
        <el-select v-model="form.floor" placeholder="Select floor" class="full-width">
          <el-option label="Floor 1" value="floor_1"></el-option>
          <el-option label="Floor 2" value="floor_2"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Sub-location">
        <el-select v-model="form.subLocation" placeholder="Select sub-location" class="full-width">
          <el-option label="Room 101" value="room_101"></el-option>
          <el-option label="Room 102" value="room_102"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div class="priority-section">
      <div class="section-header">
        <div class="section-title">100 <span class="section-subtitle">Total Points</span></div>
        <div class="section-description">Allocate points to each time period based on priority. Higher points indicate higher priority.</div>
      </div>

      <div class="time-periods">
        <div class="time-period-row">
          <div class="time-period-label">Morning (6:00 AM - 12:00 PM)</div>
          <div class="time-period-slider">
            <el-slider v-model="form.morningPoints" :max="100" :step="5"></el-slider>
          </div>
          <div class="time-period-value">{{ form.morningPoints }}</div>
        </div>

        <div class="time-period-row">
          <div class="time-period-label">Afternoon (12:00 PM - 6:00 PM)</div>
          <div class="time-period-slider">
            <el-slider v-model="form.afternoonPoints" :max="100" :step="5"></el-slider>
          </div>
          <div class="time-period-value">{{ form.afternoonPoints }}</div>
        </div>

        <div class="time-period-row">
          <div class="time-period-label">Evening (6:00 PM - 12:00 AM)</div>
          <div class="time-period-slider">
            <el-slider v-model="form.eveningPoints" :max="100" :step="5"></el-slider>
          </div>
          <div class="time-period-value">{{ form.eveningPoints }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveSettings">Save Settings</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialogVisible = ref(props.modelValue);

// 表单数据
const form = reactive({
  location: '',
  floor: '',
  subLocation: '',
  morningPoints: 30,
  afternoonPoints: 40,
  eveningPoints: 30
});

// 计算总分
const totalPoints = computed(() => {
  return form.morningPoints + form.afternoonPoints + form.eveningPoints;
});

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  emit('update:modelValue', false);
};

// 保存设置
const saveSettings = () => {
  // 验证总分是否为100
  if (totalPoints.value !== 100) {
    // 可以添加错误提示
    return;
  }

  emit('save', form);
  handleClose();
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听 dialogVisible 变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/settings-dialog.scss';

.opening-hours-dialog {
  .settings-description {
    margin-bottom: 20px;
    color: $color-text-secondary;
    font-size: 14px;
    line-height: 1.5;
  }

  .full-width {
    width: 100%;
  }

  .priority-section {
    margin-top: 24px;
    border: 1px solid $color-border;
    border-radius: 8px;
    overflow: hidden;

    .section-header {
      padding: 16px;
      background-color: $color-bg-light;
      border-bottom: 1px solid $color-border;

      .section-title {
        font-size: 24px;
        font-weight: 700;
        color: $color-primary;
        margin-bottom: 4px;

        .section-subtitle {
          font-size: 14px;
          font-weight: 400;
          color: $color-text-secondary;
        }
      }

      .section-description {
        font-size: 14px;
        color: $color-text-secondary;
      }
    }

    .time-periods {
      padding: 16px;

      .time-period-row {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .time-period-label {
          width: 200px;
          font-weight: 500;
        }

        .time-period-slider {
          flex: 1;
        }

        .time-period-value {
          width: 50px;
          text-align: right;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
