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
            <Form ref="addForm" :label-width="80" label-position="right" :model="formData">
                <FormItem label="版本号">
                    <Input style="width: 80%" v-model="formData.name" placeholder="请输入名字" />
                </FormItem>
                <FormItem label="项目">
                    <Select v-model="formData.project_id" style="width:80%">
                        <Option v-for="item of projects" :key="item.ID" :value="item.ID" :label="item.ch_name"/>
                    </Select>
                    <!-- <Input style="width: 80%" v-model="formData.ch_name" placeholder="请输入名字" /> -->
                </FormItem>
                <FormItem label="预计上线">
                    <DatePicker placeholder="预计上线时间" v-model="formData.deploy_time"></DatePicker>
                </FormItem>
                <FormItem label="描述">
                    <Input type="text" style="width: 80%" v-model="formData.desc" placeholder="描述" />
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
import { list, create, update, _delete } from "@/api/project/version"
import { url } from "@/api/project/project" 
import { formatDate } from "@/util/util" 
// import projectEnvDrawer from "./projectEnvDrawer"
// import projectEnvTable from "./projectEnvTable"

export default {
    components: {
        // projectEnvDrawer,
        // projectEnvTable,
    },
    data () {
        return {
            value: '',
            projects: [],
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
                project_id: -1,
                deploy_time: null,
                desc: '',
            },
            pageSize: 10,
            pageSizeOpts: [10, 20, 50],
            drawerTitle: "添加版本",
            drawerShow: false,
            columns: [
            {
            //     title: '#',
            //     type: 'expand',
            //     width: 50,
            //     align: 'center',
            //     render: (h, params) => {
            //         return h(projectEnvTable, {
            //             props: {
            //                 project_id: params.row.ID
            //             },
            //             on: {
            //                 handleEdit: this.handleProjectEnvEdit
            //             }
            //         })
            //     }
            // },{
                title: '项目',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.project.ch_name)
                }
            },{
                title: '版本号',
                key: 'name',
                align: 'center'
            },{
                title: '预计上线',
                align: 'center',
                ellipsis: 'true',
                tooltip: 'true',
                render: (h, params) => {
                    return h('span', formatDate(params.row.deploy_time, 0, "datetime"))
                }
            },{
                title: '描述',
                align: 'center',
                ellipsis: 'true',
                tooltip: 'true',
                key: 'desc'
            },{
                title: '创建者',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.user.username)
                }
            },{
                title: '创建时间',
                align: 'center',
                render: (h, params) => {
                    return h('span', formatDate(params.row.CreatedAt))
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
                            h('DropdownItem', { props: { name: 'test' } }, '测试'),
                            h('DropdownItem', { props: { name: 'green' } }, '准生产'),
                            h('DropdownItem', { props: { name: 'approve' } }, '审批'),
                            h('DropdownItem', { props: { name: 'blue' } }, '生产'),
                            h('DropdownItem', { props: { name: 'delete' } }, '删除'),
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
            this.getProject()
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
        getProject () {
            this.$axios.$get(url).then(resp=>{
                this.projects = resp.data 
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
            this.formData.user_id = this.$auth.user.ID
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
                case 'test':
                    this.handleEnv(row, 'test')
                    break
            }
        },
        handleEnv (row, env) {
            this.$router.push({
                name: 'project-deploy-project-version-env',
                params: {
                  project: row.project_id,
                  env: env,
                  version: row.ID
                }
            })
        },
        handleEdit (row, index) {
            this.formData = {...row}
            this.index = index 
            this.drawerTitle = "集群更新"
            this.drawerShow = true
        },
        handleProjectEnvEdit (row) {

        }
    }
}
</script>