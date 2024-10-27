import UIFunctions from './UIFunctions';

import {
  _decorator,
  Component,
  Node,
  LabelComponent,
  AnimationComponent,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export default class ToastComponent extends Component {
  @property(LabelComponent)
  label: LabelComponent = null;
  animations: AnimationComponent[];

  onLoad() {
    this.animations = UIFunctions.getChildrenAnimations(this.node);
  }

  start() {}

  hide(callback): any {
    this.node.active = true;
    if (!UIFunctions.doHideAnimations(this.animations, callback)) {
      this.node.active = false;
      // this.node.removeFromParent();
      if (callback) {
        callback(this);
      }
    }
  }
  show(text: any): any {
    this.label.string = text;
    UIFunctions.doShowAnimations(this.animations);
  }
  // update (dt) {}
}
