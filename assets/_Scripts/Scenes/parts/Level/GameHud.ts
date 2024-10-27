import {
  Component,
  _decorator,
  Node,
  ButtonComponent,
  ProgressBarComponent,
  LabelComponent,
  animation,
  ParticleSystemComponent,
  SpriteComponent,
} from 'cc';
import LoadingScene from '../../../Common/Base/LoadingScene';
import mvc_View from '../../../../framework3D/ui/mvc_View';
import gameUtil from '../../../../framework3D/utils/gameUtil';
import qanim, {
  QAnimType,
} from '../../../../framework3D/extension/qanim/qanim';
import ccUtil from '../../../../framework3D/utils/ccUtil';
import ProgressBarAnim from '../../../../framework3D/extension/qanim/ProgressBarAnim';
import { PlayerInfo } from '../../../Data/PlayerInfo';
import { evt } from '../../../../framework3D/core/EventManager';
import BuffSystem, {
  buffSystem,
} from '../../../../framework3D/misc/buffs/BuffSystem';
import { Buffs } from '../../../Buffs/BuffsRegistry';
import FSM from '../../../../framework3D/core/FSM';
import DataLevel from '../../../Data/DataLevel';
import Countdown from './Countdown';
import Device from '../../../../framework3D/misc/Device';
let { ccclass, property } = _decorator;

enum State {
  Running,
  CountDown,
}
@ccclass
export default class GameHud extends mvc_View {
  @property(ButtonComponent)
  btn_pause: ButtonComponent = null;

  @property(ProgressBarComponent)
  bar_distance: ProgressBarComponent = null;

  @property(ProgressBarComponent)
  bar_energe: ProgressBarComponent = null;

  @property(LabelComponent)
  labelTimeLeft: LabelComponent = null;

  @property(Node)
  pointer: Node = null;

  @property(ParticleSystemComponent)
  ps_energy: ParticleSystemComponent = null;

  fsm: FSM;

  static instance: GameHud = null;

  youlike: Node = null;
  @property(Countdown)
  countdown_hud: Countdown = null;

  onLoad() {
    this.register(this.btn_pause, this.click_pause);
    evt.on('PlayerInfo.energyCount', this.updateEnerge, this);
    this.fsm = this.addComponent(FSM);
    this.fsm.init(this, State);

    GameHud.instance = this;
  }

  onDestroy() {
    evt.off(this);
    if (CC_WECHAT) {
      // window['zzsdkuiNew'].unscheduleAllCallbacks();
    }
  }

  start() {
    if (!CC_DEBUG) {
      this.btn_pause.node.active = false;
    }
    this.updateEnerge(0);
    this.updateDistance(0);

    if (CC_WECHAT) {
      // //猜你喜欢
      // this.youlike = window['zzsdkuiNew'].youlike(0, null, null, '1', null, function () {
      //     this.showInterfull();
      // }.bind(this), null);
      // this.youlike && this.node.addChild(this.youlike)
    }
  }

  begin() {
    this.fsm.changeState(State.Running);
  }

  pause() {
    this.fsm.pause();
  }

  win() {
    this.pause();
    this.countdown_hud.stop();
  }

  resume() {
    this.fsm.resume();
  }

  ///////////////////////////[fsm]////////////////////////////

  onEnter_Running(state) {
    let d = ccUtil.get(DataLevel, PlayerInfo.level);
    PlayerInfo.timeLeft = d.time;
    this.updateEnerge(PlayerInfo.energyCount);
    state.timer = 0;
  }

  onUpdate_Running(state, dt) {
    state.timer += dt;
    if (state.timer > 1) {
      state.timer = 0;
      this.losetime();
    }
  }

  ///////////////////////////[fsm]////////////////////////////

  losetime() {
    PlayerInfo.timeLeft -= 1;
    if (PlayerInfo.timeLeft <= 5) {
      this.countdown_hud.play();
    }
    this.updateTimeLeft();
  }

  click_pause() {
    LoadingScene.goto('Game');
  }

  updateEnerge(n) {
    // this.bar_energ
    this.bar_energe.progress = (n * 1) / 3;
    if (n > 0) Device.playSfx('EnergyIncrease');
    if (this.canUseEnergy) {
      //triger
      //player fire
      this.ps_energy.node.active = true;
      this.scheduleOnce(this.consumeEnergey, 0.2);
    } else {
      this.ps_energy.node.active = false;
    }
  }

  get canUseEnergy() {
    return PlayerInfo.energyCount == 3 && !PlayerInfo.isEnd;
  }

  consumeEnergey() {
    let anim = ccUtil.getOrAddComponent(this.bar_energe, ProgressBarAnim);
    anim.doPlay(5.0, 1.0, 0.0).then(v => {
      PlayerInfo.energyCount = 0;
    });
    buffSystem.startBuff(Buffs.SpeedupBuff, 5);
    buffSystem.startBuff(Buffs.ShieldBuff, 5);
  }

  updateDistance(p) {
    let w = this.bar_distance.node.width;
    let c = p * w;
    let pos = this.pointer.position;
    this.pointer.setPosition(c - w / 2, pos.y, 0);
    this.bar_distance.progress = p;
  }

  updateTimeLeft() {
    this.labelTimeLeft.string = gameUtil.formatSeconds(PlayerInfo.timeLeft);
  }

  addTimeLeft(time) {
    PlayerInfo.timeLeft += time;
  }
}
