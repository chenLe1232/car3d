import { _decorator, Component, Node, SpriteFrame, game, Game, Pool, instantiate, AnimationComponent, tween, director, v3, AudioClip, LabelComponent, SpriteComponent } from "cc";
import PoolManager from "../../../framework3D/core/PoolManager";
import vm from "../../../framework3D/ui/vm";
import ccUtil from "../../../framework3D/utils/ccUtil";
import PositionAnim from "../../../framework3D/extension/qanim/PositionAnim";
import { evt } from "../../../framework3D/core/EventManager";
import { Signal } from "../../../framework3D/core/Signal";
//import Signal from "../../../../framework3D/core/Signal";
const { ccclass, property } = _decorator;

export interface RedEnvelopFeatureData {
    random: number[],//随机
    crit_rate: number, //翻倍几率

}

@ccclass("RedEnvelopFeature")
export class RedEnvelopFeature extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(AudioClip)
    click_redAudio!: AudioClip;

    @property(Node)
    redTemplate!: Node ;

    @property(Node)
    add_fx!: Node;


    /**总长度: */
    @property()
    whole_duration: number = 9

    @property()
    min_interval: number = 0.11

    /** 落下时间  */
    @property()
    start_duration: number = 3;

    /** 红包出现间隔 */
    @property()
    start_interval: number = 1;

    //0.0006666666666666668 
    /** 红包出现间隔缩短因子 */
    @property()
    interval_fade: number = 0.002;

    /**落下时间 缩短因子 */
    @property
    duration_fade: number = 0.06;

    duration: number = 0;
    interval: number = 0;
    timer: number = 0;

    poolManager!: PoolManager;

    count: number = 0;

    reds: Node[] = []

    signal: Signal = new Signal();

    data!: RedEnvelopFeatureData;


    @property(SpriteFrame)
    sf_open!: SpriteFrame;


    start() {
        // Your initialization goes here.
    }

    onLoad() {
        this.poolManager = new PoolManager(this.node, this.onCreateObj, this)
        this.poolManager.managed = true;
    }

    onShow(data: RedEnvelopFeatureData, callback:any, target:any) {
        this.data = data || { random: [1, 3], crit_rate: 0.1 } as RedEnvelopFeatureData
        this.signal.on(callback, target);
        this.begin();
    }

    onShown() {
        //Platform.showBannerAd();
    }

    onHidden() {
        //remove all tween 
        this.poolManager.clearAlives();
    }

    begin() {
        this.interval = this.start_interval
        this.duration = this.start_duration;
        this._stopped = false;
        this.createRed(this.duration);
        this.scheduleOnce(this.stop, this.whole_duration + 1);
        this.count = 0;
        this.timer = 0;
    }

    _stopped = false;

    stop() {
        this._stopped = true;
        evt.sleep(0.5).then(this.enterEnd.bind(this))
    }

    enterEnd() {
        this.signal.fire(this.count);
        vm.show("Cheat/res/ui/UIRedResult", this.count, () => vm.hide(this));
    }


    onCreateObj(type:any) {
        let node = instantiate(type);
        return node;
    }


    onRemoved(node:any) {
        this.reds.splice(this.reds.indexOf(node), 1);
        // if (this._stopped) {
        //     if (this.reds.length <= 0) {

        //     }
        // }
    }

    createRed(dur:any) {
        let node = instantiate(this.redTemplate)
        this.node.addChild(node);
        this.reds.push(node);
        node.on(Node.EventType.TOUCH_START, this.onClickRed, this)
        let winsize = director.getWinSize();
        let hw = winsize.width / 2;
        let hh = winsize.height / 2;
        let x = g.randomInt(-hw, hw)
        node.setPosition(v3(x, hh + 100, 0));
        let anim = ccUtil.getOrAddComponent(node, PositionAnim)
        anim.from = v3(x, hh + 100, 0)
        anim.to = v3(x, -hh - 100, 0);
        anim.duration = dur;
        anim.play().then(v => {
            this.onRemoved(node);
            node.destroy()
        })
        return node;
    }
    i = 0;

    createFx(redNode: Node) {
        let node = this.poolManager.get(this.add_fx);
        let anim = node.getComponent(AnimationComponent);
        redNode.removeComponent(PositionAnim);
        redNode.off(Node.EventType.TOUCH_START, this.onClickRed, this)
        let sp = redNode.getComponent(SpriteComponent);
        sp.spriteFrame = this.sf_open;
        ccUtil.playAnimation(anim).then(v => {
            this.poolManager.put(node)
            this.onRemoved(redNode);
            redNode.destroy();
        })
        node.position = redNode.position;
        return node;
    }

    onClickRed(event:any) {
        let node = event.target as Node;
        let fx = this.createFx(node)
        let label = fx.getComponentInChildren(LabelComponent)
        let r = this.data.random;
        let c = g.randomInt(r[0], r[1] + 1)
        if (Math.random() < this.data.crit_rate)
            c = c * 2;
        if (label)
            label.string = c;
        this.count += c;

        if (this.click_redAudio)
            this.click_redAudio.play();
    }

    redRoutine() {
        // 5 - 
        // dur: 2- 1
    }

    update(dt:any) {
        if (this._stopped) return;
        this.timer += dt
        if (this.timer > this.interval) {
            this.timer = 0;
            this.duration -= this.duration_fade

            this.createRed(this.duration);
        }
        //红包产生间隔逐渐 变短
        this.interval -= this.interval_fade;
        this.interval = Math.max(this.interval, this.min_interval);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
