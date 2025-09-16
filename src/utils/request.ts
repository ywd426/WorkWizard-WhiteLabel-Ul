import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/modules/user';
import { getToken } from '@/utils/auth';
import { tansParams, blobValidate } from '@/utils/ruoyi';
import cache from '@/plugins/cache';
import { HttpStatus } from '@/enums/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { useAuthStore } from '@/store/modules/auth';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import FileSaver from 'file-saver';
import { getLanguage } from '@/lang';
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import useAppStore from '@/store/modules/app';
const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance;
// let authStore = null;
// 是否显示重新登录
export const isRelogin = { show: false };

export const globalHeaders = () => {
  const authStore = useAuthStore();
  let token = 'Bearer ' + getToken();
  if (authStore.authState.accessToken) {
    // 让每个请求携带自定义token 请根据实际情况自行修改
    token = `Bearer ${authStore.authState.accessToken}`;
  }
  return {
    Authorization: token,
    clientid: import.meta.env.VITE_APP_CLIENT_ID,
    timeZone: useAppStore().currentTimeZone
  };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientid'] = import.meta.env.VITE_APP_CLIENT_ID;
// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => handleRequest(config),
  (error) => Promise.reject(new Error(error.message))
);

async function handleRequest(config: InternalAxiosRequestConfig) {
  const authStore = useAuthStore();

  // 如果token即将过期，先刷新
  if (authStore.isTokenExpiringSoon()) {
    console.log('The token is about to expire. Please refresh it first.');
    await authStore.refreshAuthToken();
  }
  
  // 处理不需要baseURL的请求
  handleBaseURL(config);
  
  // 对应国际化资源文件后缀
  config.headers['Content-Language'] = getLanguage();
  // 用户选择的时区，默认浏览器时区
  config.headers['Time-Zone'] = useAppStore().currentTimeZone;
  
  if (authStore.authState.accessToken) {
    // 让每个请求携带自定义token 请根据实际情况自行修改
    config.headers['Authorization'] = `Bearer ${authStore.authState.accessToken}`;
  }
  if (authStore.authState.role) {
    config.headers['Role'] = authStore.authState.role;
  }
  
  if (authStore.authState.tenantId) {
    config.headers['tenantId'] = authStore.authState.tenantId;
  }

  handleGetRequest(config);
  handleRepeatSubmit(config);
  handleEncryption(config);
  handleFormData(config);
  return config;
}
// 处理不需要baseURL的请求
function handleBaseURL(config: InternalAxiosRequestConfig) {
  // 检查是否需要跳过baseURL
  const skipBaseURL = config.headers?.skipBaseURL === 'true' || config.headers?.skipBaseURL === true;
  if (skipBaseURL) {
    // 移除baseURL，使用完整的URL或相对路径
    config.baseURL = '';
    // 清除skipBaseURL标志，避免传递到服务器
    delete config.headers.skipBaseURL;
  }
}

// get请求映射params参数
function handleGetRequest(config: InternalAxiosRequestConfig) {
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
}
//防止数据重复提交
function handleRepeatSubmit(config: InternalAxiosRequestConfig) {
  // 是否需要防止数据重复提交
  const isRepeatSubmit = config.headers?.repeatSubmit === false;
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    };
    const sessionObj = cache.session.getJSON('sessionObj');
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj);
    } else {
      const s_url = sessionObj.url; // 请求地址
      const s_data = sessionObj.data; // 请求数据
      const s_time = sessionObj.time; // 请求时间
      const interval = 500; // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = 'The data is being processed, please do not resubmit.';
        console.warn(`[${s_url}]: ` + message);
        return Promise.reject(new Error(message));
      } else {
        cache.session.setJSON('sessionObj', requestObj);
      }
    }
  }
}
//加密逻辑
function handleEncryption(config: InternalAxiosRequestConfig) {
  if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
    // 是否需要加密
    const isEncrypt = config.headers?.isEncrypt === 'true';
    // 当开启参数加密
    if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
      // 生成一个 AES 密钥
      const aesKey = generateAesKey();
      config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
      config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey);
    }
  }
}
// FormData数据去请求头Content-Type
function handleFormData(config: InternalAxiosRequestConfig) {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
}

