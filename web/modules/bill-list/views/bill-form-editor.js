import ViewBase from "../../../assets/mixins/viewBase.js";
import elementUtils from "../../../assets/utils/element.js";
import Popup from '../../../assets/components/popup/index.js';

/**
 * 模块视图
 */
export default class View extends ViewBase {
  popup = new Popup()
  sources = {}
  events = {
    onSelectValue: (e, key) => {},
    onInputValue: (e, key) => {},
    onSubmitForm: (e) => {},
  }
  /**
   * 构造器
   * @param controller 控制器
   */
  constructor(controller) {
    super(...arguments);
    this.formOptions = [
      { key: 'time', title: '账单时间', type: 'text', placeholder: '请选择账单时间', mode: 'picker' },
      { key: 'type', title: '账单类型', type: 'text', placeholder: '请选择账单类型', mode: 'picker' },
      { key: 'category', title: '账单分类', type: 'text', placeholder: '请选择账单分类', mode: 'picker' },
      { key: 'amount', title: '账单金额', type: 'number', placeholder: '请填写账单金额', mode: 'input' },
    ];
  }
  /**
   * 显示窗口
   */
  show() {
    this.popup.show({
      element: this.createMainView()
    });
  }
  /**
   * 隐藏窗口
   */
  hide() {
    this.popup.hide();
  }
  /**
   * 创建主视图
   */
  createMainView() {
    if(this.$el) {
      this.$el.querySelectorAll('input').forEach($el => $el.value = '');
      this.clearValidation();
      return this.$el;
    }
    const formItemElements = [];
    this.formOptions.forEach(item => {
      const inputAttrs = {};
      inputAttrs.type = item.type;
      inputAttrs.placeholder = item.placeholder;
      if(item.mode === 'picker') {
        inputAttrs.readOnly = true;
        inputAttrs.on = { click: (e) => this.events.onSelectValue(e, item.key) };
      }
      if(item.mode === 'input') {
        inputAttrs.on = { input: (e) => this.events.onInputValue(e, item.key) };
      }
      formItemElements.push(elementUtils.create('div', { class: 'form-item' }, [
        elementUtils.create('div', { class: 'wrap' }, [
          elementUtils.create('span', `${item.title}：`),
          elementUtils.create('input', inputAttrs),
        ]),
        elementUtils.create('div', { class: 'tips', 'data-key': item.key }),
      ]));
    })
    return this.$el = elementUtils.create('div', { class: 'bill-form-edit-view' }, [
      elementUtils.create('div', { class: 'title' }, '新增账单'),
      elementUtils.create('div', { class: 'form' }, formItemElements),
      elementUtils.create('div', { class: 'submit' }, [
        elementUtils.create('div', {
          class: 'btn',
          on: { click: this.events.onSubmitForm }
        }, '确认保存')
      ])
    ]);
  }
  //**********清理验证
  clearValidation(key) {
    this.formOptions.forEach(item => {
      if(key && item.key !== key) return;
      const $tips = document.querySelector(`[data-key="${item.key}"]`);
      if($tips) $tips.innerHTML = '';
    })
  }

}