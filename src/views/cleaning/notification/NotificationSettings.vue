<template>
  <!-- <div class="md:w-[40%] w-full mb-4">
    <filter-panel :showSampleFilter="true" :showLabel="false" @search-event="handleSearch" />
  </div> -->
  <div class="w-full flex justify-center mb-4">
    <el-steps class="flex-1" style="max-width: 800px" :active="active" finish-status="success" align-center>
      <el-step title="Step One" description="Notification Module" />
      <el-step title="Step Two" description="Notification Schedule" />
      <el-step title="Step Three" description="Notification Templates" />
    </el-steps>
  </div>
  <CleanCard v-show="active === 0" header="Notification Module" :showSelect="false" :showActionMenu="false">
    <div class="notification-container">
      <!-- 通知模块内容 -->
      <div class="notification-content">
        <!-- 使用配置对象循环渲染模块 -->
        <div v-for="(moduleData, moduleKey) in moduleConfig" :key="moduleKey" class="module-section">
          <div class="module-header" @click="toggleModule(moduleKey)">
            <div class="flex items-center">
              <el-switch v-model="modules[moduleKey].enabled" class="module-switch" @click.stop />
              <span class="module-title">{{ moduleData.title }}</span>
            </div>
            <el-icon class="expand-icon" :class="{ 'is-expanded': expandedModules[moduleKey] }">
              <ArrowDown />
            </el-icon>
          </div>

          <!-- 循环渲染模块项 -->
          <div
            class="w-full grid md:grid-cols-2 grid-cols-1 gap-4 justify-between module-items-nodes"
            :class="modules[moduleKey].enabled ? '' : 'disabled-card'"
            v-show="expandedModules[moduleKey]"
          >
            <div v-for="(itemData, itemKey) in moduleData.items" :key="itemKey" class="module-item">
              <div class="item-header">
                <el-switch v-model="modules[moduleKey][itemKey].enabled" class="item-switch" />
                <span class="item-title">{{ itemData.title }}</span>
              </div>

              <!-- 如果有子类型，循环渲染通知类型行 -->
              <template v-if="itemData.types">
                <div
                  class="w-full flex-1 bg-white md:grid-cols-2 grid-cols-1 gap-4"
                  :class="modules[moduleKey][itemKey].enabled ? '' : 'disabled-card'"
                >
                  <div v-for="(typeData, typeKey) in itemData.types" :key="typeKey" class="notification-type-row">
                    <template v-if="modules[moduleKey][itemKey][typeKey]">
                      <div class="type-label">
                        <el-switch v-model="modules[moduleKey][itemKey][typeKey].enabled" class="type-switch" />
                        <span>{{ typeData.title }}</span>
                      </div>
                      <div class="notification-methods" :class="modules[moduleKey][itemKey][typeKey].enabled ? '' : 'disabled-card'">
                        <el-checkbox
                          v-model="modules[moduleKey][itemKey][typeKey].in_app"
                          label="In-App"
                          border
                          size="middle"
                          :disabled="typeData.disabledMethods?.includes('in_app')"
                        />
                        <el-checkbox
                          v-model="modules[moduleKey][itemKey][typeKey].email"
                          label="Email"
                          border
                          size="middle"
                          :disabled="typeData.disabledMethods?.includes('email')"
                        />
                        <el-checkbox
                          v-model="modules[moduleKey][itemKey][typeKey].sms"
                          label="SMS"
                          border
                          size="middle"
                          :disabled="typeData.disabledMethods?.includes('sms')"
                        />
                        <el-checkbox
                          v-model="modules[moduleKey][itemKey][typeKey].push"
                          label="Push"
                          border
                          size="middle"
                          :disabled="typeData.disabledMethods?.includes('push')"
                        />
                      </div>
                  </template>
                  </div>
                </div>
              </template>

              <!-- 如果没有子类型，直接渲染通知方法 -->
              <template v-else>
                <div class="notification-methods device-logs-methods" :class="modules[moduleKey][itemKey][typeKey].enabled ? '' : 'disabled-card'">
                  <el-checkbox
                    v-model="modules[moduleKey][itemKey].in_app"
                    label="In-App"
                    border
                    size="middle"
                    :disabled="itemData.disabledMethods?.includes('in_app')"
                  />
                  <el-checkbox
                    v-model="modules[moduleKey][itemKey].email"
                    label="Email"
                    border
                    size="middle"
                    :disabled="itemData.disabledMethods?.includes('email')"
                  />
                  <el-checkbox
                    v-model="modules[moduleKey][itemKey].sms"
                    label="SMS"
                    border
                    size="middle"
                    :disabled="itemData.disabledMethods?.includes('sms')"
                  />
                  <el-checkbox
                    v-model="modules[moduleKey][itemKey].push"
                    label="Push"
                    border
                    size="middle"
                    :disabled="itemData.disabledMethods?.includes('push')"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="default" @click="next">Next Step</el-button>
        <el-button size="default" @click="resetToDefault">Reset to Default</el-button>
      </div>
    </div>
  </CleanCard>
  <CleanCard v-show="active === 1" header="Notification Schedule" :showSelect="false" :showActionMenu="false">
    <NotificationSchedule
      ref="scheduleRef"
      v-model="scheduleSettings"
      :init-data="scheduleData"
      @previous-step="active--"
      @next-step="next"
      @reset="resetScheduleToDefault"
    />
  </CleanCard>
  <CleanCard v-show="active === 2" header="Notification Templates" :showSelect="false" :showActionMenu="false">
    <NotificationTemplates
      ref="templateRef"
      v-model="templateSettings"
      :init-data="templateData"
      @previous-step="active--"
      @save="saveAllSettings"
      @reset="resetTemplatesToDefault"
    />
  </CleanCard>
