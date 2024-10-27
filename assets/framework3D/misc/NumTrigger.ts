import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

class TriggerPoint {
  min: number = Number.MIN_VALUE;
  max: number = Number.MAX_VALUE;
  callback: Function;
  id: number = 0;
  triggered: boolean = false;
  constructor(min: any, max: any, callback: any) {
    this.min = min;
    this.max = max;
    this.callback = callback;
  }
}

export enum TriggerTimes {
  ONCE = 1,
  UNLIMITED = -1,
}

@ccclass
export default class NumTrigger {
  points: TriggerPoint[] = [];

  add(min: any, max: any, callback: any) {
    let a = new TriggerPoint(min, max, callback);
    // TODO:是否和已有的point 有交集
    this.points.push(a);
  }

  triggerType: TriggerTimes = TriggerTimes.ONCE;

  reset() {
    this.points.forEach(v => (v.triggered = false));
  }

  private trigger(v: any, p: TriggerPoint) {
    if (p.triggered) return false;
    if (v >= p.min && v <= p.max) {
      if (this.triggerType == TriggerTimes.UNLIMITED) {
        this.reset();
      }
      p.triggered = true;
      p.callback();
      return true;
    }
    return false;
  }

  update(v: any) {
    this.points.some(p => this.trigger(v, p));
  }
}
