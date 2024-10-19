package com.game.sdk;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.game.sdk.interfaces.BannerAdListener;
import com.game.sdk.interfaces.EmbeddedAdListener;
import com.game.sdk.interfaces.InitListener;
import com.game.sdk.interfaces.InteractionAdListener;
import com.game.sdk.interfaces.RewardAdListener;
import com.game.sdk.interfaces.SplashAdListener;
import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConfig;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAdSdk;
import com.bytedance.sdk.openadsdk.TTNativeExpressAd;
import com.bytedance.sdk.openadsdk.TTRewardVideoAd;
import com.bytedance.sdk.openadsdk.TTSplashAd;
import com.game.sdk.utils.TToast;
import com.game.sdk.utils.UIUtils;

import org.cocos2dx.javascript.TheApplication;
import org.cocos2dx.mergecar3d.R;

import java.util.List;

public class ADManager {

    @SuppressLint("StaticFieldLeak")
    private static ADManager adManager = null;
    @SuppressLint("StaticFieldLeak")
    private static Activity mActivity = null;

    private static boolean isLog = false;

    private EmbeddedAdListener embeddedAdListener = null;
    private TTNativeExpressAd ttNativeExpressAd = null;
    private FrameLayout feedLayout = null;
    private String userId = "";

    private RewardAdListener rewardAdListener = null;
    private TTRewardVideoAd ttRewardVideoAd = null;
    private boolean isShowReward = false;

    private InteractionAdListener interactionAdListener = null;
    private TTNativeExpressAd mTTAd = null;

    private View mBannerContainer = null;
    private FrameLayout bannerLayout = null;
    private View mSplashContainer = null;
    private FrameLayout splashLayout = null;

    public static void Log() {
        isLog = true;
    }

    public static ADManager getInstance(Activity activity) {
        mActivity = activity;
        if (ADManager.adManager == null) {
            ADManager.adManager = new ADManager();
        }
        return ADManager.adManager;
    }

