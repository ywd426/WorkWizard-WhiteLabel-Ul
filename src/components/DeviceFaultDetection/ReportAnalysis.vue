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
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand" width="80">
        <template #default="scope">
          <div class="custom-table custom-table-body">
            <div class="custom-table-header">
              <div class="custom-table-cell">ID</div>
              <div class="custom-table-cell">StartTimestamp</div>
              <div class="custom-table-cell">Action</div>
            </div>
            <div v-loading="scope.row.detailsLoading">
              <div v-for="(item, index) in scope.row.detailData" :key="index" class="custom-table-row" @dblclick="handleRowClick(item)">
                <div class="custom-table-cell">{{ item.id }}</div>
                <div class="custom-table-cell">{{ useUtils.formatDate(item.startTimestamp) }}</div>
                <div class="custom-table-cell">
                  <el-tooltip content="view" placement="top">
                    <svg-icon icon-class="view" class-name="oper-btn" @click="handleRowClick(item)" />
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="lastReportDate" label="Last Report Date" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          {{ useUtils.formatDate(scope.row.lastReportDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="faultName" label="Fault Name"></el-table-column>
      <el-table-column prop="type" label="Type"></el-table-column>
      <el-table-column prop="severity" label="Severity"></el-table-column>
      <el-table-column prop="historicalOccurrences" label="Number Of All Historical Occurrences" width="200px"></el-table-column>
      <el-table-column prop="status" label="Status Of Detection">
        <template #default="scope">
          <div class="custom-ranking">
            <span :class="scope.row.historicalOccurrences > 2 ? 'el-dict-progress' : 'el-dict-uncompleted'">{{
              scope.row.historicalOccurrences > 2 ? 'Ready' : 'Not ready'
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Enable Detection">
        <template #default="scope">
          <el-switch
            v-show="scope.row.historicalOccurrences > 2"
            v-model="scope.row.status"
            @change="changeRowState(scope.row)"
            @dblclick.stop
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="Action" fixed="right" align="center" width="140" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip v-if="scope.row.historicalOccurrences > 2" content="View model" placement="top">
            <svg-icon icon-class="statistics" class-name="oper-btn" @click="openModelDetails(scope.row)" />
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
      <DeviceReporting :config="reportEditConfig" @close="closeEditChart()"></DeviceReporting>
    </el-dialog>
    <el-dialog v-model="dialogDetection.visible" :title="dialogDetection.title" destroy-on-close append-to-body width="70%">
      <FaultDetectionModel :config="faultDetectionConfig"></FaultDetectionModel>
    </el-dialog>
  </div>
</template>
<script setup name="reportAnalysis" lang="ts">
import { propTypes } from '@/utils/propTypes';
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { FaultQuery } from '@/api/maintenance/faultReporting/manualFaults/types';
import { list, detailList, setDetectionStatus } from '@/api/maintenance/faultDetection/deviceManagement';
const props = defineProps({
  equipment: propTypes.string.def('')
});
const p2 = ref(null);
const queryFormRef = ref<ElFormInstance>();
const searchbarRef = ref(null);
const showSearch = ref(false);
const placeholderText = ref('Type here to search for a fault name/equipment');
const loading = ref(true);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const total = ref(0);
const defaultSort = ref<any>({ prop: 'last_report_date', order: 'descending' });
interface ReportEditConfig {
  type: string;
  canEdit: boolean;
  equipmentId: string;
  id: string;
}
const reportEditConfig = reactive<ReportEditConfig>({
  type: '0',
  canEdit: false,
  equipmentId: props.equipment,
  id: ''
});
interface FaultDetectionConfig {
  type: string;
  name: string;
  severity: string;
}
const faultDetectionConfig = reactive<FaultDetectionConfig>({
  type: '',
  name: '',
  severity: ''
});
interface LogEditConfig {
  name: string;
  severity: string;
  type: string;
}
const detectionReportFormConfig = reactive<LogEditConfig>({
  name: '0',
  severity: '0',
  type: '0'
});
interface DetailModel {
  startTimestamp: string;
  id: string;
  severity?: string;
  faultName?: string;
  type?: string;
}
interface DetectionReportForm {
  faultName: string;
  type: string;
  severity: string;
  lastReportDate: string;
  historicalOccurrences: string;
  status: boolean;
  detailsLoading: boolean;
  detailData: DetailModel[];
}
const initFormData: DetectionReportForm = {
  faultName: '',
  type: '',
  severity: '',
  lastReportDate: '',
  historicalOccurrences: '',
  status: false,
  detailsLoading: true,
  detailData: []
};
const initData: PageData<DetectionReportForm, FaultQuery> = {
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
const data = reactive<PageData<DetectionReportForm, FaultQuery>>(initData);
const { queryParams, form, rules } = toRefs<PageData<DetectionReportForm, FaultQuery>>(data);
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
const faultList = ref<DetectionReportForm[]>([]);
const tableHeight = ref(400);
const dialogEdit = reactive<DialogOption>({
  visible: false,
  title: 'Fault Report Details'
});
const dialogDetection = reactive<DialogOption>({
  visible: false,
  title: 'Fault Detection Performance'
});
const closeEditChart = () => {
  dialogEdit.visible = false;
};
const changeRowState = (row: any) => {
  setDetectionStatus(row.type, row.severity, row.faultName, row.status);
};
const openModelDetails = (row: any) => {
  faultDetectionConfig.name = row.faultName;
  faultDetectionConfig.type = row.type;
  faultDetectionConfig.severity = row.severity;
  dialogDetection.visible = true;
  dialogDetection.title = 'Fault Detection Performance For ' + row.faultName;
};
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
  list(queryParams.value).then((res) => {
    faultList.value = res.rows;
    total.value = res.total;
  });
};
const handleRowClick = (row: any) => {
  reportEditConfig.id = row.id;
  dialogEdit.visible = true;
};
const handleExpandChange = (row, expandedRows) => {
  if (expandedRows.includes(row)) {
    if (!row.detailData) {
      row.detailsLoading = true;
      detailList(row.type, row.severity, row.faultName).then((res) => {
        row.detailData = res.data;
        row.detailsLoading = false;
      });
    }
  }
};
onMounted(async () => {
  getList();
});
</script>
<style scoped>
.oper-btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 10px;
}
.custom-ranking {
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 400;
  line-height: 16px;
}
::v-deep(.el-table__expanded-cell .el-table__header-wrapper th) {
  background-color: unset;
}
.custom-table {
  width: 100%;
  border: 1px solid var(--el-base-border-color);
  border-collapse: collapse;
}

.custom-table-header,
.custom-table-row {
  display: flex;
  width: 100%;
}

.custom-table-cell {
  flex: 1;
  padding: 0 8px 0 20px;
  border: 1px solid var(--el-base-border-color);
  text-align: left;
  height: 64px;
  display: flex;
  align-items: center;
}

.custom-table-header .custom-table-cell {
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  background-color: var(--baseBackground);
}

.custom-table-body {
  max-height: 400px;
  overflow-y: auto;
}
.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none;
}
</style>
