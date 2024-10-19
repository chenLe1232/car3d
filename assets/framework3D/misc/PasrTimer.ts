// PasrTimer
export class PasrTimer {
    private stage: number = 0;

    private stageTime: number[] = [];

    private timer: number = 0;

    private value: number = 0;

    private queriedSustain: boolean = false;

    private queriedRelease: boolean = false;

    private queriedFinished: boolean = false;

    public constructor(pause: number = 0, attack: number = 0, sustain: number = 0, release: number = 0) {
        this.stageTime = new Array
        this.stageTime[0] = pause;
        this.stageTime[1] = attack;
        this.stageTime[2] = sustain;
        this.stageTime[3] = release;
        this.stage = 4;
        this.queriedFinished = true;
    }

    set p(v) {
        this.stageTime[0] = v;
    }

    get p() {
        return this.stageTime[0]
    }

    set a(v) {
        this.stageTime[1] = v;
    }

    get a() {
        return this.stageTime[1]
    }

    set s(v) {
        this.stageTime[2] = v;
    }

    get s() {
        return this.stageTime[2]
    }

    set r(v) {
        this.stageTime[3] = v;
    }

    get r() {
        return this.stageTime[3]
    }



    public setStateTime(timeIndex, time) {
        this.stageTime[timeIndex] = time;
    }

    public Tick(deltaTime: number): number {
        if (this.stage == 4) {
            this.value = 0;
            return 0;
        }
        while (this.stage < 4 && (this.timer >= 1 || this.stageTime[this.stage] == 0)) {
            this.timer = 0;
            this.stage++;
        }
        if (this.stage < 4) {
            this.timer += deltaTime / this.stageTime[this.stage];
            if (this.timer > 1) {
                this.timer = 1;
            }
        }
        if (this.stage == 0) {
            this.value = 0;
        }
        else if (this.stage == 1) {
            this.value = this.timer;
        }
        else if (this.stage == 2) {
            this.value = 1;
        }
        else if (this.stage == 3) {
            this.value = 1 - this.timer;
        }
        else {
            this.value = 0;
        }
        return this.value;
    }

    public GetValue(): number {
        return this.value;
    }

    public reachedSustain(): boolean {
        if (this.queriedSustain) {
            return false;
        }
        if (this.stage >= 2) {
            this.queriedSustain = true;
            return true;
        }
        return false;
    }

    public reachedRelease(): boolean {
        if (this.queriedRelease) {
            return false;
        }
        if (this.stage >= 3) {
            this.queriedRelease = true;
            return true;
        }
        return false;
    }

    public isFinished(): boolean {
        return this.stage == 4;
    }

    public reachedFinished(): boolean {
        if (this.stage == 4 && !this.queriedFinished) {
            this.queriedFinished = true;
            return true;
        }
        return false;
    }

    public reset(): void {
        this.stage = 0;
        this.timer = 0;
        this.value = 0;
        this.queriedSustain = false;
        this.queriedFinished = false;
    }

    public Stop(): void {
        this.stage = 4;
    }

    public GetStage(): number {
        return this.stage;
    }

    public SetStage(stage: number): void {
        this.stage = stage;
        this.timer = 0;
    }

    public TotalTime(): number {
        return this.stageTime[0] + this.stageTime[1] + this.stageTime[2] + this.stageTime[3];
    }
}
