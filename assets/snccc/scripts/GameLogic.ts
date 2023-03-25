import { _decorator, Component, Node } from "cc";
import { HitBox } from "./simpy/HitBox";
const { ccclass, property } = _decorator;

@ccclass("GameLogic")
export class GameLogic extends Component {
    onDestroy(){
        HitBox.destory();
    }

    update() {
        HitBox.checkAll();
    }
}
