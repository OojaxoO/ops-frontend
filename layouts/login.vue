<template>
    <div class="content">
        <div class="login">
            <Row class="loginHeader">
                <div style="font-size: 4.6vh">XXXXX运维平台</div>
                <!-- <Col span="8" align="right"> -->
                    <!-- <img style="max-width: 100%; height: 5vh; vertical-align: middle;" src="~/assets/logo.jpg"/> -->
                <!-- </Col> -->
                <!-- <Col span="16"> -->
                    <!-- <div style="font-size: 4.6vh">运维平台</div> -->
                <!-- </Col> -->
            </Row>
            <div class="loginBody">
                <Form ref="formInline" :model="formInline" :rules="ruleInline">
                    <FormItem prop="username">
                        <Input type="text" v-model="formInline.username" placeholder="Username">
                            <Icon type="ios-person-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" password v-model="formInline.password" placeholder="Password">
                            <Icon type="ios-lock-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button shape="circle" type="success" @click="handleSubmit('formInline')" long>登录</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'login',
  data () {
      return {
          formInline: {
              username: '',
              password: ''
          },
          ruleInline: {
              username: [
                  { required: true, message: 'Please fill in the user name', trigger: 'blur' }
              ],
              password: [
                  { required: true, message: 'Please fill in the password.', trigger: 'blur' },
                  { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
              ]
          }
      }
  },
  methods: {
      handleSubmit(name) {
          this.$refs[name].validate((valid) => {
              if (valid) {
                  let form = new FormData()
                  let { username, password } = { ...this.formInline }
                  form.append('grant_type', 'password')
                  form.append('username', username)
                  form.append('password', password)
                  this.$auth.loginWith('local',{data: form})
              } else {
                this.$Message.error('校验失败!');
              }
          })
      }
  }
};
</script>

<style scoped>
    .content {
        background-color: #24a4ff;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
    }
    .login {
        padding: 30vh 40vw; 
    }
    .loginHeader {
        height: 5vh;
        color:aliceblue;
        font-size: 4vh;
        display: flex;
    }
    .loginBody {
        margin-top: 2vh;
    }
</style>
