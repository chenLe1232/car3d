import { SpriteFrame, loader, ImageAsset, assetManager, resources } from "cc";

export default class SpriteFrameCache {
    static _instance: SpriteFrameCache;

    static get instance() {
        if (this._instance == null) {
            this._instance = new SpriteFrameCache();
        }
        return this._instance;
    }

    private frames: { [index: string]: SpriteFrame } = {};
    getSpriteFrame(url: string): Promise<SpriteFrame> {
        let frame = this.frames[url]
        if (frame == null) {
            return new Promise<SpriteFrame>((resolve, reject) => {
                // console.log("[SpriteFrameCache] request image:" + url)
                if (!url || url == "") {
                    reject("empty-url")
                    return;
                }
                if (url.indexOf("http") == -1) {
                    resources.loadDir(url, (SpriteFrame), (error, spriteFrames: SpriteFrame[]) => {
                        if (error) { reject(error); return }
                        if (spriteFrames && spriteFrames.length > 0) {
                            let frame = spriteFrames[0]
                            this.addSpriteFrame(url, spriteFrames[0])
                            resolve(frame);
                            // let frame = new SpriteFrame();
                            // frame.texture = image._texture;
                            // frame._imageSource = image;
                            // this.addSpriteFrame(url, frame)
                            // resolve(frame)
                        } else {
                            reject("path not found: " + url)
                        }
                    })
                } else {
                    //{ url: url, type: '.png' }
                    assetManager.loadRemote(url, { type: '.png' }, (error, image: ImageAsset) => {
                        if (error) { reject(error); return }
                        if (image) {
                            frame = new SpriteFrame();
                            frame.texture = image._texture;
                            frame._imageSource = image;
                            this.addSpriteFrame(url, frame)
                            resolve(frame)
                        } else {
                            reject("frameNull")
                        }
                    });
                }
            })
        }
        return new Promise<SpriteFrame>((resolve, reject) => resolve(frame));

    }

    addSpriteFrame(url: string, frame: any): any {
        this.frames[url] = frame;
        return frame;
    }


    clear() {
        for (var k in this.frames) {
            let frame = this.frames[k]
            assetManager.releaseAsset(frame);
            delete this.frames[k]
        }
    }

    remove(k) {
        let frame = this.frames[k]
        assetManager.releaseAsset(frame);
        delete this.frames[k]
    }

}