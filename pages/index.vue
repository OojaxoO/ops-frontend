<template>
    <div>
        <Row :gutter="20" class="margin-top-10">
          <Col span="6" v-for="(infor, i) in inforCardData"
            :key="`infor-${i}`"
            style="height: 120px;padding-bottom: 10px;">
            <infor-card :color="infor.color" :icon="infor.icon" :icon-size="36" :shadow="cardShaDow">
                <count-to :decimals="infor.decimals" :end="infor.count" count-class="count-style"/>
                <p>{{ infor.title }}</p>
            </infor-card>
          </Col>
    </Row>
    </div>
</template>

<script>
import CountTo from '~/components/count-to'
import InforCard from '~/components/infoCard/infoCard'
import { info } from '~/api/asset/asset'

export default {
  components: {
      CountTo,
      InforCard, 
  },
  data () {
    return {
      cardShaDow: false,
      data: {
        host_count: 0,
        cluster_count: 1,
        project_count: 1,
        service_count: 10,
      },
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    inforCardData: function () {
      return [
        { title: '主机', icon: 'md-apps', count: this.data.host_count, color: '#19be6b', decimals: 0 },
        { title: '集群', icon: 'md-book', count: this.data.cluster_count, color: '#ff9900', decimals: 0 },
        { title: '项目', icon: 'md-sync', count: this.data.project_count, color: '#ed3f14', decimals: 0 },
        { title: '服务', icon: 'md-swap', count: this.data.service_count, color: '#E46CBB', decimals: 0 },
      ]
    }
  },
  methods: {
    init () {
      info(this).then(resp=> {
        this.data = resp.data.data
      })
    },
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
.links {
  padding-top: 15px;
}
</style>
