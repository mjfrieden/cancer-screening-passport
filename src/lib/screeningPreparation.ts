import { ScreeningEvent } from '../types';

const PREPARATION_BY_TYPE: Partial<Record<ScreeningEvent['type'], string[]>> = {
  colonoscopy: [
    'Confirm bowel-preparation instructions with the clinic',
    'Review medication changes with the prescribing clinician',
    'Arrange a ride home if sedation is planned',
    'Confirm arrival time and what liquids are allowed',
  ],
  fit: [
    'Check the kit expiration date',
    'Read the collection instructions before starting',
    'Confirm how and when to return the sample',
  ],
  cologuard: [
    'Read the collection instructions before starting',
    'Confirm the return-shipping deadline',
    'Keep the kit materials together until collection',
  ],
  mammogram: [
    'Bring details of prior breast imaging locations',
    'Avoid deodorant, powder, or lotion on the chest and underarms that day',
    'Tell the center about pregnancy, symptoms, implants, or mobility needs',
  ],
  pap: [
    'Ask the clinic whether timing around your period matters',
    'Avoid vaginal medicines or products if the clinic instructs you to',
    'Write down prior abnormal results or treatment dates',
  ],
  hpv: [
    'Confirm whether this is clinician-collected or self-collected',
    'Follow the clinic or kit instructions for vaginal products',
    'Write down prior abnormal HPV or cervical results',
  ],
  ldct: [
    'Confirm this is a low-dose lung screening CT',
    'Bring smoking-history and prior chest-imaging details',
    'Ask whether insurance authorization is complete',
  ],
  psa: [
    'Ask whether medicines or recent procedures could affect the result',
    'Prepare questions about benefits, harms, and what happens after an elevated result',
  ],
};

export function getPreparationItems(type: ScreeningEvent['type']): string[] {
  return PREPARATION_BY_TYPE[type] ?? [
    'Confirm the appointment location and arrival time',
    'Ask the care team whether preparation or medication changes are needed',
    'Bring relevant prior reports or imaging details',
  ];
}
