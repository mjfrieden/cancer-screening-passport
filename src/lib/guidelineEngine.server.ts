import { UserProfile, ScreeningEvent, Recommendation } from '../types';

export function getRecommendations(profile: UserProfile, history: ScreeningEvent[] = []): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const age = calculateAge(profile.dob);
  const today = startOfToday();

  // 1. Colorectal Cancer (USPSTF 2021)
  // Age 45-75
  if (age >= 45 && age <= 75) {
    const lastColonoscopy = getLastCompleted(history, 'colonoscopy');
    const lastFit = getLastCompleted(history, 'fit');

    let status: Recommendation['status'] = 'due_now';
    let reason = "Based on your age (45-75), routine colorectal screening is recommended.";
    let dueDate = formatDate(today);

    if (lastColonoscopy) {
      dueDate = addYears(lastColonoscopy.date, 10);
      status = getDueStatus(dueDate, today);
      reason = "Prior colonoscopy recorded. Next screening is projected at 10 years unless higher-risk findings or clinician guidance indicate otherwise.";
    } else if (lastFit) {
      dueDate = addYears(lastFit.date, 1);
      status = getDueStatus(dueDate, today);
      reason = "Prior FIT recorded. Annual stool-based screening is commonly repeated yearly unless diagnostic follow-up is needed.";
    }

    recommendations.push({
      id: "crc-rec",
      cancer_type: "colorectal",
      status,
      recommended_action: "Colonoscopy (every 10y), FIT (yearly), or sDNA-FIT (every 3y)",
      screening_modality: "Colonoscopy / Stool-based Test",
      due_date: dueDate,
      reason,
      source: "USPSTF",
      source_version: "2021",
      recommendation_grade: "A",
      confidence: "high",
      requires_clinician_review: false
    });
  }

  // 2. Breast Cancer (USPSTF 2024 Updated)
  // Age 40-74, biennial mammography
  if (profile.sexAssignedAtBirth === 'female' && age >= 40 && age <= 74) {
    const lastMammogram = getLastCompleted(history, 'mammogram');
    const dueDate = lastMammogram ? addYears(lastMammogram.date, 2) : formatDate(today);
    recommendations.push({
      id: "breast-rec",
      cancer_type: "breast",
      status: getDueStatus(dueDate, today),
      recommended_action: "Biennial (every 2 years) screening mammography",
      screening_modality: "Mammography",
      due_date: dueDate,
      reason: "USPSTF now recommends biennial screening mammography for women ages 40 to 74 years.",
      source: "USPSTF",
      source_version: "2024",
      recommendation_grade: "B",
      confidence: "high",
      requires_clinician_review: false
    });
  }

  // 3. Cervical Cancer (USPSTF 2018)
  // Age 21-65
  if (profile.sexAssignedAtBirth === 'female' && profile.cervixPresent && age >= 21 && age <= 65) {
    const lastPap = getLastCompleted(history, 'pap');
    const lastHpv = getLastCompleted(history, 'hpv');
    const lastCervical = latestEvent([lastPap, lastHpv]);
    const cervicalIntervalYears = lastHpv ? 5 : 3;
    const dueDate = lastCervical ? addYears(lastCervical.date, cervicalIntervalYears) : formatDate(today);
    recommendations.push({
      id: "cervical-rec",
      cancer_type: "cervical",
      status: getDueStatus(dueDate, today),
      recommended_action: age < 30 ? "Cytology (Pap) every 3 years" : "hrHPV testing alone every 5 years, or Co-testing every 5 years",
      screening_modality: "Cervical Cytology / hrHPV",
      due_date: dueDate,
      reason: "Routine screening recommended for age 21-65 with a cervix.",
      source: "USPSTF",
      source_version: "2018",
      recommendation_grade: "A",
      confidence: "high",
      requires_clinician_review: profile.personalHistoryOfCancer
    });
  }

  // 3b. Prostate Cancer (USPSTF 2018)
  // Age 55-69, shared decision making
  if (profile.sexAssignedAtBirth === 'male' && age >= 55 && age <= 69) {
    const lastPsa = getLastCompleted(history, 'psa');
    const dueDate = lastPsa ? addYears(lastPsa.date, 2) : formatDate(today);
    recommendations.push({
      id: "prostate-rec",
      cancer_type: "prostate",
      status: getDueStatus(dueDate, today),
      recommended_action: "Discuss shared decision-making for PSA-based prostate screening",
      screening_modality: "PSA Blood Test",
      due_date: dueDate,
      reason: "For men aged 55 to 69, standard clinical guidelines suggest discussing the benefits and harms of periodic PSA checking to make an individual choice.",
      source: "USPSTF",
      source_version: "2018",
      recommendation_grade: "C",
      confidence: "high",
      requires_clinician_review: false
    });
  }

  // 4. Lung Cancer (USPSTF 2021)
  // Age 50-80, 20 pack-year, current smoker or quit within 15y
  if (age >= 50 && age <= 80 && profile.smokingHistory) {
    const { status, packYears, quitDate } = profile.smokingHistory;
    let quitYears = 100;
    if (status === 'former' && quitDate) {
      quitYears = calculateAge(quitDate); // Simplistic use of calculateAge for years since quit
    }

    if (packYears >= 20 && (status === 'current' || (status === 'former' && quitYears <= 15))) {
      const lastLdct = getLastCompleted(history, 'ldct');
      const dueDate = lastLdct ? addYears(lastLdct.date, 1) : formatDate(today);
      recommendations.push({
        id: "lung-rec",
        cancer_type: "lung",
        status: getDueStatus(dueDate, today),
        recommended_action: "Annual screening with Low-Dose Computed Tomography (LDCT)",
        screening_modality: "LDCT",
        due_date: dueDate,
        reason: "Recommended based on age 50-80 and a 20 pack-year smoking history.",
        source: "USPSTF",
        source_version: "2021",
        recommendation_grade: "B",
        confidence: "high",
        requires_clinician_review: false
      });
    }
  }

  // 5. Survivorship Surveillance (NCCN Framework Abstraction)
  if (profile.personalHistoryOfCancer && profile.survivorshipPlan) {
    const { cancerType, diagnosisDate, stage, treatments = [] } = profile.survivorshipPlan;
    const cleanCancer = cancerType.toLowerCase();
    
    // Helper to format/standardize treatment labels
    const hasSurgery = treatments.includes('Surgery');
    const hasChemo = treatments.includes('Chemotherapy');
    const hasRadiation = treatments.includes('Radiation');
    const hasImmuno = treatments.includes('Immunotherapy');
    const hasHormone = treatments.includes('Hormonal Therapy');
    const hasSCT = treatments.includes('Stem Cell Transplant');

    // 5a. Breast Cancer Survivorship
    if (cleanCancer.includes('breast')) {
      // General Surveillance Mammogram & Exams
      recommendations.push({
        id: "survivorship-breast-general",
        cancer_type: "breast (survivorship)",
        status: "survivorship",
        recommended_action: hasSurgery && treatments.length === 1 && !hasChemo && !hasRadiation 
          ? "Contralateral breast diagnostic mammography and clinical breast exam every 6 months."
          : "Annual diagnostic mammography and physical exam every 6-12 months.",
        screening_modality: "Diagnostic Mammography & Clinical Breast Exam",
        due_date: survivorshipDueDate(profile, 12),
        reason: `Based on NCCN Guidelines for Breast Cancer Survivorship, individuals diagnosed with Stage ${stage || 'I-III'} breast cancer must undergo active physical exams every 6-12 months for the first 5 years and annually thereafter. Mammography is indicated every 12 months (or 6-12 months post-radiation).`,
        source: "NCCN Guidelines for Breast Cancer",
        source_version: "2024.1",
        recommendation_grade: "Category 1",
        confidence: "high",
        requires_clinician_review: true
      });

      // Treatment Specifics
      if (hasSurgery) {
        recommendations.push({
          id: "survivorship-breast-surgery",
          cancer_type: "breast (survivorship)",
          status: "survivorship",
          recommended_action: "Post-Surgical Ipsilateral/Contralateral Mammography surveillance",
          screening_modality: "Diagnostic Mammography",
          due_date: survivorshipDueDate(profile, 12),
          reason: "NCCN mandates diagnostic mammograms of reference tissue every 12 months. For lumbar/breast-conserving surgery (lumpectomy), annual diagnostic scanning of the ipsilateral breast is required. No mammography is indicated for breast tissues post-bilateral mastectomy.",
          source: "NCCN Breast Cancer Survivorship Guideline",
          source_version: "2024.1",
          recommendation_grade: "Category 1",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasHormone) {
        recommendations.push({
          id: "survivorship-breast-endocrine",
          cancer_type: "breast (survivorship)",
          status: "survivorship",
          recommended_action: "Bone Mineral Density (BMD) DEXA Scan & Endometrial Safety Assessment",
          screening_modality: "DEXA Scan & Pelvic Exam",
          due_date: survivorshipDueDate(profile, 18),
          reason: "For patients on adjuvant Aromatase Inhibitors (AI), a follow-up DEXA scan is required every 2 years to track drug-induced osteopenia/osteoporosis. For patients taking Tamoxifen, annual gynecologic pelvic reviews are required to monitor endometrial hyperplasia and uterine neoplastic risks.",
          source: "NCCN Guidelines / Endocrine Surveillance",
          source_version: "2024.2",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasChemo) {
        recommendations.push({
          id: "survivorship-breast-chemo",
          cancer_type: "breast (survivorship)",
          status: "survivorship",
          recommended_action: "Late Cardiotoxicity & Neuropathy Evaluation",
          screening_modality: "Echocardiogram (ECHO) / MUGA",
          due_date: survivorshipDueDate(profile, 24),
          reason: "Survivors previously exposed to anthracyclines, taxanes, or anti-HER2 targeted agents (Trastuzumab) should be audited for long-term cardiotoxicity with an Echocardiogram or MUGA scan if symptomatic, alongside assessments for persistent chemotherapy-induced peripheral neuropathy (CIPN).",
          source: "NCCN Guidelines / Survivorship Cardiac Panel",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasRadiation) {
        recommendations.push({
          id: "survivorship-breast-radiation",
          cancer_type: "breast (survivorship)",
          status: "survivorship",
          recommended_action: "Post-Radiation Cutaneous and Pulmonary Monitoring",
          screening_modality: "Clinical Chest & Skin Assessment",
          due_date: survivorshipDueDate(profile, 6),
          reason: "Annual screening/diagnostic breast exams are to watch closely for late effects of radiation, including chronic radiation-induced fibrosis, lymphedema, pneumonitis, or secondary cutaneous angiosarcomas.",
          source: "NCCN Guidelines / Post-Radiation Care",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5b. Colorectal Cancer Survivorship
    if (cleanCancer.includes('colorectal')) {
      // General Colonoscopy Surveillance
      recommendations.push({
        id: "survivorship-crc-colonoscopy",
        cancer_type: "colorectal (survivorship)",
        status: "survivorship",
        recommended_action: "Surveillance Colonoscopy at 1 Year Post-Resection",
        screening_modality: "High-Definition Colonoscopy",
        due_date: survivorshipDueDate(profile, 24),
        reason: `Based on NCCN Guideline protocols for Stage ${stage || 'I-III'} colorectal cancer, a diagnostic colonoscopy must be performed 1 year after surgical resection. If normal, repeat in 3 years, then every 5 years. If advanced adenoma is identified, repeat in 1 year.`,
        source: "NCCN Guidelines for Colorectal Cancer",
        source_version: "2023.3",
        recommendation_grade: "Category 1",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasChemo || stage === '2' || stage === '3' || stage === '4') {
        recommendations.push({
          id: "survivorship-crc-systemic",
          cancer_type: "colorectal (survivorship)",
          status: "survivorship",
          recommended_action: "Serum CEA Blood Test & Contrast-Enhanced CT (C/A/P)",
          screening_modality: "Serum CEA Test & Chest/Abdomen/Pelvis CT",
          due_date: survivorshipDueDate(profile, 6),
          reason: "For patients with resected high-risk Stage II and all Stage III colorectal cancers, NCCN recommends checking serum CEA every 3-6 months for the first 2 years, and every 6 months for up to 5 years. Cross-sectional CT scans of the Chest, Abdomen, and Pelvis must be ordered every 6-12 months for up to 5 years.",
          source: "NCCN Colorectal Cancer Guidelines",
          source_version: "2023.3",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasRadiation) {
        recommendations.push({
          id: "survivorship-crc-radiation",
          cancer_type: "colorectal (survivorship)",
          status: "survivorship",
          recommended_action: "Proctoscopy or Rigid Sigmoidoscopy Local Anastomoc Surveillance",
          screening_modality: "Rigid Sigmoidoscopy",
          due_date: survivorshipDueDate(profile, 12),
          reason: "Patients recovering from rectal cancer who underwent low anterior resection and preoperative/postoperative pelvic external beam radiation require local sigmoidoscopy monitoring every 6 months for up to 5 years.",
          source: "NCCN Rectal Cancer Surveillance Panel",
          source_version: "2023.4",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5c. Prostate Cancer Survivorship
    if (cleanCancer.includes('prostate')) {
      recommendations.push({
        id: "survivorship-prostate-psa",
        cancer_type: "prostate (survivorship)",
        status: "survivorship",
        recommended_action: "Serum Prostate-Specific Antigen (PSA) Level Tracking every 6 months",
        screening_modality: "PSA Blood Test",
        due_date: survivorshipDueDate(profile, 6),
        reason: `Per NCCN Guidelines, prostate cancer survivors require PSA checkups every 6 months for 5 years, and annually thereafter. For patients who had a radical prostatectomy, PSA should be undetectable (<0.1 or <0.2 ng/mL). A rise may indicate salvage intervention.`,
        source: "NCCN Guidelines / Prostate Cancer",
        source_version: "2024.1",
        recommendation_grade: "Category 1",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasHormone) {
        recommendations.push({
          id: "survivorship-prostate-adt",
          cancer_type: "prostate (survivorship)",
          status: "survivorship",
          recommended_action: "Bone Mineral Density (BMD) DEXA Scan & Cardiometabolic Profiling",
          screening_modality: "DEXA Scan & Lipid Panel",
          due_date: survivorshipDueDate(profile, 24),
          reason: "Androgen Deprivation Therapy (ADT) carries substantial risks of accelerated bone loss, hyperlipidemia, glucose intolerance, and sarcopenic obesity. Annual lipid charts, HbA1c panels, and DEXA scans every 2 years are indicated.",
          source: "NCCN Prostate Cancer ADT Guidelines",
          source_version: "2024.1",
          recommendation_grade: "Category 1",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasRadiation) {
        recommendations.push({
          id: "survivorship-prostate-radiation",
          cancer_type: "prostate (survivorship)",
          status: "survivorship",
          recommended_action: "Urinary and Gastrointestinal Toxicity Evaluation",
          screening_modality: "Clinical Pelvic & Bowel Assessment",
          due_date: survivorshipDueDate(profile, 6),
          reason: "Patients who received prostate external beam radiation or brachytherapy should be assessed for late urinary cystitis, rectal proctitis, bleeding, or sexual dysfunction, which can surface 1-5 years post-irradiation.",
          source: "NCCN Guidelines / Radiotherapy Toxicity",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5d. Lung Cancer Survivorship
    if (cleanCancer.includes('lung')) {
      recommendations.push({
        id: "survivorship-lung-ct",
        cancer_type: "lung (survivorship)",
        status: "survivorship",
        recommended_action: "Chest Low-Dose Computed Tomography (LDCT) annually",
        screening_modality: "LDCT Scan",
        due_date: survivorshipDueDate(profile, 12),
        reason: `Based on NCCN Guidelines for Lung Cancer, patients resected for curative intent must undergo chest LDCT scans for active recurrence tracking every 6 months for the first 2-3 years, and annually thereafter.`,
        source: "NCCN Guidelines / Non-Small Cell Lung Cancer",
        source_version: "2024.2",
        recommendation_grade: "Category 2A",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasSurgery) {
        recommendations.push({
          id: "survivorship-lung-pft",
          cancer_type: "lung (survivorship)",
          status: "survivorship",
          recommended_action: "Post-Surgical Pulmonary Function Testing (PFT)",
          screening_modality: "Spirometry",
          due_date: survivorshipDueDate(profile, 12),
          reason: "Following lobectomy, segmentectomy, or pneumonectomy, patients must undergo clinical respiratory checking. PFT (spirometry and diffusing capacity) is used to track lung adaptation, manage dyspnea, and guide respiratory therapy.",
          source: "NCCN NSCLC Post-Surgical Guidelines",
          source_version: "2024.2",
          recommendation_grade: "Category 2B",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasImmuno) {
        recommendations.push({
          id: "survivorship-lung-immuno",
          cancer_type: "lung (survivorship)",
          status: "survivorship",
          recommended_action: "Immune-Related Adverse Event (irAE) & Thyroid Monitoring",
          screening_modality: "TSH & Metabolic Blood Panels",
          due_date: survivorshipDueDate(profile, 2),
          reason: "Immunotherapeutic checkpoint inhibitors (PD-1/PD-L1) can trigger delayed thyroid inflammation, pneumonitis, colitis, or nephritis. Thyroid stimulating hormone (TSH) assays every 4-8 weeks and periodic safe metabolic checks are required.",
          source: "NCCN Guidelines / Immunotherapy Toxicity",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5e. Melanoma Survivorship
    if (cleanCancer.includes('melanoma')) {
      recommendations.push({
        id: "survivorship-melanoma-skin",
        cancer_type: "melanoma (survivorship)",
        status: "survivorship",
        recommended_action: "Total Body Skin Examination (TBSE) every 3-6 months",
        screening_modality: "Total Body Skin Exam & Nodal Ultrasound",
        due_date: survivorshipDueDate(profile, 12),
        reason: `Per NCCN Guidelines for Melanoma, physical check-ups and thorough dermatological evaluations are recommended every 3-6 months for 2 years (Stages IA-IIC), then every 6-12 months for 3 years, then annually. This monitors for regional recurrence and high-risk second primary melanoma.`,
        source: "NCCN Guidelines / Cutaneous Melanoma",
        source_version: "2024.1",
        recommendation_grade: "Category 1",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasImmuno || stage === '3' || stage === '4') {
        recommendations.push({
          id: "survivorship-melanoma-imaging",
          cancer_type: "melanoma (survivorship)",
          status: "survivorship",
          recommended_action: "Cross-Sectional Chest/Abdomen/Pelvis CT & Brain MRI",
          screening_modality: "Brain MRI & body contrast CT",
          due_date: survivorshipDueDate(profile, 9),
          reason: "For high-risk Stage III / IV survivors, systemic imaging (CT scans and brain MRI) is recommended every 3-12 months for 3 years to screen for subclinical cerebral, pulmonary, or hepatic metastases.",
          source: "NCCN Melanoma Metastatic Surveillance",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5f. Ovarian Cancer Survivorship
    if (cleanCancer.includes('ovarian')) {
      recommendations.push({
        id: "survivorship-ovarian-pelvic",
        cancer_type: "ovarian (survivorship)",
        status: "survivorship",
        recommended_action: "Clinical Pelvic Examination & Serum CA-125 Testing every 3-4 months",
        screening_modality: "Pelvic Exam & CA-125 Assay",
        due_date: survivorshipDueDate(profile, 24),
        reason: "Clinical checking is recommended every 3-6 months for the first 2 years, then every 6 months for up to 5 years, then annually. CA-125 tumor marker checks are indicated at each consult if initially elevated to capture pelvic anomalies or early asymptomatic recurrences.",
        source: "NCCN Guidelines / Ovarian Cancer",
        source_version: "2024.1",
        recommendation_grade: "Category 2A",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasChemo) {
        recommendations.push({
          id: "survivorship-ovarian-neuropathy",
          cancer_type: "ovarian (survivorship)",
          status: "survivorship",
          recommended_action: "Platinum-Induced Sensory Neuropathy & Ototoxicity evaluation",
          screening_modality: "Neurological & Audiometric Exam",
          due_date: survivorshipDueDate(profile, 12),
          reason: "The use of compound platinum therapies (Carboplatin/Cisplatin) and Taxanes in ovarian neoplasms exhibits risks of high-frequency dysacusis, tinnitus, and cumulative numbness/paraesthesias, requiring thorough follow-up.",
          source: "NCCN Guidelines / Late Toxicity Management",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5g. Leukemia Survivorship
    if (cleanCancer.includes('leukemia')) {
      recommendations.push({
        id: "survivorship-leukemia-cbc",
        cancer_type: "leukemia (survivorship)",
        status: "survivorship",
        recommended_action: "Complete Blood Count (CBC) with differential & PCR transcript profiling",
        screening_modality: "CBC, Metabolic Panel & qPCR",
        due_date: survivorshipDueDate(profile, 6),
        reason: "NCCN mandates blood panel tracing (every 1-3 months in early remission, then every 3-6 months) to assess cytopenias or lymphocytosis. Quantitative PCR (qPCR) transcripts should be monitored (e.g. BCR-ABL for CML) to verify maintenance of deep molecular response.",
        source: "NCCN Guidelines / Leukemia Surveillance",
        source_version: "2024.1",
        recommendation_grade: "Category 1",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasSCT) {
        recommendations.push({
          id: "survivorship-leukemia-gvhd",
          cancer_type: "leukemia (survivorship)",
          status: "survivorship",
          recommended_action: "Chronic Graft-vs-Host Disease (cGvHD) Multiorgan screening",
          screening_modality: "Clinical GvHD Appraisal",
          due_date: survivorshipDueDate(profile, 18),
          reason: "Post-transplant recipients must be carefully audited for chronic graft-versus-host disease involving the skin, oral mucosa, hepatic ducts, ocular surfaces, and pulmonary structures, with routine monitoring of immunosuppressant serum levels.",
          source: "NCCN Transplant Guidelines",
          source_version: "2024.2",
          recommendation_grade: "Category 1",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5h. Lymphoma Survivorship
    if (cleanCancer.includes('lymphoma')) {
      recommendations.push({
        id: "survivorship-lymphoma-nodes",
        cancer_type: "lymphoma (survivorship)",
        status: "survivorship",
        recommended_action: "Physical Lymph Node Exam & Serum Chemistries (with LDH)",
        screening_modality: "Clinical Exam & Serum LDH Panel",
        due_date: survivorshipDueDate(profile, 3),
        reason: "NCCN Guidelines specify physical checks of peripheral lymph node basins every 3 months for 2 years, and every 6 months thereafter. Serum panel surveillance including CBC and Lactate Dehydrogenase (LDH) activity is required.",
        source: "NCCN Lymphoma Guidelines",
        source_version: "2024.1",
        recommendation_grade: "Category 2A",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasChemo) {
        recommendations.push({
          id: "survivorship-lymphoma-heart",
          cancer_type: "lymphoma (survivorship)",
          status: "survivorship",
          recommended_action: "Post-Anthracycline Cardiac Ejection Fraction Surveillance",
          screening_modality: "Echocardiogram (ECHO)",
          due_date: survivorshipDueDate(profile, 24),
          reason: "Because lymphoma treatments commonly feature cumulative Anthracyclines (e.g., Doxorubicin in CHOP/ABVD), survivors must undergo echocardiographic assessment to monitor for subclinical left ventricular cardiomyopathy.",
          source: "NCCN Guidelines / Anthracycline Cardiotoxicity",
          source_version: "2024.1",
          recommendation_grade: "Category 1",
          confidence: "high",
          requires_clinician_review: true
        });
      }

      if (hasRadiation) {
        recommendations.push({
          id: "survivorship-lymphoma-radiation",
          cancer_type: "lymphoma (survivorship)",
          status: "survivorship",
          recommended_action: "Annual Thyroid TSH Assay & Post-Irradiation Breast Screening",
          screening_modality: "Serum TSH & Breast Mammogram/MRI",
          due_date: survivorshipDueDate(profile, 24),
          reason: "Neck or mediastinal external beam radiation therapy warrants checking serum TSH levels annually to detect hypothyroidism. For female survivors irradiated before age 30, annual breast mammography / breast MRI is indicated starting 8-10 years post-radiotherapy.",
          source: "NCCN Late Effects of Lymphoma Radiotherapy",
          source_version: "2024.1",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }

    // 5i. Pancreatic Cancer Survivorship
    if (cleanCancer.includes('pancreatic')) {
      recommendations.push({
        id: "survivorship-pancreatic-ct",
        cancer_type: "pancreatic (survivorship)",
        status: "survivorship",
        recommended_action: "Contrast-Enhanced Chest/Abdomen/Pelvis CT & Serum CA 19-9",
        screening_modality: "Abdominal/Pelvic CT Scan & Tumor Marker CA 19-9",
        due_date: survivorshipDueDate(profile, 6),
        reason: "Following surgical resection of pancreatic ductal adenocarcinomas, NCCN recommends contrast-enhanced abdominal/pelvic imaging (CT or MRI) and chest CT, paired with serum CA 19-9 tests, every 3-6 months for 2 years, then every 6-12 months.",
        source: "NCCN Guidelines / Pancreatic Adenocarcinoma",
        source_version: "2024.2",
        recommendation_grade: "Category 2A",
        confidence: "high",
        requires_clinician_review: true
      });

      if (hasSurgery) {
        recommendations.push({
          id: "survivorship-pancreatic-exocrine",
          cancer_type: "pancreatic (survivorship)",
          status: "survivorship",
          recommended_action: "Pancreatic Exocrine Insufficiency & Glycemic Index checks",
          screening_modality: "HbA1c & Fecal Elastase Assay",
          due_date: survivorshipDueDate(profile, 6),
          reason: "Major surgeries (such as the Whipple procedure/pancreaticoduodenectomy) frequently lead to malabsorption, chronic steatorrhea, and secondary diabetes. Patients require regular fecal elastase testing (for exocrine replacement therapy titration) and quarterly/semi-annual HbA1c panels.",
          source: "NCCN Post-Pancreatectomy Consensus Guidelines",
          source_version: "2024.2",
          recommendation_grade: "Category 2A",
          confidence: "high",
          requires_clinician_review: true
        });
      }
    }
  }

  // 6. AICR Prevention Guidelines
  recommendations.push({
    id: "prevention-weight",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Be a healthy weight",
    screening_modality: "Weight Management",
    due_date: "N/A",
    reason: "Keep your weight within the healthy range and avoid weight gain in adult life.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-activity",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Be physically active",
    screening_modality: "Physical Activity",
    due_date: "N/A",
    reason: "Walk more and sit less. Aim for at least 150 min of moderate activity per week.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-diet",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Eat a diet rich in whole grains, vegetables, fruits and beans",
    screening_modality: "Nutrition",
    due_date: "N/A",
    reason: "Make whole grains, vegetables, fruits and pulses such as beans and lentils a major part of your usual daily diet.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-fast-food",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Limit 'fast foods' and processed foods high in fat, starches or sugars",
    screening_modality: "Nutrition",
    due_date: "N/A",
    reason: "Limiting these foods helps control calorie intake and maintain a healthy weight.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-meat",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Limit red and processed meat",
    screening_modality: "Nutrition",
    due_date: "N/A",
    reason: "Eat no more than moderate amounts of red meat and little, if any, processed meat.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-drinks",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Limit sugar-sweetened drinks",
    screening_modality: "Nutrition",
    due_date: "N/A",
    reason: "Drink mostly water and unsweetened drinks to avoid weight gain.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  recommendations.push({
    id: "prevention-alcohol",
    cancer_type: "Healthy Living (AICR)",
    status: "prevention",
    recommended_action: "Limit alcohol consumption",
    screening_modality: "Lifestyle",
    due_date: "N/A",
    reason: "For cancer prevention, it's best not to drink alcohol.",
    source: "AICR",
    source_version: "2024",
    recommendation_grade: "N/A",
    confidence: "high",
    requires_clinician_review: false
  });

  return recommendations;
}

function getLastCompleted(history: ScreeningEvent[], type: ScreeningEvent['type']): ScreeningEvent | undefined {
  return history
    .filter(event => event.type === type && event.status === 'completed' && isValidDate(event.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

function latestEvent(events: Array<ScreeningEvent | undefined>): ScreeningEvent | undefined {
  return events
    .filter((event): event is ScreeningEvent => Boolean(event) && isValidDate(event.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isValidDate(dateStr?: string): boolean {
  if (!dateStr) return false;
  return !Number.isNaN(new Date(`${dateStr}T00:00:00`).getTime());
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addYears(dateStr: string, years: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setFullYear(date.getFullYear() + years);
  return formatDate(date);
}

function addMonths(dateStr: string, months: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
}

function getDueStatus(dueDate: string, today = startOfToday()): Recommendation['status'] {
  const due = new Date(`${dueDate}T00:00:00`);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < -30) return 'overdue';
  if (daysUntilDue <= 0) return 'due_now';
  if (daysUntilDue <= 90) return 'coming_soon';
  return 'completed';
}

function survivorshipDueDate(profile: UserProfile, monthsFromAnchor: number): string {
  const anchor =
    profile.survivorshipPlan?.lastFollowUp ||
    profile.survivorshipPlan?.diagnosisDate ||
    formatDate(startOfToday());

  return isValidDate(anchor) ? addMonths(anchor, monthsFromAnchor) : formatDate(startOfToday());
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
