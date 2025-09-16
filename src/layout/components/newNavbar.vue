<template>
  <div class="navbar">
    <hamburger
      v-if="device === 'mobile'"
      id="hamburger-container"
      style="width: 1rem; height: 2rem; padding: 8px 0rem 0 0; margin-left: 20px; margin-right: -12px; z-index: 1"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />
    <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />
  </div>
</template>

<script setup lang="ts">
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const device = computed(() => useAppStore().device);
const toggleSideBar = () => {
  appStore.toggleSideBar(false);
};
</script>

<style lang="scss" scoped>
:deep(.el-select .el-input__wrapper) {
  height: 30px;
}

:deep(.el-badge__content.is-fixed) {
  top: 12px;
}

.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.navbar {
  display: flex;
  height: 36px;
  overflow: hidden;
  position: relative;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    padding: 18px 1.5rem 1.5rem 0;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
    font-size: 12px;
    font-weight: 600;
    line-height: 36px;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
}
</style>
