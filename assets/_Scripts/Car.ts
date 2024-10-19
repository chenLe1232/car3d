import { _decorator, Component, Node, BoxColliderComponent, RigidBodyComponent, v3, Vec2, Vec3, ColliderComponent, utils, geometry, misc, Quat, quat, v2, ParticleSystemComponent, math, Game, instantiate, tween, size } from "cc";
import MoveEngine from "../framework3D/misc/MoveEngine";
import Device from "../framework3D/misc/Device";

import ccUtil from "../framework3D/utils/ccUtil";
import FizzBody from "./Common/FizzX/FizzBody";
import { Signal } from "../framework3D/core/Signal";
const { ccclass, property } = _decorator;

@ccclass("Car")
export class Car extends Component {
    /* class member could be defined like this */
    // dummy = '';
    collider: ColliderComponent = null;

    @property
    isPlayer = false;

    moveEngine: MoveEngine = null;

    isDead = false;
    @property
    maxHp: number = 10;

    _hp: number = this.maxHp;

    damage: number = 5;

    onHurt: Signal = new Signal();
    onDead: Signal = new Signal();
    onRemove: Signal = new Signal();

    dirColliders: ColliderComponent[] = []

    body: FizzBody = null

    onLoad() {
        this.init();
        if (this.body == null) {
            this.body = ccUtil.getOrAddComponent(this, FizzBody);
            this.body.size = size(80, 150);
        }
    }
    init() {
        // this.body = this.getComponent(RigidBodyComponent);
        this.collider = this.getComponent(ColliderComponent);
        // this.moveEngine = this.getComponent(MoveEngine);
        this.moveEngine = ccUtil.getOrAddComponent(this.node, MoveEngine);
        if (this.collider) {
            // Your initialization goes here.
            // this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
            this.collider.on("onTriggerExit", this.onTriggerExit, this);
        }

        let node = this.node.getChildByName("car_colliders")
        if (node != null) {
            this.dirColliders = node.getComponentsInChildren(BoxColliderComponent);
        }
    }


    set hp(v) {
        this._hp = v;
    }

    addhp(hp) {
        let t = this._hp + hp;
        if (t > this.maxHp) {
            this._hp = this.maxHp;
        } else {
            this._hp = t;
        }
    }

    get maxSpeed() {
        return this._maxSpeed;
    }

    set maxSpeed(v) {
        this._maxSpeed = v;
        this.moveEngine.maxSpeed = v;
    }

    _maxSpeed: number = 100;

    _acceleration: number = 30;

    get acc() {
        return this._acceleration;
    }

    set acc(v) {
        this._acceleration = v;
        this.moveEngine.acceleration = v;
    }

    revive(hp) {
        this._hp = hp;
        this.moveEngine.stop();
    }

    goDead() {
        this.onDead.fire(this)
    }

    takeDamage(damage?) {
        damage = damage ||
            this._hp;
        if (this._hp <= 0) return;
        this._hp -= damage;
        this.onHurt.fire(this, damage);
        if (this._hp <= 0) {
            this._hp = 0;
            this.onDead.fire(this)
        }
    }

    onDestroy() {
        this.onDead.clear();
        this.onHurt.clear()
        this.onRemove.fire(this);
    }




    tmp_vec: Vec3 = v3()
    vecFromTarget(carNode: Node) {
        let v1 = carNode.position
        let self = Vec3.copy(this.tmp_vec, this.node.position);
        let v2 = self.subtract(v1);
        return v2;
    }


    gravity: Vec3 = v3(0, -15, 0);
    gravity_enabled = false;

    onTriggerExit(e) {
        // var collider = e.otherCollider as ColliderComponent;
        // if (collider.node.name == "ground") {
        //     //falloff
        //     this.gravity_enabled = true;
        //     this.isDead = true;
        // }
    }

    updateGravity() {
        this.moveEngine.addForce(this.gravity);
    }

    timer = 0;
    tmp_pos: Vec3 = v3();

    update(dt: number) {
        // check player position 
    }



}
