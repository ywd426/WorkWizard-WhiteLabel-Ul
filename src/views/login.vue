<template>
  <div class="login">
    <el-form v-if="showCognitoForm" id="login-form-node" ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">Sign in to FOXX</h3>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="submitOIDC">
          <span v-if="!loading">OIDC LOGIN</span>
          <span v-else>Logging In...</span>
        </el-button>
      </el-form-item>
    </el-form>

    <el-form v-if="!showCognitoForm" id="login-form-node" ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">Sign in to FOXX</h3>
      <el-form-item prop="username">
        <el-input
          id="login-user-name-input"
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="Username or Email Address"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          id="login-pwd-input"
          v-model="loginForm.password"
          type="password"
          show-password
          size="large"
          auto-complete="off"
          placeholder="password"
          @keyup.enter="submit"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          id="login-qr-code-input"
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="Verification Code"
          style="width: 63%"
          @keyup.enter="submit"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" class="login-code-img" alt="" @click="getCode" />
        </div>
      </el-form-item>
      <el-checkbox id="login-remember-checkbox" v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">Remember me.</el-checkbox>
      <el-form-item style="float: right">
        <el-link style="margin-right: 5px">
          <router-link class="link-type" :to="'/forgetPassword'">Forget password?</router-link>
        </el-link>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button id="login-sign-in-btn" :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="submit">
          <span v-if="!loading">SIGN IN</span>
          <span v-else>Logging In...</span>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 修改租户对话框 -->
    <el-dialog id="logon-succ-form-prompt" v-model="visible" :title="title" width="500px" append-to-body>
      <el-form ref="tenantFormRef" :model="loginForm" :rules="tenantRules" label-width="80px">
        <el-form-item v-if="tenantEnabled" prop="tenantId">
          <el-select v-model="loginForm.tenantId" filterable placeholder="Please select/enter company name" style="width: 100%" clearable>
            <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
            <template #prefix>
              <svg-icon icon-class="company" class="el-input__icon input-icon" />
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="handleLogin">ok</el-button>
          <el-button @click="cancel">cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, preLogin } from '@/api/login';
import { authBinding } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useAuthStore } from '@/store/modules/auth';

const showCognitoForm = computed(() => {
  return import.meta.env.VITE_COGNITO_AM
})

const userStore = useUserStore();
const router = useRouter();

const loginForm = ref<LoginData>({
  tenantId: '',
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  // tenantId: [{ required: true, trigger: 'blur', message: '请输入您的租户编号' }],
  username: [{ required: true, trigger: 'blur', message: 'Please enter your account' }],
  password: [{ required: true, trigger: 'blur', message: 'Please enter your password' }],
  code: [{ required: true, trigger: 'change', message: 'Please enter the verification code' }]
};
const tenantRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: 'Please enter your tenant number' }]
};

const codeUrl = ref('');
const title = ref('Please select tenant');
const visible = ref(false);
const loading = ref(false);
const buttonLoading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);

// 注册开关
const register = ref(false);
const redirect = ref(undefined);
const loginRef = ref<ElFormInstance>();
const tenantFormRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

const authStore = useAuthStore();

// OIDC登录
const submitOIDC =  async () => {
  await authStore.userManager.signinRedirect()
  // authStore.userManager.signinCallback().then(function (user) {
  //   console.log(user)
  // });
}


const submit = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 调用action的登录方法
      const preLoginResult = await handlePreLogin();
      if (preLoginResult) {
        loading.value = false;
        return;
      }
    }
    loading.value = false;
  });
};
const handlePreLogin = async () => {
  const [err, res] = await to(preLogin(loginForm.value));
  if (res) {
    const { data } = res;
    tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
    if (tenantEnabled.value) {
      tenantList.value = data;
      if (tenantList.value != null && tenantList.value.length !== 0) {
        loginForm.value.tenantId = tenantList.value[0].tenantId;
      }
    }
    visible.value = true;
  }
  return !err;
};
const handleLogin = () => {
  tenantFormRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      buttonLoading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/';
        await router.push(redirectUrl);
        buttonLoading.value = false;
      } else {
        buttonLoading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

// 取消按钮
const cancel = () => {
  visible.value = false;
};

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 190px;
  height: 100%;
  background-image: url('../assets/images/login-background.png');
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
