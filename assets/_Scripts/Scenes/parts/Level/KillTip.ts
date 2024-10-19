import { Component, _decorator, Node, LabelComponent, AnimationComponent } from "cc";
import { PlayerInfo } from "../../../Data/PlayerInfo";
import { evt } from "../../../../framework3D/core/EventManager";
let { ccclass, property } = _decorator
@ccclass
export default class KillTip extends Component {

    @property(LabelComponent)
    numLabel: LabelComponent = null;

    @property(AnimationComponent)
    anim: AnimationComponent = null;

    onLoad() {
        this.anim = this.getComponent(AnimationComponent)
        evt.on("PlayerInfo.tmp_killed", this.onKilled, this);
    }

    isHidding = false;

    onKilled(n) {
        this.node.active = true;
        this.numLabel.string = "+" + n;
        if (!this.isHidding) {
            this.anim.play()
        }
        this.isHidding = true
        this.unschedule(this.hide);
        this.scheduleOnce(this.hide, 1.2)
    }

    hide() {
        this.isHidding = false
        this.node.active = false;
    }

    start() {
        this.node.active = false;
    }

    onEnable() {

    }

    onDestroy() {
        evt.off(this);
    }


}