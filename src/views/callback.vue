<template></template>

<script setup lang="ts">
import { ElLoading } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { useRouter } from 'vue-router';
// import { getRoutersJs } from '@/api/menu';

// const loadingInstance = ElLoading.service({
//   lock: true, // 是否锁定屏幕
//   text: 'Loading...', // 加载文本
//   background: 'rgba(0, 0, 0, 0.7)', // 背景遮罩颜色
//   target: document.body // 加载动画的容器，默认为 body
// });

const router = useRouter();

const authStore = useAuthStore();

authStore.userManager.signinCallback().then(async function (user) {
    console.log(user, 'callback.vue');
    authStore.handleTokenFromObj(user);
    if(user.access_token){
      console.log(user.access_token)
    }
    // const res = await getRoutersJs();
    // if(res.code==200){
    //   localStorage.setItem('navList',JSON.stringify(res.data))
    //   // 去除首页之后，默认登录进入第一个页面
    //   if(res.data&&res.data.length>0){
    //     if(res.data[0].children&&res.data[0].children.length>0){
    //       router.push(res.data[0].path+"/"+res.data[0].children[0].path);
    //     }else{
    //       router.push(res.data[0].path);
    //     } 
    //   }else{
    //     router.push('/404');
    //   }
    // }else{
    //   router.push('/404');
    // }
    router.push('/robotmanage');
    // loadingInstance.close();
  }).catch((err) => {
    console.error(err, 'failed to get token from server');
    // window.location.href = import.meta.env.VITE_APP_CONTEXT_PATH+"/";
    // loadingInstance.close();
    ElMessage({ message: 'failed to get token from server', type: 'error' });
    setTimeout(function(){
      authStore.userManager.signinRedirect()
    },5000)
  });
</script>
