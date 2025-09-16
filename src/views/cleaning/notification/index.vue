<template>
  <div id="notification-settins-node" class="dashboard-container">
    <notification-settings :locationId="locationId" :locationName="locationName" />
  </div>
</template>

<script setup>
import NotificationSettings from '@/views/cleaning/notification/NotificationSettings.vue';

const props = defineProps({
  pageId: {
    type: String,
    default: 'notification'
  }
});

</script>

<style lang="scss" scoped>
@import '@/assets/styles/clean-panels.scss';
.dashboard-container {
  padding: 16px;
  background-color: white;
  min-height: 100%;

  .dashboard-content {
    display: flex;
    gap: 16px;
    margin-top: 4px;

    .left-panel {
      flex: 0 0 50%; // 固定宽度为50%
      max-width: 50%; // 确保不超过50%
    }

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
