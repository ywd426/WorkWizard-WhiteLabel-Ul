<template>
  <div ref="p2" class="p-2" v-loading="loading">
    <div class="w-full grid md:grid-cols-2 lg:grid-cols-6 grid-cols-1 gap-4">
      <div>
        <div class="robot-show-col">
          <span>TOTAL TASK</span>
          <span class="total-task">{{ curDetail.totalTasks }}</span>
        </div>
      </div>
      <div>
        <div class="robot-show-col">
          <span>TOTAL RUNNING HOURS</span>
          <span class="running-hours">{{ useUtils.formatRunningHours(curDetail.totalRunningHours) }}</span>
        </div>
      </div>
      <div>
        <div class="robot-show-col">
          <span>Total Cleaned Area</span>
          <span class="total-area">{{ curDetail.totalArea }}{{ curDetail.totalArea == null ? '' : 'm²' }}</span>
        </div>
      </div>
      <div v-if="isToday">
        <div class="robot-show-col">
          <span>Water Level</span>
          <span class="water-level">{{ curDetail.waterLevel }}%</span>
        </div>
      </div>
      <div v-if="isToday">
        <div class="robot-show-col">
          <span>Sewage Level</span>
          <span class="sewage-level">{{ curDetail.sewageLevel }}%</span>
        </div>
      </div>
      <div v-if="isToday">
        <div class="robot-show-col">
          <span>Power Level</span>
          <span class="battery-level">{{ curDetail.batteryLevel }}%</span>
        </div>
      </div>
    </div>
    <el-row class="robot-show-title">
      <span>{{ curDetail.robotName }}</span>
    </el-row>
    <el-row class="robot-body">
      <el-col :span="24" class="robot-detail">
        <el-row class="detail-title">
          <span>Robot Details</span>
        </el-row>
        <el-row class="detail-body">
          <el-col :span="24" :model="detailForm" class="detail-info">
            <el-form-item label="Brand" label-position="top" class="detail-item">
              <el-text>Pudu</el-text>
            </el-form-item>
            <el-form-item label="Type" label-position="top" class="detail-item">
              <el-text>{{ curDetail.robotType }}</el-text>
            </el-form-item>
            <el-form-item label="Date of registration" label-position="top" class="detail-item">
              <el-text>October 20, 2024</el-text>
            </el-form-item>
            <el-form-item label="Model" label-position="top" class="detail-item">
              <el-text>CC1</el-text>
            </el-form-item>
            <el-form-item label="Date of installation" label-position="top" class="detail-item">
              <el-text>October 30, 2024</el-text>
            </el-form-item>
            <el-form-item label="Name" label-position="top" class="detail-item">
              <div class="robot-name" style="display: flex; align-items: center; gap: 8px">
                <div class="w-full flex gap-2" v-if="isEditingName">
                  <el-input
                    v-model="editingRobotName"
                    @keyup.enter="saveRobotName"
                    ref="nameInput"
                    style="font-size: 16px; font-weight: 700; flex: 1"
                  />
                  <svg-icon
                    icon-class="saveInfo"
                    @click="saveRobotName"
                    style="width: 16px; height: 16px; cursor: pointer; color: #67c23a"
                    title="Save name"
                  />
                </div>
                <div v-else class="w-full flex gap-2">
                  <el-text style="font-size: 16px; font-weight: 700; flex: 1">
                    {{ curDetail.robotName }}
                  </el-text>
                  <el-icon @click="startEditName" title="Edit name"><Edit /></el-icon>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="SN" label-position="top" class="detail-item">
              <el-text>{{ curDetail.robotSn }}</el-text>
            </el-form-item>
            <el-form-item label="Company Account" label-position="top" class="detail-item">
              <el-text>FOXX NEXUS</el-text>
            </el-form-item>
            <el-form-item label="Location" label-position="top" class="detail-item">
              <el-text>{{ curDetail.location }}</el-text>
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24" class="robot-detail">
        <el-row class="detail-title">
          <span>Vendor Information</span>
        </el-row>
        <el-row class="detail-body">
          <el-col :span="24" :model="detailForm" class="detail-info">
            <el-form-item label="Brand" label-position="top" class="detail-item">
              <el-text>Pudu</el-text>
            </el-form-item>
            <el-form-item label="Date of registration" label-position="top" class="detail-item">
              <el-text>October 20, 2024</el-text>
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24" class="robot-detail">
        <el-row class="detail-title detail-title-small">
          <div style="display: flex; align-items: center">
            <svg-icon icon-class="delete" style="width: 24px; height: 24px; cursor: pointer" @click="removeAllItem" />
            <span style="padding-left: 8px">Additional Information</span>
          </div>
          <div class="button-group" style="margin-right: 20px">
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
  </div>
</template>
<script setup name="robotDetail" lang="ts">
import { onMounted, nextTick } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { getRobotDetail, getCustomFields, saveCustomFields, removeCustomFieldsById, removeRobotCustomFields } from '@/api/robot';
import { RobotCustomFields } from '@/api/robot/types';
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const routeParams = ref<Record<string, any>>({});

