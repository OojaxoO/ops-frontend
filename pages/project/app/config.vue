<template>
    <div>
        <Drawer
            :title="drawerTitle"
            v-model="drawerShow"
            width="720"
            :mask-closable="false"
            :styles="styles"
        >
            <Form ref="addForm" label-position="top" :model="formData">
                <FormItem label="环境名">
                    <Select disabled v-model="config.project_env.env.ID">
                        <Option 
                            disabled 
                            :key="config.project_env.env.ID" 
                            :value="config.project_env.env.ID" 
                            :label="config.project_env.env.ch_name"
                        />
                    </Select>
                </FormItem>
                <FormItem label="集群">
                    <Select disabled v-model="config.project_env.cluster.ID">
                        <Option 
                            :key="config.project_env.cluster.ID" 
                            :value="config.project_env.cluster.ID" 
                            :label="config.project_env.cluster.Name"
                        />
                    </Select>
                </FormItem>
                <FormItem label="命名空间">
                    <Select disabled v-model="config.project_env.namespace">
                        <Option 
                            :key="config.project_env.namespace" 
                            :value="config.project_env.namespace" 
                            :label="config.project_env.namespace"
                        />
                    </Select>
                </FormItem>
                <FormItem label="chart">
                    <Input placeholder="请输入helm chart名字" v-model="formData.chart"/> 
                </FormItem>
                <FormItem label="配置">
                    <codemirror v-model="formData.values" :options="valuesOption"/>
                </FormItem>
            </Form>
            <div class="demo-drawer-footer">
                <Button style="margin-right: 8px" @click="handleCancel">取消</Button>
                <Button type="primary" @click="handleCommit">提交</Button>
            </div>
        </Drawer> 
        <Table tooltip-theme="light" :loading="loading" :columns="columns" :data="data"/>
    </div>
</template>

<script>
import { list, _delete, update } from "@/api/project/config"

export default {
    name: 'config',
    props: {
        app_id: Number,
        app_name: String,
    },
    computed: {
        isAdmin: function () {
            return this.$auth.user.is_superadmin
        }
    },
    data () {
        return {
            config: {
                project_env: {
                    env: {
                        ID: ''
                    },
                    cluster: {
                        ID: ''
                    },
                    chart: '',
                    namespace: ''
                },
            },
            index: null,
            formData: {
                ID: "",
                values: "",
                chart: "",
            },
            project: {
                ID: -1,
                ch_name: ''
            },
            valuesOption: {
                lineNumbers: true,
                mode: 'text/x-yaml',
                autoRefresh: true,
                autofocus: true,
                // extraKeys: { 'Tab': 'autocomplete' },
                class: 'CodeMirror, CodeMirror-scroll',
                theme: 'dracula'
            }, 
            envs: [],
            clusters: [],
            namespaces: [],
            drawerShow: false,
            drawerTitle: "添加环境实例",
            styles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            loading: false,
            data: [],
            columns: [{
                title: '环境',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.project_env.env.ch_name)
                }
            },{
                title: '集群',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.project_env.cluster.Name)
                }
            },{
                title: '命名空间',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.project_env.namespace)
                },
            },{
                title: 'chart',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.chart)
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
                              this.handleShow(params.row, params.index)
                            }
                          }
                        }, '查看'),
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
                            h('DropdownItem', { props: { name: 'update' } }, '更新'),
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
    methods: {
        init () {
            this.getConfig()
        },
        getConfig () {
            this.loading = true 
            list(this).then(resp=>{
                this.data = resp.data.data
                this.loading = false 
            }).catch(
                this.loading = false 
            )
        },
        handleShow (row, index) {
            this.$Modal.info({
                width: "60",
                closable: "true",
                title:  `${this.app_name}${row.project_env.env.ch_name}配置`,
                content: `<article style="white-space: pre-wrap">${row.values}</article>` 
            });
        },
        handleDropDown (name, row, index) {
            switch (name) {
              case 'update':
                this.handleEdit(row, index)
                break
            }
        },
        handleEdit (row, index) {
            this.config = {...row}
            this.index = index 
            this.drawerTitle = "配置更新"
            this.formData = {
                ID: row.ID,
                chart: row.chart,
                values: row.values
            }
            this.drawerShow = true
        },
        handleCommit () {
            update(this).then(resp => {
                // this.$set(this.data, this.index, resp.data.data)
                this.$Message.info('更新成功')
                this.getConfig()
                this.drawerShow = false
                this.$refs.addForm.resetFields()
            })
        },
        handleCancel () {
            this.drawerShow = false
            this.$refs.addForm.resetFields()
        },
    }
}
</script>