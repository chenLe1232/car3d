import { Car } from './Car';
import {
  instantiate,
  Node,
  ColliderComponent,
  ParticleSystemComponent,
  Quat,
  quat,
  Vec3,
  v2,
  Vec2,
  director,
  math,
  v3,
  setDefaultLogTimes,
  randomRangeInt,
  _decorator,
} from 'cc';
import Device from '../framework3D/misc/Device';
import { CarEatItem } from './CarEatItem';
import { buffSystem } from '../framework3D/misc/buffs/BuffSystem';
import FSM from '../framework3D/core/FSM';
import GridObject from './Common/GridX/GridObject';
import FizzBody, { FizzCollideInterface } from './Common/FizzX/FizzBody';
import AICar from './AICar';
import ccUtil from '../framework3D/utils/ccUtil';

const { ccclass, property } = _decorator;

enum State {
  Start, //起步
  Normal,
  SpeedUp,
  SpeedDown,
  RearEnd, //追尾
}

enum FlyState {
  Fly,
  Land,
}

@ccclass
export default class PlayerCar extends Car implements FizzCollideInterface {
  @property(Node)
  shieldNode: Node = null;
  @property(Node)
  speedNode: Node = null;
  @property(Node)
  spikeNode: Node = null;

  @property(Node)
  magnetNode: Node = null;

  @property(Node)
  windline: Node = null;

  invincible: boolean = false;

  @property(ParticleSystemComponent)
  ps_smoke: ParticleSystemComponent = null;

  @property(ParticleSystemComponent)
  ps_bang: ParticleSystemComponent = null;

  @property(Node)
  psnode_rush: Node = null;

  private fsm: FSM = null;
  private flyFsm: FSM = null;

  accessories: Node = null;
  itemPicker: CarEatItem = null;

  /**汽车高度的一半 */
  @property()
  landY: number = 20;

  _tmp_angles: Vec3 = v3();
  angleMax = 30;
  default_hw = 40;
  targetAngle: Vec3 = v3(0);

  onLoad() {
    super.onLoad();
    this.fsm = this.addComponent(FSM);
    this.fsm.init(this);
    this.fsm.addStates(State, '%s_%s');

    this.flyFsm = this.addComponent(FSM);
    this.flyFsm.init(this);
    this.flyFsm.addStates(FlyState, '%s_%s');
    this.flyFsm.enterState(FlyState.Land);
  }

  start() {
    this.default_hw = this.body.hw;
    this.itemPicker = this.getComponent(CarEatItem);
    if (this.shieldNode) {
      this.shieldEnabled = false;
    }
    if (this.speedNode) {
      this.speedEnabled = false;
    }
    if (this.spikeNode) {
      this.spikeEnabled = false;
    }
    // this.setup();
  }

  public set magnetEnabled(v) {
    this.magnetNode.active = v;
    if (v) {
      //开启
      Device.playSfx('Magnet');
    }
  }

  public get magnetEnabled() {
    return this.magnetNode.active;
  }

  public get speedEnabled() {
    return this.speedNode.active;
  }

  public set speedEnabled(v) {
    this.speedNode.active = v;
    this.windline.active = v;
  }

  public get spikeEnabled() {
    return this.spikeNode.active;
  }

  public set spikeEnabled(v) {
    this.spikeNode.active = v;
  }

  public get shieldEnabled(): boolean {
    return this.shieldNode.active;
  }
  public set shieldEnabled(value: boolean) {
    this.shieldNode.active = value;
  }

  //普通状态 下的最高速度
  normal_maxSpeed: number = 1500;
  //加速状态 下的最高速度
  speedup_maxSpeed: number = 3000;

  start_acc: number = 15;
  normal_acc: number = 30;
  speedup_acc: number = 80;

  public setStarAcc(acc) {
    this.start_acc = acc;
  }

  go(acc) {
    this.start_acc = acc;
    this.fsm.enterState(State.Start);
  }

  pause() {
    // this.moveEngine.pause();
  }

  resume() {
    // this.moveEngine.resume();
  }

  /**超级加速 */
  isSuperSpeed: boolean = false;

  //加速多少s结束
  speedup(dur = 0.25) {
    this.speedEnabled = true;
    this.fsm.changeState(State.SpeedUp, dur);
    //超级加速不可重置
    if (!this.isSuperSpeed) {
      this.fsm.resetTime();
    }
  }

  fly() {
    this.flyFsm.resetTime();
    this.flyFsm.changeState(FlyState.Fly);
    this.speedup();
  }

  ////////////////////////////////////////////////////////////////////////////////
  _rotate_fly: Vec3 = v3();
  private onEnter_Fly() {
    Device.vibrate();
    Device.playSfx('sfx_car_boost4');
    this.moveEngine.velocity.y = 500;
    this.psnode_rush.active = true;
    this._rotate_fly = this.node.eulerAngles;
  }

  gravity: Vec3 = v3(0, -15, 0);

  private onUpdate_Fly() {
    this.windline.active = true;
    let pos = this.node.position;
    if (pos.y < this.landY) {
      // this.node.position = v3()
      this.node.setPosition(pos.x, this.landY, pos.z);
      this.moveEngine.velocity.y = 0;
      this.flyFsm.changeState(FlyState.Land);
    } else {
      this.moveEngine.addForce(this.gravity);
      this._rotate_fly.z += 72;
      this.node.eulerAngles = this._rotate_fly;
    }
  }

  private onExit_Fly() {
    this.windline.active = false;
    this.psnode_rush.active = false;
    this.node.eulerAngles = Vec3.ZERO;
    Device.playSfx('sfx_car_bounce');
  }

  //////////////////////////////////////////////////////////////////////////////

  onEnter_Start() {
    this.moveEngine.maxSpeed = this.normal_maxSpeed;
    this.moveEngine.acceleration = this.start_acc;
  }

  onUpdate_Start() {
    if (
      this.fsm.timeElapsed > 2 ||
      this.moveEngine.velocity.z >= this.normal_maxSpeed
    ) {
      this.fsm.changeState(State.Normal);
    }
  }

  private onEnter_Normal() {
    if (this.moveEngine.velocity.z > this.normal_maxSpeed) {
      this.fsm.changeState(State.SpeedDown);
    } else {
      this.moveEngine.maxSpeed = this.normal_maxSpeed;
      this.moveEngine.acceleration = this.normal_acc;
    }
  }

  private onEnter_SpeedUp(state, dur) {
    Device.vibrate();
    Device.playSfx('sfx_car_boost' + randomRangeInt(2, 4));
    state.duration = dur;
    this.moveEngine.maxSpeed = this.speedup_maxSpeed;
    this.moveEngine.acceleration = this.speedup_acc;
    // this.windline.active = true
    this.speedEnabled = true;
  }

  private onExit_SpeedUp() {
    // this.windline.active = false
    this.speedEnabled = false;
  }

  private onEnter_SpeedDown() {}

  private onUpdate_SpeedDown() {
    this.moveEngine.maxSpeed *= 0.98;
    if (this.moveEngine.maxSpeed <= this.normal_maxSpeed) {
      this.fsm.changeState(State.Normal);
    }
  }

  private onUpdate_SpeedUp(state) {
    // if (this.moveEngine.speed)
    if (this.fsm.timeElapsed > state.duration) {
      //2s 后退出
      this.fsm.changeState(State.Normal);
    }
  }

  rearEnd() {
    Device.playSfx('impact' + g.randomInt(1, 3));
    Device.vibrate();
    this.moveEngine.velocity.z = this.normal_maxSpeed / 3;
    this.moveEngine.acceleration = this.normal_acc / 2;
    this.fsm.changeState(State.RearEnd);
  }

  onEnter_RearEnd() {
    // this.moveEngine.maxSpeed = this.normal_maxSpeed / 3;
  }

  onUpdate_RearEnd() {
    if (this.fsm.timeElapsed > 2) {
      this.fsm.changeState(State.Normal);
    }
  }

  ////////////////////////////////////////////////////////////////////////////

  setup() {
    // this.collider.node
    // this.collider.setGroup(PhysicsConst.Car);
    // this.collider.setMask(PhysicsConst.EnemyCar + PhysicsConst.Car)
    // this.collider.addMask(PhysicsConst.Item + PhysicsConst.Car)
    // for (var i = 0; i < this.dirColliders.length; i++) {
    //     var c = this.dirColliders[i];
    //     c.setGroup(PhysicsConst.CarDir)
    //     c.setMask(0)
    //     c.on("onTriggerEnter", this.onCol, this);
    // }
    // // setup accessories
    // this.accessories = this.node.getChildByName("car_accessories")
    // if (this.accessories == null) {
    //     this.accessories = instantiate(Root.instance.prefab_car_accessories);
    // } else {
    //     this.accessories.active = true;
    // }
  }

  onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
    // console.log(b.name, nx, ny)
    if (this.flyFsm.isInState(FlyState.Fly)) return;
    let other = b.getComponent(AICar);
    if (this.shieldEnabled) {
      //护盾状态 直接 撞击
      return other.crash(this);
    }
    if (ny < 0) {
      //追尾
      Device.vibrate(true);
      this.rearEnd();
      //给前车的推力
      other.applyImpact(v3(0, 0, -ny * 800));
    }
    if (nx != 0) {
      let reason = 'killedByPlayer';
      if (this.shieldEnabled) {
        reason = 'killedByShield';
      }
      other.crash(this, reason);
    }
    ccUtil.playParticles(this.ps_bang);
  }

  onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {
    // console.log(b.name)
  }
  onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number) {}

  onCol(e) {
    let colNode = e.otherCollider.node as Node;
    let otherCarNode = colNode.getParent().getParent();
    // console.log(e.selfCollider.node.name, e.otherCollider.node.name)
    if (e.selfCollider.node.name == 'front') {
      if (e.otherCollider.node.name == 'front') {
        //头对头撞玩家输了
        if (this.spikeEnabled) {
          //有尖刺时，可
          let car = otherCarNode.getComponent(Car);
          car.takeDamage(1);
          return;
        }
        // Root.instance.playStrike(colNode.worldPosition);
        this.takeDamage(1);
      } else {
        //胜
        let car = otherCarNode.getComponent(Car);
        car.takeDamage(1);
        // Root.instance.playStrike(colNode.worldPosition);
      }
    } else {
      // Root.instance.playStrike(colNode.worldPosition);
      this.takeDamage(1);
    }
  }

  takeDamage(damage) {
    if (this.invincible) return;
    //保护罩,免伤
    if (this.shieldEnabled) {
      //盾抵挡
      this.shieldEnabled = false;
      buffSystem.stop('Buff_Shield');
      //TODO: remove buff
    } else {
      super.takeDamage(damage);
    }
    this.invincible = true;
    this.scheduleOnce(this.setInvincible, 2);
  }

  setInvincible() {
    this.invincible = false;
  }

  tmpQuat: Quat = quat();
  _currentDir = v2();
  move(dir: Vec3) {
    if (this.isDead) return;
    dir.multiplyScalar(this.moveEngine.acceleration);
    this.moveEngine.addForce(dir);
    // let angle = v2(dir.x, dir.z).signAngle(Vec2.UNIT_Y)
    // // let diff = Vec2.dot(v2(dir.x, dir.z).normalize(), v2(this.velocity.x, this.velocity.z).normalize());
    // // if (diff < 0.8) {
    // //     //
    // //     this.ps_smoke.isEmitting = true;
    // // } else {
    // //     this.ps_smoke.isEmitting = false;
    // // }
  }

  setAngleStrength(len: number) {
    this._currentDir.x = len;
  }

  setAngle(targeteAngle: number) {
    this.angleMax = targeteAngle;
    this._currentDir.x = 1;
  }

  brake(s = 0.95) {
    this.moveEngine.velocity.multiplyScalar(s);
  }

  // timer_check = 0;

  update(dt) {
    // console.log(this.moveEngine.maxSpeed)
    // this.timer_check += dt
    // console.log(this.node.position.z / 600, this.timer_check);

    // dir
    let vel = this._currentDir;
    // if (vel.x == 0) return;
    let targetAngleY = -this.angleMax * vel.x;
    let angles = this.node.eulerAngles;

    this.body.hw = this.default_hw + Math.abs(targetAngleY / 2);

    this.targetAngle.y = targetAngleY;
    Vec3.lerp(this._tmp_angles, angles, this.targetAngle, 0.1);
    this.node.eulerAngles = this._tmp_angles;
  }

  eatItem(item: GridObject) {
    this.itemPicker.col(item);
  }
}
