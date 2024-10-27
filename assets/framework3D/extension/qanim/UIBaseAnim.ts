import { Component, Enum, easing, Vec3, math, _decorator } from 'cc';
import { Signal } from '../../core/Signal';
import { PasrTimer } from '../../misc/PasrTimer';
import { EaseType } from './EaseType';

const { ccclass, property } = _decorator;

@ccclass
export default class UIBaseAnim extends Component {
  pasr: PasrTimer = new PasrTimer(0, 0, 0, 0);
  @property({ type: Enum(EaseType) })
  easeType: EaseType = EaseType.linear;

  onFinish: Signal = new Signal();

  set duration(v) {
    this.pasr.a = v;
  }

  onFinished() {
    this.enabled = false;
  }

  onLoad() {
    this.onFinish.add(this.onFinished, this);
  }

  onDestroy() {
    this.onFinish.remove(this.onFinished, this);
  }

  start() {}

  play() {
    this.enabled = true;
    this.pasr.reset();
    return this.onFinish.wait();
  }

  update(dt) {
    if (!this.pasr.isFinished()) {
      let t = this.pasr.Tick(dt);
      if (this.pasr.isFinished()) {
        this.onFinish.fire();
        return;
      }
      let f = easing[EaseType[this.easeType]];
      t = f(t);
      this.onTick(t);
    }
  }

  onTick(t) {}
}
