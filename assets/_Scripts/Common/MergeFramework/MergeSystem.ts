import ccUtil from "../../../framework3D/utils/ccUtil";
import InfoCar from "./InfoCar";
import { evt } from "../../../framework3D/core/EventManager";

import { MergeTypes } from "./MergeTypes";
import QMerge from "../../../QMerge/QMerge";
import MergeEntity from "../../../QMerge/MergeEntity";
import MergePanel from "../../../QMerge/MergePanel";
import { Toast } from "../../../framework3D/ui/ToastManager";
import MergeGrid from "../../../QMerge/MergeGrid";
import { MergeStorage } from "./MergeStorage";
import { director, Component } from "cc";


export enum ResultCode {
    NotEnoughRes = -2,
    NoSpace,
    Success
}

export default class MergeSystem {

    private _benefitCar: number = null;

    /**
     * 合成多少次升级
     */
    static MaxMergeCountToLevelup = 10
    /**存储区上限 */
    static MaxPackageStored = 10;
    /** 补给时间 间隔 */
    static supplyInterval = 20;
    /**空投时间 间隔 */
    static airdropSupplyInterval = 120;

    constructor() {
        evt.on("MergeStorage.carLevel", this.refresh, this)
        evt.on(MergeTypes.BuyCar, this.refresh, this)
        evt.on(MergeTypes.BuyCarFromShop, this.refresh, this)

        evt.on(QMerge.Event.Move, this.saveMap, this)
        evt.on(QMerge.Event.Remove, this.saveMap, this)
        evt.on(QMerge.Event.Merge, this.onMerge, this)
        evt.on(QMerge.Event.GridChanged, this.onGridChanged, this);
        evt.on(QMerge.Event.Output, this.onOutput, this);
        evt.on(QMerge.Event.Add, this.saveMap, this)
    }

    /**当前最高等级合成体信息 */
    public get curInfo() {
        return ccUtil.get(InfoCar, MergeStorage.maxMergeLv);
    }

    /** 加入到临时存储区  */
    savePackage(id, boxType: number = 0) {
        if (MergeStorage.packages.length < MergeSystem.MaxPackageStored) {
            console.log("保存临时存储区:", id);
            MergeStorage.packages.push({ id: id, q: boxType })
            MergeStorage.save("packages")
            return true;
        } else {
            console.warn("临时存储区已满")
            return false;
        }
    }

    //******************速度采样, 不够及时 ****************/
    time_sample: number = 0;
    gold_sample: number = 0;
    outputSpeedTotal: number = 0;
    timer_sample: number = 0;
    startSample(dur: number = 2000) {
        this.timer_sample = setTimeout(this.sample.bind(this, dur), dur)
    }

    sample(dur) {
        if (this.gold_sample > 0) {
            let offset = Date.now() - this.time_sample;
            this.outputSpeedTotal = Math.floor(this.gold_sample / (offset / 1000))
            this.time_sample = Date.now();
            this.gold_sample = 0;
        }
        this.startSample(dur);
    }

    stopSample() {
        clearTimeout(this.timer_sample);
    }

    //计算合成速度  
    get_total_outputSpeed() {
        if (this.outputSpeedTotal == 0) {
            this.calc_total_outputSpeed();
        }
        return this.outputSpeedTotal
    }


    calc_total_outputSpeed() {
        let s = 0
        for (var i = 0; i < MergeStorage.map.length; i++) {
            let id = MergeStorage.map[i];
            if (id > 0) {
                let d = ccUtil.get(InfoCar, id);
                s += d.output
            }
        }
        this.outputSpeedTotal = s;

    }


    ///////////////////////////////////////////////

    onOutput(gold, grid: MergeGrid) {
        MergeStorage.gold += gold;
        // MergeStorage.save("gold")
        this.gold_sample += gold;
    }

    onGridChanged(eventName, grid: MergeGrid) {
        switch (eventName) {
            case 'remove':
                break;
            case 'add':
            case 'change':
                // set output speed 
                let id = grid.entity.id;
                let info = ccUtil.get(InfoCar, id);
                //更改产出速度 
                grid.output.setOutputSpeed(info.output);
                break;
        }
    }

    destroy() {

    }

    refresh() {
        this._benefitCar = null;
        this.saveMap();
    }

    saveMap() {
        MergeStorage.updateMap(MergePanel.main.getMap())
        //每次保存地图，重新计算速度 
        this.calc_total_outputSpeed();
    }

    onMerge(ent: MergeEntity, prev: MergeEntity) {
        //合并 后不会改变grid的状态 ，同样要改变产出速度 
        let data = ccUtil.get(InfoCar, ent.id);
        ent.grid.output.setOutputSpeed(data.output);
        let id = prev.id;
        if (ent.id > MergeStorage.maxMergeLv) {
            MergeStorage.maxMergeLv = ent.id;
            MergeStorage.usingId = ent.id;
            MergeStorage.save("maxMergeLv")
        } else {
            //可能升级 
            if (MergeStorage.maxMergeLv >= 8) {
                if (MergeStorage.maxMergeLv - id <= 7 && MergeStorage.maxMergeLv - id >= 4) {
                    MergeStorage.merge_count++;
                    MergeStorage.save('merge_count');
                    if (MergeStorage.merge_count == MergeSystem.MaxMergeCountToLevelup) {
                        MergeStorage.merge_count = 0;
                        MergeStorage.save('merge_count');
                        evt.emit(MergeTypes.LevelupEntity, prev.id, MergeStorage.maxMergeLv - 3)
                    }
                }
            }
        }
        this.saveMap();

    }

    /**最高性价比的车 ,每升级一次，计算一次 */
    public get benefitCar() {
        if (this._benefitCar != null) return this._benefitCar;
        //从x -4 开始计算 4个 等级 
        if (MergeStorage.maxMergeLv > 4) {
            let costarr = [4, 5, 6, 7].filter(v => MergeStorage.maxMergeLv - v > 0)
            if (costarr.length > 1) {
                let min = Number.MAX_VALUE;
                let minI = 0;
                for (let i = 0; i < costarr.length; i++) {
                    let car = ccUtil.get(InfoCar, MergeStorage.maxMergeLv - costarr[i])
                    let cost = car.currentPrice * (Math.pow(2, i));
                    if (cost < min) {
                        min = cost;
                        minI = i;
                    }
                }
                this._benefitCar = MergeStorage.maxMergeLv - costarr[minI];
            }
            else {
                this._benefitCar = 1
            }
        } else {
            this._benefitCar = 1
        }
        return this._benefitCar;
    }

    static freeCoinMulti = {
        [4]: 1,
        [5]: 2,
        [6]: 4,
        [7]: 8
    }

    /** 免费金币数量 ，跟据当前车的最高等级  */
    public getFreeCoin() {
        let coinCount = 0;
        let id = this.benefitCar;
        let data = ccUtil.get(InfoCar, id);
        if (id == 1) {
            coinCount = data.currentPrice;
        } else {
            let offset = MergeStorage.maxMergeLv - id;
            let mult = 1
            //一般不会超过7 
            if (offset > 7) {
                mult = 8
            } else {
                mult = MergeSystem.freeCoinMulti[offset]
                mult = mult || 1;
            }
            coinCount = data.currentPrice * mult;
        }
        return coinCount;
    }


    get_isFree(id) {
        // x - 5 为免费 且 3分钟一次
        if (MergeStorage.maxMergeLv - id == 6) {
            //免费冷却时间为3分钟
            if (Date.now() - MergeStorage.freeShopTimestamp > 60 * 3 * 1000) {
                return true
            }
        }
        return false;
    }


    // x - 1 ~ 都 可以买
    //特殊情况 
    //1 级车随时都能买
    //在x-2与x-3为钻石购买，在x>=6时生效，不生效时无法购买
    get_canBuy(id) {
        if (id == 1) return true;
        let offset = MergeStorage.maxMergeLv - id
        if (MergeStorage.maxMergeLv >= 6) {
            return offset > 1
        } else {
            if (offset > 3) {
                return true;
            }
            return false;
        }
    }

    get_currentCostType(id) {
        if (MergeStorage.maxMergeLv <= 4) {
            return 0;
        } else {
            let offset = MergeStorage.maxMergeLv - id
            //x -3   ~ 是金币
            if (offset > 3) {
                return 0
            } else {
                return 1;
            }
        }
    }

    get_currentPrice(id, a, b, c, d) {
        //a * e^ b * c
        if (this.get_currentCostType(id) == 0) {
            let sum = calc("{0} * {1} ^ {2} * {3}".format(a, Math.E, b, c))
            return Math.ceil(sum);
        } else {
            return d;
        }
    }

    buy(data: InfoCar, eventName) {
        if (MergePanel.main.hasEmptySpace()) {
            if (MergeStorage.cost(data.currentPrice, data.currentCostType.type)) {
                console.log("购买成功:" + eventName, data)
                MergeStorage.getNew(data.id);
                MergePanel.main.addMergeEntity(data.id);
                evt.emit(eventName, data)
                MergeStorage.save();
                return ResultCode.Success
            } else {
                return ResultCode.NotEnoughRes;
            }
        } else {
            Toast.make("空间不足!");
            return ResultCode.NoSpace;
        }
    }

    freeGet(data: InfoCar) {
        if (MergePanel.main.hasEmptySpace()) {
            MergeStorage.freeShopTimestamp = Date.now();
            MergeStorage.getNew(data.id);
            evt.emit(MergeTypes.GetCarFree, data)
            this.refresh();
            MergeStorage.save();
            return ResultCode.Success
        } else {
            Toast.make("空间不足!");
            return ResultCode.NoSpace;
        }
    }
}

export let mergeSystem: MergeSystem = new MergeSystem();