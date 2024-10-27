import {
  Component,
  _decorator,
  Node,
  SpriteComponent,
  SpriteFrame,
  AnimationComponent,
} from 'cc';
import { evt } from '../../../../framework3D/core/EventManager';
let { ccclass, property } = _decorator;
@ccclass
export default class ItemTip extends Component {
  sp: SpriteComponent = null;

  @property(SpriteFrame)
  sf_magnet: SpriteFrame = null;

  @property(SpriteFrame)
  sf_bomb: SpriteFrame = null;

  @property(SpriteFrame)
  sf_shield: SpriteFrame = null;

  anim: AnimationComponent = null;

  onLoad() {
    this.sp = this.getComponent(SpriteComponent);
    this.anim = this.getComponent(AnimationComponent);
    evt.on('EatItem', this.showTip, this);
  }

  onDestroy() {
    evt.off(this);
  }

  start() {}

  showTip(itemName) {
    this.anim.play('itemtip_enter');
    let sf = this['sf_' + itemName];
    this.sp.spriteFrame = sf;
    this.scheduleOnce(this.hideTip, 2);
  }

  hideTip() {
    this.anim.play('itemtip_exit');
  }
}
