import Platform, { ShareInfo } from "../Platform";
import Net, { net } from "../../misc/Net";
import { evt } from "../../core/EventManager";
import { WeakNetConf } from "./WeakNetConf";
import { SovInfo } from "./SovInfo";
import gameUtil from "../../utils/gameUtil";



interface LoginRet {
    errno: number,
    errmsg: string,
    data: { token: string, userId: string }
}

interface ServerConfig {
    share_config_url: string;
    csv_url: string;
    csv: string[];
    local_csv: string[];
}

export default class WeakNetGame {
    static serverConfig: WeakNetConf
    static shareConfigs: any = {}
    static config: ServerConfig = { share_config_url: "share_config.json", csv_url: "csv/", csv: [], local_csv: [] }
    static isInit = false;
    static config_inited = false;
    static shareConfig_inited = false;
    static logined_useId: string = null

    ///------------------------------------------------------------------
    static video_watched_count = 0;
    static share_fail_count = 0;
    static share_succ_count = 0;
    ///------------------------------------------------------------------
    static is_forbidden = false;

    /**当天看视频上限 */
    static max_video_watch = 99;

    static share_succ_delay = 2000;
    /**失败概率 */
    static share_fail_rate = 0.5;
    /**当天分享失败上限 */
    static max_share_fail = 3;
    ///------------------------------------------------------------------

    static _check_safe_callback: Function = null;

    /**是否已经登陆 */
    public static get isLoggedIn() {
        return this.logined_useId != null;
    }

    private static requestConfig() {
        if (this.config_inited) return;
        return new Promise((resolve, reject) => {
            // console.log("request url:", this.serverConfig.config_url)
            net.httpGet(this.serverConfig.config_url + "?r=" + Date.now()).then(res => {
                if (res == Net.Code.Timeout) {
                    reject('timeout')
                } else {
                    if (res) {
                        this.config = JSON.parse(res)
                        this.config_inited = true;
                        console.log('配置', this.config);
                        resolve();
                    }
                    else {
                        resolve();
                    }
                }
            })
        })
    }

    //share_config_url
    private static requestShareConfig() {
        if (this.shareConfig_inited) return;
        return new Promise((resolve, reject) => {
            net.httpGet(this.serverConfig.cdn_url + this.config.share_config_url + "?t=" + Date.now()).then(res => {
                if (res == Net.Code.Timeout) {
                    resolve();
                } else {
                    if (res) {
                        this.shareConfigs = JSON.parse(res)
                        this.shareConfig_inited = true;
                        console.log('分享配置', this.shareConfigs)
                        resolve();
                    } else {
                        resolve();
                    }
                }
            })
        })
    }

    static _configstr_cache: { [index: string]: { timestamp, data } } = {}

    //csv_url
    public static downloadCsv(name) {
        //5秒以内无需下载 
        let time = Date.now()
        let cache = this._configstr_cache[name]
        if (cache && time - cache.timestamp <= 1000 * 10) {
            console.log("刚已下载并加载表： " + name)
            return Promise.resolve()
        }
        let url = this.serverConfig.cdn_url + this.config.csv_url + name + '.csv' + "?t=" + Date.now()
        return new Promise((resolve, reject) => {
            console.log("download csv:" + name)
            net.httpGet(url).then(res => {
                if (res == Net.Code.Timeout) {
                    csv.load("Config/csv/" + name, resolve);
                } else {
                    if (res) {
                        csv.loadString(name, res, resolve)
                        delete this._configstr_cache[name];
                        this._configstr_cache[name] = { timestamp: Date.now(), data: res };
                    } else {
                        csv.load("Config/csv/" + name, resolve);
                    }
                }
            })
        })
    }

    public static loadLocalCsv(name, callback) {
        return new Promise((resolve, reject) => {
            console.log("load local csv:" + name);
            csv.load("Config/csv/" + name, resolve);
            if (callback) callback(name);
        })
    }

    private static loadLocalCsvs(callback) {
        if (this.config.local_csv == null) {
            return new Promise(resolve => {
                csv.loadDir("Config/csv", resolve)
            })
        } else {
            if (this.config.local_csv.length > 0) {
                let arr = []
                this.config.local_csv.forEach(v => {
                    let p = this.loadLocalCsv(v, callback)
                    arr.push(p)
                })
                return Promise.all(arr);
            }
        }
    }

