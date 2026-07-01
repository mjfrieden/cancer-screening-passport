export interface UserProfile {
  userId: string;
  name: string;
  dob: string;
  sexAssignedAtBirth: "male" | "female";
  genderIdentity: string;
  smokingHistory: {
    status: "never" | "former" | "current";
    packYears: number;
    quitDate?: string;
  };
  personalHistoryOfCancer: boolean;
  immunocompromised: boolean;
  cervixPresent: boolean;
  survivorshipPlan?: SurvivorshipPlan;
}

export interface SurvivorshipPlan {
  cancerType: string;
  diagnosisDate: string;
  stage: string;
  treatments: string[];
  lastFollowUp?: string;
}

export interface ScreeningEvent {
  id: string;
  userId: string;
  type: "mammogram" | "pap" | "hpv" | "colonoscopy" | "fit" | "cologuard" | "ldct" | "psa" | "surveillance_imaging" | "marker_check";
  date: string;
  result: string;
  isAbnormal: boolean;
  status: "completed" | "scheduled" | "ordered";
}

export interface Recommendation {
  id: string;
  cancer_type: string;
  status: "due_now" | "coming_soon" | "completed" | "overdue" | "not_recommended" | "needs_review" | "survivorship" | "prevention";
  recommended_action: string;
  screening_modality: string;
  due_date: string;
  reason: string;
  source: string;
  source_version: string;
  source_url: string;
  recommendation_grade: string;
  confidence: "high" | "medium" | "low";
  requires_clinician_review: boolean;
  clinical_review_status: "source_traced" | "needs_clinical_review" | "physician_reviewed";
  clinical_review_note: string;
}