    public void init(InitListener listener) {

        //强烈建议在应用对应的Application#onCreate()方法中调用，避免出现content为null的异常
        TTAdSdk.init(mActivity, new TTAdConfig.Builder()
                .appId("5082392")
                .useTextureView(false) //使用TextureView控件播放视频,默认为SurfaceView,当有SurfaceView冲突的场景，可以使用TextureView
                .appName(mActivity.getResources().getString(R.string.app_name))
                .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_NO_TITLE_BAR)
                .allowShowNotify(false) //是否允许sdk展示通知栏提示
                .allowShowPageWhenScreenLock(false) //是否在锁屏场景支持展示广告落地页
                .debug(isLog) //测试阶段打开，可以通过日志排查问题，上线时去除该调用
                .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G) //允许直接下载的网络状态集合
                .supportMultiProcess(false) //是否支持多进程，true支持
                //.httpStack(new MyOkStack3())//自定义网络库，demo中给出了okhttp3版本的样例，其余请自行开发或者咨询工作人员。
                .build());

        listener.initSuccess();

        //如果明确某个进程不会使用到广告SDK，可以只针对特定进程初始化广告SDK的content
        //if (PROCESS_NAME_XXXX.equals(processName)) {
        //   TTAdSdk.init(context, config);
        //}
    }

    /**
     * 设置UserId, 并加载广告
     * @param userId 用户id
     */
    public void setUserId(String userId) {
        this.userId = userId;
        loadRewardVideoAD();
        loadFeed();
        loadInterstitialAD();
    }

    /**
     * 加载激励视频
     */
    private void loadRewardVideoAD() {
        TTAdNative mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity);//baseContext建议为activity
        //step4:创建广告请求参数AdSlot,具体参数含义参考文档
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("945275673")
                .setSupportDeepLink(true)
                .setRewardName("金币") //奖励的名称
                .setRewardAmount(3)  //奖励的数量
                .setUserID(this.userId)//用户id,必传参数
                .setMediaExtra("media_extra") //附加参数，可选
                .setOrientation(TTAdConstant.VERTICAL) //必填参数，期望视频的播放方向：TTAdConstant.HORIZONTAL 或 TTAdConstant.VERTICAL
                .build();
        //step5:请求广告
        mTTAdNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {
            @Override
            public void onError(int code, String message) {
                if (rewardAdListener != null) rewardAdListener.onError(code, message);
                Umeng.onEvent(mActivity, "reward_error", code + " " + message);
            }

            //视频广告加载后，视频资源缓存到本地的回调，在此回调后，播放本地视频，流畅不阻塞。
            @Override
            public void onRewardVideoCached() {
            }

            @Override
            public void onRewardVideoAdLoad(TTRewardVideoAd ad) {
                ttRewardVideoAd = ad;

                if (isShowReward) {
                    showRewardVideoAD(rewardAdListener);
                }
            }

        });
    }

    /**
     * 加载feed流广告
     */
    private void loadFeed() {
        TTAdNative mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity);//baseContext建议为activity
        //step4:创建feed广告请求类型参数AdSlot,具体参数含义参考文档
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("945275666")
                .setSupportDeepLink(true)
                .setExpressViewAcceptedSize(350, 240) //期望模板广告view的size,单位dp
                .setAdCount(1) //请求广告数量为1到3条
                .build();
        //step5:请求广告，调用feed广告异步请求接口，加载到广告后，拿到广告素材自定义渲染
        mTTAdNative.loadNativeExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {
            @Override
            public void onError(int code, String message) {
                if (embeddedAdListener != null) embeddedAdListener.onError(code, message);
                Umeng.onEvent(mActivity, "feedAd_error", code + " " + message);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (embeddedAdListener != null) embeddedAdListener.onAdLoad();

                if (ads == null || ads.isEmpty()) {
                    if (embeddedAdListener != null) embeddedAdListener.onNoAD(0, "");
                    return;
                }

                ttNativeExpressAd = ads.get(0);
                if (feedLayout != null) {
                    showEmbeddedAD(mActivity, feedLayout, true, embeddedAdListener);
                }
            }
        });
    }

    /**
     * 加载插屏广告
     */
    private void loadInterstitialAD() {
        TTAdNative mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity);//baseContext建议为activity
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("945275652") //广告位id
                .setSupportDeepLink(true)
                .setAdCount(1) //请求广告数量为1到3条
                .setExpressViewAcceptedSize(450, 0) //期望模板广告view的size,单位dp
                .build();
        //step5:请求广告，对请求回调的广告作渲染处理
        mTTAdNative.loadInteractionExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {
            @Override
            public void onError(int code, String message) {
                if (interactionAdListener != null) interactionAdListener.onError(code, message);
                Umeng.onEvent(mActivity, "interaction_error", code + " " + message);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0) {
                    if (interactionAdListener != null) interactionAdListener.onNoAD();
                    return;
                }
                mTTAd = ads.get(0);
            }
        });
    }


    /**
     * 显示Banner广告
     */
    public void showBannerAD(RelativeLayout layout, final BannerAdListener listener) {
        RelativeLayout.LayoutParams localLayoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        mBannerContainer = LayoutInflater.from(mActivity).inflate(R.layout.activity_banner, layout, false);
        bannerLayout = mBannerContainer.findViewById(R.id.banner_container);
        layout.addView(mBannerContainer, localLayoutParams);
        TTAdNative mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity);//baseContext建议为activity
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("945275657") //广告位id
                .setSupportDeepLink(true)
                .setAdCount(1) //请求广告数量为1到3条
                .setExpressViewAcceptedSize(UIUtils.px2dip(mActivity, TheApplication.screenWidth), 0) //期望模板广告view的size,单位dp
                .build();
        //step5:请求广告，对请求回调的广告作渲染处理
        mTTAdNative.loadBannerExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {
            @Override
            public void onError(int code, String message) {
                TToast.show(mActivity, "load error : " + code + ", " + message);
                bannerLayout.removeAllViews();
                Umeng.onEvent(mActivity, "bannerAd_error", code + " " + message);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0) {
                    return;
                }
                mTTAd = ads.get(0);
                mTTAd.setSlideIntervalTime(30 * 1000);
                mTTAd.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {
                    @Override
                    public void onAdClicked(View view, int type) {
                        listener.onAdClicked();
                        Umeng.onEvent(mActivity, "banner_ad", "click");
                    }

                    @Override
                    public void onAdShow(View view, int type) {
                        listener.onAdShow();
                        Umeng.onEvent(mActivity, "banner_ad", "show");
                    }

                    @Override
                    public void onRenderFail(View view, String msg, int code) {
                        listener.onError(code, msg);
                    }

                    @Override
                    public void onRenderSuccess(View view, float width, float height) {
                        //返回view的宽高 单位 dp
                        bannerLayout.removeAllViews();
                        bannerLayout.addView(view);
                    }
                });
                mTTAd.render();
            }
        });
    }

    /**
     * 隐藏Banner广告
     */
    public void hideBannerAd() {
        if (mBannerContainer != null && mBannerContainer.getParent() != null) {
            ((ViewGroup) mBannerContainer.getParent()).removeView(mBannerContainer);
        }
    }


    /**
     * 显示开屏广告
     * @param context 上下文
     * @param layout 父节点
     * @param listener 监听事件
     * @param timeout 超时时间
     */
    public void showSplashAD(Context context, final RelativeLayout layout, final SplashAdListener listener, int timeout) {
        RelativeLayout.LayoutParams localLayoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        mSplashContainer = LayoutInflater.from(mActivity).inflate(R.layout.activity_splash, layout, false);
        splashLayout = mSplashContainer.findViewById(R.id.splash_container);
        layout.addView(mSplashContainer, localLayoutParams);
        TTAdNative mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity);//baseContext建议为activity
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("887339856")
                .setSupportDeepLink(true)
                .setImageAcceptedSize(1080, 1920)
                .build();
        mTTAdNative.loadSplashAd(adSlot, new TTAdNative.SplashAdListener() {

            @Override
            public void onError(int code, String message) {
                listener.onError(code, message);
                TToast.show(mActivity, "load error : " + code + ", " + message);
                splashLayout.removeAllViews();
            }

            @Override
            public void onTimeout() {
                listener.onNoAD();
            }

            @Override
            public void onSplashAdLoad(TTSplashAd ad) {
                if (ad == null) {
                    listener.onNoAD();
                    return;
                }
                //获取SplashView
                View view = ad.getSplashView();
                if (!mActivity.isFinishing()) {
                    splashLayout.removeAllViews();
                    //把SplashView 添加到ViewGroup中,注意开屏广告view：width >=70%屏幕宽；height >=50%屏幕高
                    splashLayout.addView(view);
                    //设置不开启开屏广告倒计时功能以及不显示跳过按钮,如果这么设置，您需要自定义倒计时逻辑
                    //ad.setNotAllowSdkCountdown();
                } else {
                    listener.onNoAD();
                }

                //设置SplashView的交互监听器
                ad.setSplashInteractionListener(new TTSplashAd.AdInteractionListener() {
                    @Override
                    public void onAdClicked(View view, int type) {
                        listener.onAdClicked();
                        Umeng.onEvent(mActivity, "splash_ad", "click");
                    }

                    @Override
                    public void onAdShow(View view, int type) {
                        listener.onAdShow();
                        Umeng.onEvent(mActivity, "splash_ad", "show");
                    }

                    @Override
                    public void onAdSkip() {
                        listener.onAdSkip();
                        Umeng.onEvent(mActivity, "splash_ad", "skip");
                    }

                    @Override
                    public void onAdTimeOver() {
                        listener.onNoAD();
                        Umeng.onEvent(mActivity, "splash_ad", "noAd");
                    }
                });
            }
        }, timeout);
    }

    /**
     * 隐藏开屏广告
     */
    public void hideSplashAd() {
        if (mSplashContainer != null && mSplashContainer.getParent() != null) {
            ((ViewGroup) mSplashContainer.getParent()).removeView(mSplashContainer);
        }
    }


    /**
     * 显示Feed流广告
     * @param activity 上下文
     * @param layout 父节点
     * @param hasButton 显示按钮
     * @param listener 监听事件
     */
    public void showEmbeddedAD(Activity activity, FrameLayout layout, boolean hasButton, final EmbeddedAdListener listener) {
        feedLayout = layout;
        embeddedAdListener = listener;
        if (ttNativeExpressAd == null) {
            return;
        }
        ttNativeExpressAd.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {
            @Override
            public void onAdClicked(View view, int type) {
                listener.onAdClicked();
            }

            @Override
            public void onAdShow(View view, int type) {
                listener.onAdShow();
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                listener.onError(code, msg);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {

            }
        });

        //获取视频播放view,该view SDK内部渲染，在媒体平台可配置视频是否自动播放等设置。
        View video = ttNativeExpressAd.getExpressAdView();
        if (video != null) {
            if (video.getParent() == null) {
                feedLayout.removeAllViews();
                feedLayout.addView(video);
                ttNativeExpressAd.render();
            }
        }
    }

    /**
     * 关闭Feed流广告
     */
    public void closeEmbeddedAD() {
        feedLayout.removeAllViews();
        ttNativeExpressAd = null;
        feedLayout = null;
        loadFeed();
    }


    /**
     * 显示插屏广告
     * @param listener 事件监听
     */
    public void showInterstitialAD(final InteractionAdListener listener) {
        this.interactionAdListener = listener;
        if (mTTAd == null) {
            return;
        }
        final long startTime = System.currentTimeMillis();
        mTTAd.setExpressInteractionListener(new TTNativeExpressAd.AdInteractionListener() {
            @Override
            public void onAdDismiss() {
                if (interactionAdListener != null) interactionAdListener.onInteractionAdDismiss();

                mTTAd = null;
                loadInterstitialAD();
            }

            @Override
            public void onAdClicked(View view, int type) {
                if (interactionAdListener != null) interactionAdListener.onInteractionAdClick();
                Umeng.onEvent(mActivity, "interaction_ad", "click");
            }

            @Override
            public void onAdShow(View view, int type) {
                if (interactionAdListener != null) interactionAdListener.onInteractionAdShow();
                Umeng.onEvent(mActivity, "interaction_ad", "show");
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                if (isLog)
                    Log.e("ExpressView", "render fail:" + (System.currentTimeMillis() - startTime));
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                if (isLog)
                    Log.e("ExpressView", "render suc:" + (System.currentTimeMillis() - startTime));
                //返回view的宽高 单位 dp
                mTTAd.showInteractionExpressAd(mActivity);
            }
        });
        mTTAd.render();
    }

    /**
     * 显示激励视频
     * @param listener 事件监听
     */
    public void showRewardVideoAD(final RewardAdListener listener) {
        rewardAdListener = listener;
        isShowReward = true;

        if (ttRewardVideoAd == null) {
            return;
        }

        ttRewardVideoAd.setRewardAdInteractionListener(new TTRewardVideoAd.RewardAdInteractionListener() {

            @Override
            public void onAdShow() {
                rewardAdListener.onRewardVideoAdShow();
                Umeng.onEvent(mActivity, "reward_ad", "show");
            }

            @Override
            public void onAdVideoBarClick() {
                Umeng.onEvent(mActivity, "reward_ad", "click");
            }

            @Override
            public void onAdClose() {
                rewardAdListener.onRewardVideoAdClose();
                ttRewardVideoAd = null;
                isShowReward = false;
                loadRewardVideoAD();
            }

            //视频播放完成回调
            @Override
            public void onVideoComplete() {
                rewardAdListener.onRewardVideoAdLoad();
                Umeng.onEvent(mActivity, "reward_ad", "complete");
            }

            @Override
            public void onVideoError() {
                rewardAdListener.onError(0, "video error");
            }

            //视频播放完成后，奖励验证回调，rewardVerify：是否有效，rewardAmount：奖励梳理，rewardName：奖励名称
            @Override
            public void onRewardVerify(boolean rewardVerify, int rewardAmount, String rewardName) {
                rewardAdListener.onRewardVerify(rewardVerify);
                Umeng.onEvent(mActivity, "reward_ad", "rewarded");
            }

            @Override
            public void onSkippedVideo() {

            }
        });

        if (ttRewardVideoAd != null) {
            //step6:在获取到广告后展示
            //该方法直接展示广告
//                    mttRewardVideoAd.showRewardVideoAd(RewardVideoActivity.this);

            //展示广告，并传入广告展示的场景
            ttRewardVideoAd.showRewardVideoAd(mActivity, TTAdConstant.RitScenes.CUSTOMIZE_SCENES, "scenes_test");
            ttRewardVideoAd = null;
        } else {
            TToast.show(mActivity, "请先加载广告");
        }
    }

    public void onResume() {

    }

    public void onPause() {

    }

    public void onStop() {

    }

    /**
     * 销毁
     */
    public void onDestroy() {
        if (mTTAd != null) {
            mTTAd.destroy();
        }
        if (ttNativeExpressAd != null) {
            ttNativeExpressAd.destroy();
        }
    }
}
