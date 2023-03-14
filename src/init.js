import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this; // this 当前vue实例对象

    //将传入的选项放到vue示例上 ==== 2
    vm.$options = options;

    // 初始化状态 ==== 3 -》./state.js
    initState(vm);
  };
}

