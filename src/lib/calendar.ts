import { ScreeningEvent } from '../types';

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function compactDate(date: string): string {
  return date.replaceAll('-', '');
}

function addOneDay(date: string): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + 1);
  return `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, '0')}${String(value.getDate()).padStart(2, '0')}`;
}

export function buildScreeningCalendar(event: ScreeningEvent): string {
  const date = event.appointmentDate || event.date;
  const title = `${event.type.toUpperCase()} screening appointment`;
  const description = 'Cancer Prevention Passport reminder. Confirm appointment details with the clinic.';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//White Cloud Medical//Cancer Prevention Passport//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(event.id)}@cancer-prevention-passport`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${addOneDay(date)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadScreeningCalendar(event: ScreeningEvent): void {
  const blob = new Blob([buildScreeningCalendar(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `screening-appointment-${event.appointmentDate || event.date}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
