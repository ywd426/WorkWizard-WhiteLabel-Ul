<template>
  <div class="performance-content">
    <!-- 任务统计部分 -->
    <div class="section">
      <div class="section-title">Work Order Statistics</div>

      <div class="tab-buttons">
        <el-button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', activeTab === tab.value ? 'active' : '']"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </el-button>
      </div>

      <div class="metrics-grid">
        <div v-for="item in metrics" class="metric-card" :style="performanceConfig.styles.metrics.card">
          <div class="metric-value">{{ item.value }}</div>
          <div class="metric-title">{{ item.title }}</div>
          <div v-if="item.description" class="metric-description">{{ item.description }}</div>
        </div>
      </div>
    </div>

    <!-- 历史工单效率部分 -->
    <div class="section">
      <div class="section-title">Historical Work Order Effectiveness</div>
      <div class="filter-row">
        <div class="filter-text">Based on 3 previous work order completions in this location.</div>

      </div>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column v-for="col in performanceConfig.tableColumns" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.minWidth">
          <template v-if="col.slot" #default="scope">
          
            <template v-if="col.prop === 'effectiveness'">
              <div
                style="width: 64px; text-align: center"
                :class="['cell', 'effectiveness', performanceConfig.styles.effectiveness[scope.row.effectiveness.toLowerCase()].class]"
              >
                {{ scope.row.effectiveness }}
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 前后指标对比部分 -->
    <div class="section">
      <div class="section-subtitle mb-4">Before & After Metrics</div>
      <div class="filter-selects">
          <el-select v-model="co2LevelFilter" :placeholder="performanceConfig.filters.co2Level.placeholder" size="middle" class="filter-select">
            <el-option v-for="option in performanceConfig.filters.co2Level.options" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>

          <el-input-number v-model="levelInterval" controls-position="right" style="width: 80px" size="default" class="filter-select" /> <span class="pl-2">Hours</span>
        </div>
      <div class="metrics-description">Data collected 12 hours before task start and 12 hours after task completion.</div>

      <div class="co2-comparison">
        <div class="before-after-values">
          <div class="before-value">
            <div class="value">{{ metric.before }}</div>
            <div class="label">Before</div>
          </div>

          <div class="after-value">
            <div class="value">{{ metric.after }}</div>
            <div class="label">After</div>
          </div>
        </div>

        <div class="metric-label">{{ metric.label }}</div>
        <div class="improvement">Improvement</div>

        <div class="improvement-percentage">
          <div class="percentage">{{ metric.percentage }}</div>
        </div>

        <div class="co2-chart">
          <div class="chart-container">
            <div ref="chartRef" style="width: 100%; height: 180px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 备注和文档部分 -->
    <div class="section">
      <div class="section-title">Notes and Documentation</div>

      <div class="materials-used flex gap-4">
        <div class="materials-input-row">
          <div class="subsection-label">Materials Used</div>
        </div>
        <div class="materials-tags">
          <el-tag v-for="tag in materialTags" :key="tag" type="info" effect="plain" class="deficiency-tag"
            >{{ tag }}
          </el-tag>
        </div>
      </div>

      <div class="completion-notes flex gap-3 mb-5">
        <div class="subsection-label">Photos</div>
        <div class="subsection-img flex flex-col flex-1">
          <!-- <CommentEditor
            v-model="commentContent"
            :height="160"
            :min-height="40"
            style="max-width: 800px"
            placeholder="Add your comment here..."
            @upload-file="uploadFile"
          /> -->
          <div v-for="(photo, index) in photos" :key="index" class="photo-item">
              <div class="photo-preview" @click="viewPhoto(photo)">
                <img v-if="photo.url" :src="photo.url" alt="Work-order" />
                <div v-else class="empty-photo"></div>
              </div>
              <el-button v-if="editPhone" size="small" @click="removePhoto(index)" type="danger" circle plain>
                <el-icon><Close /></el-icon>
              </el-button>
          </div>
        </div>
        
      </div>
       <div class="flex flex-row w-full gap-4 items-center">
          <div class="subsection-label">Completion Notes</div>
          <el-input class="flex-1" v-model="notes" type="textarea" :rows="4" placeholder="Enter additional notes" :disabled="type === 'view'" />
        </div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import * as useUtils from '@/utils/index';
import { performanceConfig, generateMockTableData } from './config/performanceConfig';
import { getTemplatePerformance, getTemplateEffectiveness, getTemplateStatistics } from '@/api/clean/task';
// 定义属性
const props = defineProps({
  header: {
    type: String,
    default: 'Performance'
  },
  id: {
    type: Number,
    default: 0
  },
  zoneId: {
    type: String,
    default: '1'
  },
  metricTypes: {
    type: Array,
    default: () => []
  },

});

