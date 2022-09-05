import Http from '../utils/http'

class Service  {

   constructor() {
     this.data = []
     this.page = 1
     this.count = 5
     this.hasMoreData= true
   }

   async getServiceList(category_id=null,type=null) { 
    /**
     * 首页分页获取服务列表
     * page : 页码
     * count: 每页数量
     * catefory_id:分类ID
     * type:服务类型
     */
   
    if(!this.hasMoreData) return this.data

     const serviceList = await Http.request({
       url:`v1/service/list`,
       data:{
         page:this.page,
         count:this.count,
         category_id :category_id || '',
         type: type || ''
      }})

      this.data = this.data.concat(serviceList.data)
      //last_page 是最大页码数
      this.hasMoreData = !(this.page === serviceList.last_page)
      if(this.hasMoreData) {
        this.page++       
      }     
      return this.data
  }
  //重置当前状态  用来下拉刷新用
  reset() {
     this.data = []
     this.page = 1
     this.count = 4
     this.hasMoreData= true
     return this
  }

  //详情页通过ID获取数据
  static getServiceById(serviceId) {
      return Http.request({
        url:`v1/service/${serviceId}`,
      })
  }

  static updateServiceStatus(serviceId,action) {
      return Http.request({
        method:'POST',
        url:`v1/service/${serviceId}`,
        data:{
          action
        }
      })
  }

  static publishService(formData) {
    return Http.request({
      method:'POST',
      url:`v1/service`,
      data:formData
    })
  }


  static editService(serviceId,formData) {
    return Http.request({
      method:'PUT',
      url:`v1/service/${serviceId}`,
      data:formData
    })
  }


  static getServiceStatus(type) {
    return Http.request({
      url:`v1/service/count?type=${type}`
    })
  } 


  async getMyService(type, status) {
    if (!this.hasMoreData) {
        return
    }

    const serviceList = await Http.request({
        url: 'v1/service/my',
        data: {
            page: this.page,
            count: this.count,
            type,
            status
        }
    })

    this.data = this.data.concat(serviceList.data)
    this.hasMoreData = this.page !== serviceList.last_page
    this.page++
    return this.data
  }



}

export default Service