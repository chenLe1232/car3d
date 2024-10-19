import { _decorator, Node, LabelComponent, ButtonComponent, SpriteComponent, LayoutComponent, MaskComponent, v3 } from "cc"
import Switcher from "../../framework3D/ui/controller/Switcher"
import vm from "../../framework3D/ui/vm";
import { PlayerInfo } from "../Data/PlayerInfo";
import LabelAnim from "../../framework3D/extension/qanim/LabelAnim";
import Device from "../../framework3D/misc/Device";
import { evt } from "../../framework3D/core/EventManager";
import WeakNetGame from "../../framework3D/extension/weak_net_game/WeakNetGame";
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";
import Platform from "../../framework3D/extension/Platform";
import ccUtil from "../../framework3D/utils/ccUtil";
import DataLevel from "../Data/DataLevel";
import { MergeStorage } from "../Common/MergeFramework/MergeStorage";
import LoadingScene from "../Common/Base/LoadingScene";
import UIBase from "./Common/UIBase";
import { CloudFuncType } from "../Common/Base/CloudFuncTypes";
import InfoCar from "../Common/MergeFramework/InfoCar";
import List from "../../framework3D/ui/superScroll/List";
import UIChooseCarItem from "./UIChooseCarItem";
import UIModelContainer from "../../framework3D/ui/game/UIModelContainer";
import { AutoRotateComp } from "../../framework3D/extension/qanim/AutoRotateComp";
let { ccclass, property } = _decorator
@ccclass("UIChooseCar")
export default class UIChooseCar extends UIBase {
    @property(List)
    listview: List = null;


    onLoad() {
        super.onLoad();
        evt.on("changecar",this.updateListView,this);
        this.getComponentInChildren(MaskComponent).inverted = false;
    }

    onDestroy(){
        evt.off("changecar",this.updateListView,this);
    }

    updateListView(){
        this.listview.updateAll();
    }
    
    onShown() {
        this.listview.numItems = csv.CarInfo.size;
    }

    onRenderlist(node: Node, index: number) {
        let item = node.getComponent(UIChooseCarItem);
        let data = ccUtil.get(InfoCar, index + 1);
        item.render(data);

    }

    click_return(){
        vm.hide(this);
    }
    
}