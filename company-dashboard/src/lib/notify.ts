/**
 * Thin wrapper over the browser Notification API, used by the Settings toggles
 * and the live-sync loop in App.tsx. No-ops gracefully where notifications
 * aren't available or permission was denied.
 */

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Ask for permission if it hasn't been decided yet. Returns whether we can notify. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function sendNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/technova-logo.svg" });
  } catch {
    /* some browsers throw for non-persistent notifications in certain contexts */
  }
}
