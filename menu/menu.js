const menu = [
    {
      path: '/',
      name: '首页',
      icon: 'ios-home-outline',
      hide: true,
    },
    {
      path: '/asset',
      name: '资产中心',
      icon: 'ios-compass-outline',
      children: [
        {
          path: '/asset/host',
          name: '主机管理',
          icon: 'ios-desktop-outline',
          admin: false,
        },
        {
          path: '/asset/region',
          name: '区域管理',
          icon: 'ios-nuclear-outline',
          admin: false,
        },
      ]
    },
    {
      path: '/project',
      name: '项目中心',
      icon: 'ios-aperture-outline',
      children: [
        {
          path: '/project/project',
          name: '项目管理',
          icon: 'md-appstore',
        },
        {
          path: '/project/env',
          name: '环境管理',
          icon: 'logo-euro',
        },
        {
          path: '/project/app',
          name: '应用管理',
          icon: 'ios-appstore-outline',
        },
        {
          path: '/project/version',
          name: '版本管理',
          icon: 'ios-infinite-outline',
        },
      ]
    },
    {
      path: '/kube',
      name: '容器中心',
      icon: 'ios-color-wand-outline',
      children: [
        {
          path: '/kube/cluster',
          name: '集群管理',
          icon: 'ios-color-filter-outline',
        },
        {
          path: '/kube/node',
          name: '节点管理',
          icon: 'ios-easel-outline',
        },
        {
          path: '/kube/deployment',
          name: '部署管理',
          icon: 'logo-codepen',
        },
        {
          path: '/kube/stateful',
          name: '有状态管理',
          icon: 'ios-help-buoy-outline',
        },
        {
          path: '/kube/service',
          name: '服务管理',
          icon: 'md-funnel',
        },
        {
          path: '/kube/ingress',
          name: '入口管理',
          icon: 'ios-locate-outline',
        },
      ]
    },
    {
      path: '/setting',
      name: '系统配置',
      icon: 'ios-cog-outline',
      children: [
        {
          path: '/setting/auth',
          name: '认证管理',
          icon: 'ios-eye-outline',
        }
      ]
    },
]

export default menu