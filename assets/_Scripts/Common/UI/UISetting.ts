import { Component, _decorator, Node, ToggleComponent, director } from "cc"
import qanim from "../../../framework3D/extension/qanim/qanim"
import vm from "../../../framework3D/ui/vm"
import Device from "../../../framework3D/misc/Device"

import { SettingInfo } from "../../../framework3D/extension/weak_net_game/SettingInfo"
import UIBase from "../../UI/Common/UIBase"

let { ccclass, property, menu } = _decorator
@ccclass("UISetting")
export default class UISetting extends UIBase {


    @property(ToggleComponent)
    cb_music: ToggleComponent = null

    @property(ToggleComponent)
    cb_effect: ToggleComponent = null

    @property(ToggleComponent)
    cb_vibrate: ToggleComponent = null


    onHidden() {

    }

    onShow() {
        qanim.fadeInUI(this.node)
        this.cb_effect.isChecked = !Device.isSfxEnabled;
        this.cb_music.isChecked = !Device.isBgmEnabled;
        this.cb_vibrate.isChecked = !Device.isVibrateEnabled;

        //pause all timer 
    }

    check_bgm(t: ToggleComponent) {
        Device.setBGMEnable(!t.isChecked)
        this.saveSettings()
    }

    check_sfx(t) {
        Device.setSFXEnable(!t.isChecked)
        this.saveSettings()
    }

    check_vibrate(t) {
        Device.setVibrateEnable(!t.isChecked)
        this.saveSettings()
    }

    saveSettings() {
        SettingInfo.saveSettings();
    }

}