// 定义事件
const emit = defineEmits(['update:modelValue', 'submit', 'close']);

// 使用配置数据
const metrics = ref(performanceConfig.metrics);
const tabs = performanceConfig.tabs;
const metric = ref(performanceConfig.metric);
const materialTags = ref([]);
const activeTab = ref(0);
const photos = ref([]);
const notes = ref('');

// 筛选器数据
const co2LevelFilter = ref('co2');
const levelInterval = ref(1);

// 表格数据
const tableData = ref(generateMockTableData());

const chartRef = ref(null);
let co2ChartInstance = null;

// 假设你的元数据如下
const chartMeta = ref({
  xAxis: ['-12h', '-9h', '-6h', '-3h', 'Task Start', 'Task End', '+3h', '+6h', '+9h', '+12h'],
  series: [
    { name: 'μg/m³', data: [60, 58, 70, 80, 75, 20, 40, 55, 75, 80] },
    { name: 'Task Duration', data: [null, null, null, null, 20, 40, null, null, null, null] }
  ]
});

const yMin = computed(() => {
  const all = chartMeta.value.series.flatMap((s) => s.data.filter((v) => v !== null));
  return Math.floor(Math.min(...all) / 10) * 10;
});
const yMax = computed(() => {
  const all = chartMeta.value.series.flatMap((s) => s.data.filter((v) => v !== null));
  return Math.ceil(Math.max(...all) / 10) * 10;
});
const axisLabel = {
  color: 'rgba(17, 25, 30, 0.40)',
  fontFamily: 'Montserrat',
  fontSize: 8,
  fontWeight: 600,
  lineHeight: 14
};

const chartOptions = computed(() => ({
  grid: { left: 40, right: 20, top: 40, bottom: 40 },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      const time = params[0].axisValue;
      let result = `<div style="font-weight:bold; font-size:10px;line-height: 14px; display:flex;font-family: Montserrat; justify-content: center;">${time}</div>`;

      params.forEach((param) => {
        result += `<div style="display:flex;align-items:center;justify-content:space-between;margin:5px 0;">
                    <div style="display:flex;align-items:center;">
                    <span style="width:8px;height:8px;border-radius:50%;background-color:#fff;border:2px solid ${param.borderColor};margin-right:8px;"></span>
                    <span style="font-size:10px;line-height: 14px">${param.seriesName}</span>
                    </div>
                    <span style="font-weight:bold;font-size:12px;line-height: 16px;padding-left:8px;">${param.value}</span>
                </div>`;
      });
      return result;
    }
  },
  legend: {
    data: chartMeta.value.series.map((s) => s.name),
    top: 10,
    left: 'center',
    textStyle: { color: '#F56C6C', fontWeight: 500 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: chartMeta.value.xAxis,
    axisLabel: { ...axisLabel },
    axisLine: { lineStyle: { color: 'rgba(17, 25, 30, 0.40)' } }
  },
  yAxis: {
    type: 'value',
    min: yMin.value,
    max: yMax.value,
    interval: (yMax.value - yMin.value) / 4,
    axisLabel: { formatter: '{value}', ...axisLabel },
    name: 'μg/m³',
    nameTextStyle: { fontFamily: 'Montserrat', fontWeight: 600, fontSize: 14, align: 'left', padding: [0, 0, 0, -30], color: '#11191E' },
    splitLine: { lineStyle: { color: '#eee' } }
  },
  series: chartMeta.value.series.map((s, i) => ({
    name: s.name,
    type: 'line',
    data: s.data,
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: { color: '#F56C6C', width: 3, type: i === 1 ? 'dashed' : 'solid' },
    itemStyle: { color: '#fff', borderColor: '#F56C6C', borderWidth: 2 },
    emphasis: { focus: 'series' },
    z: 2 - i
  }))
}));

const renderCo2Chart = () => {
  if (!chartRef.value) return;
  if (!co2ChartInstance) {
    co2ChartInstance = echarts.init(chartRef.value);
  }
  co2ChartInstance.setOption(chartOptions.value);
};

function resizeCo2Chart() {
  if (co2ChartInstance) {
    co2ChartInstance.resize();
  }
}

// 添加防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

// 使用防抖处理resize
const debouncedResize = debounce(resizeCo2Chart, 100);

// ResizeObserver实例
let resizeObserver = null;

