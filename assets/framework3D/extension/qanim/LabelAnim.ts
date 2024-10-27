import { _decorator, Component, easing, Enum, math, LabelComponent } from 'cc';
import { PasrTimer } from '../../misc/PasrTimer';
import { EaseType } from './EaseType';

import UIBaseAnim from './UIBaseAnim';

const { ccclass, property } = _decorator;

@ccclass
export default class LabelAnim extends UIBaseAnim {
  from: number = 0;
  to: number = 0;
  label: LabelComponent = null;

  isFormat: boolean = false;
  onLoad() {
    this.label = this.getComponent(LabelComponent);
  }

  start() {}

  play(duration: number = 0, from: number = 0, to: number = 0, format = false) {
    this.from = from;
    this.to = to;
    this.duration = duration || this.duration;
    this.pasr.reset();
    this.isFormat = format;
    return this.onFinish.wait();
  }

  onTick(t) {
    let v = math.lerp(this.from, this.to, t);
    if (this.isFormat) {
      this.label.string = Math.floor(v).toUnitString();
    } else {
      this.label.string = v.toFixed(2);
    }
  }
}
