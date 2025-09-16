<template>
  <div class="action-menu-container" v-click-outside="closeMenu">
    <el-button type="primary" class="action-button" @click="toggleMenu()">
      Actions
      <el-icon v-show="isMenuOpen" class="el-icon--right"><ArrowUp /></el-icon>
      <el-icon v-show="!isMenuOpen" class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <div class="menu-panel" v-if="isMenuOpen">
      <div class="menu-row" v-for="(item, index) in menuItems" :key="index" @click="handleMenuClick(item)">
        <span class="popup-text">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';

// 定义属性
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [
      { label: 'Create New Work Order', action: 'create' },
      { label: 'Upload Excel', action: 'upload' }
    ]
  }
});

// 定义事件
const emit = defineEmits(['menuClick', 'refresh', 'export', 'create', 'upload']);

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

// 处理菜单点击
const handleMenuClick = (item) => {
  emit('menuClick', item);
  emit(item.action);
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

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 4px;
    background-color: #1890ff;
    border-color: #1890ff;

    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }
  }
}

.menu-panel {
  position: absolute;
  z-index: 20;
  right: 0;
  top: 40px;
  width: 240px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .menu-row {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
    transition: background-color 0.3s;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
      color: #1890ff;
    }

    &:first-child {
      color: #1890ff;
      font-weight: 500;
    }
  }
}
</style>
