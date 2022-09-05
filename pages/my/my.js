import cache from "../../enum/cache";
import Token from "../../model/token";
import User from "../../model/user";
import { setTabBarBadge } from "../../utils/wx";
import { appointWithMeGrid, myAppointGrid, myProvideGird, mySeekGrid } from "../../config/grid";
import Order from "../../model/order";
import roleType from "../../enum/role-type";
import Service from "../../model/service";
import serviceType from "../../enum/service-type";
import { getEventParam } from "../../utils/util";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
        nickname: '点击授权登陆',
        avatar: ''
    },
    // 宫格配置
    // 预约我的宫格
    appointWithMeGrid: appointWithMeGrid,
    // 我的预约宫格
    myAppointGrid: myAppointGrid,
    // 我在提供宫格
    myProvideGird: myProvideGird,
    // 正在找宫格
    mySeekGrid: mySeekGrid,

    appointWithMeStatus: null,
    myAppointStatus: null,
    provideServiceStatus: null,
    seekServiceStatus: null
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    const unreadCount = wx.getStorageSync(cache.UNREAD_COUNT)
    setTabBarBadge(unreadCount)

    const verifyToken = await Token.verifyToken()
    if(verifyToken.valid) {
      const userInfo = User.getUserInfoByLocal();
      this.setData({
        userInfo
      })
      this._getOrderStatus()
      this._getServiceStatus()

    }
    

  },

  handleToLogin() {
    wx.navigateTo({
        url: '/pages/login/login'
    })
},

  //预约我的 和 我预约的 订单状态 返回badge数
  async _getOrderStatus() {
    const appointWithMeStatus = Order.getOrderStatus(roleType.PUBLISHER); 
    const myAppointStatus = Order.getOrderStatus(roleType.CONSUMER);

    this.setData({
        appointWithMeStatus: await appointWithMeStatus,
        myAppointStatus: await myAppointStatus
    })
  },

  //我在提供 和 正在找 订单状态 返回badge数
  async _getServiceStatus() {
    const provideServiceStatus = Service.getServiceStatus(serviceType.PROVIDE);
    const seekServiceStatus = Service.getServiceStatus(serviceType.SEEK);
    this.setData({
        provideServiceStatus: await provideServiceStatus,
        seekServiceStatus: await seekServiceStatus
    })
  },

  handleNavToOrder(event) {
    const cell = getEventParam(event, 'cell')
    console.log('cell',cell)
    //  退款页面没有status
    if (!('status' in cell)) {
        wx.navigateTo({
            url: `/pages/refund-list/refund-list?role=${cell.role}`
        })
        return
    }

    wx.navigateTo({
        url: `/pages/my-order/my-order?role=${cell.role}&status=${cell.status}`
    })
  },

  handleNavToMyService(event) {
    const { type, status } = getEventParam(event, 'cell')
    wx.navigateTo({
        url: `/pages/my-service/my-service?type=${type}&status=${status}`
    })
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})