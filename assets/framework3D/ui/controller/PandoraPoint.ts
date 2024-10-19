import { Component, LabelComponent, _decorator, SpriteComponent } from "cc";
import { Signal } from "../../core/Signal";

const {ccclass, property,menu} = _decorator;

@ccclass
@menu("扩展UI/PandoraPoint")
export default class PandoraPoint extends Component {

    label:LabelComponent;

    @property
    numberVisible:boolean = true;

    @property([PandoraPoint])
    subPoints:PandoraPoint[] = []

    sprite:SpriteComponent

    n:number = 0;

    signal:Signal = new Signal;

    onLoad () {
        this.sprite = this.getComponent(SpriteComponent);
        this.label = this.getComponentInChildren(LabelComponent);
        if(this.label)
            this.label.node.active = this.numberVisible;
        
        this.subPoints.forEach(v=>{
            v.signal.add(this.onSubChanged,this)
        })
    }

    onSubChanged(n){
        let b = this.subPoints.some(v=>v.n > 0)
        this.setNumber(b?1:0)
    }

    start () {

    }

    setNumber(n:number)
    {
        if(this.label)
        {
            if(this.numberVisible)
            {
                this.label.string = n +""
            }
            if(this.numberVisible) 
            {
                this.label.node.active =  n!=0;
            }
        }
        this.sprite.enabled = n !=0;
        this.n = n;
        this.signal.fire(n);
    }

    // update (dt) {}
}
