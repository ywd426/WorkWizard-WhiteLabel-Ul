<template>
  <div class="impact-optimization">
    <div v-if="showTitle" class="impact-title">{{ title }}</div>
    <div class="impact-row">
      <div v-for="(metric, index) in metrics" :key="index" class="impact-card">
        <div class="header flex justify-between w-full">
          <span class="impact-value">{{ metric.percentage }} %</span>
          <svg-icon :icon-class="iconName(metric)"></svg-icon>
        </div>
        <div class="impact-label">{{ metric.label }}</div>
        <div class="impact-desc flex justify-between">
          <span>{{ metric.desc }}</span>
          <div class="flex flex-row items-center" v-if="!!metric.trend" :class="metric.trend">
            <svg-icon :icon-class="metric.trend === 'positive' ? 'up' : 'down'"></svg-icon>
            <span>
              {{ metric.value }}
            </span>
          </div>
        </div>
        <el-progress class="w-full" :percentage="metric.percentage" :show-text="false" :color="getColor(metric.type)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCleanStore } from '@/store/modules/cleaning';
const cleanStore = useCleanStore();
const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Potential Impact of Optimization'
  },
  metrics: {
    type: Array,
    default: () => []
  }
});

const iconName = (alert) => {
  if (alert.type === 'high') return 'alert-high';
  if (alert.type === 'normal') return 'alert-normal';
  if (alert.type === 'low') return 'alert-low';
  if (alert.type === 'medium') return 'alert-medium';
};

const getColor = (type) => {
  if (type === 'high') return cleanStore.colors.red;
  if (type === 'medium') return cleanStore.colors.orange;
  if (type === 'low') return cleanStore.colors.yellow;
  return cleanStore.colors.green;
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';

.header {
  svg {
    height: 40px;
    width: 40px;
  }
}
.impact-title {
  color: var(--VI-text-B12, #11191e);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  margin-bottom: 8px;
}
.impact-row {
  display: flex;
  gap: 8px;
}
.impact-card {
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  border-radius: 8px;
  border: 1px solid $color-light-gray;
  background: var(
    --Styles-GradFlat-DarkFore05,
    linear-gradient(
      90deg,
      var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
      var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
      var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
      var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
      var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
      var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
      var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
    )
  );
  position: relative;
}
.impact-label {
  color: var(--VI-text-B12, #11191e);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
}

.impact-desc {
  width: 100%;
  color: var(--VI-text-B49, #71797e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}
.impact-value {
  color: var(--VI-text-B12, #11191e);
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: 34px;
}
.impact-value.blue {
  color: $color-blue;
}
.impact-value.red {
  color: $color-red;
}
.el-progress {
  margin-top: 8px;
  margin-bottom: 4px;
}
.positive {
  padding: 4px 8px;
  background: var(--colors-flat-success-flat10, rgba(0, 186, 74, 0.1));
  color: $color-green;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  border-radius: 4px;
  height: 24px;
  white-space: nowrap;
}

.negative {
  background: var(--colors-flat-danger-flat10, rgba(255, 56, 76, 0.1));
  color: $color-red;

  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  /* 133.333% */
  border-radius: 4px;
  white-space: nowrap;
  height: 24px;
  padding: 4px 8px;
}
</style>
