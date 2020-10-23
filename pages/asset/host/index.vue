<template>
    <div>
        <Card style="height: 10%">
            <Row>
                <Col span="12">
                    <Input search @on-search="handleSearch" v-model="value" placeholder="搜索名字"/>
                </Col>
                <Col span="12" align="right">
                    <Button @click="handleSearch" type="primary" icon="ios-refresh">刷新</Button>
                </Col>
            </Row>
        </Card>
        <Card style="margin-top: 10px">
            <Table tooltip-theme="light" :columns="columns" :data="data.data"/>
        </Card>
    </div>
</template>

<script>

export default {
    data () {
        return {
            value: '',
            data: [],
            columns: [{
                ellipsis: true,
                tooltip: true,
                title: '主机名',
                key: 'HostName',
                align: 'center'
            },{
                title: '内网ip',
                key: 'PrimaryIpAddress',
                align: 'center'
            },{
                title: '公网ip',
                key: 'PublicIpAddress',
                render: (h, params) => {
                    return h('div', params.row.PublicIpAddress || "暂无")
                },
                align: 'center'
            },{
                title: '系统',
                key: 'OSName',
                align: 'center'
            },{
                title: 'CPU',
                key: 'Cpu',
                align: 'center'
            },{
                title: 'MEM',
                key: 'Memory',
                render: (h, params) => {
                    return h('div', params.row.Memory/1024)
                },
                align: 'center'
            },{
                title: '区域',
                key: 'RegionId',
                align: 'center'
            }]
        }
    },
    mounted () {
        this.init()
    },
    methods: {
        init () {
            this.handleSearch()
        },
        handleSearch () {
            this.$axios.get(`${this.$API.asset.host}?search=${this.value}`).then(resp=>{
                this.data = resp.data
            }) 
        },
    }
}
</script>