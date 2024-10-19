/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/6/6
 * @doc 列表Item组件.
 * 说明：
 *      1、此组件须配合List组件使用。（配套的配套的..）
 * @end
 ******************************************/
const { ccclass, property, disallowMultiple, menu, executionOrder } = _decorator;

import List from './List';
import { Component, EventHandler, SpriteComponent, Node, SpriteFrame, tween, Vec3, v3, ButtonComponent, _decorator } from 'cc';

enum SelectedType {
    NONE = 0,
    TOGGLE = 1,
    SWITCH = 2,
}

function scale(x) {
    return new Vec3(x, x, x);
}

@ccclass
@disallowMultiple()
@menu('自定义组件/List Item')
@executionOrder(-5001)          //先于List
export default class ListItem extends Component {
    //图标
    @property({ type: SpriteComponent, tooltip: CC_DEV && '图标' })
    icon: SpriteComponent = null;
    //标题
    @property({ type: Node, tooltip: CC_DEV && '标题' })
    title: Node = null;
    //选择模式
    @property({
        type: cc.Enum(SelectedType),
        tooltip: CC_DEV && '选择模式'
    })
    selectedMode: SelectedType = SelectedType.NONE;
    //被选标志
    @property({
        type: Node, tooltip: CC_DEV && '被选标志',
        visible() { return this.selectedMode > SelectedType.NONE }
    })
    selectedFlag: Node = null;
    //被选择的SpriteFrame
    @property({
        type: SpriteFrame, tooltip: CC_DEV && '被选择的SpriteFrame',
        visible() { return this.selectedMode == SelectedType.SWITCH }
    })
    selectedSpriteFrame: SpriteFrame = null;
    //未被选择的SpriteFrame
    _unselectedSpriteFrame: SpriteFrame = null;
    //自适应尺寸
    @property({
        tooltip: CC_DEV && '自适应尺寸（宽或高）',
    })
    adaptiveSize: boolean = false;
    //选择
    _selected: boolean = false;
    set selected(val: boolean) {
        this._selected = val;
        if (!this.selectedFlag)
            return;
        switch (this.selectedMode) {
            case SelectedType.TOGGLE:
                this.selectedFlag.active = val;
                break;
            case SelectedType.SWITCH:
                let sp: SpriteComponent = this.selectedFlag.getComponent(SpriteComponent);
                if (sp)
                    sp.spriteFrame = val ? this.selectedSpriteFrame : this._unselectedSpriteFrame;
                break;
        }
    }
    get selected() {
        return this._selected;
    }
    //按钮组件
    private _btnCom: any;
    get btnCom() {
        if (!this._btnCom)
            this._btnCom = this.node.getComponent(ButtonComponent);
        return this._btnCom;
    }
    //依赖的List组件
    public list: List;
    //是否已经注册过事件
    private _eventReg = false;
    //序列id
    public listId: number;

    onLoad() {
        //没有按钮组件的话，selectedFlag无效
        if (!this.btnCom)
            this.selectedMode == SelectedType.NONE;
        //有选择模式时，保存相应的东西
        if (this.selectedMode == SelectedType.SWITCH) {
            let com: SpriteComponent = this.selectedFlag.getComponent(SpriteComponent);
            this._unselectedSpriteFrame = com.spriteFrame;
        }
    }

    onDestroy() {
        let t: any = this;
        t.node.off(Node.EventType.SIZE_CHANGED, t._onSizeChange, t);
    }

    _registerEvent() {
        let t: any = this;
        if (!t._eventReg) {
            if (t.btnCom && t.list.selectedMode > 0) {
                t.btnCom.clickEvents.unshift(t.createEvt(t, 'onClickThis'));
            }
            if (t.adaptiveSize) {
                t.node.on(Node.EventType.SIZE_CHANGED, t._onSizeChange, t);
            }
            t._eventReg = true;
        }
    }

    _onSizeChange() {
        this.list._onItemAdaptive(this.node);
    }


    /**
     * 创建事件
     * @param {Component} component 组件脚本
     * @param {string} handlerName 触发函数名称
     * @param {Node} node 组件所在node（不传的情况下取component.node）
     * @returns EventHandler
     */
    createEvt(component: Component, handlerName: string, node: Node = null) {
        if (!component.isValid)
            return;//有些异步加载的，节点以及销毁了。
        component['comName'] = component['comName'] || component.name.match(/\<(.*?)\>/g).pop().replace(/\<|>/g, '');
        let evt = new EventHandler();
        evt.target = node || component.node;
        evt.component = component['comName'];
        evt.handler = handlerName;
        return evt;
    }

    showAni(aniType: number, callFunc: Function, del: boolean) {
        let acts: any[];
        let tweener = tween(this.node);
        switch (aniType) {
            case 0: //向上消失
                // acts = [
                //     cc.scaleTo(.2, .7),
                //     cc.moveBy(.3, 0, this.node.height * 2),
                // ];
                tweener.to(.2, { scale: scale(.7) }).by(.3, { position: v3(0, this.node.height * 2, 0) })
                break;
            case 1: //向右消失
                // acts = [
                //     cc.scaleTo(.2, .7),
                //     cc.moveBy(.3, this.node.width * 2, 0),
                // ];
                tweener.to(.2, { scale: scale(.7) }).by(.3, { position: v3(this.node.width * 2, 0, 0) })
                break;
            case 2: //向下消失
                // acts = [
                //     cc.scaleTo(.2, .7),
                //     cc.moveBy(.3, 0, this.node.height * -2),
                // ];
                tweener.to(.2, { scale: scale(.7) }).by(.3, { position: v3(0, this.node.height * -2, 0) })
                break;
            case 3: //向左消失
                // acts = [
                //     cc.scaleTo(.2, .7),
                //     cc.moveBy(.3, this.node.width * -2, 0),
                // ];
                tweener.to(.2, { scale: scale(.7) }).by(.3, { position: v3(this.node.width * -2, 0, 0) })
                break;
            default: //默认：缩小消失
                // acts = [
                //     cc.scaleTo(.3, .1),
                // ];
                tweener.to(.3, { scale: scale(.1) })
                break;
        }
        if (callFunc || del) {

            tweener.call(_ => {
                if (del) {
                    this.list._delSingleItem(this.node);
                    for (let n: number = this.list.displayData.length - 1; n >= 0; n--) {
                        if (this.list.displayData[n].id == this.listId) {
                            this.list.displayData.splice(n, 1);
                            break;
                        }
                    }
                }
                callFunc();
            });
        }
        // this.node.runAction(cc.sequence(acts));
        tweener.start();
    }

    onClickThis() {
        this.list.selectedId = this.listId;
    }

}
