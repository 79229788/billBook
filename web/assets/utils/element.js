import basicUtils from "./basic.js";
export default {
  /**
   * 创建元素
   * @param tag
   * @param attrs
   * @param child
   * @return {*}
   */
  create: function (tag, attrs = {}, child = []) {
    if(!basicUtils.isObject(attrs)) {
      child = attrs;
      attrs = {};
    }
    child = Array.isArray(child) ? child : [child];
    const dom = document.createElement(tag);
    for(const key in attrs || {}) {
      let value = attrs[key];
      if(key === 'on') {
        for(const k in value) {
          dom[`on${k}`] = value[k];
        }
      }else if(key === 'style' && basicUtils.isObject(value)) {
        for(const k in value) {
          dom.style[k] = String(value[k]);
        }
      }else if(value !== undefined) {
        if(basicUtils.isObject(value)) {
          value = JSON.stringify(value);
        }
        dom.setAttribute(key, value);
      }
    }
    child.forEach(node => {
      if(node === '') return;
      if(node === null) return;
      if(node === undefined) return;
      if(!(node instanceof HTMLElement)) {
        node = document.createTextNode(node.toString());
      }
      dom.appendChild(node);
    });
    return dom;
  }
}