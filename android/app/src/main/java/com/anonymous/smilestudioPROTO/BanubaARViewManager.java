package com.anonymous.smilestudioPROTO;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class BanubaARViewManager extends SimpleViewManager<BanubaARView> {
    @NonNull
    @Override
    public String getName() {
        return "BanubaARView";
    }

    @NonNull
    @Override
    protected BanubaARView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new BanubaARView(reactContext);
    }

    @ReactProp(name = "effect")
    public void setEffect(BanubaARView view, String effect) {
        view.loadEffect(effect);
    }
}
