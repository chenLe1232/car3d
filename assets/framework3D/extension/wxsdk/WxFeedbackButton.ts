import Platform from "../Platform";
import { EventHandler, Component, Node, _decorator, UITransformComponent } from "cc";

const { ccclass, property, menu } = _decorator;
let wxSysInfo
@ccclass
@menu("Wxsdk/WxFeedbackButton")
export default class WxFeedbackButton extends Component {

    @property(EventHandler)
    handler: EventHandler = new EventHandler();
    button: any = null;
    onLoad() {

    }

    onEnable() {
        this.button && this.button.show();
    }

    onDisable() {
        this.button && this.button.hide();
    }

    onDestroy() {
        this.button && this.button.destroy();
    }

    private createButton(callback) {
        if (!wxSysInfo) {
            wxSysInfo = wx.getSystemInfoSync();
        }
        var leftPos = wxSysInfo.windowWidth * 0.5 - 100
        var topPos = wxSysInfo.windowHeight * 0.5 - 20
        var width = 200
        var height = 40
        if (this.button) {
            this.button.destroy()
        }
        var btnRect = this.node.getComponent(UITransformComponent).getBoundingBoxToWorld()
        var ratio = cc.view.getDevicePixelRatio();
        var scale = cc.view.getScaleX()
        var factor = scale / ratio
        leftPos = btnRect.x * factor
        topPos = wxSysInfo.screenHeight - (btnRect.y + btnRect.height) * factor
        width = btnRect.width * factor
        height = btnRect.height * factor
        this.button = wx.createFeedbackButton({
            type: "text",
            text: "        ",
            style: {
                left: leftPos,
                top: topPos,
                width: width,
                height: height,
                lineHeight: 60,
                textAlign: 'center',
                backgroundColor: '#00000000',
                color: '#ffffff'
            }
        });
        this.button.onTap((res) => {
            if (res) {
                if (callback) callback(res);
            } else if (callback) callback(null);
        });
    }

    start() {
        if (CC_WECHAT) {
            this.createButton(res => {
                this.handler.emit([res])
            })

        }
    }
}