</template>

<script setup>
import CleanCard from '@/views/cleaning/common/CleanCard.vue';
import FilterPanel from '@/views/cleaning/common/FilterPanel';
import NotificationSchedule from '@/views/cleaning/notification/NotificationSchedule.vue';
import NotificationTemplates from '@/views/cleaning/notification/NotificationTemplates.vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { getNotificationSetting, saveNotificationSetting } from '@/api/clean/notification';

// 定义属性
const props = defineProps({
  locationId: {
    type: String,
    default: '1'
  },
  locationName: {
    type: String,
    default: 'Dining Room 1, 3rd Floor, Tower A, San Diego, CA, USA'
  }
});
const loading = ref(true);
const scheduleRef = ref(null);
const templateRef = ref(null);
const active = ref(0);
const scheduleData = ref({}); // 用于存储初始的调度设置数据
const templateData = ref({}); // 用于存储初始的模板设置数据
const orgConfig = ref({});
const orignalData = {
  monitoring: {
    enabled: false,
    sensor: {
      enabled: false,
      sensor_alert: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      sensor_status: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: true
      }
    },
    robot: {
      enabled: false,
      robot_task: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      robot_status: {
        enabled: false,
        in_app: true,
        email: false,
        sms: false,
        push: false
      }
    }
  },
  operations: {
    enabled: false,
    cleaning_alert: {
      enabled: false,
      env_scores: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      occupancy: {
        enabled: false,
        in_app: true,
        email: false,
        sms: false,
        push: false
      },
      consumable: {
        enabled: false,
        in_app: false,
        email: false,
        sms: true,
        push: true
      }
    },
    cleaning_task: {
      enabled: false,
      work_orders: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      inspection: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      }
    }
  },
  maintenance: {
    enabled: false,
    maintenance_alert: {
      enabled: false,
      device_logs: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      fault_predictions: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      fault_reports: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      maintenance_schedules: {
        enabled: false,
        in_app: true,
        email: true,
        sms: false,
        push: false
      },
      fault_detections: {
        enabled: false,
        in_app: false,
        email: false,
        sms: true,
        push: true
      }
    }
  }
};
let orgData = {};
// 模块配置对象 - 用于定义模块结构和通知类型
const moduleConfig = reactive({
  monitoring: {
    title: 'Monitoring Module',
    items: {
      // sensor: {
      //   title: 'Sensor',
      //   types: {
      //     sensor_alert: {
      //       title: 'Alert',
      //       disabledMethods: []
      //     },
      //     sensor_status: {
      //       title: 'Status',
      //       disabledMethods: []
      //     }
      //   }
      // },
      robot: {
        title: 'Robot',
        types: {
          robot_task: {
            title: 'Task',
            disabledMethods: []
          },
          robot_status: {
            title: 'Status',
            disabledMethods: []
          }
        }
      }
    }
  },
  // operations: {
  //   title: 'Operations Module',
  //   items: {
  //     cleaning_alert: {
  //       title: 'Cleaning Management - Alerts',
  //       types: {
  //         env_scores: {
  //           title: 'Environment Scores and Parameters',
  //           disabledMethods: []
  //         },
  //         occupancy: {
  //           title: 'Occupancy',
  //           disabledMethods: []
  //         },
  //         consumable: {
  //           title: 'Consumable and Waste',
  //           disabledMethods: []
  //         }
  //       }
  //     },
  //     cleaning_task: {
  //       title: 'Cleaning Management - Task',
  //       types: {
  //         work_orders: {
  //           title: 'Work Orders',
  //           disabledMethods: []
  //         },
  //         inspection: {
  //           title: 'Inspection',
  //           disabledMethods: []
  //         }
  //       }
  //     }
  //   }
  // },
  // maintenance: {
  //   title: 'Maintenance',
  //   items: {
  //     maintenance_alert: {
  //       title: 'Maintenance Management - Alerts',
  //       types: {
  //         device_logs: {
  //           title: 'Device Logs',
  //           disabledMethods: []
  //         },
  //         fault_predictions: {
  //           title: 'Fault Predictions',
  //           disabledMethods: []
  //         },
  //         fault_reports: {
  //           title: 'Fault Reports',
  //           disabledMethods: []
  //         },
  //         maintenance_schedules: {
  //           title: 'Maintenance Schedules',
  //           disabledMethods: []
  //         },
  //         fault_detections: {
  //           title: 'Fault Detections',
  //           disabledMethods: []
  //         }
  //       }
  //     }
  //   }
  // }
});

