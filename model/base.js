//基类


export default class Base {

  page = 1
  count = 4
  data= []
  hasMoreData = true

  reset() {
    this.data = []
    this.page = 1
    this.count = 4
    this.hasMoreData= true
    return this
  }
}