import { _decorator, Component, Collider, Event, ITriggerEvent } from 'cc';
import { PlayerBase } from './PlayerBase';
import { HitBox } from './simpy/HitBox';
const { ccclass, property } = _decorator;

@ccclass('AttackBox')
export class AttackBox extends Component {
    public start () {
        this.node.on(HitBox.EVENT_TYPE, this.onTriggerEnter, this);
    }

    onDestroy(){
        this.node.off(HitBox.EVENT_TYPE, this.onTriggerEnter, this);
    }
    onTriggerEnter(other:HitBox){
        let player = other.getComponent(PlayerBase)
        if(player){
            player.hit()
        }
    }
}


