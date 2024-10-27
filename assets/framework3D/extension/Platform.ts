import { wxsdk } from './wxsdk/sdk';

import SpriteFrameCache from '../misc/SpriteFrameCache';
import { Toast } from '../ui/ToastManager';
import { evt } from '../core/EventManager';
import { GameConfig } from './wxsdk/GameConfigs';
import { assetManager, loader } from 'cc';
import { ttsdk } from './adsdk/ttsdk';
import { Signal } from '../core/Signal';

enum WxCommands {
  Hide = 99,
  Next,
  RankSmall,
  Rank,
}

export interface ShareInfo {
  title: string;
  imageUrl: string;
  query?: string;
  ald_desc?: string;
  // id?:string,
  queryObjects: Object | { id: string };
  share_weight: number;
}
//"{"nickName":"꯭Da꯭m꯭o꯭nR꯭e꯭n","gender":1,"language":"zh_CN","city":"","province":"","country":"中国","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/OAaG3jcYYVFic1vYH3K4Lxaej7OPFl7cVpaACre2ibiaJa21Cz5zUz1K7FH6JNvfZqqlhC2glrDj9ibgofmk2ZqzMQ/132"}"
export interface AuthUserInfo {
  openId: string;
  avatarUrl: string;
  nickName: string;
  city: string;
  gender: number;
  country: string;
  provice: string;
}

export default class Platform {
  static bannnerRefreshEnabled = true;
  static _refreshEnabled = false;
  static onEnterForegroundSignal = new Signal();

  static isAndroid = false;
  static isIOS = false;

  static _shareConfig: any;

  // 激励视频广告
  static callback: Function = null;
  static target: any = null;

