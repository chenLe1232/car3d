import ViewManager from "./ViewManager";

export default class vm {
    public static show(view:any, ...args:any) {
        if (ViewManager.instance)
            return ViewManager.instance.show(view, ...args);
        else
            console.log("ViewManager has not created yet ")
    }

    public static hide(view:any, b = false) {
        if (ViewManager.instance)
            return ViewManager.instance.hide(view, b);
        else
            console.log("ViewManager has not created yet ")
    }
}

