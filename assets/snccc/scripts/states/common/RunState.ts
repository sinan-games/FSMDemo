import { AudioSource } from "cc";
import { PlayAniDef } from "../../defs/PlayAniDef";
import { AudioClipType, SoundMgr } from "../../SoundMgr";
import { StateBase } from "./StateBase";

export class RunState extends StateBase {
    protected source: AudioSource;

    onEnter(prevState: SN.FSM.IState, param?: any): void {
        let ani = this.player.moveX > 0 ? PlayAniDef.runBack : PlayAniDef.run;
        // this.player.playAni(PlayAniDef.run)
        this.player.playAni(ani);
        this.source = SoundMgr.inst.play(
            this.player.moveX > 0 ? AudioClipType.runBack : AudioClipType.run,
            true
        );
    }

    onExit(nextState: SN.FSM.IState, param?: any): void {
        super.onExit(nextState, param);
        if (this.source) {
            SoundMgr.inst.stop(this.source);
            this.source = null;
        }
    }
}
