<template>
  <div v-loading="state.loading" class="layout-navbars-breadcrumb-user-news">
    <div class="head-box">
      <div class="head-box-title">{{ $t('notice.notice') }}</div>
      <!-- <div class="head-box-btn" @click="readAll">{{ $t('notice.allRead') }}</div> -->
    </div>
    <div v-loading="state.loading" class="content-box">
      <template v-if="newsList.length > 0 && messageType === 'text'">
        <div class="w-full h-full">
          <div v-for="(v, k) in newsList" :key="k" class="content-box-item" @click="onNewsClick(k)">
          <div class="item-conten">
            <div>{{ v.message }}</div>
            <div class="content-box-msg"></div>
            <div class="content-box-time">{{ v.time }}</div>
          </div>
          <!-- 已读/未读 -->
          <span v-if="v.read" class="el-tag el-tag--success el-tag--mini read">{{ $t('notice.read') }}</span>
          <span v-else class="el-tag el-tag--danger el-tag--mini read ">{{ $t('notice.unread') }}</span>
        </div>
        </div> 
      </template>
      <template v-if="messageList.length > 0 && messageType === 'card'">
        <div class="w-full h-full flex flex-col gap-2">
            <div class="flex-1">
              <TaskCard 
              v-for="(task, index) in showData" 
              :key="task.id" 
              :task="task"
              :showAssigned="false"
              :showFooter="false"
              :showPending="true"
              @click="onNoticeClick(task, index)"
              class="cusror-pointer"
            >
              <template v-slot:customer-area>
               <span v-if="task.read" class="el-tag el-tag--success el-tag--mini read readTag">{{ $t('notice.read') }}</span>
               <span v-else class="el-tag el-tag--danger el-tag--mini read readTag">{{ $t('notice.unread') }}</span>
              </template>

            </TaskCard>
            </div>
            <div class="flex h-[40px] gap-2">
              <el-button v-if="newsList.length > 4" class="flex-1 notice-btn" @click="loadData" plain round> 
                <span class="pr-1 notice-btn-txt">Load More data </span>
                <el-icon> <Refresh /></el-icon>
              </el-button>
              <el-button class="flex-1 notice-btn" @click="showNotiFeed" plain round>
                <span class="pr-1 notice-btn-txt">View All Notification</span>
                <el-icon><ChatLineSquare /></el-icon>
              </el-button>
            </div>
          </div>
      </template>
      <el-empty v-else :description="'Message Is Empty'"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { storeToRefs } from 'pinia';
import useNoticeStore from '@/store/modules/notice';
import TaskCard from '@/views/cleaning/taskCenter/TaskCard.vue';
import { setNotificationRead } from '@/api/clean/notification';

const router = useRouter();
const noticeStore = storeToRefs(useNoticeStore());
const data = ref(noticeStore.state.value.notices);
const { readAll } = useNoticeStore();

// 定义变量内容
const state = reactive({
  loading: false
});
const messageType = ref('card'); // text | card
const newsList = ref([]) as any;
const messageList = ref([]) as any;

/**
 * 初始化数据
 * @returns
 */
const getTableData = async () => {
  state.loading = true;
  if(messageType.value === 'card') {
    const arr = convertData(data.value);
    messageList.value = arr;
    newsList.value = data.value;
  } else {
    newsList.value = data.value;
  }  
  // newsList.value = tasks.value;
 
  state.loading = false;
};

const typeMap = {
  'battery_notification': 'sensor',
  'robot_notification': 'robot',
  'consumable_notification': 'consumble',
  'waste_notification': 'maintenance'
}

const getIconType = (type) => { 
  if(type.startsWith('robot')) {
    return 'robot'
  } else if(type.startsWith('consumable')) {
    return 'consumable'
  } else if(type.startsWith('waste')) {
    return 'waste'
  } else {
    return 'sensor'
  }
}

const convertData = (list) => { 
  const arr = [];
   list.filter(d => !d.read).forEach((item: any) => {
      const task = JSON.parse(item.message);
      if (task) {
        arr.push({
          id: task.notificationId,
          name: task.title,
          kind: typeMap[task.type] || 'robot', // 类型
          severity: task.severity, // 严重程度
          status: task.status || task.priority,
          icon: getIconType(task.type), // 图标
          location: task.content,
          formatTime: item.time || '',
          editable: task.editable || false,
          read: item.read || false,
        });
      }
    });

  return arr;
};

const onNoticeClick = async (item, index) => { 
  console.log(item);
  const res: any = await setNotificationRead(item.id);
  console.log(res)
  if (res.code === 200) {
    item.read = true;
    onNewsClick(index)
  }
};

const showAllData = ref(false);

const showData = computed(() => { 
  
  // 基于 newsList.value 筛选出未读消息， 默认显示4条
  return showAllData.value ? messageList.value : messageList.value.slice(0, 4);
});

//点击消息，写入已读
const onNewsClick = (item: any) => {
  newsList.value[item].read = true;
  //并且写入pinia
  noticeStore.state.value.notices = newsList.value;
};

const loadData = () => {
  showAllData.value = true;
  console.log('load data');
};

const showNotiFeed = () => {
  router.push({ path: '/notificationFeed/settings' })
};

// 前往通知中心点击
const onGoToGiteeClick = () => {
  window.open('https://gitee.com/dromara/RuoYi-Vue-Plus/tree/5.X/');
};

onMounted(async () => {
  nextTick(() => {
    getTableData();
  });
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user-news {
  .head-box {
    display: flex;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-sizing: border-box;
    color: var(--el-text-color-primary);
    justify-content: space-between;
    height: 35px;
    align-items: center;
    .head-box-btn {
      color: var(--el-color-primary);
      font-size: 13px;
      cursor: pointer;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    }
  }
  .content-box {
    height: 300px;
    overflow: auto;
    font-size: 13px;
    .content-box-item {
      padding-top: 12px;
      display: flex;
      &:last-of-type {
        padding-bottom: 12px;
      }
      .content-box-msg {
        color: var(--el-text-color-secondary);
        margin-top: 5px;
        margin-bottom: 5px;
      }
      .content-box-time {
        color: var(--el-text-color-secondary);
      }
      .item-conten {
        width: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  }
  .foot-box {
    height: 35px;
    color: var(--el-color-primary);
    font-size: 13px;
    cursor: pointer;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--el-border-color-lighter);
    &:hover {
      opacity: 1;
    }
  }
  :deep(.el-empty__description p) {
    font-size: 13px;
  }

  .notice-btn {
    border-color: #11191E;
  }

  .notice-btn-txt {
    color: var(--VI-text-B12, #11191E);
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px; 
  }
}

.readTag {
  width: 100px;
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>
