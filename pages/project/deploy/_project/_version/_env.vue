<template>
    <div>
        <Card style="height: 10%">
            <Steps :current="current">
                <Step 
                    v-for="step of stepData" 
                    :title="step.title" 
                    :status="step.status" 
                    :content="step.name" 
                    :key="step.$index"/>
            </Steps>
        </Card>
        <Card style="margin-top: 10px">
            <Tabs @on-click="handleTabChange" v-model="tab">
                <TabPane 
                  v-for="item of project_env"
                  :key="item.ID"
                  :label="item.env.ch_name"
                  :name="item.ID.toString()">
                    <app-project-deploy 
                        @handleSearch="handleSearch"
                        :app="appData"
                        :runtime_deploy="deployStatus[item.ID]"
                        :runtime_top="deployTop[item.ID]"
                        :deploy="deployData"
                        :env="item.env"
                        :cluster="item.cluster_id"
                        :version="id"
                        :disabled="deployDisabled"
                        :project="project"/>
                </TabPane>
            </Tabs>
        </Card>
    </div>
</template>

<script>
import { wsStatus, wsTop } from "@/api/kube/ws";
import { formatDate } from '@/util/util'
import { get, lastVersionDeploy } from "@/api/project/version";
import appProjectDeploy from './-components/appProjectDeploy'

