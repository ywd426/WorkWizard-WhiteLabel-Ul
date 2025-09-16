<template>
  <div class="right-menu flex align-center">
    <template v-if="appStore.device !== 'mobile'">
      <el-select
        v-if="userId === 1 && tenantEnabled"
        v-model="companyName"
        class="min-w-244px mt-2 mr-1"
        clearable
        filterable
        reserve-keyword
        :placeholder="$t('navbar.selectTenant')"
        @change="dynamicTenantEvent"
        @clear="dynamicClearEvent"
      >
        <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"> </el-option>
        <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
      </el-select>

      <search-menu v-if="showPaddingFeature" ref="searchMenuRef" />
      <el-tooltip v-if="showPaddingFeature" :content="$t('search.search')" effect="dark" placement="bottom">
        <div class="right-menu-item hover-effect" @click="openSearchMenu">
          <svg-icon class-name="search-icon" icon-class="search" />
        </div>
      </el-tooltip>
      <!-- 消息 -->
      <el-tooltip :content="$t('navbar.message')" effect="dark" placement="bottom">
        <div>
          <el-popover placement="bottom" trigger="click" transition="el-zoom-in-top" :width="400" :persistent="false">
            <template #reference>
              <el-badge :value="newNotice > 0 ? newNotice : ''" :max="99">
                <svg-icon id="account-message" icon-class="message" />
              </el-badge>
            </template>
            <template #default>
              <notice></notice>
            </template>
          </el-popover>
        </div>
      </el-tooltip>

      <el-tooltip v-if="!isMobileDevice() && showPaddingFeature" :content="$t('navbar.full')" effect="dark" placement="bottom">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </el-tooltip>

      <el-tooltip v-if="showPaddingFeature" :content="$t('navbar.language')" effect="dark" placement="bottom">
        <lang-select id="lang-select" class="right-menu-item hover-effect" />
      </el-tooltip>
      <el-tooltip v-if="showTimeZoneSelection" :content="$t('navbar.timeZone')" effect="dark" placement="bottom">
        <div style="display: flex; justify-content: center; align-items: center; padding-left: 10px">
          <el-select v-model="selectTimeZone" style="width: 140px" @change="changeTimeZone()">
            <el-option v-for="item in timeZoneList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </el-tooltip>
       <el-tooltip v-if="showUnitsSelection" :content="$t('navbar.units')" effect="dark" placement="bottom">
        <div style="display: flex; justify-content: center; align-items: center; padding-left: 10px">
          <el-select v-model="selectUnits" style="width: 140px" @change="changeUnits()">
            <el-option v-for="item in unitsList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
      </el-tooltip>
    </template>
    <div class="avatar-container">
      <el-dropdown class="right-menu-item hover-effect" trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <div class="account-node">FX</div>
          <span>{{ account }}</span>
          <svg-icon icon-class="arrow-down" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="settingsStore.showSettings" command="setLayout">
              <span>{{ $t('navbar.layoutSetting') }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="notification">
              <span>Notification Settings</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="feed">
              <span>Notification Feed</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>{{ $t('navbar.logout') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchMenu from '@/layout/components/TopBar/search.vue';
import useAppStore from '@/store/modules/app';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import useNoticeStore from '@/store/modules/notice';
import { getTenantList } from '@/api/login';
import { dynamicClear, dynamicTenant } from '@/api/system/tenant';
import { TenantVO } from '@/api/types';
import notice from '@/layout/components/notice/index.vue';
import { isMobileDevice } from '@/utils/index';
import { useAuthStore } from '@/store/modules/auth';
const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const noticeStore = storeToRefs(useNoticeStore());
const newNotice = ref(<number>0);
const authStore = useAuthStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userId = ref(userStore.userId);
const companyName = ref(undefined);
const tenantList = ref<TenantVO[]>([]);
// 是否切换了租户
const dynamic = ref(false);
// 租户开关
const tenantEnabled = ref(true);
// 搜索菜单
const searchMenuRef = ref<InstanceType<typeof SearchMenu>>();

const openSearchMenu = () => {
  searchMenuRef.value?.openSearch();
};
const showPaddingFeature = ref(false);
//是否显示时区选择
const showTimeZoneSelection = ref(true);
const selectTimeZone = ref(appStore.currentTimeZone);
const showUnitsSelection = ref(true);
const selectUnits = ref(appStore.currentUnits);
const timeZoneList = ref([
  { label: 'UTC +08:00', value: 'Asia/Shanghai' },
  { label: 'UTC -05:00', value: 'America/New_York' },
  { label: 'UTC -08:00', value: 'America/Los_Angeles' }
]);
const unitsList = ref([
  { label: 'Imperial', value: 'imperial' },
  { label: 'Metric', value: 'metric' }
]);
const account = 'Hi, ' + userStore.username + ' !';

const changeTimeZone = () => {
  appStore.currentTimeZone = selectTimeZone.value;
};
const changeUnits = () => {
  appStore.currentUnits = selectUnits.value;
};
// 动态切换
const dynamicTenantEvent = async (tenantId: string) => {
  if (companyName.value != null && companyName.value !== '') {
    await dynamicTenant(tenantId);
    dynamic.value = true;
    proxy?.$tab.closeAllPage();
    proxy?.$router.push('/');
    proxy?.$tab.refreshPage();
  }
};

const dynamicClearEvent = async () => {
  await dynamicClear();
  dynamic.value = false;
  proxy?.$tab.closeAllPage();
  proxy?.$router.push('/');
  proxy?.$tab.refreshPage();
};

/** 租户列表 */
const initTenantList = async () => {
  const { data } = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
  }
};

defineExpose({
  initTenantList
});

const logout = async () => {
  await ElMessageBox.confirm('Are you sure to logout and exit the system?', 'Tips', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  });
  await userStore.logout();
  await authStore.logout();

  location.href = import.meta.env.VITE_APP_CONTEXT_PATH + '/index';
};

const emits = defineEmits(['setLayout', 'setNotification', 'setNotificationFeed']);
const setLayout = () => {
  emits('setLayout');
};


const notification = () => {
  emits('setNotification');
};
const feed = () => {
  emits('setNotificationFeed');
}
// 定义Command方法对象 通过key直接调用方法
const commandMap: { [key: string]: any } = {
  setLayout,
  notification,
  feed,
  logout
};
const handleCommand = (command: string) => {
  // 判断是否存在该方法
  if (commandMap[command]) {
    commandMap[command]();
  }
};
//用深度监听 消息
watch(
  () => noticeStore.state.value.notices,
  (newVal) => {
    newNotice.value = newVal.filter((item: any) => !item.read).length;
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
:deep(.el-badge__content.is-fixed) {
  transform: translateY(25%) translateX(90%) !important;
}

.right-menu {
  float: right;
  height: 100%;
  line-height: 50px;
  display: flex;

  &:focus {
    outline: none;
  }

  .right-menu-item {
    display: inline-block;
    padding: 4px 8px 0 8px;
    height: 100%;
    font-size: 18px;
    color: #5a5e66;

    &.hover-effect {
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .avatar-container {
    padding-left: 40px;

    .avatar-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      white-space: nowrap;
      .account-node {
        display: flex;
        width: 40px;
        height: 40px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        border-radius: 100px;
        border: 1px solid var(--Layout-bg_highlight, rgba(0, 153, 255, 0.05));
        background: var(--colors-Sky-of-Magritte-Blue-1000, #09f);
        color: #fff;
        text-align: center;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 16px;
        letter-spacing: -0.144px;
      }
      span {
        padding: 0 8px 0 4px;
        color: #555;
        /* Brand/Sublines_Semibold */
        font-size: 17px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px; /* 117.647% */
      }

      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        margin-top: 10px;
      }

      i {
        cursor: pointer;
        position: absolute;
        right: -20px;
        top: 16px;
        font-size: 12px;
      }
    }
  }
}
#account-message {
  width: 2.5rem;
  height: 2.5rem;
  transform: translate(0px, 4px);
}
</style>
