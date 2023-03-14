import { observe } from "./observe/index";

export function initState(vm) {
  // 得到选项（data、methods、watch ...） ==== 4
  const opts = vm.$options;
  // 是否有data选项 
  if (opts.data) {
    initData(vm); // ==== 5
  }
  // ...
}

function proxy(vm, target,key){
  // 将data中的属性代理一份放到vm下
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key];
    },
    set(newValue){
      vm[target][key] = newValue;
    }
  })
}

function initData(vm) {  // 处理data数据 ==== 6
  // 得到data选项
  let data = vm.$options.data;
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
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  //=====
}
