<template>
    <Menu ref="menu" width="auto" accordion theme="dark" @on-select="turnTo" :active-name="activeName">
        <Submenu accordion v-for="menu of menus" :name="menu.path" :key="menu.name">
            <template slot="title">
                <Icon :type="menu.icon" />
                <span>{{ menu.name }}</span>
            </template>
            <div v-if="menu.children && menu.children.length">
                <MenuItem v-for="item of menu.children" :name="item.path" :key="item.name">
                    <Icon :type="item.icon" />
                    {{ item.name }}
                </MenuItem>
            </div>
        </Submenu>
    </Menu>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
    name: 'sideMenu',
    computed: {
        ...mapGetters({
          menus: 'menu/get'
        }),
        activeName: function () {
            return this.$route.path
        },
    },
    data () {
        return {
        }
    },
    methods: {
        turnTo (name) {
            this.$router.push({
                path: name
            })
        },
    },
    watch: {
    },
}
</script>

<style scoped lang="less">

</style>