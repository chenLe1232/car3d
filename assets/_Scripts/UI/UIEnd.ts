import {
  _decorator,
  Node,
  LabelComponent,
  ButtonComponent,
  SpriteComponent,
} from 'cc';
import Switcher from '../../framework3D/ui/controller/Switcher';
import vm from '../../framework3D/ui/vm';
import { PlayerInfo } from '../Data/PlayerInfo';
import LabelAnim from '../../framework3D/extension/qanim/LabelAnim';
import Device from '../../framework3D/misc/Device';
import { evt } from '../../framework3D/core/EventManager';
import WeakNetGame from '../../framework3D/extension/weak_net_game/WeakNetGame';
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";
import Platform from '../../framework3D/extension/Platform';
import ccUtil from '../../framework3D/utils/ccUtil';
import DataLevel from '../Data/DataLevel';
import { MergeStorage } from '../Common/MergeFramework/MergeStorage';
import LoadingScene from '../Common/Base/LoadingScene';
import UIBase from './Common/UIBase';
import { CloudFuncType } from '../Common/Base/CloudFuncTypes';
let { ccclass, property } = _decorator;
@ccclass('UIEnd')
export default class UIEnd extends UIBase {
  @property(Switcher)
  topSwitcher: Switcher = null;

  @property(ButtonComponent)
  btn_claim: ButtonComponent = null;

  @property(Node)
  txt_claim: Node = null;

  @property(ButtonComponent)
  btn_double: ButtonComponent = null;

  @property(ButtonComponent)
  btn_tripple: ButtonComponent = null;

  @property(ButtonComponent)
  btn_more: ButtonComponent = null;

  @property(Node)
  node_fake: Node = null;

  gold: number = 0;
  diamond: number = 0;

  @property(LabelComponent)
  label_killed: LabelComponent = null;

  @property(LabelComponent)
  label_collected: LabelComponent = null;

  @property(LabelComponent)
  label_killed_rewards: LabelComponent = null;

  @property(LabelComponent)
  label_collected_rewards: LabelComponent = null;

  @property(LabelComponent)
  label_lv_gold: LabelComponent = null;

  @property(LabelComponent)
  label_lv_diamond: LabelComponent = null;

  @property(SpriteComponent)
  goldSp: SpriteComponent = null;

  @property(SpriteComponent)
  diamondSp: SpriteComponent = null;

  onLoad() {
    super.onLoad();
    // this.register(this.score_label, _ => PlayerInfo.score.toString());
    this.register(this.btn_claim, this.click_claim);
    this.register(this.btn_double, this.click_double);
    this.register(this.btn_tripple, this.click_tripple);
    this.register(this.btn_more, this.click_more);
  }

  start() {}

  onShown(isWin) {
    //Platform.hideBannerAd();
    let d = ccUtil.get(DataLevel, PlayerInfo.level - 1);
    let gold = d.gold;
    let diamond = d.diamond;
    this.label_killed.string = PlayerInfo.tmp_killed.toString();
    this.label_collected.string = PlayerInfo.tmp_diamond.toString();
    this.gold = (PlayerInfo.tmp_killed / 10) * gold;
    this.label_killed_rewards.string = this.gold.toUnitString();
    this.label_collected_rewards.string = PlayerInfo.tmp_diamond.toString();
    this.diamond = PlayerInfo.tmp_diamond;
    if (isWin) {
      this.gold += gold;
      this.diamond += diamond;
      this.topSwitcher.index = 0;
      // this.btn_double.node.active = false
      // this.btn_tripple.node.active = true;
    } else {
      gold = 0;
      diamond = 0;
      this.topSwitcher.index = 1;
      // this.btn_double.node.active = false
      // this.btn_tripple.node.active = true
    }
    this.btn_double.interactable = false;
    this.btn_claim.interactable = true;
    this.btn_tripple.interactable = false;
    this.label_lv_gold.string = gold.toUnitString();
    this.label_lv_diamond.string = diamond.toString();

    this.showBanner();
    // if(wegame.isCheatOpen(CloudFuncType.BannerCheat)){
    //     //banner位移
    //     this.btn_claim.node.active = false;
    //     this.txt_claim.active = true;
    //     this.scheduleOnce(this.showBanner,csv.Config.End_Banner_Delay||2);
    // }else{
    //     this.showBanner();
    // }

    //let data = ccUtil.get(tips, g.randomInt());
    // this.Tips.string = data.tip;
    // if (PlayerInfo.score > PlayerInfo.highScore) {
    //     //突破最高分
    //     PlayerInfo.highScore = PlayerInfo.score;
    //     this.s_highscore.index = 1;
    //     PlayerInfo.upRank();
    // } else {
    //     this.s_highscore.index = 0;
    // }
    //下一关
  }

  showBanner() {
    //Platform.showBannerAd();
    this.btn_claim.node.active = true;
    this.txt_claim.active = false;
  }

  onHidden() {
    this.unscheduleAllCallbacks();
  }

  play(label, to) {
    let from = parseInt(label.string);
    ccUtil.getOrAddComponent(label, LabelAnim).play(0.5, from, to, true);
  }

  async getReward(rate: number = 1) {
    this.btn_double.interactable = false;
    this.btn_claim.interactable = false;
    this.btn_tripple.interactable = false;

    let gold = this.gold * rate;
    let diamond = this.diamond * rate;

    this.play(this.label_killed_rewards, 0);
    this.play(this.label_collected_rewards, 0);

    this.play(this.label_lv_gold, gold);
    this.play(this.label_lv_diamond, diamond);

    await evt.sleep(0.5);
    Device.playSfx('sfx_coin_collect');
    if (gold > 0) {
      this.flyCoin(this.label_lv_gold.node.worldPosition);
      await evt.sleep(0.5);
      MergeStorage.save('gold');
      MergeStorage.gold += gold;
    }
    if (diamond > 0) {
      this.flyDiamondd(this.label_lv_diamond.node.worldPosition);
      await evt.sleep(0.5);
      MergeStorage.diamond += diamond;
      MergeStorage.save('diamond');
    }
    this.scheduleOnce(this.hide, 0.5);
  }

  hide() {
    vm.hide(this);
    LoadingScene.goto('Game');
  }

  async click_claim() {
    this.getReward();
  }

  async click_more() {
    // zzsdk.openFull();
  }

  async onSuccess() {
    //StatHepler.userAction("结算双倍成功")
    this.getReward(2);
  }

  async click_double() {
    //StatHepler.userAction("结算双倍点击")
    WeakNetGame.doChoice('SOV_End_x2', this.onSuccess, this);
  }

  onGetX3() {
    //StatHepler.userAction("结算3倍成功")
    this.getReward(3);
  }

  async click_tripple() {
    // StatHepler.userAction("结算3倍点击")
    WeakNetGame.doChoice('SOV_End_x3', this.onGetX3, this);
  }

  click_exit() {}

  flyCoin(from) {
    ccUtil.playFlyCoin(
      this.goldSp.node,
      this.node,
      from,
      this.goldSp.node.worldPosition,
      null
    );
  }

  flyDiamondd(from) {
    ccUtil.playFlyCoin(
      this.diamondSp.node,
      this.node,
      from,
      this.diamondSp.node.worldPosition,
      null
    );
  }
}
