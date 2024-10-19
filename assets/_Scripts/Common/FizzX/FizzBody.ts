import { Vec3, misc, Node, Component, _decorator, Size, size, v3, isValid, v2, Enum } from "cc";
import Fizz from "./fizz";
import Shapes from "./shapes";
import FizzManager from "./FizzManager";
import { Signal } from "../../../framework3D/core/Signal";

const { ccclass, property } = _decorator;

export enum FizzBodyType {
    Static,
    Dynamic,
    Kinematic,
}


enum FizzShapeType {
    rect,
    circle,
    line,
}


export interface FizzCollideInterface {
    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number);
    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number);
    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number);
}


@ccclass
export default class FizzBody extends Component {

    @property({ type:Enum(FizzBodyType) })
    bodyType: FizzBodyType = FizzBodyType.Dynamic;

    @property({ type: Enum(FizzShapeType) })
    shapeType: FizzShapeType = FizzShapeType.rect;

    // @property({visible(){return this.bodyType==FizzBodyType.Static},slide:true,range:[0,10],step:1})
    // isTrigger:boolean = false;
    @property(Size)
    size: Size = size()


    @property({ slide: true, range: [0, 1], step: 0.1 })
    friction: number = 1;

    @property({ slide: true, range: [0, 10], step: 0.1 })
    bounce: number = 0

    @property({ slide: true, range: [0, 50], step: 0.1 })
    damping: number = 0

    @property({ visible() { return this.bodyType == FizzBodyType.Dynamic }, slide: true, range: [0, 10], step: 1 })
    gravity: number = 1

    @property()
    isTrigger: boolean = true;

