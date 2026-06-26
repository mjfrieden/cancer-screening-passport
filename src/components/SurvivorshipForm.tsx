import React, { useState, useEffect } from 'react';
import { SurvivorshipPlan, Recommendation, ScreeningEvent } from '../types';
import { 
  Shield, 
  Calendar, 
  Microscope, 
  Save, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Activity, 
  Award, 
  Clock, 
  Plus, 
  AlertCircle, 
  ChevronRight, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SurvivorshipFormProps {
  initialData?: SurvivorshipPlan;
  onSave: (data: SurvivorshipPlan) => void;
  onRemove: () => void;
  loading: boolean;
  recommendations?: Recommendation[];
  events?: ScreeningEvent[];
  onAddEvent?: () => void;
}

export default function SurvivorshipForm({ 
  initialData, 
  onSave, 
  onRemove, 
  loading,
  recommendations = [],
  events = [],
  onAddEvent
}: SurvivorshipFormProps) {
  const [isEditing, setIsEditing] = useState(!initialData?.cancerType);
  
  const [data, setData] = useState<SurvivorshipPlan>(initialData || {
    cancerType: '',
    diagnosisDate: '',
    stage: '',
    treatments: [],
  });

  // Sync state when initialData changes (e.g. Preset Simulator)
  useEffect(() => {
    if (initialData && initialData.cancerType) {
      setData(initialData);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [initialData]);

  const treatmentsList = [
    'Surgery', 'Chemotherapy', 'Radiation', 'Immunotherapy', 'Hormonal Therapy', 'Stem Cell Transplant'
  ];

  const cancerLabelMapping: Record<string, string> = {
    breast: "Breast Cancer",
    colorectal: "Colorectal Cancer",
    lung: "Lung Cancer",
    prostate: "Prostate Cancer",
    melanoma: "Melanoma (Cutaneous)",
    ovarian: "Ovarian Cancer",
    leukemia: "Leukemia",
    lymphoma: "Lymphoma",
    pancreatic: "Pancreatic Cancer",
    other: "Other Neoplastic Condition"
  };

  const toggleTreatment = (t: string) => {
    const next = data.treatments.includes(t) 
      ? data.treatments.filter(x => x !== t)
      : [...data.treatments, t];
    setData({ ...data, treatments: next });
  };

  // Helper to match active survivorship recommendations
  const survivorshipRecs = recommendations.filter(r => r.status === 'survivorship');

  const checkCompletedStatus = (rec: Recommendation) => {
    const cleanId = rec.id.toLowerCase();
    const cleanModality = rec.screening_modality.toLowerCase();

    // Find any event that corresponds to this modality/test
    return events.filter(e => {
      if (e.status !== 'completed') return false;
      const type = e.type;

      if (cleanId.includes('mammography') || cleanId.includes('breast') || cleanModality.includes('mammography') || cleanModality.includes('mammogram')) {
        return type === 'mammogram';
      }
      if (cleanId.includes('colonoscopy') || cleanModality.includes('colonoscopy')) {
        return type === 'colonoscopy' || type === 'fit';
      }
      if (cleanId.includes('psa') || cleanModality.includes('psa')) {
        return type === 'psa';
      }
      if (cleanId.includes('ldct') || cleanId.includes('lung-ct') || cleanModality.includes('ldct') || cleanModality.includes('lung scan')) {
        return type === 'ldct';
      }
      if (cleanId.includes('ca-125') || cleanId.includes('ca19-9') || cleanId.includes('marker') || cleanModality.includes('assay') || cleanModality.includes('blood') || cleanModality.includes('cbc') || cleanModality.includes('transcript')) {
        return type === 'marker_check';
      }
      if (cleanId.includes('imaging') || cleanId.includes('ct') || cleanId.includes('mri') || cleanModality.includes('imaging') || cleanModality.includes('ct scan') || cleanModality.includes('mri scan')) {
        return type === 'surveillance_imaging';
      }
      return false;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6 pb-24">
        <div className="p-4 bg-purple-50 border border-purple-150 rounded-2xl flex items-start gap-4 shadow-sm animate-fade-in">
          <Shield className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-purple-900 text-sm sm:text-base tracking-tight">Configure Survivorship Surveillance</h3>
            <p className="text-xs text-purple-700 leading-relaxed mt-1 font-medium">
              Specify your primary cancer history, diagnosis timeline, and treatments. This helps generate survivorship reminders for clinician review.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Cancer Type</label>
            <select 
              required
              className="w-full p-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm text-gray-800 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              value={data.cancerType}
              onChange={e => setData({...data, cancerType: e.target.value})}
            >
              <option value="">Select Primary Malignancy...</option>
              {Object.keys(cancerLabelMapping).map(key => (
                <option key={key} value={key}>{cancerLabelMapping[key]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date of Original Diagnosis</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="date"
                  required
                  className="w-full pl-10 p-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm text-gray-800 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  value={data.diagnosisDate}
                  onChange={e => setData({...data, diagnosisDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stage at Diagnosis</label>
              <select 
                required
                className="w-full p-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm text-gray-805 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                value={data.stage}
                onChange={e => setData({...data, stage: e.target.value})}
              >
                <option value="">Select Stage...</option>
                <option value="0">Stage 0 (In Situ)</option>
                <option value="1">Stage I (Localized)</option>
                <option value="2">Stage II (Regional Extension)</option>
                <option value="3">Stage III (Nodal metastates)</option>
                <option value="4">Stage IV (Distant metastatic)</option>
                <option value="unknown">Unspecified Stage</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Treatments Administered</label>
              <span className="text-[10px] text-gray-400 block mb-2 leading-tight">Select all modalities received to build late-toxicity and safety follow-ups.</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {treatmentsList.map(t => {
                const isActive = data.treatments.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTreatment(t)}
                    className={cn(
                      "p-3.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between",
                      isActive 
                        ? "bg-purple-50 text-purple-900 border-purple-200 shadow-sm" 
                        : "bg-white text-gray-600 border-gray-150 hover:bg-gray-50"
                    )}
                  >
                    <span>{t}</span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive ? "border-purple-600 bg-purple-600" : "border-gray-300"
                    )}>
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || !data.cancerType}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded-2xl font-bold shadow-xl hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
              <span>{initialData?.cancerType ? "Update Parameters" : "Generate Survivorship Program"}</span>
            </button>

            {initialData?.cancerType && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full flex items-center justify-center text-sm font-semibold p-2 text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel / Return to Timeline
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // --- RENDERS THE INTERACTIVE SURVIVORSHIP DASHBOARD TIMELINE ---
  return (
    <div className="space-y-8 pb-32 animate-fade-in font-sans">
      
      {/* Clinician Overview Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-20%] w-[45%] h-[15%] bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute left-[-5%] bottom-[-15%] w-[45%] h-[15%] bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Survivorship Review Pathway</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {cancerLabelMapping[data.cancerType] || "Survivorship Program"}
            </h2>
            <p className="text-xs text-purple-100/80 font-medium">
              Stage {data.stage === 'unknown' ? 'Active Tracking' : data.stage} • Diagnosed on {new Date(data.diagnosisDate + 'T00:00:00').toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/10 backdrop-blur-md transition-all shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modify Clinical History</span>
          </button>
        </div>

        {/* Treatment Tags and Summaries */}
        <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
          <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block">Administered Therapies under surveillance:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.treatments.map(t => (
              <span key={t} className="px-2.5 py-1 bg-white/10 border border-white/5 rounded-full text-[10.5px] font-bold text-purple-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                {t}
              </span>
            ))}
            {data.treatments.length === 0 && (
              <span className="text-xs text-purple-200 italic">No historical treatments selected. Modify options to activate adverse monitoring.</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Longitudinal Timeline Block */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight">Survivorship Screening Completion Timeline</h3>
            <p className="text-xs text-gray-550 leading-relaxed font-medium">
              Based on the information you enter here; confirm intervals and records with your care team.
            </p>
          </div>
          {onAddEvent && (
            <button
              onClick={onAddEvent}
              className="flex items-center gap-1 bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-purple-200/50 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Completed Test</span>
            </button>
          )}
        </div>

        {survivorshipRecs.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-gray-500 text-xs font-medium space-y-2">
            <AlertCircle className="w-8 h-8 text-purple-400 mx-auto" />
            <p>Gathering guidelines program details. Fill out oncological parameters above to trigger active surveillance protocols.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-dashed border-purple-200/60 ml-4 pl-6 pl-8 space-y-6 pt-3">
            {survivorshipRecs.map((rec, idx) => {
              const matchedEvents = checkCompletedStatus(rec);
              const isCompleted = matchedEvents.length > 0;
              const dateObj = new Date(rec.due_date + 'T00:00:00');
              const dueFormatted = dateObj.toLocaleDateString(undefined, {month: 'short', year: 'numeric'});

              return (
                <div key={rec.id} className="relative group">
                  {/* Timeline Node circular marker */}
                  <div className={cn(
                    "absolute left-[-39px] top-[14px] w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                    isCompleted 
                      ? "bg-emerald-600 border-white text-white" 
                      : "bg-purple-100 border-white text-purple-700"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Guideline Card Panel */}
                  <div className={cn(
                    "p-5 rounded-2xl border transition-all space-y-3 shadow-sm hover:shadow-md",
                    isCompleted 
                      ? "bg-emerald-50/20 border-emerald-100" 
                      : "bg-white border-gray-150"
                  )}>
                    
                    {/* Modality & Badge */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-700 px-2 py-0.5 bg-purple-50 rounded-md border border-purple-100/50">
                          {rec.screening_modality}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                          {rec.recommended_action}
                        </h4>
                      </div>

                      {/* Timeliness badge */}
                      <div className="shrink-0 pt-0.5">
                        {isCompleted ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>COMPLIANT</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-purple-850 bg-purple-50/80 px-2.5 py-1 rounded-full border border-purple-200/50">
                            <span>DUE: {dueFormatted}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Rationale & Treatment link */}
                    <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          <a className="underline-offset-2 hover:underline" href={rec.source_url} target="_blank" rel="noreferrer">
                            {rec.source} • {rec.source_version}
                          </a>
                          {' • '}
                          {rec.recommendation_grade} • Clinician review needed
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-sans">
                        {rec.reason}
                      </p>
                    </div>

                    {/* Interactive Log History synced underneath or quick action log button */}
                    {isCompleted ? (
                      <div className="border-t border-gray-100 pt-3.5 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Match Completed Checkup Event:</span>
                        {matchedEvents.map(e => (
                          <div key={e.id} className="p-3 bg-white/70 border border-emerald-150 rounded-xl flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-gray-800">Completed on {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
                            </div>
                            <span className={cn(
                              "px-2 px-2.5 py-0.5 uppercase text-[9px] font-extrabold tracking-wider rounded-lg",
                              e.isAbnormal ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            )}>
                              Findings: {e.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-[11px] text-gray-400 leading-normal flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Check with your oncologist or GP to order or schedule.</span>
                        </div>
                        {onAddEvent && (
                          <button
                            onClick={onAddEvent}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg active:scale-95 transition-all inline-flex items-center gap-1"
                          >
                            <span>+ Log Completion</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety & Guideline compliance note */}
      <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-purple-600" />
          <span>Clinical Disclaimer</span>
        </h4>
        <p className="text-xs text-purple-800/80 leading-normal font-medium">
          Survivorship reminders are intended to support care conversations and may reference published guideline concepts. Always confirm tests, timing, symptoms, and follow-up plans with your oncology and primary care teams.
        </p>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={onRemove}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove Survivorship Plan & Cleans History</span>
        </button>
      </div>
    </div>
  );
}
