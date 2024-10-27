import { Component, _decorator, Node, easing, Vec3, v3, Enum } from 'cc';
import { PasrTimer } from '../../misc/PasrTimer';
import { EaseType } from './EaseType';
import UIBaseAnim from './UIBaseAnim';
let { ccclass, property, menu } = _decorator;
@ccclass('PositionAnim')
@menu('qanim/PositionAnim')
export default class PositionAnim extends UIBaseAnim {
  @property(Vec3)
  from: Vec3 = v3();

  @property(Vec3)
  to: Vec3 = v3();

  @property
  useWorld: boolean = false;

  tmp_vec3: Vec3 = v3();

  onTick(t: any) {
    if (!this.useWorld) {
      this.node.position = Vec3.lerp(this.tmp_vec3, this.from, this.to, t);
    } else {
      this.node.worldPosition = Vec3.lerp(this.tmp_vec3, this.from, this.to, t);
    }
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
