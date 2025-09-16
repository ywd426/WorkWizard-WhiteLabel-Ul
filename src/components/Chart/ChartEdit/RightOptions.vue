<template>
  <div class="options">
    <div class="title">Edit</div>
    <div class="card">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
      >
        <el-collapse v-model="activeNames">
          <el-collapse-item title="Set a Time Range" name="0">
            <el-form-item label="Time unit">
              <el-radio-group v-model="ruleForm.rangeType">
                <el-radio value="1">Days</el-radio>
                <el-radio value="2">Hours</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Duration" prop="timeRange">
              <el-input-number v-model="ruleForm.timeRange" controls-position="right" :min="1" :max="255"></el-input-number>
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item title="Basic Information" name="1">
            <el-form-item v-if="!isEdit" label="Data type" prop="dataType">
              <el-select v-model="ruleForm.dataType" placeholder="Data type" :validate-event="false" @change="changeDataType">
                <el-option v-for="item in dataTypeList" :key="item.dataType" :label="item.dataName" :value="item.dataType"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-else label="Data type">
              <el-text>{{ ruleForm.dataName }}</el-text>
            </el-form-item>
            <el-form-item label="Chart title" prop="title">
              <el-input v-model="ruleForm.title" />
            </el-form-item>
            <ElDivider />
            <el-form-item label="Unit">
              <el-select v-if="ruleForm.dataType.toLowerCase() == 'temperature'" v-model="ruleForm.chartUnit" placeholder="Select Unit">
                <el-option v-for="item in unitList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
              <el-text v-else>{{ ruleForm.chartUnit }}</el-text>
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item title="Grid Lines" name="2">
            <el-form-item label="X Axis">
              <el-checkbox v-model="ruleForm.splitLineX"></el-checkbox>
            </el-form-item>
            <el-form-item label="Y Axis">
              <el-checkbox v-model="ruleForm.splitLineY"></el-checkbox>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { getDataTypeList } from '@/api/monitor/chartinfo';
const activeNames = ref(['0', '1']);

interface RuleForm {
  rangeType: string;
  timeRange: number;
  dataType: string;
  dataName: string;
  title: string;
  chartUnit: string;
  splitLineY: boolean;
  splitLineX: boolean;
}
interface DataTypeInfo {
  dataType: string;
  dataName: string;
  unit: string;
}
//是否编辑页面
const isEdit = ref(false);
const formSize = ref<ComponentSize>('default');
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  rangeType: '1',
  timeRange: 1,
  dataType: '',
  dataName: '',
  title: '',
  chartUnit: '',
  splitLineY: false,
  splitLineX: true
});
const rules = reactive<FormRules<RuleForm>>({
  dataType: [
    {
      required: true,
      message: 'Please Select DataType',
      trigger: 'change'
    }
  ],
  title: [
    {
      required: true,
      message: 'Please Enter Title',
      trigger: 'blur'
    }
  ],
  chartUnit: [
    {
      required: true,
      message: 'Please Select Unit',
      trigger: 'change'
    }
  ]
});
const dataTypeList = ref<DataTypeInfo[]>([]);
const unitList = ref(['°C', '°F']);
const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`
}));
const queryDataTypeList = (sensorId) => {
  ruleForm.dataName = '';
  ruleForm.dataType = '';
  getDataTypeList(sensorId).then((res) => {
    dataTypeList.value = res.data;
  });
};
const initDataTypeList = (dataType, dataName) => {
  ruleForm.dataName = dataName;
  ruleForm.dataType = dataType;
  dataTypeList.value.push({ dataType: dataType, dataName: dataName, unit: '' });
};
const changeDataType = () => {
  let curData = dataTypeList.value.find((item) => item.dataType === ruleForm.dataType);
  ruleForm.chartUnit = curData.unit;
  ruleForm.dataName = curData.dataName;
  if (!ruleForm.title) {
    ruleForm.title = curData.dataName;
  }
};
defineExpose({
  ruleForm,
  isEdit,
  queryDataTypeList,
  initDataTypeList
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
