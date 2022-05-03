import { MDObject, MCObject } from './MDObject.js';
import basicUtils from "../utils/basic.js";
import KBill from "../constants/KBill.js";

const typeMap = basicUtils.keyBy(KBill.KType, 'value');

export class MDBill extends MDObject {
  validators = {
    saveListItem: {
      time: {
        type: 'string',
        required: true,
        message: '请选择账单时间',
      },
      type: {
        type: 'number',
        required: true,
        message: '请选择账单类型',
      },
      category: {
        type: 'string',
        required: true,
        message: '请选择账单分类',
      },
      amount: {
        type: 'number',
        required: true,
        message: '请填写账单金额',
      }
    }
  }
  /**
   * 数据加工
   */
  compute() {
    const typeData = typeMap[this.get('type')];
    this.set('_timeName', this.getTime());
    this.set('_yearMonth', this.getTime('YYYY-MM'));
    this.set('_typeName', typeData && typeData.name || '无类型');
    this.set('_amount', (this.get('amount') || 0).toFixed(2));
  }
  /**
   * 获取格式化时间
   * @param format
   * @return {string}
   */
  getTime(format = 'YYYY-MM-DD HH:mm:ss') {
    if(!this.get('time')) return undefined;
    const time = new Date(this.get('time'));
    const date = {
      'M+': time.getMonth() + 1,
      'D+': time.getDate(),
      'H+': time.getHours(),
      'm+': time.getMinutes(),
      's+': time.getSeconds(),
    }
    if(RegExp(`(Y+)`).test(format)) {
      format = format.replace(RegExp.$1, String(time.getFullYear()).slice(4 - RegExp.$1.length));
    }
    for(const k in date) {
      if(RegExp(`(${k})`).test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? date[k] : ('00'.slice(String(date[k]).length) + date[k])
        );
      }
    }
    return format;
  }
  /**
   * 获取分类名称
   * @param cateMap
   */
  getCateName(cateMap) {
    const cateData = cateMap[this.get('category')];
    return cateData && cateData.get('name') || '无分类';
  }
}

export class MCBill extends MCObject {
  model = MDBill
  /**
   * 获取列表
   * @param options
   * @return {Promise<*>}
   */
  fetchList(options) {
    return this.fetch(Object.assign({
      url: './assets/data/bill.json',
      sortFn: (a, b) => a.get('time') - b.get('time'),
    }, options));
  }
  /**
   * 获取所有分类id[获取当前集合中的]
   * @return {*[]}
   */
  getCurrentCateIds() {
    const ids = [];
    this.getModels().forEach(item => {
      if(ids.indexOf(item.get('category')) < 0) {
        ids.push(item.get('category'));
      }
    });
    return ids;
  }
  /**
   * 获取月份选择器数据[获取原始集合中的]
   * @return {*[]}
   */
  getMonthPickerData() {
    const months = [], list = [];
    this.getOriginalModes().forEach(item => {
      if(months.indexOf(item.get('_yearMonth')) < 0) {
        months.push(item.get('_yearMonth'));
        list.push({
          name: item.get('_yearMonth'),
          value: item.get('_yearMonth')
        });
      }
    });
    return list.sort((a, b) => {
      return new Date(a.value.replace(/-/g, '/')).getTime()
        - new Date(b.value.replace(/-/g, '/')).getTime();
    });
  }
}