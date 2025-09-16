<template>
  <el-row class="form-row">
    <span>Rule Summary</span>
  </el-row>
  <el-row style="margin-bottom: 24px">
    <span class="text-400">
      This rule was triggered because at least one sensor's pre-set conditions were met during the operation. Below are the details for each sensor
      monitored.
    </span>
  </el-row>
  <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item v-for="(item, index) in sensorDetails" :key="index" :name="item.id" class="col-item">
      <template #title>
        <el-row class="trigger-title"><span>Sensor: </span>{{ item.sensorName }}<span>-</span>{{ item.dataType }}</el-row>
        <el-row class="text-400 alert-exceeded" style="margin-left: 16px">{{ useUtils.alertTypeFormat(item.alarmType) }}</el-row>
      </template>
      <template #icon="{ isActive }">
        <svg-icon :icon-class="isActive ? 'collapse-down' : 'collapse-up'" class-name="icon-ele" />
      </template>
      <el-col :span="24" class="logic-row">
        <el-row class="trigger-title">Trigger Logic</el-row>
        <el-col :span="24" style="margin-top: 16px">
          <el-row class="text-400" style="display: flex; align-items: center">
            <span>Sensor&nbsp;&nbsp;</span>
            <span class="text-600">{{ item.sensorId }}</span>
            <span>&nbsp;&nbsp;'s pre-set conditions of temperature were met on&nbsp;&nbsp;</span>
            <span class="text-600">{{ useUtils.formatDate(item.endTimestamp) }}</span>
            <span>&nbsp;&nbsp;,contributing to the rule trigger.</span>
          </el-row>
          <el-row class="text-400" style="display: flex; align-items: center; margin-top: 8px">
            <span>Temperature's conditions are configured to be met when readings&nbsp;&nbsp;</span>
            <span class="text-600">exceed thresholds</span>
            <span>&nbsp;&nbsp;for&nbsp;&nbsp;</span>
            <span class="text-600">0 minutes</span>
            <span>&nbsp;&nbsp;,if this occurs&nbsp;&nbsp;</span>
            <span class="text-600">1 time</span>
            <span>&nbsp;&nbsp;within&nbsp;&nbsp;</span>
            <span class="text-600">24 hours</span>
            <span>&nbsp;&nbsp;.</span>
          </el-row>
        </el-col>
      </el-col>
      <el-row style="margin-top: 16px" :gutter="10">
        <el-col :span="12">
          <el-row class="card-bg" style="padding: 11px 12px">
            <svg-icon icon-class="trigger_up" class-name="icon-class" />
            <div style="flex: 1; margin-left: 24px">
              <el-row
                ><span class="bold-700 text-main">{{ item.upperThreshold }} {{ item.unit == 'None' ? '' : item.unit }}</span></el-row
              >
              <el-row style="width: 100%; display: flex; justify-content: space-between">
                <span class="text-400">Upper Limit</span>
                <span class="text-600" :class="item.alarmType == 'low' ? 'alert-not-exceeded' : 'alert-exceeded'">{{
                  item.alarmType == 'low' ? 'Not Exceeded' : 'Exceeded'
                }}</span>
              </el-row>
            </div>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row class="card-bg" style="padding: 11px 12px">
            <svg-icon icon-class="trigger_down" class-name="icon-class" />
            <div style="flex: 1; margin-left: 24px">
              <el-row
                ><span class="bold-700 text-main">{{ item.lowerThreshold }} {{ item.unit == 'None' ? '' : item.unit }}</span></el-row
              >
              <el-row style="width: 100%; display: flex; justify-content: space-between">
                <span class="text-400">Lower Limit</span>
                <span class="text-600" :class="item.alarmType == 'high' ? 'alert-not-exceeded' : 'alert-exceeded'">{{
                  item.alarmType == 'high' ? 'Not Exceeded' : 'Exceeded'
                }}</span>
              </el-row>
            </div>
          </el-row>
        </el-col>
      </el-row>
      <el-row style="margin-top: 24px">
        <el-col :span="24">
          <el-text size="large" class="main-header-h7 alarm-subtitle">How This Sensor Triggered The Alert</el-text>
        </el-col>
      </el-row>
      <el-row style="margin-top: 16px; margin-bottom: 24px" :gutter="8">
        <el-col :span="12">
          <el-row style="padding: 12px 24px" class="card-bg">
            <el-col :span="24" style="display: flex; justify-content: space-between">
              <span class="big-600">{{ item.maxDuration }} {{ item.durationUnit === 'm' ? 'minutes' : 'hours' }}</span>
              <svg-icon icon-class="trigger-max" class-name="icon-class" />
            </el-col>
            <el-col :span="24" style="padding: 6px 0px">
              <el-row><span class="text-600">Maximum Duration</span></el-row>
              <el-row><span class="small-400 text-desc">Threshold exceeded</span></el-row>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row style="padding: 12px 24px" class="card-bg">
            <el-col :span="24" style="display: flex; justify-content: space-between">
              <span class="big-600">{{ item.minDuration }} {{ item.durationUnit === 'm' ? 'minutes' : 'hours' }}</span>
              <svg-icon icon-class="trigger-min" class-name="icon-class" />
            </el-col>
            <el-col :span="24" style="padding: 6px 0px">
              <el-row><span class="text-600">Minimum Duration</span></el-row>
              <el-row><span class="small-400 text-desc">Threshold exceeded</span></el-row>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" style="margin-top: 8px">
          <el-row style="padding: 12px 24px" class="card-bg">
            <el-col :span="24" style="display: flex; justify-content: space-between">
              <span class="big-600">{{ item.avgDuration }} {{ item.durationUnit === 'm' ? 'minutes' : 'hours' }}</span>
              <svg-icon icon-class="trigger-avg" class-name="icon-class" />
            </el-col>
            <el-col :span="24" style="padding: 6px 0px">
              <el-row><span class="text-600">Average Duration</span></el-row>
              <el-row><span class="small-400 text-desc">Threshold exceeded</span></el-row>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" style="margin-top: 8px">
          <el-row style="padding: 12px 24px" class="card-bg">
            <el-col :span="24" style="display: flex; justify-content: space-between">
              <span class="big-600">{{ item.frequency }} times</span>
              <svg-icon icon-class="trigger-times" class-name="icon-class" />
            </el-col>
            <el-col :span="24" style="padding: 6px 0px">
              <el-row><span class="text-600">Occurrences</span></el-row>
              <el-row><span class="small-400 text-desc">Within 24 hours</span></el-row>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <div v-for="(item, index) in sensorDetails" :key="index"></div>
