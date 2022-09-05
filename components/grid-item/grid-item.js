// components/grid-item/grid-item.js
Component({
  relations: {
    '../grid/grid': {
        type: 'parent'
    }
  },
  properties: {
    icon: String,
    iconSize: {
        type: String,
        value: '50'
    },
    text: String,
    showBadge: Boolean,
    badgeCount: Number,
    cell: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleSelect: function () {
      this.triggerEvent('maopao',
          { cell: this.data.cell },
          // 事件冒泡   composed: true 穿越组件的边界 让grid.js 直接处理
          { bubbles: true, composed: true }
      )
   }
  }
})
