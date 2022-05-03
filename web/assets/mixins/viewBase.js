export default class ViewBase {
  $el = undefined
  controller = undefined
  events = {}
  sources = {}
  getSources = () => {
    return this.sources;
  }
  constructor(controller, el) {
    this.controller = controller;
  }
  /**
   * 监听数据源
   * @param data
   * @return {*}
   */
  onSources(data) {
    if(typeof data === 'function') {
      this.getSources = () => Object.assign(this.sources, data());
      return;
    }
    this.getSources = () => Object.assign(this.sources, data);
  }
  /**
   * 监听事件
   * @param events
   */
  onEvents(events) {
    for(const key in events) {
      events[key] = events[key].bind(this.controller);
    }
    this.events = Object.assign(this.events, events);
  }
}