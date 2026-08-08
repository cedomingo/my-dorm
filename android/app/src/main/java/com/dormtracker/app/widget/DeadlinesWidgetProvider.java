package com.dormtracker.app.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

import com.dormtracker.app.MainActivity;
import com.dormtracker.app.R;

/**
 * The "Closest Deadlines" homescreen widget. Layout/scrolling content is
 * delegated to {@link DeadlinesWidgetService} (a RemoteViewsService) so the
 * widget can show any number of rows and be resized; this class just wires
 * that adapter up and makes header/rows tap-to-open-app.
 */
public class DeadlinesWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_deadlines);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        // Tapping the header opens the app.
        PendingIntent headerPending = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_header, headerPending);

        // Point the ListView at our RemoteViewsService for its row data.
        Intent serviceIntent = new Intent(context, DeadlinesWidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        // Distinct Intent per widget instance (required so multiple placed
        // widgets don't share one adapter/cache).
        serviceIntent.setData(Uri.parse("widget://deadlines/" + appWidgetId));
        views.setRemoteAdapter(R.id.widget_list, serviceIntent);
        views.setEmptyView(R.id.widget_list, R.id.widget_empty);

        // Template PendingIntent so each row (via setOnClickFillInIntent in
        // the factory) also opens the app. Templates used with fill-in
        // intents must be mutable from Android 12 onward.
        int mutabilityFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
                ? PendingIntent.FLAG_MUTABLE
                : 0;
        PendingIntent itemPending = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | mutabilityFlag);
        views.setPendingIntentTemplate(R.id.widget_list, itemPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewsChanged(appWidgetId, R.id.widget_list);
    }
}
