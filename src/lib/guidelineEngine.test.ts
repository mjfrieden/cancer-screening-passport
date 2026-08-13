import { describe, expect, it } from 'vitest';
import { getRecommendations } from './guidelineEngine';
import { ScreeningEvent, UserProfile } from '../types';

function baseProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'test-user',
    name: 'Test Patient',
    dob: '1970-01-01',
    sexAssignedAtBirth: 'female',
    genderIdentity: 'female',
    smokingHistory: { status: 'never', packYears: 0 },
    personalHistoryOfCancer: false,
    immunocompromised: false,
    cervixPresent: true,
    screeningRiskFactors: {
      familyCancerHistory: 'no',
      knownHereditaryCancerRisk: 'no',
      priorHighRiskFinding: 'no',
      inflammatoryBowelDisease: 'no',
      chestRadiationBefore30: 'no',
      immunocompromisedOrHiv: 'no',
      desExposure: 'no',
    },
    ...overrides,
  };
}

function event(overrides: Partial<ScreeningEvent>): ScreeningEvent {
  return {
    id: 'event-1',
    userId: 'test-user',
    type: 'colonoscopy',
    date: '2024-02-20',
    result: 'Normal',
    isAbnormal: false,
    status: 'completed',
    ...overrides,
  };
}

describe('guideline recommendation engine', () => {
  it('projects colorectal due date from the most recent colonoscopy', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'older', type: 'colonoscopy', date: '2015-01-01' }),
      event({ id: 'newer', type: 'colonoscopy', date: '2024-02-20' }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.due_date).toBe('2034-02-20');
    expect(crc?.status).toBe('completed');
  });

  it('does not treat a completed test awaiting results as a normal screening result', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({
        id: 'awaiting-result',
        type: 'colonoscopy',
        date: '2026-02-20',
        result: '',
        careStatus: 'completed',
      }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.due_date).not.toBe('2036-02-20');
    expect(crc?.status).toBe('due_now');
  });

  it('routes a positive FIT to diagnostic colonoscopy follow-up', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'fit-1', type: 'fit', date: '2024-05-05', result: 'Positive', isAbnormal: true }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.recommended_action).toContain('Diagnostic colonoscopy');
    expect(crc?.requires_clinician_review).toBe(true);
    expect(crc?.status).toBe('due_now');
  });

  it('treats stool DNA screening history like a colorectal stool-based test', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'cologuard-1', type: 'cologuard', date: '2024-05-05', result: 'Negative / Normal', isAbnormal: false }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.source).toBe('USPSTF');
    expect(crc?.due_date).toBe('2027-05-05');
  });

  it('shortens surveillance after an abnormal colonoscopy with adenomatous findings', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'col-1', type: 'colonoscopy', date: '2022-05-05', result: 'Adenomatous polyp(s)', isAbnormal: true }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.due_date).toBe('2029-05-05');
    expect(crc?.requires_clinician_review).toBe(true);
  });

  it('uses a three-year interval for advanced colonoscopy findings', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'col-adv', type: 'colonoscopy', date: '2022-05-05', result: 'Advanced adenoma with villous features', isAbnormal: true }),
    ]);

    const crc = recommendations.find(rec => rec.id === 'crc-rec');
    expect(crc?.due_date).toBe('2025-05-05');
    expect(crc?.source).toBe('USMSTF');
  });

  it('uses HPV history to project a five-year cervical screening interval', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'hpv-1', type: 'hpv', date: '2023-05-05', result: 'HPV Negative' }),
    ]);

    const cervical = recommendations.find(rec => rec.id === 'cervical-rec');
    expect(cervical?.due_date).toBe('2028-05-05');
  });

  it('shortens cervical follow-up for abnormal Pap history and marks clinician review', () => {
    const recommendations = getRecommendations(baseProfile(), [
      event({ id: 'pap-1', type: 'pap', date: '2024-05-05', result: 'ASC-US', isAbnormal: true }),
    ]);

    const cervical = recommendations.find(rec => rec.id === 'cervical-rec');
    expect(cervical?.due_date).toBe('2025-05-05');
    expect(cervical?.requires_clinician_review).toBe(true);
  });

  it('does not recommend breast or cervical screening for male profiles', () => {
    const recommendations = getRecommendations(baseProfile({
      sexAssignedAtBirth: 'male',
      genderIdentity: 'male',
      cervixPresent: false,
    }));

    expect(recommendations.some(rec => rec.id === 'breast-rec')).toBe(false);
    expect(recommendations.some(rec => rec.id === 'cervical-rec')).toBe(false);
  });

  it('adds lung screening only for eligible smoking history', () => {
    const ineligible = getRecommendations(baseProfile({
      dob: '1970-01-01',
      smokingHistory: { status: 'former', packYears: 10, quitDate: '2020-01-01' },
    }));
    const eligible = getRecommendations(baseProfile({
      dob: '1970-01-01',
      smokingHistory: { status: 'current', packYears: 25 },
    }));

    expect(ineligible.some(rec => rec.id === 'lung-rec')).toBe(false);
    expect(eligible.some(rec => rec.id === 'lung-rec')).toBe(true);
  });

  it('does not emit stale fixed launch-date placeholders', () => {
    const recommendations = getRecommendations(baseProfile({
      personalHistoryOfCancer: true,
      survivorshipPlan: {
        cancerType: 'breast',
        diagnosisDate: '2024-01-15',
        stage: '2',
        treatments: ['Surgery', 'Hormonal Therapy'],
      },
    }));

    expect(recommendations.map(rec => rec.due_date)).not.toContain('2026-05-03');
  });

  it('attaches source trace metadata to every recommendation', () => {
    const recommendations = getRecommendations(baseProfile({
      sexAssignedAtBirth: 'male',
      genderIdentity: 'male',
      cervixPresent: false,
      smokingHistory: { status: 'current', packYears: 25 },
      personalHistoryOfCancer: true,
      survivorshipPlan: {
        cancerType: 'prostate',
        diagnosisDate: '2023-06-01',
        stage: '2',
        treatments: ['Radiation', 'Hormonal Therapy'],
      },
    }));

    expect(recommendations.length).toBeGreaterThan(0);
    for (const rec of recommendations) {
      expect(rec.source_url).toMatch(/^https:\/\//);
      expect(rec.clinical_review_note.length).toBeGreaterThan(20);
      expect(['physician_reviewed', 'needs_clinical_review']).toContain(rec.clinical_review_status);
    }
  });

  it('keeps survivorship abstractions behind patient-specific clinician review', () => {
    const recommendations = getRecommendations(baseProfile({
      personalHistoryOfCancer: true,
      survivorshipPlan: {
        cancerType: 'breast',
        diagnosisDate: '2024-01-15',
        stage: '2',
        treatments: ['Surgery', 'Hormonal Therapy'],
      },
    }));

    const survivorship = recommendations.filter(rec => rec.status === 'survivorship');
    expect(survivorship.length).toBeGreaterThan(0);
    for (const rec of survivorship) {
      expect(rec.requires_clinician_review).toBe(true);
      expect(rec.clinical_review_status).toBe('needs_clinical_review');
      expect(rec.source_url).toBe('https://www.nccn.org/guidelines/category_1');
    }
  });

  it('fails safely when the screening risk review is missing', () => {
    const profile = baseProfile();
    delete profile.screeningRiskFactors;

    const recommendations = getRecommendations(profile);
    const screeningRecommendations = recommendations.filter(rec =>
      ['crc-rec', 'breast-rec', 'cervical-rec'].includes(rec.id),
    );

    expect(screeningRecommendations).toHaveLength(3);
    for (const rec of screeningRecommendations) {
      expect(rec.status).toBe('needs_review');
      expect(rec.due_date).toBe('Pending clinician review');
      expect(rec.clinical_review_status).toBe('needs_clinical_review');
    }
  });

  it('does not apply average-risk cervical timing to an immunocompromised patient', () => {
    const profile = baseProfile({
      immunocompromised: true,
      screeningRiskFactors: {
        ...baseProfile().screeningRiskFactors!,
        immunocompromisedOrHiv: 'yes',
      },
    });

    const cervical = getRecommendations(profile).find(rec => rec.id === 'cervical-rec');
    expect(cervical?.status).toBe('needs_review');
    expect(cervical?.reason).toContain('immune compromise');
  });

  it('routes hereditary or family colorectal risk to clinician review', () => {
    const profile = baseProfile({
      screeningRiskFactors: {
        ...baseProfile().screeningRiskFactors!,
        familyCancerHistory: 'yes',
        knownHereditaryCancerRisk: 'not_sure',
      },
    });

    const colorectal = getRecommendations(profile).find(rec => rec.id === 'crc-rec');
    expect(colorectal?.status).toBe('needs_review');
    expect(colorectal?.recommendation_grade).toBe('Individualized');
  });
});
