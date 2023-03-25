import { PlayAniDef } from "../../defs/PlayAniDef";
import { StateBase } from "./StateBase";

export class IdleState extends StateBase {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        this.player.crossFade(PlayAniDef.Idle,0.5)
    }
}