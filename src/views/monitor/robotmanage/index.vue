<template>
  <div ref="p2" class="p-2">
    <el-row>
      <el-col :span="24" class="tab-container">
        <button
          v-for="tab in tabs"
          :key="tab.component"
          :disabled="false"
          :loading="false"
          open-type=""
          hover-class="active"
          :class="{ active: currentTab === tab.component }"
          class="tab-button"
          @click="changeTab(tab.component)"
        >
          {{ tab.label }}
        </button>
      </el-col>
      <!-- <el-col v-else :span="24" class="tab-container">
        <el-tabs v-model="currentTab" class="demo-tabs">
          <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.component"  @click="changeTab(tab.component)">
            {{ tab.label }}
          </el-tab-pane>
        </el-tabs>
      </el-col> -->
      <el-col :span="24">
        <RobotPage v-if="currentTab == 'SubPage1'" />
        <MornitorPage v-if="currentTab == 'SubPage5'" />
        <SchdulePage v-if="currentTab == 'SubPage2'"></SchdulePage>
        <TaskPage v-if="currentTab == 'SubPage3'"></TaskPage>
        <AnalysisPage v-if="currentTab == 'SubPage4'"></AnalysisPage>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="robotManage" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { isMobileDevice } from '@/utils';
const route = useRoute();

import RobotPage from '@/views/monitor/robotmanage/robots/index.vue';
import SchdulePage from '@/views/monitor/robotmanage/schdule/index.vue';
import TaskPage from '@/views/monitor/robotmanage/taskOverview/index.vue';
import AnalysisPage from '@/views/monitor/robotmanage/costAnalysis/index.vue';
import MornitorPage from '@/views/monitor/robotmanage/monitoring/index.vue';

//路由参数
const routeParams = ref<Record<string, any>>({});
const currentTab = ref('SubPage1');
const tabs = ref([
  { label: 'Fleet', component: 'SubPage1' },
  { label: 'Tracking', component: 'SubPage5' },
  { label: 'Task', component: 'SubPage2' },
  { label: 'Performance', component: 'SubPage3' },
  { label: 'Cost', component: 'SubPage4' }
]);
onMounted(() => {
  routeParams.value = proxy.$route.query;
  currentTab.value = 'SubPage1';
  if (routeParams.value.tabType) {
    if (routeParams.value.tabType == 2) {
      currentTab.value = 'SubPage2';
    }
  }
});
const changeTab = (tabName: string) => {
  currentTab.value = tabName;
};
</script>
<style scoped>
.tab-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 12px;
}

.tab-button {
  width: fit-content;
  height: 64px;
  padding: 0 8px;
  border: none;
  background: none;
  color: var(--el-text-color-b12);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  position: relative;
}

.tab-button::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: var(--colors-base-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-button.active,
.tab-button:hover {
  color: var(--colors-base-primary);
}

.tab-button.active::after,
.tab-button:hover::after {
  transform: scaleX(1);
  background-color: var(--colors-base-primary);
}

@media screen and (max-width: 768px) {
  .tab-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 四列，每列等宽 */
    gap: 2px;
    padding-left: 0;

    overflow-x: auto; /* 在小屏幕上允许水平滚动 */
    scrollbar-width: none; /* 隐藏Firefox滚动条 */
    -ms-overflow-style: none; /* 隐藏IE滚动条 */
  }

  .tab-button {
    border: none;
    background: none;
    color: var(--el-text-color-b12);
    font-style: normal;
    text-align: center;
    position: relative;
    flex: 1 0 auto;

    width: 80px;
    white-space: wrap;
    height: 48px;
    padding: 0 2px;
    font-size: 12px;
    font-weight: 600;
    line-height: 14px;
  }
}
</style>
