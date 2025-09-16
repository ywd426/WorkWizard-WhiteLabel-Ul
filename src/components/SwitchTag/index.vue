<template>
  <el-row style="width: 100%; display: flex; justify-content: center; padding-top: 12px">
    <el-radio-group v-model="moduleValue" class="tab-position" @change="changeTab()">
      <el-radio-button v-for="(item, index) in tabItems" :key="index" :label="(index + 1).toString()">
        {{ item }}
      </el-radio-button>
    </el-radio-group>
  </el-row>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
  moduleIndex: propTypes.string.def('1'),
  tabs: propTypes.arrayOf(propTypes.string).def(['Basic Info', 'Add Sensor'])
});
const moduleValue = ref(props.moduleIndex);
const tabItems = ref(props.tabs);
const emit = defineEmits(['update:moduleIndex', 'changeTab']);
const changeTab = () => {
  emit('update:moduleIndex', moduleValue.value);
  emit('changeTab');
};
watch(
  () => props.tabs,
  (newVal) => {
    tabItems.value = newVal;
  }
);
</script>
<style lang="scss" scoped>
.tab-position {
  background: var(--el-base-border-color);
  border-radius: 100px;
  height: 32px;
  padding: 2px 0;
  margin-bottom: 8px;
}
::v-deep(.el-radio-button:first-child .el-radio-button__inner) {
  border: 0px;
  border-radius: 100px;
}
::v-deep(.el-radio-button__inner) {
  border-radius: 100px;
  margin-right: 2px;
  border: 0px;
  width: 118px;
  background: initial;
  font-weight: 600;
  font-size: 12px;
  line-height: 28px;
  vertical-align: middle;
  padding: 0;
}
::v-deep(.el-radio-button:last-child .el-radio-button__inner) {
  border: 0px;
  border-radius: 100px;
}
</style>
