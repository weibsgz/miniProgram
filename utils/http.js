import APIconfig from '../config/api'
import errorMessage from '../config/error-message'
import { wxToPromise } from "./wx";
import User from "../model/user";
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { timStore } from "../store/tim";

class Http {
  //静态方法 不需要实例化 直接 Http.request()调用
  // 静态方法的this指向这个类而不是实例
  //父类的静态方法可以被子类继承
  //refetch 是否要重新发起请求
  static async request({url,data,method='GET',refetch=true}) {
    let res
    try {
      res = await wxToPromise('request',{
        url: APIconfig.base + url,
        header:{
          token:wx.getStorageSync('token')
        },
        method,
        data,
      })
    }catch(e) {
      Http._showError(-1)
      throw new Error(e.errMsg)
    }
   
    //请求成功
    if(res.statusCode < 400) {
      return res.data.data
    }

    //请求失败
    if(res.statusCode == 401) {
      //令牌相关操作

      this.storeBindings = createStoreBindings(this, {
        store: timStore,
        fields: ['sdkReady'],
        actions: { timLogout: 'logout' },
    })

      if (res.data.error_code === 10001) {
        if (this.sdkReady) {
            this.timLogout()
        }
        wx.navigateTo({
            url: '/pages/login/login'
        })
        throw Error('请求未携带令牌')
      }
      //其他情况，比如令牌无效,重新请求获取TOKEN，再一次请求接口
      if(refetch)   return await Http._refetch({url,data,method,refetch})
      if (this.sdkReady) {
        this.timLogout()
      }
       
    }
    Http._showError(res.data.error_code , res.data.message)

    const error = Http._generateMessage(res.data.message)

    throw new Error(error)
   
  }

  static async _refetch(data) {
    await User.login()
    data.refetch = false
    return await Http.request(data)
  }

  static _showError(errCode,message) {
    console.log('errCode',errCode)
    let title = ''
    const errorMsg = errorMessage[errCode]
    title = errorMsg || message || '未知异常'

    title = Http._generateMessage(title)


    wx.showToast({
      title,
      icon:'none',
      duration:3000
    })
  }

  static _generateMessage(message) {
    return typeof message === 'object' ? Object.values(message).join(";") : message
  }
}

export default Http