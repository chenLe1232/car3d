
export default class DataCar {
    id: number = 0;
    name: string = "";
    maxSpeed: number = 3
    speed: number = 0;

    speed_text: number = 0;
    maxSpeed_text: number = 0;

    speed_ratio: number = 0;
    maxSpeed_ratio: number = 0;


    level: string = "";

    public constructor(id:any) {
        let d = csv.CarAttr.get(id);
        if (!d) {
            return;
        }
        this.id = id;
        this.name = d.name;
        this.speed = d.NS;
        this.maxSpeed = d.TS

        this.speed_text = d.NS_show;
        this.maxSpeed_text = d.TS_show;

        this.speed_ratio = d.NS_ratio;
        this.maxSpeed_ratio = d.TS_ratio;

    }


}