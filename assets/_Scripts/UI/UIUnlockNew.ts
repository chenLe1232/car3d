import {
  Component,
  _decorator,
  Node,
  ModelComponent,
  UIModelComponent,
  LabelComponent,
} from 'cc';
import UIBase from './Common/UIBase';
import ccUtil from '../../framework3D/utils/ccUtil';
import InfoCar from '../Common/MergeFramework/InfoCar';
import { AutoRotateComp } from '../../framework3D/extension/qanim/AutoRotateComp';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
import { MergeStorage } from '../Common/MergeFramework/MergeStorage';
import { ResType } from '../Common/MergeFramework/InfoRes';
import { evt } from '../../framework3D/core/EventManager';
import vm from '../../framework3D/ui/vm';
import UIModelContainer from '../../framework3D/ui/game/UIModelContainer';
import Device from '../../framework3D/misc/Device';
let { ccclass, property } = _decorator;
@ccclass
export default class UIUnlockNew extends UIBase {
  container: UIModelContainer = null;

  d: InfoCar = null;

  @property(LabelComponent)
  label_gold: LabelComponent = null;

  @property(LabelComponent)
  label_diamond: LabelComponent = null;

  onLoad() {
    super.onLoad();
    this.onClick('Btn_Claim', this.click_claim);
    //this.onClick("Btn_Double", this.click_double)
    this.register(this.label_gold, () =>
      this.d.unlock_rewards[0].count.toUnitString()
    );
    this.register(this.label_diamond, () => this.d.unlock_rewards[1].count);
  }

  claimed = false;

  start() {
    this.container = this.getComponentInChildren(UIModelContainer);
    this.container.onLoaded.add(this.onLoaded, this);
  }

  onLoaded(node: Node) {
    node.setScale(2, 2, 2);
    ccUtil.getOrAddComponent(node, AutoRotateComp);
  }

  onShown(carId = 1) {
    this.claimed = false;
    let data = ccUtil.get(InfoCar, carId);
    this.container.prefab_path = data.prefab_path;
    this.d = data;

    this.render();
  }

  click_double() {
    if (this.claimed) return;
    WeakNetGame.doChoice('SOV_Unlock_Double', this.getDoubleReward, this);
  }

  click_claim() {
    this.getReward();
  }

  getDoubleReward() {
    this.getReward(2);
  }

  getReward(mult = 1) {
    if (this.claimed) return;
    this.claimed = true;
    this.d.unlock_rewards.forEach(v => {
      if (v.type == ResType.Coin) MergeStorage.gold += v.count * mult;
      else if (v.type == ResType.Diamond)
        MergeStorage.diamond += v.count * mult;
    });
    evt.emit('UIUnlockNew.getReward');
    this.hide();
  }
}
