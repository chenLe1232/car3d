import { Node, director, Component } from "cc";

export default class CCObjectUtil {
    public static Destroy(node: Node, delayTime: number = 0) {
        if(delayTime){
            //todo:
        }
        node.destroy();
        node.destroyAllChildren();
    }

    public static FindObjectOfType<T extends Component>(type): T {
        return director.getScene().getComponentInChildren(type)
    }
}