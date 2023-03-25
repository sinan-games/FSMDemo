import { Animation, Component, RigidBody, v3, Vec3, _decorator } from "cc";
import { PlayAniDef } from "./defs/PlayAniDef";
import { PlayerState } from "./defs/PlayerStateDef";
import { GameFlag } from "./GameFlag";
import { AnimationListener, IAnimationHandler } from "./listener/AnimationListener";
import { HitBox } from "./simpy/HitBox";
import { Attack1State } from "./states/common/Attack1State";
import { Attack2State } from "./states/common/Attack2State";
import { HitState } from "./states/common/HitState";
import { IdleState } from "./states/common/IdleState";
import { RunState } from "./states/common/RunState";
const { ccclass, property } = _decorator;

export var InputType = {
    A: 1 << 0,
    D: 1 << 1,
    J: 1 << 2,
};

export var PlayFlagType = { CoolDown: 1 << 0 };

@ccclass("PlayerBase")
export class PlayerBase extends Component implements IAnimationHandler {
    onStartAttack() {
        // this.leftAttack.enabled = true;
        // this.rightAttack.enabled = true;
        if (this.fsm.activeState) {
            if (this.fsm.activeState["onStartAttack"]) this.fsm.activeState["onStartAttack"]();
        }
    }
    onEndAttack() {
        this.leftAttack.enabled = false;
        this.rightAttack.enabled = false;
        if (this.fsm.activeState) {
            if (this.fsm.activeState["onEndAttack"]) this.fsm.activeState["onEndAttack"]();
        }
    }
    onEnd() {
        if (this.fsm.activeState) {
            if (this.fsm.activeState["onEnd"]) this.fsm.activeState["onEnd"]();
        }
    }
    protected rig: RigidBody;
    ani: Animation;
    private velocity: Vec3 = v3();
    protected keyFlag = new GameFlag();
    protected playStateFlag = new GameFlag();

    protected fsm: SN.FSM.StateMachine;

    moveX = 0;

    public moveSpeed = 1.5;

    @property({ type: HitBox })
    public leftAttack: HitBox = null;
    @property({ type: HitBox })
    public rightAttack: HitBox = null;
    onLoad() {
        let model = this.node.getChildByName("Model");
        this.rig = this.getComponent(RigidBody);
        this.ani = model.getComponent(Animation);
        this.fsm = new SN.FSM.StateMachine();
        this.rig.getLinearVelocity(this.velocity);
        this.fsm.addState(PlayerState.Idle, new IdleState(this));
        this.fsm.addState(PlayerState.Run, new RunState(this));
        this.fsm.addState(PlayerState.Hit, new HitState(this));
        this.fsm.addState(PlayerState.Attack1, new Attack1State(this));
        this.fsm.addState(PlayerState.Attack2, new Attack2State(this));
        this.regState();
        this.fsm.setStartState(PlayerState.Idle);

        this.fsm.addTransition(PlayerState.Idle, PlayerState.Run, () => {
            return this.moveX != 0;
        });

        AnimationListener.create(model, this);

        this.fsm.addTransition(PlayerState.Run, PlayerState.Idle, () => {
            return this.moveX * this.moveX <= 0.001;
        });
    }
    start() {
        this.leftAttack.enabled = false;
        this.rightAttack.enabled = false;
        this.ani.play(PlayAniDef.Idle);
        this.onStart();
        this.fsm.init();
    }

    playAni(ani: string) {
        this.ani.play(ani);
    }

    crossFade(ani: string, t: number) {
        // this.ani.stop()
        this.ani.crossFade(ani,t)
       // this.ani.play(ani);
    }

    addCd() {
        this.playStateFlag.addFlag(PlayFlagType.CoolDown);
    }
    removeCd() {
        this.playStateFlag.removeFlag(PlayFlagType.CoolDown);
    }

    update(dt) {
        this.onCheckIput();
        this.handleInput();
        this.move();
        this.fsm.onUpdate(dt);
        this.keyFlag.flag = 0;
    }

    handleInput() {
        this.moveX = 0;
        if (!this.playStateFlag.hasFlag(PlayFlagType.CoolDown)) {
            if (this.keyFlag.hasFlag(InputType.J)) {
                if (this.fsm.activeID == PlayerState.Attack1) {
                    this.fsm.changeState(PlayerState.Attack2);
                } else {
                    this.fsm.changeState(PlayerState.Attack1);
                }
            } else if (this.keyFlag.hasFlag(InputType.A)) {
                this.moveX = 1;
            } else if (this.keyFlag.hasFlag(InputType.D)) {
                this.moveX = -1;
            }
        }
    }

    move() {
        this.velocity.x = this.moveX * this.moveSpeed;
        let x = this.velocity.x * this.velocity.x;

        if (x <= 0.05) {
            this.velocity.x = 0;
        }
        if (this.playStateFlag.hasFlag(PlayFlagType.CoolDown)) {
            this.velocity.x = 0;
        }

        this.rig.setLinearVelocity(this.velocity);
    }

    hit() {
        this.fsm.changeState(PlayerState.Hit);
    }

    protected onStart() {}
    protected regState() {}
    protected onCheckIput() {}
}
