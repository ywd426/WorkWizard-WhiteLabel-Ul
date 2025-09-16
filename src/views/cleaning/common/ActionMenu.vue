<template>
  <div class="action-menu-container" v-click-outside="closeMenu">
    <el-button type="text" plain icon="MoreFilled" @click="toggleMenu()"></el-button>
    <div class="menu-panel" v-if="isMenuOpen">
      <div class="menu-row" @click="handleRefresh">
        <span class="popup-text">Refresh</span>
        <img src="@/assets/images/chart/refresh.svg" alt="" />
      </div>
      <div class="menu-row" @click="handleExport">
        <span class="popup-text">Export As...</span>
        <img src="@/assets/images/chart/export.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义事件
const emit = defineEmits(['refresh', 'export']);

// 菜单状态
const isMenuOpen = ref(false);

// 切换菜单显示状态
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 关闭菜单
const closeMenu = () => {
  isMenuOpen.value = false;
};

// 处理刷新
const handleRefresh = () => {
  emit('refresh');
  closeMenu();
};

// 处理导出
const handleExport = () => {
  emit('export');
  closeMenu();
};

// 点击外部关闭指令
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};
</script>

<style lang="scss" scoped>
.action-menu-container {
  position: relative;
  display: inline-block;
  &:hover {
    button {
      background: var(--el-color-primary-light-8);
      color: var(--el-color-primary-light-3);
    }
  }
  button {
    z-index: 10;
    font-size: 22px;
    width: 32px;
    border-radius: 16px;
    color: var(--vxe-font-lighten-color);
    &:deep(svg) {
      transform: rotate(90deg);
    }
  }
}

.action-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #606266;
  }
}

.menu-panel {
  position: absolute;
  z-index: 20;
  right: 3%;
  top: 34px;
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
</style>
