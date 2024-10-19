import { Component, _decorator, Node, ButtonComponent } from "cc";
import ccUtil from "../../../../framework3D/utils/ccUtil";
import mvc_View from "../../../../framework3D/ui/mvc_View";
import LoadingScene from "../../../Common/Base/LoadingScene";
//import StatHepler from "../../../../framework3D/extension/aldsdk/StatHelper";
import { UserInfo } from "../../../../framework3D/extension/weak_net_game/UserInfo";
import { PlayerInfo } from "../../../Data/PlayerInfo";
let { ccclass, property } = _decorator
@ccclass
export class StartButton extends Component {

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.click, this)
    }

    click() {
        // if(UserInfo.isNew){
        //     StatHepler.userAction("各个关卡进入的人数及次数","关卡进入人数",PlayerInfo.level);
        // }
        LoadingScene.goto("Level")
    }

    start() {

    }
}