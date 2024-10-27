import { Component, _decorator, Node, easing, Vec3, v3, Enum } from 'cc';
import { PasrTimer } from '../../misc/PasrTimer';
import { EaseType } from './EaseType';
import UIBaseAnim from './UIBaseAnim';
let { ccclass, property, menu } = _decorator;
@ccclass('ScaleAnim')
@menu('qanim/ScaleAnim')
export default class ScaleAnim extends UIBaseAnim {
  @property(Vec3)
  from: Vec3 = Vec3.ZERO;

  @property(Vec3)
  to: Vec3 = Vec3.ZERO;

  tmp_scale: Vec3 = v3();

  onTick(t: any) {
    this.node.scale = Vec3.lerp(this.tmp_scale, this.from, this.to, t);
  }

  start() {
    this.pasr.reset();
  }

  play() {
    return super.play();
  }

  onEnable() {
    if (this.pasr) this.pasr.reset();
  }

  onDisable() {}
}
