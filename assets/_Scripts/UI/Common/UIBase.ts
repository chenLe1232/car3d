import { Component, _decorator, Node, ButtonComponent } from "cc";
import mvc_View from "../../../framework3D/ui/mvc_View";
import qanim from "../../../framework3D/extension/qanim/qanim";
import vm from "../../../framework3D/ui/vm";
import IconSov from "./IconSov";
let { ccclass, property } = _decorator
@ccclass
export default class UIBase extends mvc_View {

    onLoad() {
        this.registerTop();
        this.registerSubViews(IconSov)
    }

    registerTop() {
        this.onClick("panel/top/close", this.hide)
        this.onClick("top/close", this.hide)
    }


    onShow() {
        qanim.fadeInUI(this.node);
    }

    onShown(...args) {

    }

    hide() {
        qanim.fadeOutUI(this.node).then(v => vm.hide(this));
    }

}