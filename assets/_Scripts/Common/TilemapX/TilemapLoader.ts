import { loader, JsonAsset, resources } from 'cc';
import Tilemap from './Tilemap';

export interface TileLayerData {
  data: number[];
  height: number;
  name: string;
  opacity: number;
  type: string;
  visdible: string;
  width: number;
  x: number;
  y: number;
}
export interface TilemapData {
  width: number;
  height: number;
  layers: TileLayerData[];
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
}

export default class TilemapLoader {
  static _cache: { [index: string]: TilemapData } = {};

  public static get(name: string) {
    return this._cache[name];
  }

  static _load(name, json) {
    let tilemap = this.get(name);
    if (tilemap == null) {
      tilemap = json;
      // tilemap = json as TilemapData
      this._cache[name] = tilemap;
    }
    return tilemap;
  }

  public static loadTilemap(path): Promise<TilemapData> {
    return new Promise((resolve, reject) => {
      resources.load(path, JsonAsset, (err, res: JsonAsset) => {
        if (err) {
          return reject(err);
        }
        let tilemap = this._load(path, res.json);
        resolve(tilemap);
      });
    });
  }
}
/**
 * { "height":10,
 "layers":[
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
         "height":10,
         "name":"ground",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":4,
         "x":0,
         "y":0
        },
        {
         "data":[0, 0, 0, 5, 0, 0, 0, 0, 0, 7, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":10,
         "name":"object",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":4,
         "x":0,
         "y":0
        }],
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"right-down",
 "tiledversion":"1.0.3",
 "tileheight":60,
 "tilesets":[
        {
         "columns":3,
         "firstgid":1,
         "image":"..\/test.png",
         "imageheight":180,
         "imagewidth":180,
         "margin":0,
         "name":"test",
         "spacing":0,
         "tilecount":9,
         "tileheight":60,
         "tilewidth":60
        }],
 "tilewidth":60,
 "type":"map",
 "version":1,
 "width":4
}
 *
 *
 *
 */
