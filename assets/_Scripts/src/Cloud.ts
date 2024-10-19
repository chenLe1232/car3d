import { CloudConfig, CloudFunc } from "./zzcloud";
import Net from "../../framework3D/misc/Net";



export default class Cloud {
    static config: CloudConfig = { validAd: 1, adSwitch: 1, disFunc: {} };
    static funcs: { [index: string]: CloudFunc } = null;
    static version = "1.0.0"
    static app_id = "wx55381d192d1faf41";

    //https://wxa.639311.com/api/ban
    public static getCloudConfig(): Promise<CloudConfig> {
        let channel = ""
        let scene = 1001;
        let ver = Cloud.version;
        if (CC_WECHAT) {
            let a = wx.getLaunchOptionsSync();
            scene = a.scene
            channel = a.query['channel']
        }
        let client = new Net();
        if (!CC_WECHAT)
            client.setHeader("Referer", "https://servicewechat.com/" + this.app_id + "/30/page-frame.html");
        return new Promise(((resolve, reject) => {
            client.httpGet("https://wxa.639311.com/api/ban", { scene, reviewVer: ver, channel }).then(res => {
                if (res) {
                    let s = JSON.parse(res)
                    if (s.code != 200) {
                        reject(s.msg)
                        return
                    }
                    console.log("屏蔽接口返回", s);
                    resolve(s.data);
                } else if (res == Net.Code.Timeout) {
                    reject("timeout")
                }
            })
        }))

    }

    static async reload() {
        let res
        res = await this.getCloudConfig().catch(v => {
            console.error(v);
        })
        if (!res) {
            res = JSON.parse(this.test).data;
        } else {
            this.config = res;
        }
        this.process(res);
    }

    static process(res: CloudConfig) {
        console.log(res);
        this.funcs = res.disFunc;
    }

    static test: string = `{
        "code": 200,
        "msg": "",
        "data": {
            "disFunc": {
                "1": {
                    "name": "banner位移",
                    "status": 1,
                    "show_num": "1000",
                    "show_per": "1"
                }
            },
            "adSwitch": 1,
            "validAd": 1
        }
    }`
}