<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">Forget Password</h3>
      <div style="font-size: 12px; color: gray">
        <p>Enter the email address you used when you joined and we’ll send you instructions to reset your password.</p>
        <p>For security reasons,</p>
        <p>we do NOT store your password.</p>
        <p>So rest assured that we will never send your password via email.</p>
      </div>
      <el-form-item prop="email">
        <el-input v-model="registerForm.email" type="text" size="large" auto-complete="off" placeholder="Email Address">
          <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="registerForm.code"
          size="large"
          auto-complete="off"
          placeholder="Verification Code"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" class="register-code-img" alt="" @click="getCode" />
        </div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleRegister">
          <span v-if="!loading">Submit</span>
          <span v-else>Submitting...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'">Log in with an existing account</router-link>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, emailLink } from '@/api/login';
import { to } from 'await-to-js';

const router = useRouter();

const registerForm = ref({
  username: '',
  email: '',
  code: '',
  uuid: '',
  userType: 'sys_user'
});

// 邮箱校验
const validateEmail = (rule: any, value: string, callback: any) => {
  let emailRegExp = /^[a-zA-Z0-9]+([_.-][a-zA-Z0-9]+)*@([a-zA-Z0-9]+[-.])+[a-zA-Z]{2,5}$/;
  if (!emailRegExp.test(value) && value != '') {
    callback(new Error('Please enter a valid email format!'));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  email: [
    { required: true, trigger: 'blur', message: 'Please enter your email address' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: 'Please enter the verification code' }]
};
const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(emailLink(registerForm.value));
      if (!err) {
        loading.value = false;
        const msg =
          'Identity Verification\n' +
          'Verification in progress mnb***@126.com Reset password Please select the method of verification.\n' +
          '\n' +
          'By Email Verification\n' +
          'If your email is still in use, please choose this way.';
        ElMessageBox.confirm(msg, {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'success',
          center: true
        })
          .then(() => {
            router.push('/login');
          })
          .catch(() => {});
      } else {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      }
    }
  });
};

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    registerForm.value.uuid = data.uuid;
  }
};

onMounted(() => {
  getCode();
});
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 190px;
  height: 100%;
  background-image: url('../assets/images/login-background.png');
  background-size: cover;
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
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
    margin-left: 0;
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
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

.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
