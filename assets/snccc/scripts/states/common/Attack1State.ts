import { PlayAniDef } from "../../defs/PlayAniDef";
import { AudioClipType, SoundMgr } from "../../SoundMgr";
import { AttackState } from "./AttackState";

export class Attack1State extends AttackState {
    onEnter(prevState: SN.FSM.IState, param?: any): void {
        super.onEnter(prevState,param)
        this.player.playAni(PlayAniDef.attack1);
        SoundMgr.inst.play(AudioClipType.Attack1)
    }

    onStartAttack(): void {
        super.onStartAttack();
        this.player.leftAttack.enabled = true;
    }

    onEndAttack(): void {
        super.onEndAttack();
        this.player.leftAttack.enabled = false;
    }
}
