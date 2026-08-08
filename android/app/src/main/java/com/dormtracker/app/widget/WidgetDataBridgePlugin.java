package com.dormtracker.app.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.dormtracker.app.R;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridges the web app to the native "Closest Deadlines" homescreen widget.
 *
 * The JS side (src/DormTracker/widgetBridge.js) calls updateWidgetData()
 * with the same closest-deadlines list shown in the Dashboard's Deadlines
 * card. We stash it in SharedPreferences (widget code can't read the
 * WebView's localStorage) and nudge AppWidgetManager to redraw every placed
 * instance of the widget.
 *
 * Registered manually in MainActivity — this is a small app-local plugin,
 * not a published npm package, so it isn't auto-discovered.
 */
@CapacitorPlugin(name = "WidgetDataBridge")
public class WidgetDataBridgePlugin extends Plugin {

    public static final String PREFS_NAME = "dorm_widget_prefs";
    public static final String KEY_ITEMS_JSON = "deadlines_json";

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        JSArray itemsArray = call.getArray("items");
        if (itemsArray == null) {
            call.reject("Missing 'items' array");
            return;
        }

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_ITEMS_JSON, itemsArray.toString()).apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, DeadlinesWidgetProvider.class);
        int[] widgetIds = manager.getAppWidgetIds(provider);

        if (widgetIds != null && widgetIds.length > 0) {
            // Tell the ListView's RemoteViewsFactory its data changed...
            manager.notifyAppWidgetViewsChanged(widgetIds, R.id.widget_list);
            // ...and re-run onUpdate so labels like "Today"/"Tomorrow" and
            // the header stay correct too.
            Intent updateIntent = new Intent(context, DeadlinesWidgetProvider.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds);
            context.sendBroadcast(updateIntent);
        }

        JSObject ret = new JSObject();
        ret.put("widgetCount", widgetIds == null ? 0 : widgetIds.length);
        call.resolve(ret);
    }
}
