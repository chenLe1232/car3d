import { _decorator, Component, Node, systemEvent, SystemEventType, Prefab, instantiate, WorldNode3DToLocalNodeUI, ParticleSystemComponent, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Demots")
export class Demots extends Component {

    @property(Prefab)
    prefab: Prefab = null;


    @property(Node)
    ps_container: Node = null;

    start() {
        // Your initialization goes here.
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
    }

    onTouchStart(e) {
        let node = instantiate(this.prefab) as Node;
        node.parent = this.ps_container;
        node.position = Vec3.ZERO;
        this.scheduleOnce(this.destroyPs.bind(this, node), 2)
    }

    destroyPs(node) {
        node.destroy();
    }
}
