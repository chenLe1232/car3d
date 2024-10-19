import { Component, _decorator, Node, UITransformComponent, Vec2 } from "cc";
import ViewManager from "../framework3D/ui/ViewManager";
import { evt } from "../framework3D/core/EventManager";
import MergeGrid from "./MergeGrid";
import Trashcan from "./Trashcan";
import MergePanel from "./MergePanel";

const ACTION_MOVE_FINGER = 10021
const ACTION_TAP_FINGER = 10022

let { ccclass, property } = _decorator

@ccclass
export default class MergeHint extends Component {
    // motionStreak: MotionStreak = null;

    @property(Node)
    finger: Node = null;

    onLoad() {
        if (this.finger == null) {
            this.finger = cc.find("hand", this.node);
        }
        // this.motionStreak = this.getComponentInChildren(cc.MotionStreak);

        evt.on("BottomOperation.click_buy", this.onMergePanelChanged, this)
    }

    start() {
        MergeHint.hint(this);
    }



    teachAutoMerge() {
        //Canvas/bottom/mergebtn
        let node = this.findUINode("Canvas/QMerge/Bottom/Buy")
        let transform = node.getComponent(UITransformComponent);
        let fromRect = transform.getBoundingBoxToWorld()
        let pos = this.transform.convertToNodeSpaceAR(fromRect.center)
        this.fingerTap(pos)
    }


    async onMergePanelChanged() {
        // if (PlayerInfo.bt_lv > 1) {
        //     if (this.finger.active) return;
        //     let max = csv.Config.MaxGun_Teach_AutoMerge
        //     if (buff_mgr.getBuff("AutoMerge").isEnabled) return;
        //     if (max > 0) {
        //         let c = 0
        //         MergePanel.main.grids.forEach(v => {
        //             if (v.canDrag && v.entity) {
        //                 c++;
        //             }
        //         })
        //         if (c >= max) {
        //             //开启引导
        //             this.teachAutoMerge()
        //         }
        //     }
        // }
    }

    showFinger() {
        this.finger.position = cc.Vec2.ZERO;
        // this.motionStreak && this.motionStreak.reset()
        this.finger.active = true;
    }

    fingerTap(pos) {
        // this.showFinger()
        // this.finger.position = pos;
        // let callback = cc.callFunc(v => {
        //     this.finger.scale = 1.2;
        //     // this.motionStreak && this.motionStreak.reset()
        // })
        // let scale2 = cc.scaleTo(0.5, 0.8);
        // let scale3 = cc.scaleTo(0.5, 1.2);
        // let scale4 = cc.scaleTo(0.5, 0.8);
        // let seq = cc.sequence(callback, scale2, scale3, scale4, cc.delayTime(1), cc.callFunc(_ => {
        //     this.hidePointer()
        // }))
        // seq.setTag(ACTION_TAP_FINGER);
        // this.finger.runAction(seq)
        // this.finger.runAction(cc.blink(2.5, 20))
    }


    moveFinger(from: Vec2, to: Vec2, repeatTimes = cc.macro.REPEAT_FOREVER) {
        // this.showFinger();
        // from = this.transform.convertToNodeSpaceAR(from)
        // to = this.transform.convertToNodeSpaceAR(to);
        // from.subtract2f(0, 50)
        // to.subtract2f(0, 50)
        // let callback = cc.callFunc(v => {
        //     this.finger.position = from
        //     // this.motionStreak && this.motionStreak.reset()
        // })
        // let move = cc.moveTo(1, to).easing(cc.easeSineInOut());
        // let delay = cc.delayTime(1);
        // let seq = cc.sequence(callback, move, delay).repeat(repeatTimes)
        // seq.setTag(ACTION_MOVE_FINGER)
        // this.finger.runAction(seq)
    }

    startDrag(from, to) {
        let fromNode = this.findUINode(from);
        let toNode = this.findUINode(to);
        let fromRect = fromNode.transform.getBoundingBoxToWorld()
        let toRect = toNode.transform.getBoundingBoxToWorld()
        this.moveFinger(fromRect.center, toRect.center);
    }


