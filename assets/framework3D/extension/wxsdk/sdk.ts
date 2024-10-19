import { GameConfig } from "./GameConfigs";
import { evt } from "../../core/EventManager";

class Global {
    static videoAd = undefined
    static bannerAd = undefined
    static interstitialAd = undefined
    static isBannerShow = false;
    static videoAdLoadCount = 0 //视频广告加载次数
    static bannerAdLoadCount = 0 //banner广告加载次数
    static video_close_callback: (ret: any) => void;
    static video_error_callback: () => void;
    static video_load_callback: () => void;
}


export interface ShareInfo {
    title: string,
    imageUrl: string,
    query?: string,
    ald_desc?: string

    id?: string,
    queryObjects: Object
}

class WxSdk {
    _userInfo: any = null;
    _loginCode: any;
    _openId: string = "";

    _db: any;
    _version: number;
    _systemInfo: any;

    public get Ver(): number { return this._version; }

    public get userInfo() { return this._userInfo }

    public get parent() {
        if (!CC_WECHAT) return ""
        let info = wx.getLaunchOptionsSync();
        if (info.scene == 1007 || info.scene == 1008) {//通过分享进入游戏
            let openId = info.query["user_id"];
            return openId
        }
        return ""; //默认
    }

    public set openId(v) {
        this._openId = v
    }

    public get openId() {
        return this._openId
    }


    constructor() {
        if (CC_WECHAT) {
            if (this._version == null) {
                this._systemInfo = wx.getSystemInfoSync();
                let ver = this._systemInfo.SDKVersion.replace(/\./g, "")
                this._version = parseInt(ver);
            }
        }
    }

    requestDB(tbname, callback, target) {
        this._db.collection(tbname).get({
            success: function (res) {
                console.log("get " + tbname + " succ:", res.data)
                // self._shareConfig = res.data;
                if (callback) callback.call(target, res.data);
            }, fail: (res) => {
                console.log("get " + tbname + " fail:")
                if (callback) callback.call(target)
            }
        });
    }


    requestConfig(callback) {
        this._db.collection("t_conf").get({
            success: function (res) {
                console.log("get configs succ:", res.data)
                // self._shareConfig = res.data;
                if (callback) callback(res.data);
            }, fail: (res) => {
                console.log("get configs fail:", res)
                if (callback) callback(null)
            }
        });
    }


    /**
     * 打开分享
     * @param share_cfg {ShareInfo}
     */
    async openShare(share_cfg: ShareInfo, params?) {
        if (!CC_WECHAT) return;
        let info = {} as ShareInfo
        info.title = share_cfg.title;
        info.imageUrl = share_cfg.imageUrl;
        let querys: any = info.queryObjects || {};
        if (info != null) {
            let querystr = ""
            params = params || {}
            Object.keys(params).forEach(k1 => {
                querys[k1] = params[k1]
            })
            querystr = Object.keys(querys).reduce((sum, k) => {
                let v = querys[k]
                return sum + `${k}=${v}&`
            }, querystr)

            //ald
            info.query = querystr + "time=" + new Date().getTime()
            info.ald_desc = share_cfg.ald_desc
            console.log("open Share", info)
            wx.shareAppMessage(info);
        }
    }

    private createButton(callback, x?, y?, width?, height?) {
        console.log("-------------createButton");
        let button = wx.createUserInfoButton({
            type: "text",
            text: "     ",
            style: {
                x: x || 0, y: y || 0,
                width: width || cc.winSize.width,
                height: height || cc.winSize.height,
                lineHeight: 40,
                backgroundColor: '#00000000',
                color: '#ffffff'
            }
        });
        button.onTap(function (res) {
            button.destroy();
            if (res && res) {
                if (callback) callback(res);
            } else if (callback) callback(null);
        });
    }


    private getUserInfo(callback) {
        console.warn("-------------getUserInfo");
        wx.getUserInfo({
            withCredentials: true,
            lang: "zh_CN",
            success: (res) => {
                console.log("getUserInfo success.", res);
                if (callback) callback(res);
            }, fail: (res) => {
                console.log("getUserInfo:", res);
                if (callback) callback(null);
            },
            complete: null
        });
    }

