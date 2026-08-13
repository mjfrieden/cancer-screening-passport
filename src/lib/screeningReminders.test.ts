import { describe, expect, it } from 'vitest';
import { getScreeningReminder } from './screeningReminders';

const event = {
  id: 'event-1', userId: 'patient-1', type: 'mammogram' as const, date: '2026-08-20', appointmentDate: '2026-08-20',
  result: '', isAbnormal: false, status: 'scheduled' as const, careStatus: 'scheduled' as const,
};

describe('screening reminders', () => {
  it('shows a one-week in-app reminder without health-result details', () => {
    expect(getScreeningReminder({ ...event, reminderPreference: 'one_week' }, new Date('2026-08-14T12:00:00'))).toBe('Your screening appointment is in 6 days.');
  });

  it('shows a next-day reminder', () => {
    expect(getScreeningReminder({ ...event, reminderPreference: 'one_day' }, new Date('2026-08-19T12:00:00'))).toBe('Your screening appointment is tomorrow.');
  });

  it('stays quiet outside the chosen reminder window', () => {
    expect(getScreeningReminder({ ...event, reminderPreference: 'one_day' }, new Date('2026-08-15T12:00:00'))).toBeNull();
  });
});
