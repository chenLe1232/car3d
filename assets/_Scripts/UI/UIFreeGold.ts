import {
  Component,
  _decorator,
  Node,
  LabelComponent,
  ButtonComponent,
} from 'cc';
import UIBase from './Common/UIBase';
import { mergeSystem } from '../Common/MergeFramework/MergeSystem';
import vm from '../../framework3D/ui/vm';
import { evt } from '../../framework3D/core/EventManager';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";
let { ccclass, property } = _decorator;
@ccclass
export default class UIFreeGold extends UIBase {
  @property(LabelComponent)
  label_gold: LabelComponent = null;

  gold: number = 0;

  @property(ButtonComponent)
  btn_claim: ButtonComponent = null;

  onLoad() {
    super.onLoad();
    this.register(this.btn_claim, this.click_claim);
    this.register(this.label_gold, () => this.gold.toUnitString());
  }

  start() {}

  onShown() {
    this.gold = mergeSystem.getFreeCoin();
    this.btn_claim.interactable = true;
    this.render();
    //StatHepler.userAction("免费升级")
  }

  click_claim() {
    this.success();
    //WeakNetGame.doChoice("SOV_FreeGold", , this)
  }

  success() {
    this.btn_claim.interactable = false;
    evt.emit('UIFreeGold.getReward', this.gold);
    this.hide();
  }
}
