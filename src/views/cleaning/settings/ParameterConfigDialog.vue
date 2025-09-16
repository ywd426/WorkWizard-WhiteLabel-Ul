<template>
  <el-dialog
    v-model="dialogVisible"
    title="Parameter Configuration"
    width="600px"
    class="settings-dialog parameter-config-dialog"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="Location">
        <el-select v-model="form.location" placeholder="Select location" class="full-width">
          <el-option label="Building A" value="building_a"></el-option>
          <el-option label="Building B" value="building_b"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Floor">
        <el-select v-model="form.floor" placeholder="Select floor" class="full-width">
          <el-option label="Floor 1" value="floor_1"></el-option>
          <el-option label="Floor 2" value="floor_2"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Sub-location">
        <el-select v-model="form.subLocation" placeholder="Select sub-location" class="full-width">
          <el-option label="Room 101" value="room_101"></el-option>
          <el-option label="Room 102" value="room_102"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Category">
        <el-select v-model="form.category" placeholder="Select category" class="full-width">
          <el-option label="Temperature" value="temperature"></el-option>
          <el-option label="Humidity" value="humidity"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Target">
        <el-select v-model="form.target" placeholder="Select target" class="full-width">
          <el-option label="Target 1" value="target_1"></el-option>
          <el-option label="Target 2" value="target_2"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveConfig">Save Parameter Settings</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialogVisible = ref(props.modelValue);

// 表单数据
const form = reactive({
  location: '',
  floor: '',
  subLocation: '',
  category: '',
  target: ''
});

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  emit('update:modelValue', false);
};

// 保存配置
const saveConfig = () => {
  emit('save', form);
  handleClose();
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听 dialogVisible 变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  }
);
</script>

<style lang="scss" scoped>
@import '@/assets/styles/settings-dialog.scss';

.parameter-config-dialog {
  .full-width {
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
  }
}
</style>
