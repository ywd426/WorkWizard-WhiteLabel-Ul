<template>
  <svg :class="svgClass" aria-hidden="true" style="padding-right: 4px">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
  <span style="width: 4px"></span>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  iconClass: propTypes.string.isRequired,
  className: propTypes.string.def(''),
  color: propTypes.string.def('')
});
const iconName = computed(() => {
  return `#icon-sub-menu-module`;
});
const svgClass = computed(() => {
  return `svg-icon-more`;
});
</script>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon-more {
  fill: currentColor;
  min-width: 2em;
  max-width: 2em;
  height: 100%;
}
</style>
