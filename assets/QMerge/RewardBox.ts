import FSM from '../framework3D/core/FSM';
import {
  AnimationComponent,
  SpriteComponent,
  AnimationState,
  _decorator,
  Component,
  ButtonComponent,
  Node,
} from 'cc';
import ccUtil from '../framework3D/utils/ccUtil';
import { Signal } from '../framework3D/core/Signal';

export enum BoxQuality {
  D,
  C,
  B,
  A,
  S,
}

export class BoxInfo {
  static QualityName = ['粗糙', '普通', '稀有', '史诗', '传说'];
  static Icon = ['box-poor', 'box1', 'box2', 'box3', 'box4'];
}

BoxInfo.Icon = BoxInfo.Icon.map(v => 'QMerge/res/images/box/' + v);
const { ccclass, property, menu } = _decorator;
enum State {
  None,
  Idle,
  Exit,
}

@ccclass
export default class RewardBox extends Component {
  index: number = 0;
  /**宝箱品阶 */
  private _quality: number = 0;

  clickSignal: Signal = new Signal();

  anim!: AnimationComponent;

  fsm!: FSM;

  @property(SpriteComponent)
  sprite!: SpriteComponent;

  openResolve: any = null;

  @property(ButtonComponent)
  button!: ButtonComponent;

  onLoad() {
    this.anim = this.getComponent(AnimationComponent);
    this.anim.on(AnimationComponent.EventType.FINISHED, this.onFinished, this);

    if (this.sprite == null) this.sprite = this.getComponent(SpriteComponent);
    this.FSM();

    if (this.button == null) {
      this.button = this.getComponent(ButtonComponent);
    }
    if (this.button) {
      this.button.node.on(Node.EventType.TOUCH_END, this.click, this);
    }
  }

  public FSM() {
    this.fsm = this.addComponent(FSM);
    this.fsm.init(this);
    this.fsm.addStates(State);
    this.fsm.enterState(State.None);
  }

  public get quality(): number {
    return this._quality;
  }

  public set quality(value: number) {
    this._quality = value;
    ccUtil.setDisplay(this.sprite, BoxInfo.Icon[value]);
  }

  onFinished(evtname, b: AnimationState) {
    if (b.name == 'box_open') {
      // remove
      this.node.destroy();
      if (this.openResolve) {
        this.openResolve();
        this.openResolve = null;
      }
    }
  }
  onDestroy() {
    this.clickSignal.clear();
  }

  start() {}

  click() {
    this.clickSignal.fire(this.index);
  }

  onEnter_IdleState(state) {
    this.schedule(this.playIdle, 2);
  }
  onExit_IdleState(state) {}
  onUpdate_IdleState(state, dt: number) {}

  playFall() {
    this.anim.play('box_show');
    if (!this.fsm) this.FSM();
    this.fsm.changeState(State.Idle);
  }

  playIdle() {
    if (this.fsm.isInState(State.Exit)) {
      return;
    }
    this.anim.play('box_idle');
  }

  playOpen() {
    if (this.fsm.isInState(State.Exit)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.anim.play('box_open');
      this.openResolve = resolve;
      this.fsm.changeState(State.Exit);
    });
  }
}
