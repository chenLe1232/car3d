import {
  Component,
  _decorator,
  Node,
  LabelComponent,
  ButtonComponent,
} from 'cc';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
import { buffSystem } from '../../framework3D/misc/buffs/BuffSystem';
import { Buffs } from '../Buffs/BuffsRegistry';
import UIBase from './Common/UIBase';
import { mergeSystem } from '../Common/MergeFramework/MergeSystem';
import { Toast } from '../../framework3D/ui/ToastManager';
let { ccclass, property } = _decorator;
@ccclass
export default class UICoinSpeed extends UIBase {
  @property(LabelComponent)
  label_speed0: LabelComponent = null;

  @property(LabelComponent)
  label_speed1: LabelComponent = null;

  @property(ButtonComponent)
  btn_get: ButtonComponent = null;

  @property()
  buff_len: number = 300;

  @property()
  buff_len_max: number = 3600;

  onLoad() {
    super.onLoad();
    this.register(
      this.label_speed0,
      () => mergeSystem.get_total_outputSpeed().toUnitString() + '/秒'
    );
    this.register(
      this.label_speed1,
      () => (mergeSystem.get_total_outputSpeed() * 2).toUnitString() + '/秒'
    );
    this.register(this.btn_get, this.click_get);
  }

  start() {}

  click_get() {
    this.getRewards();
  }

  onShown() {
    this.render();
  }

  getRewards() {
    //加速
    let buff = buffSystem.getBuff(Buffs.OutputSpeedupBuff);
    // console.log('正在加速中...')
    if (buff.timeLeft > this.buff_len_max - this.buff_len) {
      Toast.make('状态已满!');
      return;
    }
    this.getSpeedupBuff();
    //WeakNetGame.doChoice("SOV_OutputSpeedup", this.getSpeedupBuff, this);
  }

  getSpeedupBuff() {
    let buff = buffSystem.getBuff(Buffs.OutputSpeedupBuff);
    if (buff.isEnabled) {
      buff.addLife(this.buff_len);
      Toast.make('[金币双倍]延长时间！');
    } else {
      buffSystem.startBuff(Buffs.OutputSpeedupBuff, this.buff_len);
      Toast.make('[金币双倍]开启加速');
    }
  }
}
