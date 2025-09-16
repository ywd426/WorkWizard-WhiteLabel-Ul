<template>
  <div class="top-right-btn" :style="style">
    <div class="search-container">
      <div v-if="search" class="outer-div">
        <el-input v-model="searchText" :placeholder="props.placeholder" class="custom-input" @keyup.enter="toSearch"></el-input>
        <div class="inner-div" @click="toSearch">
          <span class="text">Search</span>
          <svg-icon icon-class="search" class="icon" />
        </div>
      </div>
      <div v-if="showExpand" class="expand-div" :class="isShowSearch ? 'expand-normal' : 'expand-active'" @click="toggleSearch">
        <div class="expand-content">
          <span class="text">Filter</span>
          <span class="text">|</span>
          <svg-icon :icon-class="isShowSearch ? 'arrow-up' : 'arrow-down'" class="icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
  showSearch: propTypes.bool.def(true),
  search: propTypes.bool.def(true),
  gutter: propTypes.number.def(10),
  placeholder: propTypes.string.def(''),
  showExpand: propTypes.bool.def(true)
});
const isShowSearch = ref(false);
const isDownIcon = ref(true);
const searchText = ref('');
const emits = defineEmits(['update:showSearch', 'queryTable']);

const style = computed(() => {
  const ret: any = {};
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`;
  }
  return ret;
});
const toSearch = () => {
  emits('queryTable', searchText.value);
};
// 搜索
const toggleSearch = () => {
  isShowSearch.value = !isShowSearch.value;
  emits('update:showSearch', isShowSearch.value);
};
watch(
  () => props.showSearch,
  (newVal) => {
    isShowSearch.value = newVal;
  }
);
defineExpose({
  searchText
});
</script>

<style lang="scss" scoped>

@media (min-width: 768px) {
  .custom-input {
    width: 590px;
  }

  .outer-div {
    margin-right: 30px;
  }

  .expand-div {
    margin-right: 20px;

  }
}

.input {
  width: 490px;
}
::v-deep(.custom-input .el-input__wrapper) {
  box-shadow: 0px 1px 2px 0px var(--el-box-shadow-start-color);
  border-radius: 100px;
  padding: 0 10px;
  background: var(--el-card-primary-flat05);
}
.outer-div:hover {
  box-shadow: 0px 10px 15px -3px var(--el-box-shadow-end-color);
}
::v-deep(.custom-input .el-input__wrapper:hover) {
  box-shadow:
    0px 4px 6px -2px var(--el-box-shadow-start-color),
    0px 10px 15px -3px var(--el-box-shadow-end-color);
}
::v-deep(.custom-input .el-input__inner) {
  padding-right: 100px;
}
::v-deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: none;
  border: 1px solid var(--el-card-primary-flat20);
}
.text {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  margin-right: 8px;
}
.icon {
  width: 16px;
  height: 16px;
}

.expand-svg {
  cursor: pointer;
  margin-right: 20px;
}
.expand-normal {
  background: var(--el-box-shadow-end-color);
  color: var(--el-text-color-b12);
}
.expand-active {
  border: 1px solid var(--el-text-color-b49);
  color: var(--el-text-color-b49);
}

.top-right-btn {
  margin-bottom: 8px;
}

.search-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
}

.outer-div {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 200px;
  border-radius: 100px;
}

.inner-div {
  height: 32px;
  width: 96px;
  background-color: var(--baseBackground);
  top: 2px;
  right: 2px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 100px;
  padding: 0 10px;
  cursor: pointer;
}

.custom-input {
  height: 36px;
  width: 100%;
  min-width: 200px;
}

.expand-div {
  cursor: pointer;
  width: 96px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 4px;
  padding: 0 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .expand-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
