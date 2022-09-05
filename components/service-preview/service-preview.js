import serviceType from "../../enum/service-type";

Component({
    properties: {
        service: {
            type: Object
        }
    },
    data: {
        serviceTypeEnum: serviceType
    },
    lifetimes: {
      attached: function() {
        // console.log('__service',this.data.service)
      },
      detached: function() {
        // 在组件实例被从页面节点树移除时执行
      },
    },
    methods: {}
});
