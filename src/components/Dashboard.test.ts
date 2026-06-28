import { describe, expect, it } from 'vitest';
import { calculateNextDueDate } from './Dashboard';

describe('calculateNextDueDate', () => {
  it('uses a routine 10-year interval for a normal colonoscopy with no polyps', () => {
    expect(calculateNextDueDate('colonoscopy', '2026-06-27', false, 'Normal (No polyps)')).toMatchObject({
      date: '2036-06-27',
      isUrgent: false,
    });
  });

  it('uses accelerated surveillance for an adenomatous polyp finding', () => {
    expect(calculateNextDueDate('colonoscopy', '2026-06-27', true, 'Adenomatous polyp(s)')).toMatchObject({
      date: '2029-06-27',
    });
  });
});
