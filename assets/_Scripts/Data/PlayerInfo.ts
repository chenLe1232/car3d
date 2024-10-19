import DataCenter, { dc, field } from "../../framework3D/core/DataCenter";
import { UserInfo } from "../../framework3D/extension/weak_net_game/UserInfo";
import Platform from "../../framework3D/extension/Platform";


@dc("PlayerInfo")
export default class PlayerInfoD extends DataCenter {


    /////////////////////////////////////////////通用功能 
    /**签到次数 */
    @field()
    CheckInCount: number = 0;
    @field()
    CheckInTime: number = Date.now();

    @field()
    buff_outputSpeed: number = 0;


    @field()
    level: number = 1;

    //tmp 
    //加速buff
    buff_speedup = 0

    @field({ persistent: false })
    timeLeft: number = 0;

    tmp_diamond: number = 0;
    @field({ persistent: false })
    energyCount: number = 0;

    @field({ persistent: false })
    tmp_killed: number = 0



    @field()
    killed: number = 0

    @field()
    revived: number = 0;

    isWin: boolean = false;

    isEnd: boolean = true;

    @field()
    guide: number = 0;

    get isLose() {
        return !this.isWin
    }

    onLevelStart() {
        this.tmp_diamond = 0;
        this.energyCount = 0;
        this.tmp_killed = 0;
        this.revived = 0;
        this.isWin = false;
        this.isEnd = false
    }

    onLevelEnd(v) {
        this.killed += this.tmp_killed
        this.isEnd = true;
        this.isWin = v;
        if (v) {
            //结束 上传数据 
            // 上传数据 
            PlayerInfo.level++;
            PlayerInfo.save("level")
            Platform.uploadScore('level', { level: PlayerInfo.level })
            UserInfo.uploadUserInfo({ level: PlayerInfo.level })
        }
    }



}


export let PlayerInfo: PlayerInfoD = DataCenter.register(PlayerInfoD);