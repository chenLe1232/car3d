import {
  _decorator,
  Component,
  Node,
  BoxColliderComponent,
  ColliderComponent,
  PhysicsSystem,
  Vec3,
  v3,
  Vec2,
  UIRenderComponent,
  UITransformComponent,
  director,
  v2,
} from 'cc';
import ccUtil from '../utils/ccUtil';
const { ccclass, property } = _decorator;
@ccclass
export default class JoyStick extends Component {
  @property(Node)
  outterCircle: Node = null;

  @property(Node)
  innerCircle: Node = null;

  @property({
    visible() {
      return !this.autoRadius;
    },
  })
  radius: number = 250;

  @property({
    visible() {
      return !this.autoRadius;
    },
  })
  innerCircleRadius: number = 20;

  real_radius: number = 100;

  // dynamic Joystick
  @property
  dynamicJoystick: boolean = false;

  @property
  autoRadius: boolean = true;

  private _isReleased = true;

  /**移动到指定位置手指位置 */
  @property({ displayName: '是否可移动', tooltip: '超过范围时，将随手指移动' })
  bmove = false;

  onLoad() {
    if (this.autoRadius) {
      this.radius = this.outterCircle.width / 2;
      this.innerCircleRadius = this.innerCircle.width / 2;
    }
    this.real_radius = this.outterCircle.width / 2;
    this.innerCircle.setPosition(Vec3.ZERO);
    this.node.active = false;
  }

  start() {
    // this.releaseStick();
  }

  get isReleased() {
    return this._isReleased;
  }

  releaseStick() {
    // let move = cc.moveTo(0.5, cc.Vec2.ZERO);
    // let action = move.easing(cc.easeExponentialOut());
    // this.innerCircle.runAction(action);
    this.innerCircle.setPosition(Vec3.ZERO);
    this._isReleased = true;

    if (this.dynamicJoystick) {
      this.scheduleOnce(this.delayClose, 0.1);
    }
  }

  delayClose() {
    this.node.active = false;
  }

  _axis: Vec2 = v2();
  _power: number = 0;

  get power() {
    return this._power;
  }

  get axis() {
    if (this._isReleased) return v2();
    let vec = this.innerCircle.getPosition();
    let len = vec.length();
    var power = len / this.radius;
    vec.multiplyScalar(1 / len);
    this._axis.set(vec.x * power, vec.y * power);
    this._power = power;
    return this._axis;
  }

  _tmp_moveOffset: Vec2 = v2();

  move(p: Vec2) {
    let worldP = p.clone();
    let vec = p.subtract(this._startPos);
    let mag = vec.length();
    let offset = mag - this.radius;
    if (offset > 0) {
      vec.normalize();
      if (this.bmove) {
        Vec2.copy(this._tmp_moveOffset, vec);
        offset = mag - this.real_radius;
        if (offset > 0) {
          this._tmp_moveOffset.multiplyScalar(offset);
          let v = this.innerCircle.getPosition();
          this._startPos.x = worldP.x - v.x;
          this._startPos.y = worldP.y - v.y;
          let pos = this.node.parent.transform.convertToNodeSpaceAR(
            v3(this._startPos.x, this._startPos.y, 0)
          );
          this.node.position = pos;
        }
      }
      vec.multiplyScalar(this.radius);
    }
    this.innerCircle.setPosition(vec.x, vec.y, 0);
  }
  _originPos: Vec2 = v2();
  _startPos: Vec2 = Vec2.ZERO;
  touch_id: number = null;
  touchStart(e) {
    if (this.touch_id != null && e.getID() != this.touch_id) return;
    let p = e.getUILocation();
    this._isReleased = false;
    this._startPos = p;
    this.unschedule(this.delayClose);
    this.node.active = true;
    if (this.dynamicJoystick) {
      // converto screen position
      let pos = this.node
        .getParent()
        .getComponent(UITransformComponent)
        .convertToNodeSpaceAR(v3(p.x, p.y, 0));
      this._originPos = v2(pos.x, pos.y);
      this.node.setPosition(pos);
      // this.node.opacity = 0;
      // this.node.runAction(cc.fadeIn(0.5));
    }
  }

  touchMove(e) {
    if (this.touch_id != null && e.getID() != this.touch_id) return;
    let p = e.getUILocation();

    this.move(p);
  }

  touchEnd(p: Vec2) {
    // this.move(p);
    this.releaseStick();
    this.touch_id = null;
  }

  touchCancel(e) {
    this.releaseStick();
    this.touch_id = null;
  }
}
