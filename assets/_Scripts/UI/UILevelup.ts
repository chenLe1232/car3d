import { Component, _decorator, Node, ButtonComponent, LabelComponent } from "cc";
import UIModelContainer from "../../framework3D/ui/game/UIModelContainer";
import UIBase from "./Common/UIBase";
import ccUtil from "../../framework3D/utils/ccUtil";
import InfoCar from "../Common/MergeFramework/InfoCar";
import WeakNetGame from "../../framework3D/extension/weak_net_game/WeakNetGame";
import { evt } from "../../framework3D/core/EventManager";
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";
let { ccclass, property } = _decorator
@ccclass
export default class UILevelup extends UIBase {

    @property(UIModelContainer)
    modelContainer1: UIModelContainer = null

    @property(UIModelContainer)
    modelContainer2: UIModelContainer = null

    @property(ButtonComponent)
    btn_claim: ButtonComponent = null;


    @property(LabelComponent)
    lvLabel1: LabelComponent = null;

    @property(LabelComponent)
    lvLabel2: LabelComponent = null;

    onLoad() {
        super.onLoad();
        this.register(this.btn_claim, this.click_claim)
    }

    start() {

    }

    d: InfoCar = null

    onShown(from, to) {
        this.render();
        let car1 = ccUtil.get(InfoCar, from);
        let car2 = ccUtil.get(InfoCar, to);
        this.d = car2
        this.modelContainer1.prefab_path = car1.prefab_path
        this.modelContainer2.prefab_path = car2.prefab_path

        this.lvLabel1.string = car1.levelDesc;
        this.lvLabel2.string = car2.levelDesc;

        this.btn_claim.interactable = true
        //StatHepler.userAction("免费升级展示成功")
    }

    click_claim() {
        this.getReward();
        //StatHepler.userAction("点击免费升级")
        //WeakNetGame.doChoice("SOV_Levelup_Claim", , this)
    }

    getReward() {
        //StatHepler.userAction("免费升级视频成功")
        this.btn_claim.interactable = false
        this.hide();
        evt.emit("UILevelup.getReward", this.d);
    }

}