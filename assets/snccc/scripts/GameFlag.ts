export class GameFlag {
    constructor(public flag = 0) {}
    addFlag(flag: number) {
        this.flag |= flag;
    }
    hasFlag(flag: number) {
        return (this.flag & flag) != 0; 
    }
    removeFlag(flag: number) {
        if (this.hasFlag(flag)) this.flag &= ~flag;
    }
}
