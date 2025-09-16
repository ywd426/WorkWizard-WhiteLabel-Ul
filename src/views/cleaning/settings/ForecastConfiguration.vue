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
        <div class="section-label">Location</div>
        <filter-panel ref="filterRef" :showSampleFilter="true" @search-event="getData" />
      </div>

      <!-- 分类信息 -->
      <div class="config-section">
        <div class="section-label">Category</div>
        <div class="form-grid" style="grid-template-columns: 1fr">
          <div class="w-full flex">
            <div class="form-item flex-1">
              <div class="item-label">Category</div>
              <el-select v-model="form.category" placeholder="Type here" class="w-full" @change="changeCategory">
                <el-option v-for="item in categoryList" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="form-item flex-1" v-if="props.pageId === 'environment'">
              <div class="item-label">Type</div>
              <el-select v-model="form.type" placeholder="Type here" class="w-full" @change="changeType">
                <el-option v-for="item in targets" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>

          <div class="form-item flex w-full forcast-target">
            <div class="item-label" style="width: 96px">Target</div>
            <div class="flex flex-col flex-1 gap-2">
              <div v-for="item in getForecast" class="w-full h-8 flex items-center justify-between">
                <div class="forcastItem">
                  <span>{{ item.label }}</span>
                  <el-checkbox v-model="item.checked" label="Enable Forecast" />
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
        <el-button type="primary" @click="saveAlerts">Save Alerts</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import { getForecastDetail, saveForecast } from '@/api/clean/settings';

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
const forecasts = ref([
  // { label: 'Water Usage (L)', checked: true },
  // { label: 'Energy Usage (kWh)', checked: true }
]);

// 表单数据
const form = reactive({
  region: '',
  state: '',
  city: '',
  buildingRoom: '',
  scheduleStatus: '',
  category: '',
  type: 'false',
  target: ''
});

const categoryList = ref([
  {
    index: 1,
    value: 'environment',
    label: 'Environment'
  },
  {
    index: 2,
    value: 'occupancy',
    label: 'Occupancy'
  },
  {
    index: 3,
    value: 'consumable',
    label: 'Consumable'
  },
  {
    index: 4,
    value: 'waste',
    label: 'Waste'
  }
]);

const targets = [
  {
    value: 'true',
    label: 'Scores'
  },
  {
    value: 'false',
    label: 'Parameters'
  }
];
let zoneId = 0;
// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

const getForecast = computed(() => {
  return forecasts.value.filter((d) => d.type === form.type);
});

const getData = async (zoneId) => {
  zoneId = Number(zoneId);
  const res = await getForecastDetail({ zoneId: zoneId, category: categoryList.value[0].index });
  const data = res.data;

  const arr = [];

  res.data.forEach((d) => {
    const item = {
      label: d.dataType,
      checked: d.openForecast
    };
    if (props.pageId === 'environment') {
      item.type = d.virtualType;
    }
    arr.push(item);
  });
  forecasts.value = arr;

  // Object.assign(form, newData)
  console.log('get data from cleaning priority configuration:', zoneId, data);
};

// 保存告警设置
const saveAlerts = async () => {
  console.log('save Alerts', form);
  const data = {
    zoneId: zoneId,
    category: categoryList.value[0].index,
    dataTypeEnableList: forecasts.value.map((d) => {
      return {
        dataType: d.label,
        enable: d.checked
      };
    })
  };
  if (props.pageId === 'environment') {
    data.virtualType = form.type;
  }
  const res = await saveForecast(data);
  console.log('saveAlerts', res);

  if (res.code === 200) {
    ElMessage.success('Forecast Settings saved successfully!');
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
      return;
    }
    console.log(props.pageId, 'props.pageId');
    categoryList.value = categoryList.value.filter((d) => d.value === props.pageId);
    form.category = categoryList.value[0]?.value;
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
</style>
