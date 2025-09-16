<template>
  <div class="chart-menu" @mouseleave.stop="mouseleave()">
    <el-button type="text" plain icon="MoreFilled" @mouseover.stop="mouseover()"></el-button>
    <div v-if="showMenuFlag" class="menus" @mouseover.stop="mouseover()">
      <div class="menu-row" @click="showFullScreen()">
        <span class="popup-text">Full Screen</span>
        <img src="@/assets/images/chart/fullscreen.svg" alt="Full Screen" />
      </div>
      <div class="menu-row" @click="refresh()">
        <span class="popup-text">Refresh</span>
        <img src="@/assets/images/chart/refresh.svg" alt="" />
      </div>
      <div class="menu-row" @click="openEditChart()">
        <span class="popup-text">Edit</span>
        <img src="@/assets/images/chart/edit.svg" alt="" />
      </div>
      <div class="menu-row submenu-parent" @mouseover.stop="subMouseover()" @mouseleave.stop="subMouseleave()">
        <span class="popup-text">Export As...</span>
        <img src="@/assets/images/chart/export.svg" alt="" />
        <div v-if="isSubMenuVisible" class="sub-menu">
          <div class="menu-row" @click="exportPng()">
            <span class="popup-text">Export PNG</span>
            <img src="@/assets/images/chart/pngExport.svg" alt="" />
          </div>
          <div class="menu-row" @click="exportJpg()">
            <span class="popup-text">Export JPG</span>
            <img src="@/assets/images/chart/jpgExport.svg" alt="" />
          </div>
          <div class="menu-row" @click="exportExcel()">
            <span class="popup-text">Export Excel</span>
            <img src="@/assets/images/chart/excelExport.svg" alt="" />
          </div>
        </div>
      </div>
      <div class="menu-row" @click="deleteChart()">
        <span class="popup-text">Delete</span>
        <img src="@/assets/images/chart/deleteNew.svg" alt="" />
      </div>
    </div>
    <el-dialog v-model="dialogFullScreen.visible" class="fullChart" :destroy-on-close="true" :close-on-click-modal="true" append-to-body>
      <FoldingLineChart :config="fullSceenCartOption" />
    </el-dialog>
    <el-dialog v-model="dialogEdit.visible" class="fullChart" :destroy-on-close="true" append-to-body>
      <ChartEdit ref="editChart" :config="fullSceenCartOption" @close="closeEditDialog()" @save="refresh" />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import sleep from '@/utils/sleep';
import { FoldingLineRequestType } from './Option';
interface Props {
  config: {
    id: string;
    title: string;
    chartOptions: FoldingLineRequestType;
    showMenu: boolean;
  };
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps<Props>();
const emit = defineEmits(['refresh', 'delete-chart', 'export-chart']);
const editChart = ref(null);
// 切换Menu显示
const showMenuFlag = ref(false);
const isSubMenuVisible = ref(false);
const mouseLeaveFlag = ref(false);
const subMouseover = () => {
  isSubMenuVisible.value = true;
};
const subMouseleave = async () => {
  await sleep(200);
  isSubMenuVisible.value = false;
  if (!showMenuFlag.value) {
    showMenuFlag.value = false;
  }
};
const mouseover = () => {
  showMenuFlag.value = true;
  mouseLeaveFlag.value = false;
};
const mouseleave = async () => {
  mouseLeaveFlag.value = true;
  await sleep(200);
  if (mouseLeaveFlag.value) {
    showMenuFlag.value = false;
  }
};

// 按钮点击事件
// 全屏事件
const fullSceenCartOption = ref({ ...JSON.parse(JSON.stringify(props.config)), showMenu: false });
const dialogFullScreen = reactive<DialogOption>({
  visible: false
});
const showFullScreen = () => {
  fullSceenCartOption.value = { ...JSON.parse(JSON.stringify(props.config)), showMenu: false };
  dialogFullScreen.visible = true;
};
// 编辑事件
const dialogEdit = reactive<DialogOption>({
  visible: false
});
const openEditChart = () => {
  fullSceenCartOption.value = { ...JSON.parse(JSON.stringify(props.config)), showMenu: false };
  dialogEdit.visible = true;
};
// 编辑页面关闭
const closeEditDialog = () => {
  dialogEdit.visible = false;
};
// 删除事件
const deleteChart = async () => {
  await proxy?.$modal.confirm('Are you sure you want to delete this data?');
  emit('delete-chart');
};
// 刷新画面
const refresh = () => {
  closeEditDialog();
  emit('refresh');
};

const exportPng = () => {
  // png图
  emit('export-chart', 'png');
};
const exportJpg = () => {
  // Jpg图
  emit('export-chart', 'jpg');
};
const exportExcel = () => {
  // 导出Excel
  emit('export-chart', 'excel');
};
onMounted(async () => {});
</script>
<style lang="scss" scoped>
.chart-menu {
  &:hover {
    button {
      background: var(--el-color-primary-light-8);
      color: var(--el-color-primary-light-3);
    }
  }
  button {
    position: absolute;
    top: 50px;
    right: 3%;
    z-index: 10;
    font-size: 22px;
    width: 32px;
    border-radius: 16px;
    color: var(--vxe-font-lighten-color);
    &:deep(svg) {
      transform: rotate(90deg);
    }
  }
  .menus {
    position: absolute;
    right: 3%;
    top: 84px;
    width: 180px;
    background-color: var(--baseBackground);
    border: 1px solid var(--el-title-background-color);
    border-radius: 4px;
    box-shadow:
      0px 2px 4px -1px var(--el-box-shadow-start-color),
      0px 4px 6px -1px var(--el-box-shadow-end-color);
    cursor: pointer;
    .menu-row {
      padding: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      font-size: 14px;

      &:hover {
        background: var(--el-color-primary-light-8);
      }

      img {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
  .submenu-parent {
    position: relative;
  }
  .sub-menu {
    position: absolute;
    top: 0;
    left: -100%;
    z-index: 11;
    background-color: var(--baseBackground);
    border: 1px solid var(--el-title-background-color);
    width: 180px;
    border-radius: 4px;
    box-shadow:
      0px 2px 4px -1px var(--el-box-shadow-start-color),
      0px 4px 6px -1px var(--el-box-shadow-end-color);
    cursor: pointer;
  }
}
</style>
<!-- 有与其他组件样式冲突的危险 -->
<style lang="scss">
.fullChart {
  height: 90%;
  width: 90%;
  padding: 0;
  border-radius: 10px;

  header {
    display: none;
  }

  .el-dialog__body {
    max-height: 100% !important;
    height: 100%;
  }
}

.el-overlay .el-overlay-dialog .el-dialog.fullChart .el-dialog__body {
  padding: 0 !important;
}
</style>
