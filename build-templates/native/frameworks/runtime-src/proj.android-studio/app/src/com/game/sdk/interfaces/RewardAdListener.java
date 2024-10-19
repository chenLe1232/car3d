package com.game.sdk.interfaces;

public interface RewardAdListener {


    void onRewardVerify(boolean b);

    void onRewardVideoCached();

    void onRewardVideoAdLoad();

    void onRewardVideoAdShow();

    void onRewardVideoAdClose();

    void onError(int i, String s);

    void onNoAD(int i, String s);

}
