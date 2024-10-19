import PsFx from "./PsFx";
import PoolManager from "../../core/PoolManager";
import { Prefab, v3, LabelComponent, Vec2, Vec3, _decorator, Component, resources, instantiate } from "cc";

const { ccclass, property, menu } = _decorator;

@ccclass
export default class PsSpawner extends Component {

    static instance: PsSpawner;

    poolmgr: PoolManager;
    onLoad() {
        this.poolmgr = new PoolManager();
    }

    start() {

    }

    clear() {
        if (this.poolmgr)
            this.poolmgr.clear();
    }

    getFx(prefabPath): Promise<PsFx> {
        return new Promise<PsFx>((resolve, reject) => {
            let node = this.poolmgr.get(prefabPath)
            if (node == null) {
                if (prefabPath instanceof Prefab) {
                    node = instantiate(prefabPath);
                    this.poolmgr.tag(node, prefabPath)
                } else {
                    resources.load(prefabPath, Prefab, (e, prefab: Prefab) => {
                        node = instantiate(prefab);
                        node.setParent(this.node);
                        this.poolmgr.tag(node, prefabPath)
                        let psfx = node.getOrAddComponent(PsFx)
                        psfx.name = prefabPath;
                        resolve(psfx);
                    })
                    return;
                }
            }
            node.setParent(this.node);
            node.active = false;
            let psfx = node.getOrAddComponent(PsFx)
            psfx.reset();
            resolve(psfx);
        })
    }

    preload(prefabPath, num) {
        for (var i = 0; i < num; i++) {
            this.getFx(prefabPath).then(fx => {
                this.onFxFinshPlay(fx);
            });
        }
    }

    onFxFinshPlay(fx: PsFx) {
        this.poolmgr.put(fx.node);
    }

    finish(fx: PsFx) {
        this.poolmgr.put(fx.node);
    }

    async play(prefabPath, pos = Vec3.ZERO, rotation = 0, audio?, spriteframe?) {
        let fx = await this.getFx(prefabPath);
        fx.node.worldPosition = pos;
        fx.node.eulerAngles = v3(0, 0, rotation);
        await fx.play(audio, spriteframe)
        this.onFxFinshPlay(fx);
    }

    async playWithoutFinish(prefabPath, pos = Vec3.ZERO, rotation = 0, audio?, spriteframe?) {
        let fx = await this.getFx(prefabPath);
        fx.node.worldPosition = pos;
        fx.node.eulerAngles = v3(0, 0, rotation);
        await fx.play(audio, spriteframe)
        //this.onFxFinshPlay(fx);
    }

    async play2(prefabPath, pos = Vec3.ZERO, rotation = 0, scale = 0) {
        let fx = await this.getFx(prefabPath);
        fx.node.worldPosition = pos;
        fx.node.scale = v3(scale, scale, scale);
        fx.node.eulerAngles = v3(0, 0, rotation);
        await fx.play()
        this.onFxFinshPlay(fx);
    }

    async play3(prefabPath, pos = Vec3.ZERO) {
        let fx = await this.getFx(prefabPath);
        fx.node.worldPosition = pos;
        fx.play().then(_ => this.onFxFinshPlay(fx));
        return fx;
    }

    async playWithTxt(prefabPath, pos = Vec3.ZERO, text) {
        let fx = await this.getFx(prefabPath);
        fx.node.worldPosition = pos;
        let label = fx.node.getComponentInChildren(LabelComponent);
        if (label) {
            label.string = text;
        }
        fx.play().then(_ => this.onFxFinshPlay(fx));
        return fx;
    }



    // update (dt) {}
}
