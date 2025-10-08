package com.anonymous.smilestudioPROTO; // <- replace with your package

import android.content.Context;
import android.widget.FrameLayout;

import com.banuba.sdk.manager.BanubaSdkManager;

public class BanubaARView extends FrameLayout {
    private BanubaSdkManager banubaSdkManager;

    public BanubaARView(Context context) {
        super(context);
        banubaSdkManager = new BanubaSdkManager(context);
        addView(banubaSdkManager.create());
    }

    public void onResume() {
        banubaSdkManager.onResume();
    }

    public void onPause() {
        banubaSdkManager.onPause();
    }

    public void loadEffect(String effectName) {
        banubaSdkManager.loadEffect(effectName);
    }
}
