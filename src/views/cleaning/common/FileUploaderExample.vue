<template>
  <div class="file-uploader-example">
    <h2>FileUploader Component Examples</h2>
    
    <div class="example-section">
      <h3>Basic Usage</h3>
      <file-uploader
        v-model:modelValue="basicFiles"
        @upload-success="handleBasicUploadSuccess"
        @upload-error="handleBasicUploadError"
      />
    </div>
    
    <div class="example-section">
      <h3>Drag Upload</h3>
      <file-uploader
        v-model:modelValue="dragFiles"
        :drag="true"
        :fileType="['jpg', 'jpeg', 'png', 'gif']"
        :fileSize="10"
        dragText="Drop image here or click to upload"
        @upload-success="handleDragUploadSuccess"
      />
    </div>
    
    <div class="example-section">
      <h3>Custom Button</h3>
      <file-uploader
        v-model:modelValue="customFiles"
        :autoUpload="false"
        :multiple="true"
        :limit="5"
        ref="customUploaderRef"
      >
        <template #trigger>
          <el-button type="success" size="large">
            <el-icon><Upload /></el-icon>
            Custom Upload Button
          </el-button>
        </template>
      </file-uploader>
      
      <div class="action-buttons">
        <el-button type="primary" @click="submitCustomUpload">Submit Upload</el-button>
        <el-button @click="clearCustomUpload">Clear Files</el-button>
      </div>
    </div>
    
    <div class="example-section">
      <h3>Image List</h3>
      <file-uploader
        v-model:modelValue="imageFiles"
        :fileType="['jpg', 'jpeg', 'png', 'gif']"
        :fileSize="2"
        :limit="10"
        buttonText="Upload Images"
        tipText="Upload your image files"
        @file-change="handleImageFileChange"
      />
      
      <div class="image-preview" v-if="imageFiles.length > 0">
        <h4>Uploaded Images:</h4>
        <div class="image-list">
          <div v-for="(file, index) in imageFiles" :key="index" class="image-item">
            <img :src="file.url" :alt="file.name" />
            <div class="image-name">{{ file.name }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="example-section">
      <h3>Document Upload</h3>
      <file-uploader
        v-model:modelValue="documentFiles"
        :fileType="['pdf', 'doc', 'docx', 'xls', 'xlsx']"
        :fileSize="20"
        :limit="3"
        buttonText="Upload Documents"
        buttonType="warning"
        buttonSize="large"
        :showIcon="true"
        tipText="Upload your document files"
        @upload-success="handleDocUploadSuccess"
        @upload-error="handleDocUploadError"
        @exceed="handleDocExceed"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import FileUploader from './FileUploader.vue';

// 基本用法文件列表
const basicFiles = ref([]);

// 拖拽上传文件列表
const dragFiles = ref([]);

// 自定义按钮文件列表
const customFiles = ref([]);
const customUploaderRef = ref(null);

// 图片列表
const imageFiles = ref([]);

// 文档列表
const documentFiles = ref([]);

// 基本上传处理函数
const handleBasicUploadSuccess = (res, file) => {
  ElMessage.success(`File ${file.name} uploaded successfully`);
};

const handleBasicUploadError = (error, file) => {
  ElMessage.error(`File ${file.name} upload failed`);
};

// 拖拽上传处理函数
const handleDragUploadSuccess = (res, file) => {
  ElMessage.success(`Image ${file.name} uploaded successfully`);
};

// 自定义按钮上传处理函数
const submitCustomUpload = () => {
  customUploaderRef.value?.submit();
};

const clearCustomUpload = () => {
  customUploaderRef.value?.clearFiles();
};

// 图片列表处理函数
const handleImageFileChange = (fileList) => {
  console.log('Image files changed:', fileList);
};

// 文档上传处理函数
const handleDocUploadSuccess = (res, file) => {
  ElMessage.success(`Document ${file.name} uploaded successfully`);
};

const handleDocUploadError = (error, file) => {
  ElMessage.error(`Document ${file.name} upload failed`);
};

const handleDocExceed = (files, fileList) => {
  ElMessage.warning(`You can only upload up to 3 documents. You selected ${files.length} files this time.`);
};
</script>

<style scoped>
.file-uploader-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #409eff;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.image-preview {
  margin-top: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.image-item {
  width: 150px;
  text-align: center;
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.image-name {
  margin-top: 5px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>