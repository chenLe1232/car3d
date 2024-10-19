import ClickAudio from "./ClickAudio";
import { _decorator, Component, AudioClip, Node, ButtonComponent } from "cc";
const { ccclass, property, disallowMultiple, menu } = _decorator;

@ccclass
@disallowMultiple
@menu("Controller/ClickAudioManager")
export default class ClickAudioManager extends Component {

    @property(AudioClip)
    audio: AudioClip = null;

    @property
    vibrate: boolean = true;

    @property
    withSiblings: boolean = true;

    @property
    withChildren: boolean = true;


    onLoad() {
        if (this.withSiblings) {
            this.make(this.node.parent);
        }
        if (this.withChildren) {
            this.make(this.node);
        }
    }

    make(node) {
        node.walk(this.each.bind(this), _ => 0)
        node.on(Node.EventType.CHILD_ADDED, this.onChildAdd, this);
    }

    onChildAdd(node) {
        node.walk(this.each.bind(this), _ => 0)
    }

    onDestroy() {
        this.node.parent.off(Node.EventType.CHILD_ADDED, this.onChildAdd, this);
        this.node.off(Node.EventType.CHILD_ADDED, this.onChildAdd, this);
    }

    each(item: Node) {
        //if button 
        if (!item.getComponent(ButtonComponent)) return;
        let comp = item.getComponent(ClickAudio)
        if (comp == null) {
            comp = item.addComponent(ClickAudio);
            comp.audio = this.audio;
            comp.vibrate = this.vibrate;
        }
    }
    start() {

    }

    // update (dt) {}
}
