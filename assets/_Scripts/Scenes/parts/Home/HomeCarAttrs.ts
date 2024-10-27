import {
  Component,
  _decorator,
  Node,
  LabelComponent,
  ProgressBarComponent,
} from 'cc';
import { evt } from '../../../../framework3D/core/EventManager';
import { MergeStorage } from '../../../Common/MergeFramework/MergeStorage';
import DataCar from '../../../Data/DataCar';
import ccUtil from '../../../../framework3D/utils/ccUtil';
import mvc_View from '../../../../framework3D/ui/mvc_View';
import vm from '../../../../framework3D/ui/vm';
let { ccclass, property } = _decorator;
@ccclass
export default class HomeCarAttrs extends mvc_View {
  @property(LabelComponent)
  label_speed: LabelComponent = null;

  @property(LabelComponent)
  label_maxspeed: LabelComponent = null;

  @property(ProgressBarComponent)
  bar_speed: ProgressBarComponent = null;

  @property(ProgressBarComponent)
  bar_maxspeed: ProgressBarComponent = null;

  @property(LabelComponent)
  label_name: LabelComponent = null;

  onLoad() {
    evt.on('MergeStorage.maxMergeLv', this.onCarChanged, this);
    evt.on('MergeStorage.usingId', this.chooseCar, this);
    this.register(this.label_speed, () => this.data.speed_text);
    this.register(this.label_maxspeed, () => this.data.maxSpeed_text);
    this.register(this.bar_speed, () => this.data.speed_ratio);
    this.register(this.bar_maxspeed, () => this.data.maxSpeed_ratio);
    this.register(this.label_name, () => this.data.name);

    this.chooseCar();
  }

  data: DataCar = null;
  setData() {
    this.data = ccUtil.get(DataCar, MergeStorage.maxMergeLv);
    this.render();
  }

  onCarChanged() {
    this.setData();
  }

  chooseCar() {
    this.data = ccUtil.get(DataCar, MergeStorage.usingId);
    this.render();
  }

  onDestroy() {
    evt.off('MergeStorage.maxMergeLv', this.onCarChanged, this);
    evt.off('MergeStorage.usingId', this.chooseCar, this);
  }

  start() {}

  click_car() {
    vm.show('UI/UIChooseCar');
  }
}
