<template>
  <div ref="p2" class="p-2" v-loading="loading">
    <div style="width: 100%" class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div v-for="(item, index) in activeList" :key="item.id" :span="4">
        <div v-if="item.type == viewType" class="robot-show-col">
          <div class="robot-show-header">
            <span>{{ item.name }}</span>
            <span class="total-task" :style="'color:' + customColors[index]">{{ item.value }}</span>
          </div>
          <el-progress :percentage="item.percent" :status="item.status" :show-text="false" :color="customColors[index]" />
          <div v-if="item.subTitle" class="robot-show-sub-title flex gap-4 mt-2" :style="{ 'color': customColors[index] }">
            <span class="robot-sub-title">{{ item.subTitle }}:</span> <span class="robot-sub-value">{{ item.subValue }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-row class="robot-body">
      <el-col :span="24" class="robot-detail">
        <el-row v-if="viewType == '1'" class="detail-title">
          <span >Task Name</span>:  <span class="pl-2">{{ curDetail.taskName }}</span>
        </el-row>
        <el-row v-if="viewType == '2'" class="detail-title">
          <span >Charging</span>
        </el-row>
        <div class="detail-body flex flex-col sm:flex-col md:flex-row lg:flex-row gap-4">
          <div v-if="viewType == '1'" class="flex-1 md:flex-1 lg:flex-2 relative" >
              <div class="map-info">
                <el-image :src="curDetail.mapUrl || undefined" fit="cover" style="width: 300px; height: 300px" >
                  <template #error>
                    <div class="image-error w-full h-full flex justify-center items-center font-weight-[500]">
                      <i class="el-icon-picture-outline"></i>
                      <span>{{ curDetail.status?.toLowerCase() == 'in progress' ? 'Available upon report generation' : 'FAILED'}}</span>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="map-button" @click="openEditChart">
                <img src="@/assets/images/chart/fullscreen.svg" alt="Full Screen" style="cursor: pointer" />
              </div>
          </div>
          <div class="flex-1 lg:flex-1 md:flex-1 detail-info max-h-[310px] overflow-auto" :model="detailForm">
            <el-form-item label="Robot Name" label-position="top" class="detail-item">
              <div class='w-full flex flex-col gap-2'>
                <el-text>{{ curDetail.robotName }}</el-text>
                <div class='metrics-tags flex gap-4'>
                  <el-tag v-if="viewType == '1'" class="metrics-tag">Mode: {{ curDetail.mode }}</el-tag>
                  <el-tag v-if="viewType == '1'" class="metrics-tag">SubMode: {{ curDetail.subMode }}</el-tag>
                  <el-tag v-if="viewType == '1'" class="metrics-tag">Type: {{ curDetail.type }}</el-tag>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="Start Time" label-position="top" class="detail-item">
              <el-text>{{ useUtils.formatDate(curDetail.startTime) }}</el-text>
            </el-form-item>
            <el-form-item label="End Time" label-position="top" class="detail-item">
              <el-text>{{ useUtils.formatDate(curDetail.endTime) }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Active Cleaning Duration" label-position="top" class="detail-item">
              <el-text>{{ useUtils.formatRunningHours(curDetail.duration) }}</el-text>
            </el-form-item>
            <el-form-item label="Location" label-position="top" class="detail-item">
              <el-text>{{ curDetail.location }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Map Name" label-position="top" class="detail-item">
              <el-text>{{ curDetail.mapName }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Plan Area" label-position="top" class="detail-item">
              <el-text>{{ convertWithUnit({ value: curDetail.planArea, type: 'area' }) }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Progress" label-position="top" class="detail-item">
              <el-text>{{ curDetail.progress }}%</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Actual Area" label-position="top" class="detail-item">
              <el-text>{{ convertWithUnit({ value: curDetail.actualArea, type: 'area' }) }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Water Consumption" label-position="top" class="detail-item">
              <el-text>{{ convertWithUnit({ value: curDetail.waterConsumption || 0, type: 'volume', useMilli: true }) }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Water Efficiency" label-position="top" class="detail-item">
              <el-text>{{ convertWithUnit({ value: curDetail.waterEfficiency || 0, type: 'areaPerVolume' }) }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Battery Usage" label-position="top" class="detail-item">

              <el-text>{{ (curDetail.batteryUsage || 0) + '%' }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Power Consumption" label-position="top" class="detail-item">
              <el-text>{{ (curDetail.consumption || 0) + 'kWh' }}</el-text>
            </el-form-item>
            <el-form-item v-if="viewType == '1'" label="Power Efficiency" label-position="top" class="detail-item">
              <el-text>{{ convertWithUnit({ value: curDetail.powerEfficiency || 0, type: 'area' }) + '/kWh' }}</el-text>
            </el-form-item>
          </div>
        </div>
      </el-col>
 
      <el-col v-if="viewType == '1'" :span="24" class="robot-detail">
        <el-row class="detail-title" style="justify-content: space-between">
          <div style="display: flex; align-items: center">
            <span>Configurations</span>
          </div>
          <!-- <div style="margin-right: 20px">
            <el-button type="default" :icon="Tools" @click="addInfo">Adjust Configuration</el-button>
          </div> -->
        </el-row>
        <div class="detail-body">
          <div class="w-full grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-1 gap-4">
            <div v-for="item in progressList" :key="item.key" :span="6" class="configurations-col">
              <div class="robot-show-col task-show-bg">
                <div class="robot-show-header">
                  <span :title="item.key">{{ item.key }}</span>
                  <span :title="item.name">{{ item.name }}</span>
                </div>
                <el-progress :percentage="item.num" :show-text="false" />
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" class="robot-detail">
        <el-row class="detail-title detail-title-small mb-2" id="detail-add-node">
          <div style="display: flex; align-items: center">
            <svg-icon icon-class="delete" style="width: 24px; height: 24px; cursor: pointer" @click="removeAllItem" />
            <span style="padding-left: 8px">Additional Information</span>
          </div>
          <div style="margin-right: 20px" class="button-group">
            <el-button type="default" :icon="Plus" @click="addInfo">Add</el-button>
            <el-button type="default" :icon="isEdit ? 'Check' : 'Edit'" @click="editInfo">{{ isEdit ? 'Save' : 'Edit' }}</el-button>
          </div>
        </el-row>
        <el-row class="detail-body detail-body-small">
          <el-col :span="24" :model="detailForm" class="edit-detail-info">
            <div v-for="(item, index) in editList" :key="item.id" class="edit-detail-info-item">
              <svg-icon
                icon-class="delete-one"
                style="width: 20px; height: 20px; top: 6px; margin-right: 8px; cursor: pointer"
                @click="removeItem(index)"
              />
              <el-row v-if="!item.isAdd" style="width: 100%">
                <el-form-item :label="item.name" label-position="top">
                  <el-text>{{ item.content }}</el-text>
                </el-form-item>
              </el-row>
              <el-row v-else>
                <el-form-item label="Title" label-width="80px" style="width: 100%">
                  <el-input v-model="item.name" />
                </el-form-item>
                <el-form-item label="Content" label-width="80px" style="width: 100%">
                  <el-input v-model="item.content" />
                </el-form-item>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogEdit.visible" width="70%" :destroy-on-close="true" append-to-body>
      <el-col :span="24" class="map-info">
        <el-image :src="curDetail.mapUrl" fit="cover" />
      </el-col>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditChart">CANCEL</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="taskDetail" lang="ts">
import { onMounted } from 'vue';
import { convertWithUnit } from '@/utils';
import { getScheduleDetail, getCustomFields, saveCustomFields, removeCustomFieldsById, removeRobotCustomFields } from '@/api/robot';
import { RobotCustomFields } from '@/api/robot/types';
import * as useUtils from '@/utils/index';
import { Plus, Tools } from '@element-plus/icons-vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 定义props
const props = defineProps<{
  taskId: string;
  viewType: string;
}>();

const routeParams = ref<Record<string, any>>({});
const loading = ref(true);
const dialogEdit = reactive<DialogOption>({
  visible: false
});
interface DetailForm {
  id: string;
  sensorId: string;
  dataType: string;
  endTimestamp: string;
}
const detailForm = ref<DetailForm>({ id: '1232', sensorId: '', dataType: '', endTimestamp: '' });
const detailCustomForm = ref<RobotCustomFields>({ relateId: '', type: '', details: [] });
interface SensorAlarmForm {
  id: string;
  taskName: string;
  robotName: string;
  robotSN: string;
  mapName: string;
  location: string;
  planArea: string;
  actualArea: string;
  startTime: string;
  endTime: string;
  mapUrl?: string;
  efficiency: string;
  remainingTime: string;
  consumption: string;
  progress: number;
  duration: string;
  initialPower: string;
  finalPower: string;
  status: string;
  waterConsumption: string;
  waterEfficiency: string;
  powerConsumption: string;
  powerEfficiency: string;
  batteryUsage?: string;
  // 新增字段定义
  mode: string;
  subMode: string;
  type: string;
  vacuumSpeed: string;
  vacuumSuction: string;
  washSpeed: string;
  washSuction: string;
  washWater: string;
  // 新增字段定义
  modeProgress: number;
  typeProgress: number;
  vacuumSpeedProgress: number;
  vacuumSuctionProgress: number;
  washSpeedProgress: number;
  washSuctionProgress: number;
  washWaterProgress: number;
}

const curDetail = ref<SensorAlarmForm>({
  id: undefined,
  taskName: undefined,
  robotName: undefined,
  robotSN: undefined,
  mapName: undefined,
  location: undefined,
  planArea: undefined,
  startTime: undefined,
  endTime: undefined,
  efficiency: undefined,
  remainingTime: undefined,
  consumption: undefined,
  progress: undefined,
  mapUrl: undefined,
  duration: undefined,
  initialPower: undefined,
  finalPower: undefined,
  status: undefined,
  waterConsumption: undefined,
  waterEfficiency: undefined,
  actualArea: undefined,
  batteryUsage: undefined,
  powerConsumption: undefined,
  powerEfficiency: undefined,
  mode: undefined,
  type: undefined,
  vacuumSpeed: undefined,
  vacuumSuction: undefined,
  washSpeed: undefined,
  washSuction: undefined,
  washWater: undefined,
  modeProgress: undefined,
  typeProgress: undefined,
  vacuumSpeedProgress: undefined,
  vacuumSuctionProgress: undefined,
  washSpeedProgress: undefined,
  washSuctionProgress: undefined,
  washWaterProgress: undefined
});
const progressList = ref([
  { key: 'Vacuum Speed', name: 'Turbo', num: 100 },
  { key: 'Vacuum Suction', name: 'High', num: 70 },
  { key: 'Wash Speed', name: 'High', num: 60 },
  { key: 'Wash Suction', name: 'Medium', num: 55 },
  { key: 'Wash Water', name: 'Auto', num: 35 }
]);
const isEdit = ref(false);
interface InfoForm {
  id: string;
  name: string;
  content: string;
  isAdd: boolean;
}
const editList = ref<InfoForm[]>([]);
const viewType = ref('1');
interface HeadForm {
  id: string;
  name: string;
  value: string;
  percent: number;
  status: any;
  type: string;
  subTitle?: string;
  subValue?: string;
}
const customColors = ref(['#09f', '#00ba4a', '#ff8401', '#FF26A8', '#944DFF']);
const headerList = ref<HeadForm[]>([
  { id: '', name: 'PROGRESS', value: '75%', percent: 75, status: '', type: '1' },
  { id: '', name: 'EFFICIENCY', value: '200m2/kWh', percent: 50, status: 'success', type: '1' },
  { id: '', name: 'REMAINING TIME', value: '30min', percent: 50, status: 'warning', type: '1' },
  { id: '', name: 'DURATION', value: '30min', percent: 60, status: '', type: '2' },
  { id: '', name: 'INIITAL POWER', value: '1.5kWh', percent: 50, status: 'success', type: '2' },
  { id: '', name: 'FINAL POWER', value: '2.5kWh', percent: 70, status: 'warning', type: '2' },
  { id: '', name: 'ACTUAL AREA', value: '30m2', percent: 60, status: '', type: '1', subTitle: 'PLAN AREA', subValue: '60m2' },
  // { id: '', name: 'Plan area', value: '30m2', percent: 60, status: '', type: '1' }
]);

const activeList = computed(() => {
  return headerList.value.filter((item) => item.type == viewType.value);
});

const addInfo = () => {
  isEdit.value = true;
  editList.value.push({
    id: '',
    name: '',
    content: '',
    isAdd: true
  });
};
const removeAllItem = async () => {
  await proxy?.$modal.confirm('Are you sure you want to delete this data?');
  deleteCustomFields().then((res) => {
    editList.value = [];
  });
};

const removeItem = (index) => {
  if (editList.value[index].id) {
    deleteCustomFieldsById(editList.value[index].id);
  }
  editList.value.splice(index, 1);
};
const editInfo = () => {
  if (isEdit.value) {
    editList.value = editList.value.filter((item) => item.name !== '');
    editList.value.forEach((item) => {
      item.isAdd = false;
    });
    addCustomFields();
  } else {
    editList.value.forEach((item) => {
      item.isAdd = true;
    });
  }
  isEdit.value = !isEdit.value;
};
const openEditChart = () => {
  dialogEdit.visible = true;
};
const closeEditChart = () => {
  dialogEdit.visible = false;
};

const getSensorCustomFields = async () => {
  await getCustomFields(props.taskId, props.viewType == '1' ? 'clean' : 'charging').then((res) => {
    editList.value = res.data;
  });
};
const addCustomFields = async () => {
  detailCustomForm.value = { relateId: '', type: props.viewType == '1' ? 'clean' : 'charging', details: [] };
  detailCustomForm.value.relateId = props.taskId;
  editList.value.forEach((item) => {
    detailCustomForm.value.details.push({
      name: item.name,
      content: item.content
    });
  });
  await saveCustomFields(detailCustomForm.value).then((res) => {
    proxy?.$modal.msgSuccess('Operation Successful');
    getSensorCustomFields();
  });
};
const deleteCustomFieldsById = async (id: string) => {
  await removeCustomFieldsById(id).then((res) => {
    proxy?.$modal.msgSuccess('Operation Successful');
  });
};
const deleteCustomFields = async () => {
  await removeRobotCustomFields(props.taskId, props.viewType == '1' ? 'clean' : 'charging').then((res) => {
    proxy?.$modal.msgSuccess('Operation Successful');
  });
};
onMounted(async () => {
  // 使用props而不是路由参数
  viewType.value = props.viewType;

  const data = await getScheduleDetail(props.taskId, props.viewType);
  console.log(data); // Assuming data contains the required informatio
  curDetail.value = data.data;
  headerList.value[0].value = curDetail.value.progress + '%';
  headerList.value[0].percent = Number(curDetail.value.progress);
  headerList.value[1].value = convertWithUnit({value: curDetail.value.efficiency, type: 'area'}) + '/h';
  headerList.value[1].percent = curDetail.value.efficiencyProgress;
  headerList.value[2].value = (Number(curDetail.value.remainingTime) / 60).toFixed(0) + 'min';
  headerList.value[2].percent = curDetail.value.remainingTimeProgress;
  headerList.value[3].value = curDetail.value.duration;
  headerList.value[3].percent = Number(curDetail.value.durationProgress || 0);
  headerList.value[4].value = curDetail.value.initialPower;
  headerList.value[4].percent = curDetail.value.initialPower ? Number(curDetail.value.initialPower.replace('%', '')) : 0;
  headerList.value[5].value = curDetail.value.finalPower;
  headerList.value[5].percent = curDetail.value.finalPower ? Number(curDetail.value.finalPower.replace('%', '')) : 0;
  headerList.value[6].value = convertWithUnit({value: curDetail.value.actualArea, type: 'area'});
  headerList.value[6].subValue = convertWithUnit({value: curDetail.value.planArea, type: 'area'});
  headerList.value[6].percent = (curDetail.value.actualArea / curDetail.value.planArea * 100).toFixed(2);

  // headerList.value[7].value = curDetail.value.planArea + 'm²';
  // headerList.value[7].percent = curDetail.value.planArea ? Number(curDetail.value.planArea.replace('%', '')) : 0;

  progressList.value[0].name = curDetail.value.vacuumSpeed;
  progressList.value[0].num = curDetail.value.vacuumSpeedProgress;
  progressList.value[1].name = curDetail.value.vacuumSuction;
  progressList.value[1].num = curDetail.value.vacuumSuctionProgress;
  progressList.value[2].name = curDetail.value.washSpeed;
  progressList.value[2].num = curDetail.value.washSpeedProgress;

  progressList.value[3].name = curDetail.value.washSuction;
  progressList.value[3].num = curDetail.value.washSuctionProgress;

  progressList.value[4].name = curDetail.value.washWater;
  progressList.value[4].num = curDetail.value.washWaterProgress;
  await getSensorCustomFields();
  loading.value = false;
});
</script>
<style scoped lang="scss">
@import '@/assets/styles/clean-panels.scss';

.robot-show-col {
  width: 100%;
  height: 110px;
  border-radius: 8px;
  background: var(--baseBackground);
  margin-right: 10px;

  box-shadow:
    0px 2px 4px -1px var(--el-box-shadow-start-color),
    0px 4px 6px -1px var(--el-box-shadow-end-color);
  color: var(--menuColor);

  .robot-show-sub-title {
    color: var(--colors-base-03-secondary, #944dff);
    text-align: right;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;

    .robot-sub-title {
      white-space: nowrap;
    }
  }
}

@media screen and (min-width: 768px) {
  .robot-show-col {
    padding: 32px 24px;
  }

  .robot-show-header span {
    max-width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.robot-show-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.robot-show-header span {
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
}
.robot-show-header span:last-child {
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}
.total-task {
  color: var(--colors-base-primary);
}
.running-hours {
  color: var(--color-dark-blue);
}
.total-milleage {
  color: var(--color-dark-yellow);
}
.total-area {
  color: var(--color-pink);
}
.robot-show-title {
  display: flex;
  align-items: end;
  padding-bottom: 12px;
  padding-left: 8px;
  height: 60px;
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  color: var(--el-text-color-b12);
}
.robot-body {
  border-radius: 8px;
  padding: 0px 0px 24px 0;
  background: var(--baseBackground);
  color: var(--el-text-color-b12);
}
.robot-detail {
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--el-base-border-color);
}
.detail-title {
  border-radius: 8px 8px 0px 0px;
  height: 48px;
  background: var(--el-title-background-color);
  padding-left: 48px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}
.detail-title-small {
  padding-left: 16px;
  justify-content: space-between;
}
.detail-body {
  width: 100%;
  padding: 8px 32px;
}
.detail-body-small {
  padding-left: 20px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--baseBackground);
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
}
.detail-info .el-text {
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  align-self: auto;
}
.edit-detail-info {
  display: flex;
  flex-wrap: wrap;
  background: var(--baseBackground);
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
}
.edit-detail-info-item {
  width: 50%;
  display: flex;
}
.edit-detail-info .el-text {
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
}
.configurations-col {
  margin-bottom: 16px;
}
.task-show-bg {
  background: var(--el-background-color);
  color: var(--el-text-color-b12);
}
.task-show-bg span {
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
}
.task-show-bg span:last-child {
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}
.map-info {
  background: var(--el-title-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .image-error {
    align-items: center;
    color: var(--el-text-color-placeholder);
    display: flex;
    font-size: 14px;
    justify-content: center;
    vertical-align: middle;
  }
}
.map-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
}

/* 响应式布局样式 */
@media (min-width: 1024px) {
  .detail-body > div:first-child {
    flex: 2;
  }
  .detail-body > div:last-child {
    flex: 1;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .detail-body > div:first-child {
    flex: 1;
  }
  .detail-body > div:last-child {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .detail-body {
    flex-direction: column;
  }
  .detail-body > div {
    flex: none;
  }
}
@media (max-width: 768px) {
  .detail-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .detail-body {
    padding: 8px 16px;
  }
  .detail-info {
    grid-template-columns: 1fr;
    padding: 16px 0;
  }
  .detail-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
  }
  .edit-detail-info-item {
    width: 100%;
  }
  .detail-item :deep(.el-form-item__label) {
    width: 120px;
    text-align: right;
    padding-right: 12px;
    margin-bottom: 0;
  }

  .detail-title {
    padding-left: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;

    button {
      width: 120px !important;
      white-space: pre-wrap;
    }
  }

  .robot-body {
    padding-top: 0;
  }

  .edit-detail-info-item {
    width: 100%;
  }

  .detail-title-small {
    height: auto;
  }

  #detail-add-node {
    margin-right: 20px;
    height: auto;

    .button-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: end;
    }

    button {
      width: 60px !important;
      height: 32px;
      margin-left: 0;
    }
  }
}

 .metrics-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .el-tag {
      display: flex;
      height: 28px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 100px;
      background: var(--colors-flat-primary-flat10, rgba(0, 153, 255, 0.1));
      border-color: transparent;
      color: var(--layout-bg_focus, #09f);
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;

      :deep(svg) {
        color: $color-blue;
      }
    }

    .low,
    .info {
      background-color: rgba(0, 153, 255, 0.1);
      color: $color-blue;
      :deep(svg) {
        color: $color-blue;
      }
    }
    .high,
    .danger {
      background-color: rgba(255, 56, 76, 0.1);
      color: $color-red;
      :deep(svg) {
        color: $color-red;
      }
    }
    .middle,
    .medium,
    .warning {
      background-color: rgba(237, 182, 1, 0.1);
      color: $color-orange;
      :deep(svg) {
        color: $color-orange;
      }
    }
  }
</style>
