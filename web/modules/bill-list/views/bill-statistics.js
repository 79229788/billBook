import ViewBase from "../../../assets/mixins/viewBase.js";
import elementUtils from "../../../assets/utils/element.js";
import KBill from "../../../assets/constants/KBill.js";

export default class View extends ViewBase {
  sources = {
    billCateIdMap: null,
  }
  events = {}
  monthStatisticsMap = {}
  monthCateStatisticsMap = {}
  /**
   * 构造器
   * @param controller 控制器
   */
  constructor(controller) {
    super(...arguments);
  }
  /**
   * 更新视图
   * @param el
   * @param models
   */
  update(el, models) {
    this.$el = el;
    this.$el.innerHTML = '';
    this.monthStatisticsMap = {
      [KBill.KType.income.value]: 0,
      [KBill.KType.expenditure.value]: 0,
    };
    this.monthCateStatisticsMap = {
      [KBill.KType.income.value]: {},
      [KBill.KType.expenditure.value]: {},
    };
    if(models.length > 0) {
      models.forEach(item => {
        this.month = item.get('_yearMonth');
        this.monthStatisticsMap[item.get('type')] += item.get('amount');
        if(!this.monthCateStatisticsMap[item.get('type')][item.get('category')]) {
          this.monthCateStatisticsMap[item.get('type')][item.get('category')] = {
            amount: 0, name: item.getCateName(this.getSources().billCateIdMap),
          };
        }
        this.monthCateStatisticsMap[item.get('type')][item.get('category')].amount += item.get('amount');
      });
      this.renderMonthBalanceView();
      this.renderMonthCateView(KBill.KType.income);
      this.renderMonthCateView(KBill.KType.expenditure);
    }
  }
  /**
   * 渲染月份收支视图
   */
  renderMonthBalanceView() {
    this.$el.appendChild(elementUtils.create('div', { class: 'project' }, [
      elementUtils.create('div', { class: 'title' }, `[${this.month}]收支统计`),
      elementUtils.create('div', { class: 'list' }, [
        elementUtils.create('div', { class: 'item' }, [
          `收入总额：`, elementUtils.create('span', `${this.monthStatisticsMap[KBill.KType.income.value]}元`),
        ]),
        elementUtils.create('div', { class: 'item' }, [
          `支出总额：`, elementUtils.create('span', `${this.monthStatisticsMap[KBill.KType.expenditure.value]}元`),
        ]),
      ]),
    ]));
  }
  /**
   * 渲染月份分类视图
   */
  renderMonthCateView(typeData) {
    const els = [];
    Object.values(this.monthCateStatisticsMap[typeData.value])
      .sort((a, b) => b.amount - a.amount)
      .forEach(item => {
        els.push(elementUtils.create('div', { class: 'item' }, [
          `${item.name}：`, elementUtils.create('span', `${item.amount}元`),
        ]));
      });
    if(els.length === 0) {
      els.push(elementUtils.create('div', { class: 'item' }, [
        elementUtils.create('span', { class: 'no-data' }, `暂无相关数据`),
      ]));
    }
    this.$el.appendChild(elementUtils.create('div', { class: 'project' }, [
      elementUtils.create('div', { class: 'title' }, `[${this.month}]分类${typeData.name}统计`),
      elementUtils.create('div', { class: 'list' }, els),
    ]));
  }

}