
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { timStore } from "../../store/tim";

import User from '../../model/user'



Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  handleLogin: async function () {
    const res = await wx.getUserProfile({
        desc: "完善用户信息"
    })
    // 异常，会中断后续代码的执行
    // 错误，不会中断后续代码的执行
    console.log('getUserProfile',res.userInfo) //输出微信登录的头像 昵称 等信息
    wx.showLoading({
        title: '正在授权',
        mask: true
    })
    try {
        await User.login()
        await User.updateUserInfo(res.userInfo)
        //调取MBOX的login方法 登录到TIM
        this.timLogin()
        //getOpenerEventChannel  https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html
        //
        const events = this.getOpenerEventChannel()
        //监听service-detail 传递过来的 events的login，派发回去  这样service-detail可以执行login的回调函数
        events.emit('login')

        wx.navigateBack()
    } catch (e) {
        wx.showModal({
            title: '注意',
            content: '登陆失败，请稍后重试',
            showCancel: false
        })
        console.log('登录失败',e)
    }
    wx.hideLoading()
},

handleToHome() {
   wx.switchTab({
     url: '/pages/home/home',
   })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

       /**  mbox调用
   * this 当前页面的this
   * store 
   * fields //使用store 中哪个state
   * actiion  //store中用哪个action
   * 
   * 配置好后 createStoreBindings 就可以把我们在store中配置的状态绑定到我们当前page对象下
   */

  this.storeBindings = createStoreBindings(this, {
    store: timStore,
    fields: ['sdkReady'],
    actions: {timLogin : 'login'}
  })
  //当前页面的this直接可以调用store的方法了
  // this.data.sdkReady 也会有值  页面中可以使用{{sdkReady}}


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.storeBindings.destroyStoreBindings()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})