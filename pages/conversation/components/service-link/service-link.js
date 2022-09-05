// pages/conversation/components/service-link/service-link.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    flow: String,
    service: String,
    extension: String,
  },
 
  lifetimes: {
    attached() {
        this.setData({
            _service: JSON.parse(this.data.service)
        })
    }
  },
  data: {
      _service: null,
      flowEnum: {
          IN: 'in',
          OUT: 'out'
      }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleSendLink: function () {
      this.triggerEvent('send', { service: this.data._service })
    },

    handleSelect: function () {
        this.triggerEvent('select', { service: this.data._service })
    }
  }
})
