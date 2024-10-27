import {
  Component,
  _decorator,
  Node,
  loader,
  Prefab,
  instantiate,
  Vec3,
  UIModelComponent,
  ModelComponent,
  resources,
} from 'cc';
import ccUtil from '../../../../framework3D/utils/ccUtil';
import InfoCar from '../../../Common/MergeFramework/InfoCar';
import { MergeStorage } from '../../../Common/MergeFramework/MergeStorage';
import { PlayerInfo } from '../../../Data/PlayerInfo';
let { ccclass, property } = _decorator;
@ccclass
export default class CarLoader extends Component {
  onLoad() {
    let info = ccUtil.get(InfoCar, MergeStorage.usingId);
    let path = info.prefab_path;
    this.node.destroyAllChildren();
    resources.load(path, Prefab, (err, res) => {
      if (err) {
        return;
      }
      let node = instantiate(res) as Node;
      node.parent = this.node;
      let models = node.getComponentsInChildren(ModelComponent);
      let body = models[0];
      if (body) {
        body.shadowCastingMode = 1;
      }
      let shadow = node.getChildByName('shadow');
      if (shadow) shadow.active = false;
      node.position = Vec3.ZERO;
    });
  }

  start() {}
}
