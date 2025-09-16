<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group v-if="route.meta.goBack" name="breadcrumb">
      <el-breadcrumb-item id="go-back-breadcrumb" :to="{ path: route.meta.backMenu, query: { tabType: route.meta.query } }">
        Go Back
      </el-breadcrumb-item>
    </transition-group>

    <transition-group v-if="!route.meta.goBack" name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noRedirect' || index == levelList.length - 1" class="no-redirect">{{ item.meta?.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from 'vue-router';

const route = useRoute();
const router = useRouter();
const levelList = ref<RouteLocationMatched[]>([]);

const getBreadcrumb = () => {
  // only show routes with meta.title
  let matched = route.matched.filter((item) => item.meta && item.meta.title);
  console.log(matched)
  const first = matched[0];
  // 判断是否为首页
  if (!isDashboard(first)) {
    matched = ([{ path: '/index', meta: { title: 'Home Page' } }] as any).concat(matched);
  }
  levelList.value = matched.filter((item) => item.meta && item.meta.title && item.meta.breadcrumb !== false);
  console.log(levelList.value)
};
const isDashboard = (route: RouteLocationMatched) => {
  const name = route && (route.name as string);
  if (!name) {
    return false;
  }
  return name.trim() === 'Index';
};
const handleLink = (item) => {
  const { redirect, path } = item;
  redirect ? router.push(redirect) : router.push(path);
};

const goBack = (item) => {
  router.push(item.meta.backMenu);
};

watchEffect(() => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (route.path.startsWith('/redirect/')) return;
  getBreadcrumb();
});
onMounted(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

#go-back-breadcrumb {
  :deep(.el-breadcrumb__inner) {
    cursor: pointer;
  }
}

:deep(.el-breadcrumb__item) {
  font-size: 12px;
  font-weight: 600;
  &:first-of-type {
    margin-left: 22px;
  }
  &:last-of-type {
    background: linear-gradient(90deg, #4c90cd 7.76%, #4677ba 21.59%, #415da8 39.1%, #3d4b9b 56.61%, #3a4093 75.96%, #3a3d91 97.16%, #3a3d91 99.93%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>
