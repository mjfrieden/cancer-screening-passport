import { useState } from 'react';
import { Recommendation, ScreeningEvent, UserProfile } from '../types';
import InteractiveScreeningGuide from './InteractiveScreeningGuide';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, Calendar, ChevronRight, Info, Activity, Shield, Award } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateNextDueDate(type: string, dateStr: string, isAbnormal: boolean, resultText: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  let yearsToAdd = 1;
  let rationale = '';

  const cleanType = type.toLowerCase();
  const cleanResult = resultText.toLowerCase();
  
  if (cleanType.includes('colonoscopy')) {
    const explicitlyNormal = cleanResult.includes('normal') || cleanResult.includes('no polyp') || cleanResult.includes('no polyps') || cleanResult.includes('negative') || cleanResult.includes('hyperplastic') || cleanResult.includes('benign');
    const highRisk = cleanResult.includes('advanced') || cleanResult.includes('villous') || cleanResult.includes('high-grade dysplasia') || cleanResult.includes('high grade') || cleanResult.includes('multiple') || cleanResult.includes('10 mm') || cleanResult.includes('sessile serrated') || cleanResult.includes('serrated');
    const immediateReview = cleanResult.includes('suspicious') || cleanResult.includes('malignant') || cleanResult.includes('cancer') || cleanResult.includes('residual') || cleanResult.includes('incomplete') || cleanResult.includes('piecemeal');

    if (immediateReview) {
      yearsToAdd = 0;
      rationale = 'Concerning colonoscopy findings or incomplete resection should prompt immediate physician review and diagnostic follow-up.';
    } else if (!explicitlyNormal && (isAbnormal || cleanResult.includes('adenomatous') || cleanResult.includes('polyp') || cleanResult.includes('abnormal'))) {
      yearsToAdd = highRisk ? 3 : 7;
      rationale = highRisk
        ? 'High-risk adenoma findings generally shorten colonoscopy surveillance to about 3 years.'
        : 'Low-risk adenoma findings generally shorten colonoscopy surveillance to about 7 years.';
    } else {
      yearsToAdd = 10;
      rationale = 'Routine 10-year surveillance cycle for average-risk patient.';
    }
  } else if (cleanType.includes('fit')) {
    if (isAbnormal || cleanResult.includes('positive') || cleanResult.includes('blood detected') || cleanResult.includes('abnormal')) {
      yearsToAdd = 0; // Immediate
      rationale = 'Positive FIT requires physician review and diagnostic colonoscopy follow-up.';
    } else {
      yearsToAdd = 1;
      rationale = 'Standard 1-year annual cycle for non-invasive FIT screening.';
    }
  } else if (cleanType.includes('mammogram') || cleanType.includes('mammography') || cleanType.includes('breast')) {
    if (cleanResult.includes('birads 4') || cleanResult.includes('birads 5') || cleanResult.includes('suspicious') || cleanResult.includes('incomplete')) {
      yearsToAdd = 0;
      rationale = 'Suspicious mammography findings should trigger diagnostic imaging and physician review.';
    } else if (isAbnormal || cleanResult.includes('bi-rads 3') || cleanResult.includes('birads 3')) {
      yearsToAdd = 0.5; // 6 months
      rationale = 'Short-interval diagnostic evaluation (6 months) requested due to abnormal findings.';
    } else {
      yearsToAdd = 2;
      rationale = 'Standard 2-year screening mammography interval for average-risk profile.';
    }
  } else if (cleanType.includes('pap') || cleanType.includes('cervical') || cleanType.includes('hpv')) {
    const highGrade = cleanResult.includes('hsil') || cleanResult.includes('asc-h') || cleanResult.includes('agc') || cleanResult.includes('cin 2') || cleanResult.includes('cin 3') || cleanResult.includes('high grade') || cleanResult.includes('carcinoma') || cleanResult.includes('cancer');
    const lowGrade = isAbnormal || cleanResult.includes('asc-us') || cleanResult.includes('ascus') || cleanResult.includes('lsil') || cleanResult.includes('hpv positive') || cleanResult.includes('positive') || cleanResult.includes('abnormal');

    if (highGrade) {
      yearsToAdd = 0.5;
      rationale = 'Higher-grade cervical abnormality logged. ASCCP-style follow-up should be clinician-reviewed and short interval.';
    } else if (cleanType.includes('hpv') && cleanResult.includes('negative')) {
      yearsToAdd = 5;
      rationale = 'Negative hrHPV result supports a standard 5-year interval when used for primary HPV or cotesting.';
    } else if (cleanType.includes('hpv')) {
      yearsToAdd = 1;
      rationale = 'HPV positivity shortens follow-up under ASCCP-style risk-based management.';
    } else if (lowGrade) {
      yearsToAdd = 1;
      rationale = 'Low-grade cervical abnormality logged. ASCCP-style follow-up commonly shortens to 1 year.';
    } else {
      yearsToAdd = 3;
      rationale = 'Routine 3-year interval for cervical cytology screening.';
    }
  } else if (cleanType.includes('ldct') || cleanType.includes('lung')) {
    if (cleanResult.includes('lung-rads 4b') || cleanResult.includes('lung-rads 4x') || cleanResult.includes('suspicious') || cleanResult.includes('high suspicion')) {
      yearsToAdd = 0;
      rationale = 'Suspicious lung screening findings should prompt physician review and diagnostic work-up.';
    } else if (cleanResult.includes('lung-rads 4a')) {
      yearsToAdd = 0.25;
      rationale = 'Lung-RADS 4A commonly uses 3-month LDCT follow-up.';
    } else if (cleanResult.includes('lung-rads 3')) {
      yearsToAdd = 0.5;
      rationale = 'Lung-RADS 3 commonly uses 6-month LDCT follow-up.';
    } else if (isAbnormal) {
      yearsToAdd = 0.5;
      rationale = 'Frequent 6-month CT intervals suggested for indeterminate nodules.';
    } else {
      yearsToAdd = 1;
      rationale = 'Annual low-dose computed tomography (LDCT) for qualifying lung screening cohort.';
    }
  } else if (cleanType.includes('psa') || cleanType.includes('prostate')) {
    if (cleanResult.includes('elevated') || cleanResult.includes('high') || cleanResult.includes('abnormal')) {
      yearsToAdd = 0;
      rationale = 'Elevated PSA should prompt physician review and individualized follow-up.';
    } else {
      yearsToAdd = 2;
      rationale = 'Standard 2-year follow-up for prostate specific antigen tracking.';
    }
  } else {
    // defaults
    yearsToAdd = 1;
    rationale = 'Standard annual health screening and prevention review cycle.';
  }

  const nextDate = new Date(date);
  if (yearsToAdd === 0.5) {
    nextDate.setMonth(nextDate.getMonth() + 6);
  } else if (yearsToAdd === 0.25) {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (yearsToAdd === 0) {
    // Immediate follow-up uses the logged date rather than inventing a future interval.
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + Math.floor(yearsToAdd));
  }

  const nextDateStr = isNaN(nextDate.getTime()) ? 'Pending Review' : formatLocalDate(nextDate);

  return {
    date: nextDateStr,
    rationale,
    isUrgent: yearsToAdd === 0 || (isAbnormal && yearsToAdd <= 1)
  };
}

