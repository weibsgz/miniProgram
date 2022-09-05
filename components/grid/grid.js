import { getEventParam } from "../../utils/util";

Component({
    options: {
        multipleSlots: true
    },
    relations: {
        '../grid-item/grid-item': {
            type: 'child'
        }
    },
    properties: {
        rowNum: {
            type: Number,
            value: 3
        },
        title: String,
        extend: String,
        extendCell: Object
    },
    data: {},
    lifetimes: {
        ready() {
            this.getGridItems()
        }
    },
    methods: {
        getGridItems() {
           //通过关联父子组件 能知道子组件的个数，这样父组件就可以有几个子组件，循环生成多个插槽了

            const items = this.getRelationNodes('../grid-item/grid-item')
            console.log('items',items)
            const gridItems = items.map((item, index) => {
                return {
                    index
                }
            })
            this.setData({
                gridItems
            })
        },

        handleSelect(event) {
            console.log('这里是grid-item,冒泡过来的事件',event)
            const cell = getEventParam(event, 'cell')
            this.triggerEvent('itemtap', { cell })
        },

        handleExtend() {
            this.triggerEvent('extendtap',
                { cell: this.data.extendCell })
        },
    }
});