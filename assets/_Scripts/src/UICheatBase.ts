import { _decorator, Node, ButtonComponent } from "cc"
import vm from "../../framework3D/ui/vm"
import mvc_View from "../../framework3D/ui/mvc_View"
import qanim from "../../framework3D/extension/qanim/qanim"
import { Signal } from "../../framework3D/core/Signal"
let { ccclass, property } = _decorator
@ccclass("UICheatBase")
export default class UICheatBase extends mvc_View {

    signal: Signal = new Signal();

    @property(Node)
    node_close: Node = null;

    datas: any = null

    onLoad() {
    }

    start() {

    }

    onShow(data, callback, target) {
        this.datas = data;
        this.signal.on(callback, target);
        qanim.fadeInUI(this.node)
        this.node_close.active = false
        this.scheduleOnce(this.showClose, 2);
        this.render();
    }

    showClose() {
        this.node_close.active = true;
    }

    hide() {
        qanim.fadeOutUI(this.node).then(() => {
            vm.hide(this);
        })
    }

    onHidden() {
        this.signal.fire();
        this.unschedule(this.showClose);
    }


}