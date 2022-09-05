import Token from "./model/token"
import { timStore } from "./store/tim";
import { createStoreBindings } from "mobx-miniprogram-bindings";
// app.js
App({
  async onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })

    const res = await Token.verifyToken()
      if(res.valid) {
        //如果令牌有效  需要登录TIM
        this.storeBindings = createStoreBindings(this, {
          store: timStore,     
          actions:['login']
        })
        // 登录TIM
        await this.login()
        this.storeBindings.destroyStoreBindings()

    }


  },
  globalData: {
    userInfo: null
  }
})
