import { _decorator, Component, Prefab, LabelComponent, tween, Node, v3, AnimationComponent, SpriteComponent, AudioClip, Vec3 } from "cc";
import MergePanel, { MergeEntityData } from "../../../QMerge/MergePanel";
import PsSpawner from "../../../framework3D/extension/fxplayer/PsSpawner";
import { evt } from "../../../framework3D/core/EventManager";
import QMerge from "../../../QMerge/QMerge";
import { MergeTypes } from "./MergeTypes";
import MergeSystem, { mergeSystem } from "./MergeSystem";
import { MergeStorage } from "./MergeStorage";
import MergeEntity from "../../../QMerge/MergeEntity";
import { BoxQuality } from "../../../QMerge/RewardBox";
import InfoCar from "./InfoCar";
import vm from "../../../framework3D/ui/vm";
import display from "../../../framework3D/misc/display";
import PoolManager from "../../../framework3D/core/PoolManager";
import ccUtil from "../../../framework3D/utils/ccUtil";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";
import Device from "../../../framework3D/misc/Device";
import { UserInfo } from "../../../framework3D/extension/weak_net_game/UserInfo";
//import StatHepler from "../../../framework3D/extension/aldsdk/StatHelper";
import { PlayerInfo } from "../../Data/PlayerInfo";
import { ttsdk } from './../../../framework3D/extension/adsdk/ttsdk';

const { ccclass, property } = _decorator;

@ccclass
export class MergeHome extends Component {

    @property(Prefab)
    prefab_box: Prefab = null;


    @property(MergePanel)
    mergePanel: MergePanel = null;


    @property(PsSpawner)
    fxSpawner: PsSpawner = null


    @property(LabelComponent)
    label_speed: LabelComponent = null;

    static instance: MergeHome = null;

    @property(AudioClip)
    merge_audio: AudioClip = null;

    @property(AudioClip)
    merge_new_audio: AudioClip = null;

    @property(Node)
    sdk: Node = null;

    @property(Node)
    float_sdk: Node = null;

    @property(Node)
    interfull: Node = null;
    youlike: Node = null;


    onLoad() {
        evt.on(QMerge.Event.Merge, this.onMerge, this)
        evt.on(MergeTypes.GetCarFree, this.onGetCarFree, this);
        evt.on(MergeTypes.BuyCarFromShop, this.onBuyCarFromShop, this)

        evt.on("MergeStorage.maxMergeLv", this.unlockNew, this);

        evt.on("UILevelup.getReward", this.onLevelupRewarded, this)
        evt.on(MergeTypes.LevelupEntity, this.onLevelup, this);

        evt.on(MergeTypes.ClickAirdrop, this.onClickAirdrop, this);

        // mergeSystem.startSample();
        MergeHome.instance = this;
    }

    onDestroy() {
        evt.off(this);
        // mergeSystem.stopSample();
        if (CC_WECHAT) {
            // window['zzsdkuiNew'].unscheduleAllCallbacks();
        }
        // window['zzsdkuiNew'].unschedule(window['zzsdkuiNew'].fulltopSchArr[0]);
        // window['zzsdkuiNew'].unschedule(window['zzsdkuiNew'].fullBotSchArr[0]);
        // window['zzsdkuiNew'].unschedule(window['zzsdkuiNew'].floatSchArr[0]);
        // window['zzsdkuiNew'].unschedule(window['zzsdkuiNew'].youlikeSchArr[0])
    }

    onLevelup(from, to) {
        vm.show("UI/UILevelup", from, to)
    }

    onLevelupRewarded(data: InfoCar) {
        mergeSystem.savePackage(data.id)
    }


    getAridrop() {
        let info = mergeSystem.curInfo;
        let sid = info.dropSupply;
        mergeSystem.savePackage(sid)
    }

    onClickAirdrop(id) {
        vm.show("UI/UIAirdrop")
        // WeakNetGame.doChoice("SOV_Airdrop", this.getAridrop, this);
    }

    unlockNew(n, o) {
        if (this.merge_new_audio) {
            this.merge_new_audio.play();
        }
        vm.show("UI/UIUnlockNew", n)
    }


    saveMap() {
        MergeStorage.map = this.mergePanel.getMap();
    }