// 通知模块数据结构
const modules = ref(cloneDeep(orignalData));
const originalSchedule = {
  workingHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 17, 0)],
  quietHours: [new Date(2000, 0, 1, 22, 0), new Date(2000, 0, 1, 6, 0)],
  days: {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false
  },
  bundleSimilarNotifications: true,
  summaryInterval: 'hourly'
};
// 通知计划数据结构
const scheduleSettings = ref(cloneDeep(originalSchedule));

// 通知模板默认数据
const originalTemplates = {
  email: {
    alert: {
      enabled: false,
      content:
        '[SYSTEM]\nAlert Type: [AlertType] detected in [Location]\nSeverity: [Severity]\nTime: [Timestamp]\nDetails: [Details]\n\nHello!\n\nPlease check the system or contact maintenance if this requires immediate attention.\nBest regards!'
    },
    status: {
      enabled: false,
      content:
        '[SYSTEM] Status Update\n\nCurrent Status: [AlertType]\nLocation: [Location]\nTime: [Timestamp]\nDetails: [Details]\n\nThis is an automated status update.'
    }
  },
  sms: {
    alert: {
      enabled: false,
      content: '[ALERT] [AlertType] in [Location] - [Severity] severity. Details: [Details]'
    },
    status: {
      enabled: false,
      content: '[SYSTEM] Status: [AlertType] in [Location]. Details: [Details]'
    }
  }
};

// 通知模板数据结构
const templateSettings = ref(cloneDeep(originalTemplates));

// 模块展开/收缩状态
const expandedModules = reactive({
  monitoring: true,
  operations: true,
  maintenance: true
});
let id = null;
// 切换模块展开/收缩状态
const toggleModule = (moduleKey) => {
  expandedModules[moduleKey] = !expandedModules[moduleKey];
};

// 保存设置
const next = () => {
  // 这里可以添加保存设置的逻辑，例如发送API请求
  console.log('Settings saved:', modules);
  console.log('Schedule settings:', scheduleSettings);
  if (active.value++ > 2) {
    active.value = 0;
    modules.value = cloneDeep(orignalData);
    ElMessage.success('Settings saved successfully');
  }
};

