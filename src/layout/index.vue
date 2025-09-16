<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <div class="header-node">
      <svg-icon id="logon-icon" icon-class="logo" />
      <div class="header-node-right">
        <newIndex ref="navbarRef" @set-layout="setLayout" @set-notification="setNotification"  @set-notification-feed="setNotificationFeed" />
      </div>
    </div>
    <div class="main-container-node">
      <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
      <!-- <side-bar v-if="!sidebar.hide" class="sidebar-container" /> -->
      <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container flex flex-col">
        <div :class="{ 'fixed-header': fixedHeader }">
          <navbar />
          <tags-view v-if="needTagsView" />
        </div>
        <app-main />
        <settings ref="settingRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/Sidebar/index.vue';
import { AppMain, Account, Navbar, Settings, TagsView,newIndex } from './components';
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';
import { initWebSocket } from '@/utils/websocket';
import { initSSE } from '@/utils/sse';

const route = useRoute();
const settingsStore = useSettingsStore();
const theme = computed(() => settingsStore.theme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView && !route.meta.goBack);
const fixedHeader = computed(() => settingsStore.fixedHeader);
const router = useRouter();
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}));

const { width } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile') {
    useAppStore().closeSideBar({ withoutAnimation: false });
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile');
    useAppStore().closeSideBar({ withoutAnimation: true });
  } else {
    useAppStore().toggleDevice('desktop');
  }
});

const navbarRef = ref<InstanceType<typeof Account>>();
const settingRef = ref<InstanceType<typeof Settings>>();

onMounted(() => {
  nextTick(() => {
    navbarRef.value?.initTenantList();
  });
});

onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + '/resource/websocket');
});

onMounted(() => {
  // initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
  
  const newURL = `${import.meta.env.VITE_NOTIFICATION_API}/notification-api/resource/sse`
  initSSE(newURL);
});

const handleClickOutside = () => {
  useAppStore().closeSideBar({ withoutAnimation: false });
};

const setLayout = () => {
  settingRef.value?.openSetting();
};

const setNotification = (val: boolean) => {
  console.log('setNotification', val)
  router.push({ path: '/notification/settings' })
}

const setNotificationFeed = (val: boolean) => {
  console.log('setNotificationFeed', val)
  router.push({ path: '/notificationFeed/settings' })
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixin.scss';
@import '@/assets/styles/variables.module.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.header-node {
  height: 60px;
  padding: 6px 20px 6px 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  #logon-icon {
    width: 130px;
    height: 48px;
    flex-shrink: 0;
  }
}

.main-container-node {
  flex: 1;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  overflow: auto;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
  background: $fixed-header-bg;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}
</style>
