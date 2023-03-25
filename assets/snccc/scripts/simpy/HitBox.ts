import {
    Component,
    Enum,
    math,
    SphereCollider,
    v3,
    Vec3,
    _decorator,
} from "cc";
const { ccclass, property, requireComponent } = _decorator;

export enum HitType {
    Player = 1,
    Enemy = 2,
}
export class TriggerInfo {
    self: HitBox;
    other: HitBox;
}

@ccclass
@requireComponent(SphereCollider)
export class HitBox extends Component {
    static EVENT_TYPE = "hitBoxTriggerEnter";
    static hitBoxs: HitBox[] = [];
    static cur_checks: TriggerInfo[] = [];

    static destory() {
        this.hitBoxs = [];
        this.cur_checks = [];
    }

    static tempV3_1 = v3();
    static tempV3_2 = v3();
    static m_removeTriggers:TriggerInfo[] = []
    static checkAll() {
        this.m_removeTriggers.length = 0
        for (let index = 0; index < this.hitBoxs.length; index++) {
            const my = this.hitBoxs[index];
            for (let j = 0; j < this.hitBoxs.length; j++) {
                const other = this.hitBoxs[j];

                if (my.tag == other.tag) {
                    continue;
                }
                let findIndex = this.cur_checks.findIndex(
                    (v) =>
                        (v.self == my && v.other == other) ||
                        (v.other == my && v.self == other)
                );
                if (!my.enabled || !other.enabled) {
                    if (findIndex != -1) {
                         //离开
                         this.cur_checks.splice(findIndex, 1);
                         this.m_removeTriggers.push(this.cur_checks[findIndex]);
                    }
                    continue;
                }

                // let find = this.findTriggerInfo(my, other);
                Vec3.add(this.tempV3_1, my.node.worldPosition, my.offset);
                Vec3.add(this.tempV3_2, other.node.worldPosition, other.offset);

                let dis =
                    Vec3.distance(this.tempV3_1, this.tempV3_2) -
                    (my.radius + other.radius);
                if (findIndex == -1) {
                    if (dis <= 0) {
                        //进入
                        let info = new TriggerInfo();
                        info.self = my;
                        info.other = other;
                        this.cur_checks.push(info);
                        console.log(
                            "碰撞到了",
                            my.node.name,
                            other.node.name,
                            dis
                        );
                        my.node.emit(this.EVENT_TYPE, other);
                        other.node.emit(this.EVENT_TYPE, my);
                    }
                } else {
                    if (dis > 0) {
                        //console.log("离开", my.node.name, other.node.name, dis);
                        //离开
                         this.m_removeTriggers.push(this.cur_checks[findIndex]);
                         //this.cur_checks.splice(findIndex, 1);
                    }
                }
            }
        }
        while(true){
            if(this.m_removeTriggers.length == 0) break;
            let info = this.m_removeTriggers.pop()
            let index = this.cur_checks.findIndex(v=>v == info)
            if(index != -1) this.cur_checks.splice(index,1)
        }
    }

    static add(hitBox: HitBox) {
        if (this.hitBoxs.findIndex((a) => hitBox == a) == -1)
            this.hitBoxs.push(hitBox);
    }

    static remove(hitBox: HitBox) {
        let index = this.hitBoxs.findIndex((a) => hitBox == a);
        if (index != -1) {
            this.hitBoxs.splice(index, 1);
        }
    }

    /**
     * 标签
     */
    @property({ displayName: "标签", type: Enum(HitType) })
    tag: HitType = HitType.Enemy;

    protected radius: number = 0;

    protected offset: Vec3 = v3();
    onLoad() {
        let s = this.getComponent(SphereCollider);
        // s.enabled = false;
        this.radius = s.radius;
        this.offset = s.center;
        HitBox.hitBoxs.push(this);
    }

    onDestroy() {
        HitBox.remove(this);
    }
}
