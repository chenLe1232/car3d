import { evt } from '../core/EventManager';
import { game } from 'cc';
interface FieldOption {
  propertyName: any; // 字段名
  persistent: boolean; //是否持久化，
  enumerable: any; //是否可遍历，false时  toString()不会输出该字段到JSON
  readonly: boolean; //不可以给该字段设置值，只可读取
}

const all_class_fields: { [index: string]: FieldOption[] } = {};

const all_registed_class = {};
export function dc(name, serializable = true): Function {
  return function (target: any) {
    // target.endRegister(name);
    // let proto: any = target['prototype'].constructor;
    // let cls = all_class_properties[proto]
    all_registed_class[target] = { name, serializable };
  };
}
export function field(obj?: {
  default?: any;
  persistent?: boolean;
  enumerable?: boolean;
  readonly?: boolean;
}) {
  return function (target: any, propertyName: string) {
    // target.register(propertyName,target[propertyName])
    let constructor = target.constructor;
    let fields = all_class_fields[constructor];
    if (fields == null) {
      fields = [];
      all_class_fields[constructor] = fields;
    }
    obj = obj || {};
    if (obj) {
      //set default properties
      obj.persistent = obj.persistent == null ? true : obj.persistent;
      obj.enumerable = obj.enumerable == null ? true : obj.enumerable;
      obj.readonly = obj.readonly || false;
      if (obj.default) target[propertyName] = obj.default;
    }
    let filed = {
      propertyName,
      persistent: obj.persistent,
      enumerable: obj.enumerable,
      readonly: obj.readonly,
    } as FieldOption;
    fields.push(filed);
  };
}

export default class DataCenter {
  private __namespace: string = 'DataCenter';
  static alldata = {};
  private kvs = {};
  private kts = {};
  private defaultKvs = {};
  private kOptions: { [index: string]: FieldOption } = {};
  constructor() {
    this.kvs = {};
    this.kts = {};
  }
  ///保存时间
  save_timestamps: number = 0;

  toFormData() {
    let postData = this.allkeys.map(key => `${key}=${this.kvs[key]}`).join('&');
    return postData;
  }

  get allkeys() {
    return Object.keys(this.kvs);
  }

  public defaultValue(key) {
    return this.defaultKvs[key];
  }

  public resetValue(key) {
    // this.kvs[k] = a[k]
    this.setData(key, this.defaultKvs[key]);
  }

  private registerFields(namespace?) {
    let target = this['__proto__'].constructor;
    let fields = all_class_fields[target];
    let cfg = all_registed_class[target];
    // let proto:any = target['prototype'];
    for (var i in fields) {
      let f = fields[i];
      let k = f.propertyName;
      this.kOptions[k] = f;
      if (typeof k == 'function') continue;
      this.register(k, this[k]);
      delete this[k]; //删除默认属性 ,否则设置 setter getter 会失效
    }

    this.kOptions['save_timestamps'] = {
      propertyName: 'save_timestamps',
      persistent: true,
      enumerable: true,
      readonly: false,
    };
    this.register('save_timestamps', 0);
    delete this['save_timestamps'];

    namespace = namespace || cfg.name;
    this.endRegister(namespace, cfg.serializable);
  }

  register(k, defaultValue) {
    let proto: any = this.constructor['prototype'];
    let self = this;
    proto.__defineGetter__(k, function () {
      return self.getData(k);
    });
    proto.__defineSetter__(k, function (s) {
      self.setData(k, s);
    });
    this.defaultKvs[k] = defaultValue;
    let option = this.kOptions[k];
    Object.defineProperty(this.kvs, k, {
      value: defaultValue,
      enumerable: option.enumerable,
      writable: true,
    });
    let type = '';
    type = typeof defaultValue;
    if (type == 'object') {
      if (Array.isArray(defaultValue)) {
        type = 'array';
      }
    }
    this.kts[k] = type;
    console.log(
      '[DataCenter] register :' + k + ':' + defaultValue + '(' + type + ')'
    );
  }

  /**
   * setData 会发消息
   * setValue 强制改变该字段 值
   */
  setValue(k, v) {
    this.kvs[k] = v;
  }

  setData(k, nv) {
    let v = this.kvs[k];
    if (v == nv) return;
    let kOption = this.kOptions[k];
    if (kOption.readonly) return;
    let type = this.kts[k];
    let kk = this._field_(k);
    if (type != typeof nv) {
      if (type == 'number') {
        console.warn(
          '[DataCenter] wrong type <' +
            typeof nv +
            '> for :' +
            kk +
            '<' +
            type +
            '> ,converting...'
        );
        if (nv == null) {
          nv = 0;
        } else {
          nv = Number(nv);
        }
      } else if (type == 'boolean') {
        console.warn(
          '[DataCenter] wrong type <' +
            typeof nv +
            '> for :' +
            kk +
            '<' +
            type +
            '> ,converting...'
        );
        nv = nv == 'true' ? true : false;
      } else if (type == 'object') {
        console.warn(
          '[DataCenter] wrong type <' +
            typeof nv +
            '> for :' +
            kk +
            '<' +
            type +
            '> ,converting...'
        );
        nv = (nv && this.parseJson(nv)) || {};
      } else if (type == 'array' && Array.isArray(nv)) {
        nv = nv;
      }
    }
    this.kvs[k] = nv;
    // if (!cc.sys.isMobile) console.log("[DataCenter] onValueChanged", kk, nv);
    evt.emit(kk, nv, v);
  }

