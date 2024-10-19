import { Component, _decorator, Node, ProgressBarComponent, LabelComponent, ButtonComponent } from "cc";
import Platform from "../../../framework3D/extension/Platform";
import vm from "../../../framework3D/ui/vm";
import { Signal } from "../../core/Signal";
let { ccclass, property } = _decorator
@ccclass
export default class SubpackageLoader extends Component {
    @property(LabelComponent)
    label_progress: LabelComponent = null;

    @property(ProgressBarComponent)
    bar: ProgressBarComponent = null

    @property(LabelComponent)
    label: LabelComponent = null;

    @property(ButtonComponent)
    btn_retry: ButtonComponent = null;


    @property(ButtonComponent)
    btn_close: ButtonComponent = null;

    onLoad() {
        this.btn_retry.node.on(Node.EventType.TOUCH_END, this.click_retry, this);
        if (this.btn_close)
            this.btn_close.node.on(Node.EventType.TOUCH_END, this.click_close, this);
    }

    onSuccess: Signal = new Signal();
    names: string[] = []

    hideOnFinish: boolean = true;

    onShown(names: any, hideOnFinish, callback, target) {
        this.hideOnFinish = hideOnFinish;
        this.onSuccess.clear();
        this.onSuccess.on(callback, target);
        this.names.splice(0);
        if (Array.isArray(names)) {
            this.names = names;
        } else if (typeof (names) == "string") {
            this.names.push(names);
        } else {
            console.error("[SubpackageLoader] fail to load : params error")
            return;
        }
        this.startLoad();
    }

    /**
     * 显示 当前下载 进度
     * @param name 子包名
     * @param percent  当前进度 x/100
     * @param c 下载字节数
     * @param t 总下载字节数 
     */
    showStatus(name, percent, c, t) {
        this.label_progress.string = percent + "%"
        this.bar.progress = percent / 100;
        this.label.string = "加载[" + name + "]中"
    }

    async startLoad() {
        this.btn_retry.node.active = false;
        this.btn_close.node.active = false;
        try {
            for (var i = 0; i < this.names.length; i++) {
                let name = this.names[i];
                await Platform.loadSubPackage(name, (p, c, t) => {
                    this.showStatus(name, p, c, t);
                })
            }
            this.onSuccess.fire(this);
            if (this.hideOnFinish) {
                vm.hide(this);
            }
        } catch (e) {
            console.error(e);
            this.label.string = "加载失败,请点击重试!"
            this.btn_retry.node.active = true;
            this.btn_close.node.active = true;
        }
    }

    cancel() {
        this.onSuccess.clear()
        vm.hide(this);
    }

    click_close() {
        vm.hide(this);
    }

    onHidden() {
        this.cancel()
    }

    click_retry() {
        this.btn_retry.node.active = false;
    }
}