<template>
  <div class="robot-filter">
    <el-row :gutter="10">
      <RightSearchbar 
        ref="searchbarRef" 
        v-model:showSearch="showSearch" 
        :placeholder="placeholderText" 
        @query-table="handleQuery"
      />
    </el-row>
    
    <transition 
      :enter-active-class="proxy?.animate.searchAnimate.enter" 
      :leave-active-class="proxy?.animate.searchAnimate.leave"
    >
      <div v-show="showSearch" class="query-parent">
        <QueryForm @search="handleQuery" @reset="resetQuery">
          <el-form 
            ref="queryFormRef" 
            :model="queryParams" 
            :inline="true" 
            :label-width="isMobileDevice() ? 'auto' : '160px'" 
            size="default"
          >
            <el-form-item label="Locations" prop="locationId">
              <sample-filter ref="filterPanelRef" :options="locationList" />
            </el-form-item>
            <el-form-item label="Robot Type" prop="robotType">
              <el-select 
                v-model="queryParams.robotType" 
                clearable 
                filterable 
                placeholder="Please Select Robot type"
              >
                <el-option 
                  v-for="item in robotTypeList" 
                  :key="item" 
                  :label="item" 
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Robot Name" prop="robotName">
              <el-select 
                v-model="queryParams.robotName" 
                clearable 
                filterable 
                placeholder="Please Select Robot name"
              >
                <el-option 
                  v-for="item in robotNameList" 
                  :key="item" 
                  :label="item" 
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Robot SN" prop="robotSn">
              <el-select 
                v-model="queryParams.robotSn" 
                clearable 
                filterable 
                placeholder="Please Select Robot SN"
              >
                <el-option 
                  v-for="item in robotSNList" 
                  :key="item" 
                  :label="item" 
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <!-- 额外的筛选项插槽 -->
            <slot name="extra-filters"></slot>
          </el-form>
        </QueryForm>
      </div>
    </transition>
    
    <!-- 筛选标签区域 -->
    <div v-if="!showSearch && hasActiveFilters" class="filter-tags-container">
      <div class="filter-tags">
        <el-tag
          v-if="selectedLocationNames.length > 0"
          closable
          type="primary"
          @close="clearLocationFilter"
          class="filter-tag"
        >
          Locations: {{ selectedLocationNames.join(', ') }}
        </el-tag>
        <el-tag
          v-if="queryParams.robotType"
          closable
          type="primary"
          @close="clearRobotTypeFilter"
          class="filter-tag"
        >
          Robot Type: {{ queryParams.robotType }}
        </el-tag>
        <el-tag
          v-if="queryParams.robotName"
          closable
          type="primary"
          @close="clearRobotNameFilter"
          class="filter-tag"
        >
          Robot Name: {{ queryParams.robotName }}
        </el-tag>
        <el-tag
          v-if="queryParams.robotSn"
          closable
          type="primary"
          @close="clearRobotSnFilter"
          class="filter-tag"
        >
          Robot SN: {{ queryParams.robotSn }}
        </el-tag>
        <!-- 额外的筛选标签插槽 -->
        <slot name="extra-filter-tags"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { isMobileDevice } from '@/utils';
import SampleFilter from '@/views/cleaning/common/SampleFilter';

interface Props {
  placeholderText?: string;
  queryParams: any;
  locationList?: any[];
  robotTypeList?: string[];
  robotNameList?: string[];
  robotSNList?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  placeholderText: 'Type here',
  locationList: () => [],
  robotTypeList: () => [],
  robotNameList: () => [],
  robotSNList: () => []
});

const emit = defineEmits(['query', 'reset']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const showSearch = ref(false);
const queryFormRef = ref<ElFormInstance>();
const searchbarRef = ref(null);
const filterPanelRef = ref(null);

// 计算选中的位置名称
const selectedLocationNames = computed(() => {
  if (!filterPanelRef.value) return [];
  const selectedPath = filterPanelRef.value.getSelectedPath();
  if (!selectedPath || selectedPath.length === 0) return [];
  
  const lastLevelData = filterPanelRef.value.getLastLevelSelection();
  if (lastLevelData && lastLevelData.label) {
    return [lastLevelData.label];
  }
  
  return [];
});

// 判断是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return selectedLocationNames.value.length > 0 ||
         props.queryParams.robotType ||
         props.queryParams.robotName ||
         props.queryParams.robotSn;
});

// 处理查询
const handleQuery = () => {
  showSearch.value = false;
  emit('query');
};

// 处理重置
const resetQuery = () => {
  emit('reset');
};

// 清除位置筛选
const clearLocationFilter = () => {
  filterPanelRef.value?.clearCascaderContent();
  emit('query');
};

// 清除机器人类型筛选
const clearRobotTypeFilter = () => {
  props.queryParams.robotType = '';
  emit('query');
};

// 清除机器人名称筛选
const clearRobotNameFilter = () => {
  props.queryParams.robotName = '';
  emit('query');
};

// 清除机器人SN筛选
const clearRobotSnFilter = () => {
  props.queryParams.robotSn = '';
  emit('query');
};

// 暴露方法和数据给父组件
defineExpose({
  showSearch,
  queryFormRef,
  searchbarRef,
  filterPanelRef,
  handleQuery,
  resetQuery,
  clearLocationFilter,
  clearRobotTypeFilter,
  clearRobotNameFilter,
  clearRobotSnFilter
});
</script>

<style scoped>
.robot-filter {
  width: 100%;
}

.query-parent {
  margin-bottom: 16px;
}

.filter-tags-container {
  margin-bottom: 16px;
  padding: 12px;
  padding-left: 18px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.el-tag.el-tag--primary {
  --el-tag-text-color: #0099ff !important;
}

.el-tag {
  color: #0099ff !important;
}
</style>