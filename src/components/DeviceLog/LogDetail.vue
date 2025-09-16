<template>
  <el-form ref="logFormRef" :model="logForm" :inline="true" label-width="140px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="Log Name:">{{ logForm.logName }}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Date Range:">{{ logForm.startTimestamp }} - {{ logForm.endTimestamp }}</el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="Location:">{{ logForm.location }}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Equipment:">{{ logForm.equipmentName }}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Environment:">{{ logForm.environmentalConditions }}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Event:">{{ logForm.event }}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Tags:">{{ logForm.remarksTags }}</el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="Observations:">{{ logForm.comments }}</el-form-item>
      </el-col>
      <el-col :span="24">
        <el-row v-if="logForm.sensorList.length > 0" class="form-row">
          <span>Sensors</span>
        </el-row>
        <div v-for="(item, index) in logForm.sensorList" :key="index" class="operation-row">
          <div class="sensor-row">
            <el-form-item label="Sensor" :label-width="formLableWidth">
              {{ item.sensorName }}
            </el-form-item>
            <el-form-item label="Data Type" :label-width="formLableWidth">
              {{ item.dataType }}
            </el-form-item>
            <el-form-item label="Range" :label-width="formLableWidth"> {{ item.rangeStart }} - {{ item.rangeEnd }} </el-form-item>
            <el-form-item label="Frequency" :label-width="formLableWidth">
              {{ item.frequancy }}
            </el-form-item>
            <el-form-item label="Duration" :label-width="formLableWidth">
              {{ item.duration }}
            </el-form-item>
            <el-form-item label="Label" :label-width="formLableWidth">
              {{ item.label }}
            </el-form-item>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <el-row v-if="logForm.metricsList.length > 0" class="form-row">
          <span>Metrics</span>
        </el-row>
        <div v-for="(item, index) in logForm.metricsList" :key="index" class="operation-row">
          <div class="sensor-row">
            <el-form-item label="Sensor" :label-width="formLableWidth">
              {{ item.metricsName }}
            </el-form-item>
            <el-form-item label="Range" :label-width="formLableWidth"> {{ item.rangeStart }} - {{ item.rangeEnd }} </el-form-item>
            <el-form-item label="Frequency" :label-width="formLableWidth">
              {{ item.frequancy }}
            </el-form-item>
            <el-form-item label="Duration" :label-width="formLableWidth">
              {{ item.duration }}
            </el-form-item>
            <el-form-item label="Label" :label-width="formLableWidth">
              {{ item.label }}
            </el-form-item>
          </div>
        </div>
      </el-col>
      <ElDivider />
      <el-form-item label="Log comments" prop="equipmentName">
        <editor v-model="logForm.comments" :height="160" :min-height="40" />
      </el-form-item>
    </el-row>
    <div class="btn-group">
      <el-button type="primary" @click="save()">Save</el-button>
      <el-button class="cancel" plain @click="close()">Cancel</el-button>
    </div>
  </el-form>
</template>
<script lang="ts" setup>
const emit = defineEmits(['close', 'save']);
interface Props {
  config: {
    id: string;
    type: string;
  };
}
const formLableWidth = '90px';
const props = defineProps<Props>();
const logFormRef = ref<ElFormInstance>();
interface LogSensorForm {
  sensorName: string;
  dataType: string;
  rangeStart: string;
  rangeEnd: string;
  frequancy: number;
  duration: number;
  label: string;
}
interface LogMetricsForm {
  metricsName: string;
  rangeStart: string;
  rangeEnd: string;
  frequancy: string;
  duration: string;
  label: string;
}
interface LogForm {
  id: string;
  creationDate: string;
  logName: string;
  equipmentName: string;
  startTimestamp: string;
  endTimestamp: string;
  category: string;
  location: string;
  environmentalConditions: string;
  event: string;
  customEvent: string;
  state: string;
  remarksTags: string;
  sensorList: LogSensorForm[];
  metricsList: LogMetricsForm[];
  comments: string;
}
const logForm = ref<LogForm>({
  id: 'default-id',
  logName: 'Default Log Name',
  creationDate: '2023-10-01',
  equipmentName: 'Equipment A',
  startTimestamp: '2023-10-01T00:00:00Z',
  endTimestamp: '2023-10-01T23:59:59Z',
  category: 'General',
  location: 'Warehouse 1',
  environmentalConditions: 'Normal',
  event: 'Routine Check',
  customEvent: 'None',
  state: 'Active',
  remarksTags: 'No remarks',
  sensorList: [
    {
      sensorName: 'Temperature Sensor',
      dataType: 'Temperature',
      rangeStart: '0',
      rangeEnd: '100',
      frequancy: 1,
      duration: 60,
      label: 'Temperature'
    }
  ],
  metricsList: [
    {
      metricsName: 'Humidity',
      rangeStart: '0',
      rangeEnd: '100',
      frequancy: '1h',
      duration: '24h',
      label: 'Humidity'
    }
  ],
  comments: 'Initial log entry'
});
const close = () => emit('close');
const save = () => {
  console.log('save');
};
const getList = async () => {
  console.log('getList', props.config.id);
};
onMounted(async () => {
  await nextTick(() => {
    getList();
  });
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
