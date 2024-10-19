import { _decorator, Component, Node, SpriteFrame, game, Game, LabelComponent } from "cc";
import { Signal } from "../../../framework3D/core/Signal";
import qanim from "../../../framework3D/extension/qanim/qanim";
import vm from "../../../framework3D/ui/vm";

const { ccclass, property } = _decorator;

@ccclass("UIRedEnvelopResult")
export class UIRedEnvelopResult extends Component {

    start() {
        // Your initialization goes here.
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    @property(LabelComponent)
    label: LabelComponent = null;

    closeSignal: Signal = new Signal()
    onShow(count, callback, target) {
        this.closeSignal.on(callback, target);
        //Platform.hideBannerAd();
        qanim.fadeInUI(this.node)
        game.on(Game.EVENT_SHOW, this.hideBanner, this);
        this.label.string = "x " +count
    }

    hide() {
        qanim.fadeOutUI(this.node).then(v => {
            vm.hide(this);
        })
    }

    onHidden() {
        game.off(Game.EVENT_HIDE, this.hideBanner, this);
        this.closeSignal.fire();
    }

    hideBanner() {
        //Platform.hideBannerAd();
    }

}
