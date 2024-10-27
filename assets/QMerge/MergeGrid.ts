import { Component, LabelComponent, Node, _decorator } from 'cc';
import MergeEntity from './MergeEntity';
import { evt } from '../framework3D/core/EventManager';
import QMerge from './QMerge';
import MergeOutput from './MergeOutput';
import { Signal } from '../framework3D/core/Signal';

const { ccclass, property, menu } = _decorator;

@ccclass
export default class MergeGrid extends Component {
  @property()
  index: number = 0;

  private _entity: MergeEntity = null;

  private _isUncover: boolean = true;

  private _cover_node: Node = null;

  private lvLabel: LabelComponent = null;
  private lvLabelContainer: Node = null;

  @property(Node)
  highlight: Node = null;

  @property
  locked: boolean = false;

  statusChangeSignal: Signal = new Signal();

  private _output: MergeOutput = null;

  public onDestroy() {
    this.statusChangeSignal.clear();
  }

  public get cover_node() {
    return this._cover_node;
  }

  get canDrag() {
    return !this.locked && this._isUncover;
  }

  get center() {
    return this.node.position;
  }

  get output() {
    return this._output;
  }

  set output(v) {
    if (v != null) {
      this._output = v;
      v.grid = this;
    }
  }

  public set entity(value: MergeEntity) {
    let old = this._entity;
    this._entity = value;
    if (value) {
      if (old == null) {
        //changed
        this.statusChangeSignal.fire('add');
        evt.emit(QMerge.Event.GridChanged, 'add', this);
      } else if (value.id != old.id) {
        this.statusChangeSignal.fire('change');
        evt.emit(QMerge.Event.GridChanged, 'change', this);
      }
      this.updateLevel(value.id);
      this.showLv();
    } else {
      this.statusChangeSignal.fire('remove');
      evt.emit(QMerge.Event.GridChanged, 'remove', this);
      this.hideLv();
    }
  }

  public get entity() {
    return this._entity;
  }

  public get isLock(): boolean {
    return this.locked;
  }
  public set isLock(value: boolean) {
    this.locked = value;
    this.node.active = !value;
  }

  public get isUncover(): boolean {
    return this._isUncover;
  }
  public set isUncover(value: boolean) {
    this._isUncover = value;
  }

  showHighlight() {
    if (this.highlight) this.highlight.active = true;
  }

  hideHighlight() {
    if (this.highlight) this.highlight.active = false;
  }

  /** mark this grid is covered  */
  cover(coverNode?: Node) {
    this.isUncover = false;
    this._cover_node = coverNode;
    //hide entity sprite
    if (cc.isValid(this._entity)) {
      this._entity.hide();
    }
    this.hideLv();
  }

  /**mark this grid uncovered */
  uncover() {
    this.isUncover = true;
    if (cc.isValid(this._entity)) {
      this._entity.show();
    }
    this._cover_node = null;
    this.showLv();

    /** should removed  */
    // this._cover_node.removeFromParent();
  }

  /** mark this grid locked */
  lock() {
    this.isLock = true;
  }

  /** mark this grid unlocked */
  unlock() {
    this.isLock = false;
  }

  updateLevel(lv) {
    if (this.lvLabel) this.lvLabel.string = lv;
  }

  onLoad() {
    this.lvLabel = this.getComponentInChildren(LabelComponent);
    if (this.lvLabel) {
      if (this.lvLabel.node.parent != this.node) {
        this.lvLabelContainer = this.lvLabel.node.parent;
      } else {
        this.lvLabelContainer = this.lvLabel.node;
      }
    }
    this.hideLv();
    this.hideHighlight();
  }

  start() {
    this.node.active = !this.locked;
  }

  onEnable() {
    this.schedule(this.checkState, 3);
  }
  onDisable() {
    this.unschedule(this.checkState);
  }

  showLv() {
    if (this.lvLabelContainer) this.lvLabelContainer.active = true;
  }

  hideLv() {
    if (this.lvLabelContainer) this.lvLabelContainer.active = false;
  }

  checkState() {
    if (this.entity == null || !this.isUncover) {
      this.hideLv();
    } else {
      this.showLv();
    }
  }
}
