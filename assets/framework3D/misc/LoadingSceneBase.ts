import {
  _decorator,
  Component,
  Node,
  Prefab,
  LabelComponent,
  ProgressBarComponent,
  director,
  loader,
  instantiate,
  find,
  isValid,
  resources,
} from 'cc';
import Platform from '../extension/Platform';
const { ccclass, property } = _decorator;

let targetScene!: string;
@ccclass
export default class LoadingSceneBase extends Component {
  static param: any = null;
  static ResPrefab: Prefab = null;

  @property
  defaultSceneName: string = 'Home';

  @property(LabelComponent)
  label!: LabelComponent;

  @property(LabelComponent)
  private percentLabel!: LabelComponent;

  @property(ProgressBarComponent)
  private bar!: ProgressBarComponent;

  onLoad() {
    targetScene = targetScene || this.defaultSceneName;
  }
  start() {
    this.bar.progress = 0;
    this.label.string = '加载中...';
  }

  set progress(p) {
    if (this.bar) {
      this.bar.progress = p;
      this.percentLabel.string = Math.floor(p * 100) + '%';
    }
  }

  loadNextScene(prefabTobeLoad?) {
    targetScene = targetScene || this.defaultSceneName;
    this.label.string = '加载场景资源';
    return new Promise((resolve, reject) => {
      director.preloadScene(
        targetScene,
        (c, t, i) => {
          this.percentLabel.string = `${((c / t) * 100).toFixed(1)}%`;
          this.bar.progress = c / t;
        },
        _ => {
          // evt.emit("SceneChange")
          if (prefabTobeLoad) {
            resources.load(prefabTobeLoad, Prefab, (err, prefab: Prefab) => {
              director.loadScene(
                targetScene,
                _ => {
                  let node = instantiate(prefab);
                  director.getScene().addChild(node);
                  resolve();
                  this.onLoadFinished();
                },
                null
              );
            });
          } else {
            director.loadScene(
              targetScene,
              _ => {
                resolve();
                this.onLoadFinished();
              },
              null
            );
          }
        }
      );
    });
  }

  onLoadFinished(node?) {
    let root = find('Canvas');
    if (root) {
      root.getComponents(Component).forEach((v: any) => {
        if (v.onLoadFinished) {
          v.onLoadFinished(LoadingSceneBase.param, node);
        }
      });
    }
  }

  async loadSubPackage(packageName, txt) {
    if (!isValid(this)) return;
    if (this.label) {
      this.label.string = txt;
    }
    await Platform.loadSubPackage(packageName, (p, k, t) => {
      this.progress = p / 100;
    });
  }

  static setNextScene(scene) {
    targetScene = scene;
  }

  static getNextScene() {
    return targetScene;
  }

  static goto(sceneName, loadingSceneName = 'LoadingScene', param = null) {
    LoadingSceneBase.param = param;
    targetScene = sceneName;
    director.loadScene(loadingSceneName, null, null);
  }
}
