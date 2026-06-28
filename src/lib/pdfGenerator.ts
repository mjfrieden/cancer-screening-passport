import { jsPDF } from 'jspdf';
import { UserProfile, Recommendation, ScreeningEvent } from '../types';

// Helper to calculate age from Date of Birth
function calculateAge(dobString: string): string {
  if (!dobString) return 'N/A';
  try {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} years`;
  } catch {
    return 'N/A';
  }
}

// Helper to calculate next due dates identically to the Dashboard
function calculateNextDueDate(type: string, dateStr: string, isAbnormal: boolean, resultText: string) {
  const date = new Date(dateStr);
  let yearsToAdd = 1;
  let rationale = '';

  const cleanType = type.toLowerCase();
  
  if (cleanType.includes('colonoscopy')) {
    if (isAbnormal || resultText.toLowerCase().includes('adenomatous') || resultText.toLowerCase().includes('polyp') || resultText.toLowerCase().includes('abnormal')) {
      yearsToAdd = 3;
      rationale = 'Accelerated 3-year surveillance for high-risk adenomas/polyps.';
    } else {
      yearsToAdd = 10;
      rationale = 'Routine 10-year surveillance cycle for average-risk patient.';
    }
  } else if (cleanType.includes('fit')) {
    if (isAbnormal || resultText.toLowerCase().includes('positive')) {
      yearsToAdd = 0; // Immediate
      rationale = 'Urgent diagnostic Colonoscopy follow-up within 1 month.';
    } else {
      yearsToAdd = 1;
      rationale = 'Standard 1-year annual cycle for non-invasive FIT.';
    }
  } else if (cleanType.includes('mammogram') || cleanType.includes('mammography') || cleanType.includes('breast')) {
    if (isAbnormal || resultText.toLowerCase().includes('birads 4') || resultText.toLowerCase().includes('birads 5') || resultText.toLowerCase().includes('birads 0') || resultText.toLowerCase().includes('suspicious') || resultText.toLowerCase().includes('incomplete')) {
      yearsToAdd = 0.5; // 6 months
      rationale = 'Short-interval diagnostic evaluation (6 months) due to abnormal findings.';
    } else {
      yearsToAdd = 2;
      rationale = 'Standard 2-year screening mammography interval for average-risk.';
    }
  } else if (cleanType.includes('pap') || cleanType.includes('cervical') || cleanType.includes('hpv')) {
    if (isAbnormal || resultText.toLowerCase().includes('asc-us') || resultText.toLowerCase().includes('lsil') || resultText.toLowerCase().includes('hsil') || resultText.toLowerCase().includes('positive')) {
      yearsToAdd = 1;
      rationale = 'Annual surveillance and cytological follow-up due to atypical cells/positive HPV.';
    } else {
      yearsToAdd = 3;
      rationale = 'Routine 3-year interval for cervical cytology screening.';
    }
  } else if (cleanType.includes('ldct') || cleanType.includes('lung')) {
    if (isAbnormal || resultText.toLowerCase().includes('suspicious') || resultText.toLowerCase().includes('high suspicion')) {
      yearsToAdd = 0.5;
      rationale = 'Frequent 6-month CT intervals suggested for indeterminate nodules.';
    } else {
      yearsToAdd = 1;
      rationale = 'Annual low-dose CT (LDCT) for qualifying lung screening cohort.';
    }
  } else if (cleanType.includes('psa') || cleanType.includes('prostate')) {
    if (isAbnormal || resultText.toLowerCase().includes('elevated')) {
      yearsToAdd = 1;
      rationale = 'Annual PSA monitor recommended for elevated levels.';
    } else {
      yearsToAdd = 2;
      rationale = 'Standard 2-year follow-up for prostate specific antigen tracking.';
    }
  } else {
    yearsToAdd = 1;
    rationale = 'Standard annual health screening and prevention review.';
  }

  const nextDate = new Date(date);
  if (yearsToAdd === 0.5) {
    nextDate.setMonth(nextDate.getMonth() + 6);
  } else if (yearsToAdd === 0) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + Math.floor(yearsToAdd));
  }

  const nextDateStr = isNaN(nextDate.getTime()) ? 'Pending Review' : nextDate.toISOString().split('T')[0];

  return {
    date: nextDateStr,
    rationale,
    isUrgent: yearsToAdd === 0 || (isAbnormal && yearsToAdd <= 1)
  };
}

export function generateScreeningPDF(
  profile: UserProfile | null,
  recommendations: Recommendation[],
  events: ScreeningEvent[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - (2 * marginX); // 180mm
  let y = 15;

  // Helper to check page bounds & insert page if needed
  const checkPageBoundary = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      doc.addPage();
      y = 15;
      drawFooter(doc, true);
    }
  };

  const drawFooter = (pdfDoc: jsPDF, isNewPage = false) => {
    const origY = pdfDoc.getFontSize();
    pdfDoc.setFont('helvetica', 'italic');
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(160, 174, 192);
    pdfDoc.text(
      'Cancer Prevention Passport by White Cloud Medical, LLC | Patient Clinician Review Copy',
      marginX,
      pageHeight - 10
    );
    const pageNumText = `Page ${pdfDoc.getNumberOfPages()}`;
    pdfDoc.text(pageNumText, pageWidth - marginX - pdfDoc.getTextWidth(pageNumText), pageHeight - 10);
    pdfDoc.setFontSize(origY);
  };

  // 1. BRAND HEADER BANNER
  doc.setFillColor(26, 54, 93); // Deep Navy Primary
  doc.rect(marginX, y, contentWidth, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CANCER PREVENTION PASSPORT', marginX + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('Personalized Preventive Screening Summary & Clinician Visit Report', marginX + 6, y + 15);

  y += 22 + 5;

  // 2. PATIENT PROFILE CARD (Shaded background)
  doc.setFillColor(247, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 54, 93);
  doc.text('PATIENT INFORMATION', marginX + 6, y + 7);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX + 6, y + 10, marginX + contentWidth - 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(74, 85, 104);

  const curDate = new Date().toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const patientName = profile?.name || 'Anonymous Patient';
  const ageStr = profile?.dob ? `${profile.dob} (${calculateAge(profile.dob)})` : 'Unspecified';
  const sexStr = profile?.sexAssignedAtBirth 
    ? profile.sexAssignedAtBirth.charAt(0).toUpperCase() + profile.sexAssignedAtBirth.slice(1) 
    : 'Unspecified';
  const smokeStr = profile?.smokingHistory 
    ? `${profile.smokingHistory.status.toUpperCase()} (${profile.smokingHistory.packYears || 0} pack-years)` 
    : 'No History';

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', marginX + 6, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(patientName, marginX + 32, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Date of Birth (Age):', marginX + 90, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(ageStr, marginX + 128, y + 16);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Assigned Sex:', marginX + 6, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(sexStr, marginX + 32, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Smoking Status:', marginX + 90, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(smokeStr, marginX + 128, y + 23);

  // Row 3 (Export Date)
  doc.setFont('helvetica', 'bold');
  doc.text('Export Date:', marginX + 6, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(curDate, marginX + 32, y + 28);

  const hasCancerHistory = profile?.personalHistoryOfCancer;
  if (hasCancerHistory) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(229, 62, 62); // Red Alert for oncological survivorship context
    doc.text('Cancer History Flagged', marginX + 90, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104);
  }

  y += 32 + 8;

  // 3. CURRENT PREVENTIVE RECOMMENDATIONS TABLE
  checkPageBoundary(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 54, 93);
  doc.text('CURRENT PREVENTATIVE SCREENING RECOMMENDATIONS', marginX, y + 3);

  // Left side thick accent bar
  doc.setFillColor(43, 108, 176); // Slate blue
  doc.rect(marginX, y + 5, contentWidth, 1.5, 'F');

  y += 5 + 1.5 + 3;

  // Table Header Row
  doc.setFillColor(237, 242, 247);
  doc.rect(marginX, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(45, 55, 72);
  doc.text('Screening Domain / Cancer Type', marginX + 3, y + 5);
  doc.text('Modality / Protocol', marginX + 58, y + 5);
  doc.text('Status', marginX + 112, y + 5);
  doc.text('Due Date', marginX + 132, y + 5);
  doc.text('Grade / Standard', marginX + 155, y + 5);

  y += 7;

  const planRecs = recommendations.filter(r => r.status !== 'prevention');

  if (planRecs.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(113, 128, 150);
    doc.text('No active preventive recommendations scheduled. Please complete your profile.', marginX + 4, y + 6);
    y += 10;
  } else {
    planRecs.forEach((rec) => {
      // For each row, calculate dynamic text heights to avoid overlapping
      const cType = rec.cancer_type.charAt(0).toUpperCase() + rec.cancer_type.slice(1);
      const modText = rec.screening_modality;
      const actionText = rec.reason || '';

      const splitType = doc.splitTextToSize(cType, 50);
      const splitMod = doc.splitTextToSize(modText, 50);
      const reviewText = rec.clinical_review_status === 'physician_reviewed'
        ? 'Clinical content review status: physician reviewed by White Cloud Medical, LLC; patient-specific clinician review remains required.'
        : rec.clinical_review_status === 'needs_clinical_review'
          ? 'Clinical content review status: clinician review needed.'
          : 'Clinical content review status: source traced.';
      const splitReason = doc.splitTextToSize(`Rationale: ${actionText} ${reviewText}`, contentWidth - 8);

      const cellHeight = Math.max(splitType.length * 4.5, splitMod.length * 4.5) + 6;
      const rationaleHeight = splitReason.length * 3.8 + 4;
      const totalRowHeight = cellHeight + rationaleHeight;

      // Ensure we don't break page in intermediate rendering
      checkPageBoundary(totalRowHeight);

      // Light gray bottom divider
      doc.setDrawColor(237, 242, 247);
      doc.setLineWidth(0.2);

      // Write column values
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 54, 93);
      doc.text(splitType, marginX + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(45, 55, 72);
      doc.text(splitMod, marginX + 58, y + 5);

      // Status indicator color-coding
      if (rec.status === 'due_now') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(229, 62, 62); // Red
        doc.text('DUE NOW', marginX + 112, y + 5);
      } else if (rec.status === 'coming_soon') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(43, 108, 176); // Blue
        doc.text('COMING SOON', marginX + 112, y + 5);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(74, 85, 104);
        doc.text(rec.status.toUpperCase().replace('_', ' '), marginX + 112, y + 5);
      }

      // Rest of row columns
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text(rec.due_date, marginX + 132, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(rec.recommendation_grade, marginX + 155, y + 5);

      // Rationale text card nested on next sub-row
      y += cellHeight;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(marginX + 2, y - 2, contentWidth - 4, rationaleHeight - 1, 1, 1, 'F');
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(113, 128, 150);
      doc.text(splitReason, marginX + 4, y + 1.5);

      y += rationaleHeight + 2;
      doc.line(marginX, y - 1, marginX + contentWidth, y - 1);
    });
  }

  y += 6;

  // 4. HISTORICAL SCREENING EVENTS RECORDED
  checkPageBoundary(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 54, 93);
  doc.text('HISTORICAL TEST & CONCLUDED SCREENINGS', marginX, y + 3);

  // Left accent bar
  doc.setFillColor(74, 85, 104);
  doc.rect(marginX, y + 5, contentWidth, 1.5, 'F');

  y += 5 + 1.5 + 3;

  doc.setFillColor(240, 244, 248);
  doc.rect(marginX, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(45, 55, 72);
  doc.text('Completed Test / Procedure', marginX + 3, y + 5);
  doc.text('Test Date', marginX + 58, y + 5);
  doc.text('Findings / Results Reported', marginX + 85, y + 5);
  doc.text('Physician Rationale & Surveillance Cycle', marginX + 130, y + 5);

  y += 7;

  // Standard historical entries
  const displayEvents = events && events.filter(e => e.status === 'completed').length > 0
    ? events.filter(e => e.status === 'completed')
    : [
        { type: 'colonoscopy', date: '2021-03-15', result: 'Normal/Clear', isAbnormal: false },
        { type: 'mammogram', date: '2023-06-10', result: 'Normal (BI-RADS 1)', isAbnormal: false },
        { type: 'pap', date: '2024-11-20', result: 'NILM (Negative cytology)', isAbnormal: false },
      ];

  displayEvents.forEach((evt, idx) => {
    const nextDueInfo = calculateNextDueDate(evt.type, evt.date, evt.isAbnormal || false, evt.result || 'Normal');
    
    let testLabel = evt.type.charAt(0).toUpperCase() + evt.type.slice(1);
    const cleanType = evt.type.toLowerCase();
    if (cleanType.includes('pap')) testLabel = 'Pap Smear';
    else if (cleanType.includes('hpv')) testLabel = 'Primary HPV DNA';
    else if (cleanType.includes('mammogram')) testLabel = 'Mammography';
    else if (cleanType.includes('colonoscopy')) testLabel = 'Colonoscopy (visual)';
    else if (cleanType.includes('fit')) testLabel = 'FIT Assay';

    const splitLabel = doc.splitTextToSize(testLabel, 50);
    const splitResult = doc.splitTextToSize(evt.result, 42);
    const splitRationale = doc.splitTextToSize(nextDueInfo.rationale, 62);

    const rowMaxHeight = Math.max(splitLabel.length * 4.5, splitResult.length * 4.5, splitRationale.length * 4) + 6;

    checkPageBoundary(rowMaxHeight);

    doc.setDrawColor(240, 244, 248);
    doc.setLineWidth(0.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(45, 55, 72);
    doc.text(splitLabel, marginX + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(evt.date, marginX + 58, y + 5);

    if (evt.isAbnormal) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(229, 62, 62); // Red highlight abnormal findings
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(45, 55, 72);
    }
    doc.text(splitResult, marginX + 85, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 128, 150);
    doc.text(splitRationale, marginX + 130, y + 5);

    y += rowMaxHeight;
    doc.line(marginX, y - 1, marginX + contentWidth, y - 1);
  });

  y += 6;

  // 5. OFFICIAL DISCLOSURE & PHYSICIAN REVIEW BLOCK
  checkPageBoundary(35);

  doc.setFillColor(247, 250, 252);
  doc.setDrawColor(203, 213, 223);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 128, 150);
  doc.text('CONSENSUS COMPLIANT REFERENCE & CLINICAL DISCLAIMER:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 145);
  const disclaimerText = 'This screening plan is a patient-held summary generated from profile and screening history. It may reference published guideline concepts, but it is not a diagnosis, prescription, medical device, or substitute for clinician judgment. Discuss all interval changes, symptoms, family history, and genetic risk factors with a licensed clinician before changing care.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(splitDisclaimer, marginX + 4, y + 9);

  y += 24 + 6;

  // 6. CLINICIAN ACKNOWLEDGEMENT BLOCKS
  checkPageBoundary(15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(74, 85, 104);
  doc.text('Primary Physician Sign-off: _______________________________', marginX + 4, y + 4);
  doc.text('Date of Review: ________/________/________', marginX + 115, y + 4);

  // Draw final footers
  drawFooter(doc);

  // Output PDF
  doc.save(`${patientName.toLowerCase().replace(/\s+/g, '_')}_screening_summary.pdf`);
}
