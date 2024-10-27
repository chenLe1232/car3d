import {
  _decorator,
  Component,
  Node,
  UITransformComponent,
  Vec2,
  Prefab,
  v3,
  Vec3,
  v2,
  instantiate,
} from 'cc';
import MergeGrid from './MergeGrid';
import { evt } from '../framework3D/core/EventManager';
import MergeEntity from './MergeEntity';
import ccUtil from '../framework3D/utils/ccUtil';
import qanim from '../framework3D/extension/qanim/qanim';
import { EaseType } from '../framework3D/extension/qanim/EaseType';
import BreathAnim from '../framework3D/extension/qanim/BreathAnim';
import RewardBox, { BoxQuality } from './RewardBox';
import QMerge from './QMerge';
import PoolManager from '../framework3D/core/PoolManager';
import { Signal } from '../framework3D/core/Signal';

const { ccclass, property, menu } = _decorator;

let DRAG_OPACITY = 100;
let FULL_OPACITY = 255;

enum AddRet {
  NoFreeSpace,
  OK,
}

export interface MergeEntityData {
  id: number;
  next: number;
  image: string;
}

@ccclass
export default class MergePanel extends Component {
  // enum s
  public static AddRet = AddRet;

  public static main: MergePanel = null;

  /** 自动打开盒子时间  */
  @property
  auto_open_delay: number = 2;

  @property(Node)
  slotLayoutNode: Node = null;
  @property(Node)
  template_entity: Node = null;

  @property(Node)
  entityLayer: Node = null;

  drag_ent: MergeEntity = null;
  curSelEnt: MergeEntity = null;

  dragBeganSignal: Signal = new Signal();
  dragEndedSignal: Signal = new Signal();
  dragCancelSignal: Signal = new Signal();

  @property
  lockFeature: boolean = false;

  canOp: boolean = true;

  public data: { [index: number]: MergeEntityData } = {};

  /**每个合成体产出间隔 */
  @property
  outputInterval: number = 1;
  /** 每个合成体产出显示间隔 */
  @property
  showOutputInterval: number = 5;

  /**合成产出加成 */
  outputScale: number = 1;

  // @property()
  // mergeAnimDist: number = 100;
  // @property()
  // mergeAnimDur: number = 0.4;

  getEntityData(id: number) {
    return this.data[id];
  }

  setEntityData(id: number, data: MergeEntityData) {
    this.data[id] = data;
  }

  onLoad() {
    MergePanel.main = this;
    this.slotLayoutNode.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
    this.slotLayoutNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
    this.slotLayoutNode.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
    this.slotLayoutNode.on(
      Node.EventType.TOUCH_CANCEL,
      this.onTouchCancel,
      this
    );
    window['MergePanel'] = this;
  }

  start() {}

  _grids: MergeGrid[] = null;

  get grids(): MergeGrid[] {
    if (this._grids == null) {
      this._grids = this.slotLayoutNode.getComponentsInChildren(MergeGrid);
    }
    return this._grids;
  }

  /**所有合成体 */
  public get allEntities() {
    return this.grids.filter(v => v.entity != null);
  }

  async initWithMap(map: number[], addCallback?, finishCalback?) {
    for (var i = 0; i < 12; i++) {
      let v = map[i];
      if (v > 0) {
        let [ret, com] = this.addToGrid(this.grids[i], v, true);
        if (ret == AddRet.OK) {
          addCallback && addCallback(com);
        }
        await evt.sleep(0.03);
      } else if (v < 0) {
        if (this.lockFeature) {
          this.grids[i].isLock = true;
        }
      }
    }
    finishCalback && finishCalback();
  }

  fitToGrids() {
    this.grids.forEach(v => {
      if (v.entity) {
        this.setIndex(v.entity, v.index);
      }
    });
  }

  uncover(index) {
    let grid = this.grids[index];
    grid.uncover();
  }

  unlock(index?) {
    let grid: MergeGrid = null;
    if (index) {
      grid = this.grids[index];
    } else {
      grid = this.grids.find(v => v.isLock == true);
      if (!grid) {
        console.warn('No Grid To Unlock !');
        return;
      }
    }
    grid.unlock();
    evt.emit('QMerge.UnlockGrid', this.getMap(), grid);
  }

  getMap() {
    return this.grids.map(v => {
      let id = 0;
      if (v.entity) {
        id = v.entity.id;
      } else if (v.isLock) {
        id = -1;
      }
      return id;
    });
  }

