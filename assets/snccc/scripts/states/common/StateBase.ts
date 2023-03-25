import { PlayAniDef } from "../../defs/PlayAniDef";
import { PlayerBase } from "../../PlayerBase";

export class StateBase<T extends PlayerBase = PlayerBase> extends SN.FSM
    .StateBase { 
        needExitTime: boolean = false;
    constructor(protected player:T) {
        super();
    }
}
