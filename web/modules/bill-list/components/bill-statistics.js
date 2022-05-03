import View from "../views/bill-statistics.js";
import ControllerBase from "../../../assets/mixins/controllerBase.js";

export default class BillStatistics extends ControllerBase {
  /**
   * 更新视图
   * @param options
   */
  update(options) {
    this.options = Object.assign({
      el: null,
      billList: [],
      billCateIdMap: null,
    }, options);
    this.$view = this.$view || new View(this);
    this.$view.onSources({
      billCateIdMap: this.options.billCateIdMap
    });
    this.$view.update(this.options.el, this.options.billList);
  }
  /**
   * 清理视图
   * @param el
   */
  clear(el) {
    if(!this.$view) return;
    this.$view.update(this.$view.$el, []);
  }

}