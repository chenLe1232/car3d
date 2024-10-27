declare namespace csv {
  interface Item {
    type: number;
    id: number;
    count: number;
  }

  interface CarAttr_Row {
    /**
     * @type {number}
     * @description 编号 -
     */
    id?: number;

    /**
     * @type {string}
     * @description 车辆名字 -
     */
    name?: string;

    /**
     * @type {number}
     * @description 行驶速度 -
     */
    NS?: number;

    /**
     * @type {number}
     * @description 最高速度 -
     */
    TS?: number;

    /**
     * @type {number}
     * @description 行驶速度-界面 -
     */
    NS_show?: number;

    /**
     * @type {number}
     * @description 行驶速度-比率 -
     */
    NS_ratio?: number;

    /**
     * @type {number}
     * @description 最高速度-界面 -
     */
    TS_show?: number;

    /**
     * @type {number}
     * @description 最高速度-比率 -
     */
    TS_ratio?: number;
  }

  export class CarAttr {
    static get(id: number | string): CarAttr_Row;
    static values: CarAttr_Row[];
    static search(
      predicate: (value: CarAttr_Row, index: number) => boolean
    ): CarAttr_Row[];
    static size: number;
  }

  interface CarInfo_Row {
    /**
     * @type {number}
     * @description 枪械等级 -
     */
    Id?: number;

    /**
     * @type {number}
     * @description 下一个级 -
     */
    Next?: number;

    /**
     * @type {string}
     * @description 车辆名字 -
     */
    name?: string;

    /**
     * @type {number}
     * @description 金币收益(每秒） -
     */
    Profit?: number;

    /**
     * @type {number}
     * @description 购买价格（初始） -
     */
    Price_Coin?: number;

    /**
     * @type {string}
     * @description 购买价格（递增公式） -
     */
    Raise_Coin?: string;

    /**
     * @type {number}
     * @description 钻石购买 -
     */
    Price_Diamonds?: number;

    /**
     * @type {number}
     * @description 解锁奖励-金币 -
     */
    Unlock_Coin?: number;

    /**
     * @type {number}
     * @description 解锁奖励-钻石 -
     */
    Unlock_Diamonds?: number;

    /**
     * @type {number}
     * @description 离线收益（每秒） -
     */
    Profit_offline?: number;
  }

  export class CarInfo {
    static get(id: number | string): CarInfo_Row;
    static values: CarInfo_Row[];
    static search(
      predicate: (value: CarInfo_Row, index: number) => boolean
    ): CarInfo_Row[];
    static size: number;
  }

  interface CheckIn_Row {
    /**
     * @type {number}
     * @description 天数 -
     */
    day?: number;

    /**
     * @type {string}
     * @description 奖励内容 -
     */
    reward?: string;

    /**
     * @type {number}
     * @description 奖励数量 -
     */
    number?: number;

    /**
     * @type {string}
     * @description 图标 -
     */
    icon?: string;
  }

  export class CheckIn {
    static get(id: number | string): CheckIn_Row;
    static values: CheckIn_Row[];
    static search(
      predicate: (value: CheckIn_Row, index: number) => boolean
    ): CheckIn_Row[];
    static size: number;
  }

  export class Config {
    /**
     * @type {string}
     * @description 显示 Banner 的View列表 - UIHelp,UILevelup,UICheckIn,UIRevive,UISetting
     */
    static BannerAdWhiteList?: string;

    /**
     * @type {number}
     * @description 每个玩家每天能看多少个视频 - 100
     */
    static max_video_watch?: number;

    /**
     * @type {number}
     * @description 多久上传一次数据 - 60
     */
    static Sync_User_Data_Time?: number;

    /**
     * @type {number}
     * @description 视频复活 - 1
     */
    static SOV_Revive_Game?: number;

    /**
     * @type {number}
     * @description 结算双倍 - 1
     */
    static SOV_End_x2?: number;

    /**
     * @type {number}
     * @description 升级领取 - 1
     */
    static SOV_Levelup_Claim?: number;

    /**
     * @type {number}
     * @description 签到双倍 - 1
     */
    static SOV_Sign_Double?: number;

    /**
     * @type {number}
     * @description 离线双倍 - 1
     */
    static SOV_OfflineReward?: number;

    /**
     * @type {number}
     * @description 解锁双倍 - 1
     */
    static SOV_Unlock_Double?: number;

    /**
     * @type {number}
     * @description 加速双倍 - 1
     */
    static SOV_OutputSpeedup?: number;

    /**
     * @type {number}
     * @description 免费金币 - 1
     */
    static SOV_FreeGold?: number;

    /**
     * @type {number}
     * @description 空投奖励 - 1
     */
    static SOV_Airdrop?: number;

    /**
     * @type {number}
     * @description 结算3倍 - 1
     */
    static SOV_End_x3?: number;

    /**
     * @type {number}
     * @description 商店购买 - 1
     */
    static SOV_Shop_Buy?: number;

    /**
     * @type {string}
     * @description "" - ""
     */
    static ''?: string;

    /**
     * @type {number}
     * @description 复活banner位移延时（s） - 2
     */
    static Revive_Banner_Delay?: number;

    /**
     * @type {number}
     * @description 结算banner位移延时（s） - 2
     */
    static End_Banner_Delay?: number;
  }

  interface Level_Row {
    /**
     * @type {number}
     * @description 关卡 -
     */
    level?: number;

    /**
     * @type {number}
     * @description 关卡时长 -
     */
    time?: number;

    /**
     * @type {number}
     * @description 结算金币 -
     */
    gold?: number;

    /**
     * @type {number}
     * @description 结算钻石 -
     */
    diamond?: number;

    /**
     * @type {string}
     * @description 配置 -
     */
    configure?: string;
  }

  export class Level {
    static get(id: number | string): Level_Row;
    static values: Level_Row[];
    static search(
      predicate: (value: Level_Row, index: number) => boolean
    ): Level_Row[];
    static size: number;
  }

  interface Supply_Row {
    /**
     * @type {number}
     * @description 枪械等级 -
     */
    Id?: number;

    /**
     * @type {string}
     * @description 名称 -
     */
    Name?: string;

    /**
     * @type {string}
     * @description 描述 -
     */
    Desc?: string;

    /**
     * @type {number}
     * @description 下一个级 -
     */
    Next?: number;

    /**
     * @type {string}
     * @description 图片 -
     */
    Icon?: string;

    /**
     * @type {string}
     * @description 补给等级A（定期资源） -
     */
    Lv_A?: string;

    /**
     * @type {string}
     * @description 补给等级B（空投资源） -
     */
    Lv_B?: string;
  }

  export class Supply {
    static get(id: number | string): Supply_Row;
    static values: Supply_Row[];
    static search(
      predicate: (value: Supply_Row, index: number) => boolean
    ): Supply_Row[];
    static size: number;
  }
}
