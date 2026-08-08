// ─────────────────────────────────────────────
// HOME-SCREEN WIDGET BRIDGE
// ─────────────────────────────────────────────
// Talks to a small native-only Capacitor plugin ("WidgetDataBridge", see
// android/app/.../widget/WidgetDataBridgePlugin.java) that stores the
// closest-deadlines list where the native "Closest Deadlines" AppWidget can
// read it, then tells Android to refresh any placed widgets.
//
// This is deliberately a plain registerPlugin() call (like a local Cordova/
// Capacitor plugin) rather than an npm package, since it only exists to
// serve this app's own widget — same spirit as notifications.js using
// @capacitor/local-notifications directly.
//
// Safe no-op in the browser (Capacitor.isNativePlatform() is false), so
// `npm start` / the GitHub Pages build are unaffected.
import { useEffect, useRef } from "react";
import { registerPlugin, Capacitor } from "@capacitor/core";
import { getAllDeadlines } from "./data";
import { useCurrentDate } from "./notifications";

const WidgetDataBridge = registerPlugin("WidgetDataBridge");

// Keep the widget short — it's a glance surface, not the full dashboard card.
const MAX_WIDGET_ITEMS = 8;

const fmtLabel = (daysLeft) => {
  if (daysLeft < 0) return daysLeft === -1 ? "1 day overdue" : `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `${daysLeft} days`;
};

// Missed items first (most-recently-missed first), then upcoming items
// closest-first — mirrors the ordering in the on-screen Deadlines card.
export const buildWidgetItems = (todos, exams) => {
  const all = getAllDeadlines(todos, exams);
  const missed = all.filter(i => i.daysLeft < 0).sort((a, b) => b.daysLeft - a.daysLeft);
  const upcoming = all.filter(i => i.daysLeft >= 0);
  return [...missed, ...upcoming].slice(0, MAX_WIDGET_ITEMS).map(item => ({
    text: `${item.type === "exam" ? "🎓" : "📝"} ${item.text}`,
    label: fmtLabel(item.daysLeft),
    missed: item.daysLeft < 0,
  }));
};

// Pushes the closest deadlines to the native homescreen widget whenever
// todos/exams change (or a day rolls over, so "Tomorrow" becomes "Today"
// even if nothing else changed). Call once, unconditionally, at the App
// root — like the notification hooks, this should keep working even if the
// "Closest Deadlines" card isn't on the user's dashboard.
export function useWidgetSync(todos, exams) {
  const currentDate = useCurrentDate();
  const lastSent = useRef(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return; // no widget outside the Android app

    const items = buildWidgetItems(todos, exams);
    const snapshot = JSON.stringify(items);
    if (snapshot === lastSent.current) return; // nothing actually changed, skip the bridge call

    lastSent.current = snapshot;
    WidgetDataBridge.updateWidgetData({ items }).catch(err => {
      console.error("[widget] updateWidgetData failed", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, JSON.stringify(todos), JSON.stringify(exams)]);
}
