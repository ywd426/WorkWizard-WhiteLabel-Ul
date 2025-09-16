<template>
  <el-form-item id="locatlocat" label="Location" class="location-form">
    <el-select v-model="locationForm.region" clearable filterable placeholder="Please Select Region" @change="changeLocation('region')">
      <el-option v-for="item in regionList" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <el-select v-model="locationForm.state" clearable filterable placeholder="Please Select State" @change="changeLocation('state')">
      <el-option v-for="item in stateList" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <el-select v-model="locationForm.city" clearable filterable placeholder="Please Select City">
      <el-option v-for="item in cityList" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <el-input v-model="locationForm.zipCode" placeholder="Please Enter ZipCode" clearable />
  </el-form-item>
</template>
<script setup name="Location" lang="ts">
import { locationTreeList } from '@/api/maintenance/deviceLogbook/deviceManagement';
interface LocationForm {
  region: string;
  state: string;
  city: string;
  zipCode: string;
}
interface BaseForm {
  country: string;
  state: string;
  city: string;
  zipCode: string;
}
const locationForm = ref<LocationForm>({ region: '', state: '', city: '', zipCode: '' });
const regionList = ref([]);
const stateList = ref([]);
const cityList = ref([]);
const allLocationList = ref<BaseForm[]>([]);
const changeLocation = (type) => {
  locationForm.value.city = '';
  if (type === 'region') {
    locationForm.value.state = '';
    if (!locationForm.value.region) {
      stateList.value = allLocationList.value.map((item: any) => item.state);
      cityList.value = allLocationList.value.map((item: any) => item.city);
    } else {
      stateList.value = allLocationList.value.filter((item: any) => item.country == locationForm.value.region).map((item: any) => item.state);
      cityList.value = allLocationList.value.filter((item: any) => item.country == locationForm.value.region).map((item: any) => item.city);
    }
    //去重
    stateList.value = [...new Set(stateList.value)];
  } else if (type === 'state') {
    if (!locationForm.value.state) {
      if (!locationForm.value.region) {
        cityList.value = allLocationList.value.map((item: any) => item.city);
      } else {
        cityList.value = allLocationList.value.filter((item: any) => item.country == locationForm.value.region).map((item: any) => item.city);
      }
    } else {
      cityList.value = allLocationList.value.filter((item: any) => item.state == locationForm.value.state).map((item: any) => item.city);
    }
  }
};
// 位置列表初始数据
const getInitLcationList = async () => {
  locationForm.value = { region: '', state: '', city: '', zipCode: '' };
  regionList.value = [];
  stateList.value = [];
  cityList.value = [];
  allLocationList.value.forEach((item) => {
    regionList.value.push(item.country);
    stateList.value.push(item.state);
    cityList.value.push(item.city);
  });
  //去重
  regionList.value = [...new Set(regionList.value)];
  stateList.value = [...new Set(stateList.value)];
};
const getLcationTreeList = async () => {
  await locationTreeList().then((res) => {
    allLocationList.value = res.data;
    getInitLcationList();
  });
};
onMounted(async () => {
  getLcationTreeList();
});
defineExpose({
  locationForm,
  getInitLcationList
});
</script>
<style scoped ts="scss">
:deep(.el-form-item__content) {
  gap: 1.25rem;

  el-select:first-child {
    margin-left: 0;
  }
}
.location-form {
  width: 100%;
  background: var(--colors-base-location);
}
</style>
