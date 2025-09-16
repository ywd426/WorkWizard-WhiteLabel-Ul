<template>
  <div :class="{ hidden: hidden }" class="pagination-container">
    <el-config-provider :locale="customLocale">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :background="background"
        :layout="layout"
        :page-sizes="pageSizes"
        :pager-count="pagerCount"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-config-provider>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Pagination'
};
</script>

<script setup lang="ts">
import { scrollTo } from '@/utils/scroll-to';
import { propTypes } from '@/utils/propTypes';
import type { Language } from 'element-plus/es/locale';

const props = defineProps({
  total: propTypes.number,
  page: propTypes.number.def(1),
  limit: propTypes.number.def(20),
  pageSizes: {
    type: Array as () => number[],
    default: () => [10, 20, 30, 50]
  },
  // 移动端页码按钮的数量端默认值5
  pagerCount: propTypes.number.def(document.body.clientWidth < 992 ? 5 : 7),
  layout: propTypes.string.def('total, sizes, prev, pager, next, jumper'),
  background: propTypes.bool.def(true),
  autoScroll: propTypes.bool.def(true),
  hidden: propTypes.bool.def(false),
  float: propTypes.string.def('right')
});

const emit = defineEmits(['update:page', 'update:limit', 'pagination']);
const currentPage = computed({
  get() {
    return props.page;
  },
  set(val) {
    emit('update:page', val);
  }
});
const pageSize = computed({
  get() {
    return props.limit;
  },
  set(val) {
    emit('update:limit', val);
  }
});
function handleSizeChange(val: number) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1;
  }
  emit('pagination', { page: currentPage.value, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}
function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: pageSize.value });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}

// 自定义国际化配置
const customLocale: Language = {
  name: 'en',
  el: {
    colorpicker: {},
    pagination: {
      total: 'Totel {total} items',
      pagesize: ' / Page',
      prev: 'Previous',
      next: 'Next',
      goto: 'Go to',
      pageClassifier: 'Page'
    }
  }
};
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  .el-pagination {
    float: v-bind(float);
  }
}
.pagination-container.hidden {
  display: none;
}

/* 自定义样式以在输入框外右边添加 "Page" 文本 */
.el-pagination__jump {
  position: relative;
}

.el-pagination__jump .el-input__inner {
  padding-right: 30px; /* 为 "Page" 文本腾出空间 */
}

.el-pagination__jump::after {
  content: 'Page';
  position: absolute;
  right: 10px; /* 根据需要调整位置 */
  top: 50%;
  transform: translateY(-50%);
  color: #606266; /* 根据需要调整颜色 */
  pointer-events: none; /* 确保文本不可点击 */
}
</style>
