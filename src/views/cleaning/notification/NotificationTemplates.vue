<template>
  <div class="notification-templates-container">
    <div class="notification-templates-content">
      <!-- 邮件模板 -->
      <div class="template-section">
        <div class="template-header">
          <h4>Email Template</h4>
        </div>
        <div class="template-items">
          <div class="template-item">
            <span>Container</span>
            <div class="template-item-content">
              <el-input
                v-model="templateData.email.alert.content"
                type="textarea"
                :rows="10"
                resize="none"
                placeholder="Enter email template content"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 短信模板 -->
      <div class="template-section">
        <div class="template-header">
          <h4>SMS Template</h4>
        </div>
        <div class="template-items">
          <div class="template-item">
            <span>Container</span>
            <div class="template-item-content">
              <el-input
                v-model="templateData.sms.alert.content"
                type="textarea"
                :rows="6"
                resize="none"
                placeholder="Enter SMS template content"
                maxlength="160"
                show-word-limit
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="action-buttons">
        <el-button @click="previousStep">Previous Step</el-button>
        <el-button type="primary" @click="saveSettings">Save All Settings</el-button>
        <el-button @click="resetToDefault">Reset to Default</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';

// 定义属性
const props = defineProps({
  // 接收父组件传递的数据
  modelValue: {
    type: Object,
    required: true
  },
  initData: {
    type: Object,
    default: () => ({})
  }
});

let orgData = [];

// 定义事件
const emit = defineEmits(['update:modelValue', 'previous-step', 'save', 'reset']);

// 可用变量列表
const availableVariables = [
  { label: 'System', value: '[SYSTEM]' },
  { label: 'Alert Type', value: '[AlertType]' },
  { label: 'Location', value: '[Location]' },
  { label: 'Severity', value: '[Severity]' },
  { label: 'Time', value: '[Timestamp]' },
  { label: 'Details', value: '[Details]' }
];

// 本地响应式数据，用于组件内部状态管理
const templateData = ref({
  email: {
    alert: {
      enabled: true,
      content:
        '[SYSTEM]\nAlert Type: [AlertType] detected in [Location]\nSeverity: [Severity]\nTime: [Timestamp]\nDetails: [Details]\n\nHello!\n\nPlease check the system or contact maintenance if this requires immediate attention.\nBest regards!'
    }
  },
  sms: {
    alert: {
      enabled: true,
      content: '[ALERT] [AlertType] in [Location] - [Severity] severity. Details: [Details]'
    }
  }
});

// 监听父组件传递的数据变化
// watch(
//   () => props.modelValue,
//   (newValue) => {
//     if (newValue) {
//       // 将父组件的数据同步到本地
//       Object.assign(templateData.value, newValue);
//     }
//   },
//   { deep: true, immediate: true }
// );

const getData = () => {
  const data = templateData.value;
  const names = Object.keys(data);
  const result = names.map((d) => {
    const node = data[d].alert;
    return {
      'id': node.id,
      'settingId': node.settingId,
      'templateType': node.templateType || d,
      'subject': node.subject,
      'content': node.content
    };
  });
  console.log(result, 'getData');

  return result;
};

const getTemplateData = (data) => {
  const result = {};
  data.forEach((d) => {
    result[d.templateType] = {
      alert: {
        id: d.id,
        settingId: d.settingId,
        enabled: true,
        templateType: d.templateType,
        content: d.content,
        subject: d.subject
      }
    };
  });
  return result;
};

watch(
  () => props.initData,
  (newValue) => {
    if (newValue) {
      // 将父组件的数据同步到本地
      // Object.assign(scheduleData, newValue);
      console.log(props.initData);
      const data = props.initData;
      if (Object.keys(data).length == 0) return;
      orgData = getTemplateData(data);
      templateData.value = JSON.parse(JSON.stringify(orgData));

      console.log('initData', data);
    }
  },
  { deep: true, immediate: true }
);

// 监听本地数据变化，同步到父组件
watch(
  templateData,
  (newValue) => {
    // 将本地数据同步到父组件
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
);

// 插入变量
const insertVariable = (type, template, variable) => {
  const textarea = document.querySelector(`textarea[aria-label="${templateData.value[type][template].content}"]`);
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = templateData.value[type][template].content;
    const newText = text.substring(0, start) + variable + text.substring(end);
    templateData.value[type][template].content = newText;

    // 设置光标位置
    setTimeout(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  } else {
    // 如果无法获取到 textarea 元素，则直接在末尾添加变量
    templateData.value[type][template].content += ` ${variable}`;
  }
};

// 上一步
const previousStep = () => {
  emit('previous-step');
};

// 保存设置
const saveSettings = () => {
  emit('save', templateData.value);
  ElMessage.success('Template settings saved successfully');
};

// 重置为默认设置
const resetToDefault = () => {
  ElMessageBox.confirm('Are you sure you want to reset template settings to default?', 'Warning', {
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    type: 'warning'
  })
    .then(() => {
      templateData.value = JSON.parse(JSON.stringify(orgData));

      emit('reset');
      ElMessage.success('Template settings reset to default');
    })
    .catch(() => {
      ElMessage.info('Reset cancelled');
    });
};

defineExpose({
  getData
});
</script>

<style lang="scss" scoped>
.notification-templates-container {
  padding: 16px;
  background-color: white;
}

.notification-templates-content {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.templates-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.templates-description {
  margin-bottom: 24px;

  p {
    color: #606266;
    font-size: 14px;
    margin: 0;
  }
}

.template-section {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
}

.template-header {
  margin-bottom: 16px;

  h4 {
    color: var(--VI-text-B12);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: -0.144px;
    margin-top: 0;
  }
}

.template-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-item {
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  gap: 24px;

  span {
    overflow: hidden;
    color: var(--VI-text-B12);
    text-align: right;
    text-overflow: ellipsis;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }
}

.template-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
}

.template-item-content {
  flex: 1;
  max-width: 560px;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.template-variables {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.variables-title {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

:deep(.el-tag) {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
  }
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}
</style>
