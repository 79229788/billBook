import ViewBase from "../../../assets/mixins/viewBase.js";
import elementUtils from "../../../assets/utils/element.js";
import KBill from "../../../assets/constants/KBill.js";

/**
 * 模块视图
 */
export default class View extends ViewBase {
  sources = {
    catePickerData: null,
    cateIdMap: null,
  }
  events = {
    onSearchData: (e, key, pickerData) => {},
    onSortData: (e, key, direction, valueHandler) => {},
    onSearchTime: (e, key, direction, valueHandler) => {},
    onCreateListItem: (e) => {},
  }
  /**
   * 构造器
   * @param controller 控制器
   * @param el 根挂载节点
   */
  constructor(controller, el) {
    super(...arguments);
    this.renderFrameView(el);
    this.$el = {
      app: document.querySelector('#app'),
      billList: document.querySelector('.bill-list'),
      billStatistics: document.querySelector('.bill-statistics'),
      listHead: document.querySelector('.bill-list .head'),
      listBody: document.querySelector('.bill-list .body'),
      listFoot: document.querySelector('.bill-list .foot'),
    }
  }
  /**
   * 渲染框架视图
   * @param el 根挂载节点
   */
  renderFrameView(el) {
    const $mount = el instanceof HTMLElement ? el : document.querySelector(el);
    $mount.appendChild(elementUtils.create('div', { id: 'wrapper' }, [
      elementUtils.create('div', { class: 'bill-list' }, [
        elementUtils.create('section', { class: 'head' }),
        elementUtils.create('section', { class: 'body' }),
        elementUtils.create('section', { class: 'foot' }),
      ]),
      elementUtils.create('div', { class: 'bill-statistics' })
    ]));
  }
  /**
   * 渲染列表页头视图
   */
  renderListHeadView() {
    const tabOptions = [
      { key: 'time', title: '账单时间', sortable: true, valueHandler: (value) => value },
      { key: 'type', title: '账单类型', searchable: true, pickerData: Object.values(KBill.KType) },
      { key: 'category', title: '账单分类', searchable: true, pickerData: () => this.getSources().catePickerData },
      { key: 'amount', title: '账单金额', sortable: true, valueHandler: (value) => value },
    ];
    const thEls = [];
    tabOptions.forEach(item => {
      if(item.searchable) {
        thEls.push(elementUtils.create('th', {
          class: 'action-btn',
          on: { click: (e) => this.events.onSearchData(e, item.key, item.pickerData) }
        }, [
          `${item.title} `,
          elementUtils.create('i', { class: 'search iconfont' }, '\ue612'),
        ]));
      }else if(item.sortable) {
        thEls.push(elementUtils.create('th', [
          `${item.title} `,
          elementUtils.create('div', { class: 'sort-btn' }, [
            elementUtils.create('span', {
              class: 'btn up',
              on: { click: (e) => this.events.onSortData(e, item.key, 'up', item.valueHandler) }
            }),
            elementUtils.create('span', {
              class: 'btn down',
              on: { click: (e) => this.events.onSortData(e, item.key, 'down', item.valueHandler) }
            }),
          ])
        ]));
      }else {
        thEls.push(elementUtils.create('th', '账单时间'));
      }
    });
    this.$el.listHead.appendChild(elementUtils.create('div', { class: 'title' }, [
      elementUtils.create('div', { class: 'name' }, '我的记账本'),
      elementUtils.create('div', {
        class: 'detail',
        on: { click: this.events.onSearchTime }
      }, '点击我筛选日期'),
    ]));
    this.$el.listHead.appendChild(elementUtils.create('table', elementUtils.create('tr', thEls)));
  }
  /**
   * 渲染列表主体行
   * @param list 模型集合
   * @param options
   */
  renderListBodyRows(list, options = {}) {
    const params = Object.assign({
      push: false,
      unshift: false,
      insert: -1,
      class: undefined,
    }, options);
    const $table = this.$el.listBody.querySelector('table');
    const trEls = [];
    list.forEach(item => {
      trEls.push(elementUtils.create(
        'tr',
        { class: params.class },
        [
          elementUtils.create('td', { class: 'time' }, item.get('_timeName')),
          elementUtils.create('td', { class: 'type' }, item.get('_typeName')),
          elementUtils.create('td', { class: 'cate' }, item.getCateName(this.getSources().cateIdMap)),
          elementUtils.create('td', { class: 'amount' }, item.get('amount')),
        ]));
    });
    //如果数据不存在则添加提示行
    if(trEls.length === 0) {
      trEls.push(elementUtils.create('tr', { class: 'no-data' }, [
        elementUtils.create('td', '暂无相关数据'),
      ]));
    }
    //存在提示行则清理行
    else if(this.$el.listBody.querySelector('tr.no-data')) {
      $table.innerHTML = '';
    }
    //从列表底部添加行
    if(params.push) {
      const $fragment = document.createDocumentFragment();
      trEls.forEach($el => $fragment.appendChild($el));
      $table.appendChild($fragment);
    }
    //从列表顶部添加|插入行
    else if(params.unshift || params.insert >= 0) {
      //如果不存在行则从底部添加
      if($table.querySelectorAll('tr').length === 0) {
        options.push = true;
        options.unshift = false;
        this.renderListBodyRows(list, options);
      }else {
        const $first = params.insert >= 0
          ? $table.querySelectorAll('tr')[params.insert]
          : $table.querySelector('tr');
        trEls.forEach($el => $table.insertBefore($el, $first));
      }
    }else {
      const $table = elementUtils.create('table', trEls);
      this.$el.listBody.innerHTML = '';
      this.$el.listBody.appendChild($table);
    }
  }
  /**
   * 渲染页脚视图
   */
  renderListFootView() {
    const view = elementUtils.create('div', {
      class: 'btn',
      on: { click: this.events.onCreateListItem }
    }, [
      elementUtils.create('i', { class: 'search iconfont' }, '\ue641'),
      ' 添加新账单',
    ]);
    this.$el.listFoot.appendChild(view);
  }
}