const handleEncryptedResponse = (res: AxiosResponse) => {
  if (import.meta.env.VITE_APP_ENCRYPT !== 'true') return res;
  
  const keyStr = res.headers[encryptHeader];
  if (!keyStr) return res;

  const data = res.data;
  const base64Str = decrypt(keyStr);
  const aesKey = decryptBase64(base64Str.toString());
  const decryptData = decryptWithAes(data, aesKey);
  res.data = JSON.parse(decryptData);
  return res;
};

const handleResponseError = async (error: any) => {
  const authStore = useAuthStore();
  if (error.response?.status === 401) {
    try {
      const refreshSuccess = await authStore.refreshAuthToken();
      if (refreshSuccess) {
        const config = error.config;
        config.headers['Authorization'] = `Bearer ${authStore.authState.accessToken}`;
        return service(config);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    if (!isRelogin.show && !import.meta.env.VITE_COGNITO_AM) {
      isRelogin.show = true;
      ElMessageBox.confirm('The login status has expired. You can continue to stay on this page or log in again.', 'System Prompt', {
        confirmButtonText: 'Log In Again',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        isRelogin.show = false;
        useUserStore().logout().then(() => {
          authStore.logout();
          location.href = import.meta.env.VITE_APP_CONTEXT_PATH + '/index';
        });
      }).catch(() => {
        isRelogin.show = false;
      });
    }
    return Promise.reject(new Error('Invalid session or session has expired, please log in again.'));
  }

  let { message } = error;
  if (message === 'Network Error') {
    message = 'Backend interface connection exception.';
  } else if (message.includes('timeout')) {
    message = 'System interface request timeout.';
  } else if (message.includes('Request failed with status code')) {
    message = 'Interface' + message.substr(message.length - 3) + 'Abnormal';
  }
  ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
  return Promise.reject(new Error(error.message));
};

const handleResponseSuccess = async (res: AxiosResponse) => {
  const authStore = useAuthStore();
  const processedRes = handleEncryptedResponse(res);
  const code = processedRes.data.code ?? HttpStatus.SUCCESS;
  const msg = errorCode[code] ?? processedRes.data.msg ?? errorCode['default'];

  if (processedRes.request.responseType === 'blob' || processedRes.request.responseType === 'arraybuffer') {
    return processedRes.data;
  }

  if (code === 401) {
    try {
      const refreshSuccess = await authStore.refreshAuthToken();
      if (refreshSuccess) {
        const config = processedRes.config;
        config.headers['Authorization'] = `Bearer ${authStore.authState.accessToken}`;
        return service(config);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    if (!isRelogin.show && !import.meta.env.VITE_COGNITO_AM) {
      isRelogin.show = true;
      ElMessageBox.confirm('The login status has expired. You can continue to stay on this page or log in again.', 'System Prompt', {
        confirmButtonText: 'Log In Again',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        isRelogin.show = false;
        useUserStore().logout().then(() => {
          authStore.logout();
          // location.href = import.meta.env.VITE_APP_CONTEXT_PATH + '/index';
        });
      }).catch(() => {
        isRelogin.show = false;
      });
    }
    return Promise.reject(new Error('Invalid session or session has expired, please log in again.'));
  } else if (code === HttpStatus.SERVER_ERROR) {
    ElMessage({ message: msg, type: 'error' });
    Promise.reject(new Error(msg))
    return Promise.resolve(processedRes.data);
    // return Promise.reject(new Error(msg));
  }else if (code === HttpStatus.WARN) {
    ElMessage({ message: msg, type: 'warning' });
    return Promise.reject(new Error(msg));
  }else if (code !== HttpStatus.SUCCESS) {
    ElNotification.error({ title: msg });
    return Promise.reject(new Error('error'));
  }

  return Promise.resolve(processedRes.data);
};

// 响应拦截器
service.interceptors.response.use(
  handleResponseSuccess,
  handleResponseError
);
// 通用下载方法
export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({ text: 'Downloading data, please wait...', background: 'rgba(0, 0, 0, 0.7)' });
  // prettier-ignore
  return service.post(url, params, {
      transformRequest: [
        (params: any) => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    }).then(async (resp: any) => {
      const isLogin = blobValidate(resp);
      if (isLogin) {
        const blob = new Blob([resp]);
        FileSaver.saveAs(blob, fileName);
      } else {
        const resText = await resp.data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] ?? rspObj.msg ?? errorCode['default'];
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    }).catch((r: any) => {
      console.error(r);
      ElMessage.error('There was an error downloading the file, please contact the administrator!');
      downloadLoadingInstance.close();
    });
}
// 创建不带baseURL的axios实例
export const serviceWithoutBaseURL = axios.create({
  timeout: 50000
});

// 为不带baseURL的实例添加相同的拦截器
serviceWithoutBaseURL.interceptors.request.use(
  (config) => handleRequest(config),
  (error) => Promise.reject(new Error(error.message))
);

serviceWithoutBaseURL.interceptors.response.use(
  handleResponseSuccess,
  handleResponseError
);

/**
 * 直接请求方法 - 绕过所有路径处理逻辑，但保留认证信息
 * @param url 完整的请求路径
 * @param params 请求参数
 * @param config 额外的axios配置
 * @returns Promise
 */

export function directRequest(url: string, params?: any, config?: any) {
  // 获取认证store
  const authStore = useAuthStore();
  
  const requestConfig = {
    ...config,
    url,
    method: config?.method || 'GET',
    headers: {
      // 添加必要的认证头信息
      'Content-Type': 'application/json;charset=utf-8',
      'clientid': import.meta.env.VITE_APP_CLIENT_ID,
      'Content-Language': getLanguage(),
      'Time-Zone': useAppStore().currentTimeZone,
      // 添加认证token
      ...(authStore.authState.accessToken && {
        'Authorization': `Bearer ${authStore.authState.accessToken}`
      }),
      // 添加角色信息
      ...(authStore.authState.role && {
        'Role': authStore.authState.role
      }),
      // 添加租户ID
      ...(authStore.authState.tenantId && {
        'tenantId': authStore.authState.tenantId
      }),
      // 用户自定义的headers
      ...config?.headers,
      // 跳过baseURL处理
      skipBaseURL: 'true'
    }
  };

  // 根据请求方法设置参数
  if (requestConfig.method.toUpperCase() === 'GET') {
    requestConfig.params = params;
  } else {
    requestConfig.data = params;
  }

  return service(requestConfig);
}

/**
 * 直接POST请求
 * @param url 完整的请求路径
 * @param data 请求数据
 * @param config 额外的axios配置
 * @returns Promise
 */
export function directPost(url: string, data?: any, config?: any) {
  return directRequest(url, data, { ...config, method: 'POST' });
}

/**
 * 直接GET请求
 * @param url 完整的请求路径
 * @param params 请求参数
 * @param config 额外的axios配置
 * @returns Promise
 */
export function directGet(url: string, params?: any, config?: any) {
  return directRequest(url, params, { ...config, method: 'GET' });
}

/**
 * 直接PUT请求
 * @param url 完整的请求路径
 * @param data 请求数据
 * @param config 额外的axios配置
 * @returns Promise
 */
export function directPut(url: string, data?: any, config?: any) {
  return directRequest(url, data, { ...config, method: 'PUT' });
}

/**
 * 直接DELETE请求
 * @param url 完整的请求路径
 * @param params 请求参数
 * @param config 额外的axios配置
 * @returns Promise
 */
export function directDelete(url: string, params?: any, config?: any) {
  return directRequest(url, params, { ...config, method: 'DELETE' });
}

// 导出 axios 实例
export default service;
