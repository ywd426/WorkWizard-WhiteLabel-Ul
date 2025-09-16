<template>
  <section class="app-main">
    <div v-if="currentRoute === '/index'" class="welcome-screen">
      <p class="welcome-text" :class="isInit ? 'animation' : ''">Welcome to FOXX Smart Building Systems</p>
    </div>
    <router-view v-else v-slot="{ Component }">
      <transition v-if="!route.meta.noCache" :enter-active-class="animante" mode="out-in">
        <keep-alive v-if="!route.meta.noCache" :include="tagsViewStore.cachedViews">
          <component :is="Component" v-if="!route.meta.link" :key="route.path" />
        </keep-alive>
      </transition>
      <transition v-if="route.meta.noCache" :enter-active-class="animante" mode="out-in">
        <component :is="Component" v-if="!route.meta.link && route.meta.noCache" :key="route.path" />
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup name="AppMain" lang="ts">
import useSettingsStore from '@/store/modules/settings';
import useTagsViewStore from '@/store/modules/tagsView';
import HomePage from './HomePage/home.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRoute = ref(route.path); // 获取当前路由的路径
const isInit = ref(true);

console.log(currentRoute);
import IframeToggle from './IframeToggle/index.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const tagsViewStore = useTagsViewStore();

// 随机动画集合
const animante = ref<string>('');
const animationEnable = ref(useSettingsStore().animationEnable);
watch(
  () => useSettingsStore().animationEnable,
  (val: boolean) => {
    animationEnable.value = val;
    if (val) {
      animante.value = proxy?.animate.animateList[Math.round(Math.random() * proxy?.animate.animateList.length)] as string;
    } else {
      animante.value = proxy?.animate.defaultAnimate as string;
    }
  },
  { immediate: true }
);

watch(route, (newRoute) => {
  currentRoute.value = newRoute.path;
  isInit.value = false;
});
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 110px);
  width: 100%;
  position: relative;
  overflow: auto;
  padding: 0 20px;
}
.app-main .p-2 {
  background-color: var(--baseBackground);
  padding: 1rem;
}
.app-main .p-3 {
  background-color: var(--baseBackground);
  padding: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 2px 4px -1px rgba(17,25,30,0.05);
  box-shadow: 0px 4px 6px -1px rgba(17,25,30,0.1);

}
.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 144px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>
<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}

.welcome-screen {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  height: 90%;
  display: flex;
  justify-content: center;
  background: url('@/assets/images/backgroundImage.jpg') no-repeat center center;
  background-size: cover;
  z-index: 998;
}

.welcome-text {
  margin-top: 10rem;
  font-size: 3.75rem;
  text-align: center;
  background: linear-gradient(to right, #4c90cd, #3b3e92);
  background-clip: text; /* 添加标准属性 */
  -webkit-background-clip: text; /* 保留 WebKit 前缀 */
  -webkit-text-fill-color: transparent;
}
.animation {
  animation: zoomIn 1s ease-in-out;
}

/* 渐入渐出动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 文字放大效果 */
@keyframes zoomIn {
  from {
    transform: scale(0.5);
  }
  to {
    transform: scale(1);
  }
}
</style>
