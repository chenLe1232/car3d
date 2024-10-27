import {
  Component,
  _decorator,
  CCClass,
  Node,
  macro,
  misc,
  randomRange,
  math,
  Quat,
  quat,
  Vec2,
  Vec3,
  v3,
  v2,
  instantiate,
  Prefab,
  randomRangeInt,
  CameraComponent,
} from 'cc';

import Device from '../framework3D/misc/Device';
import { PlayerInfo } from './Data/PlayerInfo';
import AICar from './AICar';
import ccUtil from '../framework3D/utils/ccUtil';
import PoolManager from '../framework3D/core/PoolManager';
import InfoCar from './Common/MergeFramework/InfoCar';
import Level from './Scenes/Level';

let { ccclass, property } = _decorator;
@ccclass('CarSpawner')
export default class CarSpawner extends Component {
  //用于随机的车型的列表
  template_cars: Prefab[] = []; // ref
  template_num: number = 0;
  template_acc: number = 0;
  template_speed: number = 0;

  poolManager: PoolManager;

  @property(CameraComponent)
  camera: CameraComponent = null;

  @property()
  thesholdToRemovePrev: number = 0;

  onLoad() {
    this.poolManager = new PoolManager(this.node, this.onCreateObject, this);
  }

  onCreateObject(path) {
    return instantiate(path);
  }

  start() {}

  onEnabled() {}

  onDisabled() {}

  setTemplate(randomPool, num, acc, speed) {
    this.template_cars = randomPool;
    this.template_num = num;
    this.template_acc = acc;
    this.template_speed = speed;
  }

  clearTemplate() {
    this.template_cars = null;
  }

  onEnable() {
    this.clearCars();
  }

  clearCars() {}

  onDisable() {
    this.clearCars();
  }

  reset() {}

  spawn(pos: Vec3, speed = 1000) {
    let car = ccUtil.get(InfoCar, randomRangeInt(1, 7));
    ccUtil.getPrefab(car.prefab_path).then(v => {
      // let node = instantiate(v) as Node;
      let node = this.poolManager.get(v);
      let car = node.addComponent(AICar);
      car.onDead.on(this.onDead, this);
      node.parent = this.node;
      node.worldScale = node.scale;
      node.setRotationFromEuler(0, 0, 0);
      node.position = pos;
      car.revive(10);
      car.acc = this.template_acc || 80;
      car.maxSpeed = speed || 750;
    });
  }

  c = 0;

  onDead(car: AICar) {
    //siwang
    // car.onDead.remove(this.onDead, this)
    // Root.instance.playExplosionBomb(car.node.position);
    if (this.c++ % 2 == 0) {
      Device.playSfx('ExplosionA');
    } else {
      Device.playSfx('ExplosionB');
    }
    PlayerInfo.tmp_killed += 1;
    //enmy dead
    Device.vibrate();
    //@ts-ignore
    car.node.position.y = 0;
    Level.instance.playEffect('bomb', car.node.position);
    // PlayerInfo.score += LvManager.instance.scoreTable.kill;
    // PlayerInfo.kill += 1;
    // Root.instance.gameUI.updateKill();
    // car.node.destroy();
    // car.node.removeFromParent();
    this.poolManager.put(car.node);
  }

  onDestroy() {
    this.poolManager.destroy();
  }

  onPlayerDead() {
    // all car  lose target
    // for (var i = 0; i < this.enemyCars.length; i++) {
    //     var e = this.enemyCars[i];
    //     e.follow = false;
    // }
    // Device.playSfx("ExplosionSelf")
  }

  removeCar(child: Node) {
    let car = child.getComponent(AICar);
    if (car.deadReason) {
      PlayerInfo.tmp_killed += 1;
    }
    car.deadReason = null;
    // car.onDead.remove(this.onDead, this)
    this.poolManager.put(child);
  }

  update() {
    for (let i = 0; i < this.node.children.length; i++) {
      const child = this.node.children[i];
      let segP = child.position.z;
      let objP = this.camera.node.position.z;
      let distance = objP - segP;
      if (distance > this.thesholdToRemovePrev) {
        this.removeCar(child);
        break;
      }
    }
  }
}
