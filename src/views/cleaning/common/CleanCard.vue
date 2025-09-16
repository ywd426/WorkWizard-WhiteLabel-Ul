<template>
  <div class="trends-panel">
    <div class="panel-header">
      <div class="flex flex-row items-center gap-2">
        <slot name="header">
          <div class="flex flex-row gap-4">
            <h3>{{ header }}</h3>
            <el-tooltip v-if="!!tooltip" placement="top" effect="light">
              <template #content>
                <div class="card-header-tooltip">{{ tooltip }}</div>
              </template>
              <el-icon class="info-default-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <svg-icon v-if="icon" :icon-class="icon" @click="$emit('iconClick')"></svg-icon>
        </slot>
      </div>
      <slot name="header-actions"></slot>

      <action-menu v-if="showActionMenu" class="chart-actions" @refresh="$emit('refresh')" @export="$emit('export')" />
    </div>

    <div v-if="showSelect || (tabs && tabs.length > 0) || showLocation || showRefresh" class="action-panal justify-between items-center gap-4 pr-4">
      <div class="flex">
        <div v-if="showSelect" class="metric-selector">
          <el-select v-model="selectedMetric" size="small">
            <el-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </div>

        <div v-if="showLocation" class="metric-selector">
          <el-cascader v-model="selectedLocation" :options="cascaderOptions" placeholder="Select Location" />
        </div>

        <div class="chart-container">
          <slot name="select-actions"></slot>
        </div>

        <div v-if="tabs && tabs.length > 0" class="tabs-container" :style="{ 'margin-left': showSelect || showLocation ? '160px' : '1rem' }">
          <div class="tabs">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              class="tab"
              :class="{ active: activeTab === tab.value }"
              @click="$emit('update:activeTab', tab.value)"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>
      </div>
      <el-icon v-if="showRefresh" class="refresh" @click="$emit('refresh')"> <Refresh /></el-icon>
      <div v-if="description" class="description">{{ description }}</div>
    </div>

    <div class="chart-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import ActionMenu from '@/views/cleaning/common/ActionMenu.vue';
import { useCleanStore } from '@/store/modules/cleaning';
import { InfoFilled, Refresh } from '@element-plus/icons-vue';

const cleanStore = useCleanStore();
const props = defineProps({
  header: {
    type: String,
    default: ''
  },
  showSelect: {
    type: Boolean,
    default: true
  },
  showLocation: {
    type: Boolean,
    default: false
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  showActionMenu: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ''
  },
  pageId: {
    type: String,
    default: ''
  },
  tooltip: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  cascaders: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  },
  // 添加 tabs 属性
  tabs: {
    type: Array,
    default: () => []
  },
  // 添加 modelValue 属性用于 select 的 v-model 绑定
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 添加 activeTab 属性用于 tab 的绑定
  activeTab: {
    type: [String, Number],
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update:activeTab', 'refresh', 'export', 'iconClick']);

// 使用 defineModel 为 select 创建双向绑定
const selectedMetric = defineModel('modelValue');
const selectedLocation = defineModel('selectedLocation');

const cascaderOptions = ref(props.cascaders.length === 0 ? cleanStore.locationFilters : []);
// 监听 activeTab 的变化
watch(
  () => props.activeTab,
  (newValue) => {
    if (newValue) {
      console.log('Tab changed to:', newValue);
    }
  }
);

watch(
  () => props.cascaders,
  (newValue) => {
    cascaderOptions.value = props.cascaders;
  }, { deep: true }
);

watch(selectedLocation, (newValue) => {
  emit('update:selectedLocation', newValue);
});

watch(
  () => cleanStore.getPageFilterParams(props.pageId),
  (newFilters) => {
   console.log('Filters changed:', newFilters)
   if(newFilters.zone.length > 1) {
    
   }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.card-header-tooltip {
  max-width: 640px;
  color: var(--VI-text-B12, #11191e);
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  padding: 8px 12px;
}

.trends-panel {
  position: relative;
  background-color: white;
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .panel-header {
    display: flex;
    justify-content: space-between;
    height: 48px;
    padding: 8px 20px;
    align-items: center;
    border-radius: 8px;
    background: rgba(211, 219, 224, 0.4);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    svg {
      cursor: pointer;
      color: $color-gray;
      width: 24px;
      height: 24px;

      &:hover {
        color: $color-blue;
      }
    }
  }

  .action-panal {
    position: relative;
    height: 2.25rem;
    margin-top: 1.25rem;
    display: flex;

    // 添加 tabs 样式
    .tabs-container {
      display: flex;
      justify-content: center;
      position: absolute;
      margin-left: 1rem;
      margin-top: -8px;

      .tabs {
        display: flex;
        background-color: #f0f2f5;
        border-radius: 20px;
        padding: 4px;

        .tab {
          display: flex;
          height: 28px;
          padding: 0px 12px;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          gap: 8px;
          flex: 1 0 0;
          text-align: center;
          font-size: 12px;
          font-style: normal;
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
    }

    .chart-actions {
      position: absolute;
      top: -10px;
      right: 20px;
    }

    :deep(.el-input__wrapper) {
      border: 1px solid var(--VI-text-B12, #11191e);
    }
  }

  .chart-container {
    position: relative;
    padding: 0 20px 20px;
  }
}

.refresh {
  position: absolute;
  right: 10px;
  top: 0;
  cursor: pointer;
}

.description {
  color: var(--VI-text-B12, #11191e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}
</style>
