import Emitter from './Emitter'

export default class {
  constructor (connectionUrl, opts = {}) {
    this.format = opts.format && opts.format.toLowerCase()
    connectionUrl = this.setUrl(connectionUrl)
    this.opts = opts
    this.reconnection = this.opts.reconnection || false
    this.reconnectionAttempts = this.opts.reconnectionAttempts || Infinity
    this.reconnectionDelay = this.opts.reconnectionDelay || 1000
    this.reconnectTimeoutId = 0
    this.reconnectionCount = 0

    this.connect(connectionUrl, opts)
    this.onEvent()

    this.emitter = new Emitter()
  }


  setUrl(connectionUrl) {
    if (!connectionUrl) {
      return ""
    }
    const match = connectionUrl.match(/^(https?):\/\/(.+)/);
    if (match) {
      const protocol = match[1]
      if (protocol === "http") {
        this.connectionUrl = `ws://${match[2]}`
      } else if (protocol === "https") {
        this.connectionUrl = `wss://${match[2]}`
      }
    } else if (connectionUrl.startsWith("ws") || connectionUrl.startsWith("wss")) {
      this.connectionUrl = connectionUrl
    } else {
      const url = new URL(window.location.href);
      const protocol = url.protocol;
      const domain = url.hostname;
      let port = url.port !== "" ? `:${url.port}` : "";
      if (protocol === "http:") {
        this.connectionUrl = `ws://${domain}${port}${connectionUrl}`
      }

      if (protocol === "https:") {
        this.connectionUrl = `wss://${domain}${port}${connectionUrl}`
      }

    }

    return this.connectionUrl
  }


  connect (connectionUrl, opts = {}) {
    let protocol = opts.protocol || ''
    this.WebSocket = opts.WebSocket || (protocol === '' ? new WebSocket(connectionUrl) : new WebSocket(connectionUrl, protocol))
    if (this.format === 'json') {
      if (!('sendObj' in this.WebSocket)) {
        this.WebSocket.sendObj = (obj) => this.WebSocket.send(JSON.stringify(obj))
      }
    }

    return this.WebSocket
  }

  reconnect () {
    if (this.reconnectionCount <= this.reconnectionAttempts) {
      this.reconnectionCount++
      clearTimeout(this.reconnectTimeoutId)

      this.reconnectTimeoutId = setTimeout(() => {
        console.log("reconnecting....", this.reconnectionCount)
        this.connect(this.connectionUrl, this.opts)
        this.onEvent()
      }, this.reconnectionDelay)
    }
  }

  onEvent () {
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach((eventType) => {
      this.WebSocket[eventType] = (event) => {
        this.emitter.emit(eventType, event)

        if (this.reconnection && eventType === 'onopen') {
          this.reconnectionCount = 0        // 重连次数清零
        }

        if (this.reconnection && eventType === 'onclose') { this.reconnect() }
      }
    })
  }


  close () {
    if(this.WebSocket) {
      this.reconnection = false
      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId)
      }
      this.WebSocket.close()
    }
  }
}
