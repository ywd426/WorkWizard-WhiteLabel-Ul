<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    width="800px"
    class="settings-dialog alert-settings-dialog no-header-dialog"
    :before-close="handleClose"
    align-center
  >
    <div class="alert-config-section">
      <div class="section-title">Add Cost Baseline</div>
      <div class="config-section">
        <div class="form-grid">
          <div class="flex gap-4 w-full">
            <div class="form-item flex-1">
              <div class="item-label">Team</div>
              <el-input class="flex-1" v-model="form.name" placeholder="Type here"></el-input>
              <!-- <el-select class="flex-1" v-model="form.name" placeholder="Type here">
                <el-option label="team 1" value="region1" />
              </el-select> -->
            </div>
            <div class="flex-1"></div>
          </div>

          <div class="flex gap-4">
            <div class="form-item flex-1">
              <div class="item-label">Position</div>
              <el-input class="flex-1" v-model="form.position" placeholder="Type here" />
              <!-- <el-select class="flex-1" v-model="form.position" placeholder="Type here">
                <el-option label="position 1" value="state1" />
              </el-select> -->
            </div>
            <div class="form-item flex-1">
              <div class="item-label">Space Type</div>
              <el-input class="flex-1" v-model="form.spaceType" placeholder="Type here" />
              <!-- <el-select class="flex-1" v-model="form.spaceType" placeholder="Type here">
                <el-option label="spaceType 1" value="city1" />
              </el-select> -->
            </div>
          </div>

          <div class="form-item full-width">
            <div class="flex gap-4 flex-1">
              <div class="item-label">Pay Rate ($/hr)</div>
              <el-input-number v-model="form.payRate" class="flex-1" :min="0" :max="1000" :step="1" controls-position="right" size="default" />
            </div>
            <div class="flex-1"></div>
          </div>
          <div class="flex gap-4 w-full">
            <div class="form-item flex-1">
              <div class="item-label">Hours/Day</div>
              <el-input-number v-model="form.time" class="flex-1" :min="0" :max="1000" :step="1" controls-position="right" size="default" />
            </div>
            <div class="form-item flex-1">
              <div class="item-label">Days/Week</div>
              <el-input-number v-model="form.date" class="flex-1" :min="0" :max="1000" :step="1" controls-position="right" size="default" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="saveAlerts">Add to Table </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { saveBaseline } from '@/api/clean/settings';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  costData: {
    type: Object,
    default: {}
  }
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);

// 表单数据
const form = reactive({
  name: '',
  position: '',
  spaceType: '',
  payRate: '',
  time: '',
  date: ''
});

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 保存告警设置
const saveAlerts = async () => {
  const res = await saveBaseline({
    id: form.id,
    team: form.name,
    position: form.position,
    payRate: form.payRate,
    workingHours: form.time,
    daysWeek: form.date
  });
  console.log('save Alerts', res);
  if (res.code === 200) {
    ElMessage.success('Cost Baseline saved successfully!');
    emit('save', form);
    handleClose();
  }
};

// 监听 modelValue 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;

    if (!newVal) return;
    const data = props.costData;
    const initData = {
      id: data.id || '',
      name: data.team || '',
      position: data.position || '',
      spaceType: '',
      payRate: data.payRate || '',
      time: data.workingHours || '',
      date: data.daysWeek || ''
    };

    Object.assign(form, initData);
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

<style>
.no-header-dialog .el-dialog__header {
  display: none;
}
</style>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.settings-dialog {
  color: var(--VI-text-B12, #11191e);
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 20px;
      padding-top: 0;
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
    margin-bottom: 20px;
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

  .config-section {
    margin-bottom: 24px;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .forcast-target {
      align-items: flex-start !important;

      .item-label {
        margin-top: 8px;
      }
    }

    .form-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      &.full-width {
        grid-column: span 2;
      }

      .item-label {
        color: var(--VI-text-B12, #11191e);
        text-align: right;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
        width: 120px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .w-full {
        width: 100%;
      }

      .forcastItem {
        display: flex;
        width: 100%;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
        border: 1px solid $color-light-gray;
        padding: 0 16px;

        span {
          font-size: 12px;
          font-weight: 400;
          line-height: 16px;
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

:deep(.el-input-number) {
  width: 100% !important;
}
</style>
