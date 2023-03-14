//获取原来的数组方法 ==== 16
let oldArrayProtoMethods = Array.prototype;

// 创建新对象并用原型链方式将新对象继承Array原型 ==== 17
let ArrayMethods = Object.create(oldArrayProtoMethods);

// 定义劫持的方法 ——当data中的数组调用下面任意方法时 可拦截操作
let methods = ["push", "pop", "unshift", "shift", "splice"];

// 在新对象中添加劫持的方法 ==== 18
methods.forEach((item) => {
  ArrayMethods[item] = function (...args) {
    // 做劫持操作...
    console.log("数组劫持",this);
    
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
    let result = oldArrayProtoMethods[item].apply(this, args);

    // ====== 此处是解决当使用push添加为对象时为对象进行劫持 先不看 根据序号引导走！！！  ======
    
    let ob = this.__ob__ //Observer实例对象  __ob__此属性的添加请看 -》./index.js 的感叹号标记（细品this指向）
    let inserted; // 参数
    switch (item) {//判断是否为调用添加数组方法
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if(inserted){
      ob.observeArray(inserted) // 对数组添加的对象进行数据劫持
    }
    //======
    return result;
  };
});

export { ArrayMethods }; // ==== 19 -》./index.js