    oldAuthUser(callback) {
        wx.authorize({
            scope: "scope.userInfo",
            success: (res) => {
                console.log(res);
                if (callback) callback(true);
            }, fail: (res) => {
                console.log(res);
                if (callback) callback(false);
            }, complete: null
        });
    }


    public showShareMenu(cf: ShareInfo) {
        let self = this;
        wx.showShareMenu({
            withShareTicket: true,
            success: (res) => {
                console.log(res);
            }, fail: (res) => {
                console.log(res);
            }, complete: null
        });
        //ald
        wx.onShareAppMessage(function () {
            let content =  {title:GameConfig.default_share_title,imageUrl:cc.url.raw(GameConfig.deafult_share_imgUrl)}
            return cf;
        });
    }


    private wxLogin(callback) {
        wx.login({
            success: (res) => {
                console.log("code ", res.code);
                this._loginCode = res.code;
                evt.emit("wxlogin", res.code);
                if (callback) callback(true);
            }, fail: (res) => {
                if (callback) callback(false);
            }, complete: null
        });
    }

    public startAuth() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (self._version >= 220) {
                self.createButton((ret) => {
                    self.loginToServer(ret);
                    if (ret)
                        resolve(this._userInfo)
                    else
                        reject();
                });
            } else {
                self.oldAuthUser((isAuth) => {
                    if (isAuth) {
                        self.getUserInfo((ret) => {
                            self.loginToServer(ret);
                            resolve(this._userInfo)
                        });
                    } else {
                        reject();
                    }
                })
            }
        })
    }

    public checkAuth() {
        if (wxsdk.userInfo) {
            return Promise.resolve(wxsdk.userInfo);
        } else {
            return new Promise((resolve, reject) => {
                wx.getSetting({
                    success: (res) => {
                        let auth = res.authSetting;
                        if (auth["scope.userInfo"]) {
                            this.getUserInfo((ret) => {
                                this.loginToServer(ret);
                                resolve(this._userInfo)
                            })
                        } else {
                            // return this.startAuth();
                            resolve(null);
                        }
                    }, fail: null,
                    complete: null,
                });
            })
        }

    }


    private loginToServer(ret) {
        console.log("loginToServer", ret)
        if (ret && ret.userInfo) {
            this._userInfo = ret.userInfo
        }
        evt.emit("wxUserInfo", this._userInfo, this._loginCode);
    }

    public login(p) {
        if (!CC_WECHAT) return
        let self = this;
        //wx.cloud.init({traceUser: true});
        // this._db = wx.cloud.database({env: "release-2c87c4"});//测试环境
        //this._db = wx.cloud.database();
        self.wxLogin(isLogin => {
            if (!isLogin) return;
            if (p) {
                this.startAuth();
            }
        })
    }

    //发送消息到子域
    public postMessage(cmd, data?) {
        if (CC_WECHAT) {
            let req = { cmd }
            if (data) {
                Object.keys(data).forEach(k => {
                    req[k] = data[k]
                })
            }
            wx.getOpenDataContext().postMessage(req);
        }
    }

    public uploadScores(kvs) {
        return new Promise((resolve, reject) => {
            let obj = {
                KVDataList: kvs,
                success: function (d) {
                    resolve(d)
                },
                fail: function () {
                    reject();
                },
                complete: function () { },
            }
            console.warn("-------uploadScores", kvs);
            wx.setUserCloudStorage(obj)
        })
    }

    public uploadScore(k, v, callback?) {
        var kvDataList = new Array();
        kvDataList.push({
            key: k,
            value: v
        });

        let obj = {
            KVDataList: kvDataList,
            success: function (d) {
                if (callback) callback(d)
            },
            fail: function () { },
            complete: function () { },
        }
        wx.setUserCloudStorage(obj)
        // "wxgame": {
        //     "score": 16,
        //     "update_time": 1513080573
        // },
        // "cost_ms": 36500
    }

    public loadBannerAd(callback?) {
        if (Global.bannerAd) {
            Global.bannerAd.destroy()
        }
        if (!this._systemInfo)
            this._systemInfo = wx.getSystemInfoSync();
        var w = this._systemInfo.screenWidth / 2;
        var h = this._systemInfo.screenHeight;
        let isPor = this._systemInfo.screenWidth <= this._systemInfo.screenHeight;
        let fixWidth = isPor ? this._systemInfo.screenWidth : (this._systemInfo.screenHeight / 3);
        let modelStr = this._systemInfo.model
        let isIOS = false;
        if (modelStr) {
            if (modelStr.indexOf("iPhone") != -1) {
                isIOS = true;
            }
        }
        let bannerAd = wx.createBannerAd({
            adUnitId: GameConfig.banner_ad_id,
            style: {
                left: 0,
                top: 0,//cc.visibleRect.height
                width: fixWidth
            }
        })
        Global.bannerAd = bannerAd;
        bannerAd.onLoad(() => {
            Global.bannerAdLoadCount = 0;
            bannerAd.style.left = w - bannerAd.style.realWidth / 2;
            if (isIOS) {
                bannerAd.style.top = h - bannerAd.style.realHeight -13;
            } else {
                bannerAd.style.top = h - bannerAd.style.realHeight;
            }
            if (callback) callback("load", bannerAd)
        })
        bannerAd.onError((err) => {
            //加载失败
            console.log("wxsdk bannerAd onError code:" + err.code + " msg:" + err.msg);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                this.loadBannerAd(callback);
            }
            Global.bannerAd = null;
            if (callback) callback("error")
        });
    }

    public showBannerAd(errorCallback?): any {
        console.log("Wxsdk 显示banner广告", Global.bannerAd)
        if (Global.bannerAd) {
            Global.bannerAd.show();
            Global.isBannerShow = true
            evt.emit("wxsdk.BannerReady")
        } else {
            console.log("Wxsdk 不存在banner资源....");
            this.loadBannerAd((v, ad) => {
                if (v == "load") {
                    this.showBannerAd()
                } else if (v == 'error') {
                    errorCallback && errorCallback();
                }
            });
        }
    }

    isBannerShow() {
        return Global.isBannerShow;
    }

    hideBannerAd() {
        if (Global.bannerAd) {
            Global.bannerAd.hide();
            Global.isBannerShow = false;
            // Global.bannerAd = null;
        }
    }

    //interstitial
    showInterstitial(errorCallback) {
        // 创建插屏广告实例，提前初始化
        if (wx.createInterstitialAd) {
            Global.interstitialAd = wx.createInterstitialAd({
                adUnitId: GameConfig.interstitial_ad_id
            })
        }
        else {
            console.log("不支持插屏广告")
            errorCallback && errorCallback('notsupport')
        }
        // 在适合的场景显示插屏广告
        if (Global.interstitialAd) {
            Global.interstitialAd.show().catch((err) => {
                console.error(err)
                errorCallback && errorCallback("err", err);
            })
        }
    }

    loadVideoAd(callback) {
        console.log("============wxsdk.loadVideoAD");
        // if (!Global.videoAd ) { //如果没有广告资源就加载新的视频广告
        let self = this;
        let videoAd = Global.videoAd;
        if (!videoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: GameConfig.video_ad_id
            })
        } else {
            videoAd.offClose(Global.video_close_callback);
            videoAd.offError(Global.video_error_callback);
            videoAd.offLoad(Global.video_load_callback);
        }
        Global.video_error_callback = function () {
            //加载失败
            Global.videoAdLoadCount += 1;
            //尝试4次
            if (Global.videoAdLoadCount < 4) {
                self.loadVideoAd(callback);
            } else {
                if (callback) callback("error")
            }
        }

        Global.video_close_callback = function (ret) {
            //播放结束
            console.log("wxsdk onClose...");
            Global.videoAdLoadCount = 0
            if (callback) callback("close", ret.isEnded)
            Global.videoAd = null;
        }

        Global.video_load_callback = function () {
            //加载成功
            console.log("wxsdk onLoad");
            Global.videoAd = videoAd;
            Global.videoAdLoadCount = 0;
            // this.showBannerAd();
            if (callback) callback("load", videoAd)
        }
        // 用户触发广告后，显示激励视频广告
        videoAd.show().catch(() => {
            // this.hideBannerAd();
            videoAd.load().then(() => {
                videoAd.show();
                if (callback) callback("show")
            }).catch(err => {
                Global.videoAdLoadCount += 1;
            });
        })
        videoAd.onError(Global.video_error_callback);
        videoAd.onClose(Global.video_close_callback);
        videoAd.onLoad(Global.video_load_callback);
        Global.videoAd = videoAd
    }
}

export let wxsdk: WxSdk = new WxSdk();