import {
  _decorator,
  Component,
  Node,
  Vec2,
  SystemEventType,
  systemEvent,
  SystemEvent,
} from 'cc';
import JoyStick from '../misc/JoyStick';
const { ccclass, property } = _decorator;

export var Input: InputSystem = null;

@ccclass
export class InputSystem extends Component {
  // @property(EventHandler)
  // onKeyDown:EventHandler;

  _target: any = null;

  keys: { [index: string]: boolean } = {};

  __touch: Vec2;

  __startLocation: Vec2;

  __touchVec: Vec2 = Vec2.ZERO;

  radius_axis: number = 256;

  @property(JoyStick)
  joyStick: JoyStick = null;

  /**
   * if target is a Component ,this function must be called in onLoad
   * @param target
   */
  setDelegate(target) {
    this._target = target;
  }

  onLoad() {
    Input = this;

    let components = this.getComponents(Component);
    for (var i = 0; i < components.length; i++) {
      let comp: any = components[i];
      if (
        comp != this &&
        (comp.onTouchBegan || comp.onTouchEnded || comp.onTouchMoved)
      ) {
        this._target = comp;
        break;
      }
    }
    // g.setGlobalInstance(this, 'Input')
    // console.log("InputSystem Component -> target:", this._target)
  }

  //Horizontal
  //Vertical
  start() {
    systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.triggerKeyDown, this);
    systemEvent.on(SystemEvent.EventType.KEY_UP, this.triggerKeyUp, this);
    // if(this._target)
    // {
    this.node.on(SystemEventType.TOUCH_START, this.triggerTouchBegan, this);
    this.node.on(SystemEventType.TOUCH_MOVE, this.triggerTouchMoved, this);
    this.node.on(SystemEventType.TOUCH_END, this.triggerTouchEnded, this);
    this.node.on(SystemEventType.TOUCH_CANCEL, this.triggerTouchCanceled, this);

    // }
  }

  get touch() {
    return this.__touch;
  }

  // only valid when joystick is enabled
  get axis() {
    if (this.joyStick) return this.joyStick.axis;
    else return this.__touchVec;
  }

  getKey(k) {
    return this.keys[k];
  }

  private triggerKeyUp(e) {
    if (this._target && this._target.onKeyUp) this._target.onKeyUp(event);
    this.keys[event['key']] = false;
  }

  private triggerKeyDown(e): any {
    if (this._target && this._target.onKeyDown) this._target.onKeyDown(event);
    this.keys[event['key']] = true;
  }

  private triggerTouchEnded(e): any {
    if (this.__curTouchId != -1 && e.getID() != this.__curTouchId) {
      return;
    }
    this.__curTouchId = -1;
    if (this._target && this._target.onTouchEnded) this._target.onTouchEnded(e);

    this.__touch = null;
    this.__touchVec = Vec2.ZERO;
    if (e.currentTouch)
      if (this.joyStick) this.joyStick.touchEnd(e.currentTouch.getLocation());

    this.moveOffset = Vec2.ZERO;
  }

  __lastTouch: Vec2 = Vec2.ZERO;
  moveOffset: Vec2 = Vec2.ZERO;

  private triggerTouchMoved(e): any {
    if (this.__curTouchId != -1 && e.getID() != this.__curTouchId) {
      return;
    }
    if (this._target && this._target.onTouchMoved) this._target.onTouchMoved(e);

    this.__touch = e.currentTouch.getLocation();
    this.moveOffset = this.__touch.subtract(this.__lastTouch);
    if (this.__touch && this.__startLocation) {
      this.__touchVec = this.__touch.subtract(this.__startLocation);
      if (this.joyStick) this.joyStick.touchMove(this.__touch);
    }
    this.__lastTouch = this.__touch;
  }

  __curTouchId: number = -1;

  private triggerTouchBegan(e): any {
    if (this.__curTouchId != -1 && e.getID() != this.__curTouchId) {
      return;
    }

    if (this._target && this._target.onTouchBegan) this._target.onTouchBegan(e);
    this.__curTouchId = e.getID();
    this.__startLocation = e.currentTouch.getLocation();
    this.__touch = e.currentTouch.getLocation();
    this.__lastTouch = this.__touch;
    if (this.joyStick) this.joyStick.touchStart(this.__startLocation);
  }
  private triggerTouchCanceled(e): any {
    this.triggerTouchEnded(e);
  }

  onEnable() {
    this.schedule(this.checkTouch, 0.02);
  }

  onDisable() {
    this.unschedule(this.checkTouch);
  }

  checkTouch() {
    if (this.__touch) {
      this.moveOffset = this.__touch.subtract(this.__lastTouch);
    }
  }
}
