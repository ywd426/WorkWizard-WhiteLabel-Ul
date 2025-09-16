<template>
  <div class="top-right-btn main-text-subtitle">
    <div class="filter-event" @mouseover.stop="mouseover()" @mouseleave.stop="mouseleave()">
      <div class="log-event">
        <div>Create Log Template</div>
        <div><svg-icon icon-class="droplist" class-name="current-item" /></div>
      </div>
      <div v-if="showLogEvent" class="filter-menu">
        <div class="event-item" @click="addLog('operation')"><div class="sub-item">Operation Log Template</div></div>
        <div class="event-item" @click="addLog('event')"><div class="sub-item">Event Log Template</div></div>
      </div>
    </div>
  </div>
</template>
<script setup name="rightTool" lang="ts">
import sleep from '@/utils/sleep';

const emit = defineEmits(['addLog']);
const addLog = (type) => {
  emit('addLog', type);
};

const showLogEvent = ref(false);
const mouseover = () => {
  showLogEvent.value = true;
};
const mouseleave = async () => {
  await sleep(200);
  showLogEvent.value = false;
};
</script>
<style scoped>
.main-text-subtitle {
  display: flex;
  align-items: center;
  height: 32px;
}
.current-item {
  width: 16px;
  height: 16px;
  margin-left: 8px;
}
.filter-event {
  position: relative;
  width: 180px;
  height: 100%;
}
.log-event {
  background-color: var(--colors-base-primary);
  color: var(--baseBackground);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.filter-menu {
  position: absolute;
  right: 0;
  top: 32px;
  width: 180px;
  height: 82px;
  background-color: var(--baseBackground);
  border-radius: 8px;
  z-index: 10;
  padding-top: 10px;
}
.event-item {
  height: 50%;
  width: 180px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: var(--el-color-primary-light-8);
  }
}
.event-item .sub-item {
  width: 140px;
  margin: 0 auto;
}
</style>
