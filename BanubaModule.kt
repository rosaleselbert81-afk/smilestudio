
package com.anonymous.smilestudioPROTO

import android.graphics.Bitmap
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.banuba.sdk.manager.BanubaSdkManager
import com.banuba.sdk.types.FullImageData

class BanubaModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private var sdkManager: BanubaSdkManager? = null
    
    override fun getName(): String {
        return "BanubaSDK"
    }
    
    @ReactMethod
    fun initialize(token: String, promise: Promise) {
        try {
            currentActivity?.let { activity ->
                sdkManager = BanubaSdkManager(activity.applicationContext, token)
                promise.resolve("Banuba SDK initialized successfully")
            } ?: promise.reject("ERROR", "Activity is null")
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun loadEffect(effectName: String, promise: Promise) {
        try {
            sdkManager?.let { manager ->
                val effectsPath = currentActivity?.assets?.list("effects")
                if (effectsPath != null && effectsPath.contains(effectName)) {
                    manager.effectPlayer.loadEffect("effects/$effectName")
                    promise.resolve("Effect loaded: $effectName")
                } else {
                    promise.reject("ERROR", "Effect not found: $effectName")
                }
            } ?: promise.reject("ERROR", "SDK not initialized")
        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun clearEffect(promise: Promise) {
        try {
            sdkManager?.effectPlayer?.loadEffect("")
            promise.resolve("Effect cleared")
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun processImage(imageUri: String, promise: Promise) {
        try {
            sdkManager?.let { manager ->
                // Process image with current effect
                // This is a placeholder - actual implementation depends on your needs
                promise.resolve("Image processed")
            } ?: promise.reject("ERROR", "SDK not initialized")
        } catch (e: Exception) {
            promise.reject("PROCESS_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun getAvailableEffects(promise: Promise) {
        try {
            val effectsList = currentActivity?.assets?.list("effects")?.toList() ?: emptyList()
            val effectsArray = Arguments.createArray()
            effectsList.forEach { effectsArray.pushString(it) }
            promise.resolve(effectsArray)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}