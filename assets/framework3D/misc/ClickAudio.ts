import Device from "../misc/Device";
import { _decorator, Component, AudioClip, Node, ButtonComponent } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ClickAudio extends Component {

    @property(AudioClip)
    audio: AudioClip = null;

    vibrate: boolean = false;

    audio_invalid: AudioClip = null;


    @property(ButtonComponent)
    btn: ButtonComponent = null;


    onLoad() {
        this.btn = this.getComponent(ButtonComponent);
        // this.node.on('touchstart', _ => {
        // }, this.node);

        this.node.on(Node.EventType.TOUCH_END, _ => {
            if (!this.audio) return;
            if (this.btn.interactable) {
                Device.playEffect(this.audio, false)
                Device.vibrate(false);
            } else {
                if (this.audio_invalid)
                    Device.playEffect(this.audio_invalid, false)
            }
        })
        // this.node.on("touchcancel", _ => {
        // })
    }

    // update (dt) {}
}
