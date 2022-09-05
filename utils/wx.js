
//转换WX的方法为PROMISE

import cache from "../enum/cache"

function wxToPromise(method, options = {}) {
  return new Promise((resolve, reject) => {
      options.success = resolve
      options.fail = err => {
          reject(err)
      }
      wx[method](options)
  })
}

//设置原生tabbar未读消息数量
// 本来这里有未读消息设置一下 没有就清空 都用API方法挺好 但是
//特么的小程序如果不在tabBar的页面removeTabBarBadge会报错，所以只能捕获这个异常，存到缓存中
//

const setTabBarBadge = async function(unreadCount) {
  try{
    if(unreadCount) {
      await wx.setTabBarBadge({
        index: 2,
        text: unreadCount.toString(),
      })
      wx.setStorageSync(cache.UNREAD_COUNT,unreadCount)
    }else {
      await wx.removeTabBarBadge({
        index:2
      })
      wx.setStorageSync(cache.UNREAD_COUNT,0)
    }
  
  }catch(e) {
    console.log(e)
    wx.setStorageSync(cache.UNREAD_COUNT,unreadCount)
  }
  
}

export { wxToPromise , setTabBarBadge }