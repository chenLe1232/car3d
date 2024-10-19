import { _decorator, Component, Prefab, misc, instantiate, clamp, Node, CameraComponent } from "cc";
import { Signal } from "../../core/Signal";

const { ccclass, property, menu } = _decorator;

enum Direction {
    x,
    y,
    z,
}
/**
 * 动态创建地图块
 * 使用说明 
 * 只能向一个方向创建，向另一个方向删除块 , scale, 表示一个块的长度，各分量，表示在该轴方向上的长度
 * 
 *  */
@ccclass
export default class DynamicMap extends Component {

    curSeg: Node;
    segIdx: number = -1;

    event: Signal = new Signal();

    isEnd: boolean = false;

    running: boolean = false;

    private isLoadOnce: boolean = false;


    @property(Prefab)
    segments: Prefab[] = []

    /**创建游标 */
    @property
    cursor: number = -1;

    private dirName: string;


    @property({ type: cc.Enum(Direction) })
    private _dir: Direction = Direction.z;
    @property({ type: cc.Enum(Direction) })
    public get dir(): Direction {
        return this._dir;
    }
    public set dir(value: Direction) {
        this._dir = value;
        this.dirName = Direction[value]
    }

    //是否是无尽
    @property
    isLoop: boolean = false;


    /**参照物 */
    @property(Node)
    referenceNode: Node = null;


    /**参照物离cursor多远时创建下一块 */
    @property
    thesholdToCreateNext: number = 5;

    /**检测创建 频率 */
    @property
    interval_check: number = 0.5;

    /**前一块物体离参照物多远时删除 */
    @property
    thesholdToRemovePrev: number = 5


    onLoad() {
        this.dirName = Direction[this.dir];
    }

    onDestroy() {
        this.event.clear();
        this.segments.splice(0);
    }

    start() {
        this.cursor = this.node.children.reduce((sum, v) => { return sum + v.scale[this.dirName] }, 0)
        this.begin(true);
    }

    /**bLoadAll 是否一次性加载地图 */
    begin(bLoadAll) {
        this.running = true;
        this.isLoadOnce = bLoadAll;
        //开始生成关卡
        console.warn("开始生成关卡")
        let segcount = this.segments.length;
        if (bLoadAll) {
            for (var i = 0; i < segcount + 1; i++) {
                this.curSeg = this.createNextSeg();
            }
        } else {
            if (this.curSeg == null) {
                this.curSeg = this.createNextSeg();
            }
        }
    }

    addSements(...prefabs: Prefab[]) {
        this.segments.push(...prefabs);
    }

    createNextSeg() {

        let idx = this.segIdx + 1
        if (idx > this.segments.length - 1) {
            if (this.isLoop) {
            } else {
                //没有关卡了
                console.log("没有关卡段了")
                this.isEnd = true;
                this.event.fire("finish", this.cursor)
                return;
            }
        }

        this.segIdx = clamp(idx, 0, this.segments.length - 1);
        let prefab = this.segments[this.segIdx]
        console.warn("create next level:", prefab.name);
        let node = instantiate(prefab) as Node
        // let roadType = this.levels_roadAvatar[this.levelIndex]
        if (node == null) {
            console.error("create segment failed:", this.segments, this.segIdx)
            return null;
        }
        if (this.dir == Direction.x) {
            node.setPosition(this.cursor, 0, 0);
        } else if (this.dir == Direction.y) {
            node.setPosition(0, 0, this.cursor);
        } else if (this.dir == Direction.z) {
            node.setPosition(0, 0, this.cursor);
        }
        this.cursor += node.scale[this.dirName];

        //删除
        let first = this.segments.shift();
        this.segIdx -= 1
        node.name = prefab.name;
        node.setParent(this.node);
        if (this.isLoop) {
            this.addSements(first);
        }
        this.event.fire("add", node);
        return node
    }


    timer_check: number = 0

    update(dt) {
        if (!this.running) return;
        this.timer_check += dt
        if (this.timer_check < this.interval_check) {
            return
        }
        this.timer_check = 0;

        for (let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i]
            let segP = child.position[this.dirName]
            let objP = this.referenceNode.position[this.dirName];
            let distance = objP - segP;
            if (distance < 0) continue;
            if (distance > this.thesholdToRemovePrev) {
                this.event.fire('remove', child)
                child.destroy();
                break;
            }
        }

        let distance = this.cursor - this.referenceNode.position[this.dirName]
        if (distance < this.thesholdToCreateNext) {
            this.curSeg = this.createNextSeg();
        }

    }
}