import { Asset, resources, TextAsset } from "cc"
export interface _csv {
    __ID__: string,
    __ROWS__: string,
    __SIZE__: string,
    __PS_INDEX__: number,
    __TYPE_INDEX__: number,
    __HEADER_INDEX__: number,
    __DATA_INDEX__: number,
    _StructData: Function,
    _Row: Function,
    _CSV: Function,
    pathToCSV: object,
    cache_indexKeyToTable: object,
    _fieldParser: any,
    isLoaded: Function,
    load: Function,
    remove: Function,
    loadString: Function,
    parse: Function,
    parseRowWithT: Function,
    parseRow: Function,
    setParser: Function,
    hasIndex: Function,
    removeIndex: Function,
    createIndex: Function,
    loadDir: Function,
    release: Function,
}
/**
 * @author renwang
 * @description csv-parser for creator ,work along with typing_csv.js
 */
var csv = {};
csv.__ID__ = "id"
csv.__ROWS__ = "values"
csv.__SIZE__ = "size"
csv.__PS_INDEX__ = 0
csv.__TYPE_INDEX__ = 2;
csv.__HEADER_INDEX__ = 1;
csv.__DATA_INDEX__ = 3;
/**
 * @constuctor
 * @param {}
 * @private
 */
csv._StructData = function () {
    this.header = []
    this.type = []
    this.body = []
}

/**
 * @constructor
 * @param data {csv._StructData}
 * @param values {Array.<number>}
 * @param index {number}
 */
