<template>
  <el-dialog
    v-model="dialogVisible"
    :title="header"
    width="800px"
    :show-close="false"
    class="work-order-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">
        <span>{{ header }}</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="work-order-info">
      <!-- 顶部信息卡片 -->
      <div class="info-cards">
        <div class="info-card">
          <svg-icon icon-class="active-start-time" />
          <div class="card-content">
            <div class="card-label">{{ form.startTime || '2023-05-01 12:45:59 AM' }}</div>
            <div class="card-sublabel">Active Start Time</div>
          </div>
        </div>

        <div class="info-card">
          <svg-icon icon-class="active-completion-time" />
          <div class="card-content">
            <div class="card-label">{{ form.completionTime || '-' }}</div>
            <div class="card-sublabel">Active Completion Time</div>
          </div>
        </div>
      </div>

      <!-- 评分卡片 -->
      <div class="score-cards">
        <div class="score-card">
          <div class="score-value">{{ form.qualityScore || '100.00' }} %</div>
          <div class="score-label">Quality Score</div>
          <div class="score-sublabel">Quality Rating (1-100)</div>
        </div>

        <div class="score-card">
          <div class="score-value">{{ form.efficiencyScore || '90.88' }} %</div>
          <div class="score-label">Efficiency Score</div>
          <div class="score-sublabel">Efficiency Rating (1-100)</div>
        </div>
      </div>

       <div v-if="kind === 'ai'" class="tabs-container">
          <div class="tabs">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              class="tab"
              :class="{ active: activeTab === tab.value }"
              @click="changeCurrentTab(tab)"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>

      <!-- 工作订单详情 -->
      <div class="work-order-details-section" v-show="activeTab === 'detail'"  :class="{ 'view-mode': type === 'view' }">
        <div class="section-title mb-6">Work Order Details</div>

        <el-form :model="form" label-width="120px" class="details-form grid grid-cols-2 gpa-3" size="large" :disabled="type === 'view'">
          <el-form-item label="Name" class="col-span-full">
            <div class="pl-3 value">{{ form.name }}</div>
          </el-form-item>

          <el-form-item label="Type">
            <div class="pl-3 value">{{ form.workOrderType }}</div>
          </el-form-item>

          <el-form-item label="Source">
            <div class="pl-3 value">{{ form.source }}</div>
          </el-form-item>

          <el-form-item label="Priority">
            <el-select v-model="form.priority" placeholder="Select priority" class="full-width">
              <el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="Status">
            <el-select v-model="form.status" placeholder="Select status" class="full-width">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="Assignee ID">
            <el-select v-model="form.assigneeId" filterable allow-create placeholder="Select assignee" class="full-width">
              <el-option v-for="item in assigneeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="Reporter ID">
            <el-select v-model="form.reporterId" filterable allow-create placeholder="Select reporter" class="full-width">
              <el-option v-for="item in reporterOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="Effective Date" class="col-span-full">
            <el-date-picker
              v-model="form.effectiveDate"
              type="daterange"
              range-separator="-"
              start-placeholder="Start Date"
              end-placeholder="End Date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
          </el-form-item>

          <el-form-item label="Duration" class="col-span-full">
            <div id="setting-duration" class="duration-input">
              <el-input-number v-model="form.duration" :min="1" :max="999" size="default" />
              <el-select v-model="form.durationUnit" style="width: 120px; margin-left: 10px">
                <el-option label="Minutes" value="min" />
                <el-option label="Hours" value="h" />
              </el-select>
            </div>
          </el-form-item>

          <el-form-item label="Work Order Explanation" class="col-span-full">
            <el-input v-model="form.explanation" type="textarea" :rows="4" placeholder="Enter work order explanation" />
          </el-form-item>
        </el-form>
      </div>

      <div class="work-order-details-section" v-show="activeTab === 'ai'" >
         <div class="section-title mb-6">AI Recommended Details</div>
         <div class="f-full flex flex-col gap-3">
         <div class="info-item">
            <label> Risk Level </label>
            <span> {{ form.riskLevel }} </span>
          </div>
          <div class="info-item flex justify-between">
            <div class="info-item flex flex-row flex-1"> 
              <label> AI Reason </label>
              <span> {{ form.aiReason }} </span>
            </div>
            <el-tooltip class="box-item" effect="light" :content="form.urgency" placement="top" popper-class="custom-tooltip">
              <el-button size="small" type="primary" plain style="width: 140px"> 
                <span class="pr-2">Urgency Factors</span> <el-icon class="info-default-icon"><InfoFilled /></el-icon>
              </el-button>
              
            </el-tooltip>
          </div>
          <div class="full flex">
            <div class="info-item flex-1">
            <label> Generated by Model </label>
            <span> {{ form.generatedByModel }} </span>
          </div>
          <div class="info-item flex-1">
            <label> Data Sources </label>
            <span> {{ form.dataSources }} </span>
          </div>
          </div>
          <div class="full flex">
             <div class="info-item flex-1">
            <label> Acceptance Status </label>
            <span> {{ form.acceptanceStatus }} </span>
          </div>
          <div class="info-item flex-1">
            <label> Accepted by </label>
            <span> {{ form.acceptedBy }} </span>
          </div>
          </div>
         </div>
      </div>

      <!-- 备注和文档 -->
      <div class="notes-section"  :class="{ 'view-mode': type === 'view' }">
        <div class="section-title mb-6">Notes and Documentation</div>

        <div class="flex flex-row w-full gap-4 items-center mb-8">
          <div class="subsection-label">Materials Used</div>
          <div class="materials-tags flex-1">
            <el-tag v-for="(material, index) in form.materials" :key="index" closable @close="removeMaterial(index)" class="material-tag">
              {{ material.name }} - ${{ material.price.toFixed(2) }}
            </el-tag>
            <el-button v-if="editPhone" size="small" @click="addMaterial" type="primary" plain>Add Material</el-button>
          </div>
        </div>

        <div class="flex flex-row w-full gap-4 items-center mb-8">
          <div class="subsection-label">Photos</div>
          <div class="photos-container flex-1">
            <div v-for="(photo, index) in form.photos" :key="index" class="photo-item">
              <div class="photo-preview" @click="viewPhoto(photo)">
                <img v-if="photo.url" :src="photo.url" alt="Work-order" />
                <div v-else class="empty-photo"></div>
              </div>
              <el-button v-if="editPhone" size="small" @click="removePhoto(index)" type="danger" circle plain>
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div v-if="editPhone" class="add-photo" @click="addPhoto" :class="{ 'disabled': form.photos.length >= 10 }">
              <el-icon><Plus /></el-icon>
              <span>Add Photo</span>
              <span v-if="form.photos.length >= 10" class="limit-text">Maximum 10 photos</span>
            </div>
          </div>
        </div>

        <div class="flex flex-row w-full gap-4 items-center">
          <div class="subsection-label">Notes</div>
          <el-input class="flex-1" v-model="form.notes" type="textarea" :rows="4" placeholder="Enter additional notes" :disabled="type === 'view'" />
        </div>
      </div>

      <!-- 指标监控 -->
      <div class="metrics-monitoring-section"  :class="{ 'view-mode': type === 'view' }">
        <div class="section-title flex items-center gap-2 mb-6">
          Metrics Monitoring(Optional)
          <el-tooltip content="Track metrics like temperature, occupancy, or supply levels." placement="top" effect="light">
            <el-icon class="info-default-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>

        <div class="metrics-selector" :class="{ 'not-allowed': type === 'view' }">
          <div class="metrics-name flex gap-6 items-center w-full">
            <div class="w-20 text-right">Metrics Name</div>
            <el-button v-if="type !== 'view'" type="primary" @click="addMetric">Add Metrics</el-button>
          </div>
        </div>

        <div class="metrics-tags ml-26">
          <el-tag v-for="(metric, index) in form.metrics" :key="index" :type="metric.type" closable @close="removeMetric(index)" class="metrics-tag">
            {{ metric.text }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="save">{{ saveButtonText }}</el-button>
      </div>
    </template>
  </el-dialog>
  <add-sensor-monitoring
    ref="sensorRef"
    v-model:visible="showSensorDialog"
    :default-selected="sensorsSelected"
    :type="sensorType"
    @submit="onSensorsSelected"
  />
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, InfoFilled, Plus } from '@element-plus/icons-vue';
import { updateWorkOrder } from '@/api/clean/task';
import AddSensorMonitoring from '@/views/cleaning/taskCenter/AddSensorMonitoring.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  header: {
    type: String,
    default: 'View & Edit Active Work Order'
  },
  type: {
    type: String,
    default: 'edit' // 'view' or 'edit' or 'create'
  },
  workOrderData: {
    type: Object,
    default: () => ({})
  },
  editPhone: {
    type: Boolean,
    default: false
  },
  curData: {
    type: Object,
    default: () => ({})
  },
  kind: {
    type: String,
    default: ''
  }
});

