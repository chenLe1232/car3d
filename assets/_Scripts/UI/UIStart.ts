import { Component, _decorator, Node, AnimationComponent, ButtonComponent, tween, v3 } from "cc";
import vm from "../../framework3D/ui/vm";
import Switcher from "../../framework3D/ui/controller/Switcher";
import Device from "../../framework3D/misc/Device";
import { Signal } from "../../framework3D/core/Signal";
let { ccclass, property } = _decorator
@ccclass
export default class UIStart extends Component {

    @property(AnimationComponent)
    rotatAnim: AnimationComponent = null

    onConfirm: Signal = new Signal();

    @property(ButtonComponent)
    btn_go: ButtonComponent = null;

    @property(Switcher)
    tg_res: Switcher = null;


    start() {

    }

    onShown(callback, target) {
        Device.playSfx('sfx_car_start')
        this.btn_go.node.active = true;
        // this.rotatAnim.play();
        let state = this.rotatAnim.getState("rotateStart")
        state.speed = 0.75;
        this.onConfirm.on(callback, target)
        this.tg_res.index = 0;
        
    }

    q: number = 0;

    checkQuality(rot) {
        rot = Math.abs(rot)
        let q = 0;
        if (rot < 110 && rot > 80) {
            console.log('普通起步')
            q = 0;
        } else if (rot < 80 && rot > 50) {
            console.log('正常起步')
            q = 1
        } else if (rot < 50 && rot > 15) {
            //加速起步
            console.log('加速起步')
            q = 2
        } else if (rot < 15) {
            //完美起步
            console.log('完美起步')
            q = 3
        }
        this.tg_res.index = q + 1;
        this.q = q;
        this.tg_res.node.scale = v3();
        tween(this.tg_res.node).to(0.3, { scale: v3(1, 1, 1) }, { easing: "quadInOut" }).start();
    }

    onHidden() {
        this.onConfirm.fire(this.q);
    }

    click_go() {
        this.btn_go.node.active = false;
        this.rotatAnim.stop();
        let rot = this.rotatAnim.node.eulerAngles.z;
        this.checkQuality(rot)
        this.scheduleOnce(this.finish, 0.5)
        Device.playSfx("StartGame")
    }

    finish() {
        vm.hide(this);
    }
}