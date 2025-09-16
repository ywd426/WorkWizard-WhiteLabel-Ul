<template>
  <div class="w-full grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-4">
    <div v-loading="showCard" v-for="item in detailForm" :key="item.name" :span="6">
      <div class="box-card">
        <div :span="24" class="item-title">
          <span>{{ item.name }}</span>
          <div class="custom-ranking">
            <span>{{ item.total }}</span>
          </div>
        </div>
        <div v-for="detail in getDetailList(item.name)" :key="detail.id" :span="24" class="item-card">
          <el-row>
            <el-col :span="24" style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <img src="@/assets/images/tool/due-date.png" alt="due-date" />
                <span class="due-date-value">From {{ yearFormat(detail.startTime) }} To {{ yearFormat(detail.endTime) }}</span>
              </div>
            </el-col>
            <el-col :span="24" style="display: flex; align-items: center">
              <svg-icon :icon-class="viewType == '1' ? 'clean' : 'charging'" class-name="task-type-icon" />
              <span class="task-type-title">{{ viewType == '1' ? detail.taskName : 'Charging' }}</span>
            </el-col>
            <el-col :span="24" style="display: flex; align-items: center; justify-content: space-between">
              <span class="task-name">{{ detail.mapName }}</span>
              <div v-if="detail.type == '999'" class="right-power">
                <el-progress
                  type="circle"
                  :percentage="detail.progress"
                  status="success"
                  :color="detail.progress >= 20 ? '#00ba4a' : '#ff384c'"
                  :width="18"
                  :stroke-width="3"
                >
                  <svg-icon icon-class="lightning" class-name="light-icon" />
                </el-progress>
                <span :class="detail.progress >= 20 ? 'color-progress' : 'color-uncompleted'">{{ detail.progress }}%</span>
              </div>
            </el-col>
            <el-col :span="24" style="display: flex; align-items: center">
              <img src="@/assets/images/tool/location.png" alt="due-date" />
              <span class="due-date-value line">{{ detail.location }}</span>
            </el-col>
            <el-col v-if="viewType == '1'" :span="24" style="margin-top: 12px">
              <el-progress :percentage="detail.progress" :show-text="false" />
            </el-col>
            <el-col v-else :span="24" style="margin-top: 12px">
              <el-progress :percentage="getChargedFormat(detail.progress)" :show-text="false" />
            </el-col>
            <el-col v-if="viewType == '1'" :span="24" style="display: flex; align-items: center; justify-content: space-between">
              <span class="power-progress"> {{ detail.actualArea }} / {{ detail.planArea }}</span>
              <span class="power-progress">{{ detail.progress }}%</span>
            </el-col>
            <el-col v-else :span="24" style="display: flex; align-items: center; justify-content: space-between">
              <span class="power-progress">Initial Power {{ detail.initialPower }}</span>
              <span class="power-progress-green">Charged {{ (detail.powerGain && detail.powerGain.startsWith('+')) ? detail.powerGain.slice(1) : detail.powerGain }}</span>
            </el-col>
            <el-col :span="24" style="display: flex; align-items: center; justify-content: space-between">
                <el-button
                    class="show-detail"
                    :class="detail.showDetail ? 'black' : 'white'"
                    @click="detail.showDetail = !detail.showDetail"
                  >
                    <div class="button-row">
                      <span class="font-item-button">{{ detail.showDetail ? 'Hide' : 'Show All' }}</span>
                      <svg-icon :icon-class="detail.showDetail ? 'map-up-floor-disable' : 'map-down-floor-disable'" />
                    </div>
                </el-button>
                <el-button round plain class="view-detail" @click="goDetail(detail)">
                   <svg-icon icon-class="view-card" class="svg-default" />
                </el-button>
            </el-col>
            
            <el-col v-if="detail.showDetail" :span="24" style="display: flex; align-items: center; justify-content: center">
              <el-row class="other-detail">
                    <el-col v-if="config.type === '1'" :span="24" class="other-detail-row">
                      <span>Task name:</span>
                      <span>{{ detail.taskName }}</span>
                    </el-col>
                    <el-col :span="24" class="other-detail-row">
                      <span>Robot name:</span>
                      <span>{{ detail.robotName }}</span>
                    </el-col>
                    <el-col :span="24" class="other-detail-row">
                      <span>SN:</span>
                      <span>{{ detail.robotSn }}</span>
                    </el-col>
                    <el-col :span="24" class="other-detail-row">
                      <span style="min-width: 80px">Location:</span>
                      <span>{{ detail.location }}</span>
                    </el-col>
                    <el-col v-if="config.type === '1'" :span="24" class="other-detail-row">
                      <span>Map name:</span>
                      <span>{{ detail.mapName }}</span>
                    </el-col>
                    <el-col :span="24" class="other-detail-row">
                      <span>Start time:</span>
                      <span>{{ useUtils.formatDate(detail.startTime) }}</span>
                    </el-col>
                    <el-col :span="24" class="other-detail-row">
                      <span>End time:</span>
                      <span>{{ useUtils.formatDate(detail.endTime) }}</span>
                    </el-col>
                  </el-row>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="robotBoard" lang="ts">
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { convertWithUnit } from '@/utils';
import useAppStore from '@/store/modules/app';

