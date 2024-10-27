import { Component, _decorator, Node, Vec2, v2, Vec3, v3 } from 'cc';
import { Grid3D } from './Grid3D';
import ccUtil from '../../../framework3D/utils/ccUtil';
let { ccclass, property } = _decorator;
@ccclass
/**
 * 该组件绑定到的节点必须在Grid3D的范围(Grid3D.size)内
 */
export default class GridObject extends Component {
  //对象类型
  id: number = 0;
  //所在格子
  grid: Grid3D = null;
  //子格子坐标
  coord: Vec3 = null;

  onLoad() {}

  destroySelf() {
    if (this.grid) this.grid.destroyObject(this);
  }

  start() {
    this.grid = ccUtil.getComponentInParent(this.node, Grid3D);
    if (this.grid && this.coord == null) {
      let coord = this.grid.positionToCoord(this.node.position);
      this.grid.addObject(this, coord);
    }
  }

  get worldPosition() {
    if (this.grid) return this.grid.convertToWorldPosition(this.node.position);
    else return this.node.worldPosition;
  }
}
