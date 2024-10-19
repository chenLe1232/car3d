export enum ResType {
    Coin,
    Diamond,
    Car,
}

export default class InfoRes {
    resIconUrl: string = ""
    count: number = 0;
    name: string = ""
    //类型 id
    type: ResType ;
    //子类型 id,比如 道具类型 ，枪1 的 id 为1
    id: number = 0;
    constructor(type, id?, count?) {
        this.count = count;
        this.type = type;
        this.id = id
        if(type == ResType.Coin){
            this.name = "金币"
            this.resIconUrl = "Texture/ui/jinbi"
        }else if(type == ResType.Diamond)
        {
            this.name = '钻石'
            this.resIconUrl = "Texture/ui/zuanshi"
        }
        // let d = csv.Res.get(id)
        // this.resIconUrl = d.icon;
    }
    static Coin = new InfoRes(ResType.Coin)
    static Diamond = new InfoRes(ResType.Diamond)
}