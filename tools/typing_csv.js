var fs = require("fs")
var path = require('path')
const readline = require('readline');
let PATH = "assets/resources/Config/csv"
let csv_index_dts = "typings/index_csv.d.ts"
////////////////////////////////////////////////

typeMapped = {
    int: "number",
    number: 'number',
    string: "string",
    itemlist: "Item[]",
    item:'Item'
}

let config_keyvalue_csvs = "Config,Audio"
let _key_ = "Key"
let _comment_ = "desc1"
let _value_ = "config_data"
////////////////////////
let files = fs.readdirSync(PATH)
let file_tempalte = (all) => `
declare namespace csv{
    interface Item {
        type:number;
        id:number;
        count:number;
    }
    ${all}
}`

let template = (name, fields) => `
    interface ${name}_Row {
        ${fields}
    }
    
    export class ${name}{
        static get(id:number|string):${name}_Row
        static values:${name}_Row[];
        static search(predicate: (value: ${name}_Row, index: number) => boolean):${name}_Row[]
        static size:number;
    }

`
let kvclass_template = (name, fields) => `
    export class ${name}{
        ${fields}
    }
`
let field_template = (comment, field_name, field_type, value, isStatic = false) => `
        /**
         * @type {${field_type}}
         * @description ${comment} - ${value} 
         */
        ${isStatic ? "static " : ""}${field_name}?:${field_type}`


function readlines(v) {
    var data = fs.readFileSync(v).toString()
    //skip ufeff
    var rows = data.split(/\r?\n/g).filter(function (line) {
        return line != ""
    })
    return rows;
}

// async function start(files)
// {
//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         let line = await readfirstline(v);  
//     }
// }

let result = file_tempalte(files.filter(v => v.endsWith(".csv")).map((v) => {
    let pinfo = path.parse(v)
    let lines = readlines(PATH + "/" + v);
    let fields = lines[1].split("\t");
    let comments = lines[0].split("\t")
    let types = lines[2].split("\t")
    if (config_keyvalue_csvs.indexOf(pinfo.name) >= 0) {
        //key value 
        let data = lines.splice(3)
        let key_index = fields.indexOf(_key_)

        console.log(fields);
        let comment_index = fields.indexOf(_comment_)
        let value_index = fields.indexOf(_value_);
        fields = data.map(v => {
            let dd = v.split("\t")
            return dd;
        }).filter(dd => {
            return dd[key_index] != ""
        }).map(dd => {
            let key = dd[key_index]
            let comment = dd[comment_index]
            let value = dd[value_index]
            let [field_name, field_type] = key.split(":")
            if (!field_type) {
                if (isNaN(Number(value))) {
                    field_type = "string"
                } else {
                    field_type = "number"
                }
            }
            field_name = field_name.replace(" ","_")
            return field_template(comment, field_name, field_type, value, true)
        }).join(";\n")
        return kvclass_template(pinfo.name, fields)
    } else {
        fields = fields.map((v, i) => {
            let [field_name, field_type] = v.split(":")
            if (!field_type) {
                let type = types[i]
                field_type = typeMapped[type] || "any"
            }
            field_name = field_name.replace(" ","_")
            return field_template(comments[i], field_name, field_type, "")
        }).join(",\n")
        return template(pinfo.name, fields);
    }

}).join(""))


fs.writeFileSync(csv_index_dts, result)