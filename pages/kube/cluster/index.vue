<template>
    <div>
        <Card style="height: 10%">
            <Row>
                <Col span="12">
                    <Input @on-search="handleSearch" search v-model="search" placeholder="搜索名字"/>
                </Col>
                <Col span="12" align="right">
                    <Button @click="handleSearch" type="primary" icon="ios-refresh">刷新</Button>
                    <Button type="success" icon="md-add" @click="drawerShow = true">添加</Button>
                </Col>
            </Row>
        </Card>
        <Card style="margin-top: 10px">
            <Table :loading="loading" tooltip-theme="light" :columns="columns" :data="data.data"/>
            <Page 
                style="margin-top: 10px; text-align: right" 
                @on-change="getPage" 
                @on-page-size-change="pageSizeChange"
                :total="total" 
                :page-size-opts="pageSizeOpts"
                show-sizer
                show-total />
        </Card>
        <Drawer
            title="创建集群"
            v-model="drawerShow"
            width="720"
            :mask-closable="false"
            :styles="styles"
        >
            <Form ref="addForm" :model="formData">
                <FormItem label="名字" label-position="top">
                    <Input v-model="formData.Name" placeholder="请输入集群名" />
                </FormItem>
                <FormItem label="配置" label-position="top">
                    <Input autosize type="textarea" v-model="formData.Config" :rows="4" placeholder="请输入集群配置" />
                </FormItem>
            </Form>
            <div class="demo-drawer-footer">
                <Button style="margin-right: 8px" @click="handleCancel">取消</Button>
                <Button type="primary" @click="handleCommit">提交</Button>
            </div>
        </Drawer>    
    </div>
</template>

<script>
import { cluster } from "@/api/kube/cluster"

export default {
    data () {
        return {
            search: '',
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            total: 0,
            loading: false,
            drawerTitle: "集群创建",
            drawerShow: false,
            formData: {
                Name: '',
                Config: '',
            },
            styles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            data: [],
            columns: [{
                title: '名字',
                key: 'Name',
                align: 'center'
            },{
                ellipsis: true,
                tooltip: true,
                title: '配置',
                key: 'Config',
                align: 'center'
            },{
                title: '操作',
                width: "150",
                align: 'center',
                render: (h, params) => {
                    if (this.isAdmin) {
                      return h('div', [
                        h('Button', {
                          props: {
                            type: 'primary',
                            size: 'small',
                          },
                          on: {
                            click: () => {
                              this.handleEdit(params.row, params.index)
                            }
                          }
                        }, '更新'),
                        h('Dropdown', {
                          props: { trigger: 'click', transfer: true },
                          style: { marginLeft: '10px' },
                          on: {
                            'on-click': (name) => {
                              this.handleDropDown(name, params.row, params.index)
                            }
                          }
                        }, [
                          h('a', { props: { href: 'javascript:void(0)' } }, ['更多', h('Icon', { props: {
                            type: 'ios-arrow-down' } })]),
                          h('DropdownMenu', { slot: 'list' }, [
                            h('DropdownItem', { props: { name: 'monitor' } }, '监控'),
                            h('DropdownItem', { props: { name: 'delete' } }, '删除')
                          ])
                        ])
                      ])
                    } else {
                      return h('div', '无权限')
                    }
          }
        }]
        }
    },
    mounted () {
        this.init()
    },
    computed: {
        isAdmin: function () {
            return this.$auth.user.is_superadmin
        }
    },
    methods: {
        init () {
          this.handleSearch()
        },
        handleSearch () {
            this.getPage(1)
        },
        getPage (page=1) {
            this.loading = true 
            this.$axios.get(`${cluster.list}?page=${page}&pageSize=${this.pageSize}&search=${this.search}`).then(resp=>{
                this.data = resp.data.data
                this.total = this.data.total
                this.loading = false
            }).catch(
                this.loading = false 
            ) 
        },
        handleCancel () {
            this.$refs.addForm.restFields()
            this.drawerShow = false
        },
        handleCommit () {
            if (this.formData.ID) {
                let {ID, ...data} = this.formData
                this.$axios.put(`${cluster.list}/${ID}`, data).then(resp => {
                    this.$set(this.data.data, this.index, resp.data.data)
                    this.$Message.info('更新成功')
                    this.drawerShow = false
                    this.$refs.addForm.restFields()
                })
            } else {
                this.$axios.post(cluster.list, this.formData).then(resp => {
                    this.data.data.push(resp.data.data)
                    this.drawerShow = false
                    this.$Message.info('添加成功')
                    this.$refs.addForm.restFields()
                })
            }
        },
        handleDropDown (name, row, index) {
            switch (name) {
              case 'monitor':
                this.drawStatusCost = true
                break
              case 'delete':
                this.$Modal.confirm({
                  title: '集群删除',
                  content: '确认删除集群：' + row.Name,
                  onOk: () => {
                    this.$axios.request({
                      url: `${cluster.list}/${row.ID}`, 
                      method: 'DELETE'
                    }).then(response => {
                      this.data.data.splice(index, 1)
                      this.$Message.info('删除成功')
                    })
                  }
                })
                break
            }
        },
        handleEdit (row, index) {
            this.formData = {...row}
            this.index = index 
            this.drawerTitle = "集群更新"
            this.drawerShow = true
        },
        pageSizeChange (pageSize) {
            this.pageSize = pageSize
            this.getPage(1)
        },
    }
}
</script>