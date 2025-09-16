<template>
  <el-dialog v-model="dialogVisible" :show-close="false" width="700px" class="sensor-monitoring-dialog" align-center :before-close="handleClose">
    <template #header>
      <div class="dialog-title">
        <span>Add Sensor Monitoring</span>
      </div>
      <el-button link circle class="close-btn" @click="handleClose">
        <el-icon><Close /></el-icon>
      </el-button>
    </template>

    <div class="section-label">Select which sensors you want to monitor for this work order template</div>

    <div class="sensor-grid">
      <div
        v-for="sensor in sensors"
        :key="sensor.value"
        class="sensor-card"
        :class="{ selected: selectedSensors.includes(sensor.value) }"
        @click="toggleSensor(sensor.value)"
      >
        <div class="icon">
          <svg-icon :icon-class="sensor.icon" />
        </div>
        <div class="info">
          <div class="label" :class="sensor.severity">{{ sensor.label }}</div>
          <div class="desc">{{ sensor.desc }}</div>
        </div>
        <el-checkbox :model-value="selectedSensors.includes(sensor.value)" class="sensor-checkbox" @change.stop />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="submit">Add Selected Sensors</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultSelected: { type: Array, default: () => [] },
  sensorOptions: {
    type: Array,
    default: () => {
      return [];
    }
  },
  type: {
    type: String,
    default: ''
  }
});
const scheduleTriggers = [
  {
    value: 'temperature',
    label: 'Temperature',
    severity: 'normal',
    desc: 'Monitor room temperature',
    icon: 'temp'
  },
  {
    value: 'air_quality',
    label: 'Air Quality',
    severity: 'normal',
    desc: 'Monitor air cleanliness',
    icon: 'air-quality'
  },
  {
    value: 'hand_soap',
    label: 'Hand Soap Level',
    severity: 'normal',
    desc: 'Soap dispenser status',
    icon: 'hand-soap'
  },
  {
    value: 'waste_bin',
    label: 'Waste Bin Level',
    severity: 'normal',
    desc: 'How full trash bins are',
    icon: 'waste-bin'
  },
  {
    value: 'humidity',
    label: 'Humidity',
    severity: 'normal',
    desc: 'Track moisture levels',
    icon: 'humidity-mornitoring'
  },
  {
    value: 'occupancy',
    label: 'Occupancy',
    severity: 'normal',
    desc: 'Count people in space',
    icon: 'occupancy-mornitoring'
  },
  {
    value: 'toilet_paper',
    label: 'Toilet Paper Level',
    severity: 'normal',
    desc: 'Paper dispenser status',
    icon: 'toilet-paper'
  },
  {
    value: 'energy_usage',
    label: 'Energy Usage',
    severity: 'normal',
    desc: 'Power consumption data',
    icon: 'energy-usage'
  }
];
const alertTriggers = [
  {
    value: '25',
    label: 'Temprature Too High',
    category: 'temperature',
    severity: 'high',
    desc: 'Exceeds 25°C',
    icon: 'temp'
  },
  {
    value: '18',
    label: 'Temprature Too Low',
    category: 'temperature',
    severity: 'low',
    desc: 'Drops below 18°C',
    icon: 'temp'
  },
  {
    value: '70',
    category: 'humidity',
    label: 'High Humidity',
    severity: 'high',
    desc: 'Exceeds 70%',
    icon: 'humidity-mornitoring'
  },
  {
    value: '150',
    category: 'air_quality',
    label: 'Poor Air Quality',
    severity: 'high',
    desc: 'EAQI exceeds 150',
    icon: 'air-quality'
  },
  {
    value: '80',
    category: 'occupancy',
    label: 'High Occupancy',
    severity: 'low',
    desc: 'Space exceeds 80% capacity',
    icon: 'occupancy-mornitoring'
  },
  {
    value: '20',
    category: 'hand_soap',
    label: 'Hand Soap Running Too Low',
    severity: 'high',
    desc: 'Soap level drops below 20%',
    icon: 'hand-soap'
  },
  {
    value: '15',
    category: 'toilet_paper',
    label: 'Toilet Paper Running Low',
    severity: 'high',
    desc: 'Paper level drops below 15%',
    icon: 'toilet-paper'
  },
  {
    value: '85',
    category: 'waste_bin',
    label: 'Waste Bin Nearly Full',
    severity: 'middle',
    desc: 'Bin reaches 85% capacity',
    icon: 'waste-bin'
  },
  {
    value: '150',
    category: 'energy_usage',
    label: 'Energy Usage',
    severity: 'low',
    desc: 'Exceeds 150% of average',
    icon: 'energy-usage'
  }
];
const emit = defineEmits(['update:visible', 'submit', 'close']);

const dialogVisible = ref(props.visible);
const selectedSensors = ref([...props.defaultSelected]);
const sensors = ref(props.type === 'scheduled' ? scheduleTriggers : alertTriggers);

watch(
  () => props.visible,
  (val) => (dialogVisible.value = val)
);
watch(
  () => dialogVisible.value,
  (val) => emit('update:visible', val)
);

watch(
  () => props.type,
  (val) => {
    console.log('val', val); // Add this line to check the value of val when it changes t
    sensors.value = val === 'scheduled' ? scheduleTriggers : alertTriggers;
  }
);

const toggleSensor = (val) => {
  const idx = selectedSensors.value.indexOf(val);
  if (idx === -1) selectedSensors.value.push(val);
  else selectedSensors.value.splice(idx, 1);
};

const handleClose = () => {
  dialogVisible.value = false;
  emit('close');
};

const submit = () => {
  const data = sensors.value.filter((sensor) => selectedSensors.value.includes(sensor.value));
  emit('submit', data);
  dialogVisible.value = false;
};

const updateStatus = (index) => {
  console.log(index, 'updateStatus');
  selectedSensors.value.splice(index, 1);
};

const getSensors = (data) => {
  const arr = data.map((d) => d.dataType);
  return sensors.value.filter((sensor) => arr.includes(sensor.value) || arr.includes(sensor.category));
};

defineExpose({
  updateStatus,
  getSensors
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.sensor-monitoring-dialog {
  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0 8px 0 0;
    .close-btn {
      color: #222;
      font-size: 18px;
      &:hover {
        background: #f5f7fa;
      }
    }
  }
  .section-label {
    color: var(--VI-text-B12, #11191e);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    margin: 12px 0 24px 0;
  }
  .sensor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 24px;
  }
  .sensor-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    cursor: pointer;
    transition:
      border 0.2s,
      box-shadow 0.2s;
    position: relative;
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
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px #e5e7eb;
    }
    &.selected {
      border-color: $color-blue;
      background: #e6f3ff;
    }
    .icon {
      width: 40px;
      height: 40px;
      svg {
        width: 40px;
        height: 40px;
      }
    }
    .info {
      flex: 1;
      .label {
        font-size: 18px;
        font-weight: 700;
        line-height: 22px;
        color: $color-blue;
      }
      .normal {
        color: $color-blue;
      }
      .high,
      .severity {
        color: $color-red;
      }
      .medium,
      .middle {
        color: $color-orange;
      }
      .low {
        color: $color-green;
      }
      .desc {
        color: var(--VI-text-B12, #11191e);
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px;
      }
    }
    .sensor-checkbox {
      position: absolute;
      right: 18px;
      top: 18px;
      pointer-events: none;
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