// 保存所有设置
const saveAllSettings = async () => {
  // 这里可以添加保存所有设置的逻辑，例如发送API请求
  const modulesData = getData();
  const scheduleData = scheduleRef.value?.getData();
  const templateData = templateRef.value?.getData();
  console.log('All settings saved:');
  console.log('Modules:', modulesData);
  console.log('Schedule settings:', scheduleData);
  console.log('Template settings:', templateData);
  const data = {
    id: orgConfig.value.id,
    settingName: orgConfig.value.settingName,
    zoneId: orgConfig.value.zoneId,
    moduleSettings: modulesData,
    templates: templateData,
    schedule: scheduleData
  };
  const res = await saveNotificationSetting(data);

  if (res.code === 200) {
    ElMessage.success('All settings saved successfully!');
    // 保存成功后返回第一步
    active.value = 0;
    console.log(res, 'saveAllSettings');
  }
};

// 重置通知计划为默认设置
const resetScheduleToDefault = () => {
  console.log('Schedule settings reset to default');
  scheduleSettings.value = cloneDeep(originalSchedule);
};

// 重置通知模板为默认设置
const resetTemplatesToDefault = () => {
  console.log('Template settings reset to default');
  templateSettings.value = cloneDeep(originalTemplates);
};

// 重置为默认设置
const resetToDefault = () => {
  // 这里可以添加重置设置的逻辑
  ElMessageBox.confirm('Are you sure you want to reset all settings to default?', 'Warning', {
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    type: 'warning'
  })
    .then(() => {
      // 重置逻辑
      // ...
      modules.value = JSON.parse(JSON.stringify(orgData));
      ElMessage.success('Settings reset to default');
    })
    .catch(() => {
      ElMessage.info('Reset cancelled');
    });
};
const handleSearch = (id) => {
  orgConfig.value.zoneId = Number(id);
  getConfig();
};

