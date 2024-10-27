import {
  AnimationComponent,
  ButtonComponent,
  ToggleComponent,
  Node,
  AnimationState,
} from 'cc';

export default class UIFunctions {
  static getChildrenAnimations(node): AnimationComponent[] {
    let animations: AnimationComponent[] = [];
    var anim = node.getComponent(AnimationComponent);
    if (anim) animations.push(anim);
    for (var i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      var anim = child.getComponent(AnimationComponent);
      if (anim) animations.push(anim);
    }
    return animations;
  }

  static stopAnimations(animations) {
    animations.forEach((anim: AnimationComponent) => {
      anim.stop();
    });
  }

  static doShowAnimations(animations, finishCallback?: Function, target?) {
    let maxDuration = 0;
    let maxDurationAnimation: AnimationComponent;
    animations.forEach((anim: AnimationComponent) => {
      let clips = anim.clips;
      if (clips.length > 0) {
        let clip = clips[0];
        anim.play(clip.name);
        let animState = anim.getState(clip.name);
        animState.wrapMode = 1;
        if (clip.duration > maxDuration) {
          maxDuration = clip.duration;
          maxDurationAnimation = anim;
        }
      }
    });
    if (finishCallback) {
      let func = function () {
        // console.log("finish animations")
        if (maxDurationAnimation) maxDurationAnimation.off('finished', func);
        finishCallback.call(target);
      };
      if (maxDurationAnimation) maxDurationAnimation.on('finished', func);
      else finishCallback.call(target);
    }
  }

  // static getLongestAnimation(animations)
  // {
  //     animations.forEach((anim:AnimationComponent)=>{
  //         let clips = anim.getClips()
  //         for (clips)

  //         //以最长的为准
  //     }
  // }

  //TODO:还未实现
  static isAnimationRunning(animations: AnimationComponent[]): any {
    return false;
  }

  static doHideAnimations(animations, finishCallback?: Function, target?) {
    let hasHideAnimation = false;
    let maxDuration = 0;
    let maxDurationAnimation: AnimationComponent;
    animations.forEach((anim: AnimationComponent) => {
      let clips = anim.clips;
      if (clips.length == 2) {
        let clip = clips[clips.length - 1];
        // anim.on("finished",onHideAnimationFinished)
        hasHideAnimation = true;
        anim.play(clip.name);
        if (clip.duration > maxDuration) {
          maxDuration = clip.duration;
          maxDurationAnimation = anim;
        }
      } else if (clips.length == 1) {
        let clip = clips[0];
        hasHideAnimation = true;
        anim.play(clip.name);
        let animState = anim.getState(clip.name);
        animState.wrapMode = 36;
        if (clip.duration > maxDuration) {
          maxDuration = clip.duration;
          maxDurationAnimation = anim;
        }
      }
    });
    if (maxDurationAnimation && finishCallback) {
      let func = function () {
        // console.log("finish animations")
        maxDurationAnimation.off('finished', func);
        finishCallback.call(target);
      };
      maxDurationAnimation.on('finished', func);
    }
    return hasHideAnimation;
  }

  static getToggleIndex(toggle: ToggleComponent) {
    let container = toggle.node.getParent();
    for (var i = 0; i < container.children.length; i++) {
      let child = container.children[i];
      if (toggle.node == child) {
        return i;
      }
    }
    return -1;
  }

  static selectToggleIndex(toggleContainer: Node, index) {
    if (toggleContainer == null) {
      console.warn(
        '[UIFunction.selectToggleIndex] : invalid toggleContainer :'
      );
      return;
    }
    let toggleNode = toggleContainer.children[index];
    if (toggleNode) {
      let toggle = toggleNode.getComponent(ToggleComponent);
      if (toggle) {
        // console.log("[UIFunction.selectToggleIndex] :" + index)
        toggle.check();
      }
    } else {
      console.warn(
        '[UIFunction.selectToggleIndex] :cannot find toggle with index:' + index
      );
    }
  }
}
