<template>
    <div>
        {{ user.username }}
    </div>
    <!-- <List item-layout="vertical"> -->
         <!-- <ListItem v-for="item in data.result" :key="item.id"> -->
            <!-- <ListItemMeta :title="item.title" :description="item.desc" /> -->
            <!-- <div v-html="item.content"></div> -->
            <!-- <template slot="action"> -->
                <!-- <li> -->
                    <!-- <Icon type="ios-star-outline" /> {{ item.love }} -->
                <!-- </li> -->
                <!-- <li> -->
                    <!-- <Icon type="ios-thumbs-up-outline" /> {{ item.view }}  -->
                <!-- </li> -->
            <!-- </template> -->
        <!-- </ListItem> -->
    <!-- </List> -->
</template>

<script>

export default {
    computed: {
        user: function () {
            return this.$auth.user
        }
    }
};
</script>

<style scoped>
</style>
