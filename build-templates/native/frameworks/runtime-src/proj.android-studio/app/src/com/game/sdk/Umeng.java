package com.game.sdk;

import android.content.Context;

import com.umeng.analytics.game.UMGameAgent;

import java.util.HashMap;
import java.util.Map;

public class Umeng {

    public static void startLevel(String level) {  //level 为关卡ID(例如：level-01)
        UMGameAgent.startLevel(level);
    }

    public static void finishLevel(String level) {
        UMGameAgent.finishLevel(level);
    }

    public static void failLevel(String level) {
        UMGameAgent.failLevel(level);
    }

    public static void onEvent(Context context, String eventName, String status) {
        Map<String, String> map = new HashMap<>();
        map.put("status", status); //自定义属性：激励视频广告状态 播放 完成
        UMGameAgent.onEvent(context, eventName, map);
    }

}
