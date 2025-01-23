import { isObject } from '@vue/shared';
import { mutableHandle, reactiveFlags } from './baseHandle';

// 用于记录代理对象(proxy)，可以复用代理对象
const reactiveMap = new WeakMap();

function createReactive(target) {
  if (!isObject(target)) {
    return target;
  }

  // 问题二:同一个对象嵌套调用reactive
  // 如果有IS_REACTIVE 说明此对象被代理过
  //  if (target[reactiveFlags.IS_REACTIVE]) {  此行会触发代理对象的get方法

  /**
   * 例如： 嵌套2次
   * 第一次target是普通对象不会触发get方法
   * 第二次target是代理对象会触发get方法， 在get中直接改写 IS_REACTIVE 结果，返回true
   *
   */
  if (target[reactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // 问题一: 同一个对象多次使用reactive造成的性能问题
  // 解决方案： 存缓存并复用缓存对象
  const exitsProxy = reactiveMap.get(target);
  if (exitsProxy) {
    return exitsProxy;
  }

  const proxy = new Proxy(target, mutableHandle);

  // 根据对象(target) 缓存 代理对象(proxy)
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactive(target);
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
