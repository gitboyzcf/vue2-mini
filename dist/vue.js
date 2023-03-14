function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

//获取原来的数组方法 ==== 16
var oldArrayProtoMethods = Array.prototype;

// 创建新对象并用原型链方式将新对象继承Array原型 ==== 17
var ArrayMethods = Object.create(oldArrayProtoMethods);

// 定义劫持的方法 ——当data中的数组调用下面任意方法时 可拦截操作
var methods = ["push", "pop", "unshift", "shift", "splice"];

// 在新对象中添加劫持的方法 ==== 18
methods.forEach(function (item) {
  ArrayMethods[item] = function () {
    // 做劫持操作...
    console.log("数组劫持", this);

    /**
     * 当前的this指向调用着（例如下面代码 this指向 test对应的值）
     * data(){
     *  return {
     *    test:[{a:123}]
     *  }
     * }
     * test.push({b:456})
     * 
     * args 输出[{b:456}]
     */

    // 使用原生数组方法
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var result = oldArrayProtoMethods[item].apply(this, args);

    // ====== 此处是解决当使用push添加为对象时为对象进行劫持 先不看 根据序号引导走！！！  ======

    var ob = this.__ob__; //Observer实例对象  __ob__此属性的添加请看 -》./index.js 的感叹号标记（细品this指向）
    var inserted; // 参数
    switch (item) {
      //判断是否为调用添加数组方法
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      ob.observeArray(inserted); // 对数组添加的对象进行数据劫持
    }
    //======
    return result;
  };
});
 // ==== 19 -》./index.js

var Observe = /*#__PURE__*/function () {
  function Observe(data) {
    _classCallCheck(this, Observe);
    // ========！！！
    // 对每个对象添加Observe实例
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      // 不允许枚举（遍历）
      value: this
    });
    // =======

    // 判断是否为数组对数组进行操作  ==== 11
    if (Array.isArray(data)) {
      // 将数组对象的原型指向新创建的对象 // ==== 20
      data.__proto__ = ArrayMethods;
      // 如果是数组对象 再次给对象进行响应拦截处理[{a:1}]
      this.observeArray(data);
    } else {
      // 循环对象中的属性进行defineProperty劫持 ==== 12
      this.walk(data);
    }
  }
  // 定义循环对属性依次进行劫持
  _createClass(Observe, [{
    key: "walk",
    value: function walk(data) {
      // “重新定义”属性 ——性能消耗 ==== 13
      Object.keys(data).forEach(function (key) {
        return defineReactive(data, key, data[key]);
      });
    }

    // 处理数组对象 [{a:123}] （遍历数组中的每一个对象进行数据劫持） ==== 21 （15 - 21 是对数组方法以及数组对象的劫持）去往-》./array.js看感叹号处
  }, {
    key: "observeArray",
    value: function observeArray(data) {
      for (var i = 0; i < data.length; i++) {
        observe(data[i]);
      }
    }
  }]);
  return Observe;
}(); // 公共响应式拦截  
function defineReactive(target, key, value) {
  // 如果data中的属性还是对象递归代理
  /**
   * 为何在此递归？（当默认data中属性值为对象时进行深层劫持变为响应式）
   * data(){
   *  return{
   *    test:{
   *      a:123
   *    }
   *  }
   * }
   * 
   */
  observe(value);
  Object.defineProperty(target, key, {
    // ==== 14 (1 - 14  为data数据对象劫持，数组的劫持在上面👆从15开始)
    // 属性劫持
    get: function get() {
      // 取值走get
      return value;
    },
    set: function set(newValue) {
      // 修改值走set
      // 判断值是否一致
      if (newValue === value) return;
      /**
       * 为何在此递归？(当赋值为对象时，再次将对象中的属性进行劫持变为响应式)
       * data(){
       *  return{
       *    test:1
       *  }
       * }
       * 
       * this.test = {a:123}
       * 
       */
      observe(newValue);
      value = newValue;
    }
  });
}
function observe(data) {
  // 判断data是否为对象 ==== 9
  if (_typeof(data) !== "object" || data == null) {
    return; //只对对象进行劫持
  }

  // 创建劫持对象
  return new Observe(data); // ==== 10
}

function initState(vm) {
  // 得到选项（data、methods、watch ...） ==== 4
  var opts = vm.$options;
  // 是否有data选项 
  if (opts.data) {
    initData(vm); // ==== 5
  }
  // ...
}

function proxy(vm, target, key) {
  // 将data中的属性代理一份放到vm下 ==== 9
  Object.defineProperty(vm, key, {
    get: function get() {
      return vm[target][key];
    },
    set: function set(newValue) {
      vm[target][key] = newValue;
    }
  });
}
function initData(vm) {
  // 处理data数据 ==== 6
  // 得到data选项
  var data = vm.$options.data;
  // 判断data是否为方法（如果是data选项是个方法 就调用此方法并改变this指向为 当前vue实例） ==== 7
  data = typeof data === "function" ? data.call(vm) : data;
  // console.log(data);

  vm._data = data;

  // 数据劫持 ==== 8  -》./observe/index.js
  observe(data);

  //============== 此部分先不看 根据序号引导来看 
  // 为了方便是vm直接获取_data中的属性 再次代理
  /**
   * data(){
   *   return {
   *      test:1
   *    }
   * }
   * this.test 或者  vm.test
   */
  for (var key in data) {
    proxy(vm, "_data", key);
  }
  //=====
}

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this; // this 当前vue实例对象

    //将传入的选项放到vue示例上 ==== 2
    vm.$options = options;

    // 初始化状态 ==== 3 -》./state.js
    initState(vm);
  };
}

// vue构造函数 
function Vue(options) {
  this._init(options); // ==== 1
}

initMixin(Vue); //_init 在此进入 -》./init.js

export { Vue as default };
//# sourceMappingURL=vue.js.map
