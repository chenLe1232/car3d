import MergeEntity from './MergeEntity';
import FSM from '../framework3D/core/FSM';
import MergePanel from './MergePanel';
import ccUtil from '../framework3D/utils/ccUtil';
import { Component, _decorator } from 'cc';
import { Signal } from '../framework3D/core/Signal';

const { ccclass, property, menu } = _decorator;

enum MergeDragState {
  Hover,
  Leave,
}
export enum MergeDragEvent {
  Began,
  End,
  Hover,
  Leave,
  Received,
}

@ccclass
export default class MergeEntityReceiver extends Component {
  dragEntity: MergeEntity;
  fsm: FSM = null;
  dragSignal: Signal = new Signal();

  onLoad() {
    // event.on("ComPanel.DragBegan",this.onDragBegan,this)
    MergePanel.main.dragBeganSignal.add(this.onDragBegan, this);
    MergePanel.main.dragCancelSignal.add(this.onDragEnd, this);
    MergePanel.main.dragEndedSignal.add(this.onDragEnd, this);
    this.fsm = this.addComponent(FSM);
    this.fsm.init(this);
    this.fsm.addStates(MergeDragState);
    this.fsm.enterState(MergeDragState.Leave);
  }

  onDestroy() {
    MergePanel.main.dragBeganSignal.remove(this.onDragBegan, this);
    MergePanel.main.dragCancelSignal.remove(this.onDragEnd, this);
    this.dragSignal.clear();
  }

  onDragBegan(drag: MergeEntity) {
    this.dragEntity = drag;
    this.dragSignal.fire(MergeDragEvent.Began, drag);
  }

  onDragEnd() {
    let intersects = false;
    this.dragSignal.fire(MergeDragEvent.End, this.dragEntity);
    if (!this.dragEntity) return;
    // if (this.dragEntity.node.getBoundingBoxToWorld().intersects(this.node.getBoundingBoxToWorld())) {
    let c = ccUtil.getWorldPos(this.dragEntity.node);
    if (this.transform.getBoundingBoxToWorld().contains(c)) {
      intersects = true;
    }
    if (intersects) {
      this.onReceived();
    }
    this.dragEntity = null;
  }

  onReceived() {
    this.dragSignal.fire(MergeDragEvent.Received, this.dragEntity);
  }

  onHover() {
    this.dragSignal.fire(MergeDragEvent.Hover, this.dragEntity);
  }

  onLeave() {
    this.dragSignal.fire(MergeDragEvent.Leave, this.dragEntity);
  }

  onEnter_HoverState(state) {
    // Common.jellyJump2(this.node, 1, 1.3);
    this.onHover();
  }
  onExit_HoverState(state) {
    // Common.jellyJump2(this.node, 1.3, 1);
    this.onLeave();
    // this.node.color = cc.Color.WHITE;
  }
  onUpdate_HoverState(state, dt: number) {
    if (!cc.isValid(this.dragEntity)) return;
    // if (!this.dragEntity.node.getBoundingBoxToWorld().intersects(this.node.getBoundingBoxToWorld())) {
    let c = ccUtil.getWorldPos(this.dragEntity.node);
    if (!this.transform.getBoundingBoxToWorld().contains(c)) {
      this.fsm.changeState(MergeDragState.Leave);
    }
  }

  onEnter_LeaveState(state) {}

  onExit_LeaveState(state) {}

  onUpdate_LeaveState(state, dt: number) {
    if (!cc.isValid(this.dragEntity)) return;
    // if (this.dragEntity.node.getBoundingBoxToWorld().intersects(this.node.getBoundingBoxToWorld())) {
    let c = ccUtil.getWorldPos(this.dragEntity.node);
    if (this.transform.getBoundingBoxToWorld().contains(c)) {
      this.fsm.changeState(MergeDragState.Hover);
    }
  }

  start() {}
}
