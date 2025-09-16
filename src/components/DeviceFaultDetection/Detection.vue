<template>
  <div ref="p2" class="p-2">
    <el-row :gutter="10">
      <RightSearchbar ref="searchbarRef" v-model:showSearch="showSearch" :placeholder="placeholderText" @query-table="handleQuery"></RightSearchbar>
    </el-row>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="query-parent">
        <QueryForm @search="handleQuery" @reset="resetQuery">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="160px" size="default">
            <Location ref="locationFormRef"></Location>
            <el-form-item v-if="equipment == ''" label="Equipment Name" prop="equipmentName">
              <el-input v-model="queryParams.equipmentName" clearable placeholder="Please Input Equipment" />
            </el-form-item>
            <el-form-item label="Fault Name" prop="name">
              <el-input v-model="queryParams.name" clearable placeholder="Please Input Fault Name" />
            </el-form-item>
            <el-form-item label="Assignee" prop="assignee">
              <el-input v-model="queryParams.assignee" clearable placeholder="Please Input Assignee" />
            </el-form-item>
            <el-form-item label="Reporter" prop="reporter">
              <el-input v-model="queryParams.reporter" clearable placeholder="Please Input Reporter" />
            </el-form-item>
            <el-form-item label="Severity" prop="severity">
              <el-select v-model="queryParams.severity" clearable filterable placeholder="Please select">
                <el-option v-for="item in severityList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="queryParams.status" clearable filterable placeholder="Please Select">
                <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </QueryForm>
      </div>
    </transition>
    <el-row style="padding: 8px 20px; align-items: center">
      <DateRangePicker v-model:dateRange="dateRange" @refresh="getList" />
    </el-row>
    <el-table
      ref="tableRef"
      v-loading="loading"
      stripe
      :data="faultList"
      :style="{ height: tableHeight + 'px' }"
      @sort-change="handleSortChange"
      @row-dblclick="handleRowClick"
    >
      <el-table-column label="No." type="index" width="50"> </el-table-column>
      <el-table-column prop="faultName" label="Fault Name" sortable="custom" :sort-orders="['descending', 'ascending']"></el-table-column>
      <el-table-column prop="severity" label="Severity" sortable="custom" :sort-orders="['descending', 'ascending']"></el-table-column>
      <el-table-column prop="confidenceLevel" label="Confidence Level" sortable="custom" :sort-orders="['descending', 'ascending']"></el-table-column>
      <el-table-column prop="type" label="Type" sortable="custom" :sort-orders="['descending', 'ascending']"></el-table-column>
      <el-table-column prop="startTimestamp" label="Start Date" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          {{ useUtils.formatDate(scope.row.startTimestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="endTimestamp" label="End Date" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          {{ useUtils.formatDate(scope.row.endTimestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Enable/DIsable">
        <template #default="scope">
          <el-switch v-model="scope.row.status" @click="ignoreRow(scope.row)" @dblclick.stop></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="Action" fixed="right" align="center" width="140" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="View model" placement="top">
            <svg-icon icon-class="statistics" class-name="oper-btn" @click="openModelDetails(scope.row)" />
          </el-tooltip>
          <el-tooltip content="view" placement="top">
            <svg-icon icon-class="view" class-name="oper-btn" @click="handleRowClick(scope.row)" />
          </el-tooltip>
          <el-tooltip content="delete" placement="top">
            <svg-icon icon-class="delete" class-name="oper-btn" @click="deleteRowClick(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      class="pagination"
      @pagination="getList"
    />
    <el-dialog v-model="dialogEdit.visible" :title="dialogEdit.title" destroy-on-close append-to-body width="70%">
      <DetectionDetail ref="detectionDetailRef" :config="detectionConfig" @close="closeEditChart()"></DetectionDetail>
      <template #footer>
        <div class="btn-group">
          <el-button class="cancel" plain @click="closeEditChart">Cancel</el-button>
          <el-button class="cancel" plain type="primary" @click="saveDetection()">Save</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogDetection.visible" :title="dialogDetection.title" destroy-on-close append-to-body width="70%">
      <FaultDetectionModel :config="faultDetectionConfig"></FaultDetectionModel>
    </el-dialog>
  </div>
</template>
<script setup name="detection" lang="ts">
import { propTypes } from '@/utils/propTypes';
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { FaultQuery } from '@/api/maintenance/faultReporting/manualFaults/types';
import { FaultDetectionForm } from '@/api/maintenance/faultDetection/deviceManagement/types';
import { detectionList } from '@/api/maintenance/faultDetection/deviceManagement';
const props = defineProps({
  equipment: propTypes.string.def('')
});
const p2 = ref(null);
const queryFormRef = ref<ElFormInstance>();
const searchbarRef = ref(null);
const detectionDetailRef = ref(null);
const showSearch = ref(false);
const placeholderText = ref('Type here to search for a fault name/equipment');
const loading = ref(true);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const total = ref(0);
const defaultSort = ref<any>({ prop: 'create_time', order: 'descending' });
interface FaultDetectionConfig {
  type: string;
  name: string;
  severity: string;
}
interface FaultDetectionDetailConfig {
  id: string;
}
const detectionConfig = reactive<FaultDetectionDetailConfig>({
  id: ''
});
const faultDetectionConfig = reactive<FaultDetectionConfig>({
  type: '',
  name: '',
  severity: ''
});
const dialogEdit = reactive<DialogOption>({
  visible: false,
  title: 'Fault Detection Details'
});
const dialogDetection = reactive<DialogOption>({
  visible: false,
  title: 'Fault Detection Performance'
});
const initFormData: FaultDetectionForm = {
  id: undefined,
  faultName: undefined,
  type: undefined,
  severity: undefined,
  equipmentId: undefined,
  startTimestamp: undefined,
  endTimestamp: undefined
};
const initData: PageData<FaultDetectionForm, FaultQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: '',
    equipmentId: props.equipment,
    equipmentName: '',
    search: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {}
};
const data = reactive<PageData<FaultDetectionForm, FaultQuery>>(initData);
const { queryParams, form, rules } = toRefs<PageData<FaultDetectionForm, FaultQuery>>(data);
const severityList = ref([
  { 'id': '0', name: 'Level 0' },
  { 'id': '1', name: 'Level 1' },
  { 'id': '2', name: 'Level 2' },
  { 'id': '3', name: 'Level 3' },
  { 'id': '4', name: 'Level 4' },
  { 'id': '5', name: 'Level 5' },
  { 'id': '6', name: 'Level 6' },
  { 'id': '7', name: 'Level 7' },
  { 'id': '8', name: 'Level 8' },
  { 'id': '9', name: 'Level 9' },
  { 'id': '10', name: 'Level 10' }
]);
const statusList = ref([
  { 'id': '0', name: 'Open' },
  { 'id': '1', name: 'In progress' },
  { 'id': '2', name: 'Resolved' }
]);
const faultList = ref<FaultDetectionForm[]>([]);
const tableHeight = ref(400);
const handleQuery = () => {
  queryParams.value.search = searchbarRef.value.searchText;
  getList();
  showSearch.value = false;
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
};
const handleSortChange = (column: any) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
};
const getList = async () => {
  loading.value = false;
  detectionList(queryParams.value).then((res) => {
    faultList.value = res.rows;
    total.value = res.total;
  });
};
const openModelDetails = (row: any) => {
  faultDetectionConfig.name = row.faultName;
  faultDetectionConfig.type = row.type;
  faultDetectionConfig.severity = row.severity;
  dialogDetection.visible = true;
  dialogDetection.title = 'Fault Detection Performance For ' + row.faultName;
};
const saveDetection = async () => {
  const isSuc = await detectionDetailRef.value.saveDetection();
  if (isSuc) {
    closeEditChart();
  }
};
const closeEditChart = () => {
  dialogEdit.visible = false;
};
const handleRowClick = (row: any) => {
  detectionConfig.id = row.id;
  dialogEdit.visible = true;
};
const ignoreRow = (row: any) => {};
const deleteRowClick = (row: any) => {};
onMounted(async () => {
  getList();
});
</script>
<style lang="scss" scoped>
.oper-btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 10px;
}
.btn-group {
  height: 15%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-right: 12px;
}
</style>
