import {
  Component,
  _decorator,
  Node,
  Vec3,
  v3,
  systemEvent,
  SystemEventType,
  System,
  director,
  easing,
  math,
  misc,
  ModelComponent,
  loader,
  Texture2D,
  CameraComponent,
  ParticleSystemComponent,
  tween,
  randomRangeInt,
  game,
  resources,
  assetManager,
} from 'cc';
import PlayerCar from '../PlayerCar';
import Switcher from '../../framework3D/ui/controller/Switcher';
import JoyStick from '../../framework3D/misc/JoyStick';
import CarSpawner from '../CarSpawner';
import LevelLoader from '../LevelLoader';
import FizzManager from '../Common/FizzX/FizzManager';
import FizzBody from '../Common/FizzX/FizzBody';
import GridMap1D from '../Common/GridX/GridMap1D';
import Device from '../../framework3D/misc/Device';
import { evt } from '../../framework3D/core/EventManager';
import PoolManager from '../../framework3D/core/PoolManager';
import AICar from '../AICar';
import { PlayerInfo } from '../Data/PlayerInfo';
import FSM from '../../framework3D/core/FSM';
import { CameraView } from '../../framework3D/misc/CameraView';
import { buffSystem } from '../../framework3D/misc/buffs/BuffSystem';
import { Buffs } from '../Buffs/BuffsRegistry';
import vm from '../../framework3D/ui/vm';
import GameHud from './parts/Level/GameHud';
import MoveEngine from '../../framework3D/misc/MoveEngine';
import ccUtil from '../../framework3D/utils/ccUtil';
import DataCar from '../Data/DataCar';
import { MergeStorage } from '../Common/MergeFramework/MergeStorage';
import Platform from '../../framework3D/extension/Platform';
import { UserInfo } from '../../framework3D/extension/weak_net_game/UserInfo';
//import StatHepler from "../../framework3D/extension/aldsdk/StatHelper";

let { ccclass, property } = _decorator;

enum State {
  Prepare, //准备
  Start, //起步
  Normal, //行驶
  Pause, //
  Win, //结束
  Lose, //失败
  End,
}

@ccclass
export default class Level extends Component {
  static instance: Level = null;
  @property(PlayerCar)
  car: PlayerCar = null;

  @property(Switcher)
  cameraSwitcher: Switcher = null;
  joyStick: JoyStick = null;

  @property(CarSpawner)
  carSpawner: CarSpawner = null;

  @property(LevelLoader)
  levelLoader: LevelLoader = null;

  @property(GridMap1D)
  map: GridMap1D = null;

  @property(ModelComponent)
  bg: ModelComponent = null;

  fsm: FSM = null;

  @property(CameraView)
  mainCamera: CameraView = null;

  @property(GameHud)
  hud: GameHud = null;

  @property(Node)
  caidai: Node = null;

  onLoad() {
    Level.instance = this;
    this.levelLoader.onLoadSpeical.on(this.loadCards, this);
    this.fsm = this.addComponent(FSM);
    this.fsm.init(this);
    this.fsm.addStates(State, '%s_%s');

    FizzManager.collisionMatrix[2][1] = 1;
  }

  playBGM() {
    Device.playBGM('GameBGM');
    Platform.loadSubPackage('Audio').then(v => {
      Device.playBGM('GameBGM');
    });
  }

  start() {
    game.setFrameRate(60);
    this.playBGM();
    this.joyStick = director.getScene().getComponentInChildren(JoyStick);

    systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
    systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this);
    systemEvent.on(SystemEventType.TOUCH_MOVE, this.onTouchMove, this);
    systemEvent.on(SystemEventType.TOUCH_CANCEL, this.onTouchCancel, this);

    systemEvent.on(SystemEventType.KEY_DOWN, this.keyDown, this);

    this.resetCar();

    // this.setBackground("skybox03")
    PlayerInfo.onLevelStart();

    this.fsm.enterState(State.Prepare);

    this.randomChooseBg();

