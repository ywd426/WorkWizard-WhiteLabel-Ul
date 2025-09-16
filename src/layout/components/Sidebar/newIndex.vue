<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: bgColor, width: isCollapse ? '54px' : '288px !important' }">
    
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <transition :enter-active-class="proxy?.animate.menuSearchAnimate.enter" mode="out-in">
        <el-menu
          popper-effect="light"
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="bgColor"
          :text-color="textColor"
          :unique-opened="true"
          :active-text-color="theme"
          :collapse-transition="false"
          mode="vertical"
        >
          <sidebar-item v-for="(r, index) in sidebarRouters" :key="r.path + index" :item="r" :base-path="r.path" :level="0" />
        </el-menu>
      </transition>
    </el-scrollbar>
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />
  </div>
</template>

<script setup lang="ts">
import SidebarItem from '@/layout/components/Sidebar/SidebarItem.vue';
import variables from '@/assets/styles/variables.module.scss';
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const sidebarRouters = computed<RouteRecordRaw[]>(() => {
  return permissionStore.getSidebarRoutes() as RouteRecordRaw[];
});
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});
const toggleSideBar = () => {
  appStore.toggleSideBar(false);
};
const bgColor = computed(() => (sideTheme.value === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground));
const textColor = computed(() => (sideTheme.value === 'theme-dark' ? variables.menuColor : variables.menuLightColor));

// 获得条件路径
const getRouterPatch = (keyAry: string[], keyLength: number, routerAry: RouteRecordRaw[]) => {
  let result = '';
  const keyTemp: string = keyAry[keyLength];
  const routerTemp: RouteRecordRaw[] = routerAry.filter((route) => {
    return route.path === '/' + keyTemp || route.path === keyTemp;
  });
  if (routerTemp != undefined && routerTemp.length > 0) {
    let children: RouteRecordRaw[] = routerTemp[0]?.children;

    // 第一个子项判断
    if (children != undefined && children.length > 0) {
      if (keyLength + 1 < keyAry.length) {
        result = getRouterPatch(keyAry, keyLength + 1, children);
      } else {
        const firstChildren: RouteRecordRaw[] = children[0]?.children;
        if (firstChildren == undefined) {
          result = children[0].path;
        }
      }
    }
  }
  return result;
};
</script>
<style lang="scss">
#hamburger-container {
  line-height: 46px;
  height: 100%;
  display: flex;
  justify-content: end;
  width: 100%;
  padding: 18px 1.125rem 1.5rem 0;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }
}
</style>