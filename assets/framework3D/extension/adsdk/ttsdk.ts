export class ttsdk {
  static setIDs(userId: string, roleId: string) {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod(
        'AppController',
        'setIDs:roleId:',
        userId,
        roleId
      );
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'setIDs',
        '(Ljava/lang/String;Ljava/lang/String;)V',
        userId,
        roleId
      );
    }
  }

  static showBanner() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'showBanner');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'showBanner',
        '()V'
      );
    }
  }

  static hideBanner() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'hideBanner');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'hideBanner',
        '()V'
      );
    }
  }

  static showFeed() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'showFeed');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'showFeed',
        '()V'
      );
    }
  }

  static hideFeed() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'hideFeed');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'hideFeed',
        '()V'
      );
    }
  }

  static showInteractionAd() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod(
        'AppController',
        'showInteractionAd'
      );
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'showInteractionAd',
        '()V'
      );
    }
  }

  static showRewardAd() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'showRewardAd');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'showRewardAd',
        '()V'
      );
    }
  }

  static switchOpenSplashAd() {
    if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
      return jsb.reflection.callStaticMethod('AppController', 'openSplashAd');
    } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/game/sdk/TTSDK',
        'openSplashAd',
        '()V'
      );
    }
  }
}
