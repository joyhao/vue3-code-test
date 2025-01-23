import { isObject } from '@vue/shared';
import { activeEffect } from './effect';
import { track, trigger } from './reactiveEffect';
import { reactive } from './reactive';

export enum reactiveFlags {
  IS_REACTIVE = '__jk_isReactive'
}

export const mutableHandle: ProxyHandler<any> = {
  // target 指定的代理对象
  // key 属性
  // value 属性值
  // receiver 代理对象
  get: (target, key, receiver) => {
    // 触发get方法 直接改写 IS_REACTIVE 结果
    if (key === reactiveFlags.IS_REACTIVE) {
      return true;
    }

    // 依赖收集
    track(target, key); // 收集这个对象=》读取的属性以及关联的effect
    // 例如收集以下effect
    //  effect(() => {
    //    console.log(state.age);
    //  })

    // 取值时，应该让响应式属性和effect(副作用函数)映射起来
    let res = Reflect.get(target, key, receiver); // 保证里面的属性选择器this 指向是 代理对象
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
    // 不安全 return target[key];
  },
  set: (target, key, value, receiver) => {
    // 设置值时，让effect函数重新运行

    // 界面更新

    // 不安全 target[key] = value;

    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);

    if (oldValue !== value) {
      // 触发页面更新
      trigger(target, key, value, oldValue);
    }

    return result; // 保证里面的属性选择器this 指向是 代理对象
  }
};
