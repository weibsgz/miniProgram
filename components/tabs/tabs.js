import { throttle } from '../../utils/util'
const moment = require("../../lib/moment")
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多 slot 支持
  },
  properties: {
    // 传入属性
    tabs: {
      type: Array,
      value: [],
    },
    active:{
      type:Number,
      value:0
    }
  },

  observers:{
    active:function(newVal) {
      this.setData({
        currentTabIndex : newVal
      })
    }
  },

  data: {
    // 这里是一些组件内部数据
    currentTabIndex: 0,
    lastClickTime: null
  },
  methods: {
    // 这里是一个自定义方法
    handleTabChange:function(e) {
        const index = e.currentTarget.dataset.index;
        const now = moment()
        const diff = now.diff(this.data.lastClickTime);
        if (diff < 250) {
          console.log('doubleclicktab')
          this.triggerEvent('doubleclicktab')
        }
        this.data.lastClickTime = now

        if(index === this.data.currentTabIndex) return 
        
        this.setData({
          currentTabIndex:index
        })

        this.triggerEvent('change', {index})
      },
    //调用WXS中组件的方法
    handleTouchMove(e) {
      console.log(JSON.stringify(e))
      //-1 右滑 0 不动 1 左滑
      const direction = e.direction;
      const currentTabIndex = this.data.currentTabIndex;
      const targetTabIndex = currentTabIndex + direction;
      if(targetTabIndex < 0 || targetTabIndex > this.data.tabs.length - 1) {
        console.log('越界了')
        return 
      }

      //滑动内容区域 触发tabs切换
      this.setData({
        currentTabIndex:targetTabIndex
      })
      this.triggerEvent('change', {targetTabIndex})

    }
  }
})
