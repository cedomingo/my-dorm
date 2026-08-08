package com.dormtracker.app;

import android.os.Bundle;

import com.dormtracker.app.widget.WidgetDataBridgePlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Local, app-only plugin (not an npm package) — must be registered
        // before super.onCreate() sets up the bridge.
        registerPlugin(WidgetDataBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
