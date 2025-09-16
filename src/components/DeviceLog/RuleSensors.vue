<template>
  <div v-for="(item, index) in sensorDetails" :key="index">
    <ElDivider />
    <el-row class="form-row">
      <span style="width: 152px">Add Sensor {{ index + 1 }}</span>
      <div v-if="!mergedConfig.isReadonly" class="form-btn">
        <svg-icon icon-class="subtract-form" class-name="current-item" @click="removeSensorItem(index)" />
        <svg-icon v-if="index == sensorDetails.length - 1" icon-class="add-form" class-name="current-item" @click="addSensorItem" />
      </div>
    </el-row>
    <div class="sensor-row">
      <el-form-item label="Sensor" :label-width="formLableWidth">
        <el-select
          v-model="item.sensorId"
          clearable
          filterable
          placeholder="Please Select Sensor"
          :disabled="mergedConfig.isReadonly"
          @change="sensorChange(item)"
        >
          <el-option v-for="sensorItem in sensors" :key="sensorItem.sensorId" :label="sensorItem.sensorName" :value="sensorItem.sensorId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Data Type" :label-width="formLableWidth">
        <el-select
          v-model="item.dataType"
          clearable
          filterable
          placeholder="Please Select"
          :disabled="mergedConfig.isReadonly"
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
        <el-input v-model="item.rangeStart" clearable :disabled="mergedConfig.isReadonly" style="width: 80px" />
        <span style="margin-left: 8px; margin-right: 8px">-</span>
        <el-input v-model="item.rangeEnd" clearable :disabled="mergedConfig.isReadonly" style="width: 80px" />
        <span style="margin-left: 8px">{{ item.unit }}</span>
      </el-form-item>
    </div>
    <el-col :span="24" class="logic-row">
      <el-row class="trigger-title"><span>Trigger Logic</span></el-row>
      <el-row style="display: flex; align-items: center; gap: 8px">
        Notify when readings exceed thresholds for
        <el-input-number
          v-model="item.duration"
          controls-position="right"
          :precision="precision"
          :min="0"
          style="width: 100px; margin-left: 4px"
        ></el-input-number>
        <el-select v-model="item.durationUnit" class="radio-group" style="width: 120px">
          <el-option v-for="unitItem in unitList" :key="unitItem.id" :label="unitItem.name" :value="unitItem.id"></el-option>
        </el-select>
        , if this occurs
        <el-input-number v-model="item.frequency" controls-position="right" :min="1" style="width: 80px; margin-left: 4px"></el-input-number> times
        within
        <el-input-number
          v-model="item.timeWindow"
          controls-position="right"
          :precision="precision"
          :min="0"
          style="width: 100px; margin-left: 4px"
        ></el-input-number>
        <el-select v-model="item.timeWindowUnit" class="radio-group" style="width: 120px; margin-left: 4px">
          <el-option v-for="unitItem in unitList" :key="unitItem.id" :label="unitItem.name" :value="unitItem.id"></el-option>
        </el-select>
      </el-row>
    </el-col>
  </div>
</template>
<script lang="ts" setup>
import { sensorList, dataTypeList } from '@/api/maintenance/deviceLogbook/deviceManagement';

