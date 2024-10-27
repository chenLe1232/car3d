import { Component, _decorator, SpriteComponent, color } from 'cc';
import MergePanel from './MergePanel';
import { evt } from '../framework3D/core/EventManager';
import ccUtil from '../framework3D/utils/ccUtil';
let { ccclass, menu, property } = _decorator;

@ccclass
@menu('Merge/MergeEntity')
export default class MergeEntity extends Component {
  id: number = 0;

  @property(SpriteComponent)
  icon: SpriteComponent = null;

  index: number = 0;

  add_sp: SpriteComponent = null;

  get grid() {
    return MergePanel.main.grids[this.index];
  }

  onLoad() {
    this.add_sp = this.getComponentInChildren(SpriteComponent);
  }

  set opacity(v) {
    let c = this.icon.color;
    this.icon.color = color(c.r, c.g, c.b, v);
  }
  set color(v) {
    this.icon.color = v;
  }

  start() {
    //this.updateAvatar();
  }

  updateAvatar() {
    if (this.id) {
      ccUtil.setDisplay(this.icon, this.data.image);
      console.log('MergeEntity->updateAvatar->this.data', this.data);
      if (this.add_sp) ccUtil.setDisplay(this.add_sp, this.data.image);
      let grid = this.grid;
      if (grid) {
        grid.updateLevel(this.id);
      }
    }
  }

  /**隐藏  */
  hide() {
    let s = this.getComponent(SpriteComponent);
    s && (s.enabled = false);
    this.add_sp && (this.add_sp.node.active = false);
  }

  show() {
    let s = this.getComponent(SpriteComponent);
    s && (s.enabled = true);
    this.add_sp && (this.add_sp.node.active = true);
  }

  get data() {
    // let info = model_manager.get<WeaponInfo>(WeaponInfo, this.id);
    // return info
    return MergePanel.main.getEntityData(this.id);
  }

  levelup(id?) {
    if (id) {
      this.id = id;
      // this.updateAvatar();
      console.log('[ComEntity] 直接升到指定等级:' + id);
      return true;
    } else {
      let info = this.data;
      if (info.next) {
        this.id = info.next;
        this.updateAvatar();
        return true;
      }
    }
    console.warn('合成物品升级已到顶级');
    return false;
  }

  //合成
  merge(entity: MergeEntity) {
    //level up
    let prev_id = this.id;
    let ok = this.levelup();
    if (ok) {
      // set grid
      this.grid.unlock();
      this.grid.uncover();
      entity.del();
    }

    return ok;
  }

  isSameType(entity: MergeEntity) {
    return this.id == entity.id;
  }

  del() {
    this.node.destroy();
  }
}