  static getOpenID() {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      // wechat
      let userInfo = wxsdk.userInfo;
      if (userInfo && userInfo.openID) {
        return userInfo.openID;
      } else {
        return '';
      }
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
      return;
    } else {
      return '123';
    }
  }

  static getNick() {
    if (cc.sys.QQ_PLAY == cc.sys.platform) {
      return;
    } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      return (wxsdk.userInfo && wxsdk.userInfo.nickName) || '自已';
    } else {
      return '玩家自已';
    }
  }

  static getHead() {
    if (cc.sys.QQ_PLAY == cc.sys.platform) {
      return;
    } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      // avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/QlHaicGZOD7do9LuX5W4APHYSrUBqVaGULuwISLUf35IyOOYZ3IXl7nF5mW36JiaQ9snziawrAvkknX41SmeYa9AQ/132"city:""country:""gender:1language:"zh_CN"nickName:"Damon Ren⁶⁶⁶"province:""
      let userInfo = wxsdk.userInfo;
      if (userInfo && userInfo.avatarUrl) {
        return userInfo.avatarUrl;
      } else {
        return 'https://tank.wdfunny.com/speed_logo/2.jpg';
      }
    }
    return 'https://tank.wdfunny.com/speed_logo/1.jpg';
  }

  static loadSelfHead(sprite) {
    if (cc.sys.QQ_PLAY == cc.sys.platform) {
    } else {
      SpriteFrameCache.instance
        .getSpriteFrame(Platform.getHead())
        .then(sf => (sprite.spriteFrame = sf));
    }
  }

  static exit() {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wx.offShow(Platform.onEnterForeground);
      wx.offHide(Platform.onEnterBackground);
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    }
  }

  static configGetSignal: Signal = new Signal();

  static login(p?) {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wxsdk.login(p);
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    }
  }

  // static startAuth() {
  //     if (cc.sys.WECHAT_GAME == cc.sys.platform) {
  //         return wxsdk.startAuth();
  //     } else {
  //         let userInfo = {} as AuthUserInfo
  //         userInfo.avatarUrl = "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1030399321,1493970029&fm=27&gp=0.jpg"
  //         userInfo.city = "WuHan",
  //             userInfo.gender = 1,
  //             userInfo.nickName = 'aliwangzai'
  //         return Promise.resolve(userInfo);
  //     }
  // }

  static checkAuth(): Promise<AuthUserInfo> {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      return wxsdk.checkAuth() as any;
    } else {
      let userInfo = {} as AuthUserInfo;
      userInfo.avatarUrl =
        'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1030399321,1493970029&fm=27&gp=0.jpg';
      (userInfo.city = 'WuHan'),
        (userInfo.gender = 1),
        (userInfo.nickName = 'aliwangzai');
      return Promise.resolve(userInfo);
    }
  }

  /** 解决 排行榜 无法划动问题 */
  static fix_wechat_subContext(
    subContext: cc.WXSubContextView,
    self: cc.Component
  ) {
    subContext.node.active = false;
    self.scheduleOnce(_ => {
      subContext.node.active = true;
    }, 0.1);
  }

  static defaultShareConfig: ShareInfo = null;
  static userId: string = '0';
  static initShare(cfg: ShareInfo, userId?) {
    if (cfg && cfg.queryObjects) cfg.queryObjects['userId'] = userId;
    this.defaultShareConfig = cfg;
    this.userId = userId;
    this.isAndroid = cc.sys.os == 'Android';
    console.log('================= os', cc.sys.os);
    this.isIOS = cc.sys.os == 'iOS';
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wxsdk.showShareMenu(cfg);
      wx.onShow(Platform.onEnterForeground);
      wx.onHide(Platform.onEnterBackground);
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    }
    this.initUpdate();
  }

  static getGameID() {
    if (cc.sys.QQ_PLAY == cc.sys.platform) {
    }
    return 'speed_wanyiwan';
  }

  static getLaunchOptions(): { scene: number; query: Object } {
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      return wx.getLaunchOptionsSync();
    }
    return { scene: 0, query: {} };
  }

  static getCity() {
    return '';
  }

  static share(calback?) {
    this.doShare(this.defaultShareConfig, calback);
  }

  static _shareTipEnabled: boolean = true;

  static setShareFailTipEnable(b) {
    this._shareTipEnabled = b;
  }
  static shareCount = 0;
  static doShareWithParams(
    params,
    share_cfg: ShareInfo,
    callback?,
    target?,
    timeout = 2000
  ) {
    share_cfg = share_cfg || this.defaultShareConfig;
    console.log('######开始分享');
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      params = params || {};
      params.userId = this.userId;
      wxsdk.openShare(share_cfg, params);
      let t = new Date().getTime();
      Platform.onEnterForegroundSignal.on(obj => {
        Platform.onEnterForegroundSignal.clear();
        let d = new Date().getTime() - t;
        if (d > timeout) {
          // if(Math.random() < 0.5)
          // {
          this.shareCount = 0;
          setTimeout(_ => {
            if (callback) callback.call(target, 1);
          }, 500);
          // }else{
          //     if(this.shareCount >= 2){
          //         this.shareCount = 0;
          //         setTimeout(_ => {
          //             if (callback)
          //                 callback.call(target)
          //         }, 500)
          //     }
          //     else{
          //         //用户及时返回分享失败
          //         Toast.make("分享失败,请尝试换其它群分享")
          //     }
          // }
        } else {
          //用户及时返回分享失败
          if (callback) callback.call(target, 0);
          // Toast.make("分享失败,请尝试换其它群分享")
        }
      });
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    } else {
      callback && callback.call(target, 1);
    }
  }

  static doShare(share_cfg: ShareInfo, callback?, timeout = 3000) {
    this.doShareWithParams(null, share_cfg, callback, timeout);
  }

  static _videoEnabled = true;
  static _bannerEnabled = true;

  static setAdEnabled(b) {
    this._videoEnabled = b;
    this._bannerEnabled = b;
  }

  static isVideoAdEnabled(b) {
    return this._videoEnabled;
  }

  static isBannerAdEnabled(b) {
    return this._bannerEnabled;
  }

  static watch_video(callback, target?, fail_load_callback?) {
    console.log('######开始看视频');
    if (!this._videoEnabled) return;
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wxsdk.loadVideoAd((code, isEnded) => {
        if (code == 'load') {
          Platform._refreshEnabled = false;
        } else if (code == 'show') {
        } else if (code == 'close') {
          Platform._refreshEnabled = true;
          if (!isEnded) {
            // Toast.make("必须看完视频,才能获取奖励哦")
            // fail_callback && fail_callback.call(target);
            wx.showModal({
              title: '提示',
              content: '看完广告才能获得奖励哦',
              showCancel: false,
            });
          } else {
            callback && callback.call(target);
          }
        } else if (code == 'error') {
          // Toast.make("没有视频,请稍后再试!")
          fail_load_callback && fail_load_callback.call(target);
          // this.doShare(WeakNetGame.shareConfigs["default"], callback, target, fail_callback);
        }
      });
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
      //关闭背景
    } else {
      Platform.callback = callback;
      Platform.target = target;
      ttsdk.showRewardAd();
      // callback && callback.call(target)
    }
  }

  static onWatchVideoSuc(uuid: string) {
    Platform.callback && Platform.callback(Platform.target);
  }

  static msgCall(msg: string) {
    Toast.make(`${msg}`);
  }

  static showInterstitial(errorCallback?) {
    console.log('####显示插屏广告');
    if (CC_WECHAT) {
      wxsdk.showInterstitial(errorCallback);
    }
  }

  static showGamePortal(errcallback) {
    let portalAd = null;
    console.log('创建推荐位实例-----');
    if (wx.createGamePortal) {
      portalAd = wx.createGamePortal({ adUnitId: GameConfig.portal_id });
    } else {
      console.error('不支持wx.createGamePortal');
      errcallback && errcallback(0);
    }
    // 在适合的场景显示推荐位
    if (portalAd) {
      portalAd
        .load()
        .then(() => {
          portalAd.show();
        })
        .catch(err => {
          console.error('createGamePortal:' + err);
          errcallback && errcallback(1, err);
        });
    }
  }

  static showBannerAd(errorCallback?) {
    console.log('######显示Banner广告');
    if (!this._bannerEnabled) return;
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wxsdk.showBannerAd(errorCallback);
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    } else {
      ttsdk.showBanner();
    }
  }

  static isBannerShow() {
    if (CC_WECHAT) {
      return wxsdk.isBannerShow();
    }
  }

  static hideBannerAd() {
    console.warn('######隐藏Banner广告');
    if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      wxsdk.hideBannerAd();
    } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
    } else {
      ttsdk.hideBanner();
    }
  }

  static refreshBannerAd() {
    console.log('刷新 banner ');
    if (CC_WECHAT) {
      wxsdk.loadBannerAd();
    }
  }

  static reloadBannerAd(bShow = false, errcallback?) {
    if (CC_WECHAT) {
      wxsdk.hideBannerAd();
      wxsdk.loadBannerAd(v => {
        if (v == 'load')
          if (bShow) {
            wxsdk.showBannerAd();
          } else if (v == 'error') {
            errcallback && errcallback();
          }
      });
    }
  }

  static initBannerAd(b = 1) {
    if (b == 0) return;
    if (cc.sys.QQ_PLAY == cc.sys.platform) {
    } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      setInterval(_ => {
        if (Platform.bannnerRefreshEnabled && Platform._refreshEnabled) {
          console.log('######加载WX Banner广告');
          wxsdk.hideBannerAd();
          wxsdk.loadBannerAd(v => {
            if (v == 'load') wxsdk.showBannerAd();
          });
        }
      }, 40000);
    }
  }

  static jumpTo() {
    // var desGameId = 1234; //跳转的gameid，必须为数字
    // var extendInfo = ""; //额外参数，必须为字符串
    // BK.QQ.skipGame(desGameId, extendInfo);
  }

  static showRankDialog() {
    console.log('[Platform]#showRankDialog');
    Toast.make('#[Platform]#showRankDialog');

    // ViewManager.instance.show("Game/RankDialog")
  }

  // Andriod 发送游戏快捷方式到桌面

  static onEnterForeground(obj?) {
    console.log('=====================onEnterForeground=====================');
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
      //onEnterForeground
      // Device.resumeMusic()
    } else {
      // cc.audioEngine.resumeMusic()
    }
    Platform.onEnterForegroundSignal.fire(obj);
    evt.emit('onEnterForeground');
  }

  static onEnterBackground() {
    // BK.onEnterBackground(enterBackgroundListener);
    // if (cc.sys.platform == cc.sys.QQ_PLAY) {

    // } else {
    //     cc.audioEngine.pauseMusic()
    // }
    evt.emit('onEnterBackground');
  }

  static onGameExit() {
    // BK.onGameClose(gameCloseListener);
  }

  /** *
   *
   *
   */

  static sendMessageToOpen(cmd, data) {
    if (CC_WECHAT) {
      wxsdk.postMessage(cmd, data);
    }
  }

  static showSmallRank(rankName, rankType) {
    wxsdk.postMessage(WxCommands.RankSmall, { rankName, rankType });
  }

  static showRank(rankName, rankType) {
    wxsdk.postMessage(WxCommands.Rank, { rankName, rankType });
  }

  static hideRank() {
    wxsdk.postMessage(WxCommands.Hide);
  }

  static getRankList(callback, target?) {
    console.log('[Platform]#获取排行榜数据');
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
    } else if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    }
  }

  static uploadScore(k: string | number, v?: object) {
    console.log('[Platform]#上传分数');
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
    } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      // wxsdk.postMessage(WxCommands., score);
      let s = JSON.stringify(v);
      wxsdk.uploadScore(k, s);
    } else {
      // Toast.make("#[Platform]#uploadScore")
    }
  }

  static uploadScores(kvs: { key: string; value: string }[]) {
    if (cc.sys.platform == cc.sys.QQ_PLAY) {
    } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
      // wxsdk.postMessage(WxCommands., score);
      return wxsdk.uploadScores(kvs);
    } else {
      return Promise.resolve({});
      // Toast.make("#[Platform]#uploadScore")
    }
  }

  private static _launch_options: LaunchOption;
  public static get launch_options(): LaunchOption {
    if (!CC_WECHAT) {
      return null;
    }
    if (this._launch_options == null) {
      this._launch_options = wx.getLaunchOptionsSync();
    }
    return this._launch_options;
  }

  public static matchPath(cfg: string | number) {
    // ald_link_key
    //ald_media_id
    //ald_position_id
    // let t = '?ald_media_id=15641&ald_link_key=8ebc0645ddba0996&ald_position_id=0,?ald_media_id=15641&ald_link_key=8ebc0645ddba0996&ald_position_id=0'
    if (this.launch_options == null) return false;
    let s = cfg + '';
    let arr = s.split(/[,\s]+/);
    return arr.some(a => {
      let kvs = a.split(/[\?&@\*]/);
      kvs = kvs.filter(v => v != '');
      //是否解析出来的k和 launch option query 对象key 对应的值相等
      return kvs.every(kv => {
        let [k, v] = kv.split('=');
        let rv = this.launch_options.query[k];
        if (rv == undefined && v == undefined) return false;
        return rv == v;
      });
    });
  }

  static loadSubPackage(name, progress?) {
    if (CC_WECHAT) {
      return new Promise((resolve, reject) => {
        let id_interval = 0;
        const loadTask = assetManager.loadBundle(name, function () {
          clearInterval(id_interval);
          resolve();
        });
        let c = 0;
        id_interval = setInterval(v => {
          c += 5;
          progress && progress(c, c, 100);
          if (c >= 100) {
            clearInterval(id_interval);
          }
        }, 20);
        if (loadTask) {
          loadTask.onProgressUpdate(res => {
            if (id_interval != 0) {
              clearInterval(id_interval);
              id_interval = 0;
            }
            progress &&
              progress(
                res.progress,
                res.totalBytesWritten,
                res.totalBytesExpectedToWrite
              );
            // console.log('下载进度', res.progress)
            // console.log('已经下载的数据长度', res.totalBytesWritten)
            // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
          });
        }
      });
    } else {
      return new Promise(resolve => {
        let c = 0;
        let id = setInterval(v => {
          c += 10;
          progress && progress(c, c, 100);
          if (c >= 100) {
            clearInterval(id);
            resolve();
          }
        }, 50);
      });
    }
  }

  static initUpdate() {
    if (CC_WECHAT) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(res => {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate);
      });

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          },
        });
      });

      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
      });
    }
  }

  public static gc() {
    if (CC_WECHAT) {
      //trigger gc
      wx.triggerGC();
    }
  }
}

cc['platform'] = Platform;
