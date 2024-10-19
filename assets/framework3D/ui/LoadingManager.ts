import { _decorator, Component, Node, Prefab, SpriteComponent, LabelComponent, instantiate, BlockInputEventsComponent, UIReorderComponent } from "cc";
const { ccclass, property } = _decorator;

export var Loading:LoadingManager = null;

@ccclass
export default class LoadingManager extends Component {

    @property(Prefab)
    prefab:Prefab = null;

    loadingNode:Node = null;
    loadingSprite:SpriteComponent = null;
    loadingText:LabelComponent = null;
    blockEventComp:BlockInputEventsComponent = null;

    _callback:any = null;
    _target:any = null;
    onLoad()
    {
        this.loadingNode = instantiate(this.prefab);
        this.blockEventComp = this.loadingNode.getComponent(BlockInputEventsComponent);
        this.loadingNode.parent = this.node;
        this.loadingNode.getComponent(UIReorderComponent).priority = 9999;
        this.loadingSprite = this.loadingNode.getComponentInChildren(SpriteComponent);
        this.loadingText = this.loadingNode.getComponentInChildren(LabelComponent);
        this.hide();
        Loading = this;
    }

    start () {
        // this.loadingSprite.node.runAction(cc.rotateBy(4,360).repeatForever());
    }

    dealyClose()
    {
        this.hide();
        if(this._callback)
        {
            this._callback.call(this._target)
        }
    }

    show(timeout,text=null,modal = true,callback = null,target = null)
    {
        if(!this.loadingNode) return
        this.loadingNode.active = true;
        // this.loadingNode.resumeAllActions();
        this.blockEventComp.enabled = modal
        this._callback = callback 
        this._target = target
        if(text)
            this.loadingText.string = text;
        if(timeout > 0)
        {
            this.unschedule(this.dealyClose);
            this.scheduleOnce(this.dealyClose,timeout)
        }
    }

    hide()
    {
        this.loadingNode.active = false;
        // this.loadingNode.pauseAllActions();
    }

    // update (dt) {}
}
