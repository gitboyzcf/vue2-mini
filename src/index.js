import { initMixin } from "./init";

// vue构造函数 
function Vue(options) {
  this._init(options) // ==== 1
}

initMixin(Vue); //_init 在此进入 -》./init.js
// ...

export default Vue;
