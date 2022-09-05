import TIM from 'tim-wx-sdk';
import TIMUploadPlugin from 'tim-upload-plugin';
import timConfig from "../config/tim";
import User from './user';
import genTestUserSig from '../lib/tim/generate-test-usersig';

class Tim {
   //TIM的单例实例
   static instance = null

     _SDKInstance = null

  // 用于分页续拉的消息 ID 初始为空 续拉时填入上次调用 getMessageList 接口返回的该字段的值
  _nextReqMessageID = ''
 
  _messageList = []

  constructor() {
    let options = {
      SDKAppID: 1400723308 // 接入时需要将 0 替换为您的云通信应用的 SDKAppID，类型为 Number
    };
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let tim = TIM.create(timConfig.options); // SDK 实例通常用 tim 表示

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    tim.setLogLevel(timConfig.logLevel); // 普通级别，日志量较多，接入时建议使用
    // tim.setLogLevel(1); // release级别，SDK 输出关键信息，生产环境时建议使用

    // 注册腾讯云即时通信 IM 上传插件
    tim.registerPlugin({'tim-upload-plugin': TIMUploadPlugin});

    this._SDKInstance = tim;

  }

  //单例模式
  static getInstance() {
    if(!Tim.instance) {
      Tim.instance = new Tim()
    }
    return Tim.instance
  }

  getSDK() {
    return this._SDKInstance
  }

  //sdk要先登录才能用 https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html#login
  login() {
     //前端生成签名，实际项目请让厚度按生成签名！
    const userInfo = User.getUserInfoByLocal()   
    //userInfo 微信登录后 调用后端接口 返回的用户信息 接口包含一个ID
    const textUserSig = genTestUserSig(userInfo.id.toString())
    console.log('我的userID',userInfo.id.toString())
    
    this._SDKInstance.login({
      userID: userInfo.id.toString(),
      userSig: textUserSig.userSig
    })
  }


  logout() {
    this._SDKInstance.logout()
  }

  async sendMessage(message) {
    //https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html#sendMessage
    //调取SDK发送消息的方法 message 是通过 createMessage 根据不同的消息类型 创建消息
    this._SDKInstance.sendMessage(message)
  }

   // 根据不同类型，创建不同的实例
    // 工厂模式
    createMessage(type, content, targetUserId, extension = null) {

      console.log('createMessage接受的参数',type,content,targetUserId)
      let message
      const params = {
          to: targetUserId,  //发送给谁
          conversationType: TIM.TYPES.CONV_C2C, //消息类型，TIM提供的类型
          payload: null
      }
      switch (type) {
          case TIM.TYPES.MSG_TEXT:
              params.payload = { text: content }
              message = this._SDKInstance.createTextMessage(params)
              break
          case TIM.TYPES.MSG_IMAGE:
         
              params.payload = { file: content }
              console.log('走到图片了！',params)
              message = this._SDKInstance.createImageMessage(params)
              console.log('图片中生成的message',message)
              break
              //https://web.sdk.qcloud.com/im/doc/zh-cn/Message.html#.CustomPayload
          case TIM.TYPES.MSG_CUSTOM:
              params.payload = {
                  data: 'service',
                  description: JSON.stringify(content),
                  extension
              }
              message = this._SDKInstance.createCustomMessage(params)
              break
          default:
              throw Error('未知消息类型')
      }
      return message
    }


  //获取消息列表
  async getMessageList(targetUserId,count=10) {

    if (this.isCompleted) {
      return this._messageList
    }

    //分页拉取指定会话的消息列表的接口 https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html#getMessageList
    const res = await this._SDKInstance.getMessageList({
      conversationID: `C2C${targetUserId}`,
      nextReqMessageID:this._nextReqMessageID, 
      count: count > 15 ? 15 : count
    })
    this._nextReqMessageID = res.data.nextReqMessageID;
    this.isCompleted = res.data.isCompleted
    this._messageList = res.data.messageList

    return this._messageList 
  }

  //获取聊天目标用户信息
  async getUserProfile(userId) {
    const res = await this._SDKInstance.getUserProfile({
        // 请注意：即使只拉取一个用户的资料，也需要用数组类型，例如：userIDList: ['user1']
        userIDList: [userId]
    });
    return res.data
  }

  //更新用户信息
  async updateUserProfile(userInfo) {
    await this._SDKInstance.updateMyProfile({
        nick: userInfo.nickname,
        avatar: userInfo.avatar,
        gender: userInfo.gender === 1 ? TIM.TYPES.GENDER_MALE : TIM.TYPES.GENDER_FEMALE
    })
  }


  //设置消息已读
  async setMessageRead(targetUserId) {
    const res = await this._SDKInstance.setMessageRead({
      conversationID:`C2C${targetUserId}`
    })

    return res.data
  }

  //获取会话列表
  async getConversationList() {
    const res = await this._SDKInstance.getConversationList()
    return res.data.conversationList
  }

  async getConversationProfile(targetUserId) {
   const res =  await this._SDKInstance.getConversationProfile(`C2C${targetUserId}`)

    return res.data.conversation
  }


  reset() {
    this._nextReqMessageID = ''
    this.isCompleted = false
    this._messageList = []
    return this
  }
}

export default Tim