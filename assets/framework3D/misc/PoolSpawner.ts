import { Component, _decorator, Node, instantiate, Prefab } from "cc";
import PoolManager from "../core/PoolManager";
let { ccclass, property } = _decorator
@ccclass("Spawner")
export class Spawner {
    @property
    spawnerName: string = "";

    @property({ type: Node, visible() { return !this.usePrefab } })
    template: Node = null;

    @property({ type: Prefab, visible() { return this.usePrefab } })
    prefab: Prefab = null;

    @property()
    usePrefab: boolean = false;
}

@ccclass
export default class PoolSpawner extends Component {
    poolManager: PoolManager = null;

    @property
    poolName: string = ""

    @property([Spawner])
    spawners: Spawner[] = []

    private _spawners: { [index: string]: Spawner } = {}

    onLoad() {
        this.poolManager = new PoolManager(this.node, this.onCreateObject, this)
        this.poolManager.name = this.poolName;
        this.spawners.forEach(v => {
            this._spawners[v.spawnerName] = v;
        })
    }

    onDestroy() {
        this.poolManager.destroy();
    }

    onCreateObject(type) {
        let cfg = this._spawners[type];
        return instantiate(cfg.usePrefab && cfg.prefab || cfg.template);
    }

    start() {

    }
}