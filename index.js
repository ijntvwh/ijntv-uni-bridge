import uniWebviewLib from 'uni-webview-lib'

const _method = Symbol('method')
const _methodId = Symbol('methodId')
const _map = Symbol('map')

class IjntvJsBridge {
  constructor() {
    const _this = this
    this[_methodId] = 0
    this[_map] = new Map()
    this[_method] = async function (action, payload) {
      const id = ++this[_methodId]
      _this.log({log: {id, action, payload}})
      uniWebviewLib.webView.postMessage({data: {id, action, payload}})
      return new Promise(resolve => {
        _this[_map].set(id, resolve)
      })
    }
  }

  async scanCode(args) {
    return this[_method]('scanCode', args)
  }

  async router(args) {
    return this[_method]('router', args)
  }

  async share(args) {
    return this[_method]('share', args)
  }

  async getCurrentPosition(args) {
    return this[_method]('getCurrentPosition', args)
  }

  async checkPermission(args) {
    return this[_method]('checkPermission', args)
  }

  async authorize(args) {
    return this[_method]('authorize', args)
  }

  async getUserInfo(args) {
    return this[_method]('getUserInfo', args)
  }

  async requestApi(args) {
    return this[_method]('requestApi', args)
  }

  log(data) {
    uniWebviewLib.webView.postMessage({data})
  }

  queryCbById(id) {
    const cbMap = this[_map]
    if (id && cbMap.has(id)) {
      const cb = cbMap.get(id)
      cbMap.delete(id)
      return cb
    }
  }
}

const bridge = new IjntvJsBridge()
window.ijntvCb = function (res) {
  const id = res.id
  const callback = bridge.queryCbById(id)
  callback && callback(res.data)
}
export default bridge
