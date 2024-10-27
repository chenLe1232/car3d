import { Component, _decorator, Node, isValid, Vec3 } from 'cc';
import MoveEngine from '../framework3D/misc/MoveEngine';
import GridObject from './Common/GridX/GridObject';
import Level from './Scenes/Level';
let { ccclass, property, menu } = _decorator;
@ccclass('Magnet ')
export default class Magnet extends Component {
  moveEngine: MoveEngine = null;
  target: Node = null;

  gridObject: GridObject = null;

  start() {
    this.moveEngine = this.getComponent(MoveEngine);
    if (this.moveEngine == null) {
      this.moveEngine = this.addComponent(MoveEngine);
    }
    this.moveEngine.setWorldSpace();
    this.moveEngine.maxSpeed = 2000;
    this.moveEngine.acceleration = 50;
    this.target = Level.instance.car.node;
    this.schedule(this.step, 0.05);
    this.gridObject = this.getComponent(GridObject);
  }

  step() {
    // let dist = Vec3.squaredDistance(this.gridObject.worldPosition, this.target.position);
    // if (dist < 8000) {
    //     Level.instance.car.eatItem(this.getComponent(GridObject))
    // }
    // let dist = Vec3.squaredDistance(this.gridObject.worldPosition, this.target.position);
    let dist = this.gridObject.worldPosition.z - this.target.position.z;
    if (dist < 0) {
      Level.instance.car.eatItem(this.getComponent(GridObject));
    }
  }

  update() {
    if (this.target.active) {
      let pos = this.target.position;
      if (isValid(this.moveEngine)) {
        this.moveEngine.target = pos;
        this.moveEngine.seek();
      }
    } else {
      this.destroy();
    }
  }
}
