import { ScreeningEvent } from '../types';

export function getScreeningReminder(event: ScreeningEvent, today = new Date()): string | null {
  if (!event.appointmentDate || !event.reminderPreference || event.reminderPreference === 'none') return null;

  const appointment = new Date(`${event.appointmentDate}T12:00:00`);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const days = Math.round((appointment.getTime() - current.getTime()) / 86_400_000);
  const shouldShowWeek = ['one_week', 'both'].includes(event.reminderPreference) && days <= 7 && days > 1;
  const shouldShowDay = ['one_day', 'both'].includes(event.reminderPreference) && days <= 1 && days >= 0;

  if (days < 0) return 'The scheduled date has passed. Update the appointment or record what happened.';
  if (days === 0 && shouldShowDay) return 'Your screening appointment is today.';
  if (days === 1 && shouldShowDay) return 'Your screening appointment is tomorrow.';
  if (shouldShowWeek) return `Your screening appointment is in ${days} days.`;
  return null;
}
