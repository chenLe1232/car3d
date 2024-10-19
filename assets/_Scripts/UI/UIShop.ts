import { Component, _decorator, Node, MaskComponent } from "cc";
import ListItem from "../../framework3D/ui/superScroll/ListItem";
import UIShopItem from "./Items/UIShopItem";
import ccUtil from "../../framework3D/utils/ccUtil";
import InfoCar from "../Common/MergeFramework/InfoCar";
import UIBaseAnim from "../../framework3D/extension/qanim/UIBaseAnim";
import UIBase from "./Common/UIBase";
import List from "../../framework3D/ui/superScroll/List";
let { ccclass, property } = _decorator
@ccclass
export default class UIShop extends UIBase {

    @property(List)
    listview: List = null;
    onLoad() {
        super.onLoad();
        this.getComponentInChildren(MaskComponent).inverted = false;
    }

    start() {

    }

    onShown() {
        this.listview.numItems = csv.CarInfo.size;
    }

    onRenderlist(node: Node, index: number) {
        let item = node.getComponent(UIShopItem);
        let data = ccUtil.get(InfoCar, index + 1);
        item.render(data);

    }
}