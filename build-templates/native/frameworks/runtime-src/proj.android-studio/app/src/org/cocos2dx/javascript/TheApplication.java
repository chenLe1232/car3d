package org.cocos2dx.javascript;

import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.DisplayMetrics;
import android.view.WindowManager;

import com.umeng.commonsdk.UMConfigure;

import org.cocos2dx.mergecar3d.BuildConfig;


// Demo Application
public class TheApplication extends Application {

    static Context context;
    static String channel = "";
    static String build = "";

    public static float screenWidth = 0;
    public static float screenHeight = 0;

    @Override
    public void onCreate() {
        super.onCreate();

        context = this;

//        CrashReport.initCrashReport(getApplicationContext(), "ba062a0dd0", BuildConfig.DEBUG);

        TheApplication.channel = getAppMetaData("APP_CHANNEL");
        TheApplication.build = getAppMetaData("BUILD_TIME");

        DisplayMetrics outMetrics = new DisplayMetrics();
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        windowManager.getDefaultDisplay().getMetrics(outMetrics);
        screenWidth = outMetrics.widthPixels;
        screenHeight = outMetrics.heightPixels;


        /**
         * 注意：如果您已经在AndroidManifest.xml中配置过appkey和channel值，可以调用此版本初始化函数。
         */
        UMConfigure.init(this, UMConfigure.DEVICE_TYPE_PHONE, null);
        UMConfigure.setLogEnabled(BuildConfig.DEBUG);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
//        MultiDex.install(this);
    }

    public static String get_build() {
        return TheApplication.build;
    }

    /**
     * 获取Application下面的metaData
     */
    public String getAppMetaData(String meta_name) {
        try {
            ApplicationInfo appInfo = this.getPackageManager()
                    .getApplicationInfo(getPackageName(), PackageManager.GET_META_DATA);
            int num = appInfo.metaData.getInt(meta_name);
            String value = appInfo.metaData.getString(meta_name);
            return num > 0 ? "" + num : value;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
}