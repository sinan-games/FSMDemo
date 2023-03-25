import { PlayAniDef } from "../../defs/PlayAniDef";
import { PlayerState } from "../../defs/PlayerStateDef";
import { IAnimationHandler } from "../../listener/AnimationListener";
import { PlayerBase } from "../../PlayerBase";
import { AudioClipType, SoundMgr } from "../../SoundMgr";
import { StateBase } from "./StateBase";

class Hit1 extends StateBase {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        this.player.playAni(PlayAniDef.hit1)
        console.log("hit1")
        SoundMgr.inst.play(AudioClipType.Hit1)
    }
}

class Hit2 extends StateBase {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        this.player.playAni(PlayAniDef.hit2)
        SoundMgr.inst.play(AudioClipType.Hit2)
        console.log("hit2")
    }
}
export class HitState extends SN.FSM.StateMachine implements IAnimationHandler {
    needExitTime: boolean = true;
    constructor(private player:PlayerBase) {
        super();
        this.addState(0,new Hit1(player))
        this.addState(1,new Hit2(player))
    }
    onStartAttack() {
    }
    onEndAttack() {
    }
    onEnd() {
        this.isFinished = true;
        this.player.removeCd();
        this.fsm.requestStateChange(PlayerState.Idle,null,true)
    }
    protected isFinished = false;
    protected lastId = 0;
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        if(this.lastId == 0) this.lastId = 1;
        else this.lastId = 0;
        this.setStartState(this.lastId)
        super.onEnter(prevState,param)
        this.player.addCd();
        this.isFinished = false;
    }

    onExit(nextState:  SN.FSM.IState, param?: any): void {
        super.onExit(nextState,param)
        this.player.removeCd()
    }

    requestExit(): void {
        if(this.isFinished) this.fsm.stateCanExit()
    }

}