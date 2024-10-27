import { Component, _decorator, Node, ButtonComponent } from 'cc';
import vm from '../../../../framework3D/ui/vm';
import ccUtil from '../../../../framework3D/utils/ccUtil';
let { ccclass, property } = _decorator;
@ccclass
export default class HomeAddGold extends Component {
  btn_add: ButtonComponent = null;

  onLoad() {
    this.btn_add = this.getComponent(ButtonComponent);
    if (this.btn_add == null) {
      this.btn_add = ccUtil.newButton(
        this.node,
        'HomeAddGold',
        'click_add',
        this.node
      );
    }
    if (this.btn_add) {
      this.btn_add.node.on(Node.EventType.TOUCH_END, this.click_add, this);
    }
  }

  start() {}

  click_add() {
    vm.show('UI/UIFreeGold');
  }
}