    private static downloadCsvs() {
        if (this.config.csv.length == 0) {
            csv.loadDir("Config/csv")
        } else {
            let arr = []
            this.config.csv.forEach(v => {
                let p = this.downloadCsv(v);
                arr.push(p);
            })
            return Promise.all(arr);
        }
    }

    static client = new Net();

    static retry_count = 0;

    static userInfo: any = null;

    static async login() {
        let params: any = { userId: this.serverConfig.userId }
        if (CC_WECHAT) {
            Platform.login()
            let [code] = await evt.wait("wxlogin")
            let options = wx.getLaunchOptionsSync();
            params = {
                code,
                type: "wxlogin",
                query: JSON.stringify(options.query),
                scene: options.scene
            }
        }
        let res = await this.client.httpGet(this.serverConfig.root_url + "/game/login", params)
        if (res == Net.Code.Timeout) {
            console.log("登陆失败", this.retry_count)
            return false;
            //重新登陆 
            // if (this.retry_count <= 1) {
            //     this.retry_count++;
            //     return await this.login();
            // } else {
            //     return false;
            // }
        } else {
            if (res) {
                let ret = JSON.parse(res) as LoginRet;
                console.log("登陆返回", ret);
                this.client.setHeader("Authorization", ret.data.token);
                console.log('登陆成功', ret.data);
                this.logined_useId = ret.data.userId;
                this.retry_count = 0;
                this.userInfo = ret.data;
                return true;
            }
            else {
                console.log("登陆失败", this.retry_count)
                return false;
                //重新登陆 
                // if (this.retry_count <= 1) {
                //     this.retry_count++;
                //     return await this.login();
                // } else {
                //     return false;
                // }
            }
        }

    }


    static async syncData(v, userId?) {
        if (userId == null) {
            if (WeakNetGame.isLoggedIn) {
                userId = this.logined_useId;
            } else {
                return console.warn("上传数据！，未登陆且未指定用户id")
            }
        }
        return this.syncDataToTable(v, 'user', userId);
    }

    /**
     * 上传数据到指定远端服务器 
     * @param v 数据 
     * @param table  指定表
     * @param id  数据id 
     */
    static async syncDataToTable(v, table, id?) {
        if (id == null) {
            return console.warn("上传数据！未指定id !")
        }
        let res = await this.client.httpPut(this.serverConfig.root_url + "/" + table + "/" + id, v)
        if (res == Net.Code.Timeout) {
            console.log("上传数据 超时....")
            return false
        } else {
            if (res) {
                let ret = JSON.parse(res);
                console.log(ret);
                return ret;
            } else {
                console.warn("同步数据失败")
                return false
            }
        }

    }

    static async loadUserInfo() {
        //拉取用户数据
        if (!this.isLoggedIn) return console.warn("拉取数据时：未登录");
        if (this.userInfo) {
            return this.userInfo
        }
        console.log("拉取用户数据")
        let res = await this.client.httpGet(this.serverConfig.root_url + "/user/" + this.logined_useId)
        if (res == Net.Code.Timeout) {
            return this.userInfo;
        } else {
            if (res) {
                let ret = JSON.parse(res);
                if (!ret.errno) {
                    return ret.data;
                }
            }
            else {
                return this.userInfo;
            }
        }
    }

    static setVideoWatchedCount(c) {
        this.video_watched_count = c;
        localStorage.setItem("__video_watched_count__", this.video_watched_count + "")
        localStorage.setItem("__video_watched_date__", Date.now().toString())
    }


    static setShareFailCount(c) {
        this.share_fail_count = c;
        localStorage.setItem("_share_fail_count_", this.share_fail_count + "")
        localStorage.setItem("_share_fail_date_", Date.now().toString())
    }


    static setShareSuccCount(c) {
        this.share_succ_count = c;
        localStorage.setItem("_share_succ_count_", this.share_succ_count + "")
        localStorage.setItem("_share_succ_date_", Date.now().toString())
    }

