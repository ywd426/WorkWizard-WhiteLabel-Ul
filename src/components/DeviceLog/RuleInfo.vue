<template>
  <SwitchTag v-model:moduleIndex="moduleIndex" :tabs="['Basic Info', 'Add Sensor']"></SwitchTag>
  <el-form
    id="rule-info-edit-dialog"
    ref="ruleFormRef"
    v-loading="dialogLoading"
    :model="ruleForm"
    :rules="rules"
    :inline="true"
    style="padding: 2px 18px"
    :label-width="formLableWidth"
    :style="{ height: formHeight + 'px' }"
  >
    <el-row v-show="moduleIndex == '1'">
      <el-form-item label="Rule Name" prop="name">
        <el-input v-model="ruleForm.name" :disabled="isReadonly" placeholder="Please Enter Rule Name" />
      </el-form-item>
      <el-form-item v-if="hasSelectEquipment && !isReadonly" label="Equipment" prop="equipmentName">
        <Equipment v-model:modelValue="ruleForm.equipmentId" v-model:modelName="ruleForm.equipmentName" @change-equipment="deviceChange"></Equipment>
      </el-form-item>
      <el-form-item v-else label="Equipment" prop="equipmentName">
        <el-input v-model="ruleForm.equipmentName" disabled />
      </el-form-item>
      <el-form-item label="Category" prop="category">
        <el-select v-model="ruleForm.category" clearable filterable placeholder="Please Select Category" :disabled="isReadonly">
          <el-option v-for="item in LogTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <Comment v-if="relationId" :relation-id="relationId" relation-type="2"></Comment>
      <el-col :span="24">
        <el-checkbox v-model="ruleForm.remind" :disabled="isReadonly">Remind everyone</el-checkbox>
      </el-col>
    </el-row>
    <el-row v-show="moduleIndex == '2'">
      <RuleSensors ref="ruleSensorsRef" :config="sensorConfig"></RuleSensors>
      <ElDivider />
      <el-form-item label="Sensor Logic">
        <el-col>
          <el-row>
            <el-radio v-model="ruleForm.logicType" :label="0" :disabled="isReadonly">Trigger the rule if all sensors meet the conditions </el-radio>
          </el-row>
          <el-row>
            <el-radio v-model="ruleForm.logicType" :label="1" :disabled="isReadonly" style="margin-right: 10px">
              Trigger the rule if any
              <el-input-number
                v-model="ruleForm.numValue"
                controls-position="right"
                :min="1"
                :disabled="isReadonly"
                style="width: 80px"
              ></el-input-number>
              of the sensors meet the conditions
            </el-radio>
          </el-row>
        </el-col>
      </el-form-item>
    </el-row>
    <div class="btn-group">
      <el-button class="cancel" plain @click="close()">Cancel</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="save()">Save</el-button>
    </div>
  </el-form>
</template>
<script lang="ts" setup>
interface Props {
  config?: {
    id?: string;
    canEdit?: boolean;
    equipmentId: string;
  };
}
import type { FormRules } from 'element-plus';
import { ruleDetail, saveRuleInfo } from '@/api/maintenance/deviceLogbook/automaticLog';
import { deviceList, sensorList, deviceInfo } from '@/api/maintenance/deviceLogbook/deviceManagement';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps<Props>();
const ruleFormRef = ref<ElFormInstance>();
const ruleSensorsRef = ref(null);
const emit = defineEmits(['close', 'save']);
const equipments = ref([]);
const formHeight = ref(500);
const dialogLoading = ref(true);
const relationId = computed(() => props.config?.id || '');
const LogTypes = ref([
  { 'id': 'operation', name: 'Operation Log' },
  { 'id': 'event', name: 'Event Log' }
]);
const moduleIndex = ref('1');
const hasSelectEquipment = ref(true);
const isReadonly = ref(false);
const isRemind = ref(true);
const formLableWidth = '90px';
const precision = ref(2);
const sensors = ref([]);
const radioItem = ref(1);
const logicNum = ref(1);
const sensorConfig = ref<{
  sensorList?: SensorForm[];
  isReadonly?: boolean;
  equipmentId: string;
}>({
  sensorList: [],
  isReadonly: false,
  equipmentId: ''
});
interface SensorForm {
  sensorId: string;
  sensorName: string;
  dataType: string;
  rangeStart: string;
  rangeEnd: string;
  unit: string;
  frequency: number;
  duration: number;
  durationUnit: string;
  tags: string;
  dataTypes?: any[];
}
export interface RuleForm {
  id: string;
  name: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  location: string;
  logicType: number;
  numValue: number;
  remind: boolean;
  sensorDetail: SensorForm[];
  comments: string;
}
const ruleForm = ref<RuleForm>({
  id: '',
  name: '',
  equipmentId: '',
  equipmentName: '',
  category: '',
  location: '',
  logicType: 1,
  numValue: 1,
  sensorDetail: [],
  remind: true,
  comments: ''
});
const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: 'Please Input Rule Name',
      trigger: 'blur'
    }
  ],
  equipmentName: [
    {
      required: true,
      message: 'Please Select Equipment',
      trigger: 'change'
    }
  ],
  category: [
    {
      required: true,
      message: 'Please Select Category',
      trigger: 'change'
    }
  ]
});
// 关闭
const close = () => emit('close');

const save = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      //过滤掉空集合
      ruleForm.value.sensorDetail = ruleSensorsRef.value.sensorDetails;
      ruleForm.value.sensorDetail = ruleForm.value.sensorDetail.filter((item) => item.sensorId !== '');
      if (ruleSensorsRef.value.validateForm()) {
        saveRuleInfo(ruleForm.value).then((res) => {
          proxy?.$modal.msgSuccess('Operation successful');
          emit('save');
        });
      }
    }
  });
};
const logInfo = async () => {
  await ruleDetail(props.config.id).then((res) => {
    ruleForm.value = res.data;
    if (ruleForm.value.equipmentId) {
      getSensorListByDevice(ruleForm.value.equipmentId);
    }
  });
};
const getDeviceList = () => {
  deviceList().then((res) => {
    equipments.value = res.data;
  });
};
const getSensorListByDevice = (deviceId) => {
  sensors.value = [];
  sensorList(deviceId).then((res) => {
    sensors.value = res.data;
  });
};
const deviceChange = () => {
  sensorConfig.value.equipmentId = ruleForm.value.equipmentId;
};
const equipmentInfo = (id: string) => {
  deviceInfo(id).then((res) => {
    ruleForm.value.equipmentName = res.data.equipmentName;
  });
};

onMounted(async () => {
  //判断是否指定设备
  if (!props.config.equipmentId) {
    //加载设备列表
    await getDeviceList();
  } else {
    hasSelectEquipment.value = false;
  }
  //编辑
  if (props.config.id) {
    await logInfo();
  } else if (props.config.equipmentId) {
    //指定设备新增
    ruleForm.value.equipmentId = props.config.equipmentId;
    await equipmentInfo(ruleForm.value.equipmentId);
  }
  if (!props.config.canEdit) {
    isReadonly.value = true;
  }
  sensorConfig.value.sensorList = [...ruleForm.value.sensorDetail];
  sensorConfig.value.isReadonly = isReadonly.value;
  sensorConfig.value.equipmentId = ruleForm.value.equipmentId;
  dialogLoading.value = false;
});
</script>
<style lang="scss" scoped>
.btn-group {
  height: 15%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