const activeTab = ref('detail');
const tabs = reactive([
  { label: 'Work Order Details', value: 'detail' },
  { label: 'AI Recommended Details ', value:  'ai'}
])
const changeCurrentTab = (tab) => {
  activeTab.value = tab.value;
};
const emit = defineEmits(['update:visible', 'save', 'close']);
const showSensorDialog = ref(false);
const sensorsSelected = ref([]);
const sensorType = ref('scheduled');
const sensorRef = ref(null);
console.log(props.workOrderData);

const dialogVisible = ref(props.visible);
const selectedMetric = ref('');

// 计算保存按钮文本
const saveButtonText = computed(() => {
  if (props.type === 'view') return 'OK';
  if (props.type === 'create') return 'Create';
  return 'Save';
});

// 表单数据
const form = reactive({
  // 基本信息
  name: '',
  type: '',
  source: '',
  workOrderType: '',
  priority: 'medium',
  status: 'active',
  assigneeId: '',
  reporterId: '',
  effectiveDate: '',
  duration: 30,
  durationUnit: 'minutes',
  explanation: '',

  // 评分
  startTime: '',
  completionTime: '',
  qualityScore: 100,
  efficiencyScore: 90.88,

  // 材料和文档
  materials: [],
  photos: [{ url: '' }, { url: '' }, { url: '' }],
  notes: '',

  // 指标
  metrics: []
});