    static initUserData() {
        let video_watched_count = localStorage.getItem('__video_watched_count__')
        let video_watched_date = localStorage.getItem("__video_watched_date__")
        let fail_share_count = localStorage.getItem('_share_fail_count_')
        let fail_share_date = localStorage.getItem("_share_fail_date_")

        let succ_share_count = localStorage.getItem('_share_succ_count_')
        let succ_share_date = localStorage.getItem("_share_succ_date_")

        let d = parseInt(video_watched_date)
        let c = parseInt(video_watched_count)
        if (isNaN(c)) {
            this.setVideoWatchedCount(0)
        } else {
            this.video_watched_count = c
        }
        if (!isNaN(d)) {
            if (gameUtil.isNextDay(d)) {
                this.setVideoWatchedCount(0)
            }
        }

        d = parseInt(fail_share_date)
        c = parseInt(fail_share_count)
        if (isNaN(c)) {
            this.setShareFailCount(0)
        } else {
            this.share_fail_count = c
        }
        if (!isNaN(d)) {
            if (gameUtil.isNextDay(d)) {
                this.setShareFailCount(0)
            }
        }

        d = parseInt(succ_share_count)
        c = parseInt(succ_share_date)
        if (isNaN(c)) {
            this.setShareSuccCount(0)
        } else {
            this.share_succ_count = c
        }
        if (!isNaN(d)) {
            if (gameUtil.isNextDay(d)) {
                this.setShareSuccCount(0)
            }
        }
    }

    static initConfig(conf) {
        this.serverConfig = conf;
        this.client.setTimeout(2500)
        console.log("[WeakNetGame]加载配置文件")
        console.log(conf);
    }

    static async doLogin(progressCallback?): Promise<any> {
        if (!this.isInit) {
            console.log("[WeakNetGame]开始登陆")
            WeakNetGame.initUserData()
            if (!this.serverConfig.is_local_game) {
                progressCallback && progressCallback("config");
                await WeakNetGame.requestConfig()
                progressCallback && progressCallback("local_csv");
                await WeakNetGame.loadLocalCsvs(_ => {
                    progressCallback && progressCallback('local_csv_loaded', _);
                })
                progressCallback && progressCallback("csv");
                await WeakNetGame.downloadCsvs()

                if (this.serverConfig.is_login_enabled) {
                    progressCallback && progressCallback("login");
                    await WeakNetGame.login()
                }
                progressCallback && progressCallback("share_config");
                await WeakNetGame.requestShareConfig();
                Platform.initShare(this.shareConfigs['default'], this.logined_useId)
                //检测 ip 
                if (!this.isLoggedIn) {
                    return false;
                }
                this.isInit = true;
                progressCallback && progressCallback("complete");
                return await WeakNetGame.loadUserInfo()
            } else {
                this.isInit = true;
                return new Promise(resolve => {
                    csv.loadDir("Config/csv", resolve)
                })
            }

        }
    }

    /**
     * 视频v次后分享s次，然后循环；
     * @param a  当前执行了几次
     * @param v  视频v次
     * @param s  分享s次
     */
    static check(a, t1, c1, t2, c2) {
        let c = c1 + c2 + 1;
        a = a % c;
        if (a > c1) return t2;
        else if (a <= c1) return t1;
    }

    static getChoice(key) {
        if (this.video_watched_count >= this.max_video_watch) {
            return 0;
        }
        let val = key
        if (typeof (key) == "string") {
            val = csv.Config[key];
        }
        let choice = Number(val)
        if (isNaN(choice)) {
            // 0=3,1=4 
            try {
                let [[t1, c1], [t2, c2]] = val.split(",").map(v => v.split("=").map(x => parseInt(x)))
                let c = SovInfo.getCount(key)
                choice = this.check(c, t1, c1, t2, c2)
            } catch (e) {
                console.error("配置错误：请检测后台配置！" + "[" + key + "] = " + val);
                choice = 0;
            }
        }
        if (val == 2) {
            choice = g.randomInt(0, 2);
        }
        return choice;
    }

    static set_safe_check_callback(callback) {
        this._check_safe_callback = callback
    }

