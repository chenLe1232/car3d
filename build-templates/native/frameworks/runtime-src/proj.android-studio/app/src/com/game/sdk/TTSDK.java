package com.game.sdk;

import android.content.Context;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;


import com.game.sdk.interfaces.BannerAdListener;
import com.game.sdk.interfaces.EmbeddedAdListener;
import com.game.sdk.interfaces.InteractionAdListener;
import com.game.sdk.interfaces.RewardAdListener;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.javascript.service.SDKClass;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class TTSDK extends SDKClass {
    private static final String TAG = "TTSDK";
    private static AppActivity appthis;
    private static FrameLayout feedLayout;
    private static String sucCall = "cc.platform.onWatchVideoSuc()";
    private static String msgCall = "cc.platform.msgCall()";
    private static String ttUUID = "adsdk_uuid";

    public void init(Context paramContext) {
        appthis = (AppActivity) paramContext;
    }

    public static void setIDs(String userId, String roleID) {
        ADManager.getInstance(TTSDK.appthis).setUserId(userId);
    }

    public static void showBanner() {
        appthis.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ADManager.getInstance(appthis).showBannerAD(appthis.getFrame(), new BannerAdListener() {
                    @Override
                    public void onNoAD(int i, String s) {

                    }

                    @Override
                    public void onAdClicked() {

                    }

                    @Override
                    public void onAdShow() {

                    }

                    @Override
                    public void onError(int i, String s) {

                    }

                    @Override
                    public void onAdLoad() {

                    }

                    @Override
                    public void onAdClose() {

                    }
                });
            }
        });
    }

    public static void hideBanner() {
        appthis.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ADManager.getInstance(appthis).hideBannerAd();
            }
        });
    }

    public static void hideSplash() {
        appthis.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ADManager.getInstance(appthis).hideSplashAd();
            }
        });
    }

    public static void hideFeed() {
        appthis.runOnUiThread(new Runnable() {
            public void run() {
                if (TTSDK.feedLayout != null) {
                    ADManager.getInstance(TTSDK.appthis).closeEmbeddedAD();
                    feedLayout.removeAllViews();
                    TTSDK.appthis.getFrame().removeView(TTSDK.feedLayout);
                    feedLayout = null;
                }
            }
        });
    }

    public static void showFeed() {
        if (TTSDK.feedLayout != null) {
                return;
        }
        appthis.runOnUiThread(new Runnable() {
            public void run() {
                FrameLayout.LayoutParams localLayoutParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);//定义显示组件参数
                localLayoutParams.topMargin = (TTSDK.appthis.getFrame().getHeight() / 2);
                TTSDK.feedLayout = new FrameLayout(TTSDK.appthis);
                TTSDK.appthis.getFrame().addView(TTSDK.feedLayout, localLayoutParams);
                ADManager.getInstance(TTSDK.appthis).showEmbeddedAD(TTSDK.appthis, TTSDK.feedLayout, true, new EmbeddedAdListener() {

                    @Override
                    public void onNoAD(int i, String s) {
                        TTSDK.adCallBack("feed: onNoAD " + s);
                    }

                    @Override
                    public void onAdClicked() {
//                        TTSDK.adCallBack("feed: onAdClicked");
                    }

                    @Override
                    public void onAdShow() {
//                        TTSDK.adCallBack("feed: onAdShow");
                    }

                    @Override
                    public void onError(int i, String s) {
//                        TTSDK.adCallBack("feed: onError " + s);
                    }

                    @Override
                    public void onAdLoad() {
//                        TTSDK.adCallBack("feed: onAdLoad");
                    }

                    @Override
                    public void onAdClose() {
//                        TTSDK.adCallBack("feed: onAdClose");
                    }
                });
            }
        });
    }

    public static void showInteractionAd() {
        Log.d("插屏广告", "打开插屏广告");
        appthis.runOnUiThread(new Runnable() {
            public void run() {
                ADManager.getInstance(TTSDK.appthis).showInterstitialAD(new InteractionAdListener() {

                    @Override
                    public void onError(int i, String s) {
//                        TTSDK.adCallBack("interaction: onError " + s);
                    }

                    @Override
                    public void onInteractionAdLoad() {
//                        TTSDK.adCallBack("interaction: onInteractionAdLoad");
                    }

                    @Override
                    public void onInteractionAdClick() {
//                        TTSDK.adCallBack("interaction: onInteractionAdClick");
                    }

                    @Override
                    public void onInteractionAdDismiss() {
//                        TTSDK.adCallBack("interaction: onAdClose");
                    }

                    @Override
                    public void onInteractionAdShow() {
//                        TTSDK.adCallBack("interaction: onAdShow");
                    }

                    @Override
                    public void onNoAD() {
//                        TTSDK.adCallBack("interaction: onNoAD");
                    }
                });
            }
        });
    }

    public static void showRewardAd() {
        appthis.runOnUiThread(new Runnable() {
            public void run() {
                ADManager.getInstance(TTSDK.appthis).showRewardVideoAD(new RewardAdListener() {

                    @Override
                    public void onRewardVerify(boolean b) {
                        if (b) {
                            TTSDK.sucCallBack(ttUUID);
                        } else {
                            Log.i("ASDK", "奖励无效");
                        }
                    }

                    @Override
                    public void onRewardVideoCached() {
//                        TTSDK.adCallBack("reward: onRewardVideoCached");
                    }

                    @Override
                    public void onRewardVideoAdLoad() {
//                        TTSDK.adCallBack("reward: onRewardVideoAdLoad");
                    }

                    @Override
                    public void onRewardVideoAdShow() {
//                        TTSDK.adCallBack("reward: onRewardVideoAdShow");
                    }

                    @Override
                    public void onRewardVideoAdClose() {
//                        TTSDK.adCallBack("reward: onAdClose");
                    }

                    @Override
                    public void onError(int i, String s) {
//                        TTSDK.adCallBack("reward: onError " + s);
                    }

                    @Override
                    public void onNoAD(int i, String s) {
//                        TTSDK.adCallBack("reward: onNoAD " + s);
                    }
                });
            }
        });
    }

    private static void sucCallBack(final String uuid) {
        appthis.runOnGLThread(new Runnable() {
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(TTSDK.sucCall.replace("()", "('" + uuid + "')"));
            }
        });
    }

    private static void adCallBack(final String msg) {
        appthis.runOnGLThread(new Runnable() {
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(TTSDK.msgCall.replace("()", "('" + msg + "')"));
            }
        });
    }

}