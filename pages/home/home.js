// pages/home/home.js
import Service from '../../model/service'
import Category from '../../model/category'
import { throttle } from '../../utils/util'
import Tim from '../../model/tim'
import cache from "../../enum/cache";
import { setTabBarBadge } from "../../utils/wx";
const service = new Service()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs:['全部服务','在提供','正在找'],  
    categoryList:[],
    serviceList:[],
    tabIndex:0,
    categoryId:0,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    // Tim.getInstance()

    // wx.login({
    //   success:function(res) {
    //     console.log('login info',res)
    //   }
    // })

    //获取分类TAB
    await this._getCategoryList()

    //获取内容列表
    await this._getServiceList()

    this.setData({
      loading:false
    })
  },

  async  _getCategoryList() {
    const res = await Category.getCategoryListWithAll()
    this.setData({
      categoryList:res
    })
  },

  async _getServiceList() {
    const serviceList = await service.reset().getServiceList(this.data.categoryId,this.data.tabIndex)
    
    this.setData({
      serviceList:serviceList
    })
    console.log('serviceList',serviceList)
  },

  handleTabChange(e) { 
    this.data.tabIndex = e.detail.index
    this._getServiceList()
  },

  handleCategoryChange:throttle(
    function(e) {  
      if(e.currentTarget.dataset.id === this.data.categoryId) return //防止重复点击

      this.data.categoryId = e.currentTarget.dataset.id
      this._getServiceList()
    },500),

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh () {
    console.log('下拉刷新，需要在JSON中配置enablePullDownRefresh,默认加载中的样式是白色的，需要在app.json中修改backgroundTextStyle')
   
    this._getServiceList()
    wx.stopPullDownRefresh()
  },

/**
 * 页面上拉触底事件的处理函数
 */
async onReachBottom() {
  console.log('上啦触底加载更多')

  if (!service.hasMoreData) {
    return
  }

  const serviceList = await service.getServiceList(this.data.categoryId,this.data.tabIndex)
  this.setData({
    serviceList
  })
},

handleSelectService(e) {
  const service = e.currentTarget.dataset.service;
  console.log('service',service)
  wx.navigateTo({
    url: '/pages/service-detail/service-detail?service_id=' + service.id
  })
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
    const unreadCount = wx.getStorageSync(cache.UNREAD_COUNT)
    setTabBarBadge(unreadCount)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})