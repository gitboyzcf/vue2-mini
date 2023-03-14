import { ArrayMethods } from "./array"; // ==== 15 -》./array.js

class Observe {
  constructor(data) {

    // ========！！！
    // 对每个对象添加Observe实例
    Object.defineProperty(data,'__ob__',{
      enumerable: false, // 不允许枚举（遍历）
      value:this
    })
    // =======


    // 判断是否为数组对数组进行操作  ==== 11
    if (Array.isArray(data)) {
      // 将数组对象的原型指向新创建的对象 // ==== 20
      data.__proto__ = ArrayMethods;
      // 如果是数组对象 再次给对象进行响应拦截处理[{a:1}]
      this.observeArray(data)

    } else {
      // 循环对象中的属性进行defineProperty劫持 ==== 12
      this.walk(data);
    }
  }
  // 定义循环对属性依次进行劫持
  walk(data) {
    // “重新定义”属性 ——性能消耗 ==== 13
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }

  // 处理数组对象 [{a:123}] （遍历数组中的每一个对象进行数据劫持） ==== 21 （15 - 21 是对数组方法以及数组对象的劫持）去往-》./array.js看感叹号处
  observeArray(data){
    for(let i = 0; i < data.length; i++){
      observe(data[i]);
    }
  }
}

// 公共响应式拦截  
export function defineReactive(target, key, value) {
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

  Object.defineProperty(target, key, {  // ==== 14 (1 - 14  为data数据对象劫持，数组的劫持在上面👆从15开始)
    // 属性劫持
    get() {
      // 取值走get
      return value;
    },
    set(newValue) {
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
    },
  });
}

export function observe(data) {
  // 判断data是否为对象 ==== 9
  if (typeof data !== "object" || data == null) {
    return; //只对对象进行劫持
  }

  // 创建劫持对象
  return new Observe(data); // ==== 10
}
