import { ElNotification } from 'element-plus';
import useNoticeStore from '@/store/modules/notice';
import { useAuthStore } from '@/store/modules/auth';

// 初始化
export const initSSE = (url: any) => {
  const authStore = useAuthStore();
  
  url = url + '?Authorization=Bearer ' + authStore.authState.accessToken + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
  const { data, error } = useEventSource(url, [], {
    autoReconnect: {
      retries: 10,
      delay: 3000,
      onFailed() {
        console.log('Failed to connect after 10 retries');
      }
    }
  });

  watch(error, () => {
    console.log('SSE connection error:', error.value);
    error.value = null;
  });

  watch(data, () => {
    console.log('Received SSE data:', data)
    if (!data.value) return;
    useNoticeStore().addNotice({
      message: data.value,
      read: false,
      time: new Date().toLocaleString()
    });
    const node = JSON.parse(data.value || '{}');
    const content = `${node.content || node.title}`
    ElNotification({
      title: 'Message',
      message: content || data.value,
      type: 'primary',
      duration: 3000
    });
    data.value = null;
  });
};