  debug() {
    for (var i = 0; i < 4; i++) {
      let ts = '';
      for (var j = 0; j < 4; j++) {
        let grid = this.grids[j + i * 4];
        let id = 0;
        if (grid && grid.entity) {
          id = grid.entity.id;
        }
        ts += id + '\t';
      }
      console.log(ts + '\n');
    }
  }

  pos_touch_last: Vec2 = v2();

  //fit to position
  fitToGridWithPos(entity: MergeEntity) {
    let c = ccUtil.getWorldPos(entity.node);
    let grid = this.whichGrid(c);
    if (grid) this.moveToIndex(entity, grid.index);
  }

  private isEntityManaged(entity: MergeEntity) {
    if (entity == null) return true;
    if (entity.id == 0) {
      //id 为0 的是模板Entity
      return true;
    }
    let grid = this.grids.find(v => {
      if (v.entity) {
        return v.entity == entity;
      }
    });
    return grid != null;
  }

  //修复” 脱离轨道“ 的MergeEntity
  private fix() {
    this.entityLayer.children.forEach(v => {
      let ent = v.getComponent(MergeEntity);
      let b = this.isEntityManaged(ent);
      if (!b) {
        //不在管理内的，删除
        v.destroy();
      }
      //移动到正确的位置
      // if (ent)
      //     this.moveToIndex(ent, ent.index);
    });
  }

  onTouchBegan(e) {
    if (!this.canOp) return;
    // console.log(e);
    let point = e.getUILocation(); // world position
    this.pos_touch_last.x = point.x;
    this.pos_touch_last.y = point.y;

    point = this.slotLayoutNode.transform.convertToNodeSpaceAR(
      v3(point.x, point.y, 0)
    );
    let grid = this.grids.find(v =>
      v.transform.getBoundingBox().contains(point)
    );

    if (grid && grid.entity) {
      if (grid.canDrag) {
        let ok = this.onDragBegan(grid.entity);
        return !ok;
      }
    }
    return true;
  }

  onTouchMoved(e) {
    if (!this.canOp) return;
    let pos = e.getUILocation() as Vec2;
    let x = pos.x,
      y = pos.y;
    if (this.drag_ent) {
      // let offset =  posthis.pos_touch_last
      let offset = pos.subtract(this.pos_touch_last);
      this.drag_ent.node.position = this.drag_ent.node.position.add3f(
        offset.x,
        offset.y,
        0
      );
    }
    this.pos_touch_last.x = x;
    this.pos_touch_last.y = y;
  }

  onTouchEnded(e) {
    if (!this.canOp) return;
    if (this.drag_ent) {
      let pos = e.getUILocation();
      this.onDragEnd(pos);
      this.drag_ent = null;
      this.curSelEnt = null;
    } else {
    }
  }

  onTouchCancel(e) {
    this.onDragCancel();
  }

  //create draggable ent
  cloneMergeEntity(ent: MergeEntity) {
    let node = instantiate(this.template_entity) as Node;
    let comEnt = node.getComponent(MergeEntity);
    comEnt.id = ent.id;
    comEnt.index = ent.index;
    comEnt.updateAvatar();
    node.parent = this.entityLayer;
    return node.getComponent(MergeEntity);
  }

  createMergeEntity(id, index) {
    let node = instantiate(this.template_entity) as Node;
    let comEnt = node.getComponent(MergeEntity);
    comEnt.id = id;
    this.setIndex(comEnt, index);
    comEnt.updateAvatar();
    node.parent = this.entityLayer;
    return comEnt;
  }

  setIndex(obj: MergeEntity, index: number) {
    obj.index = index;
    obj.node.position = this.getPositionAtIndex(index);
  }

  /**找空闲格子 */
  findEmptyGrid() {
    let grid = this.grids.find(
      v => !v.isLock && v.isUncover && v.entity == null
    );
    return grid;
  }

  hasEmptySpace() {
    return this.findEmptyGrid() != null;
  }

  //查拭所有可以合成的匹配项
  findMatches(): MergeGrid[][] {
    let grid_mathes = [];
    for (var i = 0; i < this.grids.length; i++) {
      let c = this.grids[i];
      for (var j = i + 1; j < this.grids.length; j++) {
        let o = this.grids[j];
        if (c.entity && o.entity && o.isUncover && c.isUncover) {
          if (c.entity.id == o.entity.id) {
            let match = [c, o];
            grid_mathes.push(match);
            break;
          }
        }
      }
    }
    return grid_mathes;
  }

