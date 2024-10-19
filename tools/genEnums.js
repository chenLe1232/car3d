var fs = require("fs")

function getList(f)
{
    let csv_data = fs.readFileSync(f)
    csv_data = csv_data.toString();
    let first_linebreak = csv_data.indexOf("\n")
    let lines = csv_data.substring(first_linebreak+1).split("\n")
    let ret = lines.map(v=>{
        let [a1,a2] = v.split(",")
        return [a1,a2];
    }).filter(v=>v!="").map(v=>{
        if(v[1] && v[0]){
            return `["${v[1].replace(/\"/g,"")}_${v[0]}"] = ${v[0]},`
        }
        return ""
    }).join("\n    ")
    return ret;
}



let template =()=>`export enum FoodType{
    ${getList("assets/resources/Config/csv/ShicaiData.csv")}
}
export enum ToolType{
    ${getList("assets/resources/Config/csv/ChujvData.csv")}
}
`
let result = template()
fs.writeFileSync("assets/Game/Script/Common/CSVEnum.ts",result)