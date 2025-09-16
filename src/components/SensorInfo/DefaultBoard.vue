<template>
  <el-row id="default-board-card" v-loading="cardLoading" v-if="showCard" :gutter="singleMode ? 24 : 20" :style="{
    width: '100%', 
    margin: singleMode ? '0px' : '0 -12px'
  }">
    <el-col v-for="item in detailForm" :key="item.name" :span="singleMode ? 24 : 6">
      <el-row>
        <el-col v-for="detail in getDetailList(item.name)" :key="detail.sensorId" :span="24">
          <el-row class="box-card" :class="detail.status == '3' ? 'disabled-overlay' : ''">
            <div class="w-full flex justify-between">
              <span class="font-item-b69">ID:{{ detail.sensorId }}</span>
              <el-icon v-if="singleMode" class="cursor-pointer" @click="showCard = !showCard"><Close /></el-icon>
            </div>
            <el-col :span="24" class="item-title">
              <span class="font-item-b12 line" v-tooltip="detail.sensorName">{{ detail.sensorName }}</span>

              <div class="custom-ranking" :class="useUtils.operateFormat(detail.statusValue)">
                <span>{{ detail.statusValue }}</span>
              </div>
            </el-col>
            <el-col :span="24" class="right-power">
              <el-progress
                type="circle"
                :percentage="detail.power"
                status="success"
                :color="useUtils.getActiveColor(detail.status == '3' ? undefined : detail.power)"
                :width="18"
                :stroke-width="3"
              >
                <svg-icon icon-class="lightning" class-name="light-icon" />
              </el-progress>
              <span :style="{ 'color': useUtils.getActiveColor(detail.status == '3' ? undefined : detail.power) }"
                >{{ detail.status == '3' ? '--' : detail.power }}%</span
              >
            </el-col>
            <el-row style="padding: 8px 0; width: 100%">
              <el-col :span="24" style="display: flex; align-items: center; justify-content: space-between">
                <span class="task-name">{{ detail.equipmentName }}</span>
              </el-col>
              <el-col v-if="detail.location" :span="24" style="display: flex; align-items: center; justify-content: space-between">
                <span class="font-item-b69 line" v-tooltip="detail.location">{{ detail.location }}</span>
                <svg-icon :icon-class="detail.status == '3' ? 'map_disabled' : 'map'" />
              </el-col>
              <ElDivider />
              <slot name='customArea'></slot>
              <el-col :span="24" class="button-row">
                <div style="display: flex; align-items: center" :class="{'hideRefresh': !props.showRefresh}">
                  <el-button
                    class="show-reading"
                    :class="detail.showReading ? 'black' : 'white'"
                    :disabled="detail.status == '3'"
                    @click="showReading(detail.sensorId)"
                  >
                    <div class="button-row">
                      <span class="font-item-button">{{ detail.showReading ? 'Hide' : 'Show All' }}</span>
                      <svg-icon :icon-class="detail.showReading ? 'map-up-floor-disable' : 'map-down-floor-disable'" />
                    </div>
                  </el-button>
                  <el-tooltip placement="top" :content="viewTooltip">
                    <el-button class="circle" :disabled="detail.status == '3'" @click="handleRowClick(detail.sensorId)">
                      <svg-icon icon-class="eye-open" />
                    </el-button>
                  </el-tooltip>
                </div>
                <div v-if="detail.showReading && props.showRefresh" style="display: flex; align-items: center">
                  <span class="font-record-time" v-if="detail.detailList.length > 0 && detail.detailList[0].recordTime">
                    Last:{{ detail.detailList.length > 0 ? useUtils.formatDate(detail.detailList[0].recordTime) : '' }}
                  </span>
                  <el-tooltip placement="top" content="Refresh">
                    <el-button class="circle" :disabled="detail.status == '3'" @click="refreshReadingClick(detail.sensorId)">
                      <svg-icon icon-class="refresh_reading" />
                    </el-button>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col v-if="detail.showReading" :span="24" :class="getIconColor(detail.status)">
                <div v-for="detailItem in detail.detailList" :key="detailItem.name" class="detail-row">
                  <div class="detail-name-row">
                    <svg-icon :icon-class="detailItem.icon" class-name="icon-item" :style="{ 'color': detailItem.color }" />
                    <span class="font-item-b49">{{ detailItem.name }}</span>
                  </div>
                  <span class="font-item-value">{{ detailItem.value }}</span>
                </div>
              </el-col>
            </el-row>
          </el-row>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script setup name="robotBoard" lang="ts">
