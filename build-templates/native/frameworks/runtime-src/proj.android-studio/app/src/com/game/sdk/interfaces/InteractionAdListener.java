package com.game.sdk.interfaces;

public interface InteractionAdListener {

    void onError(int i, String s);

    void onInteractionAdLoad();

    void onInteractionAdClick();

    void onInteractionAdDismiss();

    void onInteractionAdShow();

    void onNoAD();

}
