<template>
    <Card>
        <h1 v-if="error.statusCode === 404">页面不存在</h1>
        <h1 v-else>{{ error.message }}</h1>
        <Button @click="reload">刷新</Button>
    </Card>
</template>
 
<script>
export default {
    props: ["error"],
    methods: {
        reload () {
            this.$router.go(0)
        },
    }
}
</script>