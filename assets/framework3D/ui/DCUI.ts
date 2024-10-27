import { _decorator, Component, Node } from 'cc';
import DataCenter from '../core/DataCenter';
import { evt } from '../core/EventManager';
const { ccclass, property } = _decorator;

@ccclass
export default class DCUI extends Component {
  @property()
  dataBind: string = '';
  onLoad() {}

  setDCKey(k) {
    this.dataBind = k;
    this.setListener();
  }

  private setListener() {
    DataCenter.off(this.dataBind, this.dataChanged, this);
    DataCenter.on(this.dataBind, this.dataChanged, this);
  }

  onValueChanged(v) {}

  setDCValue(v) {
    DataCenter.set(this.dataBind, v);
  }

  dataChanged(v, old): any {
    this.onValueChanged(v);
  }

  onEnable() {
    this.setListener();
    this.onValueChanged(DataCenter.get(this.dataBind));
  }

  onDisable() {
    DataCenter.off(this.dataBind, this.dataChanged, this);
  }

  onDestroy() {
    // DataCenter.off(this)
    evt.off(this);
  }
}
