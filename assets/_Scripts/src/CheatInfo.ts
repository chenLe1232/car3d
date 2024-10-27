import DataCenter, { dc, field } from '../../framework3D/core/DataCenter';
import gameUtil from '../../framework3D/utils/gameUtil';

@dc('CheatInfo')
export default class CheatInfoDC extends DataCenter {
  /**各功能 开启次数 */
  @field()
  open_nums: {} = {};

  @field()
  open_date: {} = {};

  getCount(id) {
    let c = this.open_nums[id];
    if (!c) {
      c = 0;
      this.open_nums[id] = 0;
    }
    return c;
  }

  markOpen(feature_id) {
    CheatInfo.open_nums[feature_id]++;
    CheatInfo.open_date[feature_id] = Date.now();
    CheatInfo.save();
  }

  //
  onLoadAll() {
    //清0
    for (var k in this.open_nums) {
      let date = this.open_date[k];
      if (date) {
        if (gameUtil.isNextDay(date)) {
          this.open_nums[k] = 0;
        }
      }
    }
  }
}

export let CheatInfo: CheatInfoDC = DataCenter.register(CheatInfoDC);
