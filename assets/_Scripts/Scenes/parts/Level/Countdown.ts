import {
  Component,
  _decorator,
  Node,
  LabelComponent,
  AnimationComponent,
} from 'cc';
import Device from '../../../../framework3D/misc/Device';
let { ccclass, property } = _decorator;
@ccclass
export default class Countdown extends Component {
  @property(LabelComponent)
  label: LabelComponent = null;

  @property()
  from: number = 5;

  once: boolean = true;

  @property(AnimationComponent)
  anim: AnimationComponent = null;

  onLoad() {
    if (!this.label) this.label = this.getComponent(LabelComponent);
    if (!this.anim) this.anim = this.getComponent(AnimationComponent);
  }

  start() {
    this.node.active = false;
  }

  step() {
    this.label.string = this.from + '';
    this.from--;
    this.anim.play();
    Device.playSfx('CD');
    if (this.from < 0) {
      this.unschedule(this.step);
      this.node.active = false;
    }
  }

  _play() {
    this.step();
    this.schedule(this.step, 1);
  }

  play() {
    if (this.once) {
      this.node.active = true;
      this.once = false;
      this._play();
    }
  }

  stop() {
    this.node.active = false;
  }
}
