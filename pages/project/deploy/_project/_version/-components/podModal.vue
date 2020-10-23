<template>
    <Card dis-hover="">
        <Table :loading="load" :columns="columns" :data="data"></Table>
    </Card>
</template>

<script>
import columnCard from '@/components/column-card/column-card'
import { formatDate } from '@/util/util'
import { cluster } from "@/api/kube/cluster"

export default {
  name: 'podModal',
  props: {
    app: String,
    cluster: Object
  },
  components: {
    columnCard
  },
  data () {
    return {
      data: [],
      load: false,
      columns: [
        {
          title: '名称',
          align: 'center',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.detail(params.row.metadata.name, params.row.metadata.namespace)
                }
              }
            }, params.row.metadata.name)
          }
        },
        {
          title: '主机IP',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.status.hostIP ? params.row.status.hostIP : '-')
          }
        },
        {
          title: 'Pod-IP',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.status.podIP ? params.row.status.podIP : '-')
          }
        },
        {
          title: '创建时间',
          align: 'center',
          render: (h, params) => {
            return h(columnCard, {props: {
              content: formatDate(params.row.metadata.creationTimestamp)
            }})
            // return h('div', formatDate(params.row.metadata.creationTimestamp))
          }
        },
        {
          title: '容器镜像',
          align: 'center',
          render: (h, params) => {
            return h(columnCard, {props: {
              content: params.row.spec.containers.length > 0 ? (
                       params.row.spec.containers[0].image ? params.row.spec.containers[0].image : '-') : '-'
            }})
          }
        },
        {
          title: '命名空间',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.metadata.namespace)
          }
        },
        {
          title: '状态',
          align: 'center',
          render: (h, params) => {
            return h('Badge', {
              props: {
                status: this.handleStatus(params.row, 'status'),
                text: this.handleStatus(params.row, 'text')
              }
            })
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('ButtonGroup', {
              props: {
                size: 'small'
              } },
            [
              h('Button', {
                props: {
                  type: 'primary'
                },
                on: {
                  click: () => {
                    this.openTerminal(params.row)
                  }
                }
              }, '登陆'),
              h('Button', {
                props: {
                  type: 'primary'
                },
                on: {
                  click: () => {
                    this.openLog(params.row)
                  }
                }
              }, '日志')
            ])
          }
        }
      ]
    }
  },
  created () {
    this.podGet()
  },
  methods: {
    openLog (row) {
      let routeUrl = this.$router.resolve({
        name: 'kube-cluster-namespace-name-log',
        params: { cluster: this.cluster[row.metadata.namespace], name: row.metadata.name, namespace: row.metadata.namespace }
      })
      window.open(routeUrl.href, '_blank')
    },
    openTerminal (row) {
      let routeUrl = this.$router.resolve({
        name: 'kube-cluster-namespace-name-terminal',
        params: { cluster: this.cluster[row.metadata.namespace], name: row.metadata.name, namespace: row.metadata.namespace }
      })
      window.open(routeUrl.href, '_blank')
    },
    podGet () {
      this.data = []
      this.load = true
      for (let [env, _cluster] of Object.entries(this.cluster)) {
        if (_cluster !== '') {
          this.$axios.$get(`${cluster.list}/${_cluster}/pod?namespace=${env}&labelSelector=app=${this.app}`).then(resp=>{
            this.load = false 
            this.data = this.data.concat(resp.data.items)
            this.sortBy()
          })
        }
      }
    },
    compare () {
      return function (obj1, obj2) {
        let var1 = obj1['metadata']['namespace']
        let var2 = obj2['metadata']['namespace']
        if (var1 < var2) {
          return -1
        } else if (var1 > var2) {
          return 1
        } else {
          return 0
        }
      }
    },
    sortBy () {
      this.data.sort(this.compare())
    },
    handleStatus (row, type) {
      let phase = '-'
      let containerStatus = (row.status && row.status.containerStatuses) ? row.status.containerStatuses[0] : {}
      if (containerStatus.ready !== null && containerStatus.ready !== undefined) {
        if (containerStatus.ready.toString().toLowerCase() === 'false') {
          for (let x in containerStatus.state) {
            phase = containerStatus.state[x].reason
          }
        } else {
          if (row.metadata.deletionTimestamp && row.metadata.deletionTimestamp.toString().toLowerCase() !== 'none') {
            phase = 'Terminating'
          } else {
            phase = 'Running'
          }
        }
      }
      if (phase === '-') {
        containerStatus = (row.status && row.status.conditions) ? row.status.conditions[0] : {}
        if (containerStatus.status && containerStatus.status.toString().toLowerCase() === 'false') {
          phase = containerStatus.reason
        }
      }
      if (type === 'status') {
        if (phase.toLowerCase() === 'running') {
          return 'processing'
        } else {
          return 'error'
        }
      } else {
        return phase
      }
    },
    handleDropDown (name, row, index) {
      axios.request({
        method: 'POST',
        url: Api.project_deploy_action,
        data: {
          id: row.id,
          action: name
        }
      }).then(response => {
        if (response.data.error) {
          this.$Message.error(response.data.error)
        } else {
          this.$Message.info('操作成功')
        }
      })
    },
    isAdmin () {
      return (this.$store.state.user.access[0] === 'admin')
    },
    detail (name, namespace) {
      this.$router.push({
        name: 'pod-detail',
        params: {
          cluster: this.cluster[namespace],
          name: name,
          namespace: namespace
        }
      })
    }
  }
}
</script>

<style>

</style>
