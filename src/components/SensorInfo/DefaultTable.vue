<template>
  <el-table ref="tableRef" stripe :data="sensorList" style="height: 460px" @sort-change="handleSortChange" @row-dblclick="handleRowClick">
    <el-table-column prop="sensorId" label="ID" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[0]"></el-table-column>
    <el-table-column
      prop="sensorType"
      label="Sensor Type"
      sortable="custom"
      :sort-orders="['descending', 'ascending']"
      :width="widths[1]"
    ></el-table-column>
    <el-table-column prop="sensorName" label="Name" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[2]"></el-table-column>
    <el-table-column
      prop="equipmentName"
      label="Equipment"
      sortable="custom"
      :sort-orders="['descending', 'ascending']"
      :width="widths[3]"
    ></el-table-column>
    <el-table-column
      prop="location"
      label="Location"
      sortable="custom"
      :sort-orders="['descending', 'ascending']"
      :width="widths[4]"
    ></el-table-column>
    <el-table-column prop="power" label="Power" :width="widths[1]">
      <template #default="scope">
        <el-progress :percentage="scope.row.power" :color="useUtils.getActiveColor(scope.row.power)" />
      </template>
    </el-table-column>
    <el-table-column prop="status" label="Status" sortable="custom" :sort-orders="['descending', 'ascending']" :width="widths[6]">
      <template #default="scope">
        <span :class="useUtils.operateFormat(scope.row.statusValue)">{{ scope.row.statusValue }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Action" fixed="right" align="center" class-name="small-padding fixed-width" :width="widths[7]">
      <template #default="scope">
        <svg-icon icon-class="view" style="width: 20px; height: 20px; cursor: pointer" @click="handleRowClick(scope.row)" />
      </template>
    </el-table-column>
  </el-table>
  <pagination
    v-if="total > 0"
    v-model:total="total"
    v-model:page="defaultParams.pageNum"
    v-model:limit="defaultParams.pageSize"
    @pagination="getTableList"
  />
</template>
<script setup name="defaultTable" lang="ts">
import { isMobileDevice } from '@/utils';
import { SensorForm } from '@/api/monitor/sensormanage/types';
import * as useUtils from '@/utils/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const ws = isMobileDevice() ? ['', '', '', '', '', '', '', ''] : [180, 160, 280, 140, '', 200, 140, 100];
const widths = ref(ws);
const tableRef = ref<ElTableInstance>();
const total = ref(0);
const sensorList = ref<SensorForm[]>([]);
const defaultParams = ref<any>({ orderByColumn: '', isAsc: '', pageNum: 1, pageSize: 10 });
const emit = defineEmits(['getTableList']);
const getTableList = () => {
  emit('getTableList');
};
const initTableData = (nums: number, list: SensorForm[]) => {
  sensorList.value = list;
  total.value = nums;
};
/** 排序触发事件 */
const handleSortChange = (column: any) => {
  defaultParams.value.orderByColumn = column.prop;
  defaultParams.value.isAsc = column.order;
  getTableList();
};
const handleRowClick = (row: any) => {
  proxy.$router.push({
    path: `/monitor/detail/index`,
    query: {
      sensorId: row.sensorId
    }
  });
};
defineExpose({
  defaultParams,
  initTableData
});
</script>
