export default class Emitter {
  constructor () {
    this.listeners = new Map()
  }

  addListener (label, callback, vm) {
    if (typeof callback === 'function') {
      this.listeners.has(label) || this.listeners.set(label, [])
      this.listeners.get(label).push({callback: callback, vm: vm})
      return true
    }
    return false
  }

  reset () {
    this.listeners.clear()
  }

  removeListener (label, callback, vm) {
    let listeners = this.listeners.get(label)
    let index = -1

    if (listeners && listeners.length) {
      for (let i = 0; i < listeners.length; i++) {
        if (typeof listeners[i].callback === 'function' && listeners[i].callback === callback && listeners[i].vm === vm) {
          index = i
          break
        }
      }
      if (index > -1) {
        listeners.splice(index, 1)
        this.listeners.set(label, listeners)
        return true
      }
    }
    return false
  }

  emit (label, ...args) {
    let listeners = this.listeners.get(label)

    if (listeners && listeners.length) {
      listeners.forEach((listener) => {
        listener.callback.call(listener.vm, ...args)
      })
      return true
    }
    return false
  }
}


