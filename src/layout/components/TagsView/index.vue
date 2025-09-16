<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path ? tag.path : '', query: tag.query }"
        class="tags-view-item flex-column"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <div class="tag-content">
          <span class="tag-title">{{ tag.title }}</span>
          <svg-icon v-if="!isAffix(tag)" icon-class="close-colorful" @click.prevent.stop="closeSelectedTag(tag)"></svg-icon>
        </div>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)"><refresh-right style="width: 1em; height: 1em" /> Refresh Page</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)"><close style="width: 1em; height: 1em" /> Close Current</li>
      <li @click="closeOthersTags"><circle-close style="width: 1em; height: 1em" /> Close Other</li>
      <li v-if="!isFirstView()" @click="closeLeftTags"><back style="width: 1em; height: 1em" /> Close The Left Side</li>
      <li v-if="!isLastView()" @click="closeRightTags"><right style="width: 1em; height: 1em" /> Close The Right Side</li>
      <li @click="closeAllTags(selectedTag)"><circle-close style="width: 1em; height: 1em" /> Close All</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import ScrollPane from './ScrollPane.vue';
import { getNormalPath } from '@/utils/ruoyi';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import useTagsViewStore from '@/store/modules/tagsView';
import { RouteRecordRaw, RouteLocationNormalized } from 'vue-router';

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref<RouteLocationNormalized>();
const affixTags = ref<RouteLocationNormalized[]>([]);
const scrollPaneRef = ref<InstanceType<typeof ScrollPane>>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const visitedViews = computed(() => useTagsViewStore().getVisitedViews());
const routes = computed(() => usePermissionStore().getRoutes());
const theme = computed(() => useSettingsStore().theme);

watch(route, () => {
  addTags();
  moveToCurrentTag();
});
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu);
  } else {
    document.body.removeEventListener('click', closeMenu);
  }
});

const isActive = (r: RouteLocationNormalized): boolean => {
  return r.path === route.path;
};
const activeStyle = (tag: RouteLocationNormalized) => {
  if (!isActive(tag)) return {};
};
const isAffix = (tag: RouteLocationNormalized) => {
  return tag?.meta && tag?.meta?.affix;
};
const isFirstView = () => {
  try {
    return selectedTag.value.fullPath === '/index' || selectedTag.value.fullPath === visitedViews.value[1].fullPath;
  } catch (err) {
    return false;
  }
};
const isLastView = () => {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath;
  } catch (err) {
    return false;
  }
};
const filterAffixTags = (routes: RouteRecordRaw[], basePath = '') => {
  let tags: RouteLocationNormalized[] = [];

  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path);
      tags.push({
        hash: '',
        matched: [],
        params: undefined,
        query: undefined,
        redirectedFrom: undefined,
        fullPath: tagPath,
        path: tagPath,
        name: route.name as string,
        meta: { ...route.meta }
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
};
const initTags = () => {
  const res = filterAffixTags(routes.value);
  affixTags.value = res;
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag);
    }
  }
};
const addTags = () => {
  const { name } = route;
  if (route.query.title) {
    route.meta.title = route.query.title as string;
  }
  if (name) {
    useTagsViewStore().addView(route as any);
    if (route.meta.link) {
      useTagsViewStore().addIframeView(route as any);
    }
  }
  return false;
};
const moveToCurrentTag = () => {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value?.moveToTarget(r);
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route);
        }
      }
    }
  });
};
const refreshSelectedTag = (view: RouteLocationNormalized) => {
  proxy?.$tab.refreshPage(view);
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route);
  }
};
const closeSelectedTag = (view: RouteLocationNormalized) => {
  proxy?.$tab.closePage(view).then(({ visitedViews }: any) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
};
const closeRightTags = () => {
  proxy?.$tab.closeRightPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    if (!visitedViews.find((i: RouteLocationNormalized) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
};
const closeLeftTags = () => {
  proxy?.$tab.closeLeftPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    if (!visitedViews.find((i: RouteLocationNormalized) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
};
const closeOthersTags = () => {
  router.push(selectedTag.value.fullPath).catch(() => {});
  proxy?.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
};
const closeAllTags = (view: RouteLocationNormalized) => {
  proxy?.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return;
    }
    toLastView(visitedViews, view);
  });
};
const toLastView = (visitedViews: RouteLocationNormalized[], view?: RouteLocationNormalized) => {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath as string);
  } else if (view?.name === 'Dashboard') {
    // to reload home page
    router.replace({ path: '/redirect' + view?.fullPath });
  } else {
    router.push('/');
  }
};
const openMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  const menuMinWidth = 105;
  const offsetLeft = proxy?.$el.getBoundingClientRect().left; // container margin left
  const offsetWidth = proxy?.$el.offsetWidth; // container width
  const maxLeft = offsetWidth - menuMinWidth; // left boundary
  const l = e.clientX - offsetLeft + 15; // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = l;
  }

  top.value = e.clientY;
  visible.value = true;
  selectedTag.value = tag;
};
const closeMenu = () => {
  visible.value = false;
};
const handleScroll = () => {
  closeMenu();
};

onMounted(() => {
  initTags();
  addTags();
});
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      line-height: 23px;
      top: -0.25rem;
      background-color: var(--el-bg-color);
      color: #495060;
      font-size: 12px;
      margin-right: 0.5rem;
      margin-top: 4px;
      &:hover {
        color: var(--el-color-primary);
      }
      &:first-of-type {
        margin-left: 22px;
      }
      &:last-of-type {
        margin-right: 15px;
      }

      border-radius: 5px;
      padding: 1px;
      & .tag-content {
        border-radius: 4px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: auto;
        height: 26px;
        padding: 0 12px;
      }

      & .tag-title {
        font-size: 12px;
        font-weight: bold;
        font-family: 'Montserrat', Arial, sans-serif;
        padding-right: 8px;
      }
      &.active {
        position: relative;
        display: inline-block;

        background: linear-gradient(
          90deg,
          #4c90cd 7.76%,
          #4677ba 21.59%,
          #415da8 39.1%,
          #3d4b9b 56.61%,
          #3a4093 75.96%,
          #3a3d91 97.16%,
          #3a3d91 99.93%
        );

        & .tag-content {
          background: linear-gradient(
              90deg,
              rgba(76, 144, 205, 0.08) 7.76%,
              rgba(70, 119, 186, 0.08) 21.59%,
              rgba(65, 93, 168, 0.08) 39.1%,
              rgba(61, 75, 155, 0.08) 56.61%,
              rgba(58, 64, 147, 0.08) 75.96%,
              rgba(58, 61, 145, 0.08) 97.16%,
              rgba(58, 61, 145, 0.08) 99.93%
            ),
            #fff;
        }

        & .tag-title {
          background: linear-gradient(
            90deg,
            #4c90cd 7.76%,
            #4677ba 21.59%,
            #415da8 39.1%,
            #3d4b9b 56.61%,
            #3a4093 75.96%,
            #3a3d91 97.16%,
            #3a3d91 99.93%
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: var(--el-bg-color);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  border-radius: 4px;
  color: var(--colors-B12, #11191e);
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px; /* 133.333% */
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
        width: 12px !important;
        height: 12px !important;
      }
    }
  }
}
</style>
