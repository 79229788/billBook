export class MDObject {
  attributes = {}
  validators = {}
  constructor(data) {
    if(data instanceof MDObject) data = data.toObject();
    if(typeof data === 'string') data = JSON.parse(data);
    this.set(data);
    if(typeof this.compute === 'function') this.compute();
  }
  /**
   * 获取属性
   * @param key
   * @return {*}
   */
  get(key) {
    return this.attributes[key];
  }
  /**
   * 设置属性
   * @param key
   * @param value
   */
  set(key, value) {
    if(!key) return this;
    if(Object.prototype.toString.call(key) === '[object Object]') {
      for(const k in key) {
        this.set(k, key[k]);
      }
      return this;
    }
    this.attributes[key] = value;
    return this;
  }
  /**
   * 获取原始对象
   * @return {{}}
   */
  toObject() {
    return this.attributes;
  }
  /**
   * 拷贝模型
   * @return {any}
   */
  clone() {
    return new this.constructor(JSON.parse(JSON.stringify(this.attributes)));
  }
  /**
   * 验证对象
   * 简单验证存在性，不做深入，一般使用成品的验证库
   * @param name
   * @return {Promise<Boolean>}
   */
  validate(name) {
    if(!this.validators[name]) {
      throw Error(`${name} rule not found`);
    }
    return new Promise((ok, no) => {
      const missing = [];
      for(const key in this.validators[name]) {
        const value = this.get(key);
        const rule = this.validators[name][key];
        if(rule.required) {
          if(rule.type === 'string' && !value) {
            missing.push({ key, message: rule.message });
          }
          if(rule.type === 'number' && value !== 0 && !value) {
            missing.push({ key, message: rule.message });
          }
          if(rule.type === 'boolean' && [true, false].indexOf(value) < 0) {
            missing.push({ key, message: rule.message });
          }
          if(rule.type === 'array' && (!value || value.length === 0)) {
            missing.push({ key, message: rule.message });
          }
        }
      }
      if(missing.length > 0) return no({ missing });
      ok();
    });
  }
}

export class MCObject {
  model = MDObject
  models = []
  originalModels = []
  searchData = null
  searchModes = null
  listenerFn = (action, data) => {}
  /**
   * 获取模型
   * @param index
   * @return {*}
   */
  get(index) {
    return this.models[index];
  }
  /**
   * 获取最后一个
   * @return {*}
   */
  getLast() {
    return this.models.slice(-1)[0];
  }
  /**
   * 获取模型集合
   * @return {*[]}
   */
  getModels() {
    return this.models;
  }
  /**
   * 获取搜索数据
   * @return {null}
   */
  getSearchData() {
    return this.searchData;
  }
  /**
   * 获取原始模型集合
   * @return {*[]}
   */
  getOriginalModes() {
    return this.originalModels;
  }
  /**
   * 拷贝模型集合
   * @return {*[]}
   */
  cloneModes(models) {
    const cloneModels = [];
    (models || this.models).forEach(model => {
      cloneModels.push(new this.model(model).clone());
    });
    return cloneModels;
  }
  /**
   * 从前面添加模型
   * @param data
   * @return {*[]}
   */
  unshift(data) {
    const model = new this.model(data);
    this.models.unshift(model);
    this.originalModels.unshift(model);
    this.listenerFn('unshift', { model });
    return this.models;
  }
  /**
   * 从末尾添加模型
   * @param data
   * @return {*[]}
   */
  push(data) {
    const model = new this.model(data);
    this.models.push(model);
    this.originalModels.push(model);
    this.listenerFn('push', { model });
    return this.models;
  }
  /**
   * 插入模型
   * @param data
   * @param index
   * @param sortFn
   */
  insert(data, index = 0, sortFn) {
    const model = new this.model(data);
    if(typeof index === 'function') {
      sortFn = index;
      index = 0;
    }
    if(typeof sortFn === 'function') {
      for(const oldModel of this.models) {
        if(sortFn(model, oldModel)) break;
        index ++;
      }
    }
    this.models.splice(index, 0, model);
    this.originalModels.splice(index, 0, model);
    this.listenerFn('insert', { model, index });
  }
  /**
   * 设置模型集合
   * @param models
   */
  setModes(models, resetOriginalModels) {
    this.models = models;
    if(resetOriginalModels) this.originalModels = this.cloneModes();
    this.listenerFn('reset', { models });
    return this;
  }
  /**
   * 遍历模式集合
   * @param args
   * @return {*}
   */
  each(...args) {
    this.models.forEach(...args);
    return this;
  }
  /**
   * 网络取出数据
   * @param options
   * @return {Promise<*>}
   */
  fetch(options) {
    const params = Object.assign({
      url: null,
      sortFn: null,
      map: model => model,
    }, options);
    return fetch(
      params.url,
    ).then(response => {
      return response.json();
    }).then(data => {
      data = data.map(item => {
        return params.map(new this.model(item));
      });
      if(params.sortFn) data = data.sort(params.sortFn);
      return Promise.resolve(data);
    }).then(data => {
      this.setModes(data, true);
      return Promise.resolve(this);
    });
  }
  /**
   * 搜索数据
   * @param data
   * @param sortFn
   * @return {MCObject}
   */
  search(data, sortFn) {
    let models = this.cloneModes(this.originalModels)
      .filter(model => {
        const conditions = [];
        for(const key in data) {
          const value = data[key];
          if(value === null || value === undefined || value === '') {
            continue;
          }
          conditions.push(value === model.get(key));
        }
        if(conditions.length === 0) conditions.push(true);
        return conditions.indexOf(false) < 0;
      })
    if(typeof sortFn === 'function') models = models.sort(sortFn);
    this.searchData = data;
    this.setModes(models, false);
    return this;
  }
  /**
   * 模型进行排序
   * @param fn
   * @return {MCObject}
   */
  sort(fn) {
    this.setModes(this.models.sort(fn), false);
    return this;
  }
  /**
   * 监听模型变化
   * @param cb
   */
  listener(cb) {
    this.listenerFn = cb;
  }
}