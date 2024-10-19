import { _decorator, Component, game, Game } from "cc";
import Device from "../../../framework3D/misc/Device";
import BuffManager, { buffSystem } from "../../../framework3D/misc/buffs/BuffSystem";
import Platform from "../../../framework3D/extension/Platform";
import ViewManager from "../../../framework3D/ui/ViewManager";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";
import { Toast } from "../../../framework3D/ui/ToastManager";
import { PlayerInfo } from "../../Data/PlayerInfo";
//import StatHepler from "../../../framework3D/extension/aldsdk/StatHelper";
import { evt } from "../../../framework3D/core/EventManager";
import { UserInfo } from "../../../framework3D/extension/weak_net_game/UserInfo";
import gameUtil from "../../../framework3D/utils/gameUtil";

import GameHud from "../../Scenes/parts/Level/GameHud";
import { MergeHome } from "../MergeFramework/MergeHome";
import Cloud from "../../src/Cloud";

const { ccclass, property } = _decorator;
//config.csv配置
//BannerAdWhiteList 需要显示banner 的view列表
@ccclass
export default class PersistNode extends Component {
    isNewUser: boolean = true;
    onLoad() {
        game.addPersistRootNode(this.node)
        game.on(Game.EVENT_SHOW, this.onShow, this);
        game.on(Game.EVENT_HIDE, this.onHide, this)
        Device.setAudioPath("Audio/")
        csv.setParser((type, value) => {
            if (type == "item") {
                // let ret = []
                if (typeof (value) == "string") {
                    // let vs = value.split(";")
                    // vs.forEach(v => {
                    let arr = value.split(",")
                    let r = { type: arr[0], id: arr[1], count: parseInt(arr[2]) }
                    // ret.push(r)
                    // })
                    return r
                }
            }
        })
        evt.on("wxsdk.BannerReady", this.onBannerReady, this);
        evt.on("View.onShow", this.onViewShow, this)
        evt.on("View.onHidden", this.onViewHidden, this)
        evt.on("Loading.Success", this.onLoadingSuccess, this);
        //this.addComponent(BuffManager);

        Cloud.reload();
    }

    onViewShow(view) {
        if (view.node.name == "UIGuider") return;
        if (!csv.Config) return;
        if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
            if(GameHud.instance && GameHud.instance.youlike){
                GameHud.instance.youlike.active = false;
            }else if(MergeHome.instance && MergeHome.instance.youlike){
                MergeHome.instance.youlike.active = false;
            }
            if (view.node.name == "UIRevive"|| view.node.name == "UIEnd")return;
            //Platform.showBannerAd();
        } else {
            //Platform.hideBannerAd();
            if (view.node.name == "UIChooseCar")return;
            if(GameHud.instance && GameHud.instance.youlike){
                GameHud.instance.youlike.active = true;
            }else if(MergeHome.instance && MergeHome.instance.youlike){
                MergeHome.instance.youlike.active = true;
            }
        }
    }

    onViewHidden(view) {
        if (!csv.Config) return;
        if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
            //Platform.hideBannerAd();
        }
        if (csv.Config.BannerAdRefreshWhiteList && csv.Config.BannerAdRefreshWhiteList.indexOf(view.node.name) != -1) {
            Platform.refreshBannerAd();
        }
        if(GameHud.instance && GameHud.instance.youlike){
            GameHud.instance.youlike.active = true;
        }else if(MergeHome.instance && MergeHome.instance.youlike){
            MergeHome.instance.youlike.active = false;
        }

    }
    onDestroy() {
        evt.off(this);
    }

    onBannerReady() {
        if (ViewManager.instance) {
            ViewManager.instance.allViews.forEach(v => {
                // csv.Config.BannerActiveViews
                // csv.Config.ShowBannerViews
                if (v.node.active) {
                    if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(v.node.name) == -1) {
                        //没有在白名单里的要隐藏 
                        console.log(v.node.name + "未在白名单里，隐藏banner");
                        //Platform.hideBannerAd();
                    }
                }
            })
        }

    }

    onShow(a) {
        console.log("----------onShow" + JSON.stringify(a));
        Cloud.reload();

        // if (CC_WECHAT) {
        //     // 个人聊天 卡片1007， 群聊天 卡片 1008 , 1044 
        //     //点自已的卡片
        //     console.log(a.query.share_link, a.query.uuid, WeakNetGame.sharedUUIDs)
        //     if (a.query.share_link == "true" && WeakNetGame.isValidShare(a.query.uuid)) {
        //         if (a.scene == 1007) {
        //             Toast.make("点击个人的分享链接不会获得奖励哟~请分享到微信群吧！")
        //             console.log("链接分享：个人")
        //         }
        //         else {
        //             if (a.scene == 1008 || a.scene == 1044) {
        //                 console.log("链接分享：群", a.scene)
        //                 if (WeakNetGame.isClaimedShare(a.query.uuid)) {
        //                     Toast.make("短时间内，不能点击相同群的分享链接！请分享到其他群吧！")
        //                 } else {
        //                     WeakNetGame.claimShare(a.query.uuid);
        //                     // vm.hide("Prefab/UI/UIShareLink")
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    onHide() {
        if (!CC_DEBUG) {
            PlayerInfo.save();
        }
        buffSystem.save();
        UserInfo.exitGame();
        this.unschedule(this.time30);
        this.unschedule(this.time45);
        this.unschedule(this.time60);
    }

    start() {
        let isn = localStorage.getItem("PlayerInfo.guide")
        if (isn == null || isn == "") {
            this.isNewUser = true
        } else {
            this.isNewUser = false;
        }
        if (this.isNewUser) {
            //开始加载
            //StatHepler.userAction("开始加载")
        }
    }

    onLoadingSuccess() {
        evt.off("Loading.Success", this.onLoadingSuccess, this);
        if (this.isNewUser) {
            this.scheduleOnce(this.time30, 30);
            this.scheduleOnce(this.time45, 45);
            this.scheduleOnce(this.time60, 60);
            //StatHepler.userAction("加载成功")
            // if(UserInfo.isNew&&UserInfo.isFirstLoginToday)
            //     StatHepler.userAction("新用户第一次进入游戏的人数","进入游戏的新用户数","进入游戏")
        }
    }

    time30() {
        //StatHepler.userAction("30s未退出")
    }

    time45() {
        //StatHepler.userAction("45s未退出")
    }

    time60() {
        //StatHepler.userAction("60s未退出")
    }
}