// 工具函数
const convertDataToSVGPath = (arr, width = 100, height = 30) => {
  if (!arr || arr.length === 0) return '';
  const n = arr.length;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  // 归一化到SVG高度（反向，因为SVG y轴向下）
  const norm = arr.map((v) => height - ((v - min) / (max - min || 1)) * height);
  const step = width / (n - 1);

  let d = `M0,${norm[0]}`;
  for (let i = 1; i < n; i++) {
    // 贝塞尔平滑
    const x1 = (i - 1) * step;
    const y1 = norm[i - 1];
    const x2 = i * step;
    const y2 = norm[i];
    const cx = x1 + step / 2;
    d += ` Q${cx},${y1} ${x2},${y2}`;
  }
  return d;
};

const fetchData = async () => { 
  // 三个请求 一起发送， promise all
  const [list, effectiveness, statistics] = await Promise.all([
    getTemplatePerformance(props.id), 
    getTemplateEffectiveness({
      templateId: props.id,
      zoneId: props.zoneId,
      dataType: 'co2',
      hours: 24
    }), 
    getTemplateStatistics(props.id)]);

  console.log(list, effectiveness, statistics);
  setMetrics(statistics.data);
  setTables(list.data?.historyModels || []);
  setChart(effectiveness.data);

  notes.value = list.data?.notes;
  photos.value = list.data?.photosUrls;
  materialTags.value = props.metricTypes;

  console.log(props.metricTypes, 'metricTypes')
  
};

const setChart = (data) => { 
  const xAixs = [];
  for(let d of data.axisListX) {
    xAixs.push(useUtils.formatDateValue(new Date(d)))
  }
  const yAixs = data.axisListY;

  chartMeta.value = {
    xAxis: xAixs,
    series: [
      { name: yAixs[0].name, data: yAixs[0].data },
       { name: yAixs[1].name, data: yAixs[1].data }
    ]
  }
};

const setMetrics = (list) => { 
  metrics.value = [
    {
      title: 'Duration',
      value: list.duration || '--'
      // description: '16min Faster Than Average'
    },
    {
      title: 'Labor Cost',
      value: list.laborCost != null ? `$ ${list.laborCost}` : '--'
      // description: '$12.30 Less Than Average'
    },
    {
      title: 'Material Cost',
      value: list.materialCost != null ? `$ ${list.materialCost}` : '--'
      // description: '$5.00 More Premium Filters'
    }
  ]
};
const setTables = (data) => { 
  tableData.value = data.map((item) => ({
    completion: useUtils.formatDateValue(new Date(item.completionDate)),
    assignee: item.assignee,
    duration: item.duration,
    quality: item.qualityScore,
    efficiency: item.efficiencyScore
  }))
};

const updateChart = () => {
  nextTick(() => {
    renderCo2Chart();
    if (window.ResizeObserver && chartRef.value) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(chartRef.value);
    }

    // 保留window resize事件监听作为后备方案
    window.addEventListener('resize', debouncedResize);
  });
};