const getConfig = async () => {
  const res = await getNotificationSetting(orgConfig.value.zoneId || 1);
  console.log(res, 'getNotificationSetting');
  orgConfig.value = {
    id: res.data?.id,
    settingName: res.data?.settingName,
    zoneId: res.data?.zoneId || 1
  };
  const settings = res.data?.moduleSettings || [];
  const data = {};
  settings.forEach((d) => {
    data[d.moduleCode] = {
      enabled: d.enabled,
      notificationTypes: d.notificationTypes || []
    };
  });
  id = res.data?.id;
  scheduleData.value = res.data?.schedule || {};
  templateData.value = res.data?.templates || {};
  orgData = {
    monitoring: {
      enabled: data?.monitoring?.enabled,
      sensor: {
        enabled: data?.sensor?.enabled,
        sensor_alert: {
          enabled: data?.sensor_alert?.enabled,
          in_app: data?.sensor_alert?.notificationTypes?.includes('in_app'),
          email: data?.sensor_alert?.notificationTypes?.includes('email'),
          sms: data?.sensor_alert?.notificationTypes?.includes('sms'),
          push: data?.sensor_alert?.notificationTypes?.includes('push')
        },
        sensor_status: {
          enabled: data?.sensor_status?.enabled,
          in_app: data?.sensor_status?.notificationTypes?.includes('in_app'),
          email: data?.sensor_status?.notificationTypes?.includes('email'),
          sms: data?.sensor_status?.notificationTypes?.includes('sms'),
          push: data?.sensor_status?.notificationTypes?.includes('push')
        }
      },
      robot: {
        enabled: data?.robot?.enabled,
        robot_task: {
          enabled: data?.robot_task?.enabled,
          in_app: data?.robot_task?.notificationTypes?.includes('in_app'),
          email: data?.robot_task?.notificationTypes?.includes('email'),
          sms: data?.robot_task?.notificationTypes?.includes('sms'),
          push: data?.robot_task?.notificationTypes?.includes('push')
        },
        robot_status: {
          enabled: data?.robot_status?.enabled,
          in_app: data?.robot_status?.notificationTypes?.includes('in_app'),
          email: data?.robot_status?.notificationTypes?.includes('email'),
          sms: data?.robot_status?.notificationTypes?.includes('sms'),
          push: data?.robot_status?.notificationTypes?.includes('push')
        }
      }
    },
    operations: {
      enabled: data?.operations?.enabled,
      cleaning_alert: {
        enabled: data?.cleaning_alert?.enabled,
        env_scores: {
          enabled: data?.env_scores?.enabled,
          in_app: data?.env_scores?.notificationTypes?.includes('in_app'),
          email: data?.env_scores?.notificationTypes?.includes('email'),
          sms: data?.env_scores?.notificationTypes?.includes('sms'),
          push: data?.env_scores?.notificationTypes?.includes('push')
        },
        occupancy: {
          enabled: data?.occupancy?.enabled,
          in_app: data?.occupancy?.notificationTypes?.includes('in_app'),
          email: data?.occupancy?.notificationTypes?.includes('email'),
          sms: data?.occupancy?.notificationTypes?.includes('sms'),
          push: data?.occupancy?.notificationTypes?.includes('push')
        },
        consumable: {
          enabled: data?.consumable?.enabled,
          in_app: data?.consumable?.notificationTypes?.includes('in_app'),
          email: data?.consumable?.notificationTypes?.includes('email'),
          sms: data?.consumable?.notificationTypes?.includes('sms'),
          push: data?.consumable?.notificationTypes?.includes('push')
        }
      },
      cleaning_task: {
        enabled: data?.cleaning_task?.enabled,
        workOrders: {
          enabled: data?.work_orders?.enabled,
          in_app: data?.work_orders?.notificationTypes?.includes('in_app'),
          email: data?.work_orders?.notificationTypes?.includes('email'),
          sms: data?.work_orders?.notificationTypes?.includes('sms'),
          push: data?.work_orders?.notificationTypes?.includes('push')
        },
        inspection: {
          enabled: data?.inspection?.enabled,
          in_app: data?.inspection?.notificationTypes?.includes('in_app'),
          email: data?.inspection?.notificationTypes?.includes('email'),
          sms: data?.inspection?.notificationTypes?.includes('sms'),
          push: data?.inspection?.notificationTypes?.includes('push')
        }
      }
    },
    maintenance: {
      enabled: data?.maintenance?.enabled,
      maintenance_alert: {
        enabled: data?.maintenance_alert?.enabled,
        device_logs: {
          enabled: data?.device_logs?.enabled,
          in_app: data?.device_logs?.notificationTypes?.includes('in_app'),
          email: data?.device_logs?.notificationTypes?.includes('email'),
          sms: data?.device_logs?.notificationTypes?.includes('sms'),
          push: data?.device_logs?.notificationTypes?.includes('push')
        },
        fault_predictions: {
          enabled: data?.fault_predictions?.enabled,
          in_app: data?.fault_predictions?.notificationTypes?.includes('in_app'),
          email: data?.fault_predictions?.notificationTypes?.includes('email'),
          sms: data?.fault_predictions?.notificationTypes?.includes('sms'),
          push: data?.fault_predictions?.notificationTypes?.includes('push')
        },
        fault_reports: {
          enabled: data?.fault_reports?.enabled,
          in_app: data?.fault_reports?.notificationTypes?.includes('in_app'),
          email: data?.fault_reports?.notificationTypes?.includes('email'),
          sms: data?.fault_reports?.notificationTypes?.includes('sms'),
          push: data?.fault_reports?.notificationTypes?.includes('push')
        },
        maintenance_schedules: {
          enabled: data?.maintenance_schedules?.enabled,
          in_app: data?.maintenance_schedules?.notificationTypes?.includes('in_app'),
          email: data?.maintenance_schedules?.notificationTypes?.includes('email'),
          sms: data?.maintenance_schedules?.notificationTypes?.includes('sms'),
          push: data?.maintenance_schedules?.notificationTypes?.includes('push')
        },
        fault_detections: {
          enabled: data?.fault_detections?.enabled,
          in_app: data?.fault_detections?.notificationTypes?.includes('in_app'),
          email: data?.fault_detections?.notificationTypes?.includes('email'),
          sms: data?.fault_detections?.notificationTypes?.includes('sms'),
          push: data?.fault_detections?.notificationTypes?.includes('push')
        }
      }
    }
  };
  modules.value = JSON.parse(JSON.stringify(orgData));
};
function convertToFlatFormat(originalData) {
  const result = [];
  let idCounter = 1939595187301711873; // 初始ID值

  // 递归处理每个模块
  function processModule(module, moduleCode, parentEnabled = true) {
    if (!module) return;

    // 获取当前模块的启用状态，继承父级的启用状态
    const enabled = module.enabled !== undefined ? module.enabled : false;

    // 检查当前模块是否包含通知类型
    const notificationTypes = getNotificationTypes(module);

    // 如果有通知类型，则创建一个配置项
    if (notificationTypes) {
      result.push({
        id: (idCounter++).toString(),
        settingId: module.settingId || '',
        moduleCode: moduleCode,
        enabled: enabled,
        notificationTypes: notificationTypes.join(',')
      });
    } else {
      result.push({
        id: (idCounter++).toString(),
        settingId: module.settingId || '',
        moduleCode: moduleCode,
        enabled: enabled
      });
    }

    // 递归处理子模块
    for (const key in module) {
      if (key === 'enabled' || key === 'notificationTypes') continue;

      const childModule = module[key];
      if (typeof childModule === 'object' && childModule !== null) {
        // 构建子模块的代码
        const childModuleCode = key;
        processModule(childModule, childModuleCode, enabled);
      }
    }
  }

  // 提取通知类型
  function getNotificationTypes(module) {
    const types = [];
    if (module.in_app === true) types.push('in_app');
    if (module.email === true) types.push('email');
    if (module.sms === true) types.push('sms');
    if (module.push === true) types.push('push');
    return types.length > 0 ? types : null;
  }

  // 处理根模块
  for (const rootKey in originalData) {
    processModule(originalData[rootKey], rootKey);
  }

  return result;
}