export default {
  components: { appProjectDeploy },
  data() {
    return {
      projectInit: false,
      deployStatus: {
      },
      deployTop: {
      },
      projectTop: {
      },
      pvc: {}, 
      init_tab: 'test',
      last_deploy: {},
      listStyle: {
        width: '250px',
        height: '280px'
      },
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },
      users: [],
      clusters: [],
      envFormData: {
        step: 1,
        admin: [],
        name: '',
        ch_name: '',
        namespace: '',
        cluster: null,
        configmap: '',
        project: null, 
      },
      envOption: {
        lineNumbers: true,
        mode: 'text/x-sh',
        autoRefresh: true,
        autofocus: true,
        // extraKeys: { 'Tab': 'autocomplete' },
        class: 'CodeMirror, CodeMirror-scroll',
        theme: 'dracula'
      },
      envs: {
        '测试环境': 'test',
        '准生产环境': 'green',
        '审批': 'approve',
        '生产环境': 'blue'
      },
      ws: {
        status: {
          test: null,
          green: null,
          blue: null,
        },
        top: {
          test: null,
          green: null,
          blue: null,
        }
      },
      id: null,
      historyWrap: null,
      env: {},
      backTopShow: false,
      tab: '',
      project: '',
      projectId: null,
      backTopStyle: {
        float: 'left',
        width: '48px',
        height: '40px',
        marginTop: '5px',
        backgroundColor: 'rgba(153,174,188,.3)',
        textAlign: 'center',
      },
      data: {
        project: {
          name: '',
          app: [],
          dev: [],
          master: [],
          test: [],
          ops: [],
        },
        env_instance: [], 
        env_all: [],
        dev_last_exec: [],
      },
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.websocketClose()
  },
  // mounted () {
  //   let dom = document.documentElement;
  //   this.historyWrap = document.getElementsByClassName("ivu-layout")[1]
  //   window.addEventListener("scroll", this.handleScroll, true);
  //   let box = this.$refs.box
  //   box.addEventListener('mouseover', this.mouseOver, true)
  //   box.addEventListener('mouseout', this.mouseLeave, true)
  // },
  // beforeDestroy () {
  //   window.removeEventListener("scroll", this.handleScroll, true)
  //   let box = this.$refs.box
  //   box.removeEventListener('mouseover', this.mouseOver, true)
  //   box.removeEventListener('mouseout', this.mouseLeave, true)
  // },
  computed: {
    isDev: function () {
      let data = this.tab in this.envMapById && this.envMapById[this.tab].environment === 'dev'
      return data
    },
    project_env: function () {
      return this.projectData ? this.projectData.project_env : []
    },
    // project_env_id: function () {
    //   return this.project_env.filter()
    // },
    current: function () {
      return this.last_deploy ? Object.keys(this.envs).indexOf(this.last_deploy.process): -1
    },
    projectData: function () {
      return this.data.project
    },
    admin: function () {
      let admin = {
        dev: this.projectData.dev.concat(this.projectData.master),
        qa: this.projectData.test,
        uat: this.projectData.test,
        approve: this.projectData.pm,
        live: this.projectData.ops
      }
      return admin
    },
    envAdmin: function () {
      return this.admin[this.envName] ? this.admin[this.envName].includes(this.$store.state.user.userId) : false
    },
    deployDisabled: function () {
      if (this.isAdmin) {
        return [false, false]
      }
      if (this.envAdmin) {
        let step = this.tab !== 'approve' ? this.data.env_instance.indexOf(Number(this.tab)) : -2
          console.log(step,this.current)
        if (step === this.current || this.envName === 'dev') {
          return [false, false] 
        } else {
          return [false, true] 
        }
      }
      return [true, true] 
    },
    canAddDeploy: function () {
      if (this.isAdmin()) {
        return true
      }
      let projectAdmin = this.admin.dev 
      let user = this.$store.state.user
      let userId = user.userId
      return projectAdmin.includes(userId)
    },
    deployEnv: function () {
      if (this.tab in this.envMapById) {
        let data = this.envMapById[this.tab].id
        return data 
      }
    },
    stepData: function () {
      let status = this.last_deploy.status || 'wait' 
      let process = this.last_deploy.process || '测试环境'
      let gtEnv = false
      let data = [] 
      for (let envName of Object.keys(this.envs)) {
        let name = envName
        if (!gtEnv && envName != process) {
          data.push({title: '已完成', name, status: 'finish'})
        } else if (!gtEnv && envName == process) {
          gtEnv = true
          let title = '进行中'
          let _status = 'process'
          if (process == '审批') {
            if (status==='未开始') {
              _status = 'error'
              title = '驳回'
            }
          }
          data.push({title, status: _status, name})
        } else if (gtEnv && envName != process) {
          data.push({title: '待进行', name, status: 'wait'})
        }
      }
      return data
    },
    namespace: function () {
      return this.tab in this.envMapById ? this.envMapById[this.tab].env : null 
    },
    cluster: function () {
      return this.tab in this.envMapById ? this.envMapById[this.tab].cluster : null 
    },
    envMapById: function () {
      let data = {}
      this.project_env.forEach(element => {
        data[element.ID] = element
      })  
      return data
    },
    apps: function () {
      return this.data.project.app.length > 0 ? this.data.project.app.map(item=>item.app.id) : []
    },
    appData: function () {
      let data = {}
      if (this.data.project.apps.length > 0) {
        this.data.project.apps.forEach(element=>{
          let name = element.name
          console.log(this.tab)
          let config = element.config.filter(item=>item.project_evn_id === Number(this.tab))
          if (config.length == 1){
              let envConfig = config[0]
              element.chart = envConfig.chart
              element.value = envConfig.value
          }
          // element.config.forEach(conf=>{
          //   config[conf.env] = conf
          // })
          data[name] = element 
        })
      }
      return data
    },
    envName: function () {
      let data = this.tab in this.envMapById ? this.envMapById[this.tab].environment : 'approve'
      return data
    }, 
    tabs: function () {
      let data = [...this.data.project.project_env]
      if (data.length == 4) {
        data.splice(3, 0, 'approve')
      }
      return data
    },
    dev_last_exec: function () {
      let data = {}
      this.data.dev_last_exec.forEach(item=>{
        let { app, version } = { ...item }
        data[app] = { version, exec: item }
      })
      return data
    },
    deployData: function () {
      let data = {}
      if (this.envName === 'dev' && this.dev_last_exec) {
        return this.dev_last_exec
      }else if (this.last_deploy && 'app_deploy' in this.last_deploy) {
        this.last_deploy.app_deploy.forEach(app_deploy=>{
          let app_name = app_deploy.app_version.app
          let version = app_deploy.app_version.name
          let exec_info = {}
          data[app_name] = { version }
          for (let exec of app_deploy.deploy_exec) {
            if (exec.env === this.deployEnv) {
              data[app_name].exec = exec 
              break
            }
          }
        })
      }
      return data
    },
    liveEnv: function () {
      let len = this.data.env_instance.length
      let liveInstanceId = this.data.env_instance[len-1]
      return this.envMapById[liveInstanceId] || {}
    },
    isAdmin: function () {
      return this.$auth.user.is_superadmin
    }
  },
  methods: {
    init () {
      this.id = Number(this.$route.params.version)
      this.init_tab = this.$route.params.env
      this.handleSearch(true)
    },
    getLastVersionDeploy() {
      lastVersionDeploy(this).then(resp=>{
        this.last_deploy = resp.data.data || {}
      })
    },
    getVersionDetail (init=false) {
      get(this).then(resp=>{
        this.data = resp.data.data
        if (init) {
          this.projectInit = true
          this.tab = this.data.project.project_env.filter(
            item=>item.env.name==this.init_tab
          )[0].ID.toString()
          this.connectWebSocket()
        }
      })
    },
    handleSearch(init=false) {
      this.getLastVersionDeploy()
      this.getVersionDetail(init)
    },
    handleTabChange (name) {
      this.tab = name
      this.connectWebSocket()
    },
    handleScroll () {
      let scrollTop = this.historyWrap.scrollTop
      if (scrollTop > 20) {
        this.backTopShow = true
      } else {
        this.backTopShow = false 
      }
    },
    updateConfig (index, data) {
      let tmpData = { ...this.data }
      tmpData.app[index] = data 
      this.data = tmpData
    },
    addDeploy () {
      if (this.canAddDeploy) {
        this.$refs.addDeploy.drawerStatus = true
      } else {
        this.$Message.info('请先添加项目管理员权限')
      }
    },
    update (data) {
      this.data = data
    },
    getAppData () {
      let data = this.env[this.tab].data
      return data 
    },
    backTop () {
      const that = this
      let timer = setInterval(() => {
        let ispeed = Math.floor(-that.historyWrap.scrollTop / 5)
        that.historyWrap.scrollTop = that.historyWrap.scrollTop + ispeed
        if (that.historyWrap.scrollTop === 0) {
          clearInterval(timer)
        }
      }, 16)
    },
    mouseOver () {
      this.backTopStyle.backgroundColor = 'rgba(128, 0, 128, .3)' //'rgba(153,174,30,.3)'
    },
    mouseLeave () {
      this.backTopStyle.backgroundColor = 'rgba(153,174,188,.3)'
    },
    getUsers () {
      getInfo(Api.user_user).then(resp=>{
        this.users = resp.data.map(item=>{
          return {
            key: item.id,
            label: `${item.last_name}-${item.username}`
          }
        })
      }).catch(err=>{
        this.$Message.error('获取用户列表失败')
        console.log(err)
      })
    },
    getClusters () {
      getInfo(Api.kube_cluster).then(resp=>{
        this.clusters = resp.data
      }).catch(err=>{
        this.$Message.error('获取集群列表失败')
        console.log(err)
      })
    },
    editConfig (row, tab) {
      if (Object.keys(this.pvc).length===0) {
        this.getPvc()
      }
      let config = _.cloneDeep(row.config)
      for (let [env, info] of Object.entries(config)) {
        info.ingress = info.ingress ? JSON.parse(info.ingress) : {}
        let envConfig = []
        let elConfig = info.config ? JSON.parse(info.config) : {}
        if (elConfig) {
          for (let [k, v] of Object.entries(elConfig)) {
              envConfig.push(`${k}=${v}`)
          }
        }
        info.mount = info.mount ? JSON.parse(info.mount) : [],
        info.config = envConfig.join('\n')
      }
      this.$refs.appConfig.configFormData = config
      this.$refs.appConfig.tab = tab.toString()
      this.$refs.appConfig.configValue = true
    },
    getPvc () {
      let data = {...this.envMapById}
      for (let value of Object.values(data)) {
        let key = value.id
        let namespace = value.environment
        let cluster = value.cluster
        let url = `${Api.kube_persistent_volume_claim}?namespace=${namespace}&cluster=${cluster}`
        getInfo(url).then(resp=>{
          let data = {...this.pvc}
          data[key] = resp.data.data.map(item=>item.metadata.name) || []
          this.pvc = data
        })
      }
    },
    chartDetail (name, version) {
      let row = {
        name,
        cluster: {name: this.cluster.toString(), id: this.cluster.toString()},
        namespace: this.namespace,
        chart: version,
        status: '暂无',
        updated: null,
      }
      getInfo(`${Api.kube_chart}?cluster=${row.cluster.id}&namespace=${row.namespace}&name=${row.name}`).then(resp=>{
        this.$refs.chartModal.chart = row 
        this.$refs.chartModal.modal = true
        this.$refs.chartModal.data = resp.data 
      }).catch(
        // this.$Message.error({ content: `chart ${row.name}不存在`, duration: 2})
      )
    },
    connectWebSocket () {
      if (typeof(WebSocket) === 'undefined') {
        this.$Message.error('您的浏览器不支持websocket')
      }
      if (this.projectInit) {
        for (let type of ['status', 'top']) {
          // let env = this.envMapById[this.tab].env.name
          // if (env == "approve" || this.ws[type][env]) {
          //   continue
          // }
          if (this.ws[type][this.tab]) {
            continue
          }
          let cluster = this.cluster.ID
          let env = this.tab
          let namespace = this.namespace.name
          if (cluster && env && namespace) {
            let typeUri = (type == 'status') ? wsStatus : wsTop 
            let url = `${typeUri}${cluster}/${namespace}/`
            this.ws[type][env] = new WebSocket(url)
            this.ws[type][env].onopen = () => this.wsOpen(type, env)
            this.ws[type][env].onerror = (err) => this.wsError(type, env, err)
            this.ws[type][env].onmessage = (msg) => this.getWsMessage(type, env, msg)
            this.ws[type][env].onclose = (err) => this.wsClose(type, env, err)
          }
        }
      }
    },
    wsOpen (type, env) {
      console.log(`${env} deploy ${type} ws 连接成功!`)
    },
    wsError (type, env, e) {
      console.log(`${env} deploy ${type} ws 连接失败: ${e}`)
    },
    wsClose (type, env, e) {
      console.log(`${env} deploy ${type} ws 连接关闭: ${e.reason}`)
    },
    getWsMessage (wsType, env, msg) {
      let _data = JSON.parse(msg.data)
      if (wsType == "status") {
        let {type, data}  = {..._data}
        if (type != "DELETED") {
          let newStatus = {...this.deployStatus[env], ...data}
          this.$set(this.deployStatus, env, newStatus)
        } else {
          Object.keys(data).forEach(key => {
            this.$delete(this.deployStatus[env], key)
          })
        }
      } else {
        let {cpu, mem, deploy} = {..._data}
        this.$set(this.deployTop, env, deploy)
        this.$set(this.projectTop, env, {cpu, mem})
      } 
    },
    handleStatus (name) {
      if (this.env === 'approve') {
        return ['0/0', 'default'] 
      }
      let deploy = this.deployStatus[this.tab][name]
      if (!deploy) {
        return ['0/0', 'default'] 
      }
      let dCount = deploy.replicas || 0
      let aliveCount = deploy.readyReplicas || 0
      let msg = aliveCount.toString() + '/' + dCount.toString()
      let status = (aliveCount === dCount) ? 'processing' : 'error'
      return [msg, status]
    },
    handleTop (name) {
      if (this.env === 'approve') {
        return null
      }
      return this.deployTop[this.tab][name]
    },
    websocketClose () {
      for (let typeWs of Object.values(this.ws)) {
        for (let ws of Object.values(typeWs)) {
          if (ws != null) {
            ws.close()
          }
        }
      }
    },
  }
};
</script>

<style scoped>
  .scrollup {
    position: fixed;
    bottom: 100px;
    right: 15px;
    z-index: 10;
    display: block;
    width: 48px;
  }
  .arrows {
    height: 40px;
    width: 48px;
    float: left;
    background-color: rgba(153,174,188,.3);
    background-size: 48px;
    transition: bottom 0.9s ease 0s;
  }
  .service {
    float: left;
    text-align: center;
    line-height: 40px;
    width: 48px;
    height: 40px;
    margin-top: 5px;
    background-color: rgba(153,174,188,.3);
  }
  .feedback {
    float: left;
    width: 48px;
    height: 40px;
    margin-top: 5px;
    background-color: rgba(153,174,188,.3);
    filter: alpha(opacity=30);
    background-color: #99aebc;
    text-align: center;
    line-height: 40px;
    color: #fff;
  }
  a {
    color: #34495e;
    outline: medium none;
    text-decoration: none;
    background: transparent;
    transition: all 0.2s ease-in-out;
  }
</style>
