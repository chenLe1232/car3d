import { director, game } from "cc";
import MoveEngine from "../../misc/MoveEngine";

let beginTime = Date.now()
export default class Time {
    public static get DeltaTime() {
        return director.getDeltaTime();
    }

    public static get time() {
        return (Date.now() - beginTime) / 1000;
    }

    public static set timeScale(v) {
        MoveEngine.timeScale = v;
        director.getScheduler().setTimeScale(v);
    }
}
