import serviceStatus from "../../../../enum/service-status";
import serviceAction from "../../../../enum/service-action";
import behavior from "../behavior";
import { getDataSet } from "../../../../utils/util";

Component({
  behaviors: [behavior],
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    serviceStatusEnum: serviceStatus,
    serviceActionEnum: serviceAction
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleUpdateStatus: function (event) {      
      const action = getDataSet(event, 'action')      
      this.triggerEvent('update', { action })
    },

    handleEditService: function () {
        this.triggerEvent('edit')
    }
  }
})
