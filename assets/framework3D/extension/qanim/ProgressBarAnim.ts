import { _decorator, Component, ProgressBarComponent, math } from 'cc';
import { PasrTimer } from '../../misc/PasrTimer';
import UIBaseAnim from './UIBaseAnim';

const { ccclass, property } = _decorator;

@ccclass
export default class ProgressBarAnim extends UIBaseAnim {
  bar: ProgressBarComponent = null;
  @property
  from: number = 0;
  @property
  to: number = 1;
  onLoad() {
    this.bar = this.getComponent(ProgressBarComponent);
  }
  start() {}

  onTick(t: any) {
    if (!this.bar) return;

    this.bar.progress = math.lerp(this.from, this.to, t);
  }

  doPlay(duration, from, to) {
    this.pasr.a = duration;
    this.from = from;
    this.to = to;
    return super.play();
  }
}