  private _field_(k) {
    return this.__namespace + '.' + k;
  }

  getData(k) {
    return this.kvs[k];
  }

  limit(v, min, max) {
    if (v > max) {
      return max;
    } else if (v < min) {
      return 0;
    } else {
      return v;
    }
  }

  addData(k, c, autosave = false) {
    c = Number(c);
    if (c == null) return;
    let v = this.kvs[k];
    let nv = Number(v) + c;
    this.kvs[k] = nv;
    evt.emit(this._field_(k), nv, v);
    if (autosave) this.save(k);
  }

  onLoad(field_name) {}
  onLoadAll() {}
  onBeforeSave(field_name) {}
  onAfterSave(field_name) {}
  onBeforeSaveAll() {}
  onAfterSaveAll() {}

  private load() {
    for (var k in this.kvs) {
      let fromstroage = localStorage.getItem(this._field_(k));
      let v: any = fromstroage;
      if (fromstroage) {
        let type = this.kts[k];
        if (type == 'number') {
          v = Number(fromstroage);
        } else if (type == 'boolean') {
          v = fromstroage == 'true' ? true : false;
        } else if (type == 'object' || type == 'array') {
          v = this.parseJson(fromstroage);
        }
      } else {
        v = this.getData(k);
      }
      this.kvs[k] = v;
      this.onLoad(k);
    }
    this.onLoadAll();
  }

  private _saveAll() {
    this.save_timestamps = Date.now();
    for (var k in this.kvs) {
      let option = this.kOptions[k];
      //此字段不支持序列化
      if (option.persistent == false || option.readonly == true) {
        continue;
      }
      let v = this.kvs[k];
      let t = this.kts[k];
      let kk = this._field_(k);
      this.onBeforeSave(k);
      if (v != null) {
        if (t == 'object' || t == 'array') {
          localStorage.setItem(kk, JSON.stringify(v));
        } else {
          localStorage.setItem(kk, v.toString());
        }
      }
      this.onAfterSave(k);
      console.log(kk, v);
    }
  }

  /**
   * 保存数据
   * @param keys 需要保存的key[list]，如果为空 ，则保存全部字段
   */
  save(...keys) {
    console.log('[DataCenter] save :==================================');
    if (keys.length == 0) {
      this.onBeforeSaveAll();
      this._saveAll();
      this.onAfterSaveAll();
    } else {
      for (var i in keys) {
        let k = keys[i];
        let option = this.kOptions[k];
        //此字段不支持序列化
        if (option.persistent == false || option.readonly == true) {
          continue;
        }
        let v = this.kvs[k];
        let t = this.kts[k];
        let kk = this._field_(k);
        this.onBeforeSave(k);
        if (t == 'object' || t == 'array') {
          localStorage.setItem(kk, JSON.stringify(v));
        } else {
          if (v != null) {
            localStorage.setItem(kk, v.toString());
          } else {
            console.warn('[DataCenter] ' + kk + ' 保存失败');
          }
        }
        this.onAfterSave(k);
        console.log(kk, v);
      }
    }
    console.log('[DataCenter] save succ :==================================');
    // localStorage.setItem("#1_coin",this.getData("coin"));
  }

  toString() {
    let s = JSON.stringify(this.kvs, function (key, value) {
      if (typeof value == 'string') {
        let c = value.replace(/\\?\"/g, "'");
        return c;
      }
      return value;
    });
    console.log('dc.tostring:', s);
    return s;
  }

  loadFromJsonObject(a) {
    for (var k in this.kvs) {
      let v = a[k];
      if (v != null) {
        // this.setData(k, v)
        this.setValue(k, v);
        this.onLoad(k);
      }
    }
    this.onLoadAll();
  }

  loadFromString(s) {
    let a = JSON.parse(s);
    this.loadFromJsonObject(a);
  }

  resetAndSave(initValues?) {
    this.reset();
    for (var k in initValues) {
      this.setValue(k, initValues[k]);
    }
    this.save();
    return true;
  }

  reset() {
    for (var k in this.kvs) {
      // this.kvs[k] = a[k]
      this.setValue(k, this.defaultKvs[k]);
      this.onLoad(k);
    }
    this.onLoadAll();
  }

  parseJson(s) {
    try {
      let obj = JSON.parse(s.replace(/\\?\'/g, '"'));
      return obj;
    } catch (e) {
      return null;
    }
  }

  private endRegister(s, serializable = true) {
    this.__namespace = s;
    DataCenter.alldata[s] = this;
    if (serializable) {
      this.load();
      // this.save();
    }
  }

  static off(k, callback, target?) {
    evt.off(k, callback, target);
  }

  static on(k, callback, target?) {
    evt.on(k, callback, target);
    this.set(k, this.get(k));
  }

  static get(k) {
    let strs = k.split('.');
    let namespace = strs[0];
    let name = strs[1];
    let target = DataCenter.alldata[namespace];
    if (target) return target[name];
    else return null;
  }

  static set(k, v) {
    let strs = k.split('.');
    let namespace = strs[0];
    let name = strs[1];
    let target = DataCenter.alldata[namespace];
    if (target) {
      target[name] = v;
    }
  }

  static register(cls) {
    if (CC_EDITOR) return;
    let v = new cls();
    let d = all_registed_class[cls];
    // g.setGlobalInstance(v, d.name)
    window[d.name] = v;
    v.registerFields();
    return v;
  }
}
