// 副作用函数，数据变化后重新可以执行
export function effect(fn, option?) {
  const _effect = new reactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();

  if (option) {
    Object.assign(_effect, option);
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; // 在runner方法上可以获取effect引用
  return runner; // 暴露给外界自己调用run方法
}

/**
 * 清理上一次effect
 * @param effect
 */
function preClearEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 防止多次收集同一个属性：比如state.name + state.name + state.name
}

/**
 * 清理多余的收集
 * @param effect
 */
function postClearEffect(effect) {
  // [flag,age,xx,xxx]
  // [flag] //   删除 age,xx,xxx
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depsLength;
  }
}

export let activeEffect = undefined;

class reactiveEffect {
  _trackId = 0; // 用于记录当前effect执行了几次
  deps = [];
  _depsLength = 0;
  // 防止 递归调用，记录函数是否在运行
  _running = 0;
  public active = true;
  /**
   *
   * @param fn 用户编写的函数
   * @param scheduler // 调度函数
   */
  constructor(public fn, public scheduler) {}

  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;

    try {
      activeEffect = this;
      // Effect重新执行，清理上一次的Effect.deps
      preClearEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postClearEffect(this);
      activeEffect = lastEffect;
    }
  }
}

function cleanDepEffect(oldDep, effect) {
  oldDep.delete(effect);
  if (oldDep.size === 0) {
    oldDep.cleanup();
  }
}

// 双向记录
export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
  }

  let oldDep = effect.deps[effect._depsLength];
  // 如果没有存过
  if (oldDep !== dep) {
    // 删除老的
    if (oldDep) {
      cleanDepEffect(oldDep, effect);
    }
    // 换新的
    effect.deps[effect._depsLength++] = dep;
  } else {
    effect._depsLength++;
  }

  // dep.set(effect, effect._trackId);
  // // effect 和 dep 反向关联 todo
  // effect.deps[effect._depsLength++] = dep;
}

// 执行页面更新
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (!effect._running) {
      if (effect.scheduler) {
        effect.scheduler();
      }
    }
  }
}
