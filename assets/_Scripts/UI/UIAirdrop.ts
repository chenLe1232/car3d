import {
  Component,
  _decorator,
  Node,
  LayoutComponent,
  ButtonComponent,
  LabelComponent,
  randomRangeInt,
  ParticleSystemComponent,
} from 'cc';
import UIBase from './Common/UIBase';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
import UIAirdropItem from './Items/UIAirdropItem';
import { MergeStorage } from '../Common/MergeFramework/MergeStorage';
import InfoRes, { ResType } from '../Common/MergeFramework/InfoRes';
import { mergeSystem } from '../Common/MergeFramework/MergeSystem';
import vm from '../../framework3D/ui/vm';
import PubHome from '../Common/Imp/PubHome';
import { evt } from '../../framework3D/core/EventManager';
import ccUtil from '../../framework3D/utils/ccUtil';
import { MergeHome } from '../Common/MergeFramework/MergeHome';
let { ccclass, property } = _decorator;
@ccclass
export default class UIAirdrop extends UIBase {
  //立即获得四辆赛车奖励 x-4
  //立即获得一次货币奖励 免费金币数量 + 钻石 10 + x* 5;
  //立即获得30分钟收益

  @property(LayoutComponent)
  layout: LayoutComponent = null;

  @property(ButtonComponent)
  btn_get: ButtonComponent = null;

  @property(LabelComponent)
  label_tip: LabelComponent = null;

  data = [
    [{ type: 0, num: 4 }],
    [{ type: 1 }, { type: 2 }],
    [{ type: 3, num: 30 }],
  ];

  _curIndex = 0;

  get randomData() {
    this._curIndex = randomRangeInt(0, this.data.length);
    return this.data[this._curIndex];
  }

  onLoad() {
    super.onLoad();
    this.register(this.layout, () => this.randomData);
    this.register(this.btn_get, this.click_get);
    this.register(this.label_tip, v => {
      if (this._curIndex == 0) {
        return '立即获得四辆赛车奖励';
      } else if (this._curIndex == 1) {
        return '立即获得一次货币奖励(金币+钻石)';
      } else if (this._curIndex == 2) {
        return '立即获得30分钟收益';
      }
    });
  }

  onShown() {
    this.btn_get.interactable = true;
    this.render();
  }

  click_get() {
    this.onSuccess();
    //WeakNetGame.doChoice("SOV_Airdrop", this.onSuccess, this);
  }

  async onSuccess() {
    this.btn_get.interactable = false;
    try {
      let items = this.getComponentsInChildren(UIAirdropItem);
      items.forEach(v => {
        let d = v.data;
        if (!d) return;
        if (d.type == ResType.Car) {
          for (var i = 0; i < d.count; i++) {
            mergeSystem.savePackage(d.id);
          }
          MergeHome.instance.playGetBox();
          vm.hide(this);
          return;
        } else if (d.type == ResType.Coin) {
          MergeStorage.gold += d.count;
          PubHome.instance.flyCoin(v.icon.node.worldPosition);
        } else if (d.type == ResType.Diamond) {
          MergeStorage.diamond += d.count;
          PubHome.instance.flyDiamond(v.icon.node.worldPosition);
        }
      });
      await evt.sleep(1);
      vm.hide(this);
    } catch (e) {
      console.error(e);
    }
  }
}
