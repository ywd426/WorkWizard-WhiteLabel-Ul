# FileUploader 组件

一个基于 Element Plus 的文件上传组件，支持多种上传方式和自定义配置。

## 功能特点

- 支持单文件和多文件上传
- 支持拖拽上传
- 支持自定义按钮样式和文本
- 支持文件类型和大小限制
- 支持自定义上传 URL
- 支持只读模式
- 提供丰富的事件回调
- 支持手动控制上传过程

## 基本用法

```vue
<template>
  <file-uploader v-model:modelValue="fileList" />
</template>

<script setup>
import { ref } from 'vue';
import FileUploader from '@/views/cleaning/common/FileUploader.vue';

const fileList = ref([]);
</script>
```

## 拖拽上传

```vue
<template>
  <file-uploader
    v-model:modelValue="fileList"
    :drag="true"
    dragText="拖拽文件到此处或点击上传"
  />
</template>
```

## 自定义按钮

```vue
<template>
  <file-uploader
    v-model:modelValue="fileList"
    buttonText="上传文件"
    buttonType="success"
    buttonSize="large"
  >
    <template #trigger>
      <el-button type="primary">
        <el-icon><Upload /></el-icon>
        自定义上传按钮
      </el-button>
    </template>
  </file-uploader>
</template>
```

## 手动上传

```vue
<template>
  <file-uploader
    ref="uploaderRef"
    v-model:modelValue="fileList"
    :autoUpload="false"
  />
  <el-button @click="submitUpload">开始上传</el-button>
</template>

<script setup>
import { ref } from 'vue';
import FileUploader from '@/views/cleaning/common/FileUploader.vue';

const fileList = ref([]);
const uploaderRef = ref(null);

const submitUpload = () => {
  uploaderRef.value.submit();
};
</script>
```

## 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值，上传的文件列表 | Array/String/Object | [] |
| limit | 最大允许上传文件数量 | Number | 3 |
| fileSize | 上传文件大小限制（MB） | Number | 5 |
| fileType | 允许上传的文件类型 | Array | ['doc', 'xls', 'ppt', 'txt', 'pdf'] |
| isShowTip | 是否显示提示信息 | Boolean | true |
| isReadonly | 是否为只读模式 | Boolean | false |
| listType | 文件列表的类型 | String | 'picture-card' |
| multiple | 是否支持多选文件 | Boolean | true |
| autoUpload | 是否在选取文件后立即进行上传 | Boolean | true |
| drag | 是否启用拖拽上传 | Boolean | false |
| dragText | 拖拽区域显示的文本 | String | 'Drop file here or click to upload' |
| buttonText | 上传按钮显示的文本 | String | 'Attachment upload' |
| buttonType | 上传按钮的类型 | String | 'primary' |
| buttonSize | 上传按钮的大小 | String | 'default' |
| showIcon | 是否显示上传图标 | Boolean | true |
| tipText | 提示文本 | String | 'Please upload file' |
| customClass | 自定义类名 | String | 'upload-demo' |
| customUploadUrl | 自定义上传 URL | String | '' |
| acceptTypes | 接受的文件类型（MIME 类型） | String | '' |

## 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 文件列表更新时触发 | 更新后的文件列表字符串 |
| upload-success | 文件上传成功时触发 | (response, file) |
| upload-error | 文件上传失败时触发 | (error, file, fileList) |
| upload-progress | 文件上传进度变化时触发 | (event, file, fileList) |
| exceed | 文件超出个数限制时触发 | (files, fileList) |
| remove | 文件被移除时触发 | (file, fileList) |
| preview | 点击已上传的文件链接时触发 | (file) |
| before-upload | 上传文件之前触发 | (file) |
| file-change | 文件列表变化时触发 | (fileList) |

## 插槽

| 插槽名 | 说明 |
| --- | --- |
| trigger | 触发文件选择框的内容 |
| tip | 提示说明文字 |
| attachment | 附加内容 |

## 方法

通过 ref 可以获取到 FileUploader 实例并调用实例方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| submit | 手动上传文件列表 | - |
| clearFiles | 清空已上传的文件列表 | - |
| abort | 取消上传请求 | (file: UploadFile) 可选 |

## 示例

请参考 `FileUploaderExample.vue` 文件，其中包含了多种使用场景的示例。