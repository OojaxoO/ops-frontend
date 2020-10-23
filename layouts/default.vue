<template>
  <div class="layout">
    <Layout>
      <Sider style="min-height: 100vh; width: 10vw" hide-trigger>
        <div class="layout-logo">
          <NuxtLink to="/">
            <Row type="flex" justify="center" align="middle" style="height: 8vh">
              <!-- <img style="height: 3vh" src="~/assets/logo.jpg" /> -->
              <div class="layout-logo-font">XXXXX运维平台</div>
            </Row>
            <!-- <img height="30px" width="20px" src="~/assets/learn.png"/> -->
          </NuxtLink>
        </div>
        <sideMenu />
      </Sider>
      <Layout style="min-height: 100vh">
        <Header>
          <Menu class="layout-nav" mode="horizontal" theme="light">
            <div style="text-align: center; float: right">
              <MenuItem v-if="$auth.loggedIn" name="4">
                <Dropdown>
                  <Avatar style="background-color: #87d068" icon="ios-person" />
                  <DropdownMenu slot="list">
                    <DropdownItem divided>
                      <h5>{{ $auth.user.username }}</h5>
                    </DropdownItem>
                    <DropdownItem divided>
                      <a @click.prevent="logout">退出登录</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </MenuItem>
            </div>
          </Menu>
        </Header>
        <Content class="content">
          <nuxt />
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import sideMenu from "./components/sideMenu.vue";
import Logo from "~/components/Logo.vue";

export default {
  name: "menu",
  components: { sideMenu, Logo },
  methods: {
    logout() {
      this.$auth.logout();
    }
  }
};
</script>

<style scoped>
.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  /* border-radius: 4px; */
  overflow: hidden;
  min-height: 100vh;
}
.layout-logo {
  height: 8vh;
  background-color: #24a4ff;
  /* border-radius: 3px; */
}
.layout-logo-font {
  color: aliceblue;
  font-size: 2.2vh;
  display: inline;
}
.layout-nav {
  height: 8vh;
  text-align: center;
}
.layout-footer-center {
  text-align: center;
}
.layout /deep/ .ivu-layout-header {
  background: #f5f7f9;
  height: 8vh;
  line-height: 8vh;
  padding: 0;
}
.content {
  margin: 2vh 1vw;
}
</style>