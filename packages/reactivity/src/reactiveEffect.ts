import { activeEffect, trackEffect, triggerEffects } from './effect';

const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep: any = new Map();
  dep.cleanup = cleanup;
  dep.key = key;
  return dep;
};
export function track(target, key) {
  if (activeEffect) {
    // 第一层 整个对象
    let depMap = targetMap.get(target);
    if (!depMap) {
      depMap = new Map();
      targetMap.set(target, depMap);
    }
    // 第二层 属性
    let dep = depMap.get(key);
    if (!dep) {
      dep = createDep(() => depMap.delete(key), key); // 用于清理不需要的属性
      depMap.set(key, dep);
    }

    trackEffect(activeEffect, dep); // 把当前的Effect放入dep
  }
}

export function trigger(target, key, newValue, oldValue) {
  // 第一层 整个对象
  let depMap = targetMap.get(target);
  if (!depMap) {
    return; // 无需更新
  }
  // 第二层 属性
  let dep = depMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}

// effect(() => {
//   console.log(state.age, state.name);
// })
// effect(() => {
//   console.log(state.age);
// })
//  结构转换成如下
// {
//   {name:'jk',age:11}:{
//     name:{
//       effect,effect
//     },
//     age:{
//       effect
//     }
//   }
// }
