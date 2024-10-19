import DataCenter, { dc, field } from "../../core/DataCenter";
import Platform, { AuthUserInfo } from "../Platform";
import WeakNetGame from "./WeakNetGame";
import gameUtil from "../../utils/gameUtil";
let firstEnterHome = true
@dc("UserInfo")
export default class UserInfoDC extends DataCenter {
    // @field()
    // ip_cname: string = ""

    // @field()
    // ip_addr: string = ""

    // @field()
    // ip_s: number = 0;

    @field()
    lastLoginTime: number = 0

    @field()
    isFirstLoginToday: boolean = false;

    /**需要在进入后置为false */
    @field()
    isFirstEnterGame: boolean = true;

    //================-----------------------

    @field()
    nickName: string = '';

    @field()
    userId: string = '';

    @field()
    avatarUrl: string = '';

    //================-----------------------

    @field()
    firstLoginTime: number = 0;

    /**最后一次退出游戏 的时间 ,秒为单位  */
    @field()
    lastExitTime: number = 0;

    // （新玩家）当天退出游戏再进也算 
    isNew = false;

    get userType() {
        return this.isNew ? "(新玩家)" : "(老玩家)"
    }

    exitGame() {
        this.lastExitTime = Date.now() / 1000;
        this.save("lastExitTime")
    }

    onLoadAll() {
        if (this.firstLoginTime == 0) {
            this.firstLoginTime = Date.now()
        }
        if (gameUtil.isNextDay(this.firstLoginTime)) {
            this.isNew = false;
        } else {
            this.isNew = true;
        }
        if (gameUtil.isNextDay(this.lastLoginTime)) {
            this.lastLoginTime = Date.now();
            this.isFirstLoginToday = true;
        } else {
            this.isFirstLoginToday = false;
        }
        if (isEmpty(this.userId)) {
            this.userId = g.uuid(16, 16)
        }
        this.save()
    }

    /**
     * 上传用户数据 
     * @param kvs 
     */
    async uploadUserInfo(kvs: Object) {
        //仅对授权过的用户进行提交数据
        if (isEmpty(UserInfo.userId)) {
            return -1;
        }
        //开始上传
        try {
            let d = {
                userId: UserInfo.userId,
                nickName: UserInfo.nickName,
                avatarUrl: UserInfo.avatarUrl
            }
            for (var k in kvs) {
                d[k] = kvs[k];
            }
            //上传授权信息
            await WeakNetGame.syncData(JSON.stringify(d), UserInfo.userId)
        } catch (e) {
            console.error("上传数据失败" + e);
            return -2;
        }
        return 0;
    }
    /**
     *  在 WxgetInfoButton 的按钮回调里执行
     * @param kvs 需要上传的key-value 对 数据
     * @param authInfo 从WxgetInfoButton 按钮回调里获取的参数
     * @returns 0 表示成功上传 ,- 1玩家 未授权， -2  上传过程失败
     */
    async openRankAndUpload(kvs: Object, authInfo: AuthUserInfo) {
        if (isEmpty(UserInfo.nickName)) {
            if (!authInfo) {
                authInfo = await Platform.checkAuth()
            }
            //update user info 
            if (authInfo == null) {
                //玩家未授权
                return -1;
            } else {
                //已授权 
                UserInfo.nickName = authInfo.nickName;
                if (isEmpty(UserInfo.userId)) {
                    UserInfo.userId = g.uuid(16, 16);
                }
                UserInfo.avatarUrl = authInfo.avatarUrl;
                //保存授权信息
                UserInfo.save();
            }
        }
        //开始上传
        return this.uploadUserInfo(kvs);
        // if(UserInfo.nickName == null)
    }


    /**检查是否有离线收益 
     * @returns 离线时间  (s)
    */
    checkOffline() {
        if (firstEnterHome) {
            firstEnterHome = false;
            let offset = Date.now() / 1000 - UserInfo.lastExitTime;
            if (offset > 60) {
                return offset;
            }
            return 0
        }
    }
}


export let UserInfo: UserInfoDC = DataCenter.register(UserInfoDC);
