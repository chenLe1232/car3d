import {
  _decorator,
  Component,
  AnimationComponent,
  instantiate,
  Node,
} from 'cc';
import { evt } from '../framework3D/core/EventManager';
import MergePanel from './MergePanel';
import MergeGrid from './MergeGrid';
import MergeOutput from './MergeOutput';

const { ccclass, property, menu, disallowMultiple } = _decorator;

@ccclass('MergeLayout')
@disallowMultiple()
export default class MergeLayout extends Component {
  animation: AnimationComponent = null;

  slot_count: number = 12;

  @property(Node)
  outputLayer: Node = null;

  onLoad() {
    this.animation = this.getComponent(AnimationComponent);
    if (this.animation) this.animation.on('finished', this.onFinishPlay, this);

    let template = this.node.children[0];
    let template_output = this.outputLayer.children[0];
    if (template) {
      let grid = template.addComponent(MergeGrid);
      grid.index = 0;
      grid.output = template_output.addComponent(MergeOutput);
      for (var i = 1; i < this.slot_count; i++) {
        let node = instantiate(template) as Node;
        let node_output = instantiate(template_output) as Node;
        this.node.addChild(node);
        this.outputLayer.addChild(node_output);
        let grid = node.getComponent(MergeGrid);
        node.name = i.toString();
        node_output.name = node.name;
        grid.output = node_output.addComponent(MergeOutput);
        grid.index = i;
      }
    } else {
      console.error('[QMergeLayout]: template not found !');
    }
  }

  onFinishPlay(evt) {
    MergePanel.main.fitToGrids();
  }

  start() {}

  layout(map: number[]) {
    let c = map.reduce((s, v) => s + (v >= 0 ? 1 : 0), 0);
    this.animation && this.animation.play(c + '');
  }
}
