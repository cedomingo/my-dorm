// ─────────────────────────────────────────────
// SHARED NOTIFICATIONS UTILITY
// ─────────────────────────────────────────────
// Uses @capacitor/local-notifications (NOT the browser Notification API —
// this app ships as an Android APK via Capacitor).
//
// Setup (one-time, on the native project):
//   npm install @capacitor/local-notifications
//   npx cap sync android
// Android 13+ requires the runtime POST_NOTIFICATIONS permission, which
// ensurePermission() below requests via the plugin's requestPermissions().
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getTodayStr } from "./data";

// ── Permission ──────────────────────────────────────────────
// Cached in-memory so we don't re-prompt every time a hook runs its effect.
let _permissionGranted = null;

export async function ensurePermission() {
  if (_permissionGranted === true) return true;
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") {
      _permissionGranted = true;
      return true;
    }
    const result = await LocalNotifications.requestPermissions();
    _permissionGranted = result.display === "granted";
    return _permissionGranted;
  } catch (err) {
    console.error("[notifications] permission check failed", err);
    return false;
  }
}

// ── Deterministic id hashing ────────────────────────────────
// Capacitor notification ids must be integers. We derive a stable positive
// 32-bit-ish integer from a human-readable key (e.g.
// "payment:pay123:2026-07-06:lead1") so the same logical notification
// always maps to the same id — this is what lets the diff/reschedule logic
// avoid duplicate schedules across renders and app restarts.
export function hashId(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
    hash = hash | 0; // force 32-bit
  }
  // Keep well under Java's Integer.MAX_VALUE, and always positive/non-zero.
  return (Math.abs(hash) % 2_000_000_000) + 1;
}

// ── Scheduling primitives ───────────────────────────────────
export async function scheduleLocal(id, title, body, at) {
  if (!(at instanceof Date) || isNaN(at.getTime()) || at.getTime() <= Date.now()) {
    return false; // never schedule things in the past
  }
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, schedule: { at, allowWhileIdle: true } }],
    });
    return true;
  } catch (err) {
    console.error("[notifications] scheduleLocal failed", err);
    return false;
  }
}

// weekday: 0=Sun..6=Sat (matches this app's DOW_LABELS convention).
// Capacitor's `on.weekday` uses 1=Sun..7=Sat, so we convert here.
// Omit weekday entirely for a daily repeat (used by Medicine).
export async function scheduleRepeating(id, title, body, { weekday, hour, minute }) {
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    const on =
      weekday === undefined || weekday === null
        ? { hour, minute }
        : { weekday: weekday + 1, hour, minute };
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, schedule: { on, repeats: true, allowWhileIdle: true } }],
    });
    return true;
  } catch (err) {
    console.error("[notifications] scheduleRepeating failed", err);
    return false;
  }
}

export async function cancelLocal(id) {
  return cancelLocalIds([id]);
}

export async function cancelLocalIds(ids) {
  const clean = (ids || []).filter((id) => id !== undefined && id !== null);
  if (clean.length === 0) return;
  try {
    await LocalNotifications.cancel({ notifications: clean.map((id) => ({ id })) });
  } catch (err) {
    console.error("[notifications] cancelLocalIds failed", err);
  }
}

// ── Shared "current date" hook ──────────────────────────────
// Replaces the interval + visibilitychange/focus pattern that used to be
// duplicated locally in SleepModule and PaymentsModule.
export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState(getTodayStr());
  useEffect(() => {
    const check = () => {
      const fresh = getTodayStr();
      setCurrentDate((prev) => (prev !== fresh ? fresh : prev));
    };
    const interval = setInterval(check, 60 * 1000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);
  return currentDate;
}

// ── Generic diff-and-reschedule helper ──────────────────────
// scheduledMap: { [logicalKey]: notificationId } — persisted by the caller
// (each category hook keeps its own localStorage-backed map).
//
// desired: array of either
//   { key, title, body, at }                       — one-off
//   { key, title, body, repeating: { weekday?, hour, minute } } — recurring
//
// Anything in scheduledMap that's no longer in `desired` gets cancelled.
// Anything in `desired` that's not yet in scheduledMap gets scheduled.
// Already-scheduled items are left alone (no unnecessary re-scheduling).
export async function syncNotifications(desired, scheduledMap, setScheduledMap) {
  const map = scheduledMap || {};
  const desiredKeys = new Set(desired.map((d) => d.key));
  const staleKeys = Object.keys(map).filter((k) => !desiredKeys.has(k));

  if (staleKeys.length > 0) {
    await cancelLocalIds(staleKeys.map((k) => map[k]));
  }

  const nextMap = { ...map };
  staleKeys.forEach((k) => delete nextMap[k]);

  let addedAny = false;
  for (const item of desired) {
    if (nextMap[item.key]) continue; // already scheduled — nothing changed
    const id = hashId(item.key);
    const ok = item.repeating
      ? await scheduleRepeating(id, item.title, item.body, item.repeating)
      : await scheduleLocal(id, item.title, item.body, item.at);
    if (ok) {
      nextMap[item.key] = id;
      addedAny = true;
    }
  }

  if (addedAny || staleKeys.length > 0) {
    setScheduledMap(nextMap);
  }
}

// Cancel every notification tracked under a category's scheduled map and
// clear the map — used when a category gets toggled off in Settings.
export async function clearAllScheduled(scheduledMap, setScheduledMap) {
  const ids = Object.values(scheduledMap || {});
  if (ids.length > 0) await cancelLocalIds(ids);
  if (Object.keys(scheduledMap || {}).length > 0) setScheduledMap({});
}

// Fixed time-of-day used for lead-day style reminders (payments, debts,
// deadlines, exams) since those categories don't have a natural "time"
// of their own the way reading/medicine do.
export const REMINDER_HOUR = 9;
export const REMINDER_MINUTE = 0;