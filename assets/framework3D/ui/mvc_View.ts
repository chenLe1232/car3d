
import { _decorator, Component, Node, LabelComponent, SpriteComponent, ButtonComponent, RichTextComponent, ProgressBarComponent, find, LayoutComponent, ScrollViewComponent } from "cc";
import ccUtil from "../utils/ccUtil";
import Switcher from "./controller/Switcher";
const { ccclass, property } = _decorator;
interface SubViewBind {
    views: mvc_View[];
    exp: Function
}
@ccclass
export default class mvc_View extends Component {

    static DisableAutoRender = -1

    // @property
    render_interval: number = mvc_View.DisableAutoRender;

    // @property
    auto_render_list: boolean = true;

    private labels: (LabelComponent | RichTextComponent)[] = []
    private sprites: SpriteComponent[] = []
    private bars: ProgressBarComponent[] = []
    private buttons: ButtonComponent[] = []
    private nodes: Node[] = []
    private switchers: Switcher[] = []

    private subViews: SubViewBind[] = []
    private events: any[] = []

    private layouts = []

    private __data: any;
    private __data2: any;


    getData<T>(): T {
        return this.__data
    }

    registerSubViews(viewComp:any, exp?:any) {
        try {
            let views = this.getComponentsInChildren(viewComp)
            if (views) {
                views = views.filter(v => v != this);
            }
            this.registerMVCViews(views, exp);
        } catch (e) {
            console.error(e)
        }
    }

