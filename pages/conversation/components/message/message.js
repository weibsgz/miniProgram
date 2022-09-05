import { formatTime } from "../../../../utils/date"
import TIM from 'tim-wx-sdk'
import { getDataSet, getEventParam } from "../../../../utils/util"
// pages/conversation/components/message/message.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message: Object
  },
  observers:{
    'message':function(message) {
      console.log('.....observers.message',message)
      //格式化时间
      message.time = formatTime(message.time)
      this.setData({
        _message:message
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    TIM, //TIM带有types可以判断消息类型
    flowEnum: {
      IN: 'in',
      OUT: 'out'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async handlePreview(event) {
      const url = getDataSet(event,'image')
      await wx.previewImage({
        urls: [url],
        current:url
      })
    

    },

    handleSend(event) {
      const service = getEventParam(event,'service')
      this.triggerEvent('send',{service})

    },

    handleSelect(event) {
      const service = getEventParam(event,'service')
      this.triggerEvent('select',{service})
    }

  }
})
