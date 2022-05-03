import { MDObject, MCObject } from './MDObject.js';

export class MDBillCate extends MDObject {

}

export class MCBillCate extends MCObject {
  model = MDBillCate
  /**
   * 获取列表
   * @param options
   * @return {Promise<*>}
   */
  fetchList(options) {
    return this.fetch(Object.assign({
      url: './assets/data/cate.json',
    }, options));
  }
  /**
   * 获取分类选择器数据
   * @param contains
   * @return {*[]}
   */
  getCatePickerData(contains) {
    const ids =[], list = [];
    this.each(item => {
      if(Array.isArray(contains) && contains.indexOf(item.get('id')) < 0) return;
      if(ids.indexOf(item.get('id')) < 0) {
        ids.push(item.get('id'));
        list.push({ name: item.get('name'), value: item.get('id') });
      }
    });
    return list;
  }
}