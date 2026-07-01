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
      date: '2033-06-27',
    });
  });

  it('routes a positive FIT to diagnostic colonoscopy follow-up', () => {
    expect(calculateNextDueDate('fit', '2026-06-27', true, 'Positive')).toMatchObject({
      date: '2026-06-27',
      isUrgent: true,
    });
  });

  it('uses a 3-year interval for a negative stool DNA test', () => {
    expect(calculateNextDueDate('cologuard', '2026-06-27', false, 'Negative / Normal')).toMatchObject({
      date: '2029-06-27',
      isUrgent: false,
    });
  });

  it('routes a positive stool DNA test to diagnostic colonoscopy follow-up', () => {
    expect(calculateNextDueDate('cologuard', '2026-06-27', true, 'Positive')).toMatchObject({
      date: '2026-06-27',
      isUrgent: true,
    });
  });

  it('uses a six month interval for a probably benign mammogram finding', () => {
    expect(calculateNextDueDate('mammogram', '2026-06-27', false, 'BI-RADS 3 - Probably benign')).toMatchObject({
      date: '2026-12-27',
      isUrgent: false,
    });
  });

  it('uses a three month interval for Lung-RADS 4A', () => {
    expect(calculateNextDueDate('ldct', '2026-06-27', false, 'Lung-RADS 4A')).toMatchObject({
      date: '2026-09-27',
      isUrgent: false,
    });
  });

  it('uses ASCCP-style short interval follow-up for a high-grade cervical abnormality', () => {
    expect(calculateNextDueDate('pap', '2026-06-27', true, 'HSIL')).toMatchObject({
      date: '2026-12-27',
      isUrgent: true,
    });
  });

  it('uses a five-year interval for a negative HPV result', () => {
    expect(calculateNextDueDate('hpv', '2026-06-27', false, 'HPV Negative')).toMatchObject({
      date: '2031-06-27',
      isUrgent: false,
    });
  });
});
