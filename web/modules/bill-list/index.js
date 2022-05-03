import View from "./views/bill-list.js";
import ControllerBase from "../../assets/mixins/controllerBase.js";
import { MCBill } from "../../assets/models/MDBill.js";
import { MCBillCate } from "../../assets/models/MDBillCate.js";
import Dropdown from "../../assets/components/dropdown/index.js";
import BillFormEditor from "./components/bill-form-editor.js";
import BillStatistics from "./components/bill-statistics.js";

/**
 * 模块控制器
 */
export default class Controller extends ControllerBase {
  $el = document.querySelector('#app')
  $view = undefined
  cateIdMap = {}
  //搜索数据
  searchData = {}
  //月份选择器数据
  monthPickerData = []
  //分类选择器数据
  catePickerData = []
  //数据集合
  billCollection = new MCBill()
  billCateCollection = new MCBillCate()
  //组件模块
  billFormEditor = new BillFormEditor()
  billStatistics = new BillStatistics()
  constructor() {
    super(...arguments);
  }
  created() {
    this.fetchListData();
    this.billCollection.listener(this.onListenListData.bind(this));
  }
  mounted() {
    this.$view = new View(this, this.$el);
    this.$view.onSources(() => {
      return {
        catePickerData: this.catePickerData,
        cateIdMap: this.cateIdMap,
      }
    });
    this.$view.onEvents({
      onSearchData: this.onSearchData,
      onSortData: this.onSortData,
      onSearchTime: this.onSearchTime,
      onCreateListItem: this.onCreateListItem,
    });
    this.$view.renderListHeadView();
    this.$view.renderListFootView();
  }
  //********************内置方法
  //********************
  //**********取出列表数据
  fetchListData(action, cb) {
    if(action === 'search') {
      this.billCollection.search(this.searchData,
        (a, b) => a.get('time') - b.get('time'));
      if(typeof cb === 'function') cb();
      return;
    }
    this.billCateCollection.fetchList({
      map: (model) => {
        this.cateIdMap[model.get('id')] = model;
        return model;
      },
    }).then(() => {
      return this.billCollection.fetchList();
    }).then(collection => {
      this.monthPickerData = collection.getMonthPickerData();
      this.catePickerData = this.billCateCollection.getCatePickerData();
      if(typeof cb === 'function') cb();
    }).catch(error => {
      console.error('异常处理(略)', error);
    });
  }
  //**********重新搜索月份账单
  researchMonthData(name, value, cb) {
    this.searchData = {}; //重置搜索
    this.searchData._yearMonth = value;
    this.$view.$el.listHead.querySelector('.detail').innerHTML = `-- ${name} --`;
    this.fetchListData('search', () => {
      //重置分类选择器数据
      this.catePickerData = this.billCateCollection.getCatePickerData(this.billCollection.getCurrentCateIds());
      //更新统计视图
      if(!value) {
        this.billStatistics.clear();
      }else {
        this.billStatistics.update({
          el: this.$view.$el.billStatistics,
          billList: this.billCollection.getModels(),
          billCateIdMap: this.cateIdMap,
        });
      }
      if(typeof cb === 'function') cb();
    });
  }
  //**********提交创建数据
  submitCreateData(data) {
    const yearMonth = data.get('_yearMonth');
    //创建数据后先重置搜索
    this.researchMonthData(yearMonth, yearMonth, () => {
      //再根据排序位置进行插入
      this.billCollection.insert(data, (newItem, oldItem) => {
        return newItem.get('time') <= oldItem.get('time');
      });
      //重新更新统计视图
      this.billStatistics.update({
        el: this.$view.$el.billStatistics,
        billList: this.billCollection.getModels(),
        billCateIdMap: this.cateIdMap,
      });
    });
  }

  //********************事件操作
  //********************
  //**********监听列表数据
  onListenListData(action, data) {
    //***数据更新，渲染列表
    if(action === 'reset') {
      this.$view.renderListBodyRows(data.models);
      this.$view.$el.listBody.scrollTo(0, 0);
    }
    if(action === 'push') {
      this.$view.renderListBodyRows([data.model], { push: true, class: 'new-item' });
      this.monthPickerData = this.billCollection.getMonthPickerData();
      const $table = this.$view.$el.listBody.querySelector('table');
      this.$view.$el.listBody.scrollTo(0, $table.offsetHeight + 100);
    }
    if(action === 'unshift') {
      this.$view.renderListBodyRows([data.model], { unshift: true, class: 'new-item' });
      this.monthPickerData = this.billCollection.getMonthPickerData();
      this.$view.$el.listBody.scrollTo(0, 0);
    }
    if(action === 'insert') {
      this.$view.renderListBodyRows([data.model], { insert: data.index, class: 'new-item' });
      this.monthPickerData = this.billCollection.getMonthPickerData();
      const $first = this.$view.$el.listBody.querySelector('tr td') || {};
      this.$view.$el.listBody.scrollTo(0, data.index * ($first.offsetHeight || 0));
    }
  }
  //**********搜索时间
  onSearchTime(e) {
    this.timeDropdown = (this.timeDropdown || new Dropdown())
      .show({
        target: e.currentTarget || e.target,
        list: [{ name: '全部', value: undefined }].concat(this.monthPickerData),
        onSelect: (data) => {
          this.researchMonthData(data.name, data.value);
        }
      });
  }
  //**********搜索数据
  onSearchData(e, key, pickerData) {
    if(typeof pickerData === 'function') pickerData = pickerData();
    this[`${key}Dropdown`] = (this[`${key}Dropdown`] || new Dropdown())
      .show({
        target: e.currentTarget || e.target,
        list: [{ name: '全部', value: undefined }].concat(pickerData),
        onSelect: (data) => {
          this.searchData[key] = data.value;
          this.fetchListData('search');
        }
      });
  }
  //**********排序数据
  onSortData(e, key, direction, valueHandler) {
    this.billCollection.sort((current, next) => {
      const currentValue = valueHandler(current.get(key));
      const nextValue = valueHandler(next.get(key));
      if(direction === 'up') {
        if(currentValue < nextValue) return -1;
        if(currentValue > nextValue) return 1;
      }
      if(direction === 'down') {
        if(currentValue < nextValue) return 1;
        if(currentValue > nextValue) return -1;
      }
      return 0;
    })
  }
  //**********创建列表条目
  onCreateListItem() {
    this.billFormEditor.show({
      billCateList: this.billCateCollection.getModels(),
      onCreate: (data) => {
        data.set('_cateName', data.getCateName(this.cateIdMap));
        this.submitCreateData(data);
      }
    });
  }
}