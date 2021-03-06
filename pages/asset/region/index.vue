<template>
    <div>
        <Card style="height: 10%">
            <Row>
                <Col span="12">
                    <Input search @on-search="handleSearch" v-model="value" placeholder="搜索名字"/>
                </Col>
                <Col span="12" align="right">
                    <Button @click="handleSearch" type="primary" icon="ios-refresh">刷新</Button>
                    <Button type="success" icon="md-add" @click="drawerShow = true">添加</Button>
                </Col>
            </Row>
        </Card>
        <Card style="margin-top: 10px">
            <Table tooltip-theme="light" :columns="columns" :data="data.data"/>
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
            :title="drawerTitle"
            v-model="drawerShow"
            width="720"
            :mask-closable="false"
            :styles="styles"
        >
            <Form ref="addForm" :model="formData">
                <FormItem label="英文名" label-position="top">
                    <Input v-model="formData.name" placeholder="请输入区域英文名" />
                </FormItem>
                <FormItem label="中文名" label-position="top">
                    <Input v-model="formData.ch_name" placeholder="请输入区域中文名" />
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
import { list, create, update, _delete } from "@/api/asset/region"

export default {
    data () {
        return {
            value: '',
            page: 1,
            data: [],
            total: 0,
            styles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            formData: {
                name: '',
                ch_name: '',
            },
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            drawerTitle: "添加区域",
            drawerShow: false,
            columns: [{
                title: '英文名',
                key: 'name',
                align: 'center'
            },{
                ellipsis: true,
                tooltip: true,
                title: '中文名',
                key: 'ch_name',
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
            this.page = page
            list(this).then(resp=>{
                this.data = resp.data.data
            }) 
        },
        pageSizeChange (pageSize) {
            this.pageSize = pageSize
            this.getPage(1)
        },
        handleCancel () {
            this.drawerShow = false
        },
        handleCommit () {
            if (this.formData.ID) {
                update(this).then(resp => {
                    this.$set(this.data.data, this.index, resp.data.data)
                    this.$Message.info('更新成功')
                    this.drawerShow = false
                })
            } else {
                create(this).then(resp => {
                    this.data.data.push(resp.data.data)
                    this.drawerShow = false
                    this.$Message.info('添加成功')
                })
            }
        },
        handleDropDown (name, row, index) {
            switch (name) {
              case 'delete':
                this.$Modal.confirm({
                  title: '区域删除',
                  content: '确认删除区域：' + row.name,
                  onOk: () => {
                    _delete(this, row.ID).then(resp => {
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
        }
    }
}
</script>