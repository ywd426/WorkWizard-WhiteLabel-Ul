<template>
  <el-form id="templateFormRef" ref="logFormRef" v-loading="dialogLoading" :model="logForm" :rules="rule" :inline="true" label-width="90px">
    <el-form-item label="Log Name" prop="name" class="el-log-form-item">
      <el-autocomplete
        v-model="logForm.name"
        :fetch-suggestions="querySearch"
        placeholder="Please Enter Log Name"
        clearable
        :disabled="isReadonly"
        @select="handleSelect"
      ></el-autocomplete>
    </el-form-item>
    <el-form-item v-if="hasSelectEquipment && !isReadonly" label="Equipment" prop="equipmentName" class="el-log-form-item">
      <Equipment v-model:modelValue="logForm.equipmentId" v-model:modelName="logForm.equipmentName" @change-equipment="deviceChange"></Equipment>
    </el-form-item>
    <el-form-item v-else label="Equipment" prop="equipmentName" class="el-log-form-item">
      <el-input v-model="logForm.equipmentName" disabled />
    </el-form-item>
    <el-form-item label="Environment" prop="environment" class="el-log-form-item">
      <el-select
        v-model="logForm.environmentModel.key"
        :disabled="isReadonly"
        filterable
        allow-create
        default-first-option
        placeholder="Please Select"
        style="width: 140px"
      >
        <el-option v-for="item in environments" :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <el-input v-model="logForm.environmentModel.value" :disabled="isReadonly" placeholder="Value" clearable style="width: 72px; margin-left: 8px" />
    </el-form-item>
    <el-form-item label="Start Time" prop="startTimestamp" class="el-log-form-item">
      <el-date-picker
        v-model="logForm.startTimestamp"
        type="datetime"
        :disabled="isReadonly"
        placeholder="Start Date"
        :disabled-date="disabledStartDate"
      ></el-date-picker>
    </el-form-item>
    <el-form-item label="End Time" prop="endTimestamp" class="el-log-form-item">
      <el-date-picker
        v-model="logForm.endTimestamp"
        type="datetime"
        :disabled="isReadonly"
        placeholder="End Date"
        :disabled-date="disabledStartDate"
      ></el-date-picker>
    </el-form-item>
    <el-form-item v-if="logForm.category == 'operation'" label="Key Events" prop="event" class="el-log-form-item">
      <el-select v-model="logForm.keyEvent" clearable filterable placeholder="Please Select Key Events" :disabled="isReadonly">
        <el-option v-for="item in logNames" :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-else label="Operation Status" prop="operationState" class="el-log-form-item">
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
    <el-form-item label="Tags" prop="tags" class="el-log-form-item">
      <el-autocomplete
        v-model="logForm.tags"
        :fetch-suggestions="queryTagsSearch"
        placeholder="Please Enter Tags"
        clearable
        :disabled="isReadonly"
        @select="handleSelect"
      ></el-autocomplete>
    </el-form-item>
    <el-form-item label="Rule Name" prop="ruleId" class="el-log-form-item">
      <el-select v-model="logForm.ruleId" clearable filterable placeholder="Please Select Rule" :disabled="isReadonly">
        <el-option v-for="item in rules" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-row>
      <el-form-item label="Observations" prop="observations" style="width: 80%">
        <el-input v-model="logForm.observations" :disabled="isReadonly" type="textarea" clearable />
      </el-form-item>
    </el-row>
    <Comment v-if="relationId" :relation-id="relationId" relation-type="3"></Comment>
    <el-col :span="24">
      <el-checkbox v-model="logForm.remind" :disabled="isReadonly">Remind everyone</el-checkbox>
    </el-col>
    <div class="btn-group">
      <el-button class="cancel" plain @click="close()">Cancel</el-button>
      <el-button v-if="!showAutoLogBtn && !isReadonly" type="primary" @click="save()">Save</el-button>
      <el-button v-if="showAutoLogBtn" type="success" @click="createAutoLog()">Generate Log</el-button>
    </div>
  </el-form>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus';
