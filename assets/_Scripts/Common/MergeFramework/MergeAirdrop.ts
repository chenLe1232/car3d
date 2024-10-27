import {
  Component,
  _decorator,
  Node,
  v3,
  tween,
  ButtonComponent,
  Tween,
} from 'cc';
import display from '../../../framework3D/misc/display';
import { evt } from '../../../framework3D/core/EventManager';
import { MergeTypes } from './MergeTypes';
import MergeSystem from './MergeSystem';
let { ccclass, property } = _decorator;
@ccclass
export default class MergeAirdrop extends Component {
  @property(ButtonComponent)
  btn_get: ButtonComponent = null;

  @property()
  id: number = 0;

  _interval: number = 0;

  action: Tween = null;

  onLoad() {
    this.btn_get.node.on(Node.EventType.TOUCH_END, this.click_get, this);
  }

  start() {
    this.interval = MergeSystem.airdropSupplyInterval;
  }

  set interval(v) {
    this._interval = v;
    this.unschedule(this.onAirdrop);
    this.schedule(this.onAirdrop, v);
  }

  getAirdropFrom(y) {
    return v3(-this.node.width - display.hw, y, 0);
  }

  getAirdropTo(y) {
    return v3(this.node.width + display.hw, y, 0);
  }

  click_get() {
    evt.emit(MergeTypes.ClickAirdrop, this.id);
    this.goHome();
  }

  goHome() {
    this.node.position = this.getAirdropFrom(display.hh);
    if (this.action) this.action.stop();
  }

  onAirdrop() {
    this.goHome();
    let to = this.getAirdropTo(display.hh);
    this.action = tween(this.node).to(10, { position: to }).start();
  }
}
