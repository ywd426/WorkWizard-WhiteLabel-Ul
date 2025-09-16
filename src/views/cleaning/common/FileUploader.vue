<template>
  <el-upload
    ref="fileUploadRef"
    v-model:file-list="fileList"
    :class="['upload-component', customClass]"
    :headers="upload.headers"
    :action="uploadUrl"
    :disabled="upload.isUploading || isReadonly"
    :multiple="multiple"
    :before-upload="handleBeforeUpload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :limit="limit"
    :list-type="listType"
    :on-exceed="handleExceed"
    :on-error="handleUploadError"
    :on-success="handleFileSuccess"
    :on-progress="handleFileUploadProgress"
    :accept="acceptTypes"
    :auto-upload="autoUpload"
    :drag="drag"
  >
    <template v-if="!isReadonly && !drag">
      <slot name="trigger">
        <el-button :type="buttonType" :size="buttonSize">
          <svg-icon v-if="showIcon" icon-class="upload" class-name="item-icon"></svg-icon>
          {{ buttonText }}
        </el-button>
      </slot>
    </template>

    <template v-if="drag">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        {{ dragText }}
      </div>
    </template>

    <template #tip>
      <div v-if="showTip && !isReadonly" class="el-upload__tip">
        {{ tipText }}
        <template v-if="fileSize">
          with a size not exceeding <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType && fileType.length > 0">
          in <b style="color: #f56c6c">{{ fileType.join('/') }}</b> format
        </template>
      </div>
    </template>

    <slot name="attachment"></slot>
  </el-upload>
</template>
<script lang="ts" setup>
import type { UploadProps, UploadInstance as ElUploadInstance, UploadRawFile } from 'element-plus';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';
import { delOss, listByIds } from '@/api/system/oss';
import { UploadFile as ElUploadFile, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { getCurrentInstance, ref, reactive, computed, watch, ComponentInternalInstance } from 'vue';

interface ImportOption {
  open: boolean;
  title: string;
  isUploading: boolean;
  updateSupport: number;
  headers: Record<string, string>;
  url: string;
}

const props = defineProps({
  // 绑定值
  modelValue: {
    type: [String, Object, Array],
    default: () => []
  },
  // 数量限制
  limit: propTypes.number.def(3),
  // 大小限制(MB)
  fileSize: propTypes.number.def(5),
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf']),
  // 是否显示提示
  isShowTip: propTypes.bool.def(true),
  // 是否只读模式
  isReadonly: propTypes.bool.def(false),
  // 列表类型
  listType: {
    type: String as () => 'picture-card' | 'picture' | 'text',
    default: 'picture-card'
  },
  // 是否支持多选文件
  multiple: propTypes.bool.def(true),
  // 是否自动上传
  autoUpload: propTypes.bool.def(true),
  // 是否启用拖拽上传
  drag: propTypes.bool.def(false),
  // 拖拽文本
  dragText: {
    type: String,
    default: 'Drop file here or click to upload'
  },
  // 上传按钮文本
  buttonText: {
    type: String,
    default: 'Attachment upload'
  },
  // 按钮类型
  buttonType: {
    type: String as () => '' | 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text',
    default: 'primary'
  },
  // 按钮大小
  buttonSize: {
    type: String as () => 'default' | 'large' | 'small',
    default: 'default'
  },
  // 是否显示图标
  showIcon: propTypes.bool.def(true),
  // 提示文本
  tipText: {
    type: String,
    default: 'Please upload file'
  },
  // 自定义类名
  customClass: {
    type: String,
    default: 'upload-demo'
  },
  // 自定义上传URL
  customUploadUrl: {
    type: String,
    default: ''
  },
  // 接受的文件类型
  acceptTypes: {
    type: String,
    default: ''
  }
});
interface UploadFile extends ElUploadFile {
  ossId?: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const fileUploadRef = ref<ElUploadInstance>();
const fileList = ref<any[]>([]);
const uploadList = ref<any[]>([]);
const uploadUrl = computed(() => props.customUploadUrl || import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload');

const emit = defineEmits([
  'update:modelValue',
  'upload-success',
  'upload-error',
  'upload-progress',
  'exceed',
  'remove',
  'preview',
  'before-upload',
  'file-change'
]);

const upload = reactive<ImportOption>({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload'
});

const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));
const number = ref(0);

// 上传前校检格式和大小
const handleBeforeUpload = (file: UploadRawFile) => {
  // 触发自定义事件，允许父组件处理上传前的逻辑
  emit('before-upload', file);

  // 校检文件类型
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1].toLowerCase();
    const isTypeOk = props.fileType.map((type: string) => type.toLowerCase()).indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy?.$modal.msgError(`The file format is incorrect. Please upload ${props.fileType.join('/')} format file!`);
      return false;
    }
  }

  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`The size of the uploaded file cannot exceed ${props.fileSize} MB!`);
      return false;
    }
  }

  proxy?.$modal.loading('Uploading files, please wait...');
  number.value++;
  return true;
};

