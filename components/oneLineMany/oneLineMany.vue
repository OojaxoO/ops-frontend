<template>
  <div>
    <span>{{ showText }}</span>
    <span v-if="omit">
      <span>
        <Tooltip placement="right-end" transfer>
          <!-- <Button size="small"> ...</Button> -->
          <span>...</span>
          <div slot="content">
            <p v-for="item in showContent"> {{ item.join("、")}} </p>
          </div>
        </Tooltip>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    rowData: Array,
    lineShowNum: Number,
  },
  data () {
    return {
    }
  },
  created () {},
  computed: {
    omit: function () {
      return this.rowData.length > this.lineShowNum 
    },
    showText: function () {
      return this.omit ? this.rowData.slice(0, this.lineShowNum).join('、') : this.rowData.join('、')
    },
    showContent: function () {
      return this.sliceArray(this.rowData, this.lineShowNum) 
    }
  },
  methods: {
    sliceArray(array, size) {
      let result = [];
      for (let x = 0; x < Math.ceil(array.length / size); x++) {
        let start = x * size;
        let end = start + size;
        result.push(array.slice(start, end));
      }
      return result;
    }
  }
}
</script>