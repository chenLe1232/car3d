import { Component, isPropertyModifier, _decorator, ProgressBarComponent, LabelComponent, game, Game } from "cc";
import NumTrigger from "../../framework3D/misc/NumTrigger";
import Platform from "../../framework3D/extension/Platform";
import { Toast } from "../../framework3D/ui/ToastManager";
import vm from "../../framework3D/ui/vm";
import { evt } from "../../framework3D/core/EventManager";
import { Signal } from "../../framework3D/core/Signal";

let { property, ccclass } = _decorator
@ccclass("CrazyClick")
export default class CrazyClick extends Component {

    @property(ProgressBarComponent)
    bar: ProgressBarComponent = null;

    @property(LabelComponent)
    label: LabelComponent = null;

    @property()
    /**总共可点击的次数 */
    maxClick: number = 12;

    @property()
    loseSpeed: number = 0.1;

    trigger: NumTrigger = new NumTrigger;

    isPaused: boolean = false;

    signal: Signal = new Signal();

    success_tip: string = '修理成功！'

    //component 
    start() {

    }

    onLoad() {
        this.bar = this.getComponentInChildren(ProgressBarComponent);
        this.bar.progress = 0;
        this.trigger.add(0.4, 0.6, this.onEnterAd.bind(this))
        this.trigger.add(1.0, 2.0, this.onFinish.bind(this))

        game.on(Game.EVENT_SHOW, this.hideBanner, this);
    }

    onDestroy() {
        game.off(Game.EVENT_SHOW, this.hideBanner, this);
    }

    onEnterAd() {
        //Platform.showBannerAd();
        this.isPaused = true;

        evt.sleep(2).then(v => this.hideBanner())
    }

    onShow() {
        //Platform.hideBannerAd()
    }

    onShown(data, callback, target) {

        this.signal.on(callback, target);
        this.isPaused = false;
        this.trigger.reset();
        this.bar.progress = 0;
    }


    updateProgress() {
        this.label.string = Math.floor(this.bar.progress * 100) + '%'
    }

    onFinish() {
        this.success();
        this.isPaused = true;
    }

    hideBanner() {
        this.isPaused = false;
        //Platform.hideBannerAd();
    }

    onHidden() {
        //Platform.hideBannerAd();
    }

    click_fix() {
        //修理
        this.bar.progress += 1 / this.maxClick;
    }

    update(dt) {
        if (!this.isPaused) {
            if (this.bar.progress > 0) {
                this.bar.progress -= this.loseSpeed * dt;
            }
        }
        this.updateProgress();
        this.trigger.update(this.bar.progress);
    }

    success() {
        Toast.make(this.success_tip)
        vm.hide(this);
        this.signal.fire()
    }


}