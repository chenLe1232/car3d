import { LayoutComponent, Node, _decorator, Component } from "cc";

const { ccclass, property, menu } = _decorator;
/**
 * ui结构 
 * -hpbar (Layout)
 *  -star 
 *      -star0
 */
@ccclass
@menu("Controller/HpBar")
export default class HpBar extends Component {

    @property()
    private _maxHp: number = 0;
    private hpLayout: LayoutComponent = null;
    @property()
    public get maxHp(): number {
        return this._maxHp;
    }
    public set maxHp(value: number) {
        this._maxHp = value;
        let template = this.hpLayout.node.children[0];
        if (this.hpLayout.node.children.length > 1) {
            this.hpLayout.node.removeAllChildren();
            this.hpLayout.node.addChild(template);
        }
        //@ts-ignore
        this.hpLayout.showlist(this.createHpNodes.bind(this), range(0, this._maxHp - 1, 1))
    }
    private _hp: number = 0;
    public get hp(): number {
        return this._hp;
    }
    public set hp(value: number) {
        this._hp = value;
        this.updateHp()

    }

    get(i) {
        return this.hpLayout.node.children[i]
    }

    cur() {
        let node = this.get(this.hp)
        return node.children[0];
    }

    onLoad() {
        this.hpLayout = this.getComponent(LayoutComponent);
    }

    createHpNodes(node: Node, data, i) {
        node.children[0].active = true;
    }

    updateHp() {
        let a = this.hpLayout.node.children.forEach((v, i) => {
            v.children[0].active = i < this.hp + 1;
        })
    }

    start() {

    }

    onDisable() {

    }
}