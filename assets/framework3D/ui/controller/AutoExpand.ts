import {
  Component,
  _decorator,
  Node,
  LabelComponent,
  ButtonComponent,
  tween,
  Vec3,
  v3,
  easing,
} from 'cc';
let { ccclass, property } = _decorator;
@ccclass
export default class AutoExpand extends Component {
  @property()
  offset: number = 50;

  pos: Vec3 = v3();

  targetPos: Vec3 = v3();

  /**当前状态  */
  @property
  isOpen = false;

  @property
  duration: number = 0.4;

  @property
  autoClose: boolean = true;

  @property
  closeDelay: number = 2;

  onLoad() {
    this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    this.pos = this.node.position.clone();
    this.targetPos.set(this.pos);
    this.targetPos.x += this.offset;
  }

  start() {}

  onClick() {
    if (!this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    tween(this.node)
      .to(this.duration, { position: this.targetPos }, { easing: 'sineInOut' })
      .start();
    this.isOpen = true;
    //open
    if (this.autoClose) {
      this.unschedule(this.close);
      this.scheduleOnce(this.close, this.closeDelay);
    }
  }

  close() {
    tween(this.node)
      .to(this.duration, { position: this.pos }, { easing: 'sineInOut' })
      .start();
    this.isOpen = false;
  }
}
