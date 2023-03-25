import { PlayAniDef } from "../../defs/PlayAniDef";
import { AttackState } from "./AttackState";
import { StateBase } from "./StateBase";

export class Attack2State extends AttackState {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        super.onEnter(prevState,param)
        this.player.playAni(PlayAniDef.attack2)
    }


    onStartAttack(): void {
        super.onStartAttack();
        this.player.rightAttack.enabled = true;
    }

    onEndAttack(): void {
        super.onEndAttack();
        this.player.rightAttack.enabled = false;
    }
}