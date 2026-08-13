import { describe, expect, it } from 'vitest';
import { buildScreeningCalendar } from './calendar';

describe('screening calendar export', () => {
  it('creates a privacy-safe all-day calendar event', () => {
    const calendar = buildScreeningCalendar({
      id: 'event-1',
      userId: 'patient-1',
      type: 'mammogram',
      date: '2026-09-10',
      appointmentDate: '2026-10-02',
      result: '',
      isAbnormal: false,
      status: 'scheduled',
      careStatus: 'scheduled',
    });

    expect(calendar).toContain('DTSTART;VALUE=DATE:20261002');
    expect(calendar).toContain('SUMMARY:MAMMOGRAM screening appointment');
    expect(calendar).not.toContain('patient-1');
    expect(calendar).not.toContain('result');
  });
});