interface SensorAlarmForm {
  id: string;
  robotType: string;
  robotName: string;
  robotSn: string;
  location: string;
  currentTask: string;
  totalTasks: string;
  totalRunningHours: string;
  totalMileage: string;
  totalArea: string;
  status: string;
  waterLevel?: number;
  sewageLevel?: number;
  batteryLevel?: number;
}
const curDetail = ref<SensorAlarmForm>({
  id: undefined,
  robotType: undefined,
  robotName: undefined,
  robotSn: undefined,
  location: undefined,
  currentTask: undefined,
  totalTasks: undefined,
  totalRunningHours: undefined,
  totalMileage: undefined,
  totalArea: undefined,
  status: undefined,
  waterLevel: 0,
  sewageLevel: 0,
  batteryLevel: 0
});
interface DetailForm {
  id: string;
  sensorId: string;
  dataType: string;
  endTimestamp: string;
}
const detailForm = ref<DetailForm>({ id: '1232', sensorId: '', dataType: '', endTimestamp: '' });
const loading = ref(true);

const detailCustomForm = ref<RobotCustomFields>({ relateId: '', type: '', details: [] });
const isEdit = ref(false);

// 机器人名称编辑相关
const isEditingName = ref(false);
const editingRobotName = ref('');
const nameInput = ref(null);
interface InfoForm {
  id: string;
  name: string;
  content: string;
  isAdd: boolean;
}
const editList = ref<InfoForm[]>([]);
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
const getSensorCustomFields = async () => {
  await getCustomFields(routeParams.value.robotSn, 'robot').then((res) => {
    editList.value = res.data;
  });
};
const addCustomFields = async () => {
  detailCustomForm.value = { relateId: '', type: 'robot', details: [] };
  detailCustomForm.value.relateId = routeParams.value.robotSn;
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
  await removeRobotCustomFields(routeParams.value.robotSn, 'robot').then((res) => {
    proxy?.$modal.msgSuccess('Operation Successful');
  });
};

// 机器人名称编辑方法
const startEditName = () => {
  isEditingName.value = true;
  editingRobotName.value = curDetail.value.robotName;
  nextTick(() => {
    nameInput.value?.focus();
  });
};

const saveRobotName = async () => {
  if (editingRobotName.value.trim() === '') {
    proxy?.$modal.msgError('Robot name cannot be empty');
    editingRobotName.value = curDetail.value.robotName;
    return;
  }

  if (editingRobotName.value === curDetail.value.robotName) {
    isEditingName.value = false;
    return;
  }

  try {
    // 这里需要调用更新机器人名称的API
    // 假设API接口为 updateRobotName(robotSn, newName)
    // await updateRobotName(routeParams.value.robotSn, editingRobotName.value);

    // 暂时直接更新本地数据，实际项目中应该调用API
    curDetail.value.robotName = editingRobotName.value;
    isEditingName.value = false;
    proxy?.$modal.msgSuccess('Robot name updated successfully');
  } catch (error) {
    proxy?.$modal.msgError('Failed to update robot name');
    editingRobotName.value = curDetail.value.robotName;
  }
};

const cancelEditName = () => {
  isEditingName.value = false;
  editingRobotName.value = curDetail.value.robotName;
};
const isToday = computed(() => {
  console.log(routeParams.value.isToday, 'routeParams.value.isToday;');
  return routeParams.value.isToday == 'true';
});
onMounted(async () => {
  routeParams.value = proxy.$route.query;
  const data = await getRobotDetail(routeParams.value.robotSn);
  curDetail.value = data.data;
  curDetail.value.totalTasks = routeParams.value?.totalTasks;
  curDetail.value.totalRunningHours = routeParams.value?.totalRunningHours;
  curDetail.value.totalArea = routeParams.value?.totalArea;
  await getSensorCustomFields();
  loading.value = false;
});
</script>
<style scoped>
.robot-show-col {
  width: 100%;
  height: 86px;
  border-radius: 8px;
  background: var(--baseBackground);
  margin-right: 10px;
  padding: 32px 24px;
  box-shadow:
    0px 2px 4px -1px var(--el-box-shadow-start-color),
    0px 4px 6px -1px var(--el-box-shadow-end-color);
  color: var(--menuColor);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.robot-show-col span {
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
}
.robot-show-col span:last-child {
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
.water-level {
  color: var(--color-base-green);
}
.sewage-level {
  color: var(--color-base-red);
}
.battery-level {
  color: var(--color-base-purple);
}
.robot-show-title {
  margin: 0 20px;
  display: flex;
  align-items: center;
  padding-left: 8px;
  height: 60px;
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  color: var(--el-text-color-b12);
}
.robot-body {
  border-radius: 8px;
  padding: 24px 20px;
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
  margin-bottom: 8px;
}
.detail-body {
  width: 100%;
  padding: 8px 32px;
}
.robot-body {
  padding-top: 0;
}
.detail-body-small {
  padding-left: 20px;
}
.detail-item {
  width: 50%;
}
.detail-info {
  display: flex;
  flex-wrap: wrap;
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
  .detail-item :deep(.el-form-item__label) {
    width: 120px;
    text-align: right;
    padding-right: 12px;
    margin-bottom: 0;
  }

  .edit-detail-info-item {
    width: 100%;
  }

  .detail-title-small {
    height: auto;
  }
  .button-group {
    margin-right: 20px;
    height: 32px;
    width: 100%;
    display: flex;
    justify-content: end;
  }
}
</style>
