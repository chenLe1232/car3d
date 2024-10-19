import DCUI from "./DCUI";
import { SpriteComponent, _decorator } from "cc";
import SpriteFrameCache from "../misc/SpriteFrameCache";

const {ccclass, property,requireComponent,menu} = _decorator;


@ccclass
@menu("DCUI/DCSprite")
@requireComponent(SpriteComponent)
export default class DCSprite extends DCUI {

    sprite:SpriteComponent;
    onLoad()
    {
        this.sprite = this.getComponent(SpriteComponent);
    }

    refreshSpriteFrame(v)
    {
        // this.sprite.spriteFrame = v;
        let spriteframe = SpriteFrameCache.instance.getSpriteFrame(v).then(sf=>{
            this.sprite.spriteFrame = sf;
        }).catch(_=>{console.log("request imageUrl error :" + v)})
    }

    onValueChanged(v)
    {
        this.refreshSpriteFrame(v);
    }
   
    // update (dt) {}
}