function getClinicalMetrics(type: string, isAbnormal: boolean) {
  const cleanType = type.toLowerCase();
  
  if (cleanType.includes('colonoscopy')) {
    return {
      sensitivity: '95% (for adenomas ≥10mm)',
      specificity: '89-98% (highly accurate for visual lesions)',
      riskReduction: '60-90% reduction in colorectal cancer mortality',
      standard: 'USPSTF Grade A',
      priority: isAbnormal ? 'Urgently Critical' : 'Routine Surveillance',
      clinicalNotes: 'Endoscopic visualization of the entire large bowel. Direct excision of precancerous polyps.',
      targetTarget: 'Ages 45-75 years, every 10 years standard'
    };
  } else if (cleanType.includes('fit') || cleanType.includes('fecal')) {
    return {
      sensitivity: '79% (high-grade detection rate)',
      specificity: '94% (low false-positive rate)',
      riskReduction: '22-30% mortality reduction with annual screening cohort compliance',
      standard: 'USPSTF Grade A',
      priority: isAbnormal ? 'High / Referral Required' : 'Annual Preventive Cycle',
      clinicalNotes: 'Non-invasive stool-based immunological assay detecting hemoglobin globin chain markers.',
      targetTarget: 'Annual interval, Ages 45-75 years'
    };
  } else if (cleanType.includes('mammogram') || cleanType.includes('mammography') || cleanType.includes('breast')) {
    return {
      sensitivity: '84-87% (lower in fibrous/dense breast tissues)',
      specificity: '88-90% (improved with comparative digital views)',
      riskReduction: '20-30% diagnostic reduction in specific mortality',
      standard: 'USPSTF Grade B',
      priority: isAbnormal ? 'Diagnostic Evaluation Required' : 'Biennial Screening Follow-up',
      clinicalNotes: 'Low-dose breast radiography mapping microcalcifications and mass densities.',
      targetTarget: 'Ages 40-74 years, every 2 years standard'
    };
  } else if (cleanType.includes('pap') || cleanType.includes('cervical') || cleanType.includes('hpv')) {
    return {
      sensitivity: '80% (cytology alone), 95% (with HPV co-testing)',
      specificity: '86% (cytology alone), 90% (with co-testing markers)',
      riskReduction: 'Over 80% decrease in invasive cervical cancer incidence rates',
      standard: 'USPSTF Grade A',
      priority: isAbnormal ? 'Short-interval cytological surveillance' : 'Triennial Routine Surveillance',
      clinicalNotes: 'Cytopathological evaluation of epithelial cells collected from the squamocolumnar zone.',
      targetTarget: 'Ages 21-65 years, every 3-5 years'
    };
  } else if (cleanType.includes('ldct') || cleanType.includes('lung')) {
    return {
      sensitivity: '93% (high identification of solid focal nodules)',
      specificity: '84% (evaluates active subsolid development)',
      riskReduction: '20-24% lung cancer specific mortality reduction in high-risk smoking cohorts',
      standard: 'USPSTF Grade B',
      priority: isAbnormal ? 'Frequent diagnostic follow-up requested' : 'Annual Screening Cycle',
      clinicalNotes: 'Low-dose helical CT imaging mapping thoracic structure morphology and volumetric nodules.',
      targetTarget: 'Ages 50-80 years with 20+ pack-year smoking history'
    };
  } else if (cleanType.includes('psa') || cleanType.includes('prostate')) {
    return {
      sensitivity: '72-80% (high early-stage hyperplasia marker)',
      specificity: '60-70% (limited due to benign conditions overlap)',
      riskReduction: 'Slight reduction in specific prostate cancer lethality',
      standard: 'USPSTF Grade C Recommendation',
      priority: isAbnormal ? 'Urological evaluation recommended' : 'Shared Decision Standard',
      clinicalNotes: 'Serum evaluation of glycoprotein serine protease enzyme secreted by glandular tissues.',
      targetTarget: 'Ages 55-69 years based on individual shared choices'
    };
  } else {
    return {
      sensitivity: '85% aggregate confidence level',
      specificity: '88% baseline control specificity',
      riskReduction: 'Facilitates timely intervention and preemptive clinical management',
      standard: 'Clinical Consensus Guideline',
      priority: 'Routine Baseline',
      clinicalNotes: 'Preventive screening and assessment derived from demographic risk profiles.',
      targetTarget: 'As determined by clinical guidelines'
    };
  }
}

