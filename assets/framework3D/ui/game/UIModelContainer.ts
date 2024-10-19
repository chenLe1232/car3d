import { Component, _decorator, Node, ModelComponent, UIModelComponent, instantiate, loader, Prefab, Vec3 } from "cc";
import ccUtil from "../../../framework3D/utils/ccUtil";
import { Signal } from "../../core/Signal";
let { ccclass, property, executeInEditMode } = _decorator
@ccclass
export default class UIModelContainer extends Component {

    @property
    private _prefab_path: string = "";
    @property
    public get prefab_path(): string {
        return this._prefab_path;
    }
    public set prefab_path(value: string) {
        this._prefab_path = value;
        this.loadPrefab();
    }

    @property(Node)
    loadingNode: Node = null;

    @property()
    resetToZero: boolean = true;
    onLoaded: Signal = new Signal();

    onLoad() {

    }

    start() {
        this.loadPrefab()
    }

    showLoading() {
        if (this.loadingNode)
            this.loadingNode.active = true
    }

    hideLoading() {
        if (this.loadingNode)
            this.loadingNode.active = false
    }

    async loadPrefab() {
        if (!isEmpty(this.prefab_path)) {
            try {
                this.showLoading()
                let prefab = await ccUtil.getPrefab(this.prefab_path)
                this.node.destroyAllChildren();
                let node = instantiate(prefab) as Node
                this.onLoaded.fire(node);
                if (this.resetToZero) {
                    node.position = Vec3.ZERO
                }
                this.node.addChild(node)
                this.hideLoading();
                let models = node.getComponentsInChildren(ModelComponent)
                models.forEach(v => ccUtil.getOrAddComponent(v, UIModelComponent))
            } catch (e) {
                console.error(e)
            }
        }
    }
}