// 文件列表移除文件时
const handleRemove: UploadProps['onRemove'] = (file: UploadFile, uploadFiles) => {
  if (file.ossId) {
    delOss(file.ossId);
  }
  emit('remove', file, uploadFiles);
  emit('update:modelValue', listToString(fileList.value));
};

// 点击文件列表中已上传的文件时
const handlePreview: UploadProps['onPreview'] = (uploadFile: UploadFile) => {
  emit('preview', uploadFile);
  if (uploadFile.ossId) {
    proxy?.$download?.oss(uploadFile.ossId);
  }
};

// 当超出限制时
const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  emit('exceed', files, uploadFiles);
  proxy?.$modal.msgError(
    `The limit is ${props.limit}, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length} totally`
  );
};

// 上传失败
const handleUploadError = (error: Error, file: UploadFile, fileList: UploadFile[]) => {
  emit('upload-error', error, file, fileList);
  proxy?.$modal.msgError('Failed to upload file');
};

// 删除文件之前
const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  if (!uploadFile.url) {
    return true;
  }
  return ElMessageBox.confirm(`Cancel the transfer of ${uploadFile.name} ?`).then(
    () => true,
    () => false
  );
};

// 文件上传中处理
const handleFileUploadProgress = (event: any, file: UploadFile, fileList: UploadFile[]) => {
  upload.isUploading = true;
  emit('upload-progress', event, file, fileList);
};

// 文件上传成功处理
const handleFileSuccess = (res: any, file: UploadFile) => {
  upload.isUploading = false;
  if (res.code === 200) {
    uploadList.value.push({
      name: res.data.fileName,
      url: res.data.url,
      ossId: res.data.ossId
    });
    emit('upload-success', res, file);
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy?.$modal.closeLoading();
    proxy?.$modal.msgError(res.msg);
    fileUploadRef.value?.handleRemove(file);
    uploadedSuccessfully();
  }
};

// 上传结束处理
const uploadedSuccessfully = () => {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit('update:modelValue', listToString(fileList.value));
    emit('file-change', fileList.value);
    proxy?.$modal.closeLoading();
    ElMessageBox.alert(
      "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>Upload completed</div>",
      'Upload results',
      {
        dangerouslyUseHTMLString: true
      }
    );
  }
};

// 获取文件名称
const getFileName = (name: string) => {
  // 如果是url那么取最后的名字 如果不是直接返回
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1);
  } else {
    return name;
  }
};

// 对象转成指定字符串分隔
const listToString = (list: any[], separator?: string) => {
  let strs = '';
  separator = separator || ',';
  list.forEach((item) => {
    if (item.ossId) {
      strs += item.ossId + separator;
    }
  });
  return strs != '' ? strs.substring(0, strs.length - 1) : '';
};

// 手动上传文件
const submit = () => {
  fileUploadRef.value?.submit();
};

// 清空上传列表
const clearFiles = () => {
  fileUploadRef.value?.clearFiles();
};

// 中止上传
const abort = (file?: UploadFile) => {
  fileUploadRef.value?.abort(file);
};

// 加载文件列表
watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      let temp = 1;
      // 首先将值转为数组
      let list: any[] = [];
      if (Array.isArray(val)) {
        list = val;
      } else if (typeof val === 'string' || typeof val === 'number') {
        const res = await listByIds(val as string | number);
        list = res.data.map((oss) => ({
          name: oss.originalName,
          url: oss.url,
          ossId: oss.ossId
        }));
      } else {
        console.error('Invalid modelValue type:', typeof val);
        return;
      }
      // 然后将数组转为对象数组
      fileList.value = list.map((item) => ({
        ...item,
        uid: item.uid || new Date().getTime() + temp++
      }));
    } else {
      fileList.value = [];
    }
  },
  { deep: true, immediate: true }
);

// 暴露方法给父组件
defineExpose({
  fileUploadRef,
  fileList,
  submit,
  clearFiles,
  abort
});
</script>
<style scoped>
.upload-component {
  display: flex;
  flex-direction: column;
}

.item-icon {
  margin-right: 13px;
  width: 19px;
  height: 16px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-upload-dragger .el-icon--upload) {
  font-size: 40px;
  color: var(--el-text-color-secondary);
  margin: 0 0 16px;
  line-height: 50px;
}

:deep(.el-upload-dragger .el-upload__text) {
  color: var(--el-text-color-regular);
  font-size: 14px;
  text-align: center;
}

:deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  overflow: hidden;
}

:deep(.el-upload--picture-card) {
  background-color: var(--el-fill-color-lighter);
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  box-sizing: border-box;
  transition: var(--el-transition-duration-fast);
}

:deep(.el-upload-list__item-status-label) {
  position: absolute;
  right: -15px;
  top: -6px;
  width: 40px;
  height: 24px;
  background: var(--el-color-success);
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2);
}

:deep(.el-upload-list__item-status-label i) {
  font-size: 12px;
  margin-top: 11px;
  transform: rotate(-45deg);
  color: #fff;
}

:deep(.el-upload-list__item-actions) {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: default;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

:deep(.el-upload-list__item-actions:hover) {
  opacity: 1;
}
</style>
