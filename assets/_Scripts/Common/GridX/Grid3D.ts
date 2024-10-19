import { _decorator, Component, Node, Prefab, instantiate, Vec2, v3, v2, Vec3, randomRangeInt, Size, size } from "cc";
import GridObject from "./GridObject";
const { ccclass, property } = _decorator;

export interface Grid2DObjectCreation {
    prefab: Prefab,
    coord: Vec3,
}

@ccclass
export class Grid3D extends Component {

    /**格子坐标 */
    pos: Vec3 = v3();
    /**
     * 网格 大小 
     */
    @property({ displayName: "网格总大小" })
    size: Vec3 = v3(600, 2, 600);
    @property({ displayName: "起始偏移", tooltip: "x,z通常为网格大小的一半，y会是子网格的一半" })
    offset: Vec3 = v3(300, 15, 300);

    /**子网络数量  */
    @property({ displayName: "子网络数量" })
    mapSize: Vec3 = v3(10, 2, 10);
    /**
    * 子网格大小
    */
    tileSize: Vec3 = v3(60, 1, 60);

    //存放对象数量  缓存
    counts: { [index: number]: number } = {}
    //存放GridObject 的根节点 
    container: Node = null;

    // 二维数组,存放 网格
    objects: GridObject[][][];

    //即将创建的队列
    tocreateQueue: Grid2DObjectCreation[] = []

    onLoad() {
        this.container = this.node.getChildByName("container")
        if (this.container == null) {
            this.container = new Node("container");
            this.container.setParent(this.node);
            // this.container.setScale(v3(1, 10, 1))
            this.container.setWorldScale(v3(1, 1, 1));
        }
        this.tileSize = v3(this.size.x / this.mapSize.x, this.size.y / this.mapSize.y, this.size.z / this.mapSize.z);

        this.objects = new Array(this.mapSize.x);
        for (var x = 0; x < this.mapSize.x; x++) {
            this.objects[x] = new Array(this.mapSize.y);
            for (var y = 0; y < this.mapSize.y; y++) {
                this.objects[x][y] = new Array(this.mapSize.z)
                // for (var z = 0; z < this.mapSize.z; z++) {
                //     this.objects[x][y][z] = null;
                // }
            }
        }

        this.updatePos()
    }

    reset() {
        this.container.destroyAllChildren();
        for (var x = 0; x < this.mapSize.x; x++) {
            for (var y = 0; y < this.mapSize.y; y++) {
                for (var z = 0; z < this.mapSize.z; z++) {
                    this.objects[x][y][z] = null;
                }
            }
        }
    }

    /**
     * 更新网格坐标
     */
    updatePos() {
        Vec3.copy(this.pos, this.node.position)
        // this.pos.multiply3f(1 / this.size.x, 1 / this.size.y, 1 / this.size.z)
        this.pos.x = Math.floor(this.pos.x / this.size.x + 0.5)
        this.pos.y = Math.floor(this.pos.y / this.size.y + 0.5)
        this.pos.z = Math.floor(this.pos.z / this.size.z + 0.5)

    }

    start() {
        // Your initialization goes here.

    }

    onEnable() {

    }

    addToQueue(prefab: Prefab, coord: Vec3) {
        let info = {} as Grid2DObjectCreation
        info.prefab = prefab;
        info.coord = coord
        this.tocreateQueue.push(info);
    }

    update() {
        //pop
        let tobeGenObj = this.tocreateQueue[0]
        if (tobeGenObj != null) {
            this.createObject(tobeGenObj);
            this.tocreateQueue.shift();
        }
    }

    getObjectByCoord(coord: Vec3) {
        if (coord.x < 0 || coord.x >= this.mapSize.x) {
            return;
        }

        return this.objects[coord.x][coord.y][coord.z]
    }

    /**
     * 子网格坐标=> 子网格所在的本地坐标(cocos) ,coord.x >0 , coord.y >0
     */
    coordToPosition(coord: Vec3, anchor: Vec3 = v3(0.5, 0.5, 0.5)) {
        // return v3(xy.x - 5 + 0.5, 0, xy.y - 5 + 0.5);
        return v3((coord.x + anchor.x) * this.tileSize.x - this.offset.x, (coord.y + anchor.y) * this.tileSize.y - this.offset.y, (coord.z + anchor.z) * this.tileSize.z - this.offset.z)
    }

