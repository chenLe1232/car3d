var fs = require("fs")
let path = "assets/resources/UI"
let eliminatePath = "assets/resources/"
let file_template = (list) => `
declare class vm {
${list}
    static show(viewNode:cc.Node,...args);
}
`
let method_template = (str) => `    static show(view: "${str}", ...args);
`
function listTree(path, arr) {
    let dirs = fs.readdirSync(path)
    dirs.forEach(v => {
        fullpath = path + "/" + v
        let fsta = fs.statSync(fullpath)
        if (fsta.isDirectory()) {
            listTree(fullpath, arr);
        }
        else {
            if (v.endsWith(".prefab")) {
                arr.push(fullpath.replace(".prefab", ""))
            }
        }
    })
}

let arr = []
listTree(path, arr);
arr = arr.map(v => v.replace(eliminatePath, ""))
arr = arr.map(v => method_template(v))
console.log(arr)
str = file_template(arr.join(""))
fs.writeFileSync("typings/index_vm.d.ts", str);