    onMerge(ent: MergeEntity, prev: MergeEntity) {
        // if(UserInfo.isNew){
        //     StatHepler.userAction("到达每级合成级数的人数","成功合成的级数",ent.id);
        // }
        let worldpos = ent.node.worldPosition;
        let node = PoolManager.get("MergePool").get("mergeAnim")
        node.setWorldPosition(worldpos);
        let a = ccUtil.find("a", node, SpriteComponent)
        let b = ccUtil.find("b", node, SpriteComponent)
        if (a && b) {
            ccUtil.setDisplay(a, prev.data.image)
            ccUtil.setDisplay(b, prev.data.image)
        }
        ent.node.active = false
        ccUtil.playAnimation(node).then(v => {
            PoolManager.get("MergePool").put(node);
            ent.node.active = true;
            this.fxSpawner.play("Prefab/Effect/merge", worldpos)
        })
        if (this.merge_audio) {
            this.merge_audio.play();
        }
    }


    start() {
        this.initMerge();
        // this.mergePanel.data
        this.schedule(this.calcSpeed, 1);
        this.schedule(this.queryPackages, 1);
        this.schedule(this.supply, MergeSystem.supplyInterval);
        if (CC_WECHAT) {
            // this.showSdk();
        } else {
            ttsdk.showInteractionAd();
        }
    }

    showSdk(){
        this.interfull.active = true;
        let interfull_sc:Node = window['zzsdkuiNew'].interFull_scroll(0, 'inter_full',null,0,null,function(){
            this.showInterfullList();
        }.bind(this));
        interfull_sc && this.interfull.children[0].addChild(interfull_sc);
        if(interfull_sc)interfull_sc.setPosition(new Vec3(0,0,0))
    

        //猜你喜欢
        this.youlike = window['zzsdkuiNew'].youlike(0, null, null, '1', null, function(){
            this.showInterfull();
        }.bind(this), null);
        this.youlike&& this.sdk.addChild(this.youlike)
        if(this.youlike)this.youlike.active = false;

        //float1
        let float1 = window['zzsdkuiNew'].float(0, -250, 0,"float1", function(){
            this.showInterfull();
        }.bind(this),null,null,true,3);
        // console.log("float1" , float1);
        if(float1){
            this.float_sdk.addChild(float1);
            let scale = new Vec3(0.8,0.8,0.8);
            float1.setScale(scale);
        } 

        let float2 = window['zzsdkuiNew'].float(1, 250, 0,"float2", function(){
            this.showInterfull();
        }.bind(this),null,null,true,3);
        // console.log("float2" ,float2);
        if(float2){
            this.float_sdk.addChild(float2);
            let scale = new Vec3(0.8,0.8,0.8);
            float2.setScale(scale);
        } 
    }
  

    onDisable() {
    }

    supply() {
        // 补给 ，空间不足不给
        if (MergePanel.main.hasEmptySpace()) {
            mergeSystem.savePackage(mergeSystem.curInfo.normalSupply)
        }
    }

    queryPackages() {

        let last = MergeStorage.packages[0]
        if (last) {
            let ok = this.addBox(last.id, last.q);
            if (ok) {
                MergeStorage.packages.shift();
                MergeStorage.save("packages")
            }
        }
    }

    calcSpeed() {
        let v = mergeSystem.get_total_outputSpeed() * MergePanel.main.outputScale
        this.label_speed.string = v.toUnitString() + "/秒"
    }

    addBox(id: number, boxType?: BoxQuality) {
        let b = this.mergePanel.addNewBox(id, this.prefab_box, boxType)
        if (b) {
            return true;
        }
    }

    onBuyCarFromShop(data: InfoCar) {
        this.addBox(data.id);
    }

    onGetCarFree(data: InfoCar) {
        this.addBox(data.id);
    }


    initMerge() {
        csv.CarInfo.values.forEach(v => {
            let a = {} as MergeEntityData;
            a.id = v.Id;
            a.next = v.Next;
            a.image = "Texture/car_thumbnail/" + v.Id;
            this.mergePanel.setEntityData(a.id, a);
        })
        this.mergePanel.initWithMap(MergeStorage.map);
    }

    playGetBox() {
        this.fxSpawner.play("Prefab/Effect/get_boxes", display.center)
    }

    click_exit(){

    }

    click_interfull_continue(){
        this.interfull.active = false;
    }

    click_draw() {
        this.interfull.active = true;
    }

    showInterfull(){
        this.interfull.active = true;
    }

    showInterfullList(){
        // let interfull_sc = window['zzsdkuiNew'].interFull_scroll(0, 'inter_full');
        // interfull_sc && this.sdk.addChild(interfull_sc);
    }
}
