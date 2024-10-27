import {
  Component,
  _decorator,
  Node,
  SpriteComponent,
  LabelComponent,
  ButtonComponent,
  Color,
} from 'cc';
import mvc_View from '../../../framework3D/ui/mvc_View';
import InfoCar from '../../Common/MergeFramework/InfoCar';
import Switcher from '../../../framework3D/ui/controller/Switcher';
import { PlayerInfo } from '../../Data/PlayerInfo';
import IconSov from '../Common/IconSov';
import { evt } from '../../../framework3D/core/EventManager';
import { MergeTypes } from '../../Common/MergeFramework/MergeTypes';
import vm from '../../../framework3D/ui/vm';
import MergePanel from '../../../QMerge/MergePanel';
import { Toast } from '../../../framework3D/ui/ToastManager';
import WeakNetGame from '../../../framework3D/extension/weak_net_game/WeakNetGame';
import {
  mergeSystem,
  ResultCode,
} from '../../Common/MergeFramework/MergeSystem';
import { MergeStorage } from '../../Common/MergeFramework/MergeStorage';
let { ccclass, property } = _decorator;
@ccclass
export default class UIShopItem extends mvc_View {
  @property(SpriteComponent)
  icon: SpriteComponent = null;

  @property(LabelComponent)
  title: LabelComponent = null;

  @property(Switcher)
  tg_costOrFree: Switcher = null;

  @property(Switcher)
  tg_resType: Switcher = null;

  @property(Switcher)
  tg_sov: Switcher = null;

  @property(LabelComponent)
  label_cost: LabelComponent = null;

  btn: ButtonComponent = null;

  onLoad() {
    this.register<InfoCar>(this.icon, _ => _.imageUrl);
    this.register<InfoCar>(this.title, _ => _.currentName);

    this.btn = this.getComponentInChildren(ButtonComponent);
    this.register(this.btn, this.click_buy);
    this.onInteractable<InfoCar>(this.btn, _ => {
      this.icon.color = _.canBuy ? Color.WHITE : Color.BLACK;
      return _.canBuy;
    });

    this.register<InfoCar>(this.tg_costOrFree, _ => 0);

    this.register<InfoCar>(this.tg_resType, _ => _.currentCostType.type);
    this.register<InfoCar>(this.label_cost, _ =>
      _.canBuy ? _.currentPrice.toUnitString() : '-'
    );

    this.registerSubViews(IconSov);
  }

  claimFree() {
    mergeSystem.freeGet(this.getData());
    this.render();
  }

  click_buy() {
    let data = this.getData() as InfoCar;
    if (data.isFree) {
      WeakNetGame.doChoice('SOV_Shop_Buy', this.claimFree, this);
      return;
    }
    let ret = mergeSystem.buy(data, MergeTypes.BuyCarFromShop);
    if (ret == ResultCode.NotEnoughRes) {
      vm.show('UI/Common/UINotEnoughRes', data.currentCostType);
    }
  }

  start() {}
}
