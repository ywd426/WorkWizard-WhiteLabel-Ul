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
      <div class="section-title">Cleaning Priority Configuration</div>
      <div class="section-desc">Set weights for cleaning priorities based on categories for a specific location.</div>

      <!-- 位置信息 -->
      <div class="config-section" style="width: 95%">
        <div class="section-label">Location</div>
        <filter-panel ref="filterRef" :showSampleFilter="true" @search-event="getData" />
      </div>

      <!-- 分类信息 -->
      <div class="config-section secondary">
        <div class="secondary-status flex gap-2">
          <div class="value">{{ form.percent }} %</div>
          <div class="item-label flex flex-col gap-2">
            <div class="header">Total Percentage</div>
            <div class="desc">
              Category Weights
              <el-tooltip content="Define the upper limit for each severity level to trigger alerts." effect="light" placement="top">
                <el-icon class="info-default-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="section-label">CategThreshold Percentory</div>
        <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 0">
          <el-form-item label="Environment" class="flex-1">
            <el-input-number v-model="form.env" :min="0" :max="60" style="width: 90px" controls-position="right" size="default" />
            <span style="margin-left: 8px">%</span>
          </el-form-item>
          <el-form-item label="Occupancy" class="flex-1">
            <el-input-number v-model="form.occupancy" :min="0" :max="60" style="width: 90px" controls-position="right" size="default" />
            <span style="margin-left: 8px">%</span>
          </el-form-item>
          <el-form-item label="Consumable" class="flex-1">
            <el-input-number v-model="form.consumable" :min="0" :max="60" style="width: 90px" controls-position="right" size="default" />
            <span style="margin-left: 8px">%</span>
          </el-form-item>
          <el-form-item label="Waste" class="flex-1">
            <el-input-number v-model="form.waste" :min="0" :max="60" style="width: 90px" controls-position="right" size="default" />
            <span style="margin-left: 8px">%</span>
          </el-form-item>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="save">Save Weights</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import { savePriority, getPriority } from '@/api/clean/settings';

const props = defineProps({
  pageId: {
    type: String,
    default: 'alert-settings'
  },
  settingType: {
    type: Object,
    default: () => ({})
  },
  visible: {
    type: Boolean,
    default: false
  }
});
const filterRef = ref(null);

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);
const zoneList = ref([]);
// 表单数据
const form = reactive({
  env: '',
  occupancy: '',
  consumable: '',
  waste: '',
  percent: 100
});
// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 保存告警设置
const save = async () => {
  const res = await savePriority({
    zoneId: form.zoneId || filterRef.value?.getZoneId(),
    environmentProportion: form.env,
    occupancyProportion: form.occupancy,
    consumableProportion: form.consumable,
    wasteProportion: form.waste
  });
  console.log('save Alerts', res);
  if (res.code === 200) {
    ElMessage.success('Cleaning Priority Settings saved successfully!');

    emit('save', form);
    handleClose();
  }
};

const getData = async (zoneId) => {
  const res = await getPriority({ zoneId: Number(zoneId) });
  const data = res.data;
  const newData = {
    zoneId: data.zoneId,
    env: data.environmentProportion,
    occupancy: data.occupancyProportion,
    consumable: data.consumableProportion,
    waste: data.wasteProportion
  };
  Object.assign(form, newData);
  console.log('get data from cleaning priority configuration:', zoneId, res);
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

  .config-section {
    margin-bottom: 24px;
  }

  .secondary {
    display: flex;
    width: 704px;
    flex-direction: column;
    gap: 8px;
    padding: 16px 24px;
    border-radius: 8px;
    border: 1px solid var(--Styles-GradFlat-DarkFore10, $color-light-gray);
    background: var(
      --Styles-GradFlat-DarkFore05,
      linear-gradient(
        90deg,
        var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
        var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
        var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
        var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
        var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
        var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
        var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
      )
    );

    .secondary-status {
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .value {
        color: $color-blue;
        font-size: 40px;
        font-style: normal;
        font-weight: 700;
        line-height: 60px;
      }

      .item-label {
        color: var(--VI-text-B12);
        font-size: 18px;
        font-style: normal;
        font-weight: 700;
        line-height: 22px;
      }

      .desc {
        color: var(--VI-text-B49);
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
        display: flex;
        gap: 4px;
        align-items: center;
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        width: 140px;
        text-align: right;
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
:deep(.el-form-item__label) {
  width: 120px;
  color: var(--VI-text-B12, #11191e);
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
