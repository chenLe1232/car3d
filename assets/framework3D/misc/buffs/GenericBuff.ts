import { Component, _decorator, Node, TERRAIN_HEIGHT_BASE } from 'cc';
import Buff from './Buff';
import DataCenter from '../../core/DataCenter';
let { ccclass, property } = _decorator;
export interface GenericBuffConfig {
  dcInstance?: DataCenter;
  dcField?: string;
  offline?: boolean;
  onEnable?: Function;
  onRecovery?: Function;
  onDisable?: Function;
  onStep?: Function;
}
@ccclass
export default class GenericBuff extends Buff {
  get dcInstance(): DataCenter {
    return this.data.dcInstance;
  }

  get dcField(): string {
    return this.data.dcField;
  }

  /** 是否计算离线时间  */
  get countOffline(): boolean {
    return this.data.offline;
  }

  onEnabled() {
    let func = this.data.onEnable;
    if (func) {
      func.call(this);
    }
  }

  onRecovery() {
    let func = this.data.onRecovery;
    if (func) {
      func.call(this);
    }
  }

  onDisabled() {
    let func = this.data.onDisable;
    if (func) {
      func.call(this);
    }
  }

  step() {
    let func = this.data.onStep;
    if (func) {
      func.call(this);
    }
  }

  onTimeLeftChanged() {
    if (this.dcInstance) this.dcInstance.setData(this.dcField, this.timeLeft);
  }

  save() {
    if (this.dcInstance) this.dcInstance.save(this.dcField);
  }

  load(offset) {
    if (this.dcInstance) {
      this.timeLeft = this.dcInstance.getData(this.dcField);
      if (this.countOffline) {
        this.timeLeft -= offset;
      }
    }
  }
}