  //自动合成一把
  doMerge() {
    //先合高等级
    let matches = this.findMatches();
    if (matches.length > 0) {
      //找到当前最高级枪
      matches.sort((a, b) => {
        return b[0].entity.id - a[0].entity.id;
      });
      let grid: MergeGrid[] = matches[0];
      let drag = grid[1].entity;
      let target = grid[0].entity;
      // let move = cc.moveTo(0.3, target.node.position).easing(cc.easeSineOut())
      //中间不可做其它 操作
      this.canOp = false;
      if (this.drag_ent) {
        this.onDragCancel();
      }
      qanim
        .moveTo(this.drag_ent.node, 0.3, target.node.position, EaseType.sineOut)
        .then(_ => {
          target.merge(drag);
          this.canOp = true;
          this.removeMergeEntity(drag);
          //释放
        });
      return true;
    } else {
      console.warn('未发现可合成项目!');
      return false;
    }
  }

  findMinLevelGrid() {
    let min = this.grids.find(v => v.entity != null);
    if (min) {
      min = this.grids
        .filter(v => v.canDrag && v.entity)
        .reduce((min, v) => (v.entity.id < min.entity.id ? v : min), min);
    }
    return min;
  }

  // find max level
  findMaxLevelGrid() {
    let max = this.grids.find(v => v.entity != null);
    if (max) {
      max = this.grids
        .filter(v => v.canDrag && v.entity)
        .reduce((max, v) => (v.entity.id > max.entity.id ? v : max), max);
    }
    return max;
  }

  /**获取格子 */
  getGrid(index) {
    return this.grids[index];
  }

  addToGrid(
    grid: MergeGrid,
    id: number,
    noMsg: boolean = false
  ): [AddRet, MergeEntity] {
    if (grid) {
      let obj = this.createMergeEntity(id, grid.index);
      grid.entity = obj;
      // add new entity
      if (!noMsg) evt.emit(QMerge.Event.Add, grid);
      return [AddRet.OK, obj];
    }
    return [AddRet.NoFreeSpace, null];
  }

  /**在空闲位置增加 */
  addMergeEntity(id: number): [AddRet, MergeEntity] {
    //find empty
    let grid = this.findEmptyGrid();
    return this.addToGrid(grid, id);
  }

  cancellingEntities: { [index: number]: MergeEntity[] } = {};

  /**标记 拖动的合成休还正在清理 */
  tagCancelBegin(drag_ent) {
    let index = drag_ent.index;
    if (this.cancellingEntities[index] == null) {
      this.cancellingEntities[index] = [];
    }
    this.cancellingEntities[index].push(drag_ent);
  }
  /**标记 拖动的合成休还已清理完毕 */
  tagCancelFinished(drag_ent) {
    let index = drag_ent.index;
    if (this.cancellingEntities[index] == null) {
      this.cancellingEntities[index] = [];
    }
    this.cancellingEntities[index].splice(
      this.cancellingEntities[index].indexOf(drag_ent),
      1
    );
  }

  isAllCancelFinished(index) {
    return this.cancellingEntities[index].length == 0;
  }

  /**
   * 动画完后自动清理, 还原状态，清理 正在拖动的合成体
   * @param ent 格子里的合成组件
   * @param drag_ent_tmp 复制格子里拖动的为合成组件
   */
  dragBackCleanup(ent: MergeEntity, drag_ent_tmp) {
    drag_ent_tmp.del();
    this.tagCancelFinished(drag_ent_tmp);
    if (this.isAllCancelFinished(drag_ent_tmp.index)) {
      if (this.drag_ent && this.drag_ent.index == drag_ent_tmp.index) {
        ent.opacity = DRAG_OPACITY;
      } else {
        ent.opacity = FULL_OPACITY;
      }
    } else {
      ent.opacity = DRAG_OPACITY;
    }
  }

  onDragCancel() {
    this.stopHighlight();
    let dragEnt = this.getDragEnt();
    this.dragCancelSignal.fire(dragEnt);
    if (this.drag_ent) {
      let ent = this.curSelEnt;
      let drag_ent_temp = this.drag_ent;
      this.tagCancelBegin(drag_ent_temp);
      qanim.moveTo(drag_ent_temp.node, 0.1, ent.node.position).then(_ => {
        //移动结束 直接 删除
        //
        this.dragBackCleanup(ent, drag_ent_temp);
      });
    }
    this.curSelEnt = null;
    this.drag_ent = null;
  }