const getData = () => {
  const data = convertToFlatFormat(modules.value);
  console.log(data, 'convertToFlatFormat');

  return data;
};

// 生命周期钩子
onMounted(async () => {
  // 这里可以添加初始化逻辑，例如从API获取当前设置
  await getConfig();
  loading.value = false;
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.notification-container {
  background-color: white;
}

.notification-tabs {
  margin-bottom: 16px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
  padding-left: 20px;
}

:deep(.el-tabs__item) {
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: -0.9%;
}

.notification-content {
  background-color: white;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
}

.module-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
}

.module-section {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid $color-light-gray;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-left: 0;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  .module-title {
    font-weight: 600;
    font-size: 16px;
    margin-left: 10px;
    color: #333;
  }

  .expand-icon {
    font-size: 16px;
    color: #909399;
    transition: transform 0.3s;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}

.module-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
  flex: 1;
  border: 1px solid var(--layout-bg_divider, rgba(211, 219, 224, 0.4));
  background: var(--colors-flat-primary-flat05, rgba(0, 153, 255, 0.05));
  &:last-child {
    border-bottom: none;
  }
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .item-title {
    font-weight: 500;
    font-size: 14px;
    margin-left: 10px;
    color: #333;
  }
}

.notification-type-row {
  display: flex;
  flex-direction: column;
  background-color: white;
  margin-bottom: 12px;
  padding-left: 16px;
}

.type-label {
  display: flex;
  align-items: center;
  width: 250px;
  margin: 16px 0;

  span {
    margin-left: 10px;
    font-size: 14px;
    color: #606266;
  }
}

.notification-methods {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.module-items-nodes {
  transition: all 0.3s ease;
}

.disabled-card {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
}

.device-logs-methods {
  padding-left: 30px;
  margin-top: 10px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  font-size: 12px;
  padding-left: 6px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid $color-light-gray;
}

.schedule-content,
.template-content {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    color: #333;
  }

  p {
    color: #606266;
    font-size: 14px;
  }
}
</style>