import * as useUtils from '@/utils/index';
import { templateDetail, saveTemplateInfo, rulesByTemplate } from '@/api/maintenance/deviceLogbook/automaticLog';
import { deviceList, deviceInfo, logNameList, logTagList } from '@/api/maintenance/deviceLogbook/deviceManagement';
import { saveLogInfo } from '@/api/maintenance/deviceLogbook/manualLog';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
interface Props {
  config?: {
    id?: string;
    category: string;
    equipmentId: string;
    canEdit?: boolean;
    autoLog?: boolean;
    notificationId?: string;
  };
}
const dialogLoading = ref(true);
const props = defineProps<Props>();
const logFormRef = ref<ElFormInstance>();
const relationId = computed(() => props.config?.id || '');
export interface BaseModel {
  key: string;
  value: string;
}
interface TemplateForm {
  id: string;
  name: string;
  equipmentId: string;
  equipmentName: string;
  startTimestamp: string;
  endTimestamp: string;
  category: string;
  location: string;
  keyEvent: string;
  operationState: string | string[];
  remind: boolean;
  autoLog: boolean;
  ruleId: string;
  tags: string;
  comments: string;
  observations: string;
  environmentModel: BaseModel;
}
const logForm = ref<TemplateForm>({
  id: '',
  name: '',
  equipmentId: '',
  equipmentName: '',
  startTimestamp: '',
  endTimestamp: '',
  category: '',
  location: '',
  keyEvent: '',
  operationState: '',
  ruleId: '',
  remind: true,
  autoLog: true,
  tags: '',
  comments: '',
  observations: '',
  environmentModel: { key: '', value: '' }
});
const rule = reactive<FormRules<TemplateForm>>({
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
  ruleId: [
    {
      required: true,
      message: 'Please Select Rule',
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
const environments = ref(['temperature', 'humidity']);
const hasSelectEquipment = ref(true);
const equipments = ref([]);
const isReadonly = ref(false);
const locations = ref([]);
const rules = ref([]);
const operationStates = ref(['Running', 'Idle', 'Paused', 'Stopped']);
const keyEvents = ref(['Power Surge', 'Software Update', 'Routine Check']);
const logNames = ref([]);
const showAutoLogBtn = ref(false);
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
const disabledStartDate = (time: Date) => {
  return time.getTime() <= Date.now() - 24 * 60 * 60 * 1000; // 禁用今天之前的所有日期
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
// 关闭
const close = () => emit('close');

const save = () => {
  logFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // 额外时间校验
      const now = new Date().getTime();
      const startTime = new Date(logForm.value.startTimestamp).getTime();
      const endTime = new Date(logForm.value.endTimestamp).getTime();

      if (startTime <= now) {
        proxy?.$modal.msgError('Start time must be greater than current time');
        return;
      }

      if (endTime <= startTime) {
        proxy?.$modal.msgError('End time must be greater than start time');
        return;
      }
      let newStartDate = logForm.value.startTimestamp ? new Date(logForm.value.startTimestamp).toISOString() : '';
      let newEndDate = logForm.value.endTimestamp ? new Date(logForm.value.endTimestamp).toISOString() : '';
      if (logForm.value.operationState) {
        if (Array.isArray(logForm.value.operationState)) {
          logForm.value.operationState = logForm.value.operationState.join(',');
        }
      }
      logForm.value.startTimestamp = useUtils.formatDate(logForm.value.startTimestamp);
      logForm.value.endTimestamp = useUtils.formatDate(logForm.value.endTimestamp);
      let submitJson = Object.assign(logForm.value, { 'startIsoDate': newStartDate }, { 'endIsoDate': newEndDate });
      saveTemplateInfo(submitJson).then((res) => {
        proxy?.$modal.msgSuccess('Operation successful');
        emit('save');
      });
    }
  });
};
const logInfo = async () => {
  await templateDetail(props.config.id).then((res) => {
    logForm.value = res.data;
    if (logForm.value.operationState) {
      logForm.value.operationState = logForm.value.operationState.toString().split(',');
    }
    if (!logForm.value.environmentModel) {
      logForm.value.environmentModel = { 'key': '', 'value': '' };
    }
    if (logForm.value.equipmentId) {
      getRuleList();
    }
  });
};
const getDeviceList = () => {
  deviceList().then((res) => {
    equipments.value = res.data;
  });
};
const deviceChange = () => {
  logForm.value.keyEvent = '';
  logForm.value.operationState = '';
  if (logForm.value.equipmentId) {
    getRuleList();
  } else {
    rules.value = [];
    logNames.value = [];
  }
};
const getRuleList = () => {
  getLogNameList();
  rulesByTemplate(logForm.value.equipmentId, logForm.value.category).then((res) => {
    rules.value = res.data;
  });
};
const createAutoLog = () => {
  logForm.value.id = '';
  let submitJson = Object.assign(logForm.value, { 'logType': '2', 'templateId': props.config.id });
  if (props.config.notificationId) {
    submitJson = Object.assign(submitJson, { 'notificationId': props.config.notificationId });
  }
  saveLogInfo(submitJson).then((res) => {
    proxy?.$modal.msgSuccess('Operation successful');
    emit('save');
  });
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
  if (logForm.value.category) {
    logNameList(logForm.value.category == 'event' ? 'operation' : 'event', logForm.value.equipmentId).then((res) => {
      logNames.value = res.data;
    });
  }
};
const getLogTagList = () => {
  logTagList().then((res) => {
    if (res.data) {
      tagList.value = res.data.map((label) => ({ 'value': label }));
    }
  });
};
onMounted(async () => {
  //判断是否指定设备
  if (!props.config.equipmentId) {
    //加载设备列表
    getDeviceList();
  } else {
    hasSelectEquipment.value = false;
  }
  getLogTagList();
  await nextTick(async () => {
    if (props.config) {
      logForm.value.category = props.config.category;
      isReadonly.value = false;
      showAutoLogBtn.value = false;
      if (props.config.autoLog) {
        //自动日志的通知
        showAutoLogBtn.value = true;
      }
      if (!props.config.canEdit) {
        isReadonly.value = true;
      }
      if (props.config.id) {
        await logInfo();
      } else if (props.config.equipmentId) {
        logForm.value.equipmentId = props.config.equipmentId;
        await equipmentInfo(props.config.equipmentId);
        await getRuleList();
      }
    }
  });
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
</style>
