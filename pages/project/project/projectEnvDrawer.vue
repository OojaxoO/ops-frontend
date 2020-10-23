<template>
    <Drawer
        :title="drawerTitle"
        v-model="drawerShow"
        width="720"
        :mask-closable="false"
        :styles="styles"
    >
        <Form ref="addForm" :label-width="80" label-position="right" :model="formData">
            <FormItem label="项目名">
                <Select v-model="formData.project_id">
                    <Option disabled :key="project.ID" :value="project.ID" :label="project.ch_name"/>
                </Select>
            </FormItem>
            <FormItem label="环境名">
                <Select v-model="formData.env_id">
                    <Option v-for="item of envs" :key="item.ID" :value="item.ID" :label="item.ch_name"/>
                </Select>
            </FormItem>
            <FormItem label="集群">
                <Select @on-change="getNamespaces" v-model="formData.cluster_id">
                    <Option v-for="item of clusters" :key="item.ID" :value="item.ID" :label="item.Name"/>
                </Select>
            </FormItem>
            <FormItem label="命名空间">
                <Select filterable v-model="formData.namespace">
                    <Option v-for="item of namespaces" :key="item" :value="item" :label="item"/>
                </Select>
            </FormItem>
            <FormItem label="管理员">
                <Select multiple filterable v-model="formData.admin">
                    <Option v-for="item of users" :key="item.ID" :value="item.ID" :label="item.username"/>
                </Select>
            </FormItem>
        </Form>
        <div class="demo-drawer-footer">
            <Button style="margin-right: 8px" @click="handleCancel">取消</Button>
            <Button type="primary" @click="handleCommit">提交</Button>
        </div>
    </Drawer>    
</template>

<script>
import { create, update } from "@/api/project/projectEnv"
import { url as env_url } from "@/api/project/env"
import { url as user_url } from "@/api/user/user"
import { cluster } from "@/api/kube/cluster"

export default {
    name: "projectEnvDrawer",
    data () {
        return {
            formData: {
                ID: null,
                project_id: null,
                cluster_id: null,
                env_id: null,
                namespace: "",
                admin: [],
            },
            project: {
                ID: -1,
                ch_name: ''
            },
            index: null,
            envs: [],
            clusters: [],
            namespaces: [],
            users: [],
            drawerShow: false,
            drawerTitle: "添加环境实例",
            styles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
        }
    },
    mounted () {
        this.init()
    },
    methods: {
        init () {
            this.getClusters()
            this.getEnvs()
            this.getUsers()
        },
        getEnvs () {
            this.$axios.$get(env_url).then(resp=>{
                this.envs = resp.data 
            })
        },
        getClusters () {
            this.$axios.$get(cluster.list).then(resp=>{
                this.clusters = resp.data 
            })
        },
        getNamespaces (value) {
            this.$axios.$get(`${cluster.list}/${value}/namespace`).then(resp=>{
                this.namespaces = resp.data.items.map(item => item.metadata.name) 
            })
        },
        getUsers () {
            this.$axios.$get(user_url).then(resp=>{
                this.users = resp.data 
            })
        },
        handleCancel () {
            this.drawerShow = false
            this.$refs.addForm.resetFields()
        },
        handleCommit () {
            let admin = this.users.filter(item=>this.formData.admin.includes(item.ID))
            this.$set(this.formData, 'admin', admin)
            if (this.formData.ID) {
                update(this).then(resp => {
                    // this.$set(this.data, this.index, resp.data.data)
                    this.$Message.info('更新成功')
                    this.drawerShow = false
                    this.$refs.addForm.resetFields()
                })
            } else {
                create(this).then(resp => {
                    this.drawerShow = false
                    this.$Message.info('添加成功')
                    this.$refs.addForm.resetFields()
                })
            }
        },
        handleEdit (row, index) {
            this.formData = {...row}
            this.index = index 
            this.drawerTitle = "集群环境更新"
            this.drawerShow = true
        },

    }
}
</script>
