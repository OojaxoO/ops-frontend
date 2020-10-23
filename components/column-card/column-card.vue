<template>
    <Tooltip transfer>
        <div class="ellip" :style="{width: this.width + 'px'}">{{ content }}</div>
        <span style="white-space: normal; word-break:break-all; word-wrap: break-word" slot="content">
            {{content}}
        </span>
    </Tooltip>
</template>

<script>
export default {
    props: {
        content: String,
        width: {
            type: Number,
            default: 120
        }
    },
}
</script>

<style scoped>
    .ellip {
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap; 
    } 
</style>