<template>
  <div class="register">
    <el-form ref="pwdRef" :model="user" :rules="rules" class="register-form">
      <h3 class="title">Reset Password</h3>
      <el-form-item prop="newPassword">
        <el-input v-model="user.newPassword" type="password" size="large" auto-complete="off" placeholder="New password" show-password> </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="user.confirmPassword" type="password" size="large" auto-complete="off" placeholder="Confirm new password" show-password>
        </el-input>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="submit">
          <span v-if="!loading">Submit</span>
          <span v-else>Submitting...</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { updatePwdNoOldPwd } from '@/api/system/user';
import type { ResetPwdForm } from '@/api/system/user/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const pwdRef = ref<ElFormInstance>();
const user = ref<ResetPwdForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const email = ref<string>('');

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (user.value.newPassword !== value) {
    callback(new Error('The passwords entered twice are inconsistent'));
  } else {
    callback();
  }
};
const rules: ElFormRules = {
  newPassword: [
    { required: true, message: 'The new password cannot be empty', trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: 'Length ranging from 6 to 20 characters',
      trigger: 'blur'
    },
    { pattern: /^[^<>"'|\\]+$/, message: 'Cannot contain illegal characters:< > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Confirm password cannot be empty', trigger: 'blur' },
    {
      required: true,
      validator: equalToPassword,
      trigger: 'blur'
    }
  ]
};

/** 提交按钮 */
const submit = () => {
  pwdRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await updatePwdNoOldPwd(email.value, user.value.newPassword);
      proxy?.$modal.msgSuccess('Password changed successfully!');
      await router.push('/login');
    }
  });
};
onMounted(() => {
  if (typeof route.query.email === 'string') {
    email.value = route.query.email;
  }
});
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
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
