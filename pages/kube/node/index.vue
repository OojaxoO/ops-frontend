<template>
    <div>
        <Card style="height: 10%">
            <Row>
                <Col span="4">
                    <Select v-model="cluster" placeholder="请选择集群" @on-change="handleSearch" filterable>
                        <Option 
                            v-for="item in clusters" 
                            :value="item.ID.toString()" 
                            :key="item.ID.toString()" 
                            :label="item.Name"
                        />
                    </Select>
                </Col>
                <Col offset="8" span="12" align="right">
                    <Input style="width: 30vw" search v-model="value" placeholder="搜索名字"/>
                    <Button @click="handleSearch" type="primary" icon="ios-refresh">刷新</Button>
                </Col>
            </Row>
        </Card>
        <Card style="margin-top: 10px">
            <Table :loading="loading" tooltip-theme="light" :columns="columns" :data="data"/>
        </Card>
    </div>
</template>

<script>
import { cluster } from "@/api/kube/cluster"

export default {
    data () {
        return {
            loading: false,
            value: '',
            clusters: [],
            cluster: null, 
            data: [],
            columns: [{
                ellipsis: true,
                tooltip: true,
                title: '主机名',
                key: 'name',
                align: 'center',
                render: (h, params) => {
                            return h('div', params.row.metadata.name)
                        }
            },{
                title: 'IP',
                key: 'address',
                render: (h, params) => {
                            return h('div', params.row.status.addresses[0].address)
                        },
                align: 'center'
            },{
                title: '系统',
                key: 'osImage',
                render: (h, params) => {
                            return h('div', params.row.status.nodeInfo.osImage)
                        },
                align: 'center'
            },{
                title: 'CPU',
                key: 'cpu',
                render: (h, params) => {
                            return h('div', params.row.status.capacity.cpu)
                        },
                align: 'center'
            },{
                title: 'MEM',
                key: 'memory',
                render: (h, params) => {
                            return h('div', this.ki2g(params.row.status.capacity.memory))
                        },
                align: 'center'
            },{
                title: '磁盘',
                key: 'ephemeral-storage',
                render: (h, params) => {
                            return h('div', this.ki2g(params.row.status.capacity["ephemeral-storage"]))
                        },
                align: 'center'
            }]
        }
    },
    mounted () {
        this.init()
    },
    methods: {
        init () {
            this.getClusters()
        },
        handleSearch () {
            this.getPage(1)
        },
        getPage (page=1) {
            this.$axios.$get(`${cluster.list}/${this.cluster}/node`).then(resp=>{
                this.loading = false 
                this.data = resp.data.items
            }).catch(err=>{
                this.loading = false 
            }) 
        },
        getClusters () {
            this.loading = true
            this.$axios.$get(cluster.list).then(resp=>{
                this.clusters = resp.data
                if (this.cluster == null && this.clusters.length > 0) {
                    this.cluster = this.clusters[0].ID.toString()
                    this.getPage(1)
                }
            })
        },
        ki2g (str) {
           str = str.slice(0, -2) 
           return Math.round(Number(str)/1024/1024)
        }
    }
}
</script>