import { to as tos } from 'await-to-js';
import router from './router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import { useAuthStore } from '@/store/modules/auth';

NProgress.configure({ showSpinner: false });
const whiteList = ['/login','/callback', '/register', '/social-callback', '/forgetPassword', '/changePassword'];

const handleAuthenticatedRoute = async (to: any, next: any) => {
  if (to.path === '/login') {
    next({ path: '/robotmanage' });
    NProgress.done();
    return;
  }else if(to.path === '/index'||to.path === '/'||to.path === ''){
    next({ path: '/robotmanage' });
    NProgress.done();
    return;
  }

  if (whiteList.indexOf(to.path as string) !== -1) {
    next();
    return;
  }

  if (useUserStore().roles.length === 0) {
    return await handleUserInfoFetch(to, next);
  }

  next();
};

const handleUserInfoFetch = async (to: any, next: any) => {
  // debugger;
  isRelogin.show = true;
  const [err] = await tos(useUserStore().getInfo());
  const authStore = useAuthStore();
  
  if (err) {
    await useUserStore().logout();
    await authStore.logout();
    ElMessage.error(err);
    // next({ path: '/' });
    setTimeout(function(){
      authStore.userManager.signinRedirect()
    },3000)
    return;
  }

  isRelogin.show = false;
  // const accessRoutes = await usePermissionStore().generateRoutes();
  // accessRoutes.forEach((route) => {
  //   if (!isHttp(route.path)) {
  //     router.addRoute(route);
  //   }
  // });
  
  next({ 
    path: to.path, 
    replace: true, 
    params: to.params, 
    query: to.query, 
    hash: to.hash, 
    name: to.name as string 
  });
};

const  handleUnauthenticatedRoute = async (to: any, next: any) =>  {
  if (whiteList.indexOf(to.path as string) !== -1) {
    next();
    return;
  }
  
  // const redirect = encodeURIComponent(to.fullPath ?? '/');
  // next(`/login?redirect=${redirect}`);
  const authStore = useAuthStore();
  await authStore.userManager.signinRedirect()
  NProgress.done();
};

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  
  const authStore = useAuthStore();
  await authStore.init();
  
  try {
    if (authStore.authState.accessToken) {
      to.meta.title && useSettingsStore().setTitle(to.meta.title);
      await handleAuthenticatedRoute(to, next);
    } else {
      handleUnauthenticatedRoute(to, next);
    }
  } catch(err) {
    console.warn(err);
    authStore.logout();
    await authStore.userManager.signinRedirect()
    // window.location.href = '/';
  }
});

router.afterEach(() => {
  NProgress.done();
});
