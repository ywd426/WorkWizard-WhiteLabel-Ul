<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    width="800px"
    class="settings-dialog cost-baseline-dialog"
    :before-close="handleClose"
    align-center
  >
    <template #header>
      <div class="dialog-title">
        <span>Settings</span>
        <el-button link circle class="close-btn" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="filter-container">
      <span class="title">Cost Baseline</span>

      <el-button type="primary" plain @click="addBaseline">
        <el-icon><Plus /></el-icon> <span class="pl-1">Add Cost Baseline</span>
      </el-button>
      <el-button type="primary" plain @click="handleUploadExcel">
        <el-icon><Upload /></el-icon> <span class="pl-1">Upload Excel</span>
      </el-button>
    </div>

    <div class="settings-table">
      <el-table :data="paginatedData" style="width: 100%">
        <el-table-column prop="name" label="Team" min-width="20%"></el-table-column>
        <el-table-column prop="position" label="Position" min-width="25%"></el-table-column>
        <el-table-column prop="payRate" label="Pay Rate ($/h)" min-width="25%"></el-table-column>
        <el-table-column label="Actions" min-width="20%">
          <template #default="scope">
            <div class="w-full flex gap-4 items-center">
              <svg-icon icon-class="edit-card" @click="editRow(scope.row)" class="svg-default pt-1 pl-1" />
              <svg-icon icon-class="delete-card" class="svg-danger" @click="deleteRow(scope.row)" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length"
        :page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="save">Save Baseline</el-button>
      </div>
    </template>
  </el-dialog>
  <add-cost-baseline v-model:visible="showAddDialog" @save="addData" :cost-data="costData" />
  <delete-dialog v-model:visible="showDeleteDialog" @delete="handleTaskDelete" :name="deleteTaskId" />
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Edit, Delete } from '@element-plus/icons-vue';
import AddCostBaseline from '@/views/cleaning/settings/AddCostBaseline.vue';
import DeleteDialog from '@/views/cleaning/common/DeleteDialog.vue';

import { getBaselines, getBaselineDetail, deleteBaseline } from '@/api/clean/settings';
const props = defineProps({
  pageId: {
    type: String,
    default: 'alert-settings'
  },
  settingType: {
    type: Object,
    default: () => ({})
  },
  visible: {
    type: Boolean,
    default: false
  }
});
const showDeleteDialog = ref(false);
const deleteTaskId = ref('');
const costData = ref({});
const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(props.visible);
const showAddDialog = ref(false); // 控制添加成本基线对话框的显示与隐藏
const pageSize = ref(5); // 每页显示5条
const currentPage = ref(1);
// 表格数据
const tableData = ref([]);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});
const handleCurrentChange = (page) => {
  currentPage.value = page;
};
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
};

const addBaseline = () => {
  costData.value = {};
  showAddDialog.value = true;
};
// 成本表单数据
const costForm = reactive({
  name: '',
  position: '',
  payRate: 0,
  overtime: 0
});

const addData = async (data) => {
  await getList();
  showAddDialog.value = false; // 关闭对话框
};

const handleCreateTask = () => {
  console.log('create base line button');
};

const getList = async () => {
  const res = await getBaselines({
    pageSize: pageSize.value,
    pageNum: currentPage.value,
    isAsc: 'desc',
    firstNum: 0
  });
  console.log(res);
  const arr = [];
  res.rows?.forEach((d) => {
    arr.push({
      id: d.id,
      name: d.team,
      position: d.position,
      payRate: d.payRate,
      workingHours: d.workingHours,
      daysWeek: d.daysWeek
    });
  });
  tableData.value = arr;
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
// 监听 modelValue 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;

    if (newVal) {
      getList();
    }
  }
);
// 监听 dialogVisible 变化
watch(
  () => dialogVisible.value,
  (newVal) => {
    emit('update:visible', newVal);
    if (!newVal) {
      emit('close');
    }
  }
);
// 保存基线
const save = () => {
  emit('save', tableData.value);
  handleClose();
};

const handleUploadExcel = () => {
  console.log('upload excel');
};

const editRow = async (row) => {
  const res = await getBaselineDetail(row.id);
  costData.value = res.data;
  showAddDialog.value = true;
  console.log('edit row:', row, res);
};

const deleteRow = (row) => {
  console.log('delete row:', row);
  deleteTaskId.value = row.id || row.name;
  showDeleteDialog.value = true;
};

const handleTaskDelete = async (name) => {
  const res = await deleteBaseline(name);
  console.log(`delete task: ${name}`, res);

  if (res.code === 200) {
    getList();
  }

  showDeleteDialog.value = false;
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
@import '@/assets/styles/clean-panels.scss';
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  .el-dialog__header {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
  }

  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
    background-color: #fff;
  }
}

.svg-default {
  fill: $color-blue;
}
.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;

  .close-btn {
    margin-left: auto;
  }
}
.cost-baseline-dialog {
  .filter-container {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    padding-bottom: 0;
    align-items: center;
    button {
      margin-left: 0 !important;
    }

    .title {
      color: var(--VI-text-B12, #11191e);
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 16px;
      letter-spacing: -0.144px;
    }
  }

  .view-toggle {
    .el-button--primary.is-plain {
      background-color: $color-blue;
      color: white;
      border-color: $color-blue;
    }
  }

  .add-cost-baseline {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid $color-light-gray;
    border-radius: 8px;

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
    }

    .form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
  }

  .full-width {
    width: 100%;
  }
}
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;

  :deep(.btn-prev) {
    padding-left: 36px;
  }
}
.pagination-container.hidden {
  display: none;
}
:deep(.el-table) {
  border-radius: 8px;
  border: 1px solid $color-light-gray;

  .edit {
    color: $color-blue;
  }

  .remove {
    color: $color-red;
  }

  .actionIcon {
    cursor: pointer;
    width: 18px;
    height: 18px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
