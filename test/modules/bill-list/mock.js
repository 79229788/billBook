import sinon from 'sinon';
import { MDBill } from '../../../web/assets/models/MDBill';

export function mockAjax () {
  sinon.stub(window, 'fetch')
    .callsFake((url) => {
      if(url === './assets/data/cate.json') {
        return Promise.resolve({
          json: () => {
            return [
              {
                "id": "1bcddudhmh",
                "type": 0,
                "name": "车贷"
              },
              {
                "id": "8s0p77c323",
                "type": 0,
                "name": "房贷"
              },
              {
                "id": "3tqndrjqgrg",
                "type": 0,
                "name": "日常饮食"
              },
            ]
          }
        })
      }
      if(url === './assets/data/bill.json') {
        return Promise.resolve({
          json: () => {
            return [
              {
                "type": 0,
                "time": 1574870400000,
                "category": "1bcddudhmh",
                "amount": 3000
              },
              {
                "type": 0,
                "time": 1577548800000,
                "category": "8s0p77c323",
                "amount": 5400
              },
              {
                "type": 0,
                "time": 1577345789527,
                "category": "3tqndrjqgrg",
                "amount": 3900
              },
            ]
          }
        })
      }
    });
}
/**
 * 模拟账单编辑器创建动作
 * @param controller
 */
export function mockBillFormEditorOnCreate(controller) {
  sinon.stub(controller.billFormEditor, 'show')
    .callsFake((data) => {
      data.onCreate(new MDBill({
        "type": 0,
        "time": 1574870300000,
        "category": "1bcddudhmh",
        "amount": 3100
      }));
    })
}
