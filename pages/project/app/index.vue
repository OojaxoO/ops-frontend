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
            <Form ref="addForm" :label-width="90" label-position="right" :model="formData">
                        <FormItem label="英文名">
                            <Input style="width: 80%" v-model="formData.name" placeholder="请输入名字" />
                        </FormItem>
                        <FormItem label="中文名">
                            <Input style="width: 80%" v-model="formData.ch_name" placeholder="请输入名字" />
                        </FormItem>
                        <FormItem label="项目">
                            <Select style="width: 80%" filterable v-model="formData.project_id">
                                <Option v-for="item of projects" :key="item.ID" :value="item.ID" :label="item.ch_name"/>
                            </Select>
                        </FormItem>
                        <FormItem label="jenkins工程">
                            <Input style="width: 80%" v-model="formData.jenkins_job" placeholder="请输入jenkins工程名" />
                        </FormItem>
                        <FormItem label="git项目名">
                            <Input style="width: 80%" v-model="formData.git_uri" placeholder="请输入git项目名" />
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
import { list, create, update, _delete } from "@/api/project/app"
import { url } from "@/api/project/project"
import config from "./config"

export default {
    components: {
        config,
    },
    data () {
        return {
            value: '',
            projects: [],
            auth: [],
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
                project_id: -1,
                jenkins_job: '',
                git_uri: '',
            },
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            drawerTitle: "添加应用",
            drawerShow: false,
            columns: [{
                title: '#',
                type: 'expand',
                width: 50,
                align: 'center',
                render: (h, params) => {
                    return h(config, {
                        props: {
                            app_id: params.row.ID,
                            app_name: params.row.ch_name,
                        },
                        on: {
                            handleEdit: this.handleConfigEdit
                        }
                    })
                }
            },{
                title: '英文名',
                key: 'name',
                align: 'center'
            },{ title: '中文名',
                align: 'center',
                key: 'ch_name',
            },{
                title: '项目',
                align: 'center',
                render: (h, params) => {
                    return h('div', params.row.project.ch_name)
                }
            },{
                title: 'git',
                align: 'center',
                key: 'git_uri',
            },{
                title: 'jenkins',
                align: 'center',
                key: 'jenkins_job',
            },{
                title: '操作',
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
            }],
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
            this.getProjects()
            this.handleSearch()
        },
        getProjects () {
            this.$axios.$get(url).then(resp=>{
                this.projects = resp.data 
            })
        },
        handleSearch () {
            this.getPage(1)
        },
        getPage (page=1) {
            this.page = page
            list(this).then(resp=>{
                this.data = resp.data.data
                this.total = this.data.total
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
        },
        handleConfigEdit (row) {

        }
    }
}
</script>