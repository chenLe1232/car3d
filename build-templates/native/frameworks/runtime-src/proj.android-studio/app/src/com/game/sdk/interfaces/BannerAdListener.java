package com.game.sdk.interfaces;

public interface BannerAdListener {

    void onNoAD(int i, String s);

    void onAdClicked();

    void onAdShow();

    void onError(int i, String s);

    void onAdLoad();

    void onAdClose();
}
