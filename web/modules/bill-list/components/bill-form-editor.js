import View from "../views/bill-form-editor.js";
import ControllerBase from "../../../assets/mixins/controllerBase.js";
import { MDBill } from "../../../assets/models/MDBill.js";
import Dropdown from "../../../assets/components/dropdown/index.js";
import KBill from "../../../assets/constants/KBill.js";

const formDataClone = function () {
  return {
    type: null,
    category: null,
    amount: null,
    time: null,
  };
}

export default class BillFormEditor extends ControllerBase {
  $view = undefined
  options = {}
  formData = formDataClone()
  /**
   * 显示窗口
   * @param options
   */
  show(options) {
    this.options = Object.assign({
      billCateList: [],
      onCreate: (model) => {}
    }, options);
    this.formData = formDataClone();
    this.$view = this.$view || new View(this);
    this.$view.onEvents({
      onSelectValue: this.onSelectValue,
      onInputValue: this.onInputValue,
      onSubmitForm: this.onSubmitForm,
    })
    this.$view.show();
  }
  /**
   * 隐藏窗口
   */
  hide() {
    this.$view.hide();
  }
  //********************内置方法
  //********************


  //********************事件操作
  //********************
  //**********选择表单值
  onSelectValue(e, key) {
    const list = [];
    if(key === 'category') {
      this.options.billCateList.forEach(model => {
        list.push({ name: model.get('name'), value: model.get('id') });
      });
    }
    if(key === 'type') {
      list.push(...Object.values(KBill.KType));
    }
    if(key === 'time') {
      //暂不实现标准时间选择器，故使用几个内置时间
      list.push(...[
        { name: '2019-05-01 08:00:00', value: 1556668800000 },
        { name: '2019-07-31 12:12:00', value: 1564546320000 },
        { name: '2019-12-26 12:15:00', value: 1577333700000 },
      ]);
    }
    this[`${key}Dropdown`] = (this[`${key}Dropdown`] || new Dropdown())
      .show({
        list,
        target: e.target.parentNode,
        onSelect: (data) => {
          e.target.value = data.name;
          this.formData[key] = data.value;
        }
      });
  }
  //**********输入表单值
  onInputValue(e, key) {
    const value = e.target.value;
    switch (key) {
      case 'amount':
        this.formData[key] = Number(value);
        break;
      default:
        this.formData[key] = value;
        break;
    }
  }
  //**********提交表单
  onSubmitForm() {
    this.$view.clearValidation();
    const model = new MDBill();
    model.set(this.formData);
    model.validate('saveListItem').then(() => {
      this.hide();
      model.compute();
      this.options.onCreate(model);
    }).catch(res => {
      res.missing.forEach(item => {
        const $tips = document.querySelector(`[data-key="${item.key}"]`);
        if($tips) $tips.innerHTML = item.message;
      });
    });
  }

}