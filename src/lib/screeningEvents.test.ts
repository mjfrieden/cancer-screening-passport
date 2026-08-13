import { describe, expect, it } from 'vitest';
import { ScreeningEvent } from '../types';
import { getCareStatus, hasUnresolvedAbnormalResult, legacyStatusForCareStatus, removeScreeningEvent, upsertScreeningEvent } from './screeningEvents';

function screeningEvent(overrides: Partial<ScreeningEvent> = {}): ScreeningEvent {
  return {
    id: 'screening-1',
    userId: 'patient-1',
    type: 'colonoscopy',
    date: '2026-01-10',
    result: 'Normal',
    isAbnormal: false,
    status: 'completed',
    source: 'patient_entered',
    ...overrides,
  };
}

describe('screening event collection helpers', () => {
  it('adds a newly created screening record', () => {
    const next = screeningEvent();
    expect(upsertScreeningEvent([], next)).toEqual([next]);
  });

  it('replaces a corrected record without duplicating it', () => {
    const original = screeningEvent();
    const corrected = screeningEvent({ result: 'Adenomatous polyp', isAbnormal: true });
    const result = upsertScreeningEvent([original], corrected);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(corrected);
  });

  it('removes only the selected screening record', () => {
    const first = screeningEvent();
    const second = screeningEvent({ id: 'screening-2', type: 'mammogram' });

    expect(removeScreeningEvent([first, second], first.id)).toEqual([second]);
  });

  it('keeps legacy abnormal records open for follow-up', () => {
    const abnormal = screeningEvent({ isAbnormal: true, result: 'Positive' });
    expect(getCareStatus(abnormal)).toBe('follow_up_needed');
    expect(hasUnresolvedAbnormalResult(abnormal)).toBe(true);
  });

  it('closes an abnormal record only when explicitly resolved', () => {
    const resolved = screeningEvent({ isAbnormal: true, careStatus: 'resolved' });
    expect(hasUnresolvedAbnormalResult(resolved)).toBe(false);
  });

  it('maps patient workflow states to the legacy query status', () => {
    expect(legacyStatusForCareStatus('order_requested')).toBe('ordered');
    expect(legacyStatusForCareStatus('scheduled')).toBe('scheduled');
    expect(legacyStatusForCareStatus('follow_up_needed')).toBe('completed');
  });
});
