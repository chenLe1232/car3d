import { Component, Node } from 'cc';
import CCObjectUtil from './CCObjectUtil';

export default class Singleton {
  //: EventDispatcher where T : MonoBehaviour
  private static _instance: any = null;

  public static Instance<T>(type: any): T {
    if (this._instance == null) {
      this._instance = CCObjectUtil.FindObjectOfType(type);
      if (this._instance == null) {
        if (type instanceof Component) {
          let node = new Node();
          //@ts-ignore
          this._instance = node.addComponent(type);
          node.name = this._instance.name;
          // this._instance.gameObject.name = this._instance.GetType().Name;
        } else {
          this._instance = new type();
        }
      }
      return this._instance;
    }
  }
}
