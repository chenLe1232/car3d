import BuffSystem from '../../framework3D/misc/buffs/BuffSystem';
import GenericBuff, {
  GenericBuffConfig,
} from '../../framework3D/misc/buffs/GenericBuff';
import { PlayerInfo } from '../Data/PlayerInfo';
import MergePanel from '../../QMerge/MergePanel';
import Level from '../Scenes/Level';
import Buff_Magnet from './MagnetBuff';

export let Buffs = {
  OutputSpeedupBuff: '合成加速Buff',
  SpeedupBuff: '加速Buff',
  MagnetBuff: '磁铁Buff',
  ShieldBuff: '盾牌Buff',
};

BuffSystem.register(Buffs.OutputSpeedupBuff, GenericBuff, {
  dcInstance: PlayerInfo,
  dcField: 'buff_outputSpeed',
  offline: false,
  onStep: function () {
    if (MergePanel.main) {
      MergePanel.main.outputScale = 2;
      MergePanel.main.showOutputInterval = 2.5;
    }
  },
  onDisable() {
    if (MergePanel.main) {
      MergePanel.main.outputScale = 1;
      MergePanel.main.showOutputInterval = 5;
    }
  },
} as GenericBuffConfig);

BuffSystem.register(Buffs.SpeedupBuff, GenericBuff, {
  onEnable() {
    Level.instance.car.isSuperSpeed = true;
    Level.instance.car.speedup(this.timeLeft);
  },
  onDisable() {
    Level.instance.car.isSuperSpeed = false;
    Level.instance.car.speedEnabled = false;
  },
} as GenericBuffConfig);

BuffSystem.register(Buffs.MagnetBuff, Buff_Magnet, null);
BuffSystem.register(Buffs.ShieldBuff, GenericBuff, {
  onEnable: function () {
    Level.instance.car.shieldEnabled = true;
  },
  onDisable() {
    Level.instance.car.shieldEnabled = false;
  },
} as GenericBuffConfig);