    evt.on('AICar.crash', this.onBeginCrash, this);
  }

  onDestroy() {
    systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this);
    systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this);
    systemEvent.off(SystemEventType.TOUCH_MOVE, this.onTouchMove, this);
    systemEvent.off(SystemEventType.TOUCH_CANCEL, this.onTouchCancel, this);

    systemEvent.off(SystemEventType.KEY_DOWN, this.keyDown, this);

    assetManager.releaseAsset(this.assets_bg);

    evt.off(this);

    Device.stopAllEffect();
    this.removeBuffs();
  }

  assets_bg: Texture2D = null;

  /**
   * 设置背景
   */
  setBackground(bgName) {
    console.log('Level->setBackground' + 'Texture/sky/' + bgName + '/texture');
    resources.load(
      'Texture/sky/' + bgName + '/texture',
      Texture2D,
      (err, res) => {
        if (err) return console.error(err);
        this.assets_bg = res;
        this.bg.material.setProperty('mainTexture', res);
      }
    );
  }

  static mapNames = [
    'skybox01',
    'skybox02',
    'skybox03',
    'skybox04',
    'skybox05',
  ];

  randomChooseBg() {
    this.setBackground(g.getRandom(Level.mapNames));
  }

  loadCards(gid, pos) {
    if (gid == 18) {
      //慢车
      this.carSpawner.spawn(pos, 750);
    } else {
      //快车
      this.carSpawner.spawn(pos, 1000);
    }
  }

  keyDown(e) {
    //console.log(e);
    if (e.keyCode == 27) this.cameraSwitcher.switch();
    switch (e.rawEvent.key) {
      case 'w':
        // this.car.moveEngine.velocity.z = 100
        break;
      case 's':
        // this.car.moveEngine.velocity.z = -100;
        break;
      case 'a':
        // this.car.moveEngine.velocity.z = 100
        break;
      case 'd':
        // this.car.moveEngine.velocity.z = -100;
        break;
    }
  }

  moving = false;

  onTouchStart(e) {
    // this.moving = true
    this.joyStick.touchStart(e);
  }

  onTouchEnd(e) {
    // this.moving = false
    this.joyStick.touchEnd(e);
  }

  onTouchMove(e) {
    this.joyStick.touchMove(e);
  }

  onTouchCancel(e) {
    this.joyStick.touchCancel(e);
  }

  ///////////////////////////[fsm]////////////////////////////
  onEnter_Prepare() {
    vm.show('UI/UIStart', this.begin, this);
  }

  star_accs = [15, 30, 80, 80];

  /**
     *  完美起跑，获得加速和保护罩效果       加速度80，可加速至最高速度，加速和保护罩持续5秒
        高速起跑，获得加速效果        加速度80，可加速至最高速度，加速持续5秒
        加速起跑，加速度提升         加速度30，可加速至行驶速度（按照现在的正常加速度30理解）
        正常起跑，无变化            加速度15，可加速至行驶速度（可以称为起跑加速度，低于正常加速的30，仅在起跑的时候生效）
     * @param q 起步等级 
     */
  begin(q) {
    switch (q) {
      case 0:
      case 1:
        this.car.go(this.star_accs[q]);
        break;
      case 3:
        buffSystem.startBuff(Buffs.ShieldBuff, 5);
        buffSystem.startBuff(Buffs.SpeedupBuff, 5);
        break;
      case 2:
        buffSystem.startBuff(Buffs.SpeedupBuff, 5);
        break;
    }
    this.fsm.changeState(State.Normal);
  }

  onEnter_Normal() {
    MoveEngine.timeScale = 1;
    Device.playSfx('sfx_engine00', true);
    this.hud.begin();
  }

  checkBoundry() {
    let pos = this.car.node.position;
    //边界
    if (pos.x < -210) {
      this.car.node.setPosition(-210, pos.y, pos.z);
      // 给个反弹
      this.car.moveEngine.velocity.x = 2;
    } else if (pos.x > 210) {
      this.car.node.setPosition(210, pos.y, pos.z);
      this.car.moveEngine.velocity.x -= 2;
    }
    if (pos.x > 200) {
      let axis = this.joyStick.axis.x;
      if (axis < 0) {
        this.car.setAngleStrength(0);
      }
    } else if (pos.x < -200) {
      let axis = this.joyStick.axis.x;
      if (axis > 0) {
        this.car.setAngleStrength(0);
      }
    }
  }

  _move_vec: Vec3 = v3();

  onUpdate_Normal() {
    // if ((this.moving))
    let lr = this.joyStick.axis.x;
    let val;
    if (Math.abs(lr) < 0.4) {
      val = easing.sineIn(this.joyStick.axis.x);
      if (lr > 0) val = -val;
    } else {
      val = -lr;
    }
    // if (Math.abs(lr) < 0.6) lr = 0;
    this._move_vec.set(0, 0, 1);
    this.car.move(this._move_vec);

    let pos = this.car.node.position;
    this.car.node.setPosition(pos.x - this.joyStick.axis.x * 5, pos.y, pos.z);

    this.car.setAngleStrength(this.joyStick.axis.x);
    this.checkBoundry();
    //胜利判断
    if (this.car.node.position.z > this.levelLoader.endLinePos.z) {
      this.fsm.changeState(State.Win);
    }
    vm.show('UI/UIRevive');
    PlayerInfo.revived = 1;
    //失败判断
    if (PlayerInfo.timeLeft <= 0) {
      this.fsm.changeState(State.Lose);
    }
    let p = this.car.node.position.z / this.levelLoader.endLinePos.z;
    this.hud.updateDistance(p);
  }

  onEnter_Win() {
    // this.hud.stopWatch();
    // if(UserInfo.isNew){
    //     StatHepler.userAction("各个关卡成功的人数及次数","成功通过关卡",PlayerInfo.level);
    // }
    Device.stopSfx('sfx_engine00');
    this.hud.win();
    this.car.setAngle(randomRangeInt(-20, 20) + 180);
    Device.playSfx('sfx_racefinish');
    ccUtil.playParticles(this.caidai);
    tween(this.mainCamera)
      .to(1.0, { followScalar: 0 }, { easing: 'sineOut' })
      .start();
    this.removeBuffs();
    PlayerInfo.onLevelEnd(true);
  }

  onEnter_Lose() {
    this.pause();
    //321 时间 倒计时
    if (!PlayerInfo.revived) {
      vm.show('UI/UIRevive');
      PlayerInfo.revived = 1;
    } else {
      Device.stopSfx('sfx_engine00');
      vm.show('UI/UIEnd', false);
    }
    PlayerInfo.onLevelEnd(false);
  }

  removeBuffs() {
    buffSystem.stop(Buffs.MagnetBuff);
    buffSystem.stop(Buffs.SpeedupBuff);
    buffSystem.stop(Buffs.ShieldBuff);
  }

  onUpdate_Win() {
    // this.car.node.position
    this.car.brake(0.96);
    this.checkBoundry();
    if (this.fsm.timeElapsed > 1.5) {
      vm.show('UI/UIEnd', true);
      this.fsm.changeState(State.End);
    }
  }

  ///////////////////////////[fsm end]////////////////////////////

  onBeginCrash(car: AICar) {
    if (car.deadReason == 'killedByPlayer') {
      PlayerInfo.energyCount += 1;
    }
  }

  resetCar() {
    let d = ccUtil.get(DataCar, MergeStorage.maxMergeLv);
    this.car.normal_maxSpeed = d.speed;
    this.car.speedup_maxSpeed = d.maxSpeed;
    // this.car.maxHp = 2;
    // this.car.hp = 2;
  }

  async fireBomb() {
    let chlidren = this.carSpawner.node.children;
    // for (var i = chlidren.length - 1, c = 0; c < 4 && i > 0; c++ , i--) {
    // for (var i = chlidren.length - 1; i >= 0; i--) {
    let c = 0;
    for (var i = 0; i < chlidren.length; i++) {
      let carNode = chlidren[i];
      if (carNode) {
        let car = carNode.getComponent(AICar);
        this.playEffect('bomb', car.node.position);
        car.goDead();
        //不要 扔 炸弹，太难中， 使用冲击波
        await evt.sleep(0.1);
        c++;
        i--;
      }
      //最多爆炸4个
      if (c >= 3) break;
      // let missle_node = Root.instance.pool_missile.get(0);
      // let missile_node = PoolManager.get("bombPool").get("bomb");
      // let missle = missile_node.getComponent(Bomb);
      // missile_node.setPosition(this.car.node.position);
      // Device.playSfx("MissileFire")
      // missle.launch(car.getComponent(AICar), this.car.moveEngine.velocity);
    }
  }

  revive() {
    Device.playSfx('Revive');
    //增加5s时间
    PlayerInfo.timeLeft += 10;
    this.resume();
    this.fsm.changeState(State.Normal);
    //加速开启
    buffSystem.startBuff(Buffs.SpeedupBuff, 3);
    buffSystem.startBuff(Buffs.MagnetBuff, 3);
  }

  resume() {
    this.hud.resume();
    MoveEngine.timeScale = 1;
  }

  pause() {
    this.fsm.changeState(State.Pause);
    this.hud.pause();
    MoveEngine.timeScale = 0;
  }

  tmp_pos: Vec3 = v3();

  playEffect(prefabName, pos, duration = 1) {
    let node = PoolManager.get('EffectsPool').get(prefabName);
    let ps = node.getComponent(ParticleSystemComponent);
    Vec3.copy(this.tmp_pos, pos);
    this.tmp_pos.y = 0;
    node.setPosition(this.tmp_pos);
    ccUtil.playParticles(ps);
    evt.sleep(duration).then(v => PoolManager.get('EffectsPool').put(node));
    Device.vibrate();
  }
}