interface Props {
  config?: {
    type: string;
  };
}
interface TitleForm {
  name: string;
  total: number;
  color: string;
}
import * as useUtils from '@/utils/index';
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {
        type: 'board',
      };
    },
  },
})
const detailForm = ref<TitleForm[]>([
  { name: 'SCHEDULED', total: 1, color: '' },
  { name: 'IN PROGRESS', total: 1, color: '' },
  { name: 'UNCOMPLETED', total: 1, color: '' },
  { name: 'DONE', total: 1, color: '' }
]);
interface SchduleForm {
  id: string;
  taskName: string;
  robotName: string;
  robotSn: string;
  mapName: string;
  location: string;
  planArea: string;
  startTime: string;
  endTime: string;
  efficiency: string;
  remainingTime: string;
  consumption: string;
  progress: number;
  duration: string;
  actualArea: string;
  powerGain?: string;
  initialPower: string;
  finalPower: string;
  status: string;
  type: string;
  showDetail: boolean;
}
const showCard = ref(true); // 加载中效果
let schduleList: SchduleForm[] = [];
const scheduledList = ref<SchduleForm[]>([]);
const progressList = ref<SchduleForm[]>([]);
const uncompletedList = ref<SchduleForm[]>([]);
const doneList = ref<SchduleForm[]>([]);

const viewType = ref('1');

const emit = defineEmits(['openDetail']);
const yearFormat = (date: string) => {
  const curDate = useUtils.formatDate(date);
  return curDate.replace(new Date(date).getFullYear().toString() + '-', '');
};

const goDetail = (item) => { 
  console.log(item.id);
  const data = {
      id: item.id,
      viewType: viewType.value
    }
  emit('openDetail', data);
};
const getChargedFormat = (endPower: string | number) => {
  return parseInt(endPower?.replace('%', ''));
};
const chargedFormat = (startPower: string, endPower: string) => {
  return parseInt(endPower?.replace('%', '')) - parseInt(startPower?.replace('%', '')) + '%';
};
const getDetailList = (name: string): SchduleForm[] => {
  if (name == 'SCHEDULED') {
    return scheduledList.value;
  } else if (name == 'IN PROGRESS') {
    return progressList.value;
  } else if (name == 'UNCOMPLETED') {
    return uncompletedList.value;
  } else if (name == 'DONE') {
    return doneList.value;
  } else {
    return [];
  }
};

const getList = async () => {
  scheduledList.value = schduleList.filter((item) => item.status.toUpperCase() === 'SCHEDULED');
  progressList.value = schduleList.filter((item) => item.status.toUpperCase() === 'IN PROGRESS');
  uncompletedList.value = schduleList.filter((item) => item.status.toUpperCase() === 'UNCOMPLETED');
  doneList.value = schduleList.filter((item) => item.status.toUpperCase() === 'DONE');
  detailForm.value[0].total = scheduledList.value.length;
  detailForm.value[1].total = progressList.value.length;
  detailForm.value[2].total = uncompletedList.value.length;
  detailForm.value[3].total = doneList.value.length;
};

const orgData = ref({});
const updateList = async (opt) => {
  showCard.value = true;
  orgData.value = JSON.parse(JSON.stringify(opt));
  viewType.value = opt.type;
  const data = opt.data;
  setData(data.rows);

  getList();
  showCard.value = false;
};

