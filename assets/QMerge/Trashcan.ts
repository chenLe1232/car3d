import { SpriteComponent, Node, _decorator, Component, color, Color, v3, AudioClip } from "cc";
import MergeEntityReceiver, { MergeDragEvent } from "./MergeEntityReceiver";
import { evt } from "../framework3D/core/EventManager";
import MergePanel from "./MergePanel";
import qanim from "../framework3D/extension/qanim/qanim";


const { ccclass, property, menu } = _decorator;

enum State {
    Hover,
    Leave,
}

@ccclass
@menu('Game/Transhcan')
export default class Trashcan extends Component {

    receiver: MergeEntityReceiver = null;

    @property
    showIcon: boolean = true;

    @property(AudioClip)
    audio: AudioClip = null;

    // @property(cc.SpriteFrame)
    // spriteFrame: cc.SpriteFrame = null

    // @property(cc.SpriteFrame)
    // recycleFrame: cc.SpriteFrame = null;

    sprite: SpriteComponent

    // @property(Node)
    // otherButtons: Node = null;

    onLoad() {
        this.receiver = this.addComponent(MergeEntityReceiver)
        this.receiver.dragSignal.add(this.onDrag, this)
        this.sprite = this.getComponent(SpriteComponent);
        this.deactivate()
    }

    set opacity(a) {
        let c = this.sprite.color;
        this.sprite.color = color(c.r, c.g, c.b, a);
    }

    set color(c) {
        this.sprite.color.set(c);
    }

    get dragEntity() {
        return this.receiver.dragEntity
    }

    onDrag(evt: MergeDragEvent, obj) {
        if (evt == MergeDragEvent.Began) {
            this.activate()
        }
        // this.sprite.spriteFrame = this.recycleFrame;
        else if (evt == MergeDragEvent.End) {
            this.deactivate()
            // this.sprite.spriteFrame = this.spriteFrame;
        } else if (evt == MergeDragEvent.Hover) {
            this.onHover()
        } else if (evt == MergeDragEvent.Received) {
            this.onReceive()
        } else if (evt == MergeDragEvent.Leave) {
            this.onLeave()
        }
    }

    activate() {
        if (!this.showIcon)
            this.opacity = 255;
        // this.otherButtons.opacity = 30;
    }

    deactivate() {
        if (!this.showIcon)
            this.opacity = 0;
        // this.otherButtons.opacity = 255;
    }

    async onReceive() {
        //可以删除 sk
        // this.sprite.spriteFrame = this.spriteFrame
        if (!this.dragEntity) return;
        evt.emit("Trashcan.Receive", this.dragEntity)
        console.log("垃圾桶-删除");
        MergePanel.main.removeCurrent();
        if(this.audio)
            this.audio.play();
        // this.drag_gun.color = cc.Color.WHITE;
        // let spawn = cc.spawn(cc.scaleBy(0.3, 0.2).easing(cc.easeSineInOut()), cc.rotateBy(0.3, 360), cc.fadeOut(0.3))
        // let seq = cc.sequence(spawn, cc.removeSelf())
        // this.dragEntity.node.runAction(seq);
        let rubbish = this.dragEntity.node;
        qanim.scaleTo(rubbish, 0.3, 0).then(v => {
            rubbish.destroy();
        })
        //back to normal state 
        // Common.jellyJump2(this.node, 1.1, 1);

        // let label = await root.fxSpawner.getFx("Prefabs/com_weapon/flycoin");
        // label.node.getComponentInChildren(cc.Label).string = v.toUnitString();
        // // label.node.setPosition(cc.v2(100, 50));
        // let pos = this.node.getBoundingBoxToWorld().center;
        // label.node.position = pos.add(cc.v2(0, 10));
        // label.play().then(v => {
        //     root.fxSpawner.onFxFinshPlay(label);
        // })
        // PlayerInfo.coin += v;
    }

    onHover() {
        // Common.jellyJump2(this.node, 1, 1.1);
        if (this.dragEntity) {
            this.dragEntity.node.scale = v3(1.1, 1.1, 1);
            this.dragEntity.color = Color.RED;
        }
    }


    onLeave() {
        // Common.jellyJump2(this.node, 1.1, 1);
        if (this.dragEntity) {
            this.dragEntity.node.scale = v3(1, 1, 1);
            this.dragEntity.color = cc.Color.WHITE;
        }
    }

    start() {

    }

}