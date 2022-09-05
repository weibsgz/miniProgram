import Base from './base'
import Http from '../utils/http'

//详情页历史评价列表
export default class Rating extends Base{
   async getServiceRatingList(serviceId) {
      if(!this.hasMoreData) {
        return this.data
      }

      const ratingList = await Http.request({
        url:`v1/rating/service`,
        data:{
          page:this.page,
          count:this.count,
          service_id :serviceId,     
       }})
 
       this.data = this.data.concat(ratingList.data)
       //last_page 是最大页码数
       this.hasMoreData = !(this.page === ratingList.last_page)
       if(this.hasMoreData) {
         this.page++       
       }     
       return this.data
   }

   static async getRatingByOrderId(orderId) {
    return Http.request({
        url: 'v1/rating/order',
        data: {
            order_id: orderId
        }
    })
  }

    static async createRating(order_id, score, content, illustration) {
        return Http.request({
            url: 'v1/rating',
            data: {
                order_id, score, content, illustration
            },
            method: 'POST'
        })
    }
}
