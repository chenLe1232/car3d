export class Signal {
  allReceivers: { c: any; t: any }[] = [];

  constructor(c?: any, t?: any) {}

  add(c: Function, t?: any) {
    let receiver = this.allReceivers.find(v => v.c == c && v.t == t);
    if (!receiver) this.allReceivers.push({ c, t });
  }

  remove(c: Function, t?: any) {
    this.allReceivers = this.allReceivers.filter(v => v.c != c && v.t != t);
  }

  fire(...ps: any) {
    for (var i = 0; i < this.allReceivers.length; i++) {
      let v = this.allReceivers[i];
      if (v.c) v.c.call(v.t, ...ps);
      else console.warn('not found callback ', v.c, v.t);
    }
  }

  on(c: Function, t?: any) {
    this.remove(c, t);
    this.add(c, t);
  }
  off(c: Function, t?: any) {
    this.remove(c, t);
  }

  clear() {
    this.allReceivers.splice(0);
  }

  once(callback: any) {
    let h = () => {
      this.remove(h);
      callback && callback();
    };
    this.add(h);
  }

  wait() {
    return new Promise((resolve, reject) => {
      this.once(resolve);
    });
  }
}
