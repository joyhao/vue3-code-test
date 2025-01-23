import { toReactive } from './reactive';

function createRef(value) {
  return new RefImpl(value);
}

export function ref(value) {
  return createRef(value);
}

class RefImpl {
  __v_isRef = true; // ref标识
  _value; // 用来保存ref的值
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
    }
  }
}
