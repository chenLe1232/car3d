import TilemapLoader, { TilemapData, TileLayerData } from "./TilemapLoader";
import { Prefab, Component, _decorator, Enum } from "cc";
import { Signal } from "../../../framework3D/core/Signal";
let { property, ccclass } = _decorator



@ccclass
export default class Tilemap extends Component {
    data: TilemapData;

    fromBottom: boolean = true;

    @property
    segCount: number = 1;

    @property
    segIndex: number = 0;



    get segHeight() {
        return this.data.height / this.segCount;
    }

    // 分段
    onLoad() {

    }

    set path(v) {
        TilemapLoader.loadTilemap(v).then(v => {
            this.data = v;
            this.render()
        })
    }

    start() {

    }

    render() {
        for (var i = 0; i < this.data.layers.length; i++) {
            var alyer = this.data.layers[i]
            this.renderLayer(alyer, i)
        }
    }

    // 0 ,0 ,0, 0
    // 0 ,0 ,0, 0
    // 0 ,0 ,0, 0
    // 0 ,1 ,0, 0

    renderLayer(layer: TileLayerData, layerIndex) {
        //左上开始 =》 左下开始
        for (var i = 0; i < layer.width; i++) {
            let segHeight = this.segHeight
            for (var j = 0; j < segHeight; j++) {
                let y = j;
                if (this.fromBottom) {
                    y = layer.height - this.segIndex * this.segCount - 1 - j;
                }
                let ind = (y) * layer.width + i;
                let d = layer.data[ind]
                if (d > 0) {
                    this.renderGid(d, i, j, layerIndex)
                }
            }
        }
    }


    onRenderGrid: Signal = new Signal();

    renderGid(gid, x, y, layerIndex) {
        this.onRenderGrid.fire(gid, x, y, layerIndex, this);
    }
}