import * as useUtils from '@/utils/index';
interface DataTypeModel {
  code: string;
  name: string;
  icon: string;
  value: string;
  recordTime?: string;
  color?: string;
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { ElDivider } from 'element-plus';
import { SensorForm as ElSensorForm } from '@/api/monitor/sensormanage/types';
import { currentReadingList } from '@/api/monitor/sensordetail';
interface SensorForm extends ElSensorForm {
  detailList?: DataTypeModel[];
  showReading: boolean;
  columnName: number;
}
interface TitleForm {
  name: number;
  total: number;
  color: string;
}
const sensorList = ref<SensorForm[]>([]);
const total = ref(0);
const cardLoading = ref(false);
const showCard = ref(true);
const detailList = ref([]);
const props = defineProps({
  detailForm: {
    type: Array as PropType<TitleForm[]>,
    default: () => [
      { name: 0, total: 1, color: '' },
      { name: 1, total: 1, color: '' },
      { name: 2, total: 1, color: '' },
      { name: 3, total: 1, color: '' }
    ]
  },
  singleMode: {
    type: Boolean,
    default: false
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  viewTooltip: {
    type: String,
    default: 'Sensor Detail'
  }
})

const showReading = async (sensorId: string) => {

   //赋值到sensorList中
  const sensor = sensorList.value.find((item) => item.sensorId === sensorId);
  if (sensor) {
    if(detailList.value.length > 0) {
      sensor.detailList = detailList.value;
      sensor.showReading = !sensor.showReading;
      return;
    }
    if (sensor.showReading) {
      sensor.showReading = false;
      return;
    }
    if (!sensor.detailList) {
      cardLoading.value = true;
      //加载实时读数
      await currentReadingList(sensorId).then((res) => {
        sensor.detailList = res.data;
      });
      cardLoading.value = false;
    }
    sensor.showReading = true;
  }
};
const refreshReadingClick = async (sensorId: string) => {
  const sensor = sensorList.value.find((item) => item.sensorId === sensorId);
  if (sensor) {
    if (sensor.showReading) {
      proxy?.$modal.loading('Loading...');
      //加载实时读数
      await currentReadingList(sensorId).then((res) => {
        sensor.detailList = res.data;
      });
      proxy?.$modal.closeLoading();
    }
  }
};
const getDetailList = (num: number) => {
  return sensorList.value.filter((item) => item.columnName == num);
};
const handleRowClick = (sensorId: string) => {
  proxy.$router.push({
    path: `/monitor/detail/index`,
    query: {
      sensorId: sensorId
    }
  });
};
const initData = (nums: number, list: SensorForm[], detailListData?: []) => {
  sensorList.value = list;
  sensorList.value.forEach((sensor, index) => {
    sensor.columnName = index % 4;
  });
  total.value = nums;
  showCard.value = true;
  if(detailListData) {
    detailList.value = detailListData;
  }
};
const getIconColor = (type: string) => {
  if (type == '0') {
    return 'normal-icon-bg';
  } else if (type == '1') {
    return 'purple-icon-bg';
  } else if (type == '2') {
    return 'grey-icon-bg';
  } else {
    return '';
  }
};
onMounted(() => {});

defineExpose({
  initData
});
</script>
<style scoped lang="scss">
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
.disabled-overlay {
  .font-item-b12 {
    color: var(--el-text-color-b69);
  }
  .task-name {
    color: var(--el-text-color-b69);
  }
  .font-item-button {
    color: var(--el-text-color-b69);
  }
}
.light-icon {
  width: 4px;
  height: 10px;
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
  margin-left: 8px;
  color: var(--el-text-color-b49);
}
.font-item-b12 {
  font-weight: 600;
  font-size: 20px;
  color: var(--el-text-color-b12);
}
.font-record-time {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: var(-el-text-color-b12);
}
.detail-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
}
.font-item-value {
  color: var(--el-text-color-b12);
}
.font-item-button {
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin-right: 8px;
}
.right-power {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  span {
    margin-left: 8px;
    font-weight: 500;
    font-size: 14px;
  }
}
.button-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.hideRefresh {
  width: 100%;
  justify-content: space-between;
}

.show-reading {
  margin: 8px 0;
  width: 102px;
  height: 32px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

 
}
.black {
  color: var(--baseBackground);
  background: var(--el-text-color-b12);
}
.white {
  color: var(--el-text-color-b12);
  background: var(--baseBackground);
}
.circle {
  margin-left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  padding: 8px 0;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
}
.normal-icon-bg {
  padding: 8px;
  background: var(--el-card-primary-flat05);
}
.purple-icon-bg {
  padding: 8px;
  background: var(--purple-bg-flat05);
}
.grey-icon-bg {
  padding: 8px;
  background: var(--el-box-shadow-start-color);
}
.icon-item {
  width: 24px;
  height: 24px;
}
::v-deep(.right-power .el-progress__text) {
  min-width: unset;
}
:deep(.el-divider--horizontal) {
  margin: 8px 0;
}
</style>
