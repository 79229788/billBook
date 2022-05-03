import basicUtils from "../../utils/basic.js";
import elementUtils from "../../utils/element.js";

export default class Dropdown {
  /**
   * 显示窗口
   * @param options
   * @return {Dropdown}
   */
  show(options) {
    if(this.isShow) return this;
    this.options = Object.assign({
      target: null,
      list: [],
      onSelect: (e) => {}
    }, options);
    this.options.target = this.options.target instanceof HTMLElement
      ? this.options.target : document.querySelector(this.options.target);
    if(!this.options.target) throw new Error('dropdown target not found');
    this.renderDropdownView(() => {
      window.addEventListener('resize', this.windowResizeHandler);
      document.addEventListener('click', this.outsideClickHandler);
      this.refreshViewPosition();
      this.isShow = true;
    });
    return this;
  }
  /**
   * 隐藏窗口
   * @return {Dropdown}
   */
  hide() {
    if(!this.isShow) return this;
    this.$el.view.classList.remove('ui-open');
    setTimeout(() => {
      this.$el.view.parentNode.removeChild(this.$el.view);
    }, 200);
    window.removeEventListener('resize', this.windowResizeHandler);
    document.removeEventListener('click', this.outsideClickHandler);
    this.isShow = false;
    return this;
  }
  /**
   * 刷新视图
   */
  refresh() {
    this.refreshViewPosition();
    this.refreshListData();
  }

  //********************内置方法
  //********************
  isShow = false
  options = {}
  $el = {
    view: null
  }
  constructor() {}
  //**********创建下拉视图(如果已创建，则直接隐藏)
  createListElements() {
    const liList = [];
    this.options.list.forEach((data, index) => {
      if(!basicUtils.isObject(data)) {
        data = { name: data, value: data };
      }
      const $item = elementUtils.create('li',
        { class: 'item', 'data-index': index }, data.name);
      $item.onclick = (e) => this.onSelectItem(e);
      liList.push($item);
    });
    return liList;
  }
  //**********渲染下拉视图(如果已创建，则直接隐藏)
  renderDropdownView(nextTick = () => {}) {
    const liList = this.createListElements();
    const $ul = elementUtils.create('ul', { class: 'list' }, liList);
    this.$el.view = elementUtils.create('div', { class: 'ui-dropdown ui-fade-down' }, $ul);
    requestAnimationFrame(() => {
      this.$el.view.classList.add('ui-open');
      nextTick();
    });
    document.body.appendChild(this.$el.view);
  }
  //**********刷新视图位置
  refreshViewPosition() {
    if(!this.options.target) return this;
    if(!this.$el.view) return this;
    const rect = this.options.target.getBoundingClientRect();
    const top = document.documentElement.scrollTop + rect.top;
    const left = document.documentElement.scrollLeft + rect.left;
    this.$el.view.style.top = top + rect.height + 'px';
    this.$el.view.style.left = left + (rect.width - this.$el.view.offsetWidth) / 2 + 'px';
  }
  //**********刷新列表数据
  refreshListData() {
    if(!this.$el.view) return this;
    const liList = this.createListElements();
    const $list = this.$el.view.querySelector('.list');
    $list.innerHTML = '';
    const $fragment = document.createDocumentFragment();
    liList.forEach(node => $fragment.appendChild(node));
    $list.appendChild($fragment);
  }
  //**********窗口尺寸变化处理
  windowResizeHandler = () => {
    this.refreshViewPosition();
  }
  //**********外部点击处理
  outsideClickHandler = (e) => {
    if(!this.$el.view) return;
    if(this.$el.view.contains(e.target)) return;
    if(!this.isShow) return;
    this.hide();
  }

  //********************事件操作
  //********************
  //**********选择条目
  onSelectItem(e) {
    const index = e.target.getAttribute('data-index');
    let item = this.options.list[index];
    if(!basicUtils.isObject(item)) {
      item = { name: item, value: item };
    }
    this.hide();
    this.options.onSelect(item);
  }
}