import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export interface IAnimationHandler {
    onStartAttack();
    onEndAttack();
    onEnd();
}
@ccclass("AnimationListener")
export class AnimationListener extends Component {
    static create(node: Node, handler: IAnimationHandler) {
        if (node) {
            let listener = node.getComponent(AnimationListener);
            if (!listener) listener = node.addComponent(AnimationListener);
            listener.handler = handler;
        }
    }
    public handler: IAnimationHandler;
    startAttack() {
        // console.log("-------startAttack---------");
        if (this.handler) this.handler.onStartAttack();
    }
    endAttack() {
        //console.log("-------endAttack---------");
        if (this.handler) this.handler.onEndAttack();
    }

    finish() {
        //console.log("-------finish---------");
        if (this.handler) this.handler.onEnd();
    }
}
