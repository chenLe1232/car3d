import ToastComponent from './ToastComponent';

import { _decorator, Component, Node, NodePool, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

export var Toast: ToastManager = null;

@ccclass
export default class ToastManager extends Component {
  toastPool!: NodePool;
  @property(Prefab)
  prefab!: Prefab;

  onLoad() {
    Toast = this;
  }

  start() {
    this.toastPool = new NodePool();
  }

  onDestroy() {
    this.toastPool.clear();
  }

  make(text: any, dur = 1.3) {
    //show toast
    let node = this.toastPool.get();
    let toastComp = null;
    if (node == null) {
      node = instantiate(this.prefab);
      toastComp = node.getComponent(ToastComponent);
      if (toastComp == null) {
        console.warn('Toast.make : Toast Prefab must contains ToastComponent');
      }
      // ToastManager.toastPool.put(node);
      // node = ToastManager.toastPool.get();
    } else {
      toastComp = node.getComponent(ToastComponent);
    }
    if (node.parent == null) this.node.addChild(node);

    this.show(toastComp, text, dur);
    return toastComp;
  }

  private show(toastComp: ToastComponent, text: any, dur: any) {
    toastComp.show(text);
    this.scheduleOnce(_ => {
      toastComp.hide(_ => {
        this.toastPool.put(toastComp.node);
        console.log('Toast.hide toastpool size:', this.toastPool.size());
      });
    }, dur);
  }

  // update (dt) {}
}
