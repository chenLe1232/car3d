package com.game.sdk.interfaces;

public interface EmbeddedAdListener {

    void onNoAD(int i, String s);

    void onAdClicked();

    void onAdShow();

    void onError(int i, String s);

    void onAdLoad();

    void onAdClose();
}
