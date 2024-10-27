import DataCenter, { dc, field } from '../../../framework3D/core/DataCenter';

@dc('MergeStorage')
export default class MergeStorageDC extends DataCenter {
  @field()
  gold: number = 20000;
  @field()
  diamond: number = 1;

  /**合成体最高等级  */
  @field()
  maxMergeLv: number = 1;

  /**当前使用的合成体id */
  @field()
  usingId: number = 1;

  /** 合成次数 */
  @field()
  merge_count: number = 0;

  /**上次免费使用时间  */
  @field()
  freeShopTimestamp: number = Date.now();

  /**合成面板数据  */
  @field()
  map: number[] = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  /** 当格子不够的情况 的临时存储区  */
  @field()
  packages: { id; q }[] = [];

  cost(money, type: number) {
    if (type == 0) {
      return this.costGold(money);
    }
    {
      return this.costDiamond(money);
    }
  }

  //消费金币
  costGold(money) {
    let left = this.gold - money;
    if (left >= 0) {
      this.gold -= money;
      console.log('cost gold:' + money);
      return true;
    }
    console.log('not enough money!');
    return false;
  }

  /**消费钻石 */
  costDiamond(money) {
    let left = this.diamond - money;
    if (left >= 0) {
      this.diamond -= money;
      console.log('cost diamond:' + money);
      return true;
    }
    return false;
  }

  updateMap(map) {
    this.map = map;
    this.save('map');
  }

  /**记录购买次数 */
  @field()
  buyCounts: { [index: number]: number } = {};

  getNew(id) {
    let c = this.getBuyCount(id);
    this.buyCounts[id] = c + 1;
    this.save('buyCounts');
  }

  /** 获取 合成物品购买次数 */
  getBuyCount(id) {
    let c = this.buyCounts[id];
    if (c == null) {
      c = 1; //默认购买次数 1
      this.buyCounts[id] = c;
    }
    return c;
  }
}

export let MergeStorage: MergeStorageDC = DataCenter.register(MergeStorageDC);
