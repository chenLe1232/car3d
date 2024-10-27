import {
  _decorator,
  LabelComponent,
  SpriteComponent,
  ButtonComponent,
  AudioClip,
} from 'cc';
import mvc_View from '../../../framework3D/ui/mvc_View';
import Switcher from '../../../framework3D/ui/controller/Switcher';
import { evt } from '../../../framework3D/core/EventManager';
import { MergeTypes } from './MergeTypes';
import IconSov from '../../UI/Common/IconSov';
import { buffSystem } from '../../../framework3D/misc/buffs/BuffSystem';
import { Buffs } from '../../Buffs/BuffsRegistry';
import Buff from '../../../framework3D/misc/buffs/Buff';
import gameUtil from '../../../framework3D/utils/gameUtil';
import InfoCar from './InfoCar';
import ccUtil from '../../../framework3D/utils/ccUtil';
import { mergeSystem, ResultCode } from './MergeSystem';
import vm from '../../../framework3D/ui/vm';
//import StatHepler from "../../../framework3D/extension/aldsdk/StatHelper";

let { ccclass, property } = _decorator;
@ccclass
export default class MergeBotOperation extends mvc_View {
  @property(LabelComponent)
  label_cost: LabelComponent = null;

  @property(SpriteComponent)
  carIcon: SpriteComponent = null;

  @property(ButtonComponent)
  btn_buy: ButtonComponent = null;

  @property(ButtonComponent)
  btn_shop: ButtonComponent = null;

  @property(Switcher)
  speedStatus: Switcher = null;

  @property(LabelComponent)
  label_time: LabelComponent = null;

  @property(AudioClip)
  audio_buy: AudioClip = null;

  onLoad() {
    // this.register(this.label_cost, () => { ccUtil.get(InfoCar, mergeSystem.benefitCar).currentPrice })
    evt.on(MergeTypes.BuyCar, this.refresh, this);
    evt.on(MergeTypes.BuyCarFromShop, this.refresh, this);
    evt.on('MergeStorage.maxMergeLv', this.refresh, this);
    this.register(this.btn_buy, this.click_buy);
    this.register(this.btn_shop, this.click_shop);
    this.registerSubViews(IconSov);

    let buff = buffSystem.getBuff(Buffs.OutputSpeedupBuff);
    buff.on(Buff.EventType.Start, this.onSpeedBuffBegin, this);
    buff.on(Buff.EventType.End, this.onSpeedBuffEnd, this);
    buff.on(Buff.EventType.Update, this.onSpeedBuffUpdate, this);

    this.register(this.speedStatus, () => (buff.isEnabled ? 1 : 0));
    this.register(this.label_time, () => gameUtil.formatSeconds(buff.timeLeft));
    this.refresh();
  }

  onDestroy() {
    evt.off(this);
    let buff = buffSystem.getBuff(Buffs.OutputSpeedupBuff);
    buff.off(Buff.EventType.Start, this.onSpeedBuffBegin, this);
    buff.off(Buff.EventType.End, this.onSpeedBuffEnd, this);
    buff.off(Buff.EventType.Update, this.onSpeedBuffUpdate, this);
  }

  currentCar: InfoCar = null;

  onSpeedBuffBegin() {
    this.speedStatus.index = 1;
    //开启加速动画 TODO
  }

  onSpeedBuffUpdate(buf: Buff) {
    this.label_time.string = gameUtil.formatSeconds(buf.timeLeft);
  }

  onSpeedBuffEnd() {
    this.speedStatus.index = 0;
    this.render();
  }

  refresh() {
    let car = ccUtil.get(InfoCar, mergeSystem.benefitCar);
    this.currentCar = car;
    this.label_cost.string = car.currentPrice.toUnitString();
    console.log(car + '111111111111112222222222222');
    ccUtil.setDisplay(this.carIcon, car.imageUrl);
    console.log('MergeBotOperation->refresh->this.carIcon', this.carIcon);
  }

  click_buy() {
    let ret = mergeSystem.buy(this.currentCar, MergeTypes.BuyCar);
    if (ret == ResultCode.NotEnoughRes) {
      vm.show('UI/UIFreeGold');
    } else if (ret == ResultCode.Success) {
      if (this.audio_buy) {
        this.audio_buy.play();
      }
    }
  }

  click_shop() {
    //StatHepler.userAction("点击商店")
    vm.show('UI/UIShop');
  }

  click_speedup() {
    //StatHepler.userAction("点击加速")
    vm.show('UI/UICoinSpeed');
  }

  start() {
    this.render();
  }
}
