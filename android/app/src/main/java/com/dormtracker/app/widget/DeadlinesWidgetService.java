package com.dormtracker.app.widget;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import com.dormtracker.app.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Supplies the scrolling rows for the "Closest Deadlines" widget by reading
 * the JSON list last pushed from JS via WidgetDataBridgePlugin.
 */
public class DeadlinesWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new DeadlinesRemoteViewsFactory(getApplicationContext());
    }

    static class DeadlinesRemoteViewsFactory implements RemoteViewsFactory {
        private final Context context;
        private List<JSONObject> items = new ArrayList<>();

        DeadlinesRemoteViewsFactory(Context context) {
            this.context = context;
        }

        @Override
        public void onCreate() {
            loadItems();
        }

        @Override
        public void onDataSetChanged() {
            loadItems();
        }

        private void loadItems() {
            List<JSONObject> loaded = new ArrayList<>();
            SharedPreferences prefs = context.getSharedPreferences(
                    WidgetDataBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE);
            String json = prefs.getString(WidgetDataBridgePlugin.KEY_ITEMS_JSON, "[]");
            try {
                JSONArray arr = new JSONArray(json);
                for (int i = 0; i < arr.length(); i++) {
                    loaded.add(arr.getJSONObject(i));
                }
            } catch (Exception e) {
                loaded = new ArrayList<>();
            }
            items = loaded;
        }

        @Override
        public void onDestroy() {
            items = new ArrayList<>();
        }

        @Override
        public int getCount() {
            return items.size();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_deadlines_item);
            if (position < 0 || position >= items.size()) return row;

            JSONObject item = items.get(position);
            String text = item.optString("text", "");
            String label = item.optString("label", "");
            boolean missed = item.optBoolean("missed", false);

            row.setTextViewText(R.id.item_text, text);
            row.setTextViewText(R.id.item_label, label);
            row.setInt(R.id.item_row, "setBackgroundResource",
                    missed ? R.drawable.widget_item_missed_bg : R.drawable.widget_item_bg);
            row.setTextColor(R.id.item_label, context.getColor(
                    missed ? R.color.widget_missed_text : R.color.widget_upcoming_text));

            // Empty fill-in intent — combined with the template set in
            // DeadlinesWidgetProvider, tapping any row opens the app.
            row.setOnClickFillInIntent(R.id.item_row, new Intent());

            return row;
        }

        @Override
        public RemoteViews getLoadingView() {
            return null; // use the default loading view
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }
    }
}
