import { Component, _decorator, Node } from 'cc';
import { Signal } from '../../core/Signal';
let { ccclass, property } = _decorator;
@ccclass
export default class UIConfirm extends Component {
  closeSignal: Signal = new Signal();
  data: any = null;

  onLoad() {}
  start() {}

  onShown(data, callback, target) {
    this.data = data;
    this.closeSignal.on(callback, target);
  }

  onHidden() {
    this.closeSignal.fire();
  }
}
