
export default class DataLevel {

    id: number = 0;

    time: number = 0;

    gold: number = 0;
    diamond: number = 0;

    map: string[] = []

    public constructor(id) {
        this.id = id;
        let d = csv.Level.get(id)
        if (d) {
            this.gold = d.gold;
            this.diamond = d.diamond;
            this.time = d.time;
            this.map = d.configure.split('+');
        }
    }

}