const disposeChart = () => {
  window.removeEventListener('resize', debouncedResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (co2ChartInstance) {
    co2ChartInstance.dispose();
    co2ChartInstance = null;
  }
};

onMounted(async () => {
  await fetchData();
  updateChart();
});

onBeforeUnmount(() => {
  disposeChart();
});

onBeforeUnmount(() => {
  if (co2ChartInstance) {
    co2ChartInstance.dispose();
    co2ChartInstance = null;
  }
  window.removeEventListener('resize', resizeCo2Chart);
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.performance-dialog :deep(.el-dialog__header) {
  padding: 16px 24px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

.performance-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
}

.performance-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.performance-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

.performance-content {
  padding: 0;
}

.section {
  padding: 20px 24px;
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  color: var(--VI-text-B12, #11191e);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: -0.144px;
  margin-bottom: 24px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #606266;
}

.subsection-label {
  color: var(--VI-text-B12, #11191e);
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  width: 100px;
  margin-right: 8px;
}

/* 标签页按钮样式 */
.tab-buttons {
  display: flex;
  margin-bottom: 24px;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid #dcdfe6;

  .el-button {
    &.active {
      color: white;
      z-index: 1;
      border-radius: 4px;
      background: var(--layout-bg_focus, #09f);
      box-shadow:
        0px 10px 15px -3px rgba(0, 153, 255, 0.4),
        0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1)),
        0px 8px 10px rgba(0, 153, 255, 0.25);

      &::before {
        display: none;
      }

      & + .el-button::before {
        display: none;
      }
    }
  }
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background-color: #f5f7fa;
  color: #606266;
  margin: 0;
  border-radius: 0;
}

.tab-button.active {
  background-color: #409eff;
  color: white;
}

/* 指标卡片网格 */
.metrics-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.metric-card {
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
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
}

.metric-value {
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: 34px;
  margin-bottom: 6px;
}

.metric-title {
  color: var(--VI-text-B12, #11191e);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  margin-bottom: 4px;
}

.metric-description {
  color: var(--VI-text-B49, #71797e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.section-subtitle {
  color: var(--VI-text-B12, #11191e);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
}

/* 筛选器行 */
.filter-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
}

.filter-text {
  font-size: 14px;
  color: #606266;
}

.filter-selects {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}

.filter-select {
  width: 180px;
}

/* 效率表格 */
.effectiveness-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #606266;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
}

.table-row:last-child {
  border-bottom: none;
}

.header-cell,
.cell {
  padding: 12px 2px;
  display: flex;
  align-items: center;
  width: 100%;
}

.completion {
  width: 15%;
}

:deep(.el-table) {
  .cell {
    padding: 0 8px;
  }
}

.assignee {
  width: 20%;
}

.duration {
  width: 10%;
}

.air-quality,
.co2-level {
  width: 20%;
}

.effectiveness {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  display: flex;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 100px;
}

.assignee-name {
  color: var(--VI-text-B12, #11191e);
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
}

.assignee-role {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  color: $color-blue;
}

.trend-line {
  width: 100px;
  height: 30px;
  margin-right: 8px;
}

.trend-svg {
  width: 100%;
  height: 100%;
}

.percentage {
  color: var(--VI-text-B12, #11191e);
  text-align: right;
  font-size: 8px;
  font-style: normal;
  font-weight: 600;
  line-height: 14px;
}

.effectiveness.high {
  @extend.clean-critical;
  text-align: center;
}

.effectiveness.medium {
  @extend.clean-warning;
  text-align: center;
}

.effectiveness.low {
  @extend.clean-normal;
  text-align: center;
}

/* 前后指标对比 */
.metrics-description {
  color: #11191e;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  margin-bottom: 16px;
}

.co2-comparison {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 16px 24px;
  position: relative;
}

.before-after-values {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.before-value,
.after-value {
  display: flex;
  align-items: center;
}

.before-value .value {
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: 34px;
  color: $color-orange;
  margin-right: 8px;
}

.after-value .value {
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: 34px;
  color: $color-green;
  margin-right: 8px;
}

.before-value .label,
.after-value .label {
  border-radius: 100px;
  background: var(--VI-text-B12, #11191e);
  display: flex;
  padding: 0px 8px;
  align-items: center;
  color: var(--layout-bg_Panel, #fff);
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
}

.metric-label {
  color: var(--VI-text-B12, #11191e);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  margin: 8px 0 12px 0;
}

.improvement {
  color: var(--VI-text-B49, #71797e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.improvement-percentage {
  position: absolute;
  right: 16px;
  top: 88px;
}

.improvement-percentage .percentage {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
  background-color: rgba(103, 194, 58, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.co2-chart {
  margin-top: 16px;
}

.chart-container {
  position: relative;
  height: 150px;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.subsection-img {
  display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;

    .photo-item {
      position: relative;
      width: 100px;
      height: 100px;

      .photo-preview {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 1px dashed #d3dbe0;
        background-color: #f7fafd;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .empty-photo {
          width: 100%;
          height: 100%;
          background-color: #f7fafd;
        }
      }
    }
}

/* 材料和备注 */
.materials-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;

  :deep(.el-select__wrapper) {
    width: 100% !important;
  }
}

.material-select {
  flex: 2;
}

.quantity-input {
  flex: 1;
}

.unit-label {
  margin-left: -4px;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.add-material-btn {
  flex: 2;
  margin-left: 120px;
  margin-bottom: 20px;
}

.materials-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  .deficiency-tag {
    display: flex;
    height: 28px;
    padding: 0px 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 100px;
    border-color: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
    background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
    color: $color-blue;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;

    :deep(svg) {
      color: $color-blue;
    }
  }
}

.material-tag {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.remove-icon {
  margin-left: 6px;
  font-size: 12px;
  cursor: pointer;
}

.notes-textarea {
  margin-bottom: 16px;
}

.image-upload {
  display: flex;
  gap: 12px;
}

.uploaded-image {
  width: 80px;
  height: 80px;
  background-color: #f5f7fa;
  border-radius: 4px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: $color-red;
  color: white;
  border-radius: 50%;
  padding: 2px;
  font-size: 12px;
  cursor: pointer;
}

:deep(.el-select__wrapper) {
  width: 200px !important;
}


</style>
