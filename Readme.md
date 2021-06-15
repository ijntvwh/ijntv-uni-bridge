## Install
main.js
```javascript
import bridge from 'ijntv-uni-bridge'
bridge.init()
```

## Example
```javascript
const args = ...
bridge.router(args).then(cb => { 
  const { err, result } = cb
      if (err) {
        
      } else if (result) {
      
      }
})
```

## Method finished
+ scanCode
+ router
+ authorize
+ share
+ getCurrentPosition
+ checkPermission
+ getUserInfo
+ requestApi

