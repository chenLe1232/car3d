import { Component, _decorator, UITransformComponent, UIModelComponent, ModelComponent } from "cc";
import ccUtil from "../../framework3D/utils/ccUtil";
import { AutoRotateComp } from "../../framework3D/extension/qanim/AutoRotateComp";

const { ccclass, property,executeInEditMode } = _decorator;

@ccclass("UIModelLayout")
@executeInEditMode()
export default class UIModelLayout extends Component {


    onLoad() {

    }

    start() {
        this.node.children.forEach(v => {
            ccUtil.getOrAddComponent(v, UITransformComponent);
            ccUtil.getOrAddComponent(v, AutoRotateComp);
            v.removeComponent(UIModelComponent);
            let models = v.getComponentsInChildren(ModelComponent)
            models.forEach(x => {
                ccUtil.getOrAddComponent(x, UIModelComponent);
            })
        })
    }
}