/**
 * Schedule local notifications for upcoming shifts ("in 1 hour").
 * Used on iOS when USE_PUSH_IOS is false (free Apple ID).
 * Tap navigates to shift details (same as push).
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { USE_PUSH_IOS } from './notification-config';

const REMINDER_ID_BASE = 900000; // Avoid clash with other local notif ids

function stableId(shiftId: string): number {
  let h = 0;
  for (let i = 0; i < shiftId.length; i++) {
    h = (h << 5) - h + shiftId.charCodeAt(i);
    h |= 0;
  }
  return REMINDER_ID_BASE + (Math.abs(h) % 100000);
}

export async function scheduleLocalShiftReminders(shifts: Array<{
  _id: string;
  apartment?: { name?: string };
  scheduledDate: string;
  scheduledStartTime: string;
  status?: string;
}>): Promise<void> {
  if (Capacitor.getPlatform() !== 'ios' || USE_PUSH_IOS) return;

  try {
    const status = await LocalNotifications.requestPermissions();
    if (status.display !== 'granted') return;

    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    const maxMs = 24 * oneHourMs;

    const toSchedule: Array<{ id: number; title: string; body: string; at: Date; shiftId: string }> = [];

    for (const s of shifts) {
      if (s.status === 'cancelled' || s.status === 'completed') continue;
      const start = new Date(s.scheduledStartTime).getTime();
      const reminderAt = start - oneHourMs;
      if (reminderAt <= now || reminderAt - now > maxMs) continue;
      const name = (s.apartment as any)?.name || 'Apartment';
      toSchedule.push({
        id: stableId(s._id),
        title: 'Shift reminder',
        body: `Shift at ${name} in 1 hour`,
        at: new Date(reminderAt),
        shiftId: s._id,
      });
    }

    if (toSchedule.length === 0) return;

    await LocalNotifications.cancel({ notifications: toSchedule.map(n => ({ id: n.id })) });

    await LocalNotifications.schedule({
      notifications: toSchedule.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: { at: n.at, allowWhileIdle: true },
        extra: { shiftId: n.shiftId },
      })),
    });
  } catch (e) {
    console.warn('Local shift reminders:', e);
  }
}
