import { storeBindingsBehavior } from "mobx-miniprogram-bindings";
import { timStore } from "../../../../store/tim";
import { getEventParam } from "../../../../utils/util";
import TIM from 'tim-wx-sdk'
import Tim from "../../../../model/tim";
import cache from "../../../../enum/cache";


Component({
  /**
   * 组件的属性列表
   */
  behaviors:[storeBindingsBehavior],
  storeBindings:{
    store:timStore,
    fields:['messageList','intoView','isCompleted'],
    actions:['getMessageList','setTargetUserId','scrollMessageList','pushMessage']
  },
  data: {
    text: '',
    scrollHeight: 0
},
  properties: {
    targetUserId: String,
    service: Object
  },
  lifetimes:{
    async attached() {
      this._setNavigationBarTitle()
      this._setScrollHeight()
      this.setTargetUserId(this.data.targetUserId)
      //设置未读消息
      const currentConversation = await Tim.getInstance().getConversationProfile(this.data.targetUserId)
      const unreadCount = wx.getStorageSync(cache.UNREAD_COUNT)
      const newUnreadCount = unreadCount - currentConversation.unreadCount
      wx.setStorageSync(cache.UNREAD_COUNT, newUnreadCount)

      
      await this.getMessageList()


      //点击某项商品，直接在会话框里显示该项商务的服务
      if (this.data.service) {
          const message = Tim.getInstance().createMessage(TIM.TYPES.MSG_CUSTOM
              , this.data.service, this.data.targetUserId, 'link')
          this.pushMessage(message)
      }

    }
  },

  /**
   * 组件的初始数据
   */
 
  /**
   * 组件的方法列表
   */
  methods: {

    async _setNavigationBarTitle() {
      const res = await Tim.getInstance().getUserProfile(this.data.targetUserId)


      console.log('getUserProfile',res)
      wx.setNavigationBarTitle({ title: res[0].nick || '慕慕到家' })
    },

    async _setScrollHeight() {
      const systemInfo = await wx.getSystemInfo()
      console.log('systemInfo',systemInfo)
      //获取可视区域的高度
      const scrollHeight = systemInfo.windowHeight - (systemInfo.screenHeight - systemInfo.safeArea.bottom) - 95
      this.setData({
          scrollHeight
      })
    },

    handleSendLink(event) {
      const service = getEventParam(event,'service')
      this.triggerEvent('sendmessage',{
        type:TIM.TYPES.MSG_CUSTOM,
        content:service
      })
    },

    handleSelect(event) {
      const service = getEventParam(event,'service')
      wx.navigateTo({
        url:`/pages/service-detail/service-detail?service_id=${service.id}`
      })
    },


    async handleSendImage() {
      //chooseMedia这里有坑  调用TIM的 createImageMessage 发送失败 还是用chooseImage或者像下面一样处理下格式
      const chooseImage = await wx.chooseMedia({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['alum', 'camera']
      })
    // 格式处理 把 chooseMedia返回的格式处理成和 chooseImage一样才能发送
    //如果今后TIM的createImageMessage支持chooseMedia了 就不用这么搞了 
      const content = {
        tempFilePaths:[],
        tempFiles: []
      }
      chooseImage.tempFiles.map(item=>{
          content.tempFilePaths.push(item.tempFilePath)
          content.tempFiles.push({
                  path: item.tempFilePath,
                  size: item.size
          })
      })
      this.triggerEvent('sendmessage', {
        type: TIM.TYPES.MSG_IMAGE,
        content: content
      })
    },

    handleInput(event){
      const text = getEventParam(event,'value')
      this.data.text = text;
    },

    handleSend() {
      const text = this.data.text.trim()
      if(!text) return 
      this.triggerEvent('sendmessage', {
        type: TIM.TYPES.MSG_TEXT,
        content: text
      })

      this.setData({
        text:''
      })
    },
    //触顶 加载历史消息
    handleScrolltoupper: async function () {
      if (this.data.isCompleted) {
          return
      }
      wx.showLoading({ title: '正在加载...', mask: true })
      await this.scrollMessageList()
      setTimeout(() => wx.hideLoading(), 1000)
  },
  }
})
