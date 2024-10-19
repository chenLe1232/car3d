import DCUI from "./DCUI";
import { _decorator } from "cc";
import PandoraPoint from "./controller/PandoraPoint";
const { ccclass, property, requireComponent, menu } = _decorator;

@ccclass
@menu("DCUI/DCPandoraPoint")
@requireComponent(PandoraPoint)
export default class DCPandoraPoint extends DCUI {

    point: PandoraPoint;
    onLoad() {
        this.point = this.getComponent(PandoraPoint);
    }

    onValueChanged(v) {
        this.point.setNumber(v);
    }


    // update (dt) {}
}