  onDragBegan(ent: MergeEntity) {
    //开始拖动
    if (this.curSelEnt) {
      return false;
    }
    ent.opacity = DRAG_OPACITY;
    this.curSelEnt = ent;
    //start drag
    this.drag_ent = this.cloneMergeEntity(ent);
    this.dragBeganSignal.fire(this.drag_ent);
    // }
    this.drag_ent.node.position = ent.node.position;
    //查找所有匹配的枪支，突出显示
    this.highlightAvaliable();
    return true;
  }

  /**突出显示可以合成的 */
  highlightAvaliable() {
    let coms = this.entityLayer.getComponentsInChildren(MergeEntity);
    coms = coms.filter(
      v => v.id == this.drag_ent.id && v != this.drag_ent && v != this.curSelEnt
    );
    coms.forEach(v => {
      if (!v.grid.canDrag) return;
      v.grid.showHighlight();
      let anim = ccUtil.getOrAddComponent(v.node, BreathAnim);
      anim.duration = 0.4;
      anim.minScale = v3(1, 1, 1);
      anim.maxScale = v3(1.2, 1.2, 1);
      anim.reset();
      anim.enabled = true;
      // let act = cc.sequence(cc.scaleTo(0.2, 1), cc.scaleTo(0.2, 1.2)).repeatForever();
    });
  }
  /** 停止所有动画 */
  stopHighlight() {
    let coms = this.entityLayer.getComponentsInChildren(MergeEntity);
    coms.forEach(v => {
      // v.node.stopAllActions();
      qanim.stopAll(v.node);
      v.grid.hideHighlight();
      v.node.scale = Vec3.ONE;
      // v.node.runAction(cc.scaleTo(0.1, 1));
    });
  }

  removeMergeEntity(ent: MergeEntity, removeNode = true) {
    if (ent) {
      let grid = this.grids.find(v => v.index == ent.index);
      if (grid.entity != null) {
        console.log(
          cc.js.formatStr('[QMerge]位置%s 移除id:%s', ent.index, ent.id)
        );
      }
      if (removeNode) ent.del();
      grid.entity = null;
    }
  }

  removeDragEnt() {
    if (this.curSelEnt) {
      let grid = this.curSelEnt.grid;
      this.removeMergeEntity(this.drag_ent);
      this.removeMergeEntity(this.curSelEnt);
      this.curSelEnt = null;
      this.drag_ent = null;
      evt.emit(QMerge.Event.Remove);
      return grid;
    } else {
      console.warn('[bug-report] removeDragCom fail');
    }
  }

  //删除当前的合成对象
  removeCurrent() {
    this.removeMergeEntity(this.drag_ent, false);
    this.removeMergeEntity(this.curSelEnt);
    this.tagCancelFinished(this.curSelEnt);

    evt.emit(QMerge.Event.Remove);
    this.drag_ent = null;
  }

  _tmpPos: Vec3 = v3();

  playMergeAnim(originEnt: MergeEntity, dragEnt: MergeEntity) {
    // let p = this._tmpPos.set(originEnt.node.position)
    // originEnt.node.setPosition(p.x - this.mergeAnimDist, p.y, p.z);
    // dragEnt.node.setPosition(p.x + this.mergeAnimDist, p.y, p.z);
    // qanim.moveTo(originEnt.node, this.mergeAnimDur, p)
    // qanim.moveTo(dragEnt.node, this.mergeAnimDur, p).then(v => {
    //     this.removeMergeEntity(dragEnt);
    // })
    // let pos = this.getPositionAtIndex(originEnt.index);
  }

