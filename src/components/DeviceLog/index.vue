<template>
  <SwitchTag v-model:moduleIndex="moduleIndex" :tabs="lableList"></SwitchTag>
  <el-form
    id="logAddForm"
    ref="logFormRef"
    v-loading="dialogLoading"
    :model="logForm"
    :rules="rules"
    :inline="true"
    label-width="90px"
    :style="{ height: formHeight + 'px' }"
  >
    <el-row v-show="moduleIndex == '1'">
      <el-form-item label="Log Name" prop="name">
        <el-autocomplete
          v-model="logForm.name"
          :fetch-suggestions="querySearch"
          placeholder="Please Enter Log Name"
          clearable
          :disabled="isReadonly"
          @select="handleSelect"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="Start Time" prop="startTimestamp">
        <el-date-picker v-model="logForm.startTimestamp" type="datetime" :disabled="isReadonly" placeholder="Start Date"></el-date-picker>
      </el-form-item>
      <el-form-item label="End Time" prop="endTimestamp">
        <el-date-picker v-model="logForm.endTimestamp" type="datetime" :disabled="isReadonly" placeholder="End Date"></el-date-picker>
      </el-form-item>
      <el-form-item v-if="hasSelectEquipment && !isReadonly" label="Equipment" prop="equipmentName">
        <Equipment v-model:modelValue="logForm.equipmentId" v-model:modelName="logForm.equipmentName" @change-equipment="deviceChange"></Equipment>
      </el-form-item>
      <el-form-item v-else label="Equipment" prop="equipmentName">
        <el-input v-model="logForm.equipmentName" disabled />
      </el-form-item>
      <el-form-item label="Environment" prop="environmentKey">
        <el-select
          v-model="logForm.environmentKey"
          :disabled="isReadonly"
          filterable
          allow-create
          default-first-option
          placeholder="Please Select"
          style="width: 140px"
        >
          <el-option v-for="item in environments" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-input v-model="logForm.environmentValue" :disabled="isReadonly" placeholder="Value" clearable style="width: 72px; margin-left: 8px" />
      </el-form-item>
      <el-form-item v-if="logCategory == 'operation'" label="Key Events" prop="keyEvent">
        <el-select
          v-model="logForm.keyEvent"
          :disabled="isReadonly"
          clearable
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="Please Select Key Events"
        >
          <el-option v-for="item in logNames" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-else label="Operation Status" prop="operationState">
        <el-select
          v-model="logForm.operationState"
          :disabled="isReadonly"
          clearable
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="Please Select Operation Status"
        >
          <el-option v-for="item in logNames" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Tags" prop="tags">
        <el-autocomplete
          v-model="logForm.tags"
          :fetch-suggestions="queryTagsSearch"
          placeholder="Please Enter Tags"
          :disabled="isReadonly"
          clearable
          @select="handleSelect"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item v-if="isAutoLog" label="Rule Name">
        <el-input v-model="logForm.ruleName" disabled></el-input>
      </el-form-item>
      <el-col :span="24">
        <el-form-item label="Observations" prop="observations" style="width: 80%">
          <el-input v-model="logForm.observations" :disabled="isReadonly" type="textarea" clearable />
        </el-form-item>
      </el-col>
      <Comment v-if="relationId" :relation-id="relationId" relation-type="1"></Comment>
      <el-col :span="24">
        <el-checkbox v-model="logForm.remind" :disabled="isReadonly">Remind everyone</el-checkbox>
      </el-col>
    </el-row>
    <el-row v-show="moduleIndex == '2'">
      <el-col v-if="!isAutoLog" :span="24">
        <el-row class="form-row">
          <span>Add Sensor</span>
        </el-row>
        <div v-for="(item, index) in logForm.sensorDetail" :key="index" class="operation-row">
          <div v-if="!isReadonly" class="form-btn">
            <svg-icon v-if="index == 0" icon-class="add-form" class-name="current-item" @click="addSensorItem" />
            <svg-icon icon-class="subtract-form" class-name="current-item" @click="removeSensorItem(index)" />
          </div>
          <div class="sensor-row">
            <el-form-item label="Sensor" :label-width="formLableWidth">
              <el-select
                v-model="item.sensorId"
                :disabled="isReadonly"
                clearable
                filterable
                placeholder="Please Select Sensor"
                @change="sensorChange(item)"
              >
                <el-option
                  v-for="sensorItem in sensors"
                  :key="sensorItem.sensorId"
                  :label="sensorItem.sensorName"
                  :value="sensorItem.sensorId"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Data Type" :label-width="formLableWidth" style="width: 260px">
              <el-select
                v-model="item.dataType"
                :disabled="isReadonly"
                clearable
                filterable
                placeholder="Please Select"
                @change="dataTypeChange(item)"
              >
                <el-option
                  v-for="sensorItem in item.dataTypes"
                  :key="sensorItem.dataType"
                  :label="sensorItem.dataName"
                  :value="sensorItem.dataType"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Range" :label-width="formLableWidth" style="display: flex">
              <el-input v-model="item.rangeStart" :disabled="isReadonly" clearable style="width: 80px" />
              <span style="margin-left: 8px; margin-right: 8px">-</span>
              <el-input v-model="item.rangeEnd" :disabled="isReadonly" clearable style="width: 80px" />
              <span style="margin-left: 8px">{{ item.unit }}</span>
            </el-form-item>
            <el-form-item v-if="isAutoLog" label="Frequency" :label-width="formLableWidth">
              <el-input-number v-model="item.frequency" controls-position="right" :min="0" :disabled="isReadonly"></el-input-number>
            </el-form-item>
            <el-form-item v-if="isAutoLog" label="Duration" :label-width="formLableWidth">
              <el-input-number v-model="item.duration" controls-position="right" :min="0" :disabled="isReadonly"></el-input-number>
              <el-radio-group v-model="item.durationUnit" :disabled="isReadonly" class="radio-group">
                <el-radio value="m">Minutes</el-radio>
                <el-radio value="h">Hours</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Label" :label-width="formLableWidth">
              <el-input v-model="item.tags" :disabled="isReadonly" clearable></el-input>
            </el-form-item>
          </div>
        </div>
      </el-col>
      <el-col v-else :span="24">
        <RuleTiggerSensors v-model:id="logId"></RuleTiggerSensors>
      </el-col>
    </el-row>
    <el-row v-if="!isAutoLog" v-show="moduleIndex == '3'">
      <el-row class="form-row">
        <span>Add Metrics</span>
      </el-row>
      <div v-for="(item, index) in logForm.metricsDetail" :key="index" class="operation-row">
        <div v-if="!isReadonly" class="form-btn">
          <svg-icon v-if="index == 0" icon-class="add-form" class-name="current-item" @click="addMetricsItem" />
          <svg-icon icon-class="subtract-form" class-name="current-item" @click="removeMetricsItem(index)" />
        </div>
        <div class="sensor-row">
          <el-form-item label="Metric" :label-width="formLableWidth">
            <el-input v-model="item.sensorName" :disabled="isReadonly" clearable />
          </el-form-item>
          <el-form-item label="Range" style="display: flex" :label-width="formLableWidth">
            <el-input v-model="item.rangeStart" :disabled="isReadonly" clearable style="width: 80px" />
            <span style="margin-left: 8px; margin-right: 8px">-</span>
            <el-input v-model="item.rangeEnd" :disabled="isReadonly" clearable style="width: 80px" />
          </el-form-item>
          <el-form-item label="Unit" :label-width="formLableWidth">
            <el-input v-model="item.unit" :disabled="isReadonly" clearable style="width: 80px" />
          </el-form-item>
          <el-form-item label="Label" :label-width="formLableWidth">
            <el-input v-model="item.tags" :disabled="isReadonly" clearable></el-input>
          </el-form-item>
        </div>
      </div>
    </el-row>

    <div class="btn-group">
      <el-button class="cancel" plain @click="close()">Cancel</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="save()">Save</el-button>
    </div>
  </el-form>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus';
