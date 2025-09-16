<template>
  <div class="top-left-btn date-range-container">
    <div class="date-picker-wrapper">
      <template v-if="!isMobile">
        <el-date-picker
          ref="datePickerRef"
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          :clearable="clearable"
          class="responsive-date-picker"
          :disabled-date="disabledDate"
          @change="dateRangeClick"
        ></el-date-picker>
      </template>
      <template v-else>
        <el-date-picker
          v-model="dateRange[0]"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="Start Date"
          :clearable="clearable"
          class="mobile-date-picker"
          @change="handleStartDateChange"
        ></el-date-picker>
        <span class="separator">-</span>
        <el-date-picker
          v-model="dateRange[1]"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="End Date"
          :clearable="clearable"
          class="mobile-date-picker"
          :disabled-date="disabledEndDate"
          @change="handleEndDateChange"
        ></el-date-picker>
      </template>
    </div>
    <el-tabs v-model="activeName" type="card" class="responsive-tabs" @tab-click="handleClick">
      <el-tab-pane label="Today" name="0"></el-tab-pane>
      <el-tab-pane label="Yesterday" name="1"></el-tab-pane>
      <el-tab-pane label="This Week" name="2"></el-tab-pane>
      <el-tab-pane label="This Month" name="3"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import * as useUtils from '@/utils/index';
import type { TabsPaneContext } from 'element-plus';
const activeName = ref('-1');
const datePickerRef = ref();
type dataRangeType = [DateModelType, DateModelType];
const props = defineProps<{
  dateRange: dataRangeType; // 接收父组件传递的 dateRange
  activeIndex?: string;
  limit?: boolean;
  clearable?: boolean;
}>();
const isMobile = computed(() => {
  return window.innerWidth <= 768;
});
const dateRange = ref<dataRangeType>([...props.dateRange]);
const handleClick = async (tab: TabsPaneContext, event: Event) => {
  if (!dateRange.value) {
    dateRange.value = ['', ''];
  }
  const newDateRange = useUtils.getDateRange(tab.paneName);
  if (newDateRange.length > 1) {
    dateRange.value[0] = newDateRange[0] + ' 00:00:00';
    dateRange.value[1] = newDateRange[1] + ' 23:59:59';
  }
  await emit('update:dateRange', dateRange.value);
  emit('refresh');
};
const dateRangeClick = async () => {
  if (!dateRange.value) {
    dateRange.value = ['', ''];
  } else {
    if (props.limit && dateRange.value[0] && dateRange.value[1]) {
      const startDate = new Date(dateRange.value[0]);
      const endDate = new Date(dateRange.value[1]);
      const oneMonthLater = new Date(startDate);
      oneMonthLater.setMonth(startDate.getMonth() + 1);

      if (endDate.getTime() > oneMonthLater.getTime()) {
        ElMessage.warning('The date range cannot exceed one month');
        dateRange.value = [dateRange.value[0], ''];
        return;
      }
    }

    dateRange.value[0] = dateRange.value[0] + ' 00:00:00';
    dateRange.value[1] = dateRange.value[1] + ' 23:59:59';
  }

  activeName.value = '-1';
  await emit('update:dateRange', dateRange.value);
  emit('refresh');
};
const disabledDate = (time: Date) => {
  if (!dateRange.value || !dateRange.value[0] || !props.limit) {
    return false;
  }
  const startDate = new Date(dateRange.value[0]);
  const oneMonthLater = new Date(startDate);
  oneMonthLater.setMonth(startDate.getMonth() + 1);

  const oneMonthBefore = new Date(startDate);
  oneMonthBefore.setMonth(startDate.getMonth() - 1);

  return time.getTime() > oneMonthLater.getTime() || time.getTime() < oneMonthBefore.getTime();
};
const handleStartDateChange = (val: string) => {
  if (val && dateRange.value[1]) {
    dateRangeClick();
  }
};

const handleEndDateChange = (val: string) => {
  if (dateRange.value[0] && val) {
    dateRangeClick();
  }
};

const disabledEndDate = (time: Date) => {
  if (!dateRange.value[0] || !props.limit) return false;

  const startDate = new Date(dateRange.value[0]);
  const oneMonthLater = new Date(startDate);
  oneMonthLater.setMonth(startDate.getMonth() + 1);

  return time.getTime() > oneMonthLater.getTime() || time.getTime() < startDate.getTime();
};
const emit = defineEmits(['update:dateRange', 'refresh']);
onMounted(async () => {
  if (props.activeIndex) {
    activeName.value = props.activeIndex;
    // 在生产环境中增加额外延迟，确保DOM完全渲染
    const newDateRange = useUtils.getDateRange(props.activeIndex);
    if (newDateRange.length > 1) {
      // 静默设置日期值，不触发change事件
      dateRange.value = [newDateRange[0] + ' 00:00:00', newDateRange[1] + ' 23:59:59'];
    }
    emit('update:dateRange', dateRange.value);
  }
});
watch(
  () => props.dateRange,
  (newValue) => {
    dateRange.value = [...newValue];
  }
);

watch(
  () => props.activeIndex,
  (newValue) => {
    if (!props.limit) return;
    if (newValue && dateRange.value[0] === '' && dateRange.value[1] === '') {
      activeName.value = newValue;
      const newDateRange = useUtils.getDateRange(newValue);
      if (newDateRange.length > 1) {
        dateRange.value[0] = newDateRange[0];
        dateRange.value[1] = newDateRange[1];
      }
    }
  }
);

const isTodayInRange = () => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(dateRange.value[0]);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateRange.value[1]);

  return today >= startDate && today <= endDate;
};

defineExpose({
  activeName,
  isTodayInRange
});
</script>
<style lang="scss" scoped>
::v-deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
}
.demo-tabs .el-tabs__content {
  padding: 32px;
  color: var(--el-text-color-regular);
  font-size: 32px;
  font-weight: 600;
}
::v-deep(.el-tabs__item.is-active) {
  background: var(--colors-base-primary) !important;
  color: var(--baseBackground) !important;
}
.el-tabs__content {
  display: none;
}
.date-range-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.date-picker-wrapper {
  min-width: 280px;
  flex: 1;
}

.responsive-date-picker {
  width: 100%;
  height: 40px;
}

.responsive-tabs {
  flex: 1;
  min-width: 200px;

  ::v-deep(.el-tabs__header) {
    margin: 0;
  }

  ::v-deep(.el-tabs__item) {
    padding: 0 10px;
    font-size: 12px;
    height: 36px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
}

:deep(.el-input__wrapper, .el-input__inner) {
  max-width: 100%;
}
@media (max-width: 768px) {
  .date-range-container {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .date-picker-wrapper {
    width: 100%;
  }

  .responsive-tabs {
    width: 100%;

    ::v-deep(.el-tabs__nav) {
      display: flex;
      width: 100%;
    }

    ::v-deep(.el-tabs__item) {
      flex: 1;
      text-align: center;
    }
  }
  .date-picker-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
  }
}

.mobile-date-picker {
  width: calc(50% - 15px);
  margin-right: 5px;
}

.separator {
  display: inline-block;
  width: 10px;
  text-align: center;
}
</style>
