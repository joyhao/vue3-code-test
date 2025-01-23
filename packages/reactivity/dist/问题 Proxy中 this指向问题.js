// 问题 Proxy中 this指向问题
//  Reflect.get(target, key, receiver)  // 打印的this Proxy(Object) {name: 'jk', aliasName: <accessor>}
// target[key] // 打印的this {name: 'jk', aliasName: <accessor>}

const person = {
  name: 'jk',
  get aliasName() {
    console.log(this);
    return this.name + 'js';
  }
};

const p = new Proxy(person, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver); // 等价于  receiver[key]  但是receiver[key]会死循环;
  }
});

console.log(p.aliasName);