</template>
<script lang="ts" setup>
import { ruleTriggerDetail } from '@/api/maintenance/deviceLogbook/automaticLog';
import { ruleReportTriggerDetail } from '@/api/maintenance/faultReporting/automaticFaults';
import * as useUtils from '@/utils/index';
import { propTypes } from '@/utils/propTypes';
const props = defineProps({
  id: propTypes.string.def(''),
  category: propTypes.string.def('log')
});
const sensorDetails = ref<TriggerDetailForm[]>([]);
interface TriggerDetailForm {
  id: string;
  sensorId: string;
  severity: string;
  startTimestamp: string;
  endTimestamp: string;
  minDuration: string;
  maxDuration: string;
  avgDuration: string;
  frequency: string;
  unit: string;
  status: string;
  durationUnit: string;
  resolvedStatus: string;
  sensorName: string;
  alarmType: string;
  upperThreshold: string;
  lowerThreshold: string;
  dataType: string;
  maxDeviationFromNormal: number;
  minDeviationFromNormal: number;
}

const activeNames = ref();

// 初始化传感器详情列表
const initSensorDetails = async () => {
  sensorDetails.value = [];
  if (props.category == 'log') {
    await ruleTriggerDetail(props.id).then((res) => {
      sensorDetails.value = res.data;
    });
  } else {
    await ruleReportTriggerDetail(props.id).then((res) => {
      sensorDetails.value = res.data;
    });
  }
};
const handleChange = () => {};
onMounted(async () => {
  if (props.id) {
    initSensorDetails();
  }
});

defineExpose({
  sensorDetails
});
</script>
<style lang="scss" scoped>
.form-row {
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  height: 60px;
  display: flex;
  align-items: center;
}
.trigger-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}
.text-600 {
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
}
.text-400 {
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
}
.big-600 {
  font-weight: 600;
  font-size: 28px;
  line-height: 34px;
}
.small-400 {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
}
.icon-ele {
  width: 24px;
  height: 24px;
  margin: 0 0 0 auto;
}
.col-item {
  border-radius: 16px;
  padding: 0 24px;
  background: var(--el-card-primary-flat05);
}
.logic-row {
  border-radius: 16px;
  border: 1px solid var(--el-base-border-color);
  padding: 16px;
  background: var(--baseBackground);
}
.el-collapse {
  border: 1px solid var(--el-base-border-color);
  border-radius: 16px;
  margin-bottom: 8px;
}

::v-deep(.el-collapse-item__header) {
  background-color: unset;
}
::v-deep(.el-collapse-item__wrap) {
  background-color: unset;
  border: unset;
}
::v-deep(.el-collapse-item__content) {
  padding: 0;
}
.icon-class {
  width: 40px;
  height: 40px;
}
.card-bg {
  box-sizing: border-box;
  background: var(--el-card-primary-flat10);
  border: 1px solid var(--el-card-primary-flat20);
  border-radius: 8px;
}
.alert-exceeded {
  color: rgba(255, 56, 76, 1);
  background: rgba(255, 56, 76, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
}
.alert-not-exceeded {
  color: rgba(17, 25, 30, 1);
  background: rgba(17, 25, 30, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
}
</style>
