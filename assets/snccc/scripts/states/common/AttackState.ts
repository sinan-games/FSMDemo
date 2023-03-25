import { PlayerState } from "../../defs/PlayerStateDef";
import { IAnimationHandler } from "../../listener/AnimationListener";
import { StateBase } from "./StateBase";

export class AttackState extends StateBase implements IAnimationHandler {
    onStartAttack() {
        this.player.addCd();
    }
    onEndAttack() {
        this.player.removeCd();
    }
    onEnd() {
        this.player.removeCd();
        this.fsm.requestStateChange(PlayerState.Idle,null,true)
    }

    onExit(nextState: SN.FSM.IState, param?: any): void {
        this.player.removeCd();
    }

    onEnter(prevState: SN.FSM.IState, param?: any): void {
        this.player.addCd()
    }
}
