export type RiskAnswer = "yes" | "no" | "not_sure";

export interface ScreeningRiskFactors {
  familyCancerHistory: RiskAnswer;
  knownHereditaryCancerRisk: RiskAnswer;
  priorHighRiskFinding: RiskAnswer;
  inflammatoryBowelDisease: RiskAnswer;
  chestRadiationBefore30: RiskAnswer;
  immunocompromisedOrHiv: RiskAnswer;
  desExposure: RiskAnswer;
}

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
  screeningRiskFactors?: ScreeningRiskFactors;
  survivorshipPlan?: SurvivorshipPlan;
}

export interface SurvivorshipPlan {
  cancerType: string;
  diagnosisDate: string;
  stage: string;
  treatments: string[];
  lastFollowUp?: string;
}

export type ScreeningCareStatus =
  | "discuss"
  | "order_requested"
  | "ordered"
  | "scheduled"
  | "completed"
  | "result_received"
  | "follow_up_needed"
  | "resolved";

export type ReminderPreference = "none" | "one_day" | "one_week" | "both";

export interface ScreeningEvent {
  id: string;
  userId: string;
  type: "mammogram" | "pap" | "hpv" | "colonoscopy" | "fit" | "cologuard" | "ldct" | "psa" | "surveillance_imaging" | "marker_check";
  date: string;
  result: string;
  isAbnormal: boolean;
  status: "completed" | "scheduled" | "ordered";
  careStatus?: ScreeningCareStatus;
  appointmentDate?: string;
  reminderPreference?: ReminderPreference;
  preparationCompleted?: string[];
  followUpNote?: string;
  source?: "patient_entered" | "imported" | "clinician_confirmed";
  updatedAt?: string;
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