    findUINode(path, type?): Node {
        let node = null;
        if (type == "UI") {
            node = cc.find("Canvas/ViewManager/" + path);
        } else {
            node = cc.find(path);
        }
        return node
    }

    stopDrag() {
        // this.finger.stopActionByTag(ACTION_MOVE_FINGER);
        this.hidePointer();

    }

    hidePointer() {
        this.finger.active = false;
        // this.motionStreak && this.motionStreak.reset();
        // this.node.stopActionByTag(ACTION_TAP_FINGER);
        // this.node.stopActionByTag(ACTION_MOVE_FINGER);
    }
    //------------------------------------------------------------------------------//

    static stopTeach(hint: MergeHint) {
        hint.stopDrag();
    }

    static async teachCombine(hint: MergeHint, matches: MergeGrid[][]) {
        // 玩家成功拖动两把枪之中的任意一把时结束
        //找到合成的
        if (ViewManager.instance.hasVisibleDialog()) {
            return;
        }
        matches.sort((a, b) => {
            return b[0].entity.id - a[0].entity.id
        })
        let grid: MergeGrid[] = matches[0]
        hint.startDrag("Canvas/QMerge/MergeLayout/" + (grid[0].index + 1), "Canvas/QMerge/MergeLayout/" + (grid[1].index + 1))
        evt.wait("QMerge.Merge", 10).then(v => this.stopTeach(hint))
        evt.wait("QMerge.Move", 10).then(v => this.stopTeach(hint))
        evt.wait("QMerge.SwitchPosition", 10).then(v => this.stopTeach(hint))
    }

    static stopTeachDelete(hint: MergeHint, trash: Trashcan) {
        this.stopTeach(hint);
        trash.deactivate();
    }

    static async teachDelete(hint: MergeHint, grid: MergeGrid) {
        if (ViewManager.instance.hasVisibleDialog()) {
            return;
        }
        let trashNode = cc.find("Canvas/bin")
        let trash = trashNode.getComponent(Trashcan);
        trash.activate();
        hint.startDrag("Canvas/QMerge/MergeLayout/" + (grid.index + 1), "Canvas/QMerge/Bottom/Trashcan")

        evt.wait("QMerge.Merge", 10).then(v => this.stopTeachDelete(hint, trash))
        evt.wait("QMerge.Move", 10).then(v => this.stopTeachDelete(hint, trash))
        evt.wait("QMerge.SwitchPosition", 10).then(v => this.stopTeachDelete(hint, trash))
        evt.wait("Trashcan.Receive", 10).then(v => this.stopTeachDelete(hint, trash))
    }

    static checkCallback = null
    static async hint(hint: MergeHint) {
        this.checkCallback = this.check.bind(this, hint)
        // let timeout = PlayerInfo.isNew ? 30000 : 2000;
        let timeout = 2000;
        setTimeout(this.checkCallback, timeout);
    }



    static async check(hint: MergeHint) {
        // if(PlayerInfo.guide <= 2 || !Guider.is_in_guide){
        //     setTimeout(this.checkCallback, 5000);
        //     return;
        // }
        //检测是否有合成的
        hint.stopDrag();
        let matches = MergePanel.main.findMatches()
        if (matches.length > 0) {
            let code = await evt.wait("QMerge.Merge", 15)
            if (code == 'timeout') {
                //10分钟未合成，提示合成
                matches = MergePanel.main.findMatches()
                if (matches.length > 0)
                    await this.teachCombine(hint, matches);
            }
        } else {
            //没有合成的，且没有空格子
            let emptyGrid = MergePanel.main.findEmptyGrid();
            if (!emptyGrid) {
                let code = await evt.wait("Trashcan.Receive", 15)
                if (code == 'timeout') {
                    await this.teachDelete(hint, MergePanel.main.findMinLevelGrid());
                }
            }
        }
        setTimeout(this.checkCallback, 3000);
    }

}