// 选项数据
const priorityOptions = [
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' }
];

const workOrderTypeOptions = [
  { label: 'Maintenance Check', value: 'maintenance' },
  { label: 'Active Work Order', value: 'active' },
  { label: 'Inspection', value: 'inspection' },
  { label: 'Cleaning', value: 'cleaning' }
];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

const assigneeOptions = [];

const reporterOptions = [];

const metricsOptions = [
  { label: 'Temperature - Room Monitoring', value: 'temperature' },
  { label: 'Air Quality - HVAC Performance', value: 'air_quality' },
  { label: 'Occupancy - Space Utilization', value: 'occupancy' },
  { label: 'Supply Levels - Restroom Supplies', value: 'supplies' }
];

// 添加材料
const addMaterial = () => {
  form.materials.push({
    name: 'New Material',
    price: 5.0
  });
};

// 移除材料
const removeMaterial = (index) => {
  form.materials.splice(index, 1);
};

const getSensorList = (sensors) => {
  return sensors.map((d) => {
    return {
      text: `${d.label} - ${d.desc}`,
      type: d.severity,
      value: d.value
    };
  });
};
const onSensorsSelected = (sensors) => {
  sensorsSelected.value = sensors.map((d) => d.value);
  //  { text: 'Temperature Too High - Exceeds 30°C - Very Severe', type: 'danger' },
  form.metrics = getSensorList(sensors);
  showSensorDialog.value = false;
};

// 添加照片
const addPhoto = () => {
  // 创建一个隐藏的文件输入元素
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // 监听文件选择事件
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      // 创建一个FileReader来读取文件
      const reader = new FileReader();

      // 文件大小限制10M
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('File size exceeds 10M limit.');
        return;
      }
      reader.onload = (e) => {
        // 将读取的图片数据添加到photos数组
        form.photos.push({
          url: e.target.result,
          file: file,
          name: file.name
        });
      };
      // 读取文件为DataURL
      reader.readAsDataURL(file);
    }
    // 移除临时创建的input元素
    document.body.removeChild(fileInput);
  });

  // 触发文件选择对话框
  fileInput.click();
};

// 移除照片
const removePhoto = (index) => {
  form.photos.splice(index, 1);
};

// 查看照片
const viewPhoto = (photo) => {
  if (photo.url) {
    // 实现照片查看逻辑
    ElMessage.info('Viewing photo');
  }
};

// 添加指标
const addMetric = () => {
  showSensorDialog.value = true;
};

