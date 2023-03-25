import { _decorator, Component, Node, AudioClip, AudioSource } from "cc";
const { ccclass, property } = _decorator;

export var AudioClipType = {
    Attack1: "攻击1",
    Attack2: "攻击2",
    Hit1: "受击1",
    Hit2: "受击2",
    run: "走路1",
    runBack: "走路2",
};

@ccclass("SoundMgr")
export class SoundMgr extends Component {
    @property({ type: AudioClip })
    public clips: AudioClip[] = [];
    protected autoSources: AudioSource[] = [];

    protected useSources: AudioSource[] = [];
    private static mInst: SoundMgr;

    static get inst() {
        return this.mInst;
    }
    onLoad() {
        SoundMgr.mInst = this;
    }
    start() {
        for (let index = 0; index < 10; index++) {
            let as = this.addComponent(AudioSource);
            as.enabled = false;
            this.autoSources.push(as);
        }
    }

    getAudioSource() {
        let source: AudioSource;
        if (this.autoSources.length > 0) {
            source = this.autoSources.pop();
        } else {
            source = this.addComponent(AudioSource);
        }
        this.useSources.push(source);
        return source;
    }

    play(clip: string, isLoop = false) {
        let audioClip = this.clips.find((a) => a.name == clip);
        let source = this.getAudioSource();
        source.clip = audioClip;
        source.play();
        source.loop = isLoop;
        return source;
    }

    stop(source: AudioSource) {
        if (source) {
            source.stop();
        }
    }

    update(dt) {
        // while(this.useSources.length >)
        for (let index = 0; index < this.useSources.length; index++) {
            const element = this.useSources[index];
            if (!element.playing) {
                element.enabled = false;
                this.useSources.splice(index, 1);
                index--;
                this.autoSources.push(element);
            }
        }
    }
}
