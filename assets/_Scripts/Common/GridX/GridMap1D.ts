import { Component, _decorator, Node, Vec3, v2 } from "cc";
import { Grid3D } from "./Grid3D";
import DynamicMap from "../../../framework3D/misc/3d/DynamicMap";
import { GridLayout } from "../../Tools/GridLayout";
let { ccclass, property } = _decorator
@ccclass
export default class GridMap1D extends Component {

    @property(DynamicMap)
    mapGenerator: DynamicMap = null;
    grids: { [index: string]: Grid3D } = {}
    /**
     * 单元格子大小
     */
    @property({ displayName: "单元格大小" })
    size: number = 100;



    onLoad() {
        if (!this.mapGenerator) {
            this.mapGenerator = this.getComponent(DynamicMap);
        }
        this.mapGenerator.event.add(this.onMapEvent, this)

        // 检测 已经存在的grid 
        let grids = this.getComponentsInChildren(Grid3D);
        for (var i = 0; i < grids.length; i++) {
            this.grids[i] = grids[i]
        }
    }

    start() {

    }

    onMapEvent(evt, node: Node) {
        if (evt == "add") {
            let pos = this.positionToGridPos(node.position.z)
            let grid = node.getComponent(Grid3D);
            this.grids[pos] = grid;
        } else if (evt == "remove") {
            let grid = node.getComponent(Grid3D);
            if (grid) {
                delete this.grids[grid.pos.z];
            }
        }
    }

    id(x) {
        return x
    }

    getGrid(x) {
        let id = this.id(x);
        return this.grids[id];
    }

    whichGrid(x, offset = 0) {
        let g = this.positionToGridPos(x);
        g += offset;
        return this.getGrid(g);
    }

    whichGrids(x, rangeMin, rangeMax): Grid3D[] {
        let g = this.positionToGridPos(x);
        let grids = []
        for (var i = rangeMin; i < rangeMax; i++) {
            let v = g + i;
            let grid = this.getGrid(v);
            grids.push(grid);
        }
        return grids
    }

    positionToGridPos(x) {
        let gx = Math.floor(x / this.size + 0.5)
        return gx;
    }


}