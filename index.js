import uniWebviewLib from 'uni-webview-lib'

const _publicMethod = Symbol('publicMethod')
const _privateMethod = Symbol('privateMethod')
const _methodId = Symbol('methodId')
const _map = Symbol('map')
const _webview = Symbol('webview')

class MessageData {
  constructor (id, action, payload) {
    this.id = id
    this.action = action
    this.payload = payload
  }
}

const bridgeMethodArr = ['scanCode', 'router', 'share', 'getCurrentPosition', 'checkPermission', 'authorize', 'getUserInfo', 'requestApi']

class IjntvJsBridge {
  constructor () {
    const _this = this
    this[_methodId] = 0
    this[_map] = new Map()
    this[_webview] = uniWebviewLib.webView

    function messageToNvue (id, action, payload) {
      const realAction = id ? action : ('_' + action)
      const messageData = new MessageData(id, realAction, payload)
      this[_webview].postMessage({data: messageData})
    }

    this[_publicMethod] = async function (action, payload) {
      if (bridgeMethodArr.indexOf(action) === -1) {
        return Promise.reject({err: 'not support'})
      }
      const id = ++this[_methodId]
      messageToNvue(id, action, payload)
      return new Promise(resolve => {
        _this[_map].set(id, resolve)
      })
    }

    this[_privateMethod] = async function (action, payload) {
      switch (action) {
        case 'back':
          console.log('back 1', this[_webview])
          console.log('back 2', window.history.length)
          console.log('back 3', this[_webview].canBack)
          this[_webview].navigateBack({})
          break
        case 'register':
          messageToNvue(undefined, action, payload)
          break
        case 'destroy':
          const resolveArr =  this[_map].values()
          resolveArr.forEach(resolve => resolve({err: 'destroy'}))
          this[_map].clear()
          break
      }

    }
    this[_privateMethod]('register')
  }

  async scanCode (args) {
    return this[_publicMethod]('scanCode', args)
  }

  async router (args) {
    return this[_publicMethod]('router', args)
  }

  async share (args) {
    return this[_publicMethod]('share', args)
  }

  async getCurrentPosition (args) {
    return this[_publicMethod]('getCurrentPosition', args)
  }

  async checkPermission (args) {
    return this[_publicMethod]('checkPermission', args)
  }

  async authorize (args) {
    return this[_publicMethod]('authorize', args)
  }

  async getUserInfo (args) {
    return this[_publicMethod]('getUserInfo', args)
  }

  async requestApi (args) {
    return this[_publicMethod]('requestApi', args)
  }

  queryCbById (id) {
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