csv._Row = function (data: any, values: any, index: any) {
    var self = this;
    // /**
    //  * @type {Array.<number>}
    //  */
    // this._values = values;
    // /**
    //  * @type {Array}
    //  */
    // this._keys = keys;
    this.index = index;
    let keys = data.header;
    let types = data.type
    let parsedTypes = []
    let names = []
    keys.forEach(function (v, i) {
        var [name, type] = v.split(":")
        if (type) {
            var result = type.match(/\[(\w*)\]/)
            if (result) {
                if (result[1] == "" || result[1] == "number") {
                    type = "array.number"
                } else {
                    type = "array.default"
                }
            } else {
                type = "default"
            }
        } else {
            type = "default"
        }
        names.push(name)
        parsedTypes.push(type);
    })

    names.forEach(function (name, i) {
        var val = values[i]
        //分析每个字段，并跟据字段类型进行解析成 object
        var type = parsedTypes[i]
        if (type.startsWith("array")) {
            if (val && val.length > 0) {
                val = val.split(/[,\+&;\/\s]/)
                if (type.endsWith("number")) {
                    val = val.map(function (x) {
                        return Number(x)
                    })
                }
            } else {
                val = []
            }
        } else if (type == "json") {
            val = JSON.parse(val);
        } else {
            var result = val.match(/\"(.*)\"/)
            if (result) {
                val = result[1] || val;
            } else {
                var val_n = Number(val);
                if (!isNaN(val_n)) {
                    val = val_n
                }
            }
        }
        if (csv._fieldParser) {
            let tt = types[i]//配置里的type
            val = csv._fieldParser(tt, val) || val
        }
        Object.defineProperty(self, name, {
            value: val,
            writable: false
        })
    });
}


csv._Row.prototype.match = function (cond: any) {
    if (cond && cond(this, this.index)) {
        return true;
    }
    return false;
}


/**
 * @constuctor
 * @param {csv._StructData} data
 */
csv._CSV = function (data: any) {
    /**
     * @type {csv._StructData} 
     */
    this._data = data;
    /**
     * @type {Object.<number,csv._Row>}
     */
    this._rows = {};
    this._values = null;
    var self = this;
    let id_index = data.header.indexOf(csv.__ID__)
    id_index = id_index < 0 ? 0 : id_index
    data.body.forEach(function (v, i) {
        var row = new csv._Row(data, v, i)
        // release data
        delete data.body[i]
        self._rows[v[id_index]] = row;
    })
    // empty array 
    data.body.splice(0)
    Object.defineProperty(this, csv.__ROWS__, {
        // value:this._rows,
        get: function () {
            if (this._values == null) {
                this._values = Object.values(self._rows)
            }
            return this._values;
        },
        // writable:false
    })
    Object.defineProperty(this, csv.__SIZE__, {
        value: this.values.length,
        writable: false
    })
}

/**
 * @param {string|number}  key
 */
csv._CSV.prototype.get = function (id: any) {
    return this._rows[id]
}


csv._CSV.prototype.search = function (cond: any) {
    let arrs = []
    for (var k in this._rows) {
        var row = this._rows[k]
        if (row.match(cond)) {
            arrs.push(row)
        }
    }
    return arrs;
}


/**
 * @type {Array.<csv._CSV>}
 */
csv.pathToCSV = {}
csv.cache_indexKeyToTable = {}
csv._fieldParser = null;

csv.isLoaded = function (name: any) {
    return csv.pathToCSV[name] != null;
}

csv.load = function (path, callback, target) {
    //load res
    resources.load(path, TextAsset, function (err, resource) {
        if (resource.name == '') return;
        if (!csv.pathToCSV[resource.name]) {
            var csv_ = csv.parse(resource.text)
            csv.pathToCSV[resource.name] = csv_;
            Object.defineProperty(csv, resource.name, {
                value: csv_,
                writable: false,
                configurable: true
            })
        }
        resources.release(path, TextAsset);
        if (callback) callback.call(target)
    })
}

csv.remove = function (name: any) {
    delete csv.pathToCSV[name]
}

csv.loadString = function (name: any, csv_str: any, callback: any, target: any) {
    let old = csv.pathToCSV[name]
    csv.remove(name);
    if (!csv.pathToCSV[name]) {
        try {
            var csv_ = csv.parse(csv_str)
            csv.pathToCSV[name] = csv_;
            delete csv[name]
            Object.defineProperty(csv, name, {
                value: csv_,
                writable: false,
                configurable: true
            })
        }
        catch (e) {
            console.error("[csv]expcetion occur while parsing csv txt!", e)
            csv.pathToCSV[name] = old;
        }
    }
    if (callback) callback.call(target)
}

/**
 * @param {string} csv_text
 */
csv.parse = function (csv_text: any) {
    var rows = csv_text.split(/\r?\n/g).filter(function (line) {
        return line != ""
    })
    var csv_data = new csv._StructData();
    csv_data.header = rows[csv.__HEADER_INDEX__].replace(/[\r]/g, "").split(/\s*\t/g)//.map(v=>v.replace(/\s/g,""))
    csv_data.type = rows[csv.__TYPE_INDEX__].replace(/[\r]/g, "").split(/\s*\t/g)
    csv_data.body = rows.slice(csv.__DATA_INDEX__).map(function (row) { return csv.parseRowWithT(row.replace(/\r/g, "")) })
    var csv_ = new csv._CSV(csv_data)
    return csv_;
}

csv.parseRowWithT = function (row: any) {
    return row.split("\t")
}


csv.parseRow = function (row: any) {
    if (row.indexOf('"') === -1) {
        return row.split(',');
    }
    var running = "";
    var result = [];
    var escapeMode = false;
    for (var i = 0; i < row.length; i++) {
        var current = row.charAt(i);
        if (current === '"') {
            escapeMode = !escapeMode;
            continue;
        }
        if (current === ',' && !escapeMode) {
            result.push(running);
            running = "";
            continue;
        }
        running += current;
    }
    result.push(running);
    return result;
};



csv.setParser = function (parser: any) {
    this._fieldParser = parser;
}

csv.hasIndex = function (key: any) {
    return csv.cache_indexKeyToTable[key] = null
}

csv.removeIndex = function (path: any, key_field: any) {
    let k = path + "." + key_field
    csv.cache_indexKeyToTable[k] = null;
}


csv.createIndex = function (path: any, key_field: any, value_field: any) {
    if (csv.hasIndex(path + "." + key_field)) {
        return;
    }
    /**
     * @type {csv._CSV}
     */
    var c = this[path]
    if (c == null) return console.warn("请先加载Config,再创建索引")
    c.values.forEach(function (v) {
        var key = v[key_field]
        if (key == "" || key == 0) return;
        key = key.replace(/\s*/g, "")
        Object.defineProperty(c, key, {
            value: v[value_field],
            writable: false
        })
    })
    csv.cache_indexKeyToTable[path + "." + key_field] = c;
}

csv.loadDir = function (dirPath: any, callback: any, target: any) {
    //load res
    resources.loadDir(dirPath, Asset, function (err, resource_1, urls) {
        let info = resources.getDirWithPath(dirPath,Asset);
        let paths = info.map(function (path, i) {
            var csv_res = resource_1[i]
            path = path.path.substr(path.path.lastIndexOf("/") + 1);
            if (csv.pathToCSV[path]) {
                return
            }
            var csv_ = csv.parse(csv_res.text)
            csv.pathToCSV[path] = csv_;
            Object.defineProperty(csv, csv_res.name, {
                value: csv_,
                writable: false,
                configurable: true
            })
        })
        // err.forEach(function (path, i) {

        // })
        //release 
        resources.release(dirPath, Asset);
        return callback && callback.call(target)
    });
}

/**
 * @param {string} path
 */
csv.release = function (path: any) {

}
window.csv = csv;