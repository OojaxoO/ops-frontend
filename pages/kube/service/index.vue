<template>
    <div>
        <Card style="height: 10%">
            <Row>
                <Col span="4">
                    <Cascader 
                        v-model="namespaceSelect"
                        @on-change="namespaceChange"	
                        :data="clusters" 
                        :load-data="loadData"
                    />
                </Col>
                <Col offset="8" span="12" align="right">
                    <Input style="width: 30vw" search @on-search="handleSearch" v-model="value" placeholder="搜索名字"/>
                    <Button @click="handleSearch" type="primary" icon="ios-refresh">刷新</Button>
                </Col>
            </Row>
        </Card>
        <Card style="margin-top: 10px">
            <Table :loading="loading" tooltip-theme="light" :columns="columns" :data="subData"/>
            <Page 
                style="margin-top: 10px; text-align: right" 
                @on-change="getPage" 
                @on-page-size-change="pageSizeChange"
                :total="total" 
                :page-size-opts="pageSizeOpts"
                show-sizer
                show-total />
        </Card>
    </div>
</template>

<script>
import { cluster } from "@/api/kube/cluster"

export default {
    data () {
        return {
            value: '',
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            clusters: [],
            total: 0,
            namespaceSelect: [],
            loading: false,
            data: [],
            subData: [],
            columns: [{
                ellipsis: true,
                tooltip: true,
                title: '名字',
                key: 'name',
                align: 'center',
                render: (h, params) => {
                            return h('div', params.row.metadata.name)
                        }
            },{
                title: '命名空间',
                key: 'name',
                align: 'center',
                render: (h, params) => {
                            return h('div', params.row.metadata.namespace)
                        }
            },{
                title: 'IP',
                key: 'ip',
                render: (h, params) => {
                            return h('div', params.row.spec.clusterIP)
                        },
                align: 'center'
            }, {
                title: 'PORT',
                key: 'port',
                render: (h, params) => {
                            return h('div', params.row.spec.ports.map(item=>{
                                let data = `${item.port}:${item.targetPort}`
                                return <div>{item.protocol}://{item.port}:{item.targetPort}</div>
                            }))
                        },
                align: 'center'
            }]
        }
    },
    mounted () {
        this.init()
    },
    computed: {
        namespace: function () {
            if (this.namespaceSelect.length >= 2) {
                return this.namespaceSelect[1]
            }
        },
        cluster: function () {
            if (this.namespaceSelect.length >= 2) {
                return this.namespaceSelect[0]
            }
        },
        labelSelector: function () {
            if (this.value != "") {
                return `app=${this.value}`
            }
            return ""
        },
    },
    methods: {
        init () {
            this.getClusters()
        },
        namespaceChange (value) {
            this.namespaceSelect = value
            this.handleSearch()
        },
        handleSearch () {
            this.loading = true
            this.$axios.$get(`${cluster.list}/${this.cluster}/service?namespace=${this.namespace}&labelSelector=${this.labelSelector}`).then(resp=>{
                this.loading = false 
                this.data = resp.data.items
                this.total = this.data.length
                this.getPage(1)
            }).catch(
                this.loading = false
            ) 
        },
        getPage (page=1) {
            let start = (page - 1) * this.pageSize
            let end = page * this.pageSize 
            this.subData = this.data.slice(start, end) 
        },
        getClusters () {
            this.loading = true
            this.$axios.$get(cluster.list).then(resp=>{
                this.clusters = resp.data.map(item=>{
                    return {
                        value: item.ID,
                        label: item.Name,
                        children: [],
                        loading: false
                    }
                })
                this.namespaceSelect = [this.clusters[0].value, "default"]
                this.handleSearch()
            }).catch(
                this.loading = false
            )
        },
        loadData (item, callback) {
            item.loading = true
            this.$axios.$get(`${cluster.list}/${item.value}/namespace`).then(resp=>{
                item.children = resp.data.items.map(i => {
                    item.loading = false
                    return {
                        value: i.metadata.name,
                        label: i.metadata.name
                    }
                })
                callback()
            })
        },
        pageSizeChange (pageSize) {
            this.pageSize = pageSize
            this.getPage(1)
        },
    }
}
</script>