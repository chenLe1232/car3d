import {
  _decorator,
  Component,
  Node,
  SpriteComponent,
  SpriteFrame,
  EventTouch,
  Vec3,
  EventMouse,
  SystemEvent,
  UITransform,
  AudioSourceComponent,
  Label,
  tween,
  Color,
  Vec2,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Typescript')
export class Typescript extends Component {
  @property(Node)
  public spriteFrame: Node = null!;

  @property(AudioSourceComponent)
  public audioSource: AudioSourceComponent = null!;

  private lastClickTime: number = 0; // 上次点击时间
  private clickCount: number = 0; // 点击次数
  private currentFillRange: number = 0; // 当前填充值
  private readonly CLICK_THRESHOLD = 2000; // 点击间隔阈值（毫秒）
  private readonly MAX_CLICKS = 100; // 达到最大值所需的点击次数
  private readonly MIN_CLICK_INTERVAL = 200; // 最小点击间隔（毫秒）

  private isAudioPlaying: boolean = false;
  private audioCheckTimer: number | null = null;
  private toastNode: Node | null = null;

  protected onLoad(): void {
    console.log('onLoad', this.node.name);
    console.log('spriteFrame', this.spriteFrame.getComponent(SpriteComponent));

    // 注册触摸事件
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    // 初始化音频
    if (this.audioSource) {
      this.audioSource.loop = true;
    }

    // 创建Toast节点
    this.createToastNode();
  }

  private createToastNode(): void {
    // 创建Toast节点
    this.toastNode = new Node('Toast');
    this.toastNode.layer = this.node.layer; // 确保在同一层级

    // 添加UI变换组件
    const transform = this.toastNode.addComponent(UITransform);
    transform.setContentSize(300, 80);

    // 添加Label组件
    const label = this.toastNode.addComponent(Label);
    label.string = '恭喜完成!';
    label.fontSize = 40;
    label.lineHeight = 40;
    label.color = new Color(255, 255, 255, 255);

    // 设置初始位置（屏幕中心偏上）
    const canvas = this.node.parent;
    if (canvas) {
      canvas.addChild(this.toastNode);
      const canvasSize = canvas.getComponent(UITransform)?.contentSize;
      if (canvasSize) {
        this.toastNode.setPosition(0, canvasSize.height * 0.2 + 200, 0);
      }
    }

    // 默认隐藏
    this.toastNode.active = false;
  }

  private showToast(): void {
    if (!this.toastNode) return;

    // 显示节点
    this.toastNode.active = true;

    // 重置属性
    this.toastNode.setScale(new Vec3(0.5, 0.5, 1));
    this.toastNode.getComponent(Label)!.color = new Color(255, 255, 255, 255);

    // 创建动画序列
    tween(this.toastNode)
      .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
      .delay(0.8)
      .to(0.2, { scale: new Vec3(0.8, 0.8, 1) })
      .call(() => {
        // 动画结束后隐藏节点
        this.toastNode!.active = false;
      })
      .start();

    // 创建颜色渐变动画
    const label = this.toastNode.getComponent(Label)!;
    tween(label.color).to(1.2, { a: 0 }, { easing: 'fade' }).start();
  }

  private startAudioCheck(): void {
    // 清除之前的计时器
    if (this.audioCheckTimer !== null) {
      clearTimeout(this.audioCheckTimer);
    }

    // 设置新的计时器
    this.audioCheckTimer = setTimeout(() => {
      this.stopAudio();
    }, this.CLICK_THRESHOLD) as unknown as number;
  }

  private playAudio(): void {
    console.log(
      'playAudio',
      this.isAudioPlaying,
      this.currentFillRange,
      this.audioSource
    );
    if (this.audioSource && !this.isAudioPlaying && this.currentFillRange < 1) {
      console.log('%c 开始播放音频', 'color: green');
      this.audioSource.play();
      this.isAudioPlaying = true;
    }
  }

  private stopAudio(): void {
    if (this.audioSource && this.isAudioPlaying) {
      this.audioSource.stop();
      this.isAudioPlaying = false;
    }
  }

  private onTouchStart(event: EventTouch): void {
    this.playAudio();
  }

  private onTouchEnd(event: EventTouch): void {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - this.lastClickTime;

    console.log('点击间隔:', timeSinceLastClick);

    // 如果点击间隔太短，忽略此次点击
    if (timeSinceLastClick < this.MIN_CLICK_INTERVAL) {
      return;
    }

    // 重置连击计数如果间隔太长
    if (timeSinceLastClick > this.CLICK_THRESHOLD) {
      this.clickCount = 0;
    }

    // 增加点击计数
    this.clickCount = Math.min(this.clickCount + 1, this.MAX_CLICKS);

    // 计算新的fillRange值
    this.updateFillRange();

    // 更新最后点击时间
    this.lastClickTime = currentTime;

    // 处理音频逻辑
    this.startAudioCheck();

    // 如果进度达到1，停止音频并显示Toast
    if (this.currentFillRange >= 1) {
      this.stopAudio();
      this.showToast();
    }

    console.log(
      '当前点击次数:',
      this.clickCount,
      '当前填充值:',
      this.currentFillRange
    );
  }

  private updateFillRange(): void {
    // 基于点击次数计算填充值
    const baseProgress = this.clickCount / this.MAX_CLICKS;

    // 计算点击频率加成（可选）
    const timeSinceLastClick = Date.now() - this.lastClickTime;
    const frequencyBonus =
      Math.max(0, 1 - timeSinceLastClick / this.CLICK_THRESHOLD) * 0.2;

    // 合并基础进度和频率加成
    this.currentFillRange = Math.min(baseProgress + frequencyBonus, 1);
    this.setFillRange(this.currentFillRange);
  }

  private setFillRange(value: number) {
    const spriteComponent = this.spriteFrame.getComponent(SpriteComponent);
    if (!spriteComponent) return;
    spriteComponent.fillRange = value;
  }

  protected onDestroy(): void {
    // 移除事件监听
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    // 停止音频
    this.stopAudio();

    // 清除计时器
    if (this.audioCheckTimer !== null) {
      clearTimeout(this.audioCheckTimer);
    }

    // 清理Toast节点
    if (this.toastNode) {
      this.toastNode.destroy();
    }
  }
}
