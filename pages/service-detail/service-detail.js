// pages/service-detail/service-detail.js
import Service from '../../model/service'
import User from '../../model/user'
import Rating from '../../model/rating'
import serviceType from '../../enum/service-type'
import serviceStatus from '../../enum/service-status'
import { getEventParam } from "../../utils/util";
import serviceAction from "../../enum/service-action";
import cache from "../../enum/cache";

const rating = new Rating()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceId:0,
    service:null,
    isPublisher:false, //登陆用户是否是本篇文章发布者
    ratingList:[],
    serviceTypeEnum:serviceType,
    serviceStatusEnum:serviceStatus,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options)
    this.data.serviceId = options.service_id;
    await this._getService(this.data.serviceId)
    await this._getServiceRatingList()
    this._checkRole()

    this.setData({
      loading:false
    })
  },

  async _getService(id) {
    const service =  await Service.getServiceById(id);
    this.setData({
      service
    })
  },

  async _getServiceRatingList() {
    //如果是正在找不需要渲染
    if(this.data.service.type === serviceType.SEEK) return

    const ratingList = await rating.reset().getServiceRatingList(this.data.serviceId)

    console.log('ratingList',ratingList)
    this.setData({
      ratingList
    })
  },


  _checkRole() {
    //获取本次登陆的用户
    let userInfo = User.getUserInfoByLocal()
  
    //如果本次登陆的用户就是本篇文章的发布者
    if(userInfo && userInfo.id === this.data.service.publisher.id) {
      this.setData({
        isPublisher:true
      })
    }
  },
  handleUpdateStatus: async function (event) {
    console.log('handleUpdateStatus',event)
    //获取组件传过来的action 
    const action = getEventParam(event, 'action')
    // 不同的提示语
    const content = this._generateModalContent(action)
    const res = await wx.showModal({
        title: '注意',
        content,
        showCancel: true
    })
    if (!res.confirm) {
        return
    }
    await Service.updateServiceStatus(this.data.serviceId, action)
    await this._getService()
  },

  handleEditService: function () {
    console.log('handleEditService')
    const service = JSON.stringify(this.data.service)
    wx.navigateTo({
        url: `/pages/service-edit/service-edit?service=${service}`
    })
  },

  handleChat: function () {
    console.log('handleChat')
      const targetUserId = this.data.service.publisher.id
      const service = JSON.stringify(this.data.service)
      wx.navigateTo({
          url: `/pages/conversation/conversation?targetUserId=${targetUserId}&service=${service}`
      })
  },

  handleOrder: function () {
    console.log('handleOrder')
    //如果未登录
    if (!wx.getStorageSync(cache.TOKEN)) {
        wx.navigateTo({
            url: '/pages/login/login',
            //让login页面告诉本页面是否登录了 login页面通过 getOpenerEventChannel 来派发事件
            events: {
                // 箭头函数保持this
                login: () => {
                  // 监听login页面成功登录后，会进这里，判断下登录用户是不是发布人，需要重置按钮的状态
                    this._checkRole()
                }
            }
        })
        return
    }
    const service = JSON.stringify(this.data.service)
    wx.navigateTo({
        url: `/pages/order/order?service=${service}`
    })
  },

  _generateModalContent(action) {
    let content

    switch (action) {
        case serviceAction.PAUSE:
            content = '暂停后服务状态变为“待发布”，' +
                '可在个人中心操作重新发布上线，' +
                '是否确认暂停发布该服务？'
            break;
        case serviceAction.PUBLISH:
            content = '发布后即可在广场页面中被浏览到，是否确认发布？'
            break;
        case serviceAction.CANCEL:
            content = '取消后不可恢复，需要重新发布并提交审核；' +
                '已关联该服务的订单且订单状态正在进行中的，仍需正常履约；' +
                '是否确认取消该服务？'
            break;
    }

    return content
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom:async function () {
    if(!rating.hasMoreData) {
      return 
    }

    const res = await rating.getServiceRatingList(this.data.serviceId);
    this.setData({
      ratingList
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})