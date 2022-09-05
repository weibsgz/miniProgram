import { action, observable } from 'mobx-miniprogram'
import Tim from "../model/tim";
import TIM from "tim-wx-sdk"
import User from "../model/user";
import {setTabBarBadge} from '../utils/wx'

export const timStore = observable({
  //state
  sdkReady:false,
  messageList:[],
  //目标聊天用户ID
  _targetUserId: null,
  //action
  // conversation-window  滚动到哪个对话
  intoView:0,
  isCompleted : false,
  conversationList:[],

  login: action(function () {
    this._runListener()
    Tim.getInstance().login()
  }),

  logout:action(function(){
    Tim.getInstance().logout()
  }),

  //设置目标聊天用户ID
  setTargetUserId: action(function (targetUserId) {
    this._targetUserId = targetUserId
  }),

  //拉取消息列表
  getMessageList: action(async function () {
    if (!this._targetUserId) {
        throw Error('未指定目标用户 id')
    }

    this.messageList = await Tim.getInstance().reset().getMessageList(this._targetUserId)
    this.intoView = this.messageList.length - 1
    await Tim.getInstance().setMessageRead(this._targetUserId)

  }),

  resetMessage: action(function () {
    this.messageList = []
    this._targetUserId = null
    this.intoView = 0
    this.isCompleted = false
}),

  //消息上屏
  pushMessage:action(function(message){
    this.messageList = this.messageList.concat([message])
    this.intoView = this.messageList.length - 1
  }),
  //滚动触顶 加载历史消息
  scrollMessageList: action(async function () {
    const messageList = await Tim.getInstance()
        .getMessageList(this._targetUserId);  
    /**
     * tips
     * 1. MobX 中属性的值是 Array 的时候，他是一个被包装过的 Array，并非原生 Array，它是一个响应式对象
     * 2. 经过包装的 Array 同样具备大多数原生 Array 所具备的方法。
     * 3. 想把响应式的对象数组变成普通数组，可以调用slice()函数遍历所有对象元素生成一个新的普通数组
     */
    this.messageList = messageList.concat(this.messageList.slice())
    this.intoView = messageList.length -2 
    //滚动到头了 标记完成  然后handleScrolltoupper 可以中断执行
    this.isCompleted = Tim.getInstance().isCompleted
    // this.intoView = this.messageList.length === Tim.getInstance().messageList.length ?
    // messageList.length : messageList.length - 1
}),

  //消息模块，获取所有会话列表
  getConversationList:action(async function() {
      this.conversationList =  await Tim.getInstance().getConversationList()
  }),

  _runListener() {
    const sdk = Tim.getInstance().getSDK()
    //第三个参数this  绑定SDK的上下文 
    sdk.on(TIM.EVENT.SDK_READY, this._handleSDKReady, this)
    sdk.on(TIM.EVENT.SDK_NOT_READY, this._handleSDKNotReady, this)
    sdk.on(TIM.EVENT.KICKED_OUT, this._handleSDKNotReady, this)
    sdk.on(TIM.EVENT.MESSAGE_RECEIVED, this._handleMessageReceived, this)
    sdk.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, this._handleConversationListUpdate, this)
  },

  _handleSDKReady() {
    //绑定了this 这里的this才是SDK的上下文
    this.sdkReady = true
    const userInfo = User.getUserInfoByLocal()
    //登录后 需要更新
    Tim.getInstance().updateUserProfile(userInfo)
    
  },
  _handleSDKNotReady() {
    this.sdkReady = false
    
  },

 




  //查找当前聊天人的消息，并设置已读消息
  async _handleMessageReceived(event) {
    console.log(event.data)
    if (!this._targetUserId) {
      return
    }
    
    //获取当前聊天对象的聊天信息
    const currentConversationMessage = event.data
            .filter(item => item.from === this._targetUserId) 


    if (currentConversationMessage.length) {
      this.messageList = this.messageList.concat(currentConversationMessage);
      this.intoView = this.messageList.length - 1
      //设置消息已读
      await Tim.getInstance().setMessageRead(this._targetUserId)
    }

  },


  _handleConversationListUpdate(event) {
    if(!event.data.length) return 

    this.conversationList = event.data

    //获取消息列表总的未读消息数量
    const unreadCount = event.data.reduce((prev,cur)=>{
      return prev + cur.unreadCount
    },0)
    setTabBarBadge(unreadCount)

  }

})

