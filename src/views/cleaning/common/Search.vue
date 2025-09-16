<template>
  <div class="outer-div">
    <el-input v-model="searchText" :placeholder="props.placeholder" class="custom-input" @keyup.enter="toSearch"></el-input>
    <div class="inner-div" @click="toSearch">
      <div class="text">Search</div>
      <el-icon id="refresh-icon"><Refresh /></el-icon>
    </div>
  </div>
</template>
<script setup>
import { Refresh } from '@element-plus/icons-vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search reports...'
  }
});
const emit = defineEmits(['search']);
const searchText = ref('');

const toSearch = () => {
  emit('search', searchText);
};
</script>
<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.outer-div {
  position: relative;
  display: flex;
  width: 480px;
  height: 36px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  border: 1px solid var(--Styles-GradFlat-DarkFore10, $color-light-gray);
  background: linear-gradient(
      90deg,
      var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
      var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
      var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
      var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
      var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
      var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
      var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
    ),
    var(--layout-bg_Panel, #fff);
}

.inner-div {
  height: 32px;
  width: 96px;
  border: 1px solid var(--Styles-GradFlat-DarkFore10, #4c90cd);
  background: var(
    --Styles-GradFlat-DarkFore40,
    linear-gradient(
      180deg,
      var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.4)) 0%,
      var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.4)) 15%,
      var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.4)) 34%,
      var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.4)) 53%,
      var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.4)) 74%,
      var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.4)) 96.87%,
      var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.4)) 100%
    )
  );
  top: 2px;
  right: 2px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 100px;
  padding: 0 10px;
  margin-bottom: 1px;
  cursor: pointer;
}

.input {
  width: 490px;
}

:deep(.custom-input .el-input__wrapper) {
  box-shadow: 0px 1px 2px 0px var(--el-box-shadow-start-color);
  border-radius: 100px;
  padding: 0 10px;
  background: var(--el-card-primary-flat05);
}
.outer-div:hover {
  box-shadow: 0px 10px 15px -3px var(--el-box-shadow-end-color);
}
:deep(.custom-input .el-input__wrapper:hover) {
  box-shadow:
    0px 4px 6px -2px var(--el-box-shadow-start-color),
    0px 10px 15px -3px var(--el-box-shadow-end-color);
}
:deep(.custom-input .el-input__inner) {
  padding-right: 100px;
}
:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: none;
  border: 1px solid var(--el-card-primary-flat20);
}
.text {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  margin-right: 8px;
  color: white;
  padding-right: 0.5rem;
  border-right: 2px solid $color-light-gray;
}

:deep(svg path) {
  fill: white;
}

:deep(.el-input__inner) {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}
</style>
