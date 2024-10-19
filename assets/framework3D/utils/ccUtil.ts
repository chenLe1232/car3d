import { instantiate, Vec3, Quat, Node, ParticleSystemComponent, ButtonComponent, AnimationComponent, TERRAIN_MAX_BLEND_LAYERS, Component, EventHandler, SpriteFrame, ScrollViewComponent, LayoutComponent, v2, CameraComponent, SpriteComponent, UIComponent, UITransformComponent, Vec2, Prefab, loader, Color, resources, animation, find } from "cc";
import { evt } from "../core/EventManager";
import SpriteFrameCache from "../misc/SpriteFrameCache";
import display from "../misc/display";
import PositionAnim from "../extension/qanim/PositionAnim";
import { EaseType } from "../extension/qanim/EaseType";
interface FlyCoinConfig { dur?: number, num?: number, interval?: number, random_length?: number }
export default class ccUtil {
    public static Instantiate(origin:any, position?: Vec3, rotation?: Quat): any {
        let node = instantiate(origin)
        if (position)
            node.position = position;
        if (rotation)
            node.rotation = rotation;
        return node;
    }


    public static playParticles(ps: ParticleSystemComponent | Node) {
        if (ps) {
            if (ps instanceof Node) {
                ps.active = true
            } else {
                ps.node.active = true;
            }
            let subs = ps["_subParticles"]
            if (subs == null) {

                subs = ps.getComponentsInChildren(ParticleSystemComponent);
                ps["_subParticles"] = subs;
            }
            subs.forEach(v => {
                v.play()
            });
        }
    }

    public static playAnimation(anim: AnimationComponent | Node, stopAfter: number = 0) {
        if (anim instanceof Node) {
            anim = anim.getComponent(AnimationComponent);
        }
        if (anim == null) {
            console.warn("PlayAnimation failed :" + anim.name);
            return Promise.resolve();
        }
        anim.play();
        if (stopAfter) {
            if (stopAfter > 0)
                evt.sleep(stopAfter).then(v => {
                    anim.stop();
                })
        } else {
            return new Promise(resolve => {
                anim.on(AnimationComponent.EventType.FINISHED, (state) => {//EventType
                    resolve(state);
                })
            })
        }

    }
    static newButton(target: Node, component: string, handler: string, listener?: Node, data?: string) {
        listener = listener || target;
        let button = target.getComponent(ButtonComponent);
        if (button == null) button = target.addComponent(ButtonComponent);
        button.transition = ButtonComponent.Transition.SCALE;
        if (button.clickEvents.length > 0) {
            button.clickEvents.splice(0);
            // let clickEvent = button.clickEvents[0]
            // clickEvent.target = listener
            // clickEvent.customEventData = data;
            // clickEvent.component = component;
            // clickEvent.handler = handler;
        }
        button.clickEvents.push(ccUtil.handler(listener, component, handler, data))
        return button;
    }


    static handler(target: Node, component: string, handler: string, bindstr?: string) {
        let eventHandler = new EventHandler();
        eventHandler.component = component
        eventHandler.target = target;
        eventHandler.handler = handler
        eventHandler.customEventData = bindstr;
        return eventHandler;
    }

    static allInfos: any = {}; // 所有信息
    static types = [];
    static get<T>(cls: { prototype: T }, ...args): T {
        //prototype.constructor.name 在js 编译后不可用
        let tt = cls.prototype;
        let idx = this.types.indexOf(tt);
        if (idx == -1) {
            this.types.push(tt);
            idx = this.types.length - 1;
        }
        let models = this.allInfos[idx]
        if (!models) {
            models = {};
            this.allInfos[idx] = models;
        }
        let _id = args.join("-");
        let info = models[_id];
        if (!info) {
            let c = cls as any;
            // info = new c(args)
            info = Reflect.construct(c, args);
            models[_id] = info;
        }
        return info as T;
    }


    static isGreaterDays(before:any, num = 7) {
        let now = new Date();
        var diff = now.getTime() - before
        if (diff > 86400000 * num) // 24*60*60*1000
        {
            return true;
        }
    }

    static find<T extends Component>(path: string, node: Node, compType: { prototype: T }): T {
        let n = find(path, node)
        if (n) {
            return n.getComponent(compType)
        }
        return n;
    }

    static setDisplay(sp: SpriteComponent, url:any, callback?:any) {
        if (typeof (url) == 'string') {
            return SpriteFrameCache.instance.getSpriteFrame(url).then(sf => {
                sp.spriteFrame = sf
                callback && callback()
            }).catch(e => console.warn(e))
        } else {
            if (url instanceof SpriteFrame)
                sp.spriteFrame = url;
        }

    }

