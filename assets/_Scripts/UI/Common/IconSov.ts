import { Component, _decorator, Node, LabelComponent } from "cc";
import Switcher from "../../../framework3D/ui/controller/Switcher";
import mvc_View from "../../../framework3D/ui/mvc_View";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";
import { CloudFuncType } from "../../Common/Base/CloudFuncTypes";
import { evt } from "../../../framework3D/core/EventManager";
import wegame from "../../src/wegame";
let { ccclass, property } = _decorator
@ccclass
export default class IconSov extends mvc_View {
    icon: Switcher = null

    @property
    sovName: string = ""
    onLoad() {
        this.icon = this.getComponent(Switcher);
        this.register(this.icon, () => WeakNetGame.getChoice(this.sovName))
        this.onVisible(this.icon.node, () => wegame.getStatus(CloudFuncType.ShareVideoIcon) == 0)
    }

}