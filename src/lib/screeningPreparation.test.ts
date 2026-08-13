import { describe, expect, it } from 'vitest';
import { getPreparationItems } from './screeningPreparation';

describe('screening preparation', () => {
  it('provides test-specific colonoscopy support with a medication safety warning', () => {
    const items = getPreparationItems('colonoscopy');
    expect(items.some(item => item.includes('medication'))).toBe(true);
    expect(items.some(item => item.includes('ride home'))).toBe(true);
  });

  it('provides a safe fallback for survivorship tests', () => {
    expect(getPreparationItems('surveillance_imaging').length).toBeGreaterThan(1);
  });
});
