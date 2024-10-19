import { _decorator, Component, Node, Quat, quat, Enum } from "cc";
const { ccclass, property, menu } = _decorator;

enum Axis {
    X, Y, Z
}

@ccclass("AutoRotateComp")
@menu("qanim/AutoRotateComp")
export class AutoRotateComp extends Component {

    @property({ type: Enum(Axis) })
    axis: Axis = Axis.Y;

    @property
    speed: number = 1;

    rotateQuat: Quat = quat()

    start() {
        // Your initialization goes here.
    }

    update(deltaTime: number) {
        // Your update function goes here.
        let s = this.speed;
        this.node.rotate(Quat.fromEuler(this.rotateQuat, this.axis == Axis.X ? s : 0, this.axis == Axis.Y ? s : 0, this.axis == Axis.Z ? s : 0))
    }
}