    register<T>(view_comp: string | Switcher | ButtonComponent | LabelComponent | RichTextComponent | SpriteComponent | ProgressBarComponent | ScrollViewComponent | LayoutComponent | mvc_View[], exp: (data: T, data2: any) => any, ext?) {
        try {

            if (typeof (view_comp) == "string") {
                let node = find(view_comp, this.node)
                if (!node) {
                    throw new Error(view_comp + " not found")
                }
                let label = node.getComponent(LabelComponent);
                if (label) {
                    this.registerLabel(label, exp);
                } else {
                    let bar = node.getComponent(ProgressBarComponent);
                    if (!bar) {
                        let sp = node.getComponent(SpriteComponent);
                        if (sp) {
                            this.registerSprite(sp, exp);
                        } else {
                            console.warn("[mvc-View] not found : " + view_comp)
                        }
                    } else {
                        this.registerProgressBar(bar, exp);
                    }
                }
            } else {
                if (view_comp instanceof LabelComponent || (RichTextComponent && view_comp instanceof RichTextComponent)) {
                    this.registerLabel(view_comp, exp);
                } else if (view_comp instanceof ProgressBarComponent) {
                    this.registerProgressBar(view_comp, exp);
                } else if (view_comp instanceof SpriteComponent) {
                    this.registerSprite(view_comp, exp);
                } else if (view_comp instanceof ButtonComponent) {
                    this.onClick(view_comp.node, exp)
                } else if (view_comp instanceof LayoutComponent || view_comp instanceof ScrollViewComponent) {
                    this.registerList(view_comp, exp, ext)
                } else if (view_comp instanceof Switcher) {
                    this.registerSwitcher(view_comp, exp);
                }
                else if (Array.isArray(view_comp)) {
                    this.registerMVCViews(view_comp, exp);
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    //注册 子view 
    registerMVCViews(views:any, exp:any) {
        this.subViews.push({ views, exp });
    }

    registerList(layout: LayoutComponent | ScrollViewComponent, exp:any, callback:any) {
        if (callback == null) {
            callback = (node: Node, data: any, i) => {
                let subview = node.getComponent(mvc_View)
                if (subview)
                    subview.render(data)
            };
        }
        layout.node['dataBind'] = exp;
        layout.node['setItemCallback'] = callback;
        this.layouts.push(layout);
    }

    registerLabel(label: LabelComponent | RichTextComponent, exp:any) {
        label.node['getViewString'] = exp;
        this.labels.push(label);
    }

    onClick<T>(btnNode: string | Node, exp: (data: T, data2:any) => any) {
        if (typeof (btnNode) == "string")
            btnNode = this.node.getChildByPath(btnNode)
        if (btnNode) {
            let btn = ccUtil.newButton(btnNode, "mvc_View", "__onButtonClicked", this.node);
            btnNode.attr({ onClick: exp.bind(this) })
            return btn;
        }
    }

    private __onButtonClicked(e:any) {
        e.target.onClick(this.__data, this.__data2);
    }

    onVisible<T>(view_comp: string | Node, exp: (data: T, data2:any) => any) {
        if (typeof (view_comp) == "string") {
            view_comp = find(view_comp, this.node);
            if (!view_comp) {
                console.warn("[mvc-View] not found : " + view_comp)
                return;
            }
        }
        view_comp.attr({ isVisible: exp })
        this.nodes.push(view_comp);
    }

    onInteractable<T>(view_comp: string | Node | ButtonComponent, exp: (data: T, data2:any) => any) {
        if (typeof (view_comp) == "string") {
            view_comp = find(view_comp, this.node);
            if (!view_comp) {
                console.warn("[mvc-View] not found : " + view_comp)
                return;
            }
        }
        if (view_comp instanceof Node) {
            view_comp = view_comp.getComponent(ButtonComponent);
        }
        view_comp.node['isInteractable'] = exp
        this.buttons.push(view_comp);
    }

    observe<T>(exp: (data: T, data2:any) => boolean, callback:any, policy?:any) {
        let triggered = false
        let evt = { exp, callback, policy, triggered }
        this.events.push(evt)
    }

    registerSwitcher(switcher: Switcher, exp:any) {
        switcher.node["which"] = exp;
        this.switchers.push(switcher);
        return switcher;
    }

    registerSprite(sp: SpriteComponent, exp:any) {
        sp.node['url'] = exp;
        this.sprites.push(sp);
        return sp
    }

    registerProgressBar(bar: ProgressBarComponent, exp:any) {
        bar.node['progress'] = exp
        this.bars.push(bar);
        return bar;
    }

    renderList(data?:any, data2?:any) {
        this.layouts.forEach(layout => {
            if (!layout.node.activeInHierarchy) return;
            let list_data = layout.node.dataBind(data, data2);
            let callback = layout.node.setItemCallback;
            layout.showlist(callback, list_data || []);
        })
    }

    disableAutoRender() {
        this.render_interval = mvc_View.DisableAutoRender
    }

    onLaterRender() {

    }

    private _updateView(data?:any, data2?:any) {

        if (this.node.active == false) return;

        if (this.auto_render_list) {
            this.renderList(data, data2);
        }

        this.nodes.forEach(node => {
            let bVisible = node['isVisible'](data, data2);
            node.active = bVisible;
        })
        this.labels.forEach(label => {
            if (!label.node.activeInHierarchy) return;
            let str = label.node["getViewString"](data, data2);
            if (str == null) console.warn("[mvc_View] failed to render label:" + label.node.name, label.node['getViewString'])
            label.string = str || "0";
        })
        this.sprites.forEach(sp => {
            if (!sp.node.activeInHierarchy) return;
            let url = sp.node['url'](data, data2);
            if (!url) return;
            ccUtil.setDisplay(sp, url)
        })


        this.events.forEach(evt => {
            if (!evt.triggered && evt.exp(data, data2)) {
                evt.callback && evt.callback.call(this)
                if (evt.policy) {
                }
                evt.triggered = true
            }
        })
        // reset event trigger 
        this.events.forEach(evt => {
            if (evt.triggered && !evt.exp(data, data2)) {
                evt.triggered = false;
            }
        })

        this.subViews.forEach(viewd => {
            let res
            if (viewd.exp) {
                res = viewd.exp(data, data2);
            }
            viewd.views.forEach((v, i) => v.render(res && res[i], data))
        })

        this.buttons.forEach(btn => {
            if (!btn.node.activeInHierarchy) return;
            let bInteractable = btn.node['isInteractable'](data, data2);
            btn.interactable = bInteractable;
            let sp = btn.node.getComponent(SpriteComponent);
            if (sp) {
                let color = sp.color;
                let newColor = color.clone()
                newColor.a = bInteractable && 255 || 120
                sp.color = newColor
            }
        })

        this.switchers.forEach(v => {
            if (!v.node.activeInHierarchy) return;
            let exp = v.node["which"]
            let res = exp(data, data2);
            v.index = res;
        })

        // this.bars.forEach(bar=>{
        //     let progress = bar.node.progress(data);
        //     bar.progress = progress;
        // })
        this._renderBars(data, data2);
        this.onLaterRender();

    }

    _renderBars(data?:any, data2?:any) {
        this.bars.forEach(bar => {
            let progress = bar.node['progress'](data, data2);
            bar.progress = progress;
        })
    }

    update(dt:any) {
        // this._renderBars();
    }

    render(d?:any, d2?:any) {
        this.__data = d || this.__data;
        this.__data2 = d2 || this.__data2;
        this._updateView(this.__data, this.__data2);
    }

    renderLabel(label: LabelComponent) {
        let str = label.node['getViewString']()
        label.string = str;
    }

    onEnable() {
        if (this.render_interval != -1)
            this.schedule(this.render, this.render_interval)
    }

    onDisable() {
        this.unschedule(this.render);
    }

}