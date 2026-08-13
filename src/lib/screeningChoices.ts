import { Recommendation, ScreeningEvent } from '../types';

export interface ScreeningChoice {
  type: Extract<ScreeningEvent['type'], 'fit' | 'cologuard' | 'colonoscopy'>;
  name: string;
  shortName: string;
  interval: string;
  setting: string;
  process: string;
  preparation: string;
  tradeoff: string;
  abnormalFollowUp: string;
}

export const COLORECTAL_SCREENING_CHOICES: ScreeningChoice[] = [
  {
    type: 'fit',
    name: 'FIT stool test',
    shortName: 'FIT',
    interval: 'Every year',
    setting: 'A single small stool sample collected at home.',
    process: 'Use a kit to collect a small stool sample and return it to a laboratory.',
    preparation: 'No bowel preparation or sedation. Follow the instructions supplied with the kit.',
    tradeoff: 'It is noninvasive, but the benefit depends on completing it every year.',
    abnormalFollowUp: 'A colonoscopy is needed to determine why blood was detected.',
  },
  {
    type: 'cologuard',
    name: 'Stool DNA-FIT test',
    shortName: 'stool DNA-FIT',
    interval: 'Every 1 to 3 years',
    setting: 'A whole bowel-movement sample collected at home and mailed to a laboratory.',
    process: 'The laboratory checks the sample for blood and DNA changes associated with colorectal cancer.',
    preparation: 'No bowel preparation or sedation. Follow the collection and shipping instructions carefully.',
    tradeoff: 'It is less frequent than FIT but produces more false-positive results per test than FIT, leading to more follow-up colonoscopies.',
    abnormalFollowUp: 'A colonoscopy is needed to evaluate the abnormal result.',
  },
  {
    type: 'colonoscopy',
    name: 'Screening colonoscopy',
    shortName: 'colonoscopy',
    interval: 'Every 10 years after a normal exam',
    setting: 'An in-person procedure that examines the full colon.',
    process: 'A clinician examines the colon with a flexible camera and can remove polyps during the procedure.',
    preparation: 'Bowel preparation is required. Sedation or anesthesia and transportation home are generally required; follow the facility instructions.',
    tradeoff: 'It is done less often and can remove polyps, but it is invasive and carries small risks including bleeding and perforation.',
    abnormalFollowUp: 'The clinician determines next steps from the findings and pathology; the next interval may be shorter than 10 years.',
  },
];

export function getColorectalChoiceRecommendation(recommendations: Recommendation[]): Recommendation | undefined {
  return recommendations.find(recommendation => (
    recommendation.id === 'crc-rec'
    && ['due_now', 'coming_soon', 'overdue'].includes(recommendation.status)
    && !recommendation.requires_clinician_review
    && recommendation.source === 'USPSTF'
  ));
}
