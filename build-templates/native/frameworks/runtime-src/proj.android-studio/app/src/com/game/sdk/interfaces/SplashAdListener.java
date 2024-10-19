package com.game.sdk.interfaces;

public interface SplashAdListener {

    void onAdClicked();

    void onError(int i, String s);

    void onAdSkip();

    void onAdShow();

    void onADDismissed();

    void onNoAD();
}
