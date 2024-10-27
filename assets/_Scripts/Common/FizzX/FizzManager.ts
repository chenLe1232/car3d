import { Vec2, v3, _decorator, Component, Vec3, Node, director } from 'cc';
import Fizz from './fizz';
import Shapes from './shapes';
import FizzBody from './FizzBody';

const { ccclass, property, executionOrder } = _decorator;

@ccclass
@executionOrder(-1)
export default class FizzManager extends Component {
  static instance: FizzManager = null;

  static collisionMatrix: number[][] = [[], [], []];

  /**是否使用QuadTree分区, 地图小，刚体大时建议关闭 */
  @property
  partionEnabled: boolean = true;

  @property
  gravity: Vec3 = v3(0, -1000, 0);

  @property
  debug: boolean = false;

  @property
  ignore_up_drag: boolean = true;

  _inited: boolean = false;

  /**仅做碰撞检测 */
  @property({ displayName: '仅碰撞检测' })
  colDetectOnly: boolean = true;

  onLoad() {
    FizzManager.instance = this;

    Fizz.ignore_up_drag = this.ignore_up_drag;

    window['fizz'] = Fizz;
  }

  onDestroy() {
    Fizz.cleanup();
    FizzManager.instance = null;
  }

  private _init() {
    // if (this.tiledmap) {
    //     let size = this.tiledmap.getMapSize();
    //     let tilesize = this.tiledmap.getTileSize();
    //     let w = size.width * tilesize.width;
    //     let h = size.height * tilesize.height
    //     Fizz.init(w, h, this.shouldCollide.bind(this));
    //     FizzHelper.initWithMap(this.tiledmap);
    // }
    Fizz.setPartition(this.partionEnabled);
    Fizz.setGravity(this.gravity.x, this.gravity.y);
  }

  init() {
    if (!this._inited) {
      this._init();
      this._inited = true;
    }
  }

  start() {
    this.init();
  }

  getCenter(node: Node) {
    // return Common.getPositionToNodeSpaceAR(node,this.node);
    // let rect = node.getBoundingBox()
    // let c = node.parent.convertToWorldSpaceAR(rect.center)
    // return this.node.convertToNodeSpaceAR(c);
    return Vec3.ZERO;
  }

  private drawRect(shape) {
    let [x, y, hw, hh] = Shapes.bounds(shape);
    // this.graphics.fillRect(x - hw, y - hh, hw * 2, hh * 2);
  }

  lateUpdate() {
    Fizz.update(director.getDeltaTime());
    // if (this.debug) {
    //     // this.graphics.clear()
    //     Fizz.statics.forEach(v => this.drawRect(v))
    //     Fizz.dynamics.forEach(v => this.drawRect(v))
    //     Fizz.kinematics.forEach(v => this.drawRect(v))
    // }
    // Fizz.statics.forEach(v=>{
    //     if(v.node)
    //         v.node.position = v
    // })
    // Fizz.kinematics.forEach(v=>v.node.position = v)
  }

  shouldCollide(c1: FizzBody, c2: FizzBody) {
    let node1 = c1.node,
      node2 = c2.node;
    if (node1 == null || node2 == null) return true;
    let collisionMatrix = FizzManager.collisionMatrix;
    return node1 !== node2 && collisionMatrix[node1.layer][node2.layer];
  }
}
