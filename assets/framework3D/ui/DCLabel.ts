import DCUI from "./DCUI";
import { LabelComponent, _decorator, js, tween } from "cc";

const { ccclass, property, requireComponent, menu } = _decorator;


@ccclass
@menu("DCUI/DCLable")
@requireComponent(LabelComponent)
export default class DCLabel extends DCUI {

    label: LabelComponent;
    @property
    str: string = "%s";

    @property
    hasAnim: boolean = true;

    @property({ visible() { return this.hasAnim } })
    dur: number = 0.1;

    @property({ visible() { return this.hasAnim } })
    scale: number = 1.2;

    @property({ displayName: "单位格式化" })
    formatUnit: boolean = true;

    onLoad() {
        this.label = this.getComponent(LabelComponent);
    }

    onValueChanged(v) {
        if (v == null) {
            console.warn("[DCLabel] warn!", "not found field [" + this.dataBind + "]")
            v = 0
        }
        if (this.formatUnit) {
            this.label.string = js.formatStr(this.str, v.toUnitString());
        } else {
            this.label.string = js.formatStr(this.str, v);
        }
        if (this.hasAnim) {
            // this.node.stopActionByTag(1000);
            // let scale = cc.scaleTo(this.dur,this.scale).easing(cc.easeSineInOut())
            // let scale2 = cc.scaleTo(this.dur,1,1);
            // let seq = cc.sequence(scale,scale2)
            // seq.setTag(1000);
            // this.node.runAction(seq)
        }
    }

    // update (dt) {}
}
