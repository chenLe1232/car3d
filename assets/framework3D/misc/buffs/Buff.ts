import { Signal } from "../../core/Signal";


enum EventType {
    Start,
    End,
    Update
}

export default abstract class Buff {
    static EventType: typeof EventType = EventType;
    duration: number = 10;
    finished: boolean = true;


    timeLeft: number = 0;

    //buff 名称 
    name: string = "";

    //可以是任何数据 
    data: any;

    /** 可叠加 */
    canAdd: boolean = false;

    /** 最多可叠加 多长时间 */
    maxDuration: number = 0;

    //buff 刷新 间隔
    interval: number = 1;

    signals: { [index: number]: Signal } = {
        [EventType.Start]: new Signal(),
        [EventType.End]: new Signal(),
        [EventType.Update]: new Signal()
    }


    get isEnabled() {
        return this.timeLeft > 0;
    }

    abstract onEnabled(...a)
    abstract onDisabled()
    step() { }
    abstract onTimeLeftChanged();

    onRecovery() { }
    onReset() { }
    save() { }
    load(offlineSec) { }

    pause() {
    }

    resume() {
    }



    on(type: EventType, callback, target) {
        this.signals[type].add(callback, target)
    }

    off(type: EventType, callback, target) {
        this.signals[type].remove(callback, target)
    }

    private _emit(type: EventType, ...ps) {
        this.signals[type].fire(...ps);
    }

    beganTimeSec: number = 0;

    /**增加buff 生命周期  */
    addLife(life) {
        // if (this.duration + life < this.maxDuration) {
        this.duration += life;
        this.timeLeft += life;
        // }
    }

    recovery() {
        if (this.timeLeft <= 0) return;
        this.duration = this.timeLeft;
        this.finished = false;
        this.beganTimeSec = Date.now() / 1000;
        this.onRecovery();
        this.onTimeLeftChanged();
        console.warn("[BuffSystem]恢复buff:" + "[" + this.name + "]", this.duration);
    }

    /**重置 buff 生命 周期  */
    resetLife() {
        this.beganTimeSec = Date.now() / 1000;
        this.finished = false;
        this.timeLeft = this.duration;
        this.onReset();
    }

    enable(duration?, ...a) {
        this.duration = parseInt(duration) || this.duration;
        this.resetLife()
        this.onEnabled(...a);
        this.onTimeLeftChanged()
        this._emit(EventType.Start, this)
        console.warn("[BuffSystem]开启buff:" + "[" + this.name + "]", this.duration);
    }

    disable() {
        this.finished = true;
        this.timeLeft = 0
        try {
            this.onDisabled();
            this.onTimeLeftChanged()
        } catch (e) {
            console.warn(e)
        }
        this._emit(EventType.End, this);
        console.warn("[BuffSystem]关闭buff:" + "[" + this.name + "]");
    }

    doStep(now) {
        if (this.finished) return;
        if (this.timeLeft > 0) {
            this.timeLeft = this.duration - (now - this.beganTimeSec);
            this.step()
            this._emit(EventType.Update, this)
            this.onTimeLeftChanged()
        }
    }


}