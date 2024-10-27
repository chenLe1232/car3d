import {
  Component,
  _decorator,
  Node,
  SpriteComponent,
  LabelComponent,
  SpriteFrame,
} from 'cc';
import mvc_View from '../../../framework3D/ui/mvc_View';
import { MergeStorage } from '../../Common/MergeFramework/MergeStorage';
import ccUtil from '../../../framework3D/utils/ccUtil';
import InfoCar from '../../Common/MergeFramework/InfoCar';
import { mergeSystem } from '../../Common/MergeFramework/MergeSystem';
import InfoRes, { ResType } from '../../Common/MergeFramework/InfoRes';
let { ccclass, property } = _decorator;
@ccclass
export default class UIAirdropItem extends mvc_View {
  @property(SpriteComponent)
  icon: SpriteComponent = null;

  @property(LabelComponent)
  numLabel: LabelComponent = null;

  @property(SpriteFrame)
  coinSpriteFrame: SpriteFrame = null;

  @property(SpriteFrame)
  diamondSpriteFrame: SpriteFrame = null;

  onLoad() {}

  start() {}

  data: InfoRes;

  render(data: { type: number; num: number }) {
    let imageUrl = '';
    let num = data.num;
    if (data.type == 0) {
      //x-4
      let id = MergeStorage.maxMergeLv - 4;
      id = Math.max(1, id);
      let d = ccUtil.get(InfoCar, id);
      imageUrl = d.imageUrl;
      // this.data = ({ type: 0, id, num })
      this.data = new InfoRes(ResType.Car, id, num);
    } else if (data.type == 1) {
      //coin
      imageUrl = 'coin';
      num = mergeSystem.getFreeCoin();
      this.data = new InfoRes(ResType.Coin, 0, num);
    } else if (data.type == 2) {
      //diamond 10 + 5 * x j
      imageUrl = 'diamond';
      num = 10 + 5 * MergeStorage.maxMergeLv;
      this.data = new InfoRes(ResType.Diamond, 0, num);
    } else if (data.type == 3) {
      //30 *60 的收益
      imageUrl = 'coin';
      num = mergeSystem.get_total_outputSpeed() * 1800;
      this.data = new InfoRes(ResType.Coin, 0, num);
    }
    if (imageUrl == 'coin') {
      this.icon.spriteFrame = this.coinSpriteFrame;
    } else if (imageUrl == 'diamond') {
      this.icon.spriteFrame = this.diamondSpriteFrame;
    } else {
      ccUtil.setDisplay(this.icon, imageUrl);
    }
    this.numLabel.string = '+' + num.toUnitString();
  }
}
