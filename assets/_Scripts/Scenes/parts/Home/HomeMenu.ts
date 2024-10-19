import { Component, _decorator, Node } from "cc";
import mvc_View from "../../../../framework3D/ui/mvc_View";
import vm from "../../../../framework3D/ui/vm";
//import StatHepler from "../../../../framework3D/extension/aldsdk/StatHelper";
let { ccclass, property } = _decorator
@ccclass
export default class HomeMenu extends mvc_View {

    onLoad() {
        this.onClick("setting", this.click_setting)
        this.onClick("help", this.click_help)
        this.onClick("checkIn", this.click_checkin)
    }

    start() {

    }

    click_setting() {
        //StatHepler.userAction("点击设置")
        vm.show("UI/Common/UISetting")
    }

    click_checkin() {
        //StatHepler.userAction("点击签到")
        vm.show("UI/Common/UICheckIn")
    }


    click_help() {

    }
}