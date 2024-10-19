import { Node, tweenUtil, Vec3, v3 } from "cc";
import ScaleAnim from "./ScaleAnim";
import { EaseType } from "./EaseType";
import { evt } from "../../core/EventManager";
import ccUtil from "../../utils/ccUtil";
import PositionAnim from "./PositionAnim";
import BreathAnim from "./BreathAnim";
import UIBaseAnim from "./UIBaseAnim";

export enum QAnimType {
    Position,
    Fade,
    ScaleIn,
    ScaleOut,
}

export default class qanim {
    public static play(node: Node, type: QAnimType, duration: number, delay: number) {
        if (type == QAnimType.ScaleIn) {
            node.scale = Vec3.ZERO;
            var comp = node.getComponent(ScaleAnim)
            if (comp == null) {
                comp = node.addComponent(ScaleAnim);
            }
            comp.pasr.p = delay;
            comp.pasr.a = duration;
            comp.pasr.s = 0;
            comp.from = Vec3.ZERO;
            comp.to = Vec3.ONE;
            comp.enabled = true
            return comp;
        }
        else if (type == QAnimType.ScaleOut) {
            node.scale = Vec3.ONE;
            var comp = node.getComponent(ScaleAnim)
            if (comp == null) {
                comp = node.addComponent(ScaleAnim);
            }
            comp.pasr.p = delay;
            comp.pasr.a = duration;
            comp.pasr.s = 0;
            comp.pasr.r = 0;
            comp.from = Vec3.ONE;
            comp.to = Vec3.ZERO;
            comp.enabled = true
            return comp;
        }
    }

    public static fadeInUI(node: Node) {
        node.children.forEach((v, i) => {
            qanim.play(v, QAnimType.ScaleIn, 0.2, i * 0.06).easeType = EaseType.backOut
        })
    }

    public static fadeOutUI(node: Node) {
        let len = node.children.length;
        node.children.forEach((v, i) => {
            qanim.play(v, QAnimType.ScaleOut, 0.1, (len - i) * 0.03).easeType = EaseType.backIn
        })
        return evt.sleep(len * 0.03 + 0.1)
    }

    public static moveTo(node: Node, duration: number, to: Vec3, easeType: EaseType = EaseType.linear) {
        let anim = ccUtil.getOrAddComponent(node, PositionAnim);
        anim.from = node.position;
        anim.to = to;
        anim.duration = duration
        anim.easeType = easeType;
        return anim.play();
    }

    public static scaleTo(node: Node, duration: number, to: number, easeType: EaseType = EaseType.linear) {
        let anim = ccUtil.getOrAddComponent(node, ScaleAnim);
        anim.from = node.scale;
        anim.to = v3(to, to, to);
        anim.duration = duration
        anim.easeType = easeType;
        return anim.play();
    }

    public static stopAll(node: Node) {
        let breath = node.getComponent(BreathAnim);
        if (breath) breath.enabled = false;
        let anims = node.getComponents(UIBaseAnim)
        anims.forEach(v => v.enabled = false);
    }

}