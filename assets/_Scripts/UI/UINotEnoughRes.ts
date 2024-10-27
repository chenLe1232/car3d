import { Component, _decorator, Node, LabelComponent } from 'cc';
import UIBase from './Common/UIBase';
import InfoRes from '../Common/MergeFramework/InfoRes';
import Switcher from '../../framework3D/ui/controller/Switcher';
let { ccclass, property } = _decorator;
@ccclass
export default class UINotEngoughRes extends UIBase {
  @property(Switcher)
  tg_res: Switcher = null;

  @property(LabelComponent)
  label: LabelComponent = null;

  @property()
  onLoad() {
    super.onLoad();
    this.register<InfoRes>(this.tg_res, _ => _.type);
    this.register<InfoRes>(this.label, _ => _.name + '不足');
  }

  start() {}

  onShown(res: InfoRes) {
    this.render(res);
  }
}
