<template>
  <div class="searchPanel">
    <div class="form-div"><slot></slot></div>
    <div class="buttonPanel">
      <div class="button-container">
        <el-button v-if="search" type="primary" icon="Search" @click="handleQuery" class="ml-3">Search</el-button>
        <el-button v-if="reset" icon="Refresh" @click="resetQuery">Reset</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  search: propTypes.bool.def(true),
  reset: propTypes.bool.def(true)
});
const emits = defineEmits(['reset', 'search']);
// 搜索
const handleQuery = () => {
  emits('search');
};
// 重置
function resetQuery() {
  emits('reset');
}
</script>

<style lang="scss" scoped>
.searchPanel {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 9;
  background: var(--baseBackground);
  box-shadow: 0px 20px 20px 0px var(--el-box-shadow-search-color);
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
}

.form-div {
  width: 100%;
  flex: 1;
  margin-bottom: 12px;
}

.buttonPanel {
  width: 120px;
  display: flex;
  justify-content: flex-end;
}


.button-container {
  display: flex;
  gap: 8px;
}

.buttonPanel .el-button {
  width: auto;
  width: 96px;
  height: 32px;
  border-radius: 4px;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .searchPanel {
    flex-direction: row;
    align-items: flex-start;
  }

  .button-container {
    flex-direction: column;
  }
  
  .form-div {
    margin-bottom: 0;
    margin-right: 16px;
  }
}

@media (max-width: 768px) {
  .buttonPanel {
    width: 100%;
  }
}
</style>
