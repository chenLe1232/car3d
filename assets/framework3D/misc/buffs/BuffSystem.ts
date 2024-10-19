import BuffBase from "./Buff";

import { _decorator, Component, Node } from "cc";
import Buff from "./Buff";
import EmptyBuff from "./EmptyBuff";
const { ccclass, property } = _decorator;
/**
 * TODO:
// BuffManager.register(OutputSpeedupBuff, ()=>PlayerInfo.buff_outputSpeed = this.timeLeft);
 */


export let buffSystem: BuffSystem = null;
export let buffs: { [index: string]: BuffBase } = {}

@ccclass
export default class BuffSystem extends Component {

    private static buff_cls = {}
    private static buff_cls_data = {}

    onLoad() {
        buffSystem = this;
        this.load();
    }

    protected onEnable() {
        this.schedule(this.step, 1)
    }

    protected onDisable() {
        this.unschedule(this.step);
    }

    protected step() {
        let now = Date.now() / 1000;
        for (var i in buffs) {
            let buf = buffs[i]
            if (buf.isEnabled) {
                buf.doStep(now);
                if (!buf.isEnabled) {
                    buf.disable();
                }
            }
        }
    }

    public static register(name, cls, data) {
        BuffSystem.buff_cls[name] = cls;
        BuffSystem.buff_cls_data[name] = data;
    }

    private _create(buffname) {
        let cls = BuffSystem.buff_cls[buffname];
        if (cls == null) {
            if (typeof (buffname) == "string") {
                console.error("[BuffSystem]:" + buffname + "未注册 ！")
                return new EmptyBuff();
            } else {
                return new buffname;
            }
        } else {
            let data = BuffSystem.buff_cls_data[buffname]
            let buff = new cls() as Buff;
            buff.name = buffname;
            buff.data = data;
            return buff;
        }
    }

    getBuff(buffname) {
        let buf = buffs[buffname]
        if (!buf) {
            buf = this._create(buffname);
            buffs[buffname] = buf
        }
        return buf;
    }

    /**第一个参数 必然是duration  */
    startBuff(buffname, ...a) {
        let buf = this.getBuff(buffname);
        if (buf.isEnabled) {
            if (buf.canAdd) {
                buf.addLife(a[0])
            } else {
                buf.resetLife();
            }
        } else {
            buf.enable(...a)
        }
        return buf;
    }


    stop(buffname) {
        let buf = this.getBuff(buffname)
        if (buf.isEnabled)
            buf.disable();
    }

    save() {
        console.log(buffs);
        for (var k in buffs) {
            let v = buffs[k];
            v.save();
        }
        //保存离线时间 
        localStorage.setItem("buffSys.lastTime", Date.now().toString());
    }


    load() {
        let last = localStorage.getItem("buffSys.lastTime")
        let lastTime;
        if (last == null || last == "") {
            lastTime = Date.now();
        } else {
            lastTime = parseInt(last);
        }
        let now = Date.now();
        let offset = (now - lastTime) / 1000;
        if (offset < 0) return;
        for (var k in BuffSystem.buff_cls) {
            let inst = this.getBuff(k);
            inst.load(offset);
            inst.recovery();
        }
    }

    onHit() {
        console.log("BuffSystem->onHit->buffs", buffs);
    }

}