    @property({ visible() { return !this.isTrigger && this.shapeType == FizzShapeType.rect } })
    left: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == FizzShapeType.rect } })
    right: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == FizzShapeType.rect } })
    top: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == FizzShapeType.rect } })
    bottom: boolean = false;


    @property({ visible() { return this.isTrigger } })
    destroyAfterTrigger: boolean = false;

    /**
     * x 方向的速度
     */
    xv = 0;
    /**
     * 方向的速度 
     */
    yv = 0;
    sx = 0;
    sy = 0;

    x = 0;
    y = 0;
    hw = 0;
    hh = 0;
    _sid_: number = 0;

    get sid() {
        return this._sid_;
    }

    @property({ tooltip: "是否需要计算碰撞反应" })
    response: boolean = false;

    private _shape = null;
    public get shape() {
        return this._shape;
    }
    public set shape(value) {
        this._shape = value;
    }

    _targetComponent: any;

    intersections: { [index: string]: FizzBody } = {}

    mass: number = 1;

    isFalling: boolean = false;
    isLand: boolean = false;

    _bodyAttached = false;

    //扩展 force 
    force: Vec3 = v3();

    // group 扩展参数
    group: string = "";

    get active() {
        return this.node.active
    }

    onLoad() {
        let components = this.getComponents(Component)
        this._targetComponent = components.find(v => v["onFizzCollideEnter"] != null && v != this);
    }

    reset() {
        this.remove();
        this.respawn();
    }

    setBodyType(body: FizzBodyType) {
        this.remove();
        this.bodyType = body;
        this.respawn();
    }

    onDisable() {
        this.remove();
        this.unschedule(this.checkExit);
    }

    onEnable() {
        this.respawn()
        this.unschedule(this.checkExit);
        this.schedule(this.checkExit, 0.5)
    }

    start() {
        this.respawn();
    }

    get isStanding() {
        return this.isLand && !this.isFalling && this.yv <= 0
    }

    onCollide(body: FizzBody, nx, ny, pen) {
        if (!this._bodyAttached) {
            return;
        }
        let r = true;
        if (body._sid_ != null) {
            if (this.intersections[body._sid_] == null) {
                this.intersections[body._sid_] = body;
                r = this.onFizzCollideEnter(body, nx, ny, pen);
            } else {
                r = this.onFizzCollideStay(body, nx, ny, pen);
            }
            r = r == null ? true : r;
        }
        if (this.isTrigger) {
            return false;
        } else {
            return r;
        }
    }

    syncRotation() {
        // this.node.angle = Math.atan2(this.yv, this.xv) * cc.macro.DEG
    }

    setVelocity(x: number | Vec3, y?: number) {
        if (x instanceof Vec3) {
            y = x.y;
            x = x.x;
        }
        this.xv = x
        this.yv = y
    }


    applyForce(f: Vec3) {
        this.force.add(f);
    }

    applyImpulse(x, y) {
        this.xv += x
        this.yv += y
    }

    getDisplacement() {
        return v2(this.sx || 0, this.sy || 0)
    }

    get velocity() {
        return v2(this.xv || 0, this.yv || 0)
    }

    getVelocity() {
        return v2(this.xv || 0, this.yv || 0)
    }

    getPosition() {
        return v3(this.x, this.node.position.y, this.y)
    }

    // sets the position of a shape
    setPosition(x, y, z) {
        let pos = this.node.position;
        Fizz.changePosition(this, pos.x - this.x, pos.z - this.y)
        // this.node.x = x;
        // this.node.z = y;
        this.node.setPosition(x, pos.y, z);
    }

    syncPosition() {
        let pos = this.node.position;
        Fizz.changePosition(this, pos.x - this.x, pos.z - this.y)
    }

    respawn() {
        if (!this._bodyAttached && FizzManager.instance) {
            // let center = FizzManager.instance.getCenter(this.node);
            let center = this.node.worldPosition;
            let hw = this.size.width / 2 * this.node.scale.x;
            let hh = this.size.height / 2 * this.node.scale.y;
            if (this.shapeType == FizzShapeType.line) {
                Fizz.addShapeType(this, this.bodyType, FizzShapeType[this.shapeType], center.x - hw, center.z, center.x + hw, center.z)
            } else {
                Fizz.addShapeType(this, this.bodyType, FizzShapeType[this.shapeType], center.x, center.z, hw, hh)
            }
            if (this.bodyType == FizzBodyType.Dynamic)
                Fizz.setMass(this, 1)
            this._bodyAttached = true;
        }
    }

    /**
     * 临时删除，后面可以使用respawn 恢复
     */
    remove() {
        this.force = Vec3.ZERO;
        this.isFalling = false;
        this.isLand = false;
        this.intersections = {}
        Fizz.removeShape(this);
        this._bodyAttached = false;
    }


    onDestroy() {
        Fizz.removeShape(this);
    }

    onFizzCollideEnter(b: FizzBody, nx, ny, pen) {
        if (this.isTrigger) {
            // this.triggerCallback.emit([this.triggerCallback.customEventData])
        }
        if (this._targetComponent)
            return this._targetComponent.onFizzCollideEnter(b, nx, ny, pen);
        if (this.destroyAfterTrigger) {
            this.destroy();
        }
        return true;
    }

    onFizzCollideStay(b: FizzBody, nx, ny, pen) {
        if (this._targetComponent && this._targetComponent.onFizzCollideStay)
            return this._targetComponent.onFizzCollideStay(b, nx, ny, pen);
        return true;
    }

    onFizzCollideExit(b: FizzBody) {
        if (this._targetComponent && this._targetComponent.onFizzCollideExit)
            return this._targetComponent.onFizzCollideExit(b);
        return true;
    }


    get bounds() {
        return Shapes.bounds(this);
    }

    checkExit() {
        for (let k in this.intersections) {
            let v = this.intersections[k]
            if (isValid(v)) {
                let b = Shapes.fasttest(this, v)
                if (!b) {
                    this.onFizzCollideExit(v);
                    delete this.intersections[v._sid_]
                }
            } else {
                delete this.intersections[v._sid_]
            }
        }
    }

    update(dt) {
        if (FizzManager.instance.colDetectOnly) {
            return this.syncPosition();
        }
        if (this.bodyType == FizzBodyType.Dynamic || this.bodyType == FizzBodyType.Kinematic) {
            // this.node.x = this.x;
            // this.node.y = this.y;
            this.node.setPosition(this.x, this.node.position.y, this.y)
            this.xv += this.force.x;
            this.yv += this.force.y;
            this.force.set(0, 0, 0);
        }
    }

    lookAt(target: Vec3, c = 0.1) {
        // let angle = this.node.angle
        // let toTarget = target.clone().subtract(this.node.position);
        // let targetAngle = Math.atan2(toTarget.y, toTarget.x) * cc.macro.DEG
        // let toAngle = targetAngle - angle;
        // this.node.angle += toAngle * c;
    }

    seek(target: Vec3, maxSpeed = 100) {
        let toTarget = target.clone().subtract(this.node.position);
        toTarget.normalize();
        toTarget.multiplyScalar(maxSpeed);
        toTarget.subtract(this.velocity);
        return toTarget;
    }

    map(val, s1, s2, e1, e2) {
        let newVal = (e2 - e1) * val / (s2 - s1) + e1;
        return Math.max(e1, Math.min(newVal, e2));
    }


    arrive(target: Vec3, maxSpeed = 100, deacc_dist = 50) {
        let toTarget = target.clone().subtract(this.node.position);
        let d = toTarget.length();
        toTarget.multiplyScalar(1 / d);
        // toTarget.normalizeSelf();
        //--------------------------------------快达到目标点时减速----------------------------------------//
        if (d < deacc_dist) {
            let m = this.map(d, 0, deacc_dist, 0, maxSpeed);
            toTarget.multiplyScalar(m);
        } else {
            toTarget.multiplyScalar(maxSpeed);
        }
        //--------------------------------------需要用的力 = 到目标点期待的速度 - 当前速度----------------------------------------//
        toTarget.subtract(this.velocity);
        return toTarget;
    }


    //--------------------------------------follow path----------------------------------------//
    getNormalPoint(point, a, b): Vec3 {
        let ab = b.sub(a);
        let ap = point.subtract(a);
        // ab.normalizeSelf()
        // let ap_ab = ab.mul(ap.dot(ab))
        let ap_ab = ap.project(ab)
        return a.add(ap_ab);
    }


    static ReachPathEndThreshold = 400; //20 x 20
    static PathPredictLength = 25;

    _runningPath: Vec3[] = []
    isPathLoop: boolean = false;
    _currentPathIndex: number = 0;

    pathSigal: Signal = new Signal();


    drawPath(context) {
        // context.clear();
        context.moveTo(this._runningPath[0].x, this._runningPath[0].y);
        for (var i = 0; i < this._runningPath.length - 1; i++) {
            let a = this._runningPath[i];
            let b = this._runningPath[i + 1]
            context.lineTo(b.x, b.y);
        }
        // Game.instance.graphics.ellipse(target.x,target.y ,4,4)
        context.stroke();
    }


    isPathFinished() {
        return this._currentPathIndex != 0 && this._currentPathIndex == this._runningPath.length;
    }

    followPath(path: Vec3[], stopAtEnd = false, maxSpeed = 100, pathRadius: number = 20, distDeacc: number = 100) {
        this._runningPath = path;
        if (this._currentPathIndex == path.length - 1) {
            // let distsq = this.node.position.sub(this._runningPath[this._currentPathIndex]).magSqr();
            // if(distsq < MoveEntity.ReachPathEndThreshold)
            // {
            // console.log("resetpath wehne finei");
            // if (this.resetPathWhenFinish)
            // {
            //     this.resetPath();
            // }
            // }
            if (stopAtEnd) {
                let f = this.arrive(path[this._currentPathIndex], maxSpeed, distDeacc);
                if (f.equals(Vec3.ZERO, 1)) {
                    this._currentPathIndex = this._currentPathIndex + 1
                    this.pathSigal.fire('Finished', path, this._currentPathIndex)
                }
                return f;
            }
            return Vec3.ZERO
        } else if (this._currentPathIndex == path.length) {
            return this.arrive(path[path.length - 1], maxSpeed, distDeacc);
        }
        // this.drawPath(Game.instance.graphics);
        let predict = this.velocity.clone();
        predict.normalizeSelf();
        predict.mulSelf(FizzBody.PathPredictLength);
        predict.addSelf(this.node.position);//predictLocation
        let target: Vec3;
        // for (var i = 0 ;i < 2; i++)
        // {
        let a = path[this._currentPathIndex];
        let b = path[this._currentPathIndex + 1]

        let normalpoint = this.getNormalPoint(predict, a, b);
        let distsq = normalpoint.subtract(b).lengthSqr();
        if (distsq < FizzBody.ReachPathEndThreshold) {
            this._currentPathIndex += 1;
            this.pathSigal.fire('WayPoint', path, this._currentPathIndex)
            if (this.isPathLoop && this._currentPathIndex >= path.length - 1) {
                this._currentPathIndex = 0;
            }
        }
        if (distsq > pathRadius * pathRadius) {
            target = (normalpoint).add(b.clone().subtract(a).normalize().multiplyScalar(FizzBody.PathPredictLength + 10))
            return this.seek(target, maxSpeed);
        }
        return Vec3.ZERO;
    }


    setPath(path: Vec3[], isLoop: boolean = false, isRelativePath: boolean = true) {
        this.isPathLoop = isLoop;
        this._runningPath.splice(0);
        for (var i = 0; i < path.length; i++) {
            let pos = path[i].clone();
            if (isRelativePath) {
                pos.add(this.node.position)
            }
            this._runningPath.push(pos);
        }
        if (this.isPathLoop) {
            if (this._runningPath.length > 0) {
                let pathWayPoint = this._runningPath[0]
                this._runningPath.push(pathWayPoint);
            }
        }
        this._currentPathIndex = 0;
    }

    resetPath() {
        this._currentPathIndex = 0;
    }
    //------------------------------------------------------------------------------//


}