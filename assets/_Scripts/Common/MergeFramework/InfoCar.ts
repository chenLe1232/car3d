import InfoRes, { ResType } from './InfoRes';
import ccUtil from '../../../framework3D/utils/ccUtil';
import { mergeSystem } from './MergeSystem';
import { MergeStorage } from './MergeStorage';

export enum SupplyType {
  Normal,
  Drop,
}
//普通补给的数量 3/4
const supplyRatio = 3 / 4;

export default class InfoCar {
  id: number;
  imageUrl: string = '';
  next_id: number = 0;
  gold: number = 0;
  diamond: number = 0;

  unlock_rewards: InfoRes[] = [];
  name: string = '';

  levelDesc: string = '<InfoCar.levelDesc>';

  /**定期资源  */
  normalSupplys: number[] = [];
  /**空投资源 */
  dropSupplys: number[] = [];

  /**武器每次产出的金币 */
  output: number = 10;

  offlineReward: number = 0;

  prefab_path: string = '';

  get next(): InfoCar {
    // return new WeaponInfo(this.next_id);
    if (!this.next_id) return null;
    return ccUtil.get<InfoCar>(InfoCar, this.next_id);
  }
  a: number = 0;
  b: number = 2;

  constructor(id) {
    this.id = id;
    this.levelDesc = id + '级';

    let d = csv.CarInfo.get(id);
    this.gold = d.Price_Coin;
    this.diamond = d.Price_Diamonds;
    this.imageUrl = 'Texture/car_thumbnail/' + id;
    this.prefab_path = 'Prefab/model/cars/Car' + d.Id;

    this.output = d.Profit;
    this.name = d.name;
    this.next_id = d.Next;

    this.offlineReward = d.Profit_offline;

    //解锁 奖励
    let a = new InfoRes(ResType.Coin, 0, d.Unlock_Coin);
    let b = new InfoRes(ResType.Diamond, 0, d.Unlock_Diamonds);
    this.unlock_rewards = [a, b];

    //空投，补给
    let supp = csv.Supply.get(id);
    let sup_a = supp.Lv_A + '';
    let sup_b = supp.Lv_B + '';
    this.normalSupplys = sup_a.split(',').map(v => parseInt(v));
    this.dropSupplys = sup_b.split(',').map(v => parseInt(v));
    this.fill(this.normalSupplys);
    this.fill(this.dropSupplys);

    //购买计算
    let pattern = /(.+?)e/g,
      str = d.Raise_Coin;
    let result = pattern.exec(str);
    this.a = parseFloat(result[1]);
    let pattern2 = /e(.+?)x/g;
    let result2 = pattern2.exec(str);
    this.b = parseFloat(result2[1]);
  }

  // get weaponOutput() {
  //     return this.output * parseFloat(csv.WeaponIntensify.get(LogicGame.weaponUpConut[this.id].earning).Attribute);
  // }

  // get weaponspeed() {
  //     return this.weaponSpeed + parseFloat(csv.WeaponIntensify.get(LogicGame.weaponUpConut[this.id].speed).Attribute);
  // }

  // get weaponpower() {
  //     return this.weaponPower + parseFloat(csv.WeaponIntensify.get(LogicGame.weaponUpConut[this.id].power).Attribute);
  // }

  /**随机普通补给 */
  get normalSupply() {
    return this.supplyId(SupplyType.Normal);
  }

  /**随机空投补给 */
  get dropSupply() {
    return this.supplyId(SupplyType.Drop);
  }

  supplyId(type: SupplyType) {
    let arr = type == SupplyType.Normal ? this.normalSupplys : this.dropSupplys;
    if (Math.random() < supplyRatio) {
      return arr[0];
    }
    return arr[1];
  }

  private fill(arr: number[]) {
    arr.length == 1 && arr.push(arr[0]);
  }

  //========================================================================================

  /**  当前购买数量 */
  get buyCount() {
    return MergeStorage.getBuyCount(this.id);
  }

  get currentName() {
    if (MergeStorage.maxMergeLv < this.id) {
      return '????';
    }
    return this.name;
  }

  get isFree() {
    return mergeSystem.get_isFree(this.id);
  }

  get canBuy() {
    return mergeSystem.get_canBuy(this.id);
  }

  get currentCostType() {
    let tid = mergeSystem.get_currentCostType(this.id);
    return ccUtil.get(InfoRes, tid);
  }

  get currentPrice() {
    return mergeSystem.get_currentPrice(
      this.id,
      this.a,
      this.b,
      this.buyCount,
      this.diamond
    );
    //a * e^ b * c
    //@ts-ignore
    // let price = Math.pow(e, this.a * MergeStorage.buyCounts[this.id]);
    // this.cost_coin = Math.round(price * this.b);
    // return this.cost_coin;
  }
}
