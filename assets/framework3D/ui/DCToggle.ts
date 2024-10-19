import DCUI from "./DCUI";
import { _decorator, EventHandler, ToggleComponent } from "cc";

const {ccclass, property,menu} = _decorator;

@ccclass
@menu("DCUI/DCToggle")
export default class DCToggle extends DCUI {

    toggle:ToggleComponent;
    @property({tooltip:"If reverse is enabled ,checked is false !, unchecked is true"})
    revserse:boolean = false;


    @property({tooltip:" Make sure data bind type should be boolean"})
    autosync:boolean = true;

    isFromSelf:boolean;

    onLoad()
    {
        this.toggle = this.getComponent(ToggleComponent);
        if(this.autosync)
        {
            let listener = new EventHandler();
            listener.component = "DCToggle";
            listener.target = this.node;
            listener.handler = "onChecked";
            this.toggle.checkEvents.push(listener)
        }
    }

    onChecked(v)
    {
        if(this.isFromSelf) return;
        if(this.revserse)
        {
            this.setDCValue(!v.isChecked);
        }else{
            this.setDCValue(v.isChecked);
        }
    }

    setChecked(b)
    {
        this.isFromSelf = true;
        if(b)
            this.toggle.check()
        else
            this.toggle.uncheck();
        this.isFromSelf = false
    }

    onValueChanged(v)
    {
        if(this.revserse)
        {
            this.setChecked(!v)
        }else{
            this.setChecked(v)
        }
        
    }

}