const setData = (arr) => {
  schduleList = [];
  arr.forEach(item => {
    // if(item.progress) {
    //   item.progress += '%';
    // }

    if(item.actualArea) {
      item.actualArea = convertWithUnit({value: item.actualArea, type: 'area'});
    }

    if(item.planArea) {
      item.planArea = convertWithUnit({value: item.planArea, type: 'area'});
    }

    if(item.efficiency) {
      item.efficiency = convertWithUnit({value: item.efficiency, type: 'area'}) + '/h';
    }

    if(item.consumption) {
      item.consumption +='kWh';
    }

    item.status = useUtils.revertStatus(item.status, props.config.type).toUpperCase();
    
    item.endTime = useUtils.formatDate(item.endTime);
    item.startTime = useUtils.formatDate(item.startTime);

    if (item.remainingTime) {
      item.remainingTime = useUtils.formatDate(item.remainingTime);
    }
    schduleList.push(item);
  });
  
}

watch(
  () => useAppStore().currentUnits,
  () => {
    updateList(orgData.value)
  },
  { deep: true }
);

defineExpose({
  updateList
});
</script>
<style scoped>
.box-card {
  width: 100%;
  padding: 0 16px;
  background: var(--el-card-primary-flat05);
}
.item-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  font-weight: 700;
  line-height: 16px;
  font-size: 24px;
}
.item-card {
  border-radius: 8px;
  background: var(--baseBackground);
  padding: 12px 16px;
  margin-bottom: 12px;
}
.black {
  color: var(--baseBackground);
  background: var(--el-text-color-b12);
}
.white {
  color: var(--el-text-color-b12);
  background: var(--baseBackground);
}
.show-detail {
  margin: 8px 0;
  width: 102px;
  height: 32px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.view-detail {
  width: 32px;
  svg {
    width: 20px;
    height: 20px;
  }
}
.right-power {
  margin-left: auto;
  margin-right: 7px;
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
.custom-ranking {
  margin-left: auto;
  padding: 10px;
  border-radius: 8px;
  background-color: var(--num-text-bg);
  color: var(--colors-base-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  line-height: 16px;
  font-size: 16px;
}
.due-date {
  width: 9px;
  height: 9px;
}
.due-date-value {
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-b69);
}
.line {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.right-time {
  font-weight: 400;
  font-size: 12px;
  color: var(--colors-base-primary);
}
.task-type-title {
  font-weight: 700;
  font-size: 20px;
  line-height: 32px;
  color: var(--el-text-color-primary);
  margin-left: 8px;
}
.task-type-icon {
  width: 21px;
  height: 21px;
}
.light-icon {
  width: 4px;
  height: 10px;
}
.task-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: var(--el-text-color-b49);
}
::v-deep(.right-power .el-progress__text) {
  min-width: unset;
}

.power-progress {
  font-weight: 600;
  font-size: 12px;
  line-height: 26px;
  color: var(--el-text-color-b31);
}
.power-progress-green {
  font-weight: 600;
  font-size: 12px;
  line-height: 26px;
  color: var(--color-success);
}
.arrow-icon {
  width: 9px;
  height: 5px;
  cursor: pointer;
}
.other-detail {
  background: var(--el-card-primary-flat05);
  width: 100%;
  padding: 7px 8px;
  border-radius: 8px;
  font-weight: 400;
  font-size: 12px;
}
.other-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--el-text-color-b49);
}
.other-detail-row span:last-child {
  color: var(--el-text-color-primary);
  text-align: right;
}
.color-scheduled {
  color: var(--colors-base-primary);
}
.color-progress {
  color: var(--color-success);
}
.color-uncompleted {
  color: var(--color-danger);
}
.color-done {
  color: var(--el-text-color-primary);
}
.test-div {
  overflow: hidden;
  max-height: 200px;
  transition: max-height 0.3s ease;
}
::v-deep(.el-collapse-item__arrow) {
  transform: rotate(90deg);
  margin: 0 auto;
}
::v-deep(.el-collapse-item__arrow.is-active) {
  transform: rotate(-90deg);
}
::v-deep(.el-collapse) {
  border: none;
  cursor: auto;
}
::v-deep(.el-collapse-item__header) {
  border-bottom: transparent;
  height: 10px;
  padding-top: 4px;
  padding-bottom: 8px;
  width: 40px;
  margin: 0 auto;
}
::v-deep(.el-collapse .el-collapse-item__content) {
  padding: 0;
}
</style>
