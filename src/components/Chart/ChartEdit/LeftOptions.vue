<template>
  <div class="options">
    <div class="title">Data</div>
    <div class="card">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
      >
        <el-collapse v-model="activeNames">
          <el-collapse-item title="Location" name="1">
            <el-form-item v-if="!isEdit" label="Company">
              <el-select v-model="ruleForm.company" placeholder="Company" :disabled="isEdit">
                <el-option v-for="item in sensorCompanyList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-else label="Company">
              <el-text>{{ ruleForm.company }}</el-text>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="Account">
              <el-select v-model="ruleForm.account" placeholder="Project" :validate-event="false" :disabled="isEdit">
                <el-option
                  v-for="item in sensorAccountList"
                  :key="item.accountId"
                  :label="item.accountName"
                  :value="item.accountId"
                ></el-option> </el-select
            ></el-form-item>
            <el-form-item v-if="!isEdit" label="Project">
              <el-select v-model="ruleForm.project" placeholder="Project" :validate-event="false" :disabled="isEdit">
                <el-option v-for="item in sensorProjectList" :key="item.projectId" :label="item.projectName" :value="item.projectId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-else label="Project">
              <el-text>{{ ruleForm.project }}</el-text>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="Region" prop="region">
              <el-select v-model="ruleForm.region" placeholder="Region" multiple :validate-event="false" @change="handleQuery">
                <el-option v-for="item in regionList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="State" prop="state">
              <el-select v-model="ruleForm.state" placeholder="State" multiple :validate-event="false" @change="handleQuery">
                <el-option v-for="item in stateList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="City" prop="city">
              <el-select v-model="ruleForm.city" placeholder="City" multiple :validate-event="false" @change="handleQuery">
                <el-option v-for="item in cityList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="ZipCode" prop="zipCode">
              <el-input v-model="ruleForm.zipCode" placeholder="ZipCode" clearable @blur="handleQuery" />
            </el-form-item>
            <ElDivider />
            <el-form-item v-if="!isEdit" label="Building" prop="building">
              <el-select v-model="ruleForm.building" placeholder="Building" clearable :validate-event="false" @change="changeBuilding">
                <el-option v-for="item in buildingList" :key="item.buildingId" :label="item.buildingName" :value="item.buildingId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-else label="Building">
              <el-text>{{ ruleForm.building }}</el-text>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="Sensor" prop="sensor">
              <el-cascader
                v-model="ruleForm.sensor"
                :options="sensorOptions"
                :placeholder="cascaderMsg"
                :props="{
                  expandTrigger: 'hover' as const
                }"
                @change="changeSensor"
              />
            </el-form-item>
            <el-form-item v-else label="Sensor">
              <el-text>{{ ruleForm.sensor }}</el-text>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { locationTreeList, projectList, tenantList, accountList } from '@/api/monitor/sensormanage';
import { getBuilding, getSensorTree } from '@/api/monitor/chartinfo';
const emit = defineEmits(['change-sensor']);
const activeNames = ref(['1']);

const sensorProjectList = ref([]);
const sensorCompanyList = ref([]);
const sensorAccountList = ref([]);
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
interface BuildingForm {
  buildingId: string;
  buildingName: string;
}
const buildingList = ref<BuildingForm[]>([]);

const sensorOptions = ref([]);

interface RuleForm {
  company: string;
  account: string;
  project: string;
  region: string[];
  state: string[];
  city: string[];
  zipCode: string;
  building: string;
  sensor: string;
  sensorId: string;
  location: string;
}

const formSize = ref<ComponentSize>('default');
const ruleFormRef = ref<FormInstance>();
//是否编辑页面
const isEdit = ref(false);
const ruleForm = reactive<RuleForm>({
  company: '',
  account: '',
  project: '',
  region: [],
  state: [],
  city: [],
  zipCode: '',
  building: '',
  sensor: '',
  sensorId: '',
  location: ''
});

const cascaderMsg = ref('Please select sensor');

const rules = reactive<FormRules<RuleForm>>({
  company: [
    {
      required: true,
      message: 'Please select company',
      trigger: 'change'
    }
  ],
  account: [
    {
      required: true,
      message: 'Please select account',
      trigger: 'change'
    }
  ],
  building: [
    {
      required: true,
      message: 'Please select building',
      trigger: 'change'
    }
  ],
  sensor: [
    {
      required: true,
      message: 'Please select sensor',
      trigger: 'change'
    }
  ]
});

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`
}));
const ranges = Array.from({ length: 23 }).map((_, idx) => ({
  value: idx + 1,
  label: `${idx + 1} hours`
}));

const getLcationTreeList = async () => {
  await locationTreeList().then((res) => {
    regionList.value = res.data.regionList;
    if (regionList.value.length == 1) {
      ruleForm.region.push(regionList.value[0]);
    }
    stateList.value = res.data.stateList;
    if (stateList.value.length == 1) {
      ruleForm.state.push(stateList.value[0]);
    }
    cityList.value = res.data.cityList;
    if (cityList.value.length == 1) {
      ruleForm.city.push(cityList.value[0]);
    }
  });
};
const getBuildingList = () => {
  // 获取building数据
  getBuilding(ruleForm.region.join(','), ruleForm.state.join(','), ruleForm.city.join(','), ruleForm.zipCode).then((res) => {
    buildingList.value = res.data;
  });
};
const getSensorList = () => {
  if (!ruleForm.building) {
    sensorOptions.value = [];
    return;
  }
  // 获取传感器数据
  getSensorTree(ruleForm.building).then((res) => {
    sensorOptions.value = res.data;
  });
};
const changeBuilding = () => {
  getSensorList();
};
const changeSensor = () => {
  if (ruleForm.sensor.length == 3) {
    ruleForm.sensorId = ruleForm.sensor[2];
  }
  emit('change-sensor', ruleForm.sensor);
};
const handleQuery = () => {
  getBuildingList();
};
const getProjectList = () => {
  // 获取项目数据
  projectList().then((res) => {
    sensorProjectList.value = res.data;
    if (sensorProjectList.value.length == 1) {
      ruleForm.project = sensorProjectList.value[0].projectName;
    }
  });
};
const getCompanyList = () => {
  // 获取公司数据
  tenantList().then((res) => {
    sensorCompanyList.value = res.data;
    if (sensorCompanyList.value.length == 1) {
      ruleForm.company = sensorCompanyList.value[0].companyName;
    }
  });
};
const getAccountList = () => {
  // 获取账户数据
  accountList().then((res) => {
    sensorAccountList.value = res.data;
    if (sensorAccountList.value.length == 1) {
      ruleForm.account = sensorAccountList.value[0];
    }
  });
};
onBeforeMount(async () => {
  await getLcationTreeList();
  getProjectList();
});
onMounted(async () => {
  if (!isEdit.value) {
    await handleQuery();
    getCompanyList();
    getAccountList();
  }
});
defineExpose({
  ruleForm,
  cascaderMsg,
  isEdit
});
</script>

<style lang="scss" scoped>
.options {
  height: 100%;
  width: 20%;
  min-width: 200px;
  background: var(--baseBackground);
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 2.5rem;
    text-indent: 1rem;
    border-bottom: 1px solid var(--el-border-color);
  }
  .card {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    :deep(.el-collapse-item__header) {
      text-indent: 1rem;
      font-weight: bold;
      font-size: 1rem;
    }
    :deep(.el-collapse .el-collapse-item__content) {
      padding: 1rem;
      background: var(--el-chart-background-color);
    }
  }
}
:deep(.el-input__validateIcon) {
  display: none;
}
</style>
