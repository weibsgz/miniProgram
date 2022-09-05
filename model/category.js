import Http from "../utils/http";

export default class Category {
  static async getCategoryList() {
    return Http.request({url:`v1/category`})
  }

  static async getCategoryListWithAll() {
   const res = await Category.getCategoryList()
    res.unshift({
      id:"0",
      name:'全部'
    })
    return res
  }
}