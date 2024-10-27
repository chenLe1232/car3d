import {
  _decorator,
  Node,
  ButtonComponent,
  LabelComponent,
  SpriteComponent,
  Component,
  ToggleComponent,
} from 'cc';
import ccUtil from '../../../framework3D/utils/ccUtil';
import mvc_View from '../../../framework3D/ui/mvc_View';
import { PlayerInfo } from '../../Data/PlayerInfo';
import vm from '../../../framework3D/ui/vm';
import WeakNetGame from '../../../framework3D/extension/weak_net_game/WeakNetGame';
import { Toast } from '../../../framework3D/ui/ToastManager';
import qanim from '../../../framework3D/extension/qanim/qanim';
import gameUtil from '../../../framework3D/utils/gameUtil';
import { MergeStorage } from '../MergeFramework/MergeStorage';
import { evt } from '../../../framework3D/core/EventManager';
import UIBase from '../../UI/Common/UIBase';

const { ccclass, property } = _decorator;

export interface CheckInDayData {
  day: number;
  imageUrl: string;
  num: number;
  type: string;
}

class DayNode {
  label_title: LabelComponent = null;
  icon: SpriteComponent = null;
  label_num: LabelComponent = null;
  node_claimed: Node = null;
  public constructor(node: Node) {
    this.label_title = ccUtil.find('title', node, LabelComponent);
    this.icon = ccUtil.find('icon', node, SpriteComponent);
    this.label_num = ccUtil.find('num', node, LabelComponent);
    this.node_claimed = node.getChildByName('claimed');
  }

  setData(data: CheckInDayData, claimed: boolean) {
    this.node_claimed.active = claimed;
    if (data.imageUrl) ccUtil.setDisplay(this.icon, data.imageUrl);
    this.label_title.string = '第' + data.day + '天';
    if (this.label_num) {
      this.label_num.string = 'x' + data.num;
    }
  }
}

/**
 * csv 表头
 * 
天数	奖励内容	奖励数量	图标
day	reward	number	icon
int	string	int	string
1	gold	200	gold

    (DC)PlayerInfo 
        -CheckInTime  签到时间 
        -CheckInCount 签到次数
    
    UI  预置体说明：
     * dayCotainer
     *  - day
     *      -title
     *      -icon
     *      -num
     *      -claimed
 */

@ccclass
export default class UICheckIn extends UIBase {
  @property(Node)
  dayContainer: Node = null;
  days: DayNode[] = [];
  daysData: CheckInDayData[] = [];
  @property(ToggleComponent)
  toggle: ToggleComponent = null;

  @property(ButtonComponent)
  btn_claim: ButtonComponent = null;

  @property(Node)
  claimedTip: Node = null;

  onLoad() {
    this.dayContainer.children.forEach(v => {
      let dayNode = new DayNode(v);
      this.days.push(dayNode);
    });
    csv.CheckIn.values.forEach((v, i) => {
      this.daysData.push({
        type: v.reward,
        day: i + 1,
        imageUrl: null,
        num: v.number,
      } as CheckInDayData);
    });
    this.register(this.btn_claim, this.click_checkIn);
    this.registerTop();
  }

  onShown() {
    let c = 0;
    for (var i = 0; i < this.days.length; i++) {
      let day = i;
      let dayNode = this.days[i];
      let claimed = day < PlayerInfo.CheckInCount;
      c = claimed ? c + 1 : c;
      dayNode.setData(this.daysData[i], claimed);
    }
    //全部领取完毕
    if (c == this.days.length) {
      // this.btn_claim.node.active = false;
      ccUtil.setButtonEnabled(this.btn_claim, false);
      this.claimedTip.active = false;
      return;
    }
    this.updateStatus();
  }
  updateStatus(day?) {
    if (gameUtil.isNextDay(PlayerInfo.CheckInTime)) {
      //可领取
      ccUtil.setButtonEnabled(this.btn_claim, true);
      this.claimedTip.active = false;
    } else {
      //已领取
      ccUtil.setButtonEnabled(this.btn_claim, false);
      this.claimedTip.active = true;
    }
    if (day) {
      let dayNode = this.days[day];
      let data = this.daysData[day];
      dayNode.setData(data, day < PlayerInfo.CheckInCount);
    }
  }

  //签到
  click_checkIn() {
    // if (this.toggle.isChecked) {
    //     WeakNetGame.doChoice("SOV_Sign_Double", this.claimDouble, this);
    // } else {
    //     this.claim();
    // }
    this.claim();
    this.hide();
  }

  claimDouble() {
    this.claim(2);
    this.hide();
  }

  ////////////////////////////////////////////////////////////////
  // 领取第n天的奖励
  claim(mult = 1) {
    let day = PlayerInfo.CheckInCount;
    PlayerInfo.CheckInTime = Date.now();
    PlayerInfo.CheckInCount++;
    let data = this.daysData[day];
    evt.emit('UICheckIn.getReward', data, mult);
    this.updateStatus(day);
    PlayerInfo.save();
  }
  ////////////////////////////////////////////////////////////////
}
