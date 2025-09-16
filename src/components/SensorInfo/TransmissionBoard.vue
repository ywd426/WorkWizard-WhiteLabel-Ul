<template>
  <el-row :gutter="20" style="width: 100%">
    <el-col v-for="detail in sensorList" :key="detail.sensorId" :span="6">
      <el-row class="box-card" :class="detail.status == '3' ? 'disabled-overlay' : ''">
        <el-col :span="24">
          <span class="font-item-b69">ID:{{ detail.sensorId }}</span>
        </el-col>
        <el-col :span="24" class="item-title">
          <span class="font-item-b12 line" v-auto-tooltip="detail.sensorName">{{ detail.sensorName }}</span>

          <div class="custom-ranking" :class="useUtils.operateFormat(detail.statusValue)">
            <span>{{ detail.statusValue }}</span>
          </div>
        </el-col>
        <el-row>
          <el-col :span="24" style="display: flex; align-items: center; justify-content: space-between">
            <span class="task-name">{{ detail.equipmentName }}</span>
          </el-col>
          <el-col v-if="detail.location" :span="24" style="display: flex; align-items: center; justify-content: space-between">
            <span class="font-item-b69 line" v-auto-tooltip="detail.location">{{ detail.location }}</span>
            <svg-icon icon-class="map" />
          </el-col>
          <ElDivider />
          <el-col :span="24" class="power-module">
            <el-col :span="24" class="detail-row">
              <span class="font-item-b49">Last Data Received</span>
              <span class="font-item-value">{{ useUtils.formatDate(detail.lastDate) }}</span>
            </el-col>
            <el-col :span="24" class="detail-row">
              <span class="font-item-b49">Hours Since Last Data</span>
              <span class="font-item-value">{{ useUtils.getSinceLastData(detail.lastDate) }}</span>
            </el-col>
          </el-col>
        </el-row>
      </el-row>
    </el-col>
  </el-row>
</template>
<script setup name="robotBoard" lang="ts">
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { ElDivider } from 'element-plus';
import { SensorForm as ElSensorForm } from '@/api/monitor/sensormanage/types';
interface SensorForm extends ElSensorForm {
  power?: number;
}
const sensorList = ref<SensorForm[]>([]);

const total = ref(0);
const initData = (nums: number, list: SensorForm[]) => {
  sensorList.value = list;
  total.value = nums;
};
onMounted(() => {});

defineExpose({
  initData
});
</script>
<style scoped>
.box-card {
  border-radius: 8px;
  border: 1px solid var(--el-base-border-color);
  background: var(--baseBackground);
  padding: 16px;
  margin-bottom: 12px;
  .item-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 34px;
  }
  .line {
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .task-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    color: var(--el-text-color-b49);
  }
  .custom-ranking {
    margin-left: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    line-height: 16px;
    font-size: 12px;
  }
}
.box-card.disabled-overlay {
  background-color: var(--board-disabled-bg);
}
.power-disabled {
  color: var(--el-text-color-b69);
}
.font-item-b69 {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-b69);
}
.font-item-b49 {
  color: var(--el-text-color-b49);
}
.font-item-b12 {
  font-weight: 600;
  font-size: 20px;
  color: var(--el-text-color-b12);
}
.detail-row {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
}
.font-item-value {
  color: var(--el-text-color-b12);
}
.font-item-button {
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-b12);
  margin-right: 8px;
}
.power-module {
  padding: 8px 8px 0px 8px;
}
::v-deep(.right-power .el-progress__text) {
  min-width: unset;
}
:deep(.el-divider--horizontal) {
  margin: 8px 0;
}
</style>