    static getOrAddComponent<T extends Component>(obj: any, type: { prototype: T }): T {
        return obj.getOrAddComponent(type);
    }

    static getComponentInParent<T extends Component>(obj: any, type: { prototype: T }): T {
        return obj.getComponentInParent(type);
    }



    static convertCameraWorldPosition(worldpos:any, cameraFrom: CameraComponent, cameraTo: CameraComponent) {
        let pos = cameraFrom.worldToScreen(worldpos, Vec2.ZERO)
        let from = cameraTo.screenToWorld(pos, Vec2.ZERO)
        return from;
    }


    //高效率getboundingbox ,不同于node.getBoundingBoxToWorld
    static getWorldBoundingBox(node: Node) {
        let parent = node.parent
        if (parent == null) return;
        let box = node.transform.getBoundingBox();
        let xy = v3(box.xMin, box.yMin, 0)
        let xy2 = v3(box.xMax, box.yMax, 0);
        xy = parent.transform.convertToWorldSpaceAR(xy);
        xy2 = parent.transform.convertToWorldSpaceAR(xy2);
        let wh = xy2.subtract(xy);
        return rect(xy.x, xy.y, wh.x, wh.y)
    }

    static setParent(node:any, newParent:any, keepWorldPosition = false) {
        let oldParent = node.parent;
        if (oldParent == null) return;
        let worldPos = oldParent.convertToWorldSpaceAR(node.position);
        node.removeFromParent();
        node.parent = newParent;
        if (keepWorldPosition) {
            node.position = newParent.convertToNodeSpaceAR(worldPos);
        }
    }

    public static getWorldPos(node: Node) {
        let v3 = node.getWorldPosition()
        return v2(v3.x, v3.y)
    }


    public static enableAutoScroll(scrollview: ScrollViewComponent, speed = 0.5) {
        let layout = scrollview.content.getComponent(LayoutComponent);
        let dir = v2(1, 0);
        if (scrollview.vertical) {
            dir = v2(0, 1)
        }

        let scroll = function () {
            let hafw = (layout.node.width - layout.node.parent.width) / 2
            let hafh = (layout.node.height - layout.node.parent.height) / 2

            let pos = layout.node.position.clone();
            pos.x += dir.x * speed;
            pos.y += dir.y * speed;
            layout.node.position = pos;
            if (scrollview.vertical) {
                if (pos.y < -hafh || pos.y > hafh) {
                    dir.multiplyScalar(-1);
                }
            } else {
                if (pos.x < -hafw || pos.x > hafw) {
                    dir.multiplyScalar(-1);
                }
            }

        }
        return scroll;
    }

    public static getPrefab(path:any): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, res) => {
                if (err) return reject(err)
                resolve(res);
            })
        })
    }

    public static getMaterial(path:any): Promise<Material> {
        return new Promise((resolve, reject) => {
            resources.load(path, Material, (err, res) => {
                if (err) return reject(err)
                resolve(res);
            })
        })
    }

    static _tmp_vec2: Vec2 = v2()
    static default_flycoin_config = {
        dur: 0.5,
        num: 5,
        interval: 0.1,
        random_length: 0
    }


    //播放添加金币的动画 
    static async playFlyCoin(template: Node | Prefab = null, parent: Node = null, from: Vec3 = display.center, to: Vec3 = display.leftTop, config?: FlyCoinConfig) {
        if (config == null) {
            config = this.default_flycoin_config
        }
        config.num = config.num || 1;
        for (var i = 0; i < config.num; i++) {
            let node = instantiate(template) as Node;
            node.parent = parent;
            let anim = ccUtil.getOrAddComponent(node, PositionAnim);
            anim.useWorld = true;
            let round = Vec2.random(this._tmp_vec2, config.random_length || 0)
            anim.from = from.add3f(round.x, round.y, 0);
            anim.to = to;
            anim.duration = config.dur || 0.5;
            anim.easeType = EaseType.sineInOut
            anim.play().then(v => {
                node.destroy();
            })
            await evt.sleep(config.interval || 0.1)
        }
    }




    static setButtonEnabled(btn: ButtonComponent, v) {
        btn.interactable = v;
        let sp = btn.node.getComponent(SpriteComponent)
        if (sp) {
            let color = new Color();
            color.set(sp.color);
            color.a = v ? 255 : 120;
            sp.color = color
        }
    }

}