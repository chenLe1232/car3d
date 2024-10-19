import ccUtil from "../utils/ccUtil";
import { AudioClip, loader, resources, sys } from "cc";

export default class Device {

    static isSfxEnabled = true;

    static isBgmEnabled = true;
    static isVibrateEnabled = true;

    static audio_path = "Audio/"

    static setSoundsEnable(b: boolean) {
        Device.setSFXEnable(b)
        Device.setBGMEnable(b);
    }

    static setSFXEnable(b) {
        Device.isSfxEnabled = b;
    }

    static setVibrateEnable(b) {
        this.isVibrateEnabled = b;
    }

    static setBGMEnable(b) {
        Device.isBgmEnabled = b;
        if (!b) {
            this.bgm_clip && this.bgm_clip.pause();
        } else {
            this.bgm_clip && this.bgm_clip.play();
        }
    }

    static _clips: { [index: string]: AudioClip } = {}

    static playSfx(url, loop = false, volume = 1) {
        this.stopSfx(url);
        if (!Device.isSfxEnabled) { return }
        url = Device.audio_path + url;
        resources.load(url, AudioClip, (err, clip: AudioClip) => {
            if (err)
                console.warn(err)
            else {
                this._clips[url] = clip;
                this.playEffect(clip, loop, volume);
            }
        });
    }

    static stopSfx(url) {
        let clip = this._clips[url]
        if (clip) {
            clip.stop();
        }
    }

    static stopAllEffect() {
        for (var k in this._clips) {
            let v = this._clips[k];
            v.stop();
        }
    }

    static playBGM(url, loop = true) {
        if (!Device.isBgmEnabled) { return }
        this.stopMusic();
        if (url.indexOf('/') == -1) {
            url = Device.audio_path + url;
        }
        resources.load(url, AudioClip, (err, clip: AudioClip) => {
            if (err)
                console.log(err)
            else {
                this.playMusic(clip, loop);
            }
        });
    }


    static setAudioPath(path) {
        Device.audio_path = path;
    }

    static playEffect(clip: AudioClip, loop = false, volume = 1) {
        if (Device.isSfxEnabled) {
            clip.setLoop(loop);
            clip.setVolume(volume);
            return clip.play();
        }
    }
    static bgm_clip: AudioClip = null;
    static stopMusic() {
        this.bgm_clip && this.bgm_clip.stop();
    }

    static playMusic(clip: AudioClip, loop = true) {
        if (Device.isBgmEnabled) {
            this.bgm_clip = clip;
            clip.setLoop(loop);
            return clip.play();
        }
    }


    static vibrate(long?) {
        if (!this.isVibrateEnabled) {
            return;
        }
        console.log("Device->vibrate->WECHAT_GAME",sys.WECHAT_GAME);
        console.log("Device->vibrate->sys.platform",sys.platform);
        if (sys.WECHAT_GAME == sys.platform) {
            if (long)
                wx.vibrateLong()
            else
                wx.vibrateShort();
        } else {
            // console.log("not support vibrate on except-wx platfrom ")
        }
    }
}

window['Device'] = Device