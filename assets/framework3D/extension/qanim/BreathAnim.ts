import {
  Component,
  _decorator,
  Node,
  EasingMethod,
  easing,
  Vec3,
  v3,
  Enum,
  EasingMethodName,
} from 'cc';
import { PasrTimer } from '../../misc/PasrTimer';
import { EaseType } from './EaseType';
let { ccclass, property, menu } = _decorator;

// let EasingEnum = Enum(typeof (easing))

@ccclass('BreathAnim')
@menu('qanim/BreathAnim')
export default class BreathAnim extends Component {
  pasrTimer: PasrTimer = null;
  @property
  duration: number = 1.0;
  @property(Vec3)
  minScale: Vec3 = v3();
  @property(Vec3)
  maxScale: Vec3 = v3();

  @property({ type: Enum(EaseType) })
  easeType: EaseType = EaseType.linear;

  // @property({ type: EasingEnum })
  // easingType: typeof easing = null

  onLoad() {
    this.pasrTimer = new PasrTimer(0, this.duration / 2, 0, this.duration / 2);
  }

  start() {}

  onEnable() {
    this.pasrTimer.reset();
  }

  reset() {
    this.pasrTimer.a = this.duration / 2;
    this.pasrTimer.r = this.duration / 2;
  }

  tmp_scale: Vec3 = v3();

  update(dt) {
    var t = this.pasrTimer.Tick(dt);
    t = easing[EaseType[this.easeType]](t);
    this.node.scale = Vec3.lerp(
      this.tmp_scale,
      this.maxScale,
      this.minScale,
      t
    );
    if (this.pasrTimer.isFinished()) {
      this.pasrTimer.reset();
    }
  }
}
