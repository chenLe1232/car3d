import { Component, _decorator, Node, SpriteComponent } from "cc";
import { evt } from "../../../framework3D/core/EventManager";
import { MergeStorage } from "../MergeFramework/MergeStorage";
import ccUtil from "../../../framework3D/utils/ccUtil";
import display from "../../../framework3D/misc/display";
import { UserInfo } from "../../../framework3D/extension/weak_net_game/UserInfo";
import vm from "../../../framework3D/ui/vm";
import { CheckInDayData } from "../UI/UICheckIn";
import { Toast } from "../../../framework3D/ui/ToastManager";
import InfoCar from "../MergeFramework/InfoCar";
import MergePanel from "../../../QMerge/MergePanel";
import Device from "../../../framework3D/misc/Device";
import Platform from "../../../framework3D/extension/Platform";
let { ccclass, property } = _decorator
@ccclass
export default class PubHome extends Component {

    @property(SpriteComponent)
    goldSp: SpriteComponent = null;

    @property(SpriteComponent)
    diamondSp: SpriteComponent = null;


    static instance: PubHome = null

    onLoad() {
        evt.on("UIOfflineReward.getReward", this.onGetOfflineRward, this)
        evt.on("UICheckIn.getReward", this.onGetCheckInRward, this)
        evt.on("UIUnlockNew.getReward", this.onUnlockNew, this)
        evt.on("UIFreeGold.getReward", this.onGetFreeGold, this)

        PubHome.instance = this
    }

    onDestroy() {
        evt.off(this);
    }


    playBGM() {
        Device.playBGM("Audio_Home/HomeBGM")
        Platform.loadSubPackage("Audio_Home").then(v => {
            Device.playBGM("Audio_Home/HomeBGM")
        })
    }


    start() {
        let offset = UserInfo.checkOffline()
        if (offset > 0) {
            this.scheduleOnce(_=> vm.show("UI/Common/UIOfflineReward", offset), 0.2)
        }
        this.playBGM()
    }
    //////////////////////////////////////////////////////

    onGetFreeGold(gold) {
        MergeStorage.gold += gold
        MergeStorage.save("gold")
        this.flyCoin()
    }

    onGetOfflineRward(gold: number) {
        Toast.make("获得金币" + gold.toUnitString())
        MergeStorage.gold += gold
        MergeStorage.save('gold');
        this.flyCoin();
    }

    onGetCheckInRward(data: CheckInDayData, mult: number) {
        let c = data.num * mult
        if (data.type == "gold") {
            Toast.make("获得奖励 金币x " + c.toUnitString())
            MergeStorage.gold += c;
        } else if (data.type == "diamond") {
            Toast.make("获得奖励 钻石x " + c.toUnitString());
            MergeStorage.diamond += c;
        }
        this.flyCoin();
    }

    onUnlockNew() {
        Device.playSfx("sfx_coin_collect")
        this.flyCoin();
        this.flyDiamond();
    }


    flyCoin(from = display.center) {
        ccUtil.playFlyCoin(this.goldSp.node, this.node, from, this.goldSp.node.worldPosition, null)
    }

    flyDiamond(from = display.center) {
        ccUtil.playFlyCoin(this.diamondSp.node, this.node, from, this.diamondSp.node.worldPosition, null)
    }
    //////////////////////////////////////////////////////
}