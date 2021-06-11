## Install
import bridge from 'ijntv-uni-bridge'

## Example
const args = ...
bridge.router(args).then(cb => {  
  const { err, result } = cb
  if (err) {
    ...
  } else if (result) {
    ...
  }
})

## Method finished
+ scanCode
+ router
+ authorize

## Method todo
+ share
+ getCurrentPosition
+ checkPermission
+ getUserInfo
+ requestApi