    coordToWorldPosition(coord: Vec3) {
        let pos = this.coordToPosition(coord)
        return pos.add(this.node.position);
    }

    tmp_tileCoord: Vec3 = v3();
    /**
     * 子网格所在的本地坐标(cocos) -> 子网格坐标
     * @param localPos 本地坐标(cocos) 
     */
    positionToCoord(localPos: Vec3) {
        // localPos.multiplyScalar(0.1);
        // size是整个网络的宽度，本地坐标0，0是这个网络的中心 ，所以用整个网络的长宽计算 计算出偏移 
        // y 的偏移是一个子格子的长度
        this.tmp_tileCoord.x = Math.floor((localPos.x + this.offset.x) / this.tileSize.x)
        this.tmp_tileCoord.z = Math.floor((localPos.z + this.offset.z) / this.tileSize.z)
        this.tmp_tileCoord.y = Math.floor((localPos.y + this.offset.y) / this.tileSize.y)
        return this.tmp_tileCoord;
    }

    tmp_localPosition: Vec3 = v3();
    /**
     * @param worldPosition gridmap2d下的坐标(cocos)
     */
    getObjectByWorld(worldPosition: Vec3, zLayer: number = 0) {
        Vec3.copy(this.tmp_localPosition, worldPosition);
        this.tmp_localPosition.subtract(this.node.position)
        let coord = this.positionToCoord(this.tmp_localPosition);
        return this.getObjectByCoord(coord);
    }

    tmp_worldPosition: Vec3 = v3();
    /**
     * 转换为世界坐标
     * @param localPosition 相对于Grid3D的本地坐标
     */
    convertToWorldPosition(localPosition: Vec3) {
        this.tmp_worldPosition.set(this.node.position);
        this.tmp_worldPosition.add(localPosition)
        return this.tmp_worldPosition
    }

    /**世界坐标(相当于与Gridmap平级的坐标)转换为子网格坐标 */
    getCoord(worldPosition) {
        Vec3.copy(this.tmp_localPosition, worldPosition);
        this.tmp_localPosition.subtract(this.node.position)
        let coord = this.positionToCoord(this.tmp_localPosition)
        return coord;
    }

    /**不建议直接 调用，可通过addToQueue 放到队列里分帧处理 */
    createObject(info: Grid2DObjectCreation) {
        let obj = instantiate(info.prefab) as Node
        // 10 x 10 格
        // let xy = v2(randomRangeInt(0, 8), randomRangeInt(0, 8))
        // obj.position = 
        let coord = info.coord;
        obj.position = this.coordToPosition(coord)
        obj.setParent(this.container);
        obj.worldScale = obj.scale;
        //coord canbe float ,but need int when query objects;
        coord.x = Math.floor(coord.x)
        coord.y = Math.floor(coord.y)
        coord.z = Math.floor(coord.z)
        let object = this.getObjectByCoord(coord)
        if (object) {
            //如果 已经有了节点，则删除 该 节点
            // MapLoader.instance.removeItem(oItem);
            this.destroyObject(object);
        }
        let item = obj.getComponent(GridObject)
        if (item == null) {
            item = obj.addComponent(GridObject);
        }
        this.addObject(item, coord);
    }

    destroyObject(obj: GridObject) {

        this.removeObject(obj)
        obj.node.destroy();
    }

    addObject(item: GridObject, coord: Vec3) {
        item.grid = this;
        this.objects[coord.x][coord.y][coord.z] = item;
        item.coord = coord;
        let c = this.counts[item.id] || 0
        this.counts[item.id] = c + 1;
    }

    removeObject(item: GridObject) {
        this.counts[item.id]--;
        let coord = item.coord
        this.objects[coord.x][coord.y][coord.z] = null;
        item.grid = null;
    }

    clear() {

    }

    /**
     * 复用该网格，并设置格子坐标
     * @param pos  格子坐标
     */
    reuse(pos?: Vec3) {
        if (pos == null)
            pos = this.node.position;
        // need to be clear?
        this.clear();
        this.node.position = v3(pos.x * this.size.x + this.size.x / 2, pos.y * this.size.y + this.size.y / 2, pos.z * this.size.z + this.size.z / 2);
        this.pos.x = pos.x;
        this.pos.y = pos.z;;
        this.pos.z = pos.z;

    }

    //网格唯一id
    get id() {
        return this.pos.x + "_" + this.pos.y + "_" + this.pos.z;
    }


}
