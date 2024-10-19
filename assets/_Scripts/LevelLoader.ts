import { Component, _decorator, Node, Enum, Prefab, instantiate, v3, loader, randomRange, randomRangeInt, ProgressBarComponent, Vec3 } from "cc";
import DynamicMap from "../framework3D/misc/3d/DynamicMap";
import Tilemap from "./Common/TilemapX/Tilemap";
import { Grid3D } from "./Common/GridX/Grid3D";
import ccUtil from "../framework3D/utils/ccUtil";
import InfoCar from "./Common/MergeFramework/InfoCar";
import AICar from "./AICar";
import CarSpawner from "./CarSpawner";
import { PlayerInfo } from "./Data/PlayerInfo";
import DataLevel from "./Data/DataLevel";
import { Signal } from "../framework3D/core/Signal";
let { ccclass, property } = _decorator


enum GID {
    Speedup = 1,
    Start,
    End,
    Jump,
    Shield,
    Magnet,
    Diamond,
    Bomb
}

@ccclass
class IdToPrefab {
    @property({ type: Enum(GID) })
    id: GID = GID.Speedup

    @property(Prefab)
    prefab: Prefab = null;
}

@ccclass
export default class LevelLoader extends Component {


    onLoadSpeical: Signal = new Signal();

    @property([Prefab])
    prefabs: Prefab[] = []

    mapGenerator: DynamicMap = null;

    endLinePos: Vec3 = v3(0, 0, 100000000);


    onLoad() {
        this.mapGenerator = this.getComponent(DynamicMap)
        // this.mapGenerator.isLoop = false;
        // this.mapGenerator.addSements()
        this.mapGenerator.event.on(this.onMapEvent, this)
    }


    onDestroy(){
    }

    onEnable() {
        this.setLevel();
    }


    level_path: string = "";
    currentSegmentIndex = 0;
    segments: string[];
    isFinished: boolean = false;

    setLevel() {
        let levelData = null
        try {
            levelData = ccUtil.get(DataLevel, PlayerInfo.level)
        } catch (e) {
            PlayerInfo.level = PlayerInfo.level - 1
            levelData = ccUtil.get(DataLevel, PlayerInfo.level)
        }
        // this.level_path =  levelData.map
        this.segments = levelData.map;
        this.currentSegmentIndex = 0;
        this.endLinePos.z = this.segments.length * 2400;
    }

    get currentSegment() {
        return this.segments[this.currentSegmentIndex]
    }

    moveNextSegment() {
        this.currentSegmentIndex++
    }

    index: number = 0;
    onMapEvent(evt, node: Node) {
        if (evt == "add") {
            if (this.currentSegment == null) {
                return
            }
            let tilemap = node.getComponent(Tilemap);
            tilemap.segIndex = this.index;
            tilemap.segCount = 4;
            tilemap.path = "Config/level/" + this.currentSegment;
            tilemap.onRenderGrid.on(this.onRenderGrid, this)
            this.index = ++this.index % 4;
            if (this.index == 0) {
                this.moveNextSegment();
            }
        } else if (evt == "remove") {

        }
    }

    loadSpecial(gid, pos) {
        this.onLoadSpeical.fire(gid, pos);
    }


    finish() {
        console.log("level finished!")
        this.isFinished = true
    }

    onRenderGrid(gid, x, y, layerIndex, tilemap: Tilemap) {
        if (this.isFinished) return;
        let grid = tilemap.getComponent(Grid3D)
        if (gid >= 18) {
            // prefabInfo = this.prefab_cars[gid - 18]
            let pos = grid.coordToWorldPosition(v3(x, layerIndex, y));
            this.loadSpecial(gid, pos)
            return
        } else if (gid == GID.Start) {
            console.log("ignore start sign!")
            return;
        } else if (gid == GID.End) {
            let prefabInfo = this.prefabs[gid - 1]
            let coord = v3(1.5, layerIndex, y)
            let endlinePos = grid.coordToWorldPosition(coord)
            grid.addToQueue(prefabInfo, coord)
            this.endLinePos = endlinePos;
            this.finish();
            //结束了
            return;
        }
        let prefabInfo = this.prefabs[gid - 1]
        if (prefabInfo) {
            grid.addToQueue(prefabInfo, v3(x, layerIndex, y))
        } else {
            console.warn("render gid :" + gid + " failed")
        }
    }

    start() {

    }

}