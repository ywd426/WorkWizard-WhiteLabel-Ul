<template>
  <div ref="p2" class="p-2">
    <SwitchTag v-model:moduleIndex="moduleIndex" :tabs="lableList"></SwitchTag>
    <el-form
      ref="detectionFormRef"
      v-loading="dialogLoading"
      :model="detectionForm"
      :inline="true"
      label-width="140px"
      :style="{ height: formHeight + 'px' }"
    >
      <el-row v-show="moduleIndex == '1'" style="width: 100%">
        <el-form-item label="Fault Name">
          <el-input v-model="detectionForm.faultName" disabled />
        </el-form-item>
        <el-form-item label="Equipment">
          <el-input v-model="detectionForm.equipmentName" disabled />
        </el-form-item>
        <el-form-item label="Fault Status">
          <el-input v-model="detectionForm.faultStatus" disabled />
        </el-form-item>
        <el-form-item label="Severity">
          <el-input v-model="detectionForm.severity" disabled />
        </el-form-item>
        <el-form-item label="Start Time">
          <el-date-picker v-model="detectionForm.startTimestamp" type="datetime" disabled></el-date-picker>
        </el-form-item>
        <el-form-item label="End Time">
          <el-date-picker v-model="detectionForm.endTimestamp" type="datetime" disabled></el-date-picker>
        </el-form-item>
        <el-form-item label="Confidence Level">
          <el-input v-model="detectionForm.confidenceLevel" disabled />
        </el-form-item>
        <el-form-item label="Type">
          <el-input v-model="detectionForm.type" disabled />
        </el-form-item>
        <el-form-item label="Operational Mode">
          <el-input v-model="detectionForm.operationState" disabled />
        </el-form-item>
        <ElDivider />
        <el-row>
          <span>Feedback</span>
        </el-row>
        <el-col :span="24" style="display: flex; justify-content: start">
          <div class="slider-demo-block">
            <span class="demonstration">Fault accuracy rating</span>
            <el-slider v-model="detectionForm.faultAccuracyRating" :min="1" :max="10" :step="1" />
          </div>
          <div class="slider-demo-block" style="margin-left: 60px">
            <span class="demonstration">Duration detected rating</span>
            <el-slider v-model="detectionForm.durationDetectedRating" :min="1" :max="10" :step="1" />
          </div>
        </el-col>
        <Comment :relation-id="relationId" relation-type="7"></Comment>
      </el-row>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ElSlider } from 'element-plus';
import { FaultDetectionForm } from '@/api/maintenance/faultDetection/deviceManagement/types';
import { detectionInfo } from '@/api/maintenance/faultDetection/deviceManagement';
interface Props {
  config: {
    id: string;
  };
}
const props = defineProps<Props>();
const relationId = computed(() => props.config?.id || '');
const emit = defineEmits(['close']);
const lableList = ref(['Basic Info', 'Reasoning']);
const p2 = ref(null);
const dialogLoading = ref(true);
const moduleIndex = ref('1');
const detectionFormRef = ref<ElFormInstance>();
const detectionForm = ref<FaultDetectionForm>({
  id: '',
  faultName: '',
  equipmentName: '',
  faultStatus: '',
  severity: '',
  type: '',
  startTimestamp: '',
  endTimestamp: ''
});
const formHeight = ref(600);
// 关闭
const close = () => emit('close');
const getInfo = () => {
  detectionInfo(relationId.value).then((res) => {
    detectionForm.value = res.data;
    dialogLoading.value = false;
  });
};
const saveDetection = async () => {
  return true;
};
onMounted(() => {
  getInfo();
});
defineExpose({ saveDetection });
</script>
<style lang="scss" scoped>
.slider-demo-block {
  width: 380px;
  display: flex;
  align-items: center;
}
.slider-demo-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}
.slider-demo-block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}
.slider-demo-block .demonstration + .el-slider {
  flex: 0 0 180px;
}
.btn-group {
  height: 15%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
