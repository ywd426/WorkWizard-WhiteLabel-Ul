<template>
  <el-table
    ref="tableRef"
    v-loading="loading"
    stripe
    style="height: 600px"
    :data="faultList"
    lazy
    :load="loadData"
    @expand-change="handleExpand"
    @sort-change="handleSortChange"
    @row-dblclick="handleRowClick"
  >
    <el-table-column type="expand">
      <template #default="scope">
        <div m="4">
          <p m="t-0 b-2">Assignee: {{ scope.row.assignee }}</p>
          <p m="t-0 b-2">Reporter: {{ scope.row.reporter }}</p>

          <h3>Sensor</h3>
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="160px" size="default">
            <div v-for="(item, index) in scope.row.sensorList" :key="index" class="operation-row">
              <el-form-item label="Sensor" :label-width="formLableWidth">
                {{ item.sensorName }}
              </el-form-item>
              <el-form-item label="Data Type" :label-width="formLableWidth">
                {{ item.dataType }}
              </el-form-item>
              <el-form-item label="Range" :label-width="formLableWidth">
                {{ item.rangeStart }}
                <span style="margin-left: 8px; margin-right: 8px">-</span>
                {{ item.rangeEnd }}
                <span style="margin-left: 8px">{{ item.unit }}</span>
              </el-form-item>
              <el-form-item label="Label" :label-width="formLableWidth">
                {{ item.tags }}
              </el-form-item>
            </div>
          </el-form>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="Creation Date" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
      <template #default="scope">
        {{ useUtils.formatDate(scope.row.createTime) }}
      </template>
    </el-table-column>
    <el-table-column
      prop="equipmentName"
      label="Equipment Name "
      width="200"
      sortable="custom"
      :sort-orders="['descending', 'ascending']"
    ></el-table-column>
    <el-table-column
      prop="location"
      label="Location"
      sortable="custom"
      :sort-orders="['descending', 'ascending']"
      style="max-width: 240px"
    ></el-table-column>
    <el-table-column prop="name" label="Fault Name"></el-table-column>
    <el-table-column prop="statusName" label="Status"></el-table-column>
    <el-table-column prop="severity" label="Severity"></el-table-column>
  </el-table>
  <pagination
    v-if="total > 0"
    v-model:total="total"
    v-model:page="queryParams.pageNum"
    v-model:limit="queryParams.pageSize"
    class="pagination"
    @pagination="getList"
  />
</template>
<script setup lang="ts">
import * as useUtils from '@/utils/index';
import { SensorForm, MetricsForm } from '@/api/maintenance/faultReporting/manualFaults/types';
interface Props {
  config: {
    name: string;
    severity: string;
    type: string;
  };
}
const props = defineProps<Props>();
const tableRef = ref<ElTableInstance>();
const loading = ref(true);
const total = ref(0);
const defaultSort = ref<any>({ prop: 'create_time', order: 'descending' });
const formLableWidth = '90px';
interface FaultForm {
  id: string;
  createTime: string;
  equipmentName: string;
  name: string;
  assignee: string;
  reporter: string;
  severity: string;
  location: string;
  status: string;
  statusName?: string;
  sensorList?: SensorForm[];
  metricsList?: MetricsForm[];
}
interface FaultQuery extends PageQuery {
  name: string;
  severity: string;
  type: string;
  orderByColumn: string;
  isAsc: string;
}
const queryParams = ref<FaultQuery>({
  pageNum: 1,
  pageSize: 10,
  name: props.config.name,
  severity: props.config.severity,
  type: props.config.type,
  orderByColumn: defaultSort.value.prop,
  isAsc: defaultSort.value.order
});

const faultList = ref<FaultForm[]>([]);
const getList = async () => {
  loading.value = false;
  faultList.value.push({
    id: '1',
    createTime: '2025-02-27 06:46:21',
    equipmentName: 'Air Conditioner',
    name: 'AC airflow too low',
    assignee: 'XXX',
    reporter: 'XXX',
    severity: 'Level 7',
    location: 'Foxx Irvine Head Office floor1 east01',
    statusName: 'Resolved',
    status: 'Resolved',
    sensorList: [
      {
        sensorId: '1',
        sensorName: 'Sensor2',
        dataType: 'float',
        rangeStart: '0',
        rangeEnd: '100',
        unit: '%',
        frequency: 0,
        duration: 0,
        durationUnit: '0',
        tags: 'tag1,tag2'
      }
    ]
  });
  total.value = 1;
};
/** 排序触发事件 */
const handleSortChange = (column: any) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
};
const handleRowClick = (row: any) => {};
const handleExpand = (row, status) => {
  console.log('handleExpand', status);
  console.log('handleExpand', row);
};
const loadData = async (row: FaultForm, treeNode: unknown, resolve: (data: FaultForm[]) => void) => {
  setTimeout(() => {
    resolve([]);
  }, 1000);
};
onMounted(async () => {
  getList();
});
</script>
