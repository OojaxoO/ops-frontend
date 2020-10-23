<template>
    <div id="terminal-container"></div>
</template>

<script>
import { Terminal } from 'xterm'
import { wsExec } from '@/api/kube/ws'
import * as attach from 'xterm/lib/addons/attach/attach'

import 'xterm/dist/xterm.css'
export default {
  layout: 'blank',
  data () {
    return {
      t: {},
      websocket: {}
    }
  },
  name: 'terminal',
  methods: {

  },
  mounted () {
    Terminal.applyAddon(attach)
    let t = new Terminal({
      cols: parseInt(document.documentElement.clientWidth / 9),
      rows: parseInt(document.documentElement.clientHeight / 17),
      cursorBlink: true // 光标闪烁
    }
    )
    t.open(document.getElementById('terminal-container'))
    this.websocket = new WebSocket(wsExec + this.$route.params.cluster + '/' + this.$route.params.namespace + '/' + this.$route.params.name + '/')
    t.attach(this.websocket, true, true)
    this.websocket.onopen = () => {
      this.websocket.send(JSON.stringify({ cols: t.cols, rows: t.rows }))
    }
    window.onresize = () => {
      t.resize(parseInt(document.documentElement.clientWidth / 9), parseInt(document.documentElement.clientHeight / 17))
    }
    t.on('resize', () => {
      this.websocket.send(JSON.stringify({ cols: t.cols, rows: t.rows }))
    })
  },
  beforeDestroy () {
    this.websocket.close()
  }
}
</script>

<style scoped>

</style>
