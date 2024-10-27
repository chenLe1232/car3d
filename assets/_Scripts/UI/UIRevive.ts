import {
  _decorator,
  ButtonComponent,
  ProgressBarComponent,
  LabelComponent,
  Game,
  director,
  Node,
} from 'cc';
import mvc_View from '../../framework3D/ui/mvc_View';
import qanim from '../../framework3D/extension/qanim/qanim';
import vm from '../../framework3D/ui/vm';

import Device from '../../framework3D/misc/Device';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";
import Level from '../Scenes/Level';
import UIBase from './Common/UIBase';
import { CloudFuncType } from '../Common/Base/CloudFuncTypes';
import Platform from '../../framework3D/extension/Platform';

const { ccclass, property } = _decorator;

@ccclass
export default class UIRevive extends UIBase {
  @property(ButtonComponent)
  btn_revive: ButtonComponent = null;

  @property(ButtonComponent)
  btn_thanks: ButtonComponent = null;

  @property(ProgressBarComponent)
  bar: ProgressBarComponent = null;

  @property(LabelComponent)
  barLabel: LabelComponent = null;

  @property(Node)
  txt_thanks: Node = null;

  onLoad() {
    super.onLoad();
    this.register(this.btn_revive, this.click_revive);
    this.register(this.btn_thanks, this.click_thanks);
  }

  onDestroy() {}

  _pauseProgress: boolean = false;

  click_revive() {
    // StatHepler.userAction("复活点击")
    if (this.timer <= 1) return;
    this._pauseProgress = true;
    this.unschedule(this.loseTime);
    WeakNetGame.doChoice('SOV_Revive_Game', this.onWatchCallback, this);
  }

  async onWatchCallback() {
    // StatHepler.userAction("复活成功")
    await this.hideView();
    Level.instance.revive();
  }

  click_thanks() {
    this.finishTimer();
    // Root.instance.openHome();
  }

  timer: number = 5;
  maxTime: number = 6;

  onShown() {
    this.render();
    this._pauseProgress = false;
    Level.instance.pause();
    this.timer = this.maxTime;
    this.bar.progress = 1;
    Device.playSfx('ReviveCountDown', true);
    this.loseTime();
    this.schedule(this.loseTime, 1);
    this.showBanner();
    this.txt_thanks.active = false;
    // if(wegame.isCheatOpen(CloudFuncType.BannerCheat)){
    //     //banner位移
    //     //this.btn_thanks.node.active = false;
    //     //this.txt_thanks.active = true;
    //     //this.scheduleOnce(this.showBanner,csv.Config.Revive_Banner_Delay||2);
    // }else{
    //    this.showBanner();
    // }
  }

  showBanner() {
    //Platform.showBannerAd();
    this.btn_thanks.node.active = true;
    this.txt_thanks.active = false;
  }

  onHidden() {
    this.unscheduleAllCallbacks();
    // this.unschedule(this.loseTime);
    Device.stopAllEffect();
  }

  update(dt) {
    if (this._pauseProgress) return;
    this.bar.progress -= dt / this.maxTime;
  }

  loseTime() {
    this.bar.progress = this.timer-- / this.maxTime;
    this.barLabel.string = this.timer.toFixed();
    if (this.timer <= 0) {
      this.unschedule(this.loseTime);
      Device.stopAllEffect();
      this.finishTimer();
    }
  }

  async hideView() {
    await qanim.fadeOutUI(this.node);
    vm.hide(this);
  }

  async finishTimer() {
    await this.hideView();
    vm.show('UI/UIEnd');
  }

  onShow() {
    qanim.fadeInUI(this.node);
  }
}