import { logDetail, saveLogInfo } from '@/api/maintenance/deviceLogbook/manualLog';
import { deviceList, sensorList, dataTypeList, deviceInfo, logNameList, logTagList } from '@/api/maintenance/deviceLogbook/deviceManagement';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
interface Props {
  config: {
    id?: string;
    category: string;
    canEdit?: boolean;
    equipmentId: string;
    type: string;
  };
}
const relationId = computed(() => props.config?.id || '');
const dialogLoading = ref(true);
const formHeight = ref(600);
const props = defineProps<Props>();
const logFormRef = ref<ElFormInstance>();
interface LogSensorForm {
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
interface LogMetricsForm {
  sensorName: string;
  rangeStart: string;
  rangeEnd: string;
  unit: string;
  frequency: number;
  duration: number;
  tags: string;
}
interface LogForm {
  id: string;
  creationDate: string;
  name: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  location: string;
  environment: string;
  environmentKey: string;
  environmentValue: string;
  keyEvent: string | string[];
  operationState: string | string[];
  observations: string;
  ruleId: string;
  ruleName: string;
  remind: boolean;
  tags: string;
  startTimestamp: string;
  endTimestamp: string;
  logType: string;
  sensorDetail: LogSensorForm[];
  metricsDetail: LogMetricsForm[];
  comments: string;
}
const logForm = ref<LogForm>({
  id: '',
  name: '',
  creationDate: '',
  equipmentId: '',
  equipmentName: '',
  category: '',
  location: '',
  environment: '',
  environmentKey: '',
  environmentValue: '',
  keyEvent: '',
  operationState: '',
  observations: '',
  remind: true,
  tags: '',
  startTimestamp: '',
  endTimestamp: '',
  ruleId: '',
  ruleName: '',
  logType: '',
  sensorDetail: [],
  metricsDetail: [],
  comments: ''
});
const rules = reactive<FormRules<LogForm>>({
  name: [
    {
      required: true,
      message: 'Please Input Log Name',
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
  startTimestamp: [
    {
      required: true,
      message: 'Please Select Start Time',
      trigger: 'change'
    }
  ],
  endTimestamp: [
    {
      required: true,
      message: 'Please Select End Time',
      trigger: 'change'
    }
  ]
});
const emit = defineEmits(['close', 'save']);
const locations = ref([]);
const equipments = ref([]);
const sensors = ref([]);
const logNames = ref([]);
const environments = ref(['temperature', 'humidity']);
const logCategory = ref('');
const isReadonly = ref(false);
const isAutoLog = ref(false);
const isTemplate = ref(false);
const showAutoLogBtn = ref(false);
const formLableWidth = '90px';
const hasSelectEquipment = ref(true);
const moduleIndex = ref('1');
const logId = ref(props.config?.id ?? '');
const lableList = ref([]);
const restaurants = ref([
  { 'value': 'Running' },
  { 'value': 'Idle' },
  { 'value': 'Paused' },
  { 'value': 'Stopped' },
  { 'value': 'Starting up' },
  { 'value': 'Shutting down' },
  { 'value': 'Standby' }
]);
const tagList = ref([]);
const updateSensorData = (sensorId, newDataType) => {
  logForm.value.sensorDetail.forEach((item) => {
    if (item.sensorId == sensorId) {
      item.dataTypes = newDataType;
    }
  });
};
const handleSelect = (item) => {
  console.log(item);
};
const querySearch = (queryString, cb) => {
  let results = queryString ? restaurants.value.filter(createFilter(queryString)) : restaurants.value;
  // 调用 callback 返回建议列表的数据
  cb(results);
};
const createFilter = (queryString) => {
  return (restaurant) => {
    return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
};
const queryTagsSearch = (queryString, cb) => {
  let results = queryString ? tagList.value.filter(createTagsFilter(queryString)) : tagList.value;
  // 调用 callback 返回建议列表的数据
  cb(results);
};
const createTagsFilter = (queryString) => {
  return (tagList) => {
    return tagList.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
};
const addSensorItem = () => {
  logForm.value.sensorDetail.push({
    sensorId: '',
    sensorName: '',
    dataType: '',
    rangeStart: '',
    rangeEnd: '',
    unit: '',
    frequency: 0,
    duration: 0,
    durationUnit: 'm',
    tags: ''
  });
};
const removeSensorItem = (index: number) => {
  logForm.value.sensorDetail.splice(index, 1);
  if (logForm.value.sensorDetail.length == 0) {
    addSensorItem();
  }
};
const addMetricsItem = () => {
  logForm.value.metricsDetail.push({
    sensorName: '',
    rangeStart: '',
    rangeEnd: '',
    frequency: 0,
    duration: 0,
    unit: '',
    tags: ''
  });
};
const removeMetricsItem = (index: number) => {
  logForm.value.metricsDetail.splice(index, 1);
  if (logForm.value.metricsDetail.length == 0) {
    addMetricsItem();
  }
};
// 关闭
const close = () => emit('close');

const save = () => {
  logFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const formData = JSON.parse(JSON.stringify(logForm.value));
      if (formData.keyEvent) {
        if (Array.isArray(formData.keyEvent)) {
          formData.keyEvent = formData.keyEvent.join(',');
        }
      }
      if (formData.operationState) {
        if (Array.isArray(formData.operationState)) {
          formData.operationState = formData.operationState.join(',');
        }
      }
      //过滤掉空集合
      formData.sensorDetail = formData.sensorDetail.filter((item) => item.sensorId !== '');
      formData.metricsDetail = formData.metricsDetail.filter((item) => item.sensorName !== '');
      let newStartDate = formData.startTimestamp ? new Date(formData.startTimestamp).toISOString() : '';
      let newEndDate = formData.endTimestamp ? new Date(formData.endTimestamp).toISOString() : '';
      formData.startTimestamp = null;
      formData.endTimestamp = null;
      formData.category = props.config.category;

      let submitJson = Object.assign(formData, { 'logType': '0' }, { 'startIsoDate': newStartDate }, { 'endIsoDate': newEndDate });
      saveLogInfo(submitJson).then((res) => {
        proxy?.$modal.msgSuccess('Operation successful');
        emit('save');
      });
    }
  });
};
const logInfo = async () => {
  logForm.value.sensorDetail = [];
  logForm.value.metricsDetail = [];
  await logDetail(props.config.id).then((res) => {
    logForm.value = res.data;
    logCategory.value = res.data.category;
    if (logForm.value.keyEvent) {
      logForm.value.keyEvent = logForm.value.keyEvent.toString().split(',');
    }
    if (logForm.value.operationState) {
      logForm.value.operationState = logForm.value.operationState.toString().split(',');
    }
    if (logForm.value.equipmentId) {
      getSensorListByDevice(logForm.value.equipmentId);
    }
    if (logForm.value.sensorDetail == null) {
      logForm.value.sensorDetail = [];
    }
    if (logForm.value.sensorDetail.length == 0) {
      addSensorItem();
    }
    if (logForm.value.metricsDetail == null) {
      logForm.value.metricsDetail = [];
    }
    if (logForm.value.metricsDetail.length == 0) {
      addMetricsItem();
    }
    if (logForm.value.logType == '0') {
      //手动日志
      isAutoLog.value = false;
    } else {
      //自动日志
      isAutoLog.value = true;
    }
  });
};
const getDeviceList = () => {
  deviceList().then((res) => {
    equipments.value = res.data;
  });
};
const getLogTagList = () => {
  logTagList().then((res) => {
    if (res.data) {
      tagList.value = res.data.map((label) => ({ 'value': label }));
    }
  });
};
const getSensorListByDevice = (deviceId) => {
  getLogNameList();
  sensors.value = [];
  sensorList(deviceId).then((res) => {
    sensors.value = res.data;
  });
};
const getDataTypeListBySensor = (sensorId) => {
  dataTypeList(sensorId).then((res) => {
    updateSensorData(sensorId, res.data);
  });
};
const deviceChange = () => {
  logForm.value.sensorDetail = [];
  logForm.value.keyEvent = '';
  logForm.value.operationState = '';
  logNames.value = [];
  addSensorItem();
  if (logForm.value.equipmentId) {
    getSensorListByDevice(logForm.value.equipmentId);
  }
};
const sensorChange = (item) => {
  if (item.sensorId) {
    getDataTypeListBySensor(item.sensorId);
  } else {
    item.dataType = '';
    item.unit = '';
  }
};
const dataTypeChange = (item) => {
  if (item.dataType) {
    const matchingObject = item.dataTypes.find((o: any) => o.dataType == item.dataType);
    if (matchingObject) {
      item.unit = matchingObject.unit;
    }
  } else {
    item.unit = '';
  }
};
const initializeLogForm = async () => {
  //加载空Sensor
  addSensorItem();
  //加载空Metrics
  addMetricsItem();
  //加载tag集合列表
  getLogTagList();
  //判断是否指定设备
  if (!props.config.equipmentId) {
    //加载设备列表
    await getDeviceList();
  } else {
    hasSelectEquipment.value = false;
  }
  if (props.config) {
    logCategory.value = props.config.category;
    if (logCategory.value == 'operation') {
      restaurants.value = [
        { 'value': 'Running' },
        { 'value': 'Idle' },
        { 'value': 'Paused' },
        { 'value': 'Stopped' },
        { 'value': 'Starting up' },
        { 'value': 'Shutting down' },
        { 'value': 'Standby' }
      ];
    } else {
      restaurants.value = [
        { 'value': 'Power On/Off' },
        { 'value': 'Restart' },
        { 'value': 'Standby' },
        { 'value': 'Fault Occurred' },
        { 'value': 'Error Code [Input]' },
        { 'value': 'Emergency Stop' },
        { 'value': 'Maintenance Start/End' },
        { 'value': 'Scheduled Maintenance Missed' },
        { 'value': 'Software Update' },
        { 'value': 'Component Replacement' },
        { 'value': 'Alarm Triggered/Resolved' }
      ];
    }
    if (props.config.id) {
      await logInfo();
    } else {
      await setLogTypeAndEquipment();
    }
    if (!props.config.canEdit) {
      isReadonly.value = true;
    }
  }
  if (isAutoLog.value) {
    lableList.value = ['Basic Info', 'Add Sensor'];
  } else {
    lableList.value = ['Basic Info', 'Add Sensor', 'Add Metrics'];
  }
};
const setLogTypeAndEquipment = () => {
  if (props.config.type == '0') {
    isAutoLog.value = false;
  } else {
    isAutoLog.value = true;
  }
  if (props.config.equipmentId) {
    logForm.value.equipmentId = props.config.equipmentId;
    equipmentInfo(props.config.equipmentId);
    getSensorListByDevice(logForm.value.equipmentId);
  }
};
const equipmentInfo = (id: string) => {
  deviceInfo(id).then((res) => {
    logForm.value.equipmentName = res.data.equipmentName;
  });
};
const getLogNameList = () => {
  if (!logForm.value.equipmentId) {
    return;
  }
  if (logCategory.value) {
    logNameList(logCategory.value == 'event' ? 'operation' : 'event', logForm.value.equipmentId).then((res) => {
      logNames.value = res.data;
    });
  }
};

onMounted(async () => {
  await initializeLogForm();
  dialogLoading.value = false;
});
</script>
<style scoped>
.btn-group {
  height: 15%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.sensor-row {
  flex: 1;
  display: inline-flex;
  flex-wrap: wrap;
}
.form-row {
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  margin-left: 20px;
  height: 60px;
  display: flex;
  align-items: center;
}
.add-btn {
  margin-left: 20px;
}
.current-item {
  width: 22px;
  height: 22px;
  margin-right: 16px;
  cursor: pointer;
}
.operation-row {
  display: flex;
}
.form-btn {
  width: 100px;
  display: flex;
  justify-content: end;
}
.form-content {
  height: 400px;
}
</style>