const CustomPoint = (props: any) => {
  const { cx, cy, payload, hoveredPointId, setHoveredPointId } = props;
  if (!cx || !cy) return null;
  const isCompleted = payload.status === 'Completed';
  const isAbnormal = payload.isAbnormal;
  const isUrgent = payload.isUrgent;
  const id = payload.id;
  const isHovered = id === hoveredPointId;

  return (
    <g 
      transform={`translate(${cx}, ${cy})`} 
      className="cursor-pointer"
      onMouseEnter={() => setHoveredPointId && setHoveredPointId(id)}
      onMouseLeave={() => setHoveredPointId && setHoveredPointId(null)}
    >
      {/* Glow outer ring on hover */}
      {isHovered && (
        <>
          <circle 
            r={18} 
            fill={isCompleted ? (isAbnormal ? '#ef4444' : '#10b981') : (isUrgent ? '#ef4444' : '#3b82f6')} 
            opacity={0.15} 
            className="animate-ping"
            style={{ animationDuration: '1.8s' }}
          />
          <circle 
            r={14} 
            fill="none"
            stroke={isCompleted ? (isAbnormal ? '#fca5a5' : '#86efac') : (isUrgent ? '#fca5a5' : '#93c5fd')} 
            strokeWidth={1.5}
            opacity={0.8}
            className="transition-all duration-300"
          />
        </>
      )}

      {isCompleted ? (
        <>
          <circle 
            r={isHovered ? 11 : 8.5} 
            fill={isAbnormal ? '#ef4444' : '#10b981'} 
            stroke="#ffffff" 
            strokeWidth={isHovered ? 2.5 : 1.5} 
            className="transition-all duration-200"
            style={{ filter: isHovered ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
          />
          <path 
            d="M-3.2,-0.5 L-1.1,1.5 L3.2,-2.7" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth={isHovered ? 2 : 1.75} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            transform={isHovered ? "scale(1.2)" : ""}
            className="transition-transform duration-200"
          />
        </>
      ) : (
        <>
          <circle 
            r={isHovered ? 11 : 8.5} 
            fill={isUrgent ? '#ef4444' : '#3b82f6'} 
            stroke="#ffffff" 
            strokeWidth={isHovered ? 2.5 : 1.5} 
            className="transition-all duration-200"
            style={{ filter: isHovered ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
          />
          <circle 
            r={isHovered ? 4.5 : 3} 
            fill="#ffffff" 
            className="transition-all duration-200"
          />
        </>
      )}
    </g>
  );
};

function calculateAge(dobString: string): number {
  if (!dobString) return 45;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface DashboardProps {
  recommendations: Recommendation[];
  events: ScreeningEvent[];
  profile: UserProfile | null;
  onAddEvent?: () => void;
}

export default function Dashboard({ recommendations, events, profile, onAddEvent }: DashboardProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const planRecommendations = recommendations.filter(r => r.status !== 'prevention');

  const categories = [
    { label: 'Due Now', value: 'due_now', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Coming Soon', value: 'coming_soon', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Survivorship', value: 'survivorship', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed', value: 'completed', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const displayEvents = events.filter(e => e.status === 'completed');
  const hasHistory = displayEvents.length > 0;

  // Map events to gather completed and project future due dates
  const parsedEvents = displayEvents.map((evt, idx) => {
    const nextDueInfo = calculateNextDueDate(evt.type, evt.date, evt.isAbnormal || false, evt.result || 'Normal');
    const compDate = new Date(evt.date);
    const dueDate = new Date(nextDueInfo.date);
    const compYear = compDate.getFullYear();
    const dueYear = dueDate.getFullYear();

    let testLabel = evt.type.charAt(0).toUpperCase() + evt.type.slice(1);
    const cleanType = evt.type.toLowerCase();
    if (cleanType.includes('pap')) {
       testLabel = 'Pap Smear';
    } else if (cleanType.includes('hpv')) {
       testLabel = 'HPV Swab';
    } else if (cleanType.includes('mammogram') || cleanType.includes('mammography') || cleanType.includes('breast')) {
       testLabel = 'Mammography';
    } else if (cleanType.includes('colonoscopy')) {
       testLabel = 'Colonoscopy';
    } else if (cleanType.includes('fit')) {
       testLabel = 'FIT Test';
    } else if (cleanType.includes('ldct') || cleanType.includes('lung')) {
       testLabel = 'Lung LDCT';
    } else if (cleanType.includes('psa') || cleanType.includes('prostate')) {
       testLabel = 'Prostate PSA';
    }

    return {
      id: evt.id || `${evt.type}-${evt.date}-${idx}`,
      type: evt.type,
      testLabel,
      completedYear: isNaN(compYear) ? null : compYear,
      completedDateStr: evt.date,
      dueYear: isNaN(dueYear) ? null : dueYear,
      dueDateStr: nextDueInfo.date,
      isAbnormal: evt.isAbnormal,
      result: evt.result || 'Normal',
      nextDueInfo,
    };
  });

  // Helper to determine the dynamic list of relevant category rows for this specific patient
  const getRelevantCategories = (p: UserProfile | null) => {
    const sex = p?.sexAssignedAtBirth;
    const categories = ['Colonoscopy'];
    
    if (sex === 'female') {
      categories.push('Mammography');
      categories.push('Pap Smear');
    } else if (sex === 'male') {
      categories.push('Prostate PSA');
    } else {
      categories.push('Mammography');
      categories.push('Pap Smear');
    }

    if (p?.smokingHistory && p.smokingHistory.status !== 'never' && p.smokingHistory.packYears >= 20) {
      categories.push('Lung LDCT');
    }

    return categories;
  };

  const activeCategories = getRelevantCategories(profile);

  // If there are any other completed events that are not in the default list, add their categories safely
  const getPrimaryCategoryLabel = (type: string): string => {
    const clean = type.toLowerCase();
    if (clean.includes('colon') || clean.includes('fit') || clean.includes('stool') || clean.includes('cologuard') || clean.includes('colorectal')) {
      return 'Colonoscopy';
    }
    if (clean.includes('mammogram') || clean.includes('breast') || clean.includes('mammography')) {
      return 'Mammography';
    }
    if (clean.includes('pap') || clean.includes('cervical') || clean.includes('hpv')) {
      return 'Pap Smear';
    }
    if (clean.includes('psa') || clean.includes('prostate')) {
      return 'Prostate PSA';
    }
    if (clean.includes('lung') || clean.includes('ldct')) {
      return 'Lung LDCT';
    }
    return 'Colonoscopy';
  };

  parsedEvents.forEach(evt => {
    const primaryLabel = getPrimaryCategoryLabel(evt.type);
    if (!activeCategories.includes(primaryLabel)) {
      activeCategories.push(primaryLabel);
    }
  });

  const getCategoryYValue = (primaryLabel: string) => {
    const index = activeCategories.indexOf(primaryLabel);
    return index !== -1 ? index + 1 : 1;
  };

  // Generate continuous timeline data for each active category represented on the Y-Axis
  const testSeries = activeCategories.map(label => {
    const points: any[] = [];
    
    // 1. Gather points from actual history / display events
    const matchingEvents = parsedEvents.filter(e => getPrimaryCategoryLabel(e.type) === label);
    matchingEvents.forEach(evt => {
      if (evt.completedYear) {
        points.push({
          id: `${evt.testLabel}-completed-${evt.completedYear}`,
          year: evt.completedYear,
          testLabel: evt.testLabel,
          status: 'Completed',
          yValue: getCategoryYValue(label),
          dateStr: evt.completedDateStr,
          result: evt.result,
          isAbnormal: evt.isAbnormal,
          clinicalMetrics: getClinicalMetrics(evt.type, evt.isAbnormal || false),
        });
      }
      if (evt.dueYear) {
        points.push({
          id: `${evt.testLabel}-due-${evt.dueYear}`,
          year: evt.dueYear,
          testLabel: evt.testLabel,
          status: 'Next Due',
          yValue: getCategoryYValue(label),
          dateStr: evt.dueDateStr,
          rationale: evt.nextDueInfo.rationale,
          isUrgent: evt.nextDueInfo.isUrgent,
          clinicalMetrics: getClinicalMetrics(evt.type, evt.isAbnormal || false),
        });
      }
    });

    // 2. If no historical points/projections exist for this active category, 
    // inject the upcoming guideline-based recommendation to show on the timeline!
    if (points.length === 0) {
      const activeRec = recommendations.find(r => 
        getPrimaryCategoryLabel(r.cancer_type) === label || 
        getPrimaryCategoryLabel(r.screening_modality) === label
      );
      if (activeRec) {
        const recYear = new Date(activeRec.due_date).getFullYear();
        if (!isNaN(recYear)) {
          points.push({
            id: `${label}-recommended-${recYear}`,
            year: recYear,
            testLabel: label,
            status: 'Next Due',
            yValue: getCategoryYValue(label),
            dateStr: activeRec.due_date,
            rationale: activeRec.reason,
            isUrgent: activeRec.status === 'due_now',
            clinicalMetrics: getClinicalMetrics(activeRec.screening_modality || activeRec.cancer_type, false),
          });
        }
      }
    }

    // Sort points by year for continuous sequential line plotting
    points.sort((a, b) => a.year - b.year);

    return {
      label,
      points,
    };
  });

  const hasTimelineData = testSeries.some(series => series.points.length > 0);

  const allYears = new Set<number>();
  testSeries.forEach(series => {
    series.points.forEach(pt => {
      allYears.add(pt.year);
    });
  });
  
  const currentYear = new Date().getFullYear();
  allYears.add(currentYear);

  const sortedYearsList = Array.from(allYears).sort((a, b) => a - b);
  const minYear = Math.min(...sortedYearsList);
  const maxYear = Math.max(...sortedYearsList);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const count = planRecommendations.filter(r => r.status === cat.value).length + (cat.value === 'completed' && hasHistory ? displayEvents.length : 0);
          return (
            <div key={cat.label} className={cn("p-2.5 sm:p-4 rounded-2xl border border-gray-100 flex items-center gap-2 sm:gap-3 transition-colors", cat.bg)}>
              <div className="p-1.5 sm:p-2 bg-white/75 rounded-xl shrink-0">
                <cat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", cat.color)} />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-2xl font-extrabold leading-none text-gray-900">{count}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium truncate mt-0.5 sm:mt-1">{cat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Your Screening Plan */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Your Screening Plan
          <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded-full">USPSTF Guideline-Based</span>
        </h3>

          {planRecommendations.length === 0 ? (
          <div data-smoke="recommendation-empty" className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {profile
                ? hasHistory
                  ? 'No screening actions are currently due based on your saved profile and history.'
                  : 'No screening actions are currently due. Add prior screenings or abnormal results to improve your timeline.'
                : 'Complete your profile to see guideline-inspired screening reminders.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {planRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a smooth medical/clinical app transition
                  delay: index * 0.06,
                }}
                whileHover={{ y: -3, scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.06)" }}
                whileTap={{ scale: 0.99 }}
                data-smoke="recommendation-card"
                className="group relative p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer shadow-sm hover:border-blue-500/50 hover:shadow-md transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                      {rec.cancer_type.charAt(0).toUpperCase() + rec.cancer_type.slice(1)} Screening
                    </h4>
                    <p className="text-sm text-gray-500">{rec.screening_modality}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                    rec.status === 'due_now' ? 'bg-red-100 text-red-700' : 
                    rec.status === 'survivorship' ? 'bg-purple-100 text-purple-700' :
                    rec.status === 'prevention' ? 'bg-teal-100 text-teal-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {rec.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 py-3 border-y border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: <span className="font-medium text-gray-700">{rec.due_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Grade: <span className="font-medium text-gray-700">{rec.recommendation_grade}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-gray-600 line-clamp-2">
                  {rec.reason}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-400">
                    Source:{' '}
                    <a
                      className="text-blue-600 underline-offset-2 hover:underline"
                      href={rec.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {rec.source} v{rec.source_version}
                    </a>
                    {rec.clinical_review_status === 'physician_reviewed'
                      ? ' • Physician reviewed'
                      : rec.clinical_review_status === 'needs_clinical_review'
                        ? ' • Clinician review needed'
                        : ' • Source traced'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 🔬 Clinical Comparison & Interactive Modality Guide */}
      <div className="pt-4 border-t border-gray-100">
        <InteractiveScreeningGuide profile={profile} />
      </div>

      {/* 2. Enhanced Screening Completion Timeline located underneath the screening plan as requested */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Screening Completion Timeline
              <span className="text-xs font-normal text-emerald-650 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/30">History & Future Projections</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Completed events tracked in your FHIR passport and automatic future schedule projections.
            </p>
          </div>
          {onAddEvent && (
            <button
              type="button"
              onClick={onAddEvent}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Add past screening
            </button>
          )}
        </div>

        {/* Visual History Chart */}
        <div className="p-5 sm:p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-550">Chronological Screening Timeline and next due projections</div>
          {!hasTimelineData ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
              <p className="max-w-md text-sm leading-relaxed text-gray-600">
                No completed screenings are logged yet. Add a past screening or abnormal result to build the timeline and adjust future due dates.
              </p>
              {onAddEvent && (
                <button
                  type="button"
                  onClick={onAddEvent}
                  className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Log past screening
                </button>
              )}
            </div>
          ) : (
            <div className="h-[280px] w-full font-sans text-xs">
          <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={280}
              initialDimension={{ width: 1, height: 280 }}
            >
              <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f3f4f6" />
                <XAxis 
                  type="number" 
                  dataKey="year" 
                  name="Year" 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[minYear - 1, maxYear + 1]}
                  tickCount={maxYear - minYear + 3}
                  tickFormatter={(val) => Math.floor(val).toString()}
                />
                <YAxis 
                  type="number" 
                  dataKey="yValue" 
                  name="Test Category" 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false}
                  width={110}
                  domain={[0.5, activeCategories.length + 0.5]}
                  ticks={Array.from({ length: activeCategories.length }, (_, i) => i + 1)}
                  tickFormatter={(val) => {
                    const idx = Math.round(val) - 1;
                    return activeCategories[idx] || '';
                  }}
                />
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '2 2' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const metrics = data.clinicalMetrics;
                      return (
                        <div className="bg-white p-4 border border-gray-100 shadow-2xl rounded-2xl space-y-3 text-xs w-[280px] sm:w-[325px] transition-all duration-300">
                          {/* Title / Status block */}
                          <div className="border-b border-gray-100 pb-2.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-extrabold text-sm text-gray-900 tracking-tight">{data.testLabel}</span>
                              <span className={cn(
                                "text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border leading-none",
                                data.status === 'Completed' 
                                  ? (data.isAbnormal ? "bg-red-50 text-red-700 border-red-100/60" : "bg-emerald-50 text-emerald-700 border-emerald-100/60")
                                  : (data.isUrgent ? "bg-red-50 text-red-700 border-red-100/60" : "bg-blue-50 text-blue-700 border-blue-100/60")
                              )}>
                                {data.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{data.status === 'Completed' ? 'Completed' : 'Projected Due'}: <strong className="text-gray-700 font-semibold">{data.dateStr}</strong> ({data.year})</span>
                            </div>
                          </div>

                          {/* Primary Findings/Rationale block */}
                          <div className="space-y-1 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                            {data.status === 'Completed' ? (
                              <p className="text-gray-600">
                                Findings Result: <strong className={cn("font-bold", data.isAbnormal ? "text-red-600" : "text-emerald-700")}>{data.result}</strong>
                              </p>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Clinical Rationale</span>
                                <p className="text-gray-600 leading-relaxed text-[11px] font-sans">
                                  {data.rationale}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Rich Clinical Performance metrics */}
                          {metrics && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                <span>Clinical metrics & guidelines</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="bg-blue-50/30 p-2 rounded-md border border-blue-500/10 space-y-0.5">
                                  <span className="text-gray-400 block font-medium">Sensitivity</span>
                                  <span className="font-bold text-blue-900">{metrics.sensitivity}</span>
                                </div>
                                <div className="bg-teal-50/30 p-2 rounded-md border border-teal-500/10 space-y-0.5">
                                  <span className="text-gray-400 block font-medium">Specificity</span>
                                  <span className="font-bold text-teal-900">{metrics.specificity}</span>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700">
                                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{metrics.standard}</span>
                                </div>
                                <p className="text-[10.5px] text-gray-500 leading-normal font-sans">
                                  <span className="font-semibold text-gray-700">Preventive Value:</span> {metrics.riskReduction}
                                </p>
                              </div>

                              <div className="text-[10px] text-gray-400 leading-normal border-t border-gray-50 pt-1.5 italic">
                                Modality notes: {metrics.clinicalNotes}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  payload={[
                    { value: 'Completed Screening', id: 'legend-completed', color: '#10b981' },
                    { value: 'Upcoming Next Due', id: 'legend-due', color: '#3b82f6' },
                  ]} 
                  wrapperStyle={{ fontSize: '11px', color: '#6b7280' }} 
                />
                {testSeries.map((series) => (
                  <Line
                    key={series.label}
                    name={series.label}
                    data={series.points}
                    dataKey="yValue"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={(dotProps: any) => (
                      <CustomPoint 
                        {...dotProps}
                        hoveredPointId={hoveredPointId} 
                        setHoveredPointId={setHoveredPointId} 
                      />
                    )}
                    activeDot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Screening Details List with Next Due details explicitly calculated based on results */}
        <div className="space-y-3.5">
          {displayEvents.map((evt, index) => {
            const nextDueInfo = calculateNextDueDate(evt.type, evt.date, evt.isAbnormal || false, evt.result || 'Normal');
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                      evt.isAbnormal ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {evt.isAbnormal ? "Abnormal Logged" : "Completed findings"}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 font-sans">
                      {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)} Test / Scan
                    </h4>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Completion Date: <strong className="text-gray-700 font-semibold">{evt.date}</strong></div>
                    <div>Recorded Findings: <strong className={evt.isAbnormal ? "text-red-600 font-bold" : "text-gray-700 font-semibold"}>{evt.result}</strong></div>
                  </div>
                  
                  <p className="text-xs text-gray-500 italic pt-1 border-t border-gray-55/80 mt-1 flex items-center gap-1.5 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{nextDueInfo.rationale}</span>
                  </p>
                </div>

                {/* Specific screening next due box */}
                <div className={cn(
                  "p-3.5 rounded-xl border flex flex-col items-start md:items-end justify-center tracking-tight min-w-[190px] shrink-0",
                  nextDueInfo.isUrgent 
                    ? "bg-red-50/75 border-red-100 text-red-900" 
                    : "bg-blue-50/75 border-blue-100/50 text-blue-900"
                )}>
                  <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                    Next Due Date
                  </span>
                  <span className="text-sm font-extrabold flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {nextDueInfo.date}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">
                    Based on findings
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
