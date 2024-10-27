import {
  Component,
  _decorator,
  Node,
  tween,
  LabelComponent,
  Color,
  color,
  Vec3,
  v3,
} from 'cc';
import MergePanel from './MergePanel';
import MergeGrid from './MergeGrid';
import { evt } from '../framework3D/core/EventManager';
import QMerge from './QMerge';
let { ccclass, property } = _decorator;

/**与MergeGrid关联 */
@ccclass
export default class MergeOutput extends Component {
  timer: number = 0;
  timer_show: number = 0;

  // 产出缓存
  _output_val: number = 0;
  //每次产出基础速度
  _output_speed: number = 0;

  //产出速度 加成 x 2  x3
  // _output_speedScale: number = 1;

  _grid: MergeGrid = null;

  _paused = false;

  @property(LabelComponent)
  label_num: LabelComponent = null;

  @property
  output_anim_dur: number = 1;

  @property
  output_anim_dist: number = 150;

  @property(Color)
  color_normal: Color = color(255, 255, 255, 255);

  @property(Color)
  color_speed: Color = color(255, 255, 0, 255);

  onLoad() {
    if (!this.label_num)
      this.label_num = this.getComponentInChildren(LabelComponent);
    if (!this.label_num) {
      console.error('[MergeOutput] Label required!');
    } else {
      // let color = this.label_num.color
      this.hideLabel();
    }
  }

  showLabel() {
    // this.label_num.node.active = true;
    // let color = this.label_num.color;
    this.label_num.node.setPosition(0, 0, 0);
    //@ts-ignore
    if (MergePanel.main.outputScale > 1) {
      // color =  color
      this.label_num.color = this.color_speed;
    } else {
      this.label_num.color = this.color_normal;
    }
    // color.a = 255;
  }

  hideLabel() {
    // this.label_num.node.active = false;
    let color = this.label_num.color;
    //@ts-ignore
    color.a = 0;
  }

  set grid(v) {
    if (v) {
      this._grid = v;
      this._grid.statusChangeSignal.add(this.onStatusChanged, this);
      v.node.on(Node.EventType.TRANSFORM_CHANGED, this.onPositionChanged, this);
    }
  }

  get grid() {
    return this._grid;
  }

  onPositionChanged() {
    this.node.position = this._grid.node.position;
  }

  start() {}

  resume() {
    this._paused = false;
  }

  pause() {
    this._paused = true;
  }

  onStatusChanged(evtName) {
    switch (evtName) {
      case 'add':
        this.resume();
        break;
      case 'changed':
        this.setOutput(0);
        //     this.resume()
        break;
      case 'remove':
        this.setOutput(0);
        this.pause();
        break;
    }
  }

  setOutputSpeed(val) {
    this._output_speed = val;
  }

  // setOutputSpeedScale(mul) {
  //     this._output_speedScale = mul;
  // }

  addOutput(val) {
    this._output_val += val;
  }

  setOutput(val) {
    this._output_val = val;
  }

  /**产出  */
  private output() {
    this._output_val += this._output_speed * MergePanel.main.outputScale;
  }

  // _tmp_color: Color = color();

  /**显示产出数量  */
  private showOutput() {
    let val = this._output_val;
    if (val == 0) return;
    let color = this.label_num.color;
    let node = this.label_num.node;
    this.label_num.string = '+' + val.toUnitString();
    this.showLabel();
    evt.emit(QMerge.Event.Output, this._output_val, this.grid);
    tween(color).to(this.output_anim_dur, { a: 0 }).start();
    tween(node)
      .to(
        this.output_anim_dur,
        { position: v3(0, this.output_anim_dist, 0) },
        { easing: 'sineInOut' }
      )
      .start();
    //播放后，清0
    this._output_val = 0;
  }

  update(dt) {
    if (this._paused) return;
    this.timer += dt;
    this.timer_show += dt;
    //output interval managed by MergePanel
    if (this.timer > MergePanel.main.outputInterval) {
      this.timer = 0;
      this.output();
    }

    if (this.timer_show >= MergePanel.main.showOutputInterval) {
      this.timer_show = 0;
      this.showOutput();
    }
  }
}
