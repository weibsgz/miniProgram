import Token from '../model/token'
import Http from '../utils/http'

import cache from '../enum/cache'

export default class User{
  static getUserInfoByLocal() {
    return wx.getStorageSync(cache.USER_INFO)
  }

  static async login() {
    //获取令牌
    const token =await Token.getToken()
    wx.setStorageSync(cache.TOKEN, token)
  }

  static async updateUserInfo(userInfo) {

    
    const res = await Http.request({
      method:'PUT',
      url:`v1/user`,
      data:{
        nickname:userInfo.nickName,
        avatar:userInfo.avatarUrl
      }
    })
    console.log('------ v1/user 登录后接口返回的信息',res)
    wx.setStorageSync(cache.USER_INFO,res)
  }
}