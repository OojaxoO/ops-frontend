<template>
    <div id="terminal-container"></div>
</template>

<script>
import { Terminal } from 'xterm'
import { wsLog } from '@/api/kube/ws'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'

import 'xterm/dist/xterm.css'
import 'xterm/dist/addons/fullscreen/fullscreen.css'
export default {
  layout: 'blank',
  data () {
    return {
      t: {},
      websocket: {}
    }
  },
  name: 'podLog',
  methods: {

  },
  mounted () {
    Terminal.applyAddon(fullscreen)
    let t = new Terminal({
      cols: parseInt(document.documentElement.clientWidth / 9),
      rows: parseInt(document.documentElement.clientHeight / 17),
      cursorBlink: true // 光标闪烁
    }
    )
    t.open(document.getElementById('terminal-container'))
    this.websocket = new WebSocket(wsLog + this.$route.params.cluster + '/' + this.$route.params.namespace + '/' + this.$route.params.name + '/')
    this.websocket.onmessage = e => {
      t.write(e.data.replace(/[\r\n]/g, '\r\n'))
    }
    t.toggleFullScreen(true)
    window.onresize = () => {
      t.resize(parseInt(document.documentElement.clientWidth / 9), parseInt(document.documentElement.clientHeight / 17))
    }
  },
  beforeDestroy () {
    this.websocket.close()
  }
}
</script>

<style scoped>

</style>
