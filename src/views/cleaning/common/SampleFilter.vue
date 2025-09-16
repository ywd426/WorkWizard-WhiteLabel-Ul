<template>
  <div class="location-cascader">
    <el-cascader
      v-model="combinedLocation"
      :options="combinedLocationOptions"
      :props="{ checkStrictly: props.showFloor ? false : true }"
      clearable
      filterable
      :placeholder="props.placeholder"
      @change="handleCombinedLocationChange"
      popper-class="responsive-cascader"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineExpose } from 'vue';

interface LocationOption {
  value: string;
  label: string;
  level: number;
  children?: LocationOption[];
}

const props = defineProps({
  options: {
    type: Array as () => LocationOption[],
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Country/State/City/Building/Floor/Zone'
  },
  width: {
    type: String,
    default: '100%'
  },
  showFloor: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 响应式数据
const combinedLocation = ref([]);
const combinedLocationOptions = ref([]);

// 监听props变化
watch(
  () => props.options,
  (newOptions) => {
    combinedLocationOptions.value = newOptions;
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    combinedLocation.value = newValue;
  },
  { immediate: true }
);

// 处理级联选择器变化
const handleCombinedLocationChange = (value) => {
  combinedLocation.value = value;
  emit('update:modelValue', value);
  emit('change', value);
};

let levelNameMap = {
    1: 'region',
    2: 'state',
    3: 'city',
    4: 'buildingId'
} 

if (props.showFloor) {
  levelNameMap = {
    1: 'buildingId',
    2: 'floorId'
  }
}

// 获取最后一层选择的数据
const getLastLevelSelection = () => {
  if (!combinedLocation.value || combinedLocation.value.length === 0) {
    return null;
  }

  // 递归查找最后一层的完整数据
  const findLastLevelData = (options: LocationOption[], path: string[], index: number = 0): LocationOption | null => {
    if (index >= path.length) {
      return null;
    }

    const currentValue = path[index];
    const currentOption = options.find(option => option.value === currentValue);
    
    if (!currentOption) {
      return null;
    }

    // 如果是最后一个路径元素，返回当前选项
    if (index === path.length - 1) {
      currentOption.levelName = levelNameMap[currentOption.level];
      return currentOption;
    }

    // 如果还有子路径，继续递归查找
    if (currentOption.children && currentOption.children.length > 0) {
      return findLastLevelData(currentOption.children, path, index + 1);
    }

    currentOption.levelName = levelNameMap[currentOption.level];

    // 如果没有子节点但还有路径，返回当前选项
    return currentOption;
  };

  return findLastLevelData(combinedLocationOptions.value, combinedLocation.value);
};

// 获取选择的路径数组
const getSelectedPath = () => {
  return combinedLocation.value;
};

// 清空选择
const clearSelection = () => {
  combinedLocation.value = [];
  emit('update:modelValue', []);
  emit('change', []);
};

// 清空级联选择器内容的方法
const clearCascaderContent = () => {
  // 清空所有级联选择器相关的响应式变量
  combinedLocation.value = [];
//   combinedLocationOptions.value = [];
  
  emit('update:modelValue', []);
  emit('change', []);
  
  console.log('Cascader content cleared');
};

// 获取Zone ID的方法
const getZoneId = () => {
  const lastLevelData = getLastLevelSelection();
  if (lastLevelData && lastLevelData.level === 4) {
    // 如果最后一层是建筑级别，返回建筑ID
    return lastLevelData.value;
  }
  
  // 如果选择了更高级别，尝试从路径中获取最深层的ID
  if (combinedLocation.value && combinedLocation.value.length > 0) {
    return combinedLocation.value[combinedLocation.value.length - 1];
  }
  
  return null;
};

// 暴露方法给父组件
defineExpose({
  getLastLevelSelection,
  getSelectedPath,
  clearSelection,
  clearCascaderContent,
  getZoneId
});
</script>

<style scoped>
.location-cascader {
  width: v-bind('width');
}

:deep(.responsive-cascader) {
  max-width: 600px;
}

:deep(.el-cascader) {
  width: 100%;
}
</style>