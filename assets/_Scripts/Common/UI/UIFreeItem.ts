import { Component, _decorator, Node, ToggleComponent, director, LabelComponent, ButtonComponent } from "cc"

import Switcher from "../../../framework3D/ui/controller/Switcher";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";

import { CloudFuncType } from "../Base/CloudFuncTypes";
import { PlayerInfo } from "../../Data/PlayerInfo";
import vm from "../../../framework3D/ui/vm";
import wegame from "../../src/wegame";
import UICheatBase from "../../src/UICheatBase";
let { ccclass, property, menu } = _decorator

const names = ['magnet', 'shield', 'speedup', 'spike']
@ccclass("UIFreeItem")
export default class UIFreeItem extends UICheatBase {
    @property(Switcher)
    switch_image: Switcher = null;

    @property(LabelComponent)
    label_title: LabelComponent = null

    @property(LabelComponent)
    label_desc: LabelComponent = null


    @property(Switcher)
    switch_sov: Switcher = null

    @property(ButtonComponent)
    btn_sov: ButtonComponent = null;
    @property(ButtonComponent)
    btn_close: ButtonComponent = null


    onLoad() {
        this.register(this.switch_sov, () => WeakNetGame.getChoice("SOV_FreeItem"))
        this.onVisible(this.switch_sov.node, () => wegame.getStatus(CloudFuncType.ShareVideoIcon) == 0)
        this.register(this.btn_sov, this.click_sov);
        this.register(this.btn_close, this.hide);
    }

    click_sov() {
        WeakNetGame.doChoice("SOV_FreeItem", this.success, this);
    }

    onShown() {
        // this.label_desc.string = cfg.desc;
        // this.label_title.string = cfg.name;
        // this.switch_image.index = names.indexOf(cfg.id);
        // this.buff = cfg;
    }

    success() {
        
        vm.show("UI/UIConfirm", null, this.hide, this)
    }

}