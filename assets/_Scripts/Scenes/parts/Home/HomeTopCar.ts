import { Component, _decorator, Node, Quat, v3 } from 'cc';
import UIModelContainer from '../../../../framework3D/ui/game/UIModelContainer';
import { evt } from '../../../../framework3D/core/EventManager';
import { MergeStorage } from '../../../Common/MergeFramework/MergeStorage';
import ccUtil from '../../../../framework3D/utils/ccUtil';
import InfoCar from '../../../Common/MergeFramework/InfoCar';
import { AutoRotateComp } from '../../../../framework3D/extension/qanim/AutoRotateComp';
let { ccclass, property } = _decorator;
@ccclass
export default class HomeTopCar extends Component {
  @property(UIModelContainer)
  carModelContainer: UIModelContainer = null;

  onLoad() {
    this.carModelContainer = this.getComponent(UIModelContainer);
    this.carModelContainer.onLoaded.on(this.onModelLoaded, this);
    evt.on('MergeStorage.maxMergeLv', this.updateCar, this);
    evt.on('MergeStorage.usingId', this.chooseCar, this);
    this.chooseCar();
  }

  onModelLoaded(node: Node) {
    node.eulerAngles = v3(10, 0, 0);
    node.addComponent(AutoRotateComp);
  }

  onDestroy() {
    evt.off(this);
  }

  start() {}

  updateCar() {
    let data = ccUtil.get(InfoCar, MergeStorage.maxMergeLv);
    this.carModelContainer.prefab_path = data.prefab_path;
  }

  chooseCar() {
    let data = ccUtil.get(InfoCar, MergeStorage.usingId);
    this.carModelContainer.prefab_path = data.prefab_path;
  }
}
