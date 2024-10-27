import {
  _decorator,
  Node,
  LabelComponent,
  ButtonComponent,
  SpriteComponent,
  LayoutComponent,
  Color,
} from 'cc';
import Switcher from '../../framework3D/ui/controller/Switcher';
import mvc_View from '../../framework3D/ui/mvc_View';
import InfoCar from '../Common/MergeFramework/InfoCar';
import { PlayerInfo } from '../Data/PlayerInfo';
import { MergeStorage } from '../Common/MergeFramework/MergeStorage';
import { evt } from '../../framework3D/core/EventManager';
let { ccclass, property } = _decorator;
@ccclass('UIChooseCarItem')
export default class UIChooseCarItem extends mvc_View {
  @property(Switcher)
  switcher: Switcher = null;

  @property(Node)
  black: Node = null;

  @property(LabelComponent)
  title: LabelComponent = null;

  @property(SpriteComponent)
  icon: SpriteComponent = null;

  button: ButtonComponent;

  onLoad() {
    this.onVisible(this.black, _ => this.isShowBlack());
    this.register(this.switcher, _ => this.choose());
    this.register<InfoCar>(this.icon, _ => _.imageUrl);
    this.register<InfoCar>(this.title, _ => _.currentName);
    this.button = this.getComponent(ButtonComponent);
  }

  onShown() {
    this.render();
  }

  choose() {
    let data = this.getData() as InfoCar;
    if (data.id == MergeStorage.usingId) {
      return 0;
    } else {
      return 1;
    }
  }

  isShowBlack() {
    let data = this.getData() as InfoCar;
    if (MergeStorage.maxMergeLv < data.id) {
      this.button.interactable = false;
      this.icon.color = Color.BLACK;
      return true;
    } else {
      this.button.interactable = true;
      this.icon.color = Color.WHITE;
      return false;
    }
  }

  click_select() {
    let data = this.getData() as InfoCar;
    this.switcher._select(0);
    MergeStorage.usingId = data.id;
    evt.emit('changecar', data.id);
  }
}
