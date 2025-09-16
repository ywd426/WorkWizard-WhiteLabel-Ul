<template>
  <div id="settings-parent-node" class="flex gap-6 mb-5">
    <el-button v-if="showAlertSetting" type="primary" @click="showAlert = !showAlert"> Set Alert </el-button>
    <el-button v-if="showForecastSetting" type="primary" @click="showForecast = !showForecast"> Enable Forecast </el-button>
    <el-button v-if="showCostBaselineSetting" type="primary" @click="showCostBaseline = !showCostBaseline"> Setting Cost Baseline </el-button>
    <el-button v-if="showCleaningPrioritySetting" type="primary" @click="showCleaningPriority = !showCleaningPriority">
      Set Cleaning Priority
    </el-button>
  </div>
  <alert-settings-dialog v-model:visible="showAlert" :setting-type="props.settingType" :page-id="props.pageId" />
  <cost-baseline-dialog v-model:visible="showCostBaseline" :setting-type="props.settingType" :page-id="props.pageId" />
  <opening-hours-dialog v-model:visible="showOpeningHours" :setting-type="props.settingType" :page-id="props.pageId" />
  <parameter-config-dialog v-model:visible="showParameterConfig" :setting-type="props.settingType" :page-id="props.pageId" />
  <forecast-configuration v-model:visible="showForecast" :setting-type="props.settingType" :page-id="props.pageId" />
  <cleaning-priority-configuration v-model:visible="showCleaningPriority" :setting-type="props.settingType" :page-id="props.pageId" />
</template>

<script setup lang="ts">
import AlertSettingsDialog from '@/views/cleaning/settings/AlertSettingsDialog.vue';
import CostBaselineDialog from '@/views/cleaning/settings/CostBaselineDialog.vue';
import OpeningHoursDialog from '@/views/cleaning/settings/OpeningHoursDialog.vue';
import ParameterConfigDialog from '@/views/cleaning/settings/ParameterConfigDialog.vue';
import ForecastConfiguration from '@/views/cleaning/settings/ForecastConfiguration.vue';
import CleaningPriorityConfiguration from '@/views/cleaning/settings/CleaningPriorityConfiguration.vue';
const props = defineProps({
  showAlertSetting: {
    type: Boolean,
    default: false
  },
  showForecastSetting: {
    type: Boolean,
    default: false
  },
  showCostBaselineSetting: {
    type: Boolean,
    default: false
  },
  showCleaningPrioritySetting: {
    type: Boolean,
    default: false
  },
  settingType: {
    type: Object,
    default: () => ({})
  },
  pageId: {
    type: String,
    default: ''
  }
});

const showAlert = ref(false);
const showForecast = ref(false);
const showOpeningHours = ref(false);
const showParameterConfig = ref(false);
const showCostBaseline = ref(false);
const showCleaningPriority = ref(false);

const emit = defineEmits(['close']);
</script>
