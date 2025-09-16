<template>
  <div class="filter-tabs" v-if="tabs && tabs.length > 0">
    <div v-for="tab in tabs" :key="tab.value" class="filter-tab" :class="{ active: activeStatus === tab.value }" @click="changeCurrentTab(tab)">
      {{ tab.label }}
    </div>
  </div>
  <div class="metrics-cards">
    <div class="metric-card" v-for="(metric, index) in metrics" :key="index">
      <div class="metric-header">
        <div class="metric-header-left flex flex-row flex-1">
          <div class="metric-value" :style="{color: metric.color}">
            <el-tooltip class="box-item" effect="light" :content="metric.value" placement="top">
              {{ metric.value }}
            </el-tooltip>
            <span v-if="metric.unit">{{ metric.unit }}</span>
          </div>
          <div class="metric-badges" v-if="!!metric.badges">
            <span class="badge" v-for="(badge, i) in metric.badges" :key="i" :class="badge.type">
              {{ badge.value }}
            </span>
          </div>
        </div>
        <svg-icon v-if="metric.icon" :icon-class="metric.icon"></svg-icon>
      </div>
      <div class="metric-title" :style="{color: metric.color}">{{ metric.title }}</div>
      <div class="metric-comparison">
        {{ metric.description }}
        <div class="flex flex-row" v-if="!!metric.trend" :class="metric.trend.type">
          <svg-icon :icon-class="metric.trend.type === 'positive' ? 'up' : 'down'"></svg-icon>
          <span>
            {{ metric.trend.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  metrics: {
    type: Array,
    default: () => []
  },
  tabs: {
    type: Array,
    default: () => []
  },
  width: {
    type: String,
    default: '280px'
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  activeTab: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['changeTab']);

const activeStatus = ref(props.activeTab);

const iconMap = {
  'air_quality': 'light',
  comfort: 'hcho',
  temperature: 'temperature',
  humidity: 'humidity',
  co2: 'co2'
};

const changeCurrentTab = (tab) => {
  activeStatus.value = tab.value;
  emit('changeTab', tab.value);
};

const transformMetrics = (data) => {
  return data.map((item) => {
    // 处理 badges
    const badges = [];
    if (item.forecastNum > 0) {
      badges.push({ value: item.forecastNum.toString(), type: 'blue' });
    }
    if (item.alertNum > 0) {
      badges.push({ value: item.alertNum.toString(), type: 'red' });
    }

    const result = {
      value: item.value || '--',
      unit: item.unit,
      badges: badges,
      icon: iconMap[item.icon],
      title: `Average ${item.dataType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
      description: 'Compared to Yesterday'
    };

    if (item.previousValue == null && item.value == null) {
      return result;
    }

    // 处理 trend
    const previousValue = item.previousValue || 0;
    const currentValue = parseFloat(item.value);
    let trendValue, trendType;

    if (previousValue === 0) {
      // 当 previousValue 为 0 时，直接使用差值
      const diff = currentValue - previousValue;
      trendValue = Math.abs(diff).toFixed(1);
      trendType = diff >= 0 ? 'positive' : 'negative';
    } else {
      // 否则使用百分比变化
      const percentageChange = ((currentValue - previousValue) / currentValue) * 100;
      trendValue = Math.abs(percentageChange).toFixed(1) + '%';
      trendType = percentageChange >= 0 ? 'positive' : 'negative';
    }

    result.trend = {
      value: trendValue,
      type: trendType
    };

    return result;
  });
};

defineExpose({
  transformMetrics
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.filter-tabs {
  display: flex;
  padding: 16px 20px 0 20px;
  padding-left: 0;
  gap: 8px;
  flex-wrap: wrap;
}
.metrics-cards {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 12px 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  .metric-card {
    display: flex;
    padding: 16px 24px;
    flex-direction: column;
    align-items: flex-start;
    min-width: v-bind('width');
    max-width: v-bind('maxWidth');
    gap: 8px;
    flex: 1 1 auto;
    border-radius: 8px;
    border: 1px solid rgba(211, 219, 224, 0.4);
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

    .metric-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 6px;
      width: 100%;

      .metric-header-left {
        max-width: calc(100% - 56px);
      }

      svg {
        width: 2.5rem;
        height: 2.5rem;
      }

      .metric-value {
        color: var(--VI-text-B12, #11191e);
        margin-right: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        font-size: 28px;
        font-style: normal;
        font-weight: 600;
        line-height: 34px;
        /* 121.429% */

        span {
          font-size: 18px;
          margin-left: 2px;
          font-weight: 500;
        }
      }

      .metric-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;

        .badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 16px;
          flex-shrink: 0;
          border-radius: 8px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &.red {
            background: $color-red;
          }

          &.yellow {
            background: $color-yellow;
          }

          &.orange {
            background: $color-orange;
          }

          &.blue {
            background: $color-blue;
          }

          &.green {
            background: $color-green;
          }

          &.gray {
            background: linear-gradient(135deg, #909399, #82848a);
          }
        }
      }
    }

    .metric-title {
      color: var(--VI-text-B12, #11191e);
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
    }

    .metric-comparison {
      display: flex;
      flex-direction: row;
      gap: 8px;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      color: var(--VI-text-B49, #71797e);
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;

      /* 133.333% */
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

      span {
        margin-left: 4px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
      }

      svg {
        width: 1.25rem;
        height: 1.25rem;
        margin-top: -2px;
      }
    }
  }
}

.info-icon {
  margin-top: -16px;
  margin-left: -8px;
}
</style>
