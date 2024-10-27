import {
  math,
  ButtonComponent,
  Node,
  Component,
  _decorator,
  EventHandler,
} from 'cc';
import { Signal } from '../../core/Signal';

const { ccclass, property, menu, executeInEditMode, inspector } = _decorator;

@ccclass
@menu('扩展UI/Switcher')
@executeInEditMode()
// @inspector("packages://qcontroller/inspector/switcher.js")
export default class Switcher extends Component {
  public children: Node[] = null;

  onValueChanged: Signal = new Signal();

  @property({ visible: false })
  _childrenCount: number = 0;

  @property()
  private _currentIndex: number = 0;

  @property({ displayName: '交互' })
  interactable: boolean = false;

  @property({ displayName: '当前值', slide: true, min: 0, max: 10, step: 1 })
  public get currentIndex(): number {
    return this._currentIndex;
  }

  @property({ type: Node, visible: false })
  _currentChild: Node = null;

  public set currentIndex(value: number) {
    value = math.clamp(value, 0, this.children.length - 1);
    value = Math.floor(value);
    this._select(value);
  }

  public set resizeToCurrent(v) {
    if (v) {
      this.node.setContentSize(this._currentChild.getContentSize());
    }
  }

  btn: ButtonComponent = null;

  set _checkInteractive(v) {
    if (v) {
      this.btn = this.getComponent(ButtonComponent);
      if (this.btn == null) {
        this.btn = this.addComponent(ButtonComponent);
        this.btn.target = this._currentChild;
        let evt = new EventHandler();
        evt.target = this.node;
        evt.component = 'Switcher';
        evt.handler = 'switch';
        this.btn.clickEvents.push(evt);
      }
    } else {
      if (this.btn) {
        this.btn.destroy();
      }
    }
  }

  onLoad() {
    // this._currentIndex = this.children.indexOf(this.currentActiveNode);
  }

  resetInEditor() {}

  start() {
    this.children = this.node.children;
    this._childrenCount = this.children.length;
    this._select(this.currentIndex);
    // this.resizeToCurrent = true;
    this._checkInteractive = this.interactable;
  }

  _select(index: number) {
    this._currentIndex = index;
    this._currentChild = this.children[index];
    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i];
      if (i == index) {
        element.active = true;
      } else {
        element.active = false;
      }
    }
  }

  switch() {
    this.index = (this.currentIndex + 1) % this._childrenCount;
  }

  set index(index: number) {
    if (!this.children) {
      this._currentIndex = index;
    }
    if (this.currentIndex != index) {
      this._select(index);
      this.onValueChanged.fire(index);
    }
  }
}