interface Props {
  config: {
    sensorList?: SensorForm[];
    isReadonly?: boolean;
    equipmentId: string;
  };
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps<Props>();
const defaultConfig = {
  sensorList: [],
  isReadonly: false,
  equipmentId: ''
};
const mergedConfig = computed(() => ({
  ...defaultConfig,
  ...props.config
}));
const sensorDetails = ref<SensorForm[]>([]);
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
  timeWindow?: number;
  timeWindowUnit?: string;
  tags: string;
  dataTypes?: any[];
}
const formLableWidth = '90px';
const sensorLoading = ref(false);
const sensors = ref([]);
const precision = ref(2);
const unitList = ref([
  { 'id': 'm', name: 'Minutes' },
  { 'id': 'h', name: 'Hours' }
]);
const addSensorItem = () => {
  sensorDetails.value.push({
    sensorId: '',
    sensorName: '',
    dataType: '',
    rangeStart: '',
    rangeEnd: '',
    unit: '',
    frequency: 0,
    duration: 0,
    durationUnit: 'm',
    timeWindow: 0,
    timeWindowUnit: 'm',
    tags: ''
  });
};
const removeSensorItem = (index: number) => {
  sensorDetails.value.splice(index, 1);
  if (sensorDetails.value.length == 0) {
    addSensorItem();
  }
};
const sensorChange = (item) => {
  if (item.sensorId) {
    getDataTypeListBySensor(item.sensorId);
    sensors.value.find((sensorItem) => {
      if (sensorItem.sensorId == item.sensorId) {
        item.sensorName = sensorItem.sensorName;
      }
    });
  } else {
    item.dataType = '';
    item.unit = '';
  }
};
const getDataTypeListBySensor = (sensorId) => {
  dataTypeList(sensorId).then((res) => {
    updateSensorData(sensorId, res.data);
  });
};
const updateSensorData = (sensorId, newDataType) => {
  sensorDetails.value.forEach((item) => {
    if (item.sensorId == sensorId) {
      item.dataTypes = newDataType;
    }
  });
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
const getSensorListByDevice = async (deviceId) => {
  sensorLoading.value = true;
  sensors.value = [];
  await sensorList(deviceId).then((res) => {
    sensors.value = res.data;
  });
  sensorLoading.value = false;
};
// 初始化传感器详情列表
const initSensorDetails = () => {
  if (mergedConfig.value.sensorList) {
    sensorDetails.value = [...mergedConfig.value.sensorList];
  } else {
    sensorDetails.value = [];
  }
};
const validateForm = (): boolean => {
  // 1. 基础检查 - 至少有一个有效传感器
  if (sensorDetails.value.every((item) => !item.sensorId)) {
    proxy?.$modal.msgError('Please add at least one sensor');
    return false;
  }

  // 2. 对每个有效传感器项进行验证
  for (const [index, item] of sensorDetails.value.entries()) {
    if (!item.sensorId) continue; // 跳过未选择的传感器

    const sensorLabel = item.sensorName ? `Sensor #${index + 1} (${item.sensorName})` : `Sensor #${index + 1}`;

    // 3. 定义验证规则
    const validations = [
      {
        condition: !item.dataType,
        message: `${sensorLabel}: Please select data type`
      },
      {
        condition: !item.rangeStart,
        message: `${sensorLabel}: Please input range start`
      },
      {
        condition: !item.rangeEnd,
        message: `${sensorLabel}: Please input range end`
      },
      {
        condition: isNaN(Number(item.rangeStart)),
        message: `${sensorLabel}: Range start must be a number`
      },
      {
        condition: isNaN(Number(item.rangeEnd)),
        message: `${sensorLabel}: Range end must be a number`
      },
      {
        condition: Number(item.rangeEnd) <= Number(item.rangeStart),
        message: `${sensorLabel}: Range end must be greater than start`
      },
      {
        condition: item.duration <= 0,
        message: `${sensorLabel}: Duration must be greater than 0`
      },
      {
        condition: item.frequency < 1,
        message: `${sensorLabel}: Frequency must be at least 1`
      },
      {
        condition: item.timeWindow <= 0,
        message: `${sensorLabel}: Time window must be greater than 0`
      }
    ];

    // 4. 执行验证
    for (const validation of validations) {
      if (validation.condition) {
        proxy?.$modal.msgError(validation.message);
        return false;
      }
    }
  }

  return true;
};
onMounted(async () => {
  addSensorItem();
  //判断是否指定设备
  if (mergedConfig.value.equipmentId) {
    getSensorListByDevice(mergedConfig.value.equipmentId);
  }
});

defineExpose({
  sensorDetails,
  validateForm
});
// 监听 config 的变化
watch(
  () => mergedConfig.value.equipmentId,
  (newConfig) => {
    if (newConfig) {
      sensorDetails.value = [];
      addSensorItem();
      getSensorListByDevice(newConfig);
    }
  },
  { deep: true, immediate: true } // 深度监听，立即执行
);
watch(
  () => props.config.sensorList,
  (newConfig) => {
    if (newConfig && newConfig.length > 0) {
      initSensorDetails();
    }
  },
  { deep: true, immediate: true } // 深度监听，立即执行
);
</script>
<style lang="scss" scoped>
.form-row {
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  height: 60px;
  display: flex;
  align-items: center;
}
.operation-row {
  display: flex;
}
.form-btn {
  display: flex;
  justify-content: start;
}
.current-item {
  width: 22px;
  height: 22px;
  margin-right: 16px;
  cursor: pointer;
}
.sensor-row {
  flex: 1;
  display: inline-flex;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.radio-group {
  padding-left: 8px;
}
.logic-row {
  border-radius: 16px;
  background: var(--el-card-primary-flat05);
  padding: 15px;
}
.trigger-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 16px;
  height: 24px;
}
</style>
