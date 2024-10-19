
import DataCenter, { dc, field } from "../../../framework3D/core/DataCenter";

@dc("Sov")
export default class SovInfoDC extends DataCenter {

    sovInvokeCounts: { [index: string]: number } = {}

    onLoadAll() {

    }

    getCount(keySov: string) {
        let c = this.sovInvokeCounts[keySov]
        if (c == null) {
            c = 0
            this.sovInvokeCounts[keySov] = c;
        }
        return c;
    }

    invoke(keySov: string) {
        let c = this.getCount(keySov);
        this.sovInvokeCounts[keySov] = ++c;
        this.save();
    }
}
export let SovInfo: SovInfoDC = DataCenter.register(SovInfoDC);
