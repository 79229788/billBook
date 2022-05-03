import basicUtils from "../../utils/basic.js";
import elementUtils from "../../utils/element.js";

export default class Popup {
  /**
   * 显示视图
   * @param options
   * @return {Popup}
   */
  show(options) {
    if(this.isShow) return this;
    this.options = Object.assign({
      element: null,
      zIndex: 999,
    }, options);
    this.options.element.classList.add('ui-slot');
    this.options.element.style.zIndex = String(this.options.zIndex - 1);
    this.renderDropdownView(() => {
      this.isShow = true;
    });
    return this;
  }
  /**
   * 隐藏视图
   * @return {Popup}
   */
  hide() {
    if(!this.isShow) return this;
    this.$el.view.classList.remove('ui-open');
    setTimeout(() => {
      this.$el.view.style.display = 'none';
    }, 200);
    this.isShow = false;
    return this;
  }

  //********************内置方法
  //********************
  isShow = false
  options = {}
  $el = {
    view: null
  }
  constructor() {}
  //**********渲染下拉视图(如果已创建，则直接隐藏)
  renderDropdownView(nextTick = () => {}) {
    if(this.$el.view) {
      this.$el.view.style.display = 'block';
      requestAnimationFrame(() => {
        this.$el.view.classList.add('ui-open');
        nextTick();
      });
      return;
    }
    this.$el.view = elementUtils.create('div',
      { class: 'ui-popup ui-fade-down', style: { zIndex: this.options.zIndex } }, [
        elementUtils.create('div', { class: 'ui-wrapper' }, [
          elementUtils.create('div', { class: 'ui-content' }, [
            this.options.element,
            elementUtils.create('div',
              {
                class: 'ui-mask',
                style: { zIndex: this.options.zIndex - 2 },
                on: { click: this.hide.bind(this) }
              })
          ])
        ])
      ]);
    requestAnimationFrame(() => {
      this.$el.view.classList.add('ui-open');
      nextTick();
    });
    document.body.appendChild(this.$el.view);
  }

  //********************事件操作
  //********************

}