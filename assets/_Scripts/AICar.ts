import {
  Component,
  _decorator,
  Node,
  Vec3,
  v3,
  Quat,
  quat,
  randomRange,
  randomRangeInt,
} from 'cc';
import { Car } from './Car';
import FSM from '../framework3D/core/FSM';
import Device from '../framework3D/misc/Device';
import { evt } from '../framework3D/core/EventManager';
let { ccclass, property } = _decorator;

enum State {
  Normal,
  //被追尾
  BeRearEnd,
  Crash,
  Dead,
}
@ccclass
export default class AICar extends Car {
  _moveForce: Vec3 = v3(0, 0, 100);

  fsm: FSM = null;

  onLoad() {
    super.onLoad();
    this.moveEngine.maxSpeed = 750;
    this.moveEngine.acceleration = 80;

    this.fsm = this.addComponent(FSM);
    this.fsm.init(this);
    this.fsm.addStates(State, '%s_%s');
    this.fsm.enterState(State.Normal);

    this.node.on('hit', this.onHit, this);
  }

  start() {}

  //变道
  changeLane() {}

  onHit() {
    this.takeDamage(this._hp);
  }

  deadReason: string;

  crash(car: Car, reason?: string) {
    //dead
    this.deadReason = reason;
    Device.vibrate();
    Device.playSfx('impact' + randomRangeInt(1, 3));
    let impact = this.vecFromTarget(car.node);
    impact.z *= 2;
    impact.x /= 2;
    impact.normalize().multiplyScalar(2000);
    impact.y = 500;
    this.fsm.changeState(State.Crash);
    if (impact.z < 0) {
      impact.z = 0;
    }
    this.moveEngine.velocity.set(impact);
    evt.emit('AICar.crash', this);
  }

  _crash_rotate: Quat = Quat.fromEuler(quat(), 0, 0, 20);

  onEnter_Crash() {
    this.moveEngine.maxSpeed = 3000;
    Quat.fromEuler(
      this._crash_rotate,
      randomRangeInt(0, 20),
      randomRange(0, 20),
      randomRange(0, 20)
    );
  }

  onUpdate_Crash(dt) {
    if (this.fsm.timeElapsed > 0.5 && this.node.position.y < 0) {
      this.fsm.changeState(State.Dead);
      return;
    }
    this.updateGravity();
    this.node.rotate(this._crash_rotate);
  }

  onEixt_Crash() {
    let pos = this.node.position;
    this.node.setPosition(pos.x, 0, pos.z);
    // this.moveEngine.acceleration = 0;
    this.moveEngine.velocity.set(0, 0, 0);
  }

  onEnter_Dead() {
    this.onDead.fire(this);
  }

  move() {
    this.moveEngine.addForce(this._moveForce);
  }

  update(dt) {
    super.update(dt);
    this.move();
  }

  onEnable() {
    this.moveEngine.velocity.set(0, 0, 0);
    this.deadReason = null;
  }

  onDisable() {
    this.fsm.changeState(State.Normal);
  }

  berearend_maxSpeed = 1000;
  normal_maxSpeed = 750;

  onEnter_BeRearEnd() {
    this.maxSpeed = this.berearend_maxSpeed;
  }

  onUpdate_BeRearEnd(dt) {
    this.updateImpact(dt);
    if (this.fsm.timeElapsed > 1) {
      this.fsm.changeState(State.Normal);
    }
  }

  onExit_BeRearEnd() {
    this.maxSpeed = this.normal_maxSpeed;
  }

  _impactForce: Vec3 = v3();

  stop() {
    Vec3.zero(this._impactForce);
  }

  applyImpact(force: Vec3) {
    // this._impactForce = force;
    Vec3.copy(this._impactForce, force);
    this.fsm.changeState(State.BeRearEnd);
  }

  updateImpact(dt) {
    this._impactForce.multiplyScalar(0.85);
    this.moveEngine.addForce(this._impactForce);
  }
}
