import {
  Component,
  _decorator,
  Vec3,
  v3,
  Node,
  v2,
  Vec2,
  Quat,
  quat,
  director,
  Director,
} from 'cc';
let { ccclass, property, executionOrder } = _decorator;

@ccclass('MoveEngine')
@executionOrder(10)
export default class MoveEngine extends Component {
  @property
  acceleration: number = 2;

  velocity: Vec3 = v3();

  _maxVel: Vec3 = v3();
  _minVel: Vec3 = v3();

  force: Vec3 = v3();
  tmp_vec: Vec3 = v3();
  tmp_pos: Vec3 = v3();
  private _target: Vec3 = v3();

  public get target(): Vec3 {
    return this._target;
  }
  public set target(value: Vec3) {
    Vec3.copy(this._target, value);
  }

  @property
  auto: boolean = true;

  @property
  _maxSpeed: number = 10;
  @property
  get maxSpeed() {
    return this._maxSpeed;
  }

  set maxSpeed(v) {
    this._maxSpeed = v;
    this.updateMaxVelocity(v);
  }

  updateMaxVelocity(v) {
    this._maxVel = v3(v, v, v);
    this._minVel = v3(-v, -v, -v);
  }

  onLoad() {
    this.updateMaxVelocity(this.maxSpeed);
  }

  tmpQuat: Quat = quat();

  updateRotationY() {
    let v = this.velocity;
    if (v.x == 0 && v.y == 0) return;
    let angle = v2(v.x, v.z).signAngle(Vec2.UNIT_Y);
    let quad = Quat.fromAxisAngle(this.tmpQuat, Vec3.UNIT_Y, angle);
    this.node.rotation = quad;
  }

  _vel_normalized: Vec3 = v3();
  _lookQuat: Quat = quat();

  updateRotation() {
    let v = this.velocity;
    // Vec3.multiplyScalar(this._lookat_target, v, 2).add(this.node.position);
    Vec3.normalize(this._vel_normalized, v);
    Quat.fromViewUp(this._lookQuat, this._vel_normalized);
    this.node.rotation = this._lookQuat;
    // this.node.lookAt(this._lookat_target);
  }

  follow_vec: Vec3 = v3();

  seek_vec: Vec3 = v3();

  stop() {
    Vec3.zero(this.force);
    Vec3.zero(this.velocity);
  }

  follow() {
    Vec3.subtract(this.follow_vec, this.target, this.node.position);
    this.follow_vec.normalize();
    this.follow_vec.multiplyScalar(this.acceleration);
    // this.follow_vec.multiplyScalar(1).subtract(this.velocity);
    this.addForce(this.follow_vec);
  }

  seek() {
    if (this._isWorldSpace) {
      Vec3.subtract(this.seek_vec, this.target, this.node.worldPosition);
    } else {
      Vec3.subtract(this.seek_vec, this.target, this.node.position);
    }
    this.seek_vec.normalize();
    this.seek_vec.multiplyScalar(this.maxSpeed).subtract(this.velocity);
    this.addForce(this.seek_vec);
  }

  static _pauseAll: boolean = false;

  public static pauseAll() {
    this._pauseAll = true;
  }

  private static _timeScale: number = 1;
  public static set timeScale(v) {
    this._timeScale = v;
  }

  public static resumeAll() {
    this._pauseAll = false;
  }

  _isWorldSpace: boolean = false;

  setWorldSpace(b = true) {
    this._isWorldSpace = b;
  }

  _speed: number = 0;
  _isFullClamp: boolean = false;
  /**使用精准限速 */
  setClampSpeed(b = true) {
    this._isFullClamp = b;
  }

  get speed() {
    if (this._isFullClamp) {
      return this._speed;
    } else {
      this.velocity.length();
    }
  }

  _tmp_dir: Vec3 = v3();

  get dir() {
    this._tmp_dir.set(this.velocity);
    let s = this.speed;
    this._tmp_dir.set(
      this._tmp_dir.x / s,
      this._tmp_dir.y / s,
      this._tmp_dir.z / s
    );
    return this._tmp_dir;
  }

  update(dt) {
    if (!this.auto) return;
    if (MoveEngine._pauseAll) return;
    // let dt2 = director.getDeltaTime();
    // console.log(dt, dt2);
    // this.force.multiplyScalar(dt * MoveEngine._timeScale);
    this.velocity.add(this.force);
    if (this._isFullClamp) {
      let len = this.velocity.length();
      let len2 = Math.min(len, this.maxSpeed);
      this._speed = len2;
      this.velocity.set(
        (this.velocity.x / len) * len2,
        (this.velocity.y / len) * len2,
        (this.velocity.z / len) * len2
      );
    } else {
      this.velocity.clampf(this._minVel, this._maxVel);
    }
    // let dtscale: number = dt / (1 / 60.0);
    Vec3.multiplyScalar(
      this.tmp_vec,
      this.velocity,
      dt * MoveEngine._timeScale
    );
    if (this._isWorldSpace) {
      var pos = this.node.worldPosition;
      pos.add(this.tmp_vec);
      this.node.setWorldPosition(pos);
    } else {
      var pos = this.node.position;
      pos.add(this.tmp_vec);
      this.node.setPosition(pos);
    }

    this.force.set(0, 0, 0);
    this.velocity.multiplyScalar(0.99);
  }

  addForce(f: Vec3) {
    this.force.add(f);
  }
}