  onDragEnd(pos) {
    //结束
    //如果命中格子
    this.stopHighlight();
    let grid = this.whichGrid(pos);
    if (grid == null) {
      ///找不到合适的格子
      this.onDragCancel();
      console.warn('未找到合适的格子');
      return;
    }
    if (grid && !grid.canDrag) {
      this.onDragCancel();
      return;
    }
    let index = grid.index;
    let ent = this.getEntByIndex(index);
    let dragEnt = this.getDragEnt();
    this.dragEndedSignal.fire(dragEnt);
    //如果目标格子里的枪和拖动的枪是同一种类型
    if (ent) {
      if (index == this.curSelEnt.index) {
        this.onDragCancel();
        return;
      }
      if (ent.isSameType(dragEnt)) {
        let ok = ent.merge(dragEnt);
        if (ok) {
          console.log(
            cc.js.formatStr('[QMerge]位置：%s 合成Id:%s', ent.index, ent.id)
          );
          this.removeMergeEntity(dragEnt);
          this.removeMergeEntity(this.curSelEnt);
          this.playMergeAnim(ent, dragEnt);
          this.onDragCancel();
          this.tagCancelFinished(dragEnt);
          evt.emit(QMerge.Event.Merge, ent, dragEnt);
        } else {
          //合成失败,目前暂时是顶级导致的失败
          this.onDragCancel();
        }
      } else {
        ///如果 格子里的枪和拖动的枪不是同一种类型
        this.removeMergeEntity(this.curSelEnt);
        this.switchPosition(ent, dragEnt);
        //test
        this.debug();
      }
    } else {
      //如果没有枪
      if (index >= 0 && index <= 11) {
        this.removeMergeEntity(this.curSelEnt);
        this.moveToIndex(dragEnt, index);
        evt.emit(QMerge.Event.Move, dragEnt, dragEnt.index);
      } else {
        //index <0 && index > 11
        //非法位置
        this.onDragCancel();
        // let move = cc.moveTo(0.3, pos);
        // dragGun.node.runAction(cc.sequence(move, cc.callFunc(_ => {
        //     let slotGun = this.getGunByIndex(dragGun.index);
        //     slotGun.node.active = true;
        //     dragGun.node.removeFromParent();
        // })))
      }
    }
    //操作完后检测是否有异常情况
    this.fix();
  }

  //交换 位置
  switchPosition(ent, dragEnt) {
    let aIndex = dragEnt.index;
    let bIndex = ent.index;
    console.log('[QMerge]交换位置 : ', aIndex, bIndex);
    this.moveToIndex(dragEnt, bIndex);
    this.moveToIndex(ent, aIndex);
    evt.emit(QMerge.Event.Switch, ent, dragEnt);
  }

  getPositionAtIndex(index: number) {
    // let grid = this.grids.find(v => v.index == index);/
    let grid = this.grids[index];
    if (grid) {
      return grid.center;
    }
    return cc.v2();
  }

  moveToIndex(ent: MergeEntity, index: number) {
    let pos = this.getPositionAtIndex(index);
    ent.index = index;
    let grid = this.grids[index];
    // let grid = this.grids.find(v => v.index == index)
    console.log(cc.js.formatStr('[QMerge]%s 填充 %s', index, ent.id));
    if (grid) grid.entity = ent;
    // just animation
    // gun.node.runAction(cc.moveTo(0.3, pos).easing(cc.easeSineOut()))
    qanim.moveTo(ent.node, 0.3, pos, EaseType.sineOut);
    //move ok
  }

  //获得当前正在拖动的枪支
  getDragEnt(): MergeEntity {
    return this.drag_ent;
  }

  whichGrid(pos: Vec2): MergeGrid {
    let grid = this.grids.find(v => {
      return v.transform.getBoundingBoxToWorld().contains(pos);
    });
    return grid;
  }

  getEntByIndex(id): MergeEntity {
    let grid = this.grids.find(v => v.index == id);
    return grid.entity;
  }

  // add
  addNewBox(id: number, prefab_box: Prefab, boxType?: BoxQuality) {
    let grid = this.findEmptyGrid();
    if (grid == null) {
      return false;
    }
    let boxNode = instantiate(prefab_box) as Node;
    let box = boxNode.getComponent(RewardBox);
    box.index = grid.index;
    if (boxType) box.quality = boxType;
    box.clickSignal.on(this.openBox, this);
    let [ret, com] = this.addMergeEntity(id);
    grid.cover(boxNode);
    if (ret == MergePanel.AddRet.OK) {
      com.node.addChild(boxNode);
      box.playFall();
      //5s自动打开
      if (this.auto_open_delay > 0) {
        this.scheduleOnce(
          this.openBox.bind(this, box.index),
          this.auto_open_delay
        );
      }
      return true;
    }
    return false;
  }

  openBox(index: number) {
    //play animation
    // remove box at this grid
    let cell = this.getGrid(index);
    if (cell.cover_node) {
      let box = cell.cover_node.getComponent(RewardBox);
      box.playOpen().then(_ => {
        this.uncover(index);
      });
    }
  }
}
