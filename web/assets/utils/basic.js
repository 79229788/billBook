export default {
  /**
   * 是否为对象
   * @param value
   * @return {boolean}
   */
  isObject: function (value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  },
  /**
   * 使用新的键的map
   * @param obj
   * @param key
   * @return {{}}
   */
  keyBy: function (obj, key) {
    const map = {};
    if(Array.isArray(obj)) {
      obj.forEach(item => {
        map[item[key]] = item;
      });
    }else {
      for(const k in obj) {
        map[obj[k][key]] = obj[k];
      }
    }
    return map;
  }
}