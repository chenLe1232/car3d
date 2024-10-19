let fs = require("fs")
let path = require('path')


// let dir = pinfo.dir;
let dir = "assets/Script/Configs/"
let outdir = dir + "/csv"
if(!fs.existsSync(outdir))
{
    fs.mkdirSync(outdir);
}

//"./../data/Tips"
function convertocsv(_path)
{
    let data = require("./../"+_path)
    let basename = path.parse(_path).name + ".csv"
    console.log(data.head)
    let csvstr = ""/// "\ufeff"
    csvstr += data.head.join(",") +"\n"
    csvstr += Object.entries(data.body).map(v=>{
        let row = v[1]
        return row.map(c=>{
            if(typeof(c ) == "string"){
                c = `"${c}"`
            }
            return c;
        }).join(",")
    }
    ).join("\n")
    fs.writeFileSync(outdir+"/" + basename,csvstr)
}

let data_dir_path = "docs/data/"
let files = fs.readdirSync(data_dir_path)
files = files.map(v=>data_dir_path+v)
files.forEach(v=>convertocsv(v))
// console.log(path);
// require("./docs/data/CantingData.js")