    static get is_safe_mode() {
        if (!this._check_safe_callback) return false;
        return this._check_safe_callback();
    }

    /**只保存当前session */
    private static _sharedUUIDs = {}

    static get sharedUUIDs() {
        return this._sharedUUIDs;
    }

    static isValidShare(uuid) {
        return this._sharedUUIDs[uuid] != null;
    }

    private static claimedUUIDs = {}

    static isClaimedShare(uuid: string) {
        return this.claimedUUIDs[uuid] != null
    }

    static claimShare(uuid: string) {
        this.claimedUUIDs[uuid] = uuid;
        let callback = this._sharedUUIDs[uuid]
        if (callback)
            callback()
    }

    static share_fail_texts = ['分享失败，请分享到30人群', '分享失败，请分享到新的群']

    static doChoice(key: any, callback, target?, fail_callback?) {
        let choice = this.getChoice(key);
        //发送给指定好友
        //https://developers.weixin.qq.com/minigame/dev/api/open-api/data/wx.shareMessageToFriend.html
        let shareToFriend = () => {
            // let shareCfg = this.shareConfigs['default'] as ShareInfo
            // let imageUrl = shareCfg.imageUrl;
            // let imageUrlId = "";//?审核通过的图片 ID，详见https://developers.weixin.qq.com/minigame/dev/guide/open-ability/share/share.html#%E4%BD%BF%E7%94%A8%E5%AE%A1%E6%A0%B8%E9%80%9A%E8%BF%87%E7%9A%84%E8%BD%AC%E5%8F%91%E5%9B%BE%E7%89%87
            // Platform.sendMessageToOpen("shareMessageToFriend", { imageUrl, imageUrlId })
            evt.emit("wx.shareMessageToFriend")
        }
        let watch = () => {
            SovInfo.invoke(key);
            Platform.watch_video(_ => {
                this.video_watched_count++
                this.setVideoWatchedCount(this.video_watched_count)
                evt.emit("WeakNetGame.watch_video", this.video_watched_count)
                callback && callback.call(target, 'video')
            }, target, () => {
                shareToFriend();
            })
        }
        let share = (b = false) => {

            if (this.is_safe_mode) {
                watch()
                return;
            }
            if (this.is_forbidden) {
                watch()
            } else {
                if (b) {
                    let uuid = g.uuid(8, 16)
                    this._sharedUUIDs[uuid] = callback.bind(target, 'share_link_click');
                    Platform.doShareWithParams({ uuid, share_link: true }, this.shareConfigs[key], () => {
                        callback && callback.call(target, 'share_link');
                    }, this);
                } else {
                    SovInfo.invoke(key);
                    Platform.doShare(this.shareConfigs[key], (ok) => {
                        let notFail = true;
                        if (CC_WECHAT) {
                            if (Math.random() < this.share_fail_rate) {
                                notFail = false;
                            }
                        }
                        if (ok && notFail) {
                            this.setShareSuccCount(++this.share_succ_count)
                            callback && callback.call(target, 'share');
                        } else {
                            this.setShareFailCount(++this.share_fail_count)
                            // fail_callback && fail_callback.call(target, 'share');
                            if (CC_WECHAT) {
                                wx.showModal({
                                    title: "提示",
                                    content: g.getRandom(this.share_fail_texts),
                                    showCancel: true,
                                    cancelText: "取消",
                                    confirmText: "去分享",
                                    success: (res) => {
                                        if (res.cancel) {
                                            //点击取消,默认隐藏弹框
                                        } else {
                                            share();
                                        }
                                    }
                                })
                            } else {
                                console.warn("分享失败! ,请重试!")
                            }
                        }
                    }, this.share_succ_delay)
                }
            }
        }
        if (choice == 0) {
            share()
        } else if (choice == 1) {
            if (this.video_watched_count >= this.max_video_watch) {
                share();
            } else {
                watch();
            }
        } else if (choice == 3) {
            callback && callback.call(target)
        } else if (choice == 4) {
            // 链接分享 ，需要玩家点击链接后完成整个分享流程
            share(true);
        }
    }


}

window["WeakNetGame"] = WeakNetGame;