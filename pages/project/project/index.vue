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
            <Form ref="addForm" :label-width="60" label-position="right" :model="formData">
                <Row :gutter="32">
                    <Col span="12">
                        <FormItem label="英文名">
                            <Input style="width: 80%" v-model="formData.name" placeholder="请输入名字" />
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem label="中文名">
                            <Input style="width: 80%" v-model="formData.ch_name" placeholder="请输入名字" />
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem label="jenkins">
                            <Select v-model="formData.jenkins_id" style="width:80%">
                                <Option v-for="item of auth" :key="item.ID" :value="item.ID" :label="item.name"/>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem label="git">
                            <Select v-model="formData.git_id" style="width:80%">
                                <Option v-for="item of auth" :key="item.ID" :value="item.ID" :label="item.name"/>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <div class="demo-drawer-footer">
                <Button style="margin-right: 8px" @click="handleCancel">取消</Button>
                <Button type="primary" @click="handleCommit">提交</Button>
            </div>
        </Drawer>    
        <project-env-drawer ref="projectEnvDrawer"/>
    </div>
</template>

<script>
import { list, create, update, _delete } from "@/api/project/project"
import { url } from "@/api/setting/auth"
import projectEnvDrawer from "./projectEnvDrawer"
import projectEnvTable from "./projectEnvTable"

export default {
    components: {
        projectEnvDrawer,
        projectEnvTable,
    },
    data () {
        return {
            value: '',
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
                jenkins_id: null,
                git_id: null,
            },
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            drawerTitle: "添加项目",
            drawerShow: false,
            columns: [{
                title: '#',
                type: 'expand',
                width: 50,
                align: 'center',
                render: (h, params) => {
                    return h(projectEnvTable, {
                        props: {
                            project_id: params.row.ID
                        },
                        on: {
                            handleEnvEdit: this.handleEnvEdit
                        }
                    })
                }
            },{
                title: '名字',
                key: 'name',
                align: 'center'
            },{
                title: '服务数量',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.apps.length)
                }
            },{
                title: 'git',
                align: 'center',
                render: (h, params) => {
                    let arg = JSON.parse(params.row.git.arg)
                    return h('span', arg.url)
                }
            },{
                title: 'jenkins',
                align: 'center',
                render: (h, params) => {
                    let arg = JSON.parse(params.row.jenkins.arg)
                    return h('span', arg.url)
                }
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
                            h('DropdownItem', { props: { name: 'delete' } }, '删除'),
                            h('DropdownItem', { props: { name: 'addEnv' } }, '添加环境'),
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
            this.getAuth()
            this.handleSearch()
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
        getAuth () {
            this.$axios.$get(url).then(resp=>{
                this.auth = resp.data 
            })
        },
        pageSizeChange (pageSize) {
            this.pageSize = pageSize
            this.getPage(1)
        },
        handleCancel () {
            this.drawerShow = false
            this.$refs.addForm.resetFields()
        },
        handleCommit () {
            if (this.formData.ID) {
                update(this).then(resp => {
                    this.$set(this.data.data, this.index, resp.data.data)
                    this.$Message.info('更新成功')
                    this.drawerShow = false
                    this.$refs.addForm.resetFields()
                })
            } else {
                create(this).then(resp => {
                    this.data.data.push(resp.data.data)
                    this.drawerShow = false
                    this.$refs.addForm.resetFields()
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
                case 'addEnv':
                    this.$refs.projectEnvDrawer.project = row 
                    this.$refs.projectEnvDrawer.formData.project_id = row.ID 
                    this.$refs.projectEnvDrawer.drawerShow = true
                    break
            }
        },
        handleEdit (row, index) {
            this.formData = {...row}
            this.index = index 
            this.drawerTitle = "集群更新"
            this.drawerShow = true
        },
        handleEnvEdit (row) {
            this.$refs.projectEnvDrawer.project = this.data.data.filter(item=>item.ID==row.project_id)[0] 
            this.$refs.projectEnvDrawer.formData = {
                project_id: row.project_id,
                ID: row.ID,
                cluster_id: row.cluster_id,
                env_id: row.env_id,
                namespace: row.namespace,
                admin: row.admin.map(item=>item.ID)
            }
            this.$refs.projectEnvDrawer.drawerShow = true
            this.$refs.projectEnvDrawer.getNamespaces(row.cluster_id)
        }
    }
}
</script>