import View from './View';
import { evt } from '../core/EventManager';

import {
  _decorator,
  Component,
  Node,
  AudioClip,
  Prefab,
  loader,
  instantiate,
  find,
  WidgetComponent,
  UIRenderComponent,
  UIReorderComponent,
  SpriteComponent,
  color,
  TERRAIN_HEIGHT_BASE,
  UITransformComponent,
  resources,
} from 'cc';
import Device from '../misc/Device';
const { ccclass, property, menu } = _decorator;

var TAG: string = '[ViewManager]';
@ccclass
@menu('UI相关/ViewManager')
export default class ViewManager extends Component {
  // LIFE-CYCLE CALLBACKS:
  static instance: ViewManager;
  // onLoad () {}

  // baseDir:string = "assets/"

  _views: { [index: string]: View } = {};

  //
  @property(Node)
  modalNode: Node = null;

  modal: SpriteComponent = null;

  @property(AudioClip)
  audio_show: AudioClip = null;

  @property(AudioClip)
  audio_hide: AudioClip = null;

  onLoad() {
    // this.node.zIndex = 1000;
    ViewManager.instance = this;
    this.modalNode.active = false;
    this.modal = this.modalNode.getComponent(SpriteComponent);
    // this.modal.zIndex = 999;
    // cc.game.addPersistRootNode(this.node);
    // this.node.getComponent(WidgetComponent).target = find("Canvas")

    window['vm'] = this;
  }

  get allViews() {
    return Object.keys(this._views).map(k => this._views[k]);
  }

  onEnable() {}

  onDestroy() {
    // cc.game.removePersistRootNode(this.node);
    for (var key in this._views) {
      delete this._views[key];
    }
    ViewManager.instance = null;
  }

  start() {
    //load prefab
    // this.modal.active = false;
    // this.sprite = this.getComponent(SpriteComponent)
    // this.modal.zIndex = 999;
  }
  private getVisibleDialog() {
    let viewStacks = Object.keys(this._views)
      .map(k => this._views[k])
      .sort(
        (a, b) =>
          b.node.getComponent(UITransformComponent).priority -
          a.node.getComponent(UITransformComponent).priority
      );
    return viewStacks.find(v => v.isDialog && v.node.active);
  }

  public hasVisibleDialog() {
    for (var name in this._views) {
      let view = this._views[name];
      if (view.isDialog) {
        if (this.isVisible(name)) {
          return true;
        }
      }
    }
    return false;
  }

  public isVisible(viewname) {
    let view = null;
    if (typeof viewname == 'string') view = this._views[viewname];
    else view = viewname;
    //todo check type
    if (view) {
      return view.node.active;
    }
    return false;
  }

  view(name) {
    return this._views[name];
  }

  private attachViewComp(existingView: Node): View {
    let viewComp = null;
    if (viewComp == null || viewComp == undefined) {
      viewComp = existingView.getComponent(View);
      if (viewComp == null) {
        viewComp = existingView.addComponent(View);
        viewComp.init(existingView.name);
      }
      this._views[viewComp.name] = viewComp;
    }
    return viewComp;
  }

  setModalOpacity(opacty) {
    let c = this.modal.color;
    this.modal.color = color(c.r, c.g, c.b, opacty);
  }

  private showView(view: View, ...params) {
    this.modalNode.active = view.isDialog;
    //check has popuped dialog and  all currentview is dialog show modal forcely.
    if (this.hasVisibleDialog() || view.isDialog) {
      this.modalNode.active = true;
    }
    if (view.isDialog) {
      this.setModalOpacity(view.opacity);
    }
    this.updateZIndex(view);
    this.audio_show && Device.playEffect(this.audio_show);
    return view.show(...params);
  }

  showFromPrefab(prefab: Prefab, prefabPath: string, ...params) {
    let view = this._views[prefabPath];
    if (view == null) {
      let node = instantiate(prefab);
      if (node == null) {
        throw new Error('Error Occurs While Creating View:' + prefabPath);
      }
      view = node.getComponent(View);
      if (view == null) {
        view = node.addComponent(View);
        view.isDialog = true;
        //default is dialog
      }
      let widget = view.getComponent(WidgetComponent);
      if (widget) widget.target = find('Canvas');
      view.init(prefabPath);
      this._views[prefabPath] = view;
      if (view.isDialog) {
        this.node.addChild(node);
      } else {
        this.node.addChild(node);
      }
    }
    return this.showView(view, ...params);
  }

