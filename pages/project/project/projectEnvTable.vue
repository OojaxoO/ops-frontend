<template>
    <Table tooltip-theme="light" :loading="loading" :columns="columns" :data="data"/>
</template>

<script>
import { list, _delete } from "@/api/project/projectEnv"

export default {
    name: 'projectEnvTable',
    props: {
        project_id: Number,
    },
    computed: {
        isAdmin: function () {
            return this.$auth.user.is_superadmin
        }
    },
    data () {
        return {
            loading: false,
            data: [],
            columns: [{
                title: '环境',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.env.ch_name)
                }
            },{
                title: '集群',
                align: 'center',
                render: (h, params) => {
                    return h('span', params.row.cluster.Name)
                }
            },{
                title: '命名空间',
                key: 'namespace',
                align: 'center',
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
            this.getProjectEnv()
        },
        getProjectEnv () {
            list(this).then(resp=>{
                this.data = resp.data.data
            })
        },
        handleEdit (row, index) {
            this.$emit('handleEnvEdit', row)
        },
    }
}
</script>