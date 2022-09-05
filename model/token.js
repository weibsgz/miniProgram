import Http from '../utils/http'
import APIconfig from '../config/api'
import cache from '../enum/cache'

class Token{
  static async getToken() {
    const res = await Http.request({
      method:'POST',
      url:'v1/token',
      data:{
        i_code:APIconfig.iCode,
        order_no:APIconfig.orderNo
      }
    })

    return res.token
  }

  static async verifyToken() {
    const token = wx.getStorageSync(cache.TOKEN)

    const res = await Http.request({
      method:'POST',
      url:`v1/token/verify`,
      data:{token}
    })

    return res
  }
}

export default Token