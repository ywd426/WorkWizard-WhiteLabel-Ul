<template>
  <div class="chart-edit">
    <LeftOptions ref="leftOptionForm" class="chart-edit-left" @preview="preview" @change-sensor="changeSensor"></LeftOptions>
    <div class="chart-preview">
      <div class="chart-type">
        <div
          :class="{ tab: true, active: tabActive[0] }"
          @click="clickToggle(0)"
          @mouseover.stop="() => hoverToggle(true, 0)"
          @mouseleave="() => hoverToggle(false, 0)"
        >
          <div class="tab-logo">
            <Icon :class="{ hover: tabHover[0], active: tabActive[0] }" type="scatter" />
          </div>
          <div class="tab-text">Scatter plot</div>
        </div>
        <div
          :class="{ tab: true, active: tabActive[1] }"
          @click="clickToggle(1)"
          @mouseover.stop="() => hoverToggle(true, 1)"
          @mouseleave.stop="() => hoverToggle(false, 1)"
        >
          <div class="tab-logo">
            <Icon :class="{ hover: tabHover[1], active: tabActive[1] }" type="foldingLine" />
          </div>
          <div class="tab-text">Line chart</div>
        </div>
        <div
          :class="{ tab: true, active: tabActive[2] }"
          @click="clickToggle(2)"
          @mouseover.stop="() => hoverToggle(true, 2)"
          @mouseleave.stop="() => hoverToggle(false, 2)"
        >
          <div class="tab-logo">
            <Icon :class="{ hover: tabHover[2], active: tabActive[2] }" type="bar" />
          </div>
          <div class="tab-text">Bar chart</div>
        </div>
      </div>
      <div class="chart">
        <FoldingLineChart ref="mainChart" :config="config" />
      </div>
      <div class="btn-group">
        <el-button class="cancel" plain @click="preview">Preview</el-button>
        <el-button class="cancel" plain @click="close()">Cancel</el-button>
        <el-button type="primary" @click="save()">Save</el-button>
      </div>
    </div>
    <RightOptions ref="rightOptionForm" class="chart-edit-right"></RightOptions>
  </div>
</template>

<script lang="ts" setup>
import EmptyData from '../InitData/EmptyData';
import { FoldingLineRequestType } from '../Option';
import { getChartInfo, previewChart, addSensorChart, editSensorChart, getPartChartInfo } from '@/api/monitor/chartinfo';
interface Props {
  config?: {
    id: string;
    chartOptions: FoldingLineRequestType;
    showMenu: boolean;
  };
  sensorConfig?: {
    sensorId: string;
    dataType: string;
  };
  dashboardStatus?: boolean;
}
const mainChart = ref(null);
const props = defineProps<Props>();
const emit = defineEmits(['close', 'save']);

const leftOptionForm = ref(null);

const rightOptionForm = ref(null);

//0:散点图 1：线型图 2:柱状图
const chartType = ref(1);

const config = reactive({
  chartOptions: props.config?.chartOptions ?? EmptyData,
  showMenu: false
});
const isAdd = ref(!props.config);

// tab
const tabHover = ref([false, false, false]);
const tabActive = ref([false, true, false]);
const hoverToggle = (res: boolean, index: number) => {
  tabHover.value[index] = res;
};
const clickToggle = (index: number) => {
  if (tabActive.value[index]) {
    return;
  }
  tabActive.value = [false, false, false];
  tabActive.value[index] = true;
  chartType.value = index;
};
// 关闭
const close = () => emit('close');
// 保存
const save = () => {
  let submitJson = Object.assign(
    leftOptionForm.value.ruleForm,
    rightOptionForm.value.ruleForm,
    { 'chartType': chartType.value },
    { 'dashboardStatus': props.dashboardStatus },
    { 'dataType': rightOptionForm.value.ruleForm.dataType }
  );
  if (isAdd.value) {
    addSensorChart(submitJson).then((res) => {
      emit('save', res.data);
    });
  } else {
    editSensorChart(Object.assign(submitJson, { 'id': props.config.id })).then((res) => {
      emit('save');
    });
  }
};
// preview
const preview = (data: any) => {
  let submitJson = Object.assign(
    leftOptionForm.value.ruleForm,
    rightOptionForm.value.ruleForm,
    { 'chartType': chartType.value },
    { 'dataType': rightOptionForm.value.ruleForm.dataType }
  );
  previewChart(submitJson).then((res) => {
    mainChart.value.previewChart(res.data.location, res.data.chartOptions);
  });
};
const changeSensor = (sensor: any) => {
  // data为leftOption
  if (sensor.length == 3) {
    rightOptionForm.value.queryDataTypeList(sensor[2]);
  }
};
const refresh = () => {
  //根据id重新获取chart数据
  getChartInfo(props.config.id).then((res) => {
    const { location, chartOptions } = res.data;
    mainChart.value.previewChart(location, chartOptions);
  });
};
const initChartData = () => {
  leftOptionForm.value.isEdit = true;
  rightOptionForm.value.isEdit = true;
  getChartInfo(props.config.id).then((res) => {
    chartType.value = res.data.chartType;
    tabActive.value = [false, false, false];
    tabActive.value[chartType.value] = true;
    leftOptionForm.value.ruleForm.sensorId = res.data.sensorId;
    leftOptionForm.value.ruleForm.sensor = res.data.sensorName;
    leftOptionForm.value.ruleForm.building = res.data.building;
    if (res.data.project) {
      leftOptionForm.value.ruleForm.project = res.data.project;
      leftOptionForm.value.ruleForm.company = res.data.company;
    }

    rightOptionForm.value.initDataTypeList(res.data.dataType, res.data.dataName);
    rightOptionForm.value.ruleForm.rangeType = res.data.rangeType;
    rightOptionForm.value.ruleForm.timeRange = res.data.timeRange;
    rightOptionForm.value.ruleForm.location = res.data.location;
    rightOptionForm.value.ruleForm.title = res.data.title;
    rightOptionForm.value.ruleForm.chartUnit = res.data.chartUnit;
  });
};
const initInfoData = () => {
  leftOptionForm.value.isEdit = true;
  rightOptionForm.value.isEdit = true;
  getPartChartInfo(props.sensorConfig.sensorId, props.sensorConfig.dataType).then((res) => {
    leftOptionForm.value.ruleForm.sensorId = res.data.sensorId;
    leftOptionForm.value.ruleForm.sensor = res.data.sensorName;
    leftOptionForm.value.ruleForm.building = res.data.building;
    if (res.data.project) {
      leftOptionForm.value.ruleForm.project = res.data.project;
      leftOptionForm.value.ruleForm.company = res.data.company;
    }
    rightOptionForm.value.initDataTypeList(res.data.dataType, res.data.dataName);
    rightOptionForm.value.ruleForm.location = res.data.location;
    rightOptionForm.value.ruleForm.chartUnit = res.data.chartUnit;
    rightOptionForm.value.ruleForm.title = res.data.dataName;
  });
};
onMounted(async () => {
  await nextTick(() => {
    if (!isAdd.value) {
      initChartData();
    } else if (props.sensorConfig) {
      initInfoData();
    }
  });
});
defineExpose({
  refresh
});
</script>

<style lang="scss" scoped>
.chart-edit {
  display: flex;
  height: 100%;
  background: var(--el-base-border-color);
  overflow: hidden;
  border-radius: 10px;

  .chart-edit-left,
  .chart-edit-right {
    flex: 1;
    overflow: hidden;
  }

  .cancel {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-base-border-color);

    &:hover {
      opacity: 0.7;
    }
  }
  :deep(.el-button) {
    width: 6rem;
    height: 2.5rem;
  }
}
.chart-preview {
  flex: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .chart-type {
    height: 15%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    min-height: 95px;

    .tab {
      width: 20%;
      height: 70%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--baseBackground);
      opacity: 0.9;
      box-shadow: var(--el-box-shadow-light);

      &:hover,
      &.active {
        box-shadow: none;
        color: var(--el-color-primary);

        :deep(.icon) {
          color: var(--el-color-primary);
        }
      }
    }
  }
  .btn-group {
    height: 15%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .chart {
    flex: 1;
    padding: 2%;
  }
}
</style>
