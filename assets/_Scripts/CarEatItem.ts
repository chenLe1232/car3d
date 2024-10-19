import { Component, _decorator, ParticleSystemComponent, find, director } from "cc";

import Device from "../framework3D/misc/Device";
import { evt } from "../framework3D/core/EventManager";

import GridMap1D from "./Common/GridX/GridMap1D";
import GridObject from "./Common/GridX/GridObject";
import { buffSystem } from "../framework3D/misc/buffs/BuffSystem";
import Level from "./Scenes/Level";
import { Buffs } from "./Buffs/BuffsRegistry";
import { PlayerInfo } from "./Data/PlayerInfo";
import ccUtil from "../framework3D/utils/ccUtil";
let { ccclass, property } = _decorator;


@ccclass
export class CarEatItem extends Component {

    // collider: ColliderComponent = null
    @property(ParticleSystemComponent)
    ps_pick_star: ParticleSystemComponent = null;


    @property(ParticleSystemComponent)
    ps_bomb: ParticleSystemComponent = null;

    map: GridMap1D = null
    onLoad() {
        // this.body = this.getComponent(RigidBodyComponent);
        // this.collider = this.getComponent(ColliderComponent);
    }

    start() {
        // if (this.collider) {
        // Your initialization goes here.
        // this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        // this.collider.on("onTriggerExit", this.onTriggerExit, this);
        // }
        this.map = director.getScene().getComponentInChildren(GridMap1D)

        // this.map = Level.instance.map;

    }

    onEnable() {
        this.schedule(this.step, 0.03);
    }

    onDisable() {
        this.unschedule(this.step);
    }


    step() {
        //碰撞检测 
        //获取玩家所有的子格子位子
        let position = this.node.position;
        let grid = this.map.whichGrid(position.z);
        if (grid) {
            let coord = grid.getCoord(position)
            for (var i = 0; i < 2; i++) {
                coord.y = i;
                let obj = grid.getObjectByCoord(coord)
                if (obj != null) {
                    this.col(obj);

                };
            }
        }
        // let xy = grid.node.inverseTransformPoint(this.localPos, this.node.position);
        // console.log(xy);
    }


    col(obj: GridObject) {
        //can eat
        // console.log("eat pickable item :", other.node.name)
        
        let name = obj.node.name;
        switch (name) {
            case 'Booster':
                Level.instance.car.speedup();
                return;
            case 'Booster2':
                //跳台
                Level.instance.car.fly();
                return;
            case 'Booster0':
                Level.instance.car.speedup();
                return;
            case 'Diamond':
                Device.vibrate();
                // this.ps_pick_star.play();
                ccUtil.playParticles(this.ps_pick_star);
                Device.playSfx("CoinCollect")
                PlayerInfo.tmp_diamond += 1;
                // PlayerInfo.score += LvManager.instance.scoreTable.star;
                // PlayerInfo.star++;
                // Root.instance.gameUI.updateStar();
                break;
            case 'magnet':
                Device.vibrate();
                buffSystem.startBuff(Buffs.MagnetBuff, 5);
                evt.emit("EatItem","magnet")
                break;
            case 'shield':
                Device.vibrate();
                Device.playSfx("ApplyShield")
                buffSystem.startBuff(Buffs.ShieldBuff, 6);
                evt.emit("EatItem","shield")
                break;
            case 'speedup':
                buffSystem.startBuff(Buffs.SpeedupBuff, 5);
                break;
            case 'bomb':
                //直接扔炸弹
                Level.instance.fireBomb();
                this.ps_bomb.play();
                evt.emit("EatItem","bomb")
                break;
            case 'heart':
                //add hp 
                // PlayerInfo.hp += 1;
                // Root.instance.car.addhp(1);
                // Device.playSfx("Heal")
                // Root.instance.gameUI.updateHp();
                break;
            case 'endDoor':
                //大门
                return;
            // Root.instance.car.launchMissiles(2);
        }
        // let name = ItemNames[item.node.name]
        // if (name)
        //     Root.instance.gameUI.showTip("获得道具:" + name)
        // MapLoader.instance.removeItem(item);
        obj.destroySelf();
    }






    onTriggerExit() {

    }
}