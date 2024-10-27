import { _decorator, Component, Node, Vec2, v2, v3, Vec3 } from 'cc';
import { Grid3D } from './Grid3D';
const { ccclass, property } = _decorator;

/**
 *  还未调试
 */
@ccclass
export class GridMap2D extends Component {
  grids: { [index: string]: Grid3D } = {};
  offset: Vec2 = v2(50, 50);

  start() {
    for (var i = 0; i < this.node.children.length; i++) {
      let child = this.node.children[i];
      let coord = this.positionToGridPos(child.position.x, child.position.z);
      let id = this.getId(coord.x, coord.y);
      let grid = child.getComponent(Grid3D);
      grid.pos.x = coord.x;
      grid.pos.z = coord.y;
      grid.pos.y = 1;
      this.grids[id] = grid;
    }
  }

  reset() {
    for (var k in this.grids) {
      let g = this.grids[k];
      g.reset();
    }
  }

  tmp_list: Vec2[] = [];

  getNineDirList(grid: Grid3D) {
    this.tmp_list.splice(0);
    let gx = grid.pos.x;
    let gy = grid.pos.z;
    let left = v2(gx - 1, gy);
    let right = v2(gx + 1, gy);
    let top = v2(gx, gy + 1);
    let bottom = v2(gx, gy - 1);
    let left_top = v2(gx - 1, gy + 1);
    let right_top = v2(gx + 1, gy + 1);
    let left_bottom = v2(gx - 1, gy - 1);
    let right_bottom = v2(gx + 1, gy - 1);
    this.tmp_list.push(left);
    this.tmp_list.push(right);
    this.tmp_list.push(top);
    this.tmp_list.push(bottom);
    this.tmp_list.push(left_top);
    this.tmp_list.push(right_top);
    this.tmp_list.push(left_bottom);
    this.tmp_list.push(right_bottom);
    return this.tmp_list;
  }

  //当前grid 坐标
  generate(x, y) {
    let grid = this.getGridByGridPos(x, y);
    if (grid == null) return;
    let dirs = this.getNineDirList(grid);
    let ajacentGrids = [];
    let empty_xy = [];
    dirs.forEach(v => {
      let grid = this.getGridByGridPos(v.x, v.y);
      if (grid == null) {
        empty_xy.push(v);
        //all grids need to be filled
      } else {
        //all ajacent grids
        ajacentGrids.push(grid);
      }
    });
    //no cell need to be filled
    if (empty_xy.length == 0) {
      return;
    }
    ///获得非邻近的格子
    let reuseGrids: Grid3D[] = [];
    for (var k in this.grids) {
      let g = this.grids[k];
      if (g == grid) continue;
      if (ajacentGrids.indexOf(g) < 0) {
        // can be resued grids
        reuseGrids.push(g);
      }
    }

    for (var i = 0; i < empty_xy.length; i++) {
      let g = reuseGrids[i];
      delete this.grids[g.id];
      let xy = empty_xy[i];
      g.reuse(xy);
      this.grids[g.id] = g;
    }
  }

  getId(x, y) {
    return x + '_' + y;
  }

  /**
   * @param g 格子坐标
   */
  public getGridByGridPos(x, y) {
    let id = this.getId(x, y);
    // let id = this.id(x, y);
    return this.grids[id];
  }

  /**
   * 本地坐标 - > 格子对象
   * @param v cocos 本地坐标
   */
  public whichGrid(x, y) {
    let g = this.positionToGridPos(x, y);
    return this.getGridByGridPos(g.x, g.y);
  }

  positionToGridPos(x, y) {
    let gx = Math.floor(x / 100);
    let gy = Math.floor(y / 100);
    return v2(gx, gy);
  }
}
