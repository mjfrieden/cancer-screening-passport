import { describe, expect, it } from 'vitest';
import { Recommendation } from '../types';
import { COLORECTAL_SCREENING_CHOICES, getColorectalChoiceRecommendation } from './screeningChoices';

function recommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'crc-rec',
    cancer_type: 'colorectal',
    status: 'due_now',
    recommended_action: 'Complete screening',
    screening_modality: 'Colonoscopy / Stool-based Test',
    due_date: '2026-08-13',
    reason: 'Average-risk screening is due.',
    source: 'USPSTF',
    source_version: '2021',
    source_url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
    recommendation_grade: 'A',
    confidence: 'high',
    requires_clinician_review: false,
    clinical_review_status: 'source_traced',
    clinical_review_note: 'General guideline abstraction for average-risk screening.',
    ...overrides,
  };
}

describe('screening choice aid', () => {
  it('contains only trackable colorectal choices with explicit abnormal follow-up', () => {
    expect(COLORECTAL_SCREENING_CHOICES.map(choice => choice.type)).toEqual(['fit', 'cologuard', 'colonoscopy']);
    for (const choice of COLORECTAL_SCREENING_CHOICES) {
      expect(choice.abnormalFollowUp.length).toBeGreaterThan(40);
    }
    const stoolChoices = COLORECTAL_SCREENING_CHOICES.filter(choice => choice.type !== 'colonoscopy');
    expect(stoolChoices.every(choice => choice.abnormalFollowUp.toLowerCase().includes('colonoscopy'))).toBe(true);
  });

  it('appears for an actionable average-risk colorectal recommendation', () => {
    const eligible = recommendation();
    expect(getColorectalChoiceRecommendation([eligible])).toBe(eligible);
  });

  it('stays hidden when individualized clinician review is required', () => {
    expect(getColorectalChoiceRecommendation([
      recommendation({ status: 'needs_review', requires_clinician_review: true }),
    ])).toBeUndefined();
  });

  it('stays hidden when routine screening is already complete', () => {
    expect(getColorectalChoiceRecommendation([
      recommendation({ status: 'completed' }),
    ])).toBeUndefined();
  });
});