  showFromPrefabPath(prefabPath: string, ...params) {
    let view = this._views[prefabPath];
    if (view == null || view == undefined) {
      return new Promise<View>((resolve, reject) => {
        resources.load(prefabPath, Prefab, (e, prefab: Prefab) => {
          console.log(TAG, 'prefab loaded : ' + prefabPath);
          this.showFromPrefab(prefab, prefabPath, ...params).then(resolve);
        });
      });
    } else {
      // this.sprite.enabled = false;
      this.modalNode.active = view.isDialog;
      if (this.hasVisibleDialog() || view.isDialog) {
        // this.modal.active = true;
        this.modalNode.active = true;
        this.setModalOpacity(view.opacity);
        // this.modal.opacity = view.opacity;
      }
      // console.log(TAG, "show view:" + prefabPath, params)
      this.updateZIndex(view);
      this.audio_show && Device.playEffect(this.audio_show);
      return view.show(...params);
    }
  }

  preload(prefabPath: string) {
    let view = this._views[prefabPath];
    if (view == null || view == undefined) {
      resources.load(prefabPath, Prefab, (e, prefab: Prefab) => {
        console.log(TAG, 'preload view' + prefabPath);
        let node = instantiate(prefab);
        view = node.getComponent(View);
        let widget = view.getComponent(WidgetComponent);
        if (widget) widget.target = find('Canvas');
        view.init(prefabPath);
        this._views[prefabPath] = view;
        // this.scheduleOnce(_=>node.active = false,0);
        if (view.isDialog) {
          this.node.addChild(node);
        } else {
          this.node.addChild(node);
        }
        view.hide();
      });
    } else {
    }
  }

  // will enableTouch next show up
  disableTouch(viewNode) {
    let view = viewNode.getComponent(View);
    if (view) {
      view.touchEnabled = false;
    }
  }

  enableTouch(viewNode) {
    let view = viewNode.getComponent(View);
    if (view) {
      view.touchEnabled = true;
    }
  }

  show(view, ...params) {
    // disable current view 's touch
    let isDialog = false;
    if (view instanceof Component) {
      let v = view.getComponent(View);
      isDialog = v.isDialog;
    }
    // if (isDialog) {
    for (var i = 0; i < this.node.children.length; i++) {
      let v = this.node.children[i];
      let view = v.getComponent(View);
      if (view) {
        if (view.topMost) {
          v.getComponent(UITransformComponent).priority = 9999;
        } else {
          v.getComponent(UITransformComponent).priority = i * 2;
        }
      } else {
        v.getComponent(UITransformComponent).priority = i;
      }
    }
    // }
    if (typeof view == 'string') {
      return this.showFromPrefabPath(view, ...params);
    } else {
      if (view == null || view == undefined) return;
      if (view.node) view = view.node;
      let v = this.attachViewComp(view);
      return this.showView(v, ...params);
    }
  }

  updateZIndex(view: View) {
    if (!view.topMost) {
      if (view.isDialog) {
        view.node.getComponent(UITransformComponent).priority = 1000;
        this.modalNode.getComponent(UITransformComponent).priority = 999;
      }
    }
  }

  hide(viewname, playHideAnim = true) {
    if (typeof viewname != 'string') {
      // get view name
      if (viewname == null || viewname == undefined) return;
      let v = this.attachViewComp(viewname);
      viewname = v.name;
    }
    let view = this._views[viewname];
    if (view != null && view != undefined) {
      if (view.node.active == false) return;
      view.node.active = false;
      if (view.isDialog) {
        //todo: should support dialog hide animtion  later
        this.modalNode.active = false;
      }
      if (this.hasVisibleDialog()) {
        this.modalNode.active = true;
      }
      // if(view.isInHideAnimation())
      //     return;
      // view.hide();
      if (playHideAnim) {
        view.doHideAnimation();
        view.onHidden();
      } else {
        view.onHidden();
        this.checkViewStacks();
      }

      console.log('[View] hide :' + view.name);
      this.audio_hide && Device.playEffect(this.audio_hide);
      evt.emit(view.node.name + '.onHidden');
      evt.emit('View.onHidden', view);
    }
  }

  checkViewStacks() {
    let dialog = this.getVisibleDialog();
    if (dialog) {
      this.modalNode.active = true;
      this.setModalOpacity(dialog.opacity);
      this.updateZIndex(dialog);
    }
  }

  hideAll() {
    for (var viewname in this._views) {
      // let view = this._views[viewname]
      this.hide(viewname);
    }
  }

  // update (dt) {}
}
