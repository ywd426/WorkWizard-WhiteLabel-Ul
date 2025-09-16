<template>
  <el-dialog v-model="dialogVisible" width="600px" :title="title" :before-close="handleClose">
    <div class="image-grid-card">
      <div class="grid-row">{{ prompt }}</div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button v-if="isDanger" type="danger" @click="deleteAction">Delete</el-button>
      <el-button v-if="isPrimary" type="primary" @click="deleteAction">Submit</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Delete Inspection'
  },
  type: {
    type: String,
    default: 'inspection'
  },
  prompt: {
    type: String,
    default: 'Are you sure you want to delete this'
  },
  name: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  isDanger: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update:visible', 'close', 'delete']);

const dialogVisible = ref(props.visible);
const deleteAction = () => {
  // 你的开始检查逻辑
  console.log('delete inspection', props.name);
  dialogVisible.value = false;
  emit('delete', props.name, props.isDanger);
};

const handleClose = () => {
  dialogVisible.value = false;
};

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
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
</script>

<style scoped>
.image-grid-card {
  padding: 32px 12px;
}

.image-grid-title {
  color: var(--VI-text-B12, #11191e);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: -0.144px;
  margin-bottom: 24px;
}

.image-grid-container {
  display: grid;
  grid-template-rows: repeat(2, auto);
  row-gap: 18px;
}

.image-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  align-items: center;
}
</style>
