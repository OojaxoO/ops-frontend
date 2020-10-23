<template>
  <div>
    <Row>
        <Col span="8">
            <Input v-model="keyword" placeholder="请输入搜索内容......" style="width: 200px"/>
        </Col>
        <Col span="16" align="right">
            <Button @click="handleSearch" type="default" icon="md-refresh">刷新</Button>
        </Col>
    </Row>
    <Table :loading="loading" style="margin-top: 10px" :data="searchData" :columns="columns"/>
    <Modal v-model="updateValue" title="服务更新" @on-ok="deployCommit" @on-cancel="deployCancel">
        <Form :label-width="40">
            <FormItem label="应用">
                <Input v-model="updateName" disabled/>
            </FormItem>
            <FormItem label="版本">
                <Select v-model="tmpUpdateData">
                    <Option
                        v-for="item of updateVersion"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </Select>
            </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import oneLineMany from '@/components/oneLineMany/oneLineMany'
import podModal from './podModal'
import { cluster } from "@/api/kube/cluster"

export default {
  name: 'appProjectDeploy',
  components: { podModal, oneLineMany },  
  props: {
    app: {
      type: Object,
    },
    deploy: {
      type: Object,
    },
    runtime_deploy: {
      type: Object,
    },
    runtime_top: {
      type: Object,
    },
    env: {
      type: Object,
    },
    cluster: {
      type: Number,
    },
    project: String,
    version: Number,
    disabled: {
      type: Array,
      default: [true, true]
    }, 

  },
  data () {
    return {
      kubeData: {},
      loading: false,
      updateValue: false,
      updateName: '',
      updateVersion: [], 
      tmpUpdateData: null, 
      statusColor: {
        '未部署': '#ffc019',
        '执行中': '#a789ff',
        '执行成功': '#25c824',
        '执行失败': '#ff1c21'
      },
      columns: [{
        title: '#',
        type: 'expand',
        width: 60,
        align: 'center',
        render: (h, params) => {
          let cluster = {}
          cluster[this.env.name] = this.cluster
          return h(podModal, { props: {
            project: this.project,
            app: params.row.chart,
            cluster: cluster
          } })
        }
      },{
        title: '应用',
        align: 'center',
        render: (h, params) => {
          return h('a', {on: {
            click: () => this.$emit('editConfig', params.row, this.env.id)
          }}, params.row.name)
        }
      },{
        title: '运行镜像',
        align: 'center',
        render: (h, params) => {
          let data = this.handleImage(params.row.chart)
          return h(oneLineMany, {
            props: {
              rowData: data,
              lineShowNum: 1
            }
          })
        }
      },{
        title: '运行状态',
        align: 'center',
        render: (h, params) => {
          let status = this.handleStatus(params.row.chart)
          if (!status) {
            return h('div', '暂无')
          }
          return h('Badge', {
            props: {
              status: status[1], 
              text: status[0], 
            }
          })
        }
      },{
        title: '更新状态',
        align: 'center',
        render: (h, params) => {
          if (!params.row.status) {
            return h('span', {class: 'defaultspan'}, params.row.status) 
          }
          return h('Tooltip',
            {
              props: {
                maxWidth: 500,
                theme: 'light',
                disabled: !(['执行成功', '执行失败'].includes(params.row.status))
              }
            },
            [
              h('div', {style: {color: this.deployColor(params.row.status)}}, params.row.status),
              h('div', { slot: 'content', style: {width: "350px"}}, [
                h('div', {style: { whiteSpace: 'pre-line' }}, params.row.result),
              ])
            ]
          )
        }
      },{
        title: '更新人',
        align: 'center',
        render: (h, params) => {
          return h('span', {class: 'defaultspan'}, params.row.user) 
        }
      },{
        title: '更新时间',
        align: 'center',
        render: (h, params) => {
          return h('span', {class: 'defaultspan'}, params.row.update_time ? formatDate(params.row.update_time): null) 
        }
      },{
          title: '操作',
          align: 'center',
          width: 180,
          render: (h, params) => {
            if (this.disabled[0]) {
              return h('div', {style: { color: 'gray' }},'无权限')
            }
            return h('ButtonGroup', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: this.env.environment != 'dev' && (this.disabled[1] || params.row.status === '执行成功')
                  },
                  on: {
                    click: () => {
                      this.handleUpdate(params.row, params.index)
                    }
                  }
                },
                '更新'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.handleReload(params.row, params.index)
                    }
                  }
                }, 
                '重载'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.handleStop(params.row, params.index)
                    }
                  }
                }, 
                '停止'
              ),
            ])
          }
      // },{
      //   title: '结果',
      //   align: 'center',
      //   render: (h, params) => {
      //     if (!params.row.result) {
      //       return h('span', {class: 'defaultspan'},params.row.result) 
      //     } else {
      //       return h('Tooltip',
      //           {
      //             props: {
      //               maxWidth: 500,
      //               theme: 'light',
      //             }
      //           },
      //           [
      //             h('div', { style: { width: "200px", whiteSpace: 'nowrap', overflow: 'hidden',  textOverflow: 'ellipsis'} },
      //             params.row.result),
      //             h('span', { slot: 'content', style: { whiteSpace: 'pre-line' }}, 
      //             params.row.result)
      //           ]
      //         )
      //     }
      //   },
      // },{
      //   title: '更新人',
      //   align: 'center',
      //   render: (h, params) => {
      //     if (!params.row.user) {
      //       return h('span', {class: 'defaultspan'}, null)
      //     } else {
      //       return h('div', params.row.user)
      //     }
      //   }
      }],
      keyword: ""
    }
  },
  created () {
    this.init()
  },
  computed: {
    allData: function () {
      let data = [] 
      let envName = this.env.environment
      for (let [name, info] of Object.entries(this.app)) {
        // let config = info.config || {}
        let {chart, values} = info
        let deploy = {image:null, deploy_text:null, deploy_status:null}
        let deployData = (this.deploy && name in this.deploy) ? this.deploy[name] : null
        let version = deployData ? deployData.version : null 
        let exec = deployData ? deployData.exec : null
        // let deploy_name = this.env.ID in config ? config[this.env.ID].name : null
        let update_time = exec ? exec.update_time : null
        let user = exec ? exec.user : null
        let status = exec ? exec.status : null
        let result = exec ? exec.result : null
        let id = exec ? exec.id : null
        if (this.kubeData && chart && chart in this.kubeData) {
          deploy = this.kubeData[chart]
        }
        let _data = { name, version, chart, values, status, result, user, id, update_time}
        _data = Object.assign(_data, deploy)
        data.push(_data)
      }
      return data
    },
    searchData: function () {
      if (this.keyword != "") {
        return this.allData.filter(item=>item.name.includes(this.keyword))
      } 
      return this.allData
    },
  },
  methods: {
    init () {
      // this.getK8sDeployment()
    },
    handleSearch () {
      this.getK8sDeployment()
      this.$emit('handleSearch')
    },
    getK8sDeployment () {
      let namespace = this.env
      let cluster = this.cluster
      let url = `${Api.kube_deploy}?namespace=${namespace}&cluster=${cluster}&project=${this.project}`
      this.loading = true 
      getInfo(url).then(resp => {
        let data = {}
        resp.data.data.forEach(item=>{
          let name = item.metadata.name
          let image = item.spec.template.spec.containers[0].image
          let deploy_status = this.handleStatus(item, 'status') 
          let deploy_text = this.handleStatus(item, 'text') 
          data[name] = { image, deploy_status, deploy_text }
        })
        this.kubeData = data
        this.loading = false
      }).catch(error=>{
        this.$Message.error('获取集群数据失败')
        this.loading = false
      })
    },
    handleStatus (name) {
      // if (this.env === 'approve') {
      //   return ['0/0', 'default'] 
      // }
      let deploy = this.runtime_deploy ? this.runtime_deploy[name] : null
      if (!deploy) {
        return ['0/0', 'default'] 
      }
      let dCount = deploy.replicas || 0
      let aliveCount = deploy.readyReplicas || 0
      let msg = aliveCount.toString() + '/' + dCount.toString()
      let status = (aliveCount === dCount) ? 'processing' : 'error'
      return [msg, status]
    },
    handleImage (name) {
      let deploy = this.runtime_deploy ? this.runtime_deploy[name] : null
      if (!deploy) {
        return []
      }
      return deploy.image.map(item=>item.split('/')[2])
    },
    // handleStatus (row, type) {
    //   let dCount = row.status.replicas ? row.status.replicas : 0
    //   let aliveCount = 0
    //   if (dCount !== 0) {
    //     aliveCount = row.status.readyReplicas ? row.status.readyReplicas : 0
    //   }
    //   if (type === 'status') {
    //     if (aliveCount === dCount) {
    //       return 'processing'
    //     } else {
    //       return 'error'
    //     }
    //   } else {
    //     return aliveCount.toString() + '/' + dCount.toString()
    //   }
    // },
    deployColor (status) {
      return this.statusColor[status] || '#ffc019'
    },
    handleReload (row, index) {
      // 单个应用重载
      let url = Api.project_app_deploy_exec + 'do_reload/'
      this.$Modal.confirm({
        title: '应用重载',
        content: `确认重载应用${row.name}-${row.version}？`,
        onOk: () => {
          let data = { data : [row.id]}
          this.loading = true 
          axios.request({
            url, 
            data, 
            method: 'POST',
          }).then(response => {
            let data = response.data
            let msg = ''
            for (let [key, value] of Object.entries(response.data)) {
              msg += `<h4 style="text-align: left">${key}: ${value}</h4>`
            }
            this.$Message.success(msg)
            this.$emit('handleSearch')
            this.loading = false
          }).catch(error=>{
            console.log(error)
            this.loading = false
          })
        } 
      })
    },
    handleStop (row, index) {
      // 单个应用停止
      let url = `${Api.kube_chart}?name=${row.deploy_name}&namespace=${this.env.environment}&cluster=${this.env.cluster}`
      this.$Modal.confirm({
        title: '应用停止',
        content: `确认停止应用${row.name}-${row.version}？<br>停止后可使用重载启动！`,
        onOk: () => {
          this.loading = true 
          axios.request({
            url,
            method: 'DELETE'
          }).then(response => {
            this.$Message.info('操作完成')
            this.$emit('handleSearch')
            this.loading = false
          }).catch(error=>{
            console.log(error)
            this.loading = false
          })
        }
      })
    },
    handleUpdate (row) {
      // 单个应用更新
      let envName = this.env.environment
      let name = row.name
      let version = this.app[name].app.version
      if (envName === 'dev') {
        this.updateValue = true
        this.updateName = name
        this.updateVersion = version
        return
      }
      this.$Modal.confirm({
        title: '服务更新',
        content: `确认更新服务${row.name}-${row.version}?`,
        onOk: () => {
          this.loading = true
          axios.request({
            url: Api.project_app_deploy_exec + 'do_update/',
            method: 'POST',
            data: {
              env: this.env.id,
              version: this.version,
              data: [row.id]
            }
          }).then(response => {
            this.loading = false 
            this.$Message.success('更新成功')
            this.$emit('handleSearch')
            console.log(response.data)
          }).catch(error => {
            this.loading = false 
            this.$Message.error('更新失败')
            console.log(error.response.data)
          })
        } 
      })
    },
    deployCommit () {
      let data = [this.tmpUpdateData]
      this.loading = true
      axios
        .request({
          url: `${Api.project_version}${this.version}/do_dev_update/`,
          method: 'POST',
          data, 
        })
        .then(response => {
          this.updateValue = false
          this.loading = false 
          this.$Message.info('开始更新')
          this.$emit('handleSearch')
        })
        .catch(error => {
          this.loading = false 
          console.log(error)
        })
    },
    deployCancel () {
      this.updateName = null,
      this.updateVersion = [],
      this.tmpUpdateData = null,
      this.updateValue = false 
    }
  },
};
</script>

<style>
  .defaultspan:empty::before {
    height: 36px;
    content: '暂无';
    color: gray;
  }
</style>
