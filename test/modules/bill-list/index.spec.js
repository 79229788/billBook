import BillListController from '../../../web/modules/bill-list/index.js';
import BillListView from '../../../web/modules/bill-list/views/bill-list.js';
import { mockAjax, mockBillFormEditorOnCreate } from './mock';

mockAjax();
describe('modules: bill-list', () => {
  it(`instance:new BillListView('body') should mounted success`, () => {
    new BillListView(null, 'body');
    expect(!!document.querySelector('.bill-list')).to.equal(true);
  });

  it(`method:fetchListData() should exists models`, (done) => {
    const bc = new BillListController();
    bc.fetchListData(null, () => {
      expect(bc.billCateCollection.get(0).get('name')).to.equal('车贷');
      expect(bc.billCollection.get(0).get('amount')).to.equal(3000);
      expect(bc.billCollection.get(0).get('_yearMonth')).to.equal('2019-11');
      done();
    });
  });

  it(`method:onListenListData() should visible specified rows`, (done) => {
    const bc = new BillListController();
    bc.$el = 'body';
    bc.mounted();
    bc.fetchListData(null, () => {
      //test reset
      bc.onListenListData('reset', { models: [bc.billCollection.get(0)] });
      const $tableRow = document.querySelector('.bill-list .body table tr');
      expect(!!$tableRow).to.equal(true);
      expect($tableRow.querySelectorAll('td')[3].innerText).to.equal('3000');
      //test push
      bc.onListenListData('push', { model: bc.billCollection.get(1) });
      expect(document
        .querySelectorAll('.bill-list .body table tr')[1]
        .querySelectorAll('td')[3].innerText).to.equal('3900');
      //test unshift
      bc.onListenListData('unshift', { model: bc.billCollection.get(1) });
      expect(document
        .querySelectorAll('.bill-list .body table tr')[0]
        .querySelectorAll('td')[3].innerText).to.equal('3900');
      //test insert
      bc.onListenListData('insert', { model: bc.billCollection.get(0), index: 1 });
      expect(document
        .querySelectorAll('.bill-list .body table tr')[1]
        .querySelectorAll('td')[3].innerText).to.equal('3000');
      done();
    });
  });

  it('events:researchMonthData() should visible specified rows and statistics view', (done) => {
    const bc = new BillListController();
    bc.$el = 'body';
    bc.created();
    bc.mounted();
    setTimeout(() => {
      bc.researchMonthData('2019-11', '2019-11', () => {
        expect(document.querySelectorAll('.bill-list .body table tr').length).to.equal(1);
        expect(document.querySelectorAll('.bill-statistics .project').length).to.equal(3);
      });
      done();
    }, 1000);
  });

  it('events:onSearchData() should visible specified rows', (done) => {
    const bc = new BillListController();
    bc.$el = 'body';
    bc.created();
    bc.mounted();
    setTimeout(() => {
      bc.researchMonthData('2019-12', '2019-12', () => {
        expect(document.querySelectorAll('.bill-list .body table tr').length).to.equal(2);
        expect(document.querySelectorAll('.bill-statistics .project').length).to.equal(3);
        setTimeout(() => {
          bc.searchData.category = '8s0p77c323';
          bc.fetchListData('search', () => {
            expect(document.querySelectorAll('.bill-list .body table tr').length).to.equal(1);
            done();
          });
        }, 500);
      });
    }, 500);
  });

  it('events:onSortData() should visible specified order rows', (done) => {
    const bc = new BillListController();
    bc.$el = 'body';
    bc.created();
    bc.mounted();
    setTimeout(() => {
      bc.onSortData(null, 'amount', 'down', value => value);
      expect(document
        .querySelector('.bill-list .body table tr')
        .querySelectorAll('td')[3].innerText).to.equal('5400');
      done();
    }, 500);
  });

  //显示指定顺序的行
  it('events:onCreateListItem() should visible current created row', (done) => {
    const bc = new BillListController();
    bc.$el = 'body';
    bc.created();
    bc.mounted();
    setTimeout(() => {
      mockBillFormEditorOnCreate(bc);
      bc.onCreateListItem();
      expect(document
        .querySelector('.bill-list .body table tr')
        .querySelectorAll('td')[3].innerText).to.equal('3100');
      done();
    }, 500);
  });

})
