import uniWebviewLib from 'uni-webview-lib'

const _publicMethod = Symbol('publicMethod')
const _privateMethod = Symbol('privateMethod')
const _methodId = Symbol('methodId')
const _map = Symbol('map')
const _webview = Symbol('webview')
const _register = Symbol('register')

class MessageData {
  constructor(id, action, payload) {
    this.id = id
    this.action = action
    this.payload = payload
  }
}

const bridgeMethodArr = ['scanCode', 'router', 'share', 'getCurrentPosition', 'checkPermission', 'authorize', 'getUserInfo', 'requestApi']
const permissionArr = ['camera', 'location']

class IjntvJsBridge {
  constructor() {
    const _this = this
    this[_methodId] = 0
    this[_map] = new Map()
    this[_webview] = uniWebviewLib.webView
    this[_register] = false

    function messageToNvue(postMessage, id, action, payload) {
      const realAction = id ? action : ('_' + action)
      const messageData = new MessageData(id, realAction, payload)
      postMessage({data: messageData})
    }

    this[_privateMethod] = function (action, payload) {
      switch (action) {
        case 'share':
          const shareHandler = this[_map].get('share')
          typeof shareHandler === 'function' && shareHandler()
          break
        case 'log':
          messageToNvue(this[_webview].postMessage, undefined, action, payload)
          break
        case 'register':
          this[_register] = true
          break
        case 'destroy':
          const resolveArr = this[_map].values()
          resolveArr.forEach(resolve => resolve({err: 'destroy'}))
          this[_map].clear()
          break
      }
    }

    this[_publicMethod] = async function (action, payload) {
      this[_privateMethod]('log', Object.assign({}, payload, {action}))
      if (!this[_register]) return Promise.resolve({err: 'not register yet!'})
      if (bridgeMethodArr.indexOf(action) === -1) return Promise.reject({err: 'not support'})
      const id = ++this[_methodId]
      messageToNvue(this[_webview].postMessage, id, action, payload)
      return new Promise(resolve => {
        _this[_map].set(id, resolve)
      })
    }
  }

  init() {
    this[_privateMethod]('register')
  }

  async scanCode() {
    return this[_publicMethod]('scanCode')
  }

  async router(args) {
    return this[_publicMethod]('router', args)
  }

  async share(args) {
    return this[_publicMethod]('share', args)
  }

  async getCurrentPosition(args) {
    return this[_publicMethod]('getCurrentPosition', args)
  }

  async checkPermission(args) {
    if (permissionArr.indexOf(args && args.permission) === -1) return Promise.reject({err: 'not support'})
    return this[_publicMethod]('checkPermission', args)
  }

  async authorize() {
    return this[_publicMethod]('authorize')
  }

  async getUserInfo() {
    return this[_publicMethod]('getUserInfo')
  }

  async requestApi(api, args) {
    if (api === 'navigatorConfig' && args.right && typeof args.right.handle === 'function') {
      this[_map].set('share', args.right.handle)
      delete args.right.handle
    }
    return this[_publicMethod]('requestApi', Object.assign({}, args, {api}))
  }

  queryCbById(id) {
    const cbMap = this[_map]
    if (typeof id === 'string') {
      this[_privateMethod](id)
    } else if (Number.isInteger(id) && cbMap.has(id)) {
      const cb = cbMap.get(id)
      cbMap.delete(id)
      return cb
    }
  }
}

const bridge = new IjntvJsBridge()
window.ijntvCb = function (res) {
  const callback = bridge.queryCbById(res.id)
  callback && callback(res.data)
}
export default bridge
