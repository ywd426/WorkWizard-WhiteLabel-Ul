<template>
  <div class="robot-settings-page">
    <div class="page-header">
      <h1>Robot Management</h1>
      <el-button type="primary" @click="openRobotSettings">Robot Settings</el-button>
    </div>

    <div class="page-content">
      <el-card class="robot-info-card">
        <template #header>
          <div class="card-header">
            <span>Robot Information</span>
          </div>
        </template>

        <div class="robot-info">
          <div class="info-item">
            <span class="label">Robot ID:</span>
            <span class="value">ROB-001</span>
          </div>
          <div class="info-item">
            <span class="label">Type:</span>
            <span class="value">Cleaning Robot</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value status-active">Active</span>
          </div>
          <div class="info-item">
            <span class="label">Electricity Rate:</span>
            <span class="value">{{ robotData.electricityRate }} USD/kWh</span>
          </div>
          <div class="info-item">
            <span class="label">Purchase Price:</span>
            <span class="value">{{ robotData.purchasePrice }} USD</span>
          </div>
          <div class="info-item">
            <span class="label">Expected Lifespan:</span>
            <span class="value">{{ robotData.lifespan }} Years</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Robot Settings Dialog -->
    <RobotSettings v-model:visible="settingsVisible" :robot-data="robotData" @save="handleSettingsSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RobotSettings from './settings.vue';
import { ElMessage } from 'element-plus';

const route = useRoute();

// 控制设置对话框的显示
const settingsVisible = ref(false);

// 机器人数据
const robotData = ref({
  objectType: 'robot',
  electricityRate: '0.120',
  waterRate: '0.000',
  hourlyWage: '0.000',
  cleaningRate: '0.000',
  purchasePrice: '0.120',
  lifespan: '0.000',
  maintenanceCost: '0.000',
  robotId: '',
  robotName: '',
  robotType: '',
  robotSn: ''
});

// 在组件挂载时获取路由参数
onMounted(() => {
  // 从路由查询参数中获取机器人信息
  const { robotId, robotName, robotType, robotSn } = route.query;

  if (robotId) {
    robotData.value = {
      ...robotData.value,
      robotId: robotId as string,
      robotName: robotName as string,
      robotType: robotType as string,
      robotSn: robotSn as string
    };

    // 自动打开设置对话框
    settingsVisible.value = true;
  }
});

// 打开设置对话框
const openRobotSettings = () => {
  settingsVisible.value = true;
};

// 处理设置保存
const handleSettingsSave = (formData) => {
  // 更新机器人数据
  robotData.value = { ...formData };
};
</script>

<style lang="scss" scoped>
.robot-settings-page {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #333;
    }
  }

  .page-content {
    .robot-info-card {
      width: 100%;
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
      }

      .robot-info {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;

        .info-item {
          display: flex;
          align-items: center;

          .label {
            font-weight: 500;
            color: #666;
            width: 150px;
          }

          .value {
            color: #333;

            &.status-active {
              color: #67c23a;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
