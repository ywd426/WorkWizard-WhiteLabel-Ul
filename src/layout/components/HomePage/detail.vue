<template>
  <div id="home-savings-card" class="savings-card">
    <!-- 标题 -->
    <div class="title">
      <div class="line"></div>
      <span class="savings-title">Savings Overview</span>
      <div class="line"></div>
    </div>

    <!-- 账单数据 -->
    <div class="savings-details">
      <!-- 原始账单 -->
      <div class="detail">
        <span class="label">Original Bill</span>
        <span class="amount">${{ originalBill.toLocaleString() }}</span>
      </div>

      <!-- 优化后账单 -->
      <div class="detail">
        <span class="label">Optimized Bill</span>
        <span class="amount">${{ optimizedBill.toLocaleString() }}</span>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 总节省 -->
      <div class="detail text-right">
        <span class="label blue-text">Total Savings</span>
        <span class="amount blue-text">${{ savings.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// 账单数据
const originalBill = ref(1200);
const optimizedBill = ref(850);
const savings = computed(() => originalBill.value - optimizedBill.value);

const update = (data) => {
  originalBill.value = data.originalBill || originalBill.value;
  optimizedBill.value = data.optimizedBill || optimizedBill.value;
};

defineExpose({
  update
});
</script>

<style scoped lang="postcss">
.savings-card {
  @apply bg-white rounded-xl p-6 flex flex-col max-w-2xl mx-auto;
}

/* 标题 */
.title {
  @apply flex items-center justify-center text-gray-700 font-semibold mb-4 text-sm;
}

.line {
  @apply flex-grow h-2px bg-gray-300 mx-2;
}

/* 账单详情 */
.savings-details {
  @apply flex justify-between items-center;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
}

.detail {
  @apply flex flex-col items-center;
}

.label {
  @apply text-gray-500 text-sm;
  font-size: 0.75rem;
  line-height: 1rem;
  color: #71797e;
  margin-bottom: 0.125rem;
  @extend .ellipsis;
}

.amount {
  @apply text-xl font-semibold text-gray-800;
  font-size: 14px;
  line-height: 1rem;
  color: #11191e;
  @extend .ellipsis;
}

/* 垂直分割线 */
.divider {
  @apply w-2px h-12 bg-gray-300 mx-4;
}

.savings-title {
  font-weight: 600;
  font-size: 10px;
  line-height: 14px;
}

.blue-text {
  background: linear-gradient(90deg, #4c90cd 7.76%, #4677ba 21.59%, #415da8 39.1%, #3d4b9b 56.61%, #3a4093 75.96%, #3a3d91 97.16%, #3a3d91 99.93%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
