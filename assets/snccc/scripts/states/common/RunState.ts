import { PlayAniDef } from "../../defs/PlayAniDef";
import { StateBase } from "./StateBase";

export class RunState extends StateBase {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        let ani = this.player.moveX == 1 ? PlayAniDef.runBack : PlayAniDef.run;
        this.player.playAni(PlayAniDef.run)
        this.player.playAni(ani)
    }
}