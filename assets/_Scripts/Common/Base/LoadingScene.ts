import { UserInfo } from "../../../framework3D/extension/weak_net_game/UserInfo";
import LoadingSceneBase from "../../../framework3D/misc/LoadingSceneBase";
import WeakNetGame from "../../../framework3D/extension/weak_net_game/WeakNetGame";
import { ServerConfig } from "./ServerConfig";
import { PlayerInfo } from "../../Data/PlayerInfo";
import { evt } from "../../../framework3D/core/EventManager";
import { LabelComponent, utils, Node, loader, _decorator, SystemEventType, dynamicAtlasManager } from "cc";
import Platform from "../../../framework3D/extension/Platform";
import PersistNode from "./PersistNode";
import { ttsdk } from './../../../framework3D/extension/adsdk/ttsdk';
import BuffManager, { buffSystem } from "../../../framework3D/misc/buffs/BuffSystem";

const { ccclass, property } = _decorator;

let inited = false;
let _initedSDK = false
@ccclass
export default class LoadingScene extends LoadingSceneBase {

    @property(LabelComponent)
    Tips!: LabelComponent;

    @property(Node)
    splash!: Node;

    onLoad() {
        dynamicAtlasManager.enabled = false;
        console.log("LoadingScene->onLoad");
        this.addComponent(BuffManager)
        super.onLoad();
        this.node.on(SystemEventType.TOUCH_END, this.onClick, this)//cc.Node.EventType

    }

    async loadGameRes() {
        await this.loadSubPackage("_car", '加载汽车模型')
        await this.loadSubPackage("_Model", '加载场景模型')
        await this.loadSubPackage("tex_env", "加载场景纹理")
        await this.loadSubPackage("ui_game", "加载游戏场景UI")

    }

    canRetry = false;

    async nextScene() {
        try {
            await this.loadSubPackage("ui", "加载通用UI")
            // await zzsdk.init()
            // csv.createIndex("Audio", "Key", "config_data")
            if (PlayerInfo.guide == 0) {
                await this.loadGameRes();
                PlayerInfo.guide = 1;
                PlayerInfo.save('guide')
                LoadingScene.setNextScene('Level')
            } else {
                //慢慢加载
                //如果玩家汽车id > xxx 
                let sceneName = LoadingScene.getNextScene()
                Platform.loadSubPackage("_car2")
                if (sceneName == "Game") {
                    //主场景 
                    // await this.loadSubPackage("zzsdk", '加载sdk')
                    this.initSDK()
                    await this.loadSubPackage("_car", '加载汽车模型')
                    await this.loadSubPackage("ui_home", "加载UI资源")
                    //await this.loadSubPackage("car_thumbnail", "加载汽车小图")
                } else {
                    //游戏场景
                    await this.loadGameRes();
                }
            }
            this.loadNextScene()
            evt.emit("Loading.Success")
        } catch (e) {
            console.error(e);
            this.label.string = "加载失败，点击屏幕重试!"
            this.canRetry = true;
        }
    }



    initSDK() {
        if (_initedSDK == false) {
            if (CC_WECHAT) {
                // window['zzsdkuiNew'].initSDK(0, '1.0.0', 'https://wxa.332831.com/xsl/wx55381d192d1faf41/v1.0.0/config.json', 'wx55381d192d1faf41');
            } else {
                ttsdk.setIDs(UserInfo.userId, "");
            }

            _initedSDK = true;
        }
    }


    //csv config share_config complete
    loginProgress(evt: any, ext: any) {
        switch (evt) {
            case 'login':
                this.label.string = "登录中"
                this.progress = 0.1;
                break;
            case 'config':
                this.label.string = "加载配置"
                this.progress = 0.2;
                break;
            case 'local_csv':
                this.label.string = "加载本地配置"
                this.progress = 0.3;
                break;
            // case 'local_csv_loaded':
            //     this.label.string = "已加载配置(" + ext + ")"
            //     this.progress = 0.5;
            case "csv":
                this.label.string = "加载网络配置"
                this.progress = 0.6;
                break;
            case 'share_config':
                this.label.string = "加载分享配置"
                this.progress = 0.7;
                break;
            case "complete":
                this.label.string = "进入游戏..."
                this.progress = 0.8;
                break;
        }
    }


    onClick() {
        if (this.canRetry) {
            this.startLogin();
            this.canRetry = false;
        }
    }

    closeSplash() {
        this.splash && (this.splash.active = false)
    }

    start() {
        this.startLogin();
        if (!inited) {
            if (this.splash)
                this.splash.active = true
            this.scheduleOnce(this.closeSplash, 1.5)
        }
        //let data = ccUtil.get(tips, g.randomInt());
        // this.Tips.string = data.tip;
    }

    startLogin() {
        //do init 
        WeakNetGame.initConfig(ServerConfig);
        if (!inited) {
            //第一进入游戏 的loading 界面 
            if (!ServerConfig.is_local_game) {
                WeakNetGame.downloadCsv("Config").then(v => {
                    console.log("加载Config成功！！")
                    csv.removeIndex("Config", "Key");
                    csv.createIndex("Config", "Key", "config_data")
                })
            }

        }
        if (!inited) {
            //console.log("loading init !!!!!")
            WeakNetGame.doLogin(this.loginProgress.bind(this)).then(data => {
                inited = true;
                // 后设置索引 
                csv.removeIndex("Config", "Key");
                csv.createIndex("Config", "Key", "config_data")
                // check save timestamps 
                if (!data) {
                    //登录失败，也进入
                    evt.emit("Loading.Login")
                    console.log("LoadingScene->startLogin->登录失败");
                    this.nextScene();
                    return;
                }
                let time = data.save_timestamps
                //是否同步过
                if (time != null) {
                    //上一次同步时间 大于本地保存时间 
                    if (time > PlayerInfo.save_timestamps) {
                        //使用服务器数据
                        PlayerInfo.loadFromJsonObject(data);
                    } else {
                        //使用本地数据
                        console.log("使用本地数据 ，服务器不是最新的")
                    }
                } else {
                    //未同步过,属于新玩家
                    // if (CC_DEBUG) {
                    // if (data.userId != PlayerInfo.userId) {
                    //新的玩家 登陆游戏[会导致之前的玩家会被清空] 
                    PlayerInfo.reset();
                    PlayerInfo.loadFromJsonObject(data);
                    // }
                    // }
                    evt.emit("Loading.Login", true)
                }

                // util.checkIp()
                this.nextScene();
            }).catch(e => {
                console.error(e)
                this.progress = 0;
                this.label.string = `登录失败，点击屏幕重试！(${e})`
            })
        } else {
            this.nextScene();
            this.canRetry = true;
        }

    }

}