// 移除指标
const removeMetric = (index) => {
  form.metrics.splice(index, 1);
  sensorRef.value?.updateStatus(index);
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 保存工作订单
const save = async () => {
  if(props.type === 'view') {
    handleClose();
    return;
  }
  // 构建提交数据
  const submitData = { ...form };

  submitData.photosUrls = form.photos.map((photo) => photo.url);

  if (props.type !== 'edit') return;

  const res = await updateWorkOrder(submitData);

  console.log('Saving work order:', res);

  // 传递更多信息给父组件，包括操作类型，以便父组件可以正确更新filteredLocations
  emit('save', {
    type: 'edit',
    data: submitData,
    workOrderId: submitData.workOrderId,
    zoneId: props.workOrderData?.zoneId || props.curData?.zoneId
  });
  
  ElMessage.success('Work order saved successfully!');
  handleClose();
};

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    console.log(props.curData, props.curData.name, 'showEditDialog.value = true;');
    const data = props.curData;
    const initialData = {
      // 基本信息
      workOrderId: data.workOrderId,
      name: data.name,
      type: data.workOrderType,
      source: data.source,
      workOrderType: data.workOrderType,
      priority: data.priority,
      status: data.status,
      assigneeId: data.assigneeId,
      reporterId: data.reporterId,
      effectiveDate: [data.startTime, data.dueTime],
      duration: data.duration,
      durationUnit: data.durationUnit,
      explanation: data.description,

      // 评分
      startTime: data.actualStartTime,
      completionTime: data.actualCompletionTime,
      qualityScore: data.qualityScore || '--',
      efficiencyScore: data.efficiencyScore || '--',

      // 材料和文档
      materials: data.materialsUsed || [],
      photos: (data.photosUrls || []).map((d) => {
        return { url: d };
      }),
      notes: data.notes,

      // 指标
      metrics: getSensorList(sensorRef.value?.getSensors(data.metrics))
    };

    if(props.kind === 'ai') {
      data.aiDetails = data.aiDetails || {}
      Object.assign(initialData, {
        // 评分
        riskLevel: data.aiDetails.riskLevel || '--',
        aiReason: data.aiDetails.aiReason || '--',
        generatedByModel: data.aiDetails.generatedByModel || '--',
        dataSources: data.aiDetails.dataSources || '--',

        // 评分
        acceptanceStatus: data.aiDetails.acceptanceStatus || '--',
        acceptedBy: data.aiDetails.acceptedBy || '--',
        urgency: data.aiDetails.urgencyFactors || '--',
      })

    }
    Object.assign(form, initialData);
  }
);

// 监听对话框状态变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
    if (!newVal) {
      emit('close');
    }
  }
);

// 初始化默认材料
if (form.materials.length === 0) {
  form.materials = [
    { name: 'HEPA-13 Filters (4 units)', price: 45.0 },
    { name: 'Filter Adhesive Tape - 50m', price: 5.0 },
    { name: 'Filter Adhesive Tape - 10m', price: 3.0 },
    { name: 'Tape - 50m', price: 5.0 }
  ];
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.work-order-dialog {
  .dialog-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    height: 64px;
    min-width: 224px;
    padding: 11px 12px;
    gap: 16px;
    .close-btn {
      color: #222;
      font-size: 18px;
      &:hover {
        background: #f5f7fa;
      }
    }
  }

  .section-title {
    color: var(--VI-text-B12);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
  }

  .subsection-title {
    color: #11191e;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    margin: 20px 0 12px 0;
  }

  .subsection-label {
    width: 120px;
    text-align: right;
  }

  .info-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
      background: linear-gradient(
          90deg,
          var(--VI-GradientVI-GD_0, rgba(76, 144, 205, 0.05)) 7.76%,
          var(--VI-GradientVI-GD_15, rgba(70, 119, 186, 0.05)) 21.59%,
          var(--VI-GradientVI-GD_34, rgba(65, 93, 168, 0.05)) 39.1%,
          var(--VI-GradientVI-GD_53, rgba(61, 75, 155, 0.05)) 56.61%,
          var(--VI-GradientVI-GD_74, rgba(58, 64, 147, 0.05)) 75.96%,
          var(--VI-GradientVI-GD_97, rgba(58, 61, 145, 0.05)) 97.16%,
          var(--VI-GradientVI-GD_100, rgba(58, 61, 145, 0.05)) 99.93%
        ),
        var(--layout-bg_Element, #fff);
      flex: 1;

      svg {
        width: 40px;
        height: 40px;
      }

      .card-icon {
        font-size: 24px;
        color: #0099ff;
      }

      .card-content {
        display: flex;
        flex-direction: column;

        .card-label {
          color: $color-blue;
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: 22px;
        }

        .card-sublabel {
          color: var(--VI-text-B12);
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 16px;
        }
      }
    }
  }

  .score-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .score-card {
      flex: 1;
      padding: 16px 24px;
      border-radius: 8px;
      border: 1px solid $color-light-gray;
      background: var(--layout-bg_TextSelection, #fff);

      .score-value {
        color: var(--VI-text-B12);
        font-size: 28px;
        font-style: normal;
        font-weight: 600;
        line-height: 34px;
        margin-bottom: 6px;
      }

      .score-label {
        color: var(--VI-text-B12);
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }

      .score-sublabel {
        color: var(--VI-text-B49);
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
      }
    }
  }

  .tabs-container {
      display: flex;
      justify-content: center;
      margin-left: 1rem;
      margin-top: -8px;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid $color-light-gray;

      .tabs {
        display: flex;
        background-color: #f0f2f5;
        border-radius: 20px;
        padding: 4px;

        .tab {
          display: flex;
          height: 28px;
          padding: 0px 12px;
          width: 200px;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          gap: 8px;
          flex: 1 0 0;
          text-align: center;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;

          /* 133.333% */
          &.active {
            color: var(--layout-bg_TextSelection, #fff);

            border-radius: 100px;
            background: var(--layout-bg_focus, #09f);
            box-shadow:
              0px 10px 15px -3px rgba(0, 153, 255, 0.4),
              0px 4px 6px -2px var(--colors-flat-B12-flat10, rgba(17, 25, 30, 0.1));
          }
        }
      }
    }

  .work-order-details-section,
  .notes-section,
  .metrics-monitoring-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .work-order-details-section {
    .info-item {
      display: flex;
      gap: 24px;
      label {
        width: 140px;
        overflow: hidden;
color: var(--VI-text-B12);
text-align: right;
text-overflow: ellipsis;
font-size: 14px;
font-style: normal;
text-align: right;
font-weight: 400;
line-height: 16px;
      }

      span {
        color: var(--VI-text-B12);
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: 16px; 
      }
    }
  }

  .details-form {
    border-radius: 8px;

    .value {
      color: var(--VI-text-B12, #11191e);
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }

    .el-form-item__label {
      overflow: hidden;
      color: var(--VI-text-B12, #11191e);
      text-align: right;
      text-overflow: ellipsis;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .full-width {
      width: 100%;
    }
  }

  .duration-input {
    display: flex;
    align-items: center;
  }

  .materials-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .material-tag {
      display: flex;
      height: 28px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 100px;
      background: rgba(0, 153, 255, 0.1);
      border-color: transparent;
      color: #0099ff;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
    }
  }

  .photos-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;

    .photo-item {
      position: relative;
      width: 100px;
      height: 100px;

      .photo-preview {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 1px dashed #d3dbe0;
        background-color: #f7fafd;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .empty-photo {
          width: 100%;
          height: 100%;
          background-color: #f7fafd;
        }
      }

      .el-button {
        position: absolute;
        top: -8px;
        right: -8px;
        padding: 4px;
        font-size: 12px;
      }
    }

    .add-photo {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      border: 1px dashed #d3dbe0;
      background-color: #f7fafd;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #909399;
      position: relative;
      overflow: hidden;

      &:hover {
        color: #0099ff;
        border-color: #0099ff;
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
        border-color: #d3dbe0;
        color: #c0c4cc;
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      span {
        font-size: 12px;
      }

      .limit-text {
        position: absolute;
        bottom: 5px;
        font-size: 10px;
        color: #f56c6c;
        text-align: center;
        width: 100%;
        padding: 0 5px;
      }
    }
  }

  .metrics-selector {
    margin-bottom: 16px;

    &.not-allowed {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.8;
    }
  }

  .metrics-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    .metrics-tag {
      display: flex;
      height: 28px;
      padding: 0px 12px;
      justify-content: center;
      align-items: center;
      gap: 8px;
      border-radius: 100px;
      background: rgba(0, 153, 255, 0.1);
      border-color: transparent;
      color: #0099ff;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  :deep(.el-select__wrapper) {
    min-height: 40px;
    width: 100% !important;
  }
}
.view-mode {
  cursor: not-allowed;
  pointer-events: none;
}
:deep(.el-date-editor) {
  width: 100% !important;
}

:deep(.el-form-item__label) {
  display: flex;
  align-items: center;
  width: 90px;
  height: auto;
  color: var(--VI-text-B12);
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

:deep(.el-select__wrapper),
:deep(.el-input__wrapper),
:deep(.el-range-editor.el-input__wrapper) {
  border-radius: 4px;
  border: 1px solid var(--VI-text-B12, #11191e);
}

#setting-duration {
  :deep(.el-input-number.is-controls-right .el-input-number__increase),
  :deep(.el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase) {
    --el-input-number-controls-height: 32px;
    height: 32px !important;
    line-height: 32px !important;
  }
  :deep(.el-input__wrapper) {
    border: 1px solid var(--VI-text-B12, #a2aaaf);
  }
}

:deep(.el-range-editor--large .el-range-input) {
  height: 34px;
}
</style>
