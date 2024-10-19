import { Component, _decorator, Node, ButtonComponent, LabelComponent } from "cc";
import mvc_View from "../../../framework3D/ui/mvc_View";
import Switcher from "../../../framework3D/ui/controller/Switcher";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";
import { CloudFuncType } from "../Base/CloudFuncTypes";
import { PlayerInfo } from "../../Data/PlayerInfo";
import { Toast } from "../../../framework3D/ui/ToastManager";
import vm from "../../../framework3D/ui/vm";
import ccUtil from "../../../framework3D/utils/ccUtil";
import qanim from "../../../framework3D/extension/qanim/qanim";
import { MergeStorage } from "../MergeFramework/MergeStorage";
import { mergeSystem } from "../MergeFramework/MergeSystem";
import InfoCar from "../MergeFramework/InfoCar";
import { evt } from "../../../framework3D/core/EventManager";
import IconSov from "../../UI/Common/IconSov";
import UIBase from "../../UI/Common/UIBase";

let { ccclass, property } = _decorator
/**
 * 重写函数 : profit_in_seconds ,每秒离线收益
 */
@ccclass
export default class UIOfflineReward extends UIBase {
    @property(ButtonComponent)
    btn_sov: ButtonComponent = null;

    @property(LabelComponent)
    labelgold: LabelComponent = null;

    @property
    showOfflineTime: boolean = false;
    @property({ type: LabelComponent, visible() { return this.showOfflineTime } })
    label_time: LabelComponent = null

    gold: number = 0;

    @property(ButtonComponent)
    btn_claim: ButtonComponent = null;

    @property
    max_offline_reward_min = 240;


    @property(Node)
    flypic: Node = null

    onLoad() {
        super.onLoad();
        this.register(this.btn_sov, this.click_sov);
        this.register(this.btn_claim, this.click_claim)
        this.registerSubViews(IconSov)

    }


    onShown(offset) {
        this.render();
        console.log("离线时间：" + offset + 's')

        //最多计算多少的
        offset = Math.min(offset, this.max_offline_reward_min * 60) // 1400 = 4 * 60  * 60
        let sum = Math.floor(this.profit_in_seconds * offset)
        this.gold = sum;
        this.labelgold.string = "x" + sum.toUnitString();

        if (this.showOfflineTime) {
            let min = Math.floor(offset / 60);
            if (min < 60) {
                this.label_time.string = "累计" + min + "分钟离线收益!"
            } else {
                this.label_time.string = "累计" + (min / 60).toFixed(2) + "小时离线收益!"
            }
        }
        this.btn_claim.interactable = true;
        this.btn_claim.node.active = true;
        this.btn_sov.node.active = false;
        //this.scheduleOnce(this.delayShow, 1.5);
    }

    onHidden() {
        this.unschedule(this.delayShow);
    }

    delayShow() {
        this.btn_claim.node.active = true
    }

    click_claim() {
        this.getReward();
    }

    click_sov() {
        WeakNetGame.doChoice("SOV_OfflineReward", this.getReward.bind(this, 2), 1)
    }


    getReward(mult = 1) {
        this.btn_claim.interactable = false;
        let sum = mult * this.gold;
        evt.emit("UIOfflineReward.getReward", sum)
        // Root.instance.playAddCoin(this.flypic.worldPosition);
        this.hide();
    }


    start() {

    }

    ////////////////////////////////////////////////////////////////
    /**  每秒钟收益  */
    get profit_in_seconds() {
        let cars = MergeStorage.map.filter(x => x > 0).map(x => ccUtil.get(InfoCar, x))
        let sum = cars.reduce((sum, v) => sum + v.offlineReward, 0)
        return sum;
    }

    ////////////////////////////////////////////////////////////////
}