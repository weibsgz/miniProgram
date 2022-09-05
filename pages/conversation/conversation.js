import Tim from "../../model/tim"
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { timStore } from "../../store/tim";


// pages/conversation/conversation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetUserId:null,
    service:null,
    isSent:false  //是否有发送消息
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
   * data下就用fileds的字段this.data.xxx调用  方法就是actions的方法 
   */

    this.storeBindings = createStoreBindings(this, {
      store: timStore,
      fields: ['sdkReady'],
      // actions: ['getMessageList','setTargetUserId']
      actions:['pushMessage','getConversationList','resetMessage']
    })

    //这个weibsgz 是下载的腾讯小程序IM DEMO  在里边创建了一个用户weibsgz 输入我们当前这个项目的userId(微信授权登录后)
    //model/tim.js login方法
    // this.setTargetUserId('weibsgz')
    // this.getMessageList()
    console.log('.......options',options)
    this.setData({
      targetUserId: 'weibsgz',//写死了腾讯IM DEMO里注册的一个用户  实际用该 options.targetUserId
      service:options.service ? JSON.parse(options.service) : null
    })

  },

  handleLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  handleSendMessage: function (event) {
    console.log('event,,,',event)
    const { type, content } = event.detail
    const message = Tim.getInstance().createMessage(type, content, this.data.targetUserId)
    //发完消息后 消息上屏幕
    this.pushMessage(message)
    console.log('...发送的message',message)

    Tim.getInstance().sendMessage(message)
    this.data.isSent = true
    // this.getOpenerEventChannel().emit('sendMessage')
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
    this.resetMessage()
    if(!this.data.isSent) {
      this.getConversationList()
    }
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