import { EventKeyboard, Input, input, KeyCode, _decorator } from "cc";
import { GameFlag } from "./GameFlag";
import { InputType, PlayerBase, PlayFlagType } from "./PlayerBase";
const { ccclass, property } = _decorator;
@ccclass("PlayerController")
export class PlayerController extends PlayerBase {
    protected tempInputFlag = new GameFlag();

    onStart() {
        super.onStart();
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.tempInputFlag.flag = 0;
    }

    onCheckIput() {
        super.onCheckIput();
        this.keyFlag.flag = this.tempInputFlag.flag;
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.tempInputFlag.addFlag(InputType.A);
                break;
            case KeyCode.KEY_D:
                this.tempInputFlag.addFlag(InputType.D);
                break;
            case KeyCode.KEY_J:
                this.tempInputFlag.addFlag(InputType.J);
                break;
        }
    }
    onKeyUp(event: EventKeyboard){
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.tempInputFlag.removeFlag(InputType.A);
                break;
            case KeyCode.KEY_D:
                this.tempInputFlag.removeFlag(InputType.D);
                break;
            case KeyCode.KEY_J:
                this.tempInputFlag.removeFlag(InputType.J);
                break;
        }
    }
}

