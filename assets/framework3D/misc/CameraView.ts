import { _decorator, Component, Node, Vec3, v3 } from 'cc';
const { ccclass, property, executeInEditMode, menu } = _decorator;

@ccclass('CameraView')
@menu('游戏脚本/CameraView')
export class CameraView extends Component {
  @property(Node)
  target: Node = null;

  @property(Vec3)
  offset: Vec3 = v3();

  @property
  followScalar: number = 0.1;

  start() {
    // Your initialization goes here.
  }

  pos: Vec3 = v3();
  _paused = false;

  update(dt) {
    if (this._paused) return;
    // Your update function goes here.
    var target = Vec3.add(this.pos, this.target.position, this.offset);
    this.node.position = Vec3.lerp(
      this.pos,
      this.node.position,
      target,
      this.followScalar * dt * 40
    );
    // this.node.position = Vec3.lerp(this.pos, this.node.position, target, this.followScalar);
    // this.node.position = target;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }
}
