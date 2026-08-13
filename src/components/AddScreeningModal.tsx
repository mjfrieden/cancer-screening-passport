import React, { useState, useEffect } from 'react';
import { ScreeningCareStatus, ScreeningEvent } from '../types';
import { X, Calendar, Clipboard, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCareStatus, legacyStatusForCareStatus } from '../lib/screeningEvents';

interface ResultPreset {
  label: string;
  value: string;
  isAbnormal: boolean;
}

const PRESETS_BY_TYPE: Record<ScreeningEvent['type'], ResultPreset[]> = {
  colonoscopy: [
    { label: "Normal (No polyps found)", value: "Normal (No polyps)", isAbnormal: false },
    { label: "Hyperplastic polyp(s) (Benign findings)", value: "Hyperplastic polyp(s)", isAbnormal: false },
    { label: "Adenomatous polyp(s) (Pre-cancerous findings)", value: "Adenomatous polyp(s)", isAbnormal: true },
    { label: "Suspicious mass or malignant neoplasm", value: "Suspicious mass / malignant neoplasm", isAbnormal: true }
  ],
  fit: [
    { label: "Negative (Normal)", value: "Negative / Normal", isAbnormal: false },
    { label: "Positive (Blood detected - Abnormal)", value: "Positive", isAbnormal: true }
  ],
  cologuard: [
    { label: "Negative (Normal)", value: "Negative / Normal", isAbnormal: false },
    { label: "Positive (Abnormal - Follow up colonoscopy needed)", value: "Positive", isAbnormal: true }
  ],
  mammogram: [
    { label: "BI-RADS 1 (Negative - Normal)", value: "BI-RADS 1 - Negative", isAbnormal: false },
    { label: "BI-RADS 2 (Benign findings - Normal)", value: "BI-RADS 2 - Benign", isAbnormal: false },
    { label: "BI-RADS 3 (Probably benign)", value: "BI-RADS 3 - Probably benign", isAbnormal: false },
    { label: "BI-RADS 0 (Incomplete - Needs evaluation)", value: "BI-RADS 0 - Incomplete", isAbnormal: true },
    { label: "BI-RADS 4 (Suspicious abnormality)", value: "BI-RADS 4 - Suspicious", isAbnormal: true },
    { label: "BI-RADS 5 (Highly suggestive of malignancy)", value: "BI-RADS 5 - Malignant suggestion", isAbnormal: true }
  ],
  pap: [
    { label: "NILM (Negative for Intraepithelial Lesion or Malignancy)", value: "NILM (Negative)", isAbnormal: false },
    { label: "ASC-US (Atypical Squamous Cells)", value: "ASC-US", isAbnormal: true },
    { label: "LSIL (Low-grade Squamous Intraepithelial Lesion)", value: "LSIL (Abnormal)", isAbnormal: true },
    { label: "HSIL (High-grade Squamous Intraepithelial Lesion)", value: "HSIL (Abnormal)", isAbnormal: true }
  ],
  hpv: [
    { label: "Negative (HPV-)", value: "HPV Negative", isAbnormal: false },
    { label: "Positive (HPV+)", value: "HPV Positive", isAbnormal: true }
  ],
  ldct: [
    { label: "Lung-RADS 1/2 (Negative / Benign)", value: "Lung-RADS - Negative/Benign", isAbnormal: false },
    { label: "Lung-RADS 3/4 (Suspicious / Diagnostic review required)", value: "Lung-RADS - High suspicion", isAbnormal: true }
  ],
  psa: [
    { label: "Normal (< 4.0 ng/mL)", value: "Normal (< 4.0 ng/mL)", isAbnormal: false },
    { label: "Elevated PSA level", value: "Elevated (> 4.0 ng/mL)", isAbnormal: true }
  ],
  // Fallbacks in case other internal types are active
  surveillance_imaging: [
    { label: "No evidence of disease recurrence", value: "No evidence of recurrence", isAbnormal: false },
    { label: "Suspicious / Actionable recurrence findings", value: "Suspicious recurrence findings", isAbnormal: true }
  ],
  marker_check: [
    { label: "Within normal limits", value: "Within normal limits", isAbnormal: false },
    { label: "Abnormally elevated tumor markers", value: "Abnormally elevated", isAbnormal: true }
  ]
};

interface AddScreeningModalProps {
  isOpen: boolean;
  initialEvent?: ScreeningEvent | null;
  suggestedType?: ScreeningEvent['type'] | null;
  onClose: () => void;
  onSave: (event: Omit<ScreeningEvent, 'id' | 'userId'>) => void;
  loading: boolean;
}

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AddScreeningModal({ isOpen, initialEvent, suggestedType, onClose, onSave, loading }: AddScreeningModalProps) {
  const [type, setType] = useState<ScreeningEvent['type']>('colonoscopy');
  const [date, setDate] = useState(getLocalDateInputValue());
  const [careStatus, setCareStatus] = useState<ScreeningCareStatus>('completed');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [result, setResult] = useState('Normal (No polyps)');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(initialEvent?.type ?? suggestedType ?? 'colonoscopy');
      setDate(initialEvent?.date ?? getLocalDateInputValue());
      setCareStatus(initialEvent ? getCareStatus(initialEvent) : suggestedType ? 'discuss' : 'completed');
      setAppointmentDate(initialEvent?.appointmentDate ?? '');
      setFollowUpNote(initialEvent?.followUpNote ?? '');
      setResult(initialEvent?.result ?? 'Normal (No polyps)');
      setIsAbnormal(initialEvent?.isAbnormal ?? false);
      setError(null);
    }
  }, [initialEvent, isOpen, suggestedType]);

  const handleTypeChange = (newType: ScreeningEvent['type']) => {
    setType(newType);
    const presets = PRESETS_BY_TYPE[newType] || [];
    if (presets.length > 0) {
      setResult(presets[0].value);
      setIsAbnormal(presets[0].isAbnormal);
    } else {
      setResult('');
      setIsAbnormal(false);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultIsAvailable = ['result_received', 'follow_up_needed', 'resolved'].includes(careStatus);
    const preserveOpenAbnormalResult = Boolean(initialEvent?.isAbnormal && careStatus !== 'resolved');
    if (resultIsAvailable && (!result || !result.trim())) {
      setError("Result findings is required and cannot be empty.");
      return;
    }
    if (careStatus === 'scheduled' && !appointmentDate) {
      setError('Add the scheduled appointment date.');
      return;
    }
    setError(null);
    onSave({
      type,
      date: careStatus === 'scheduled' && appointmentDate ? appointmentDate : date,
      result: resultIsAvailable ? result.trim() : preserveOpenAbnormalResult ? initialEvent?.result ?? '' : '',
      isAbnormal: resultIsAvailable ? isAbnormal : preserveOpenAbnormalResult,
      status: legacyStatusForCareStatus(careStatus),
      careStatus,
      reminderPreference: initialEvent?.reminderPreference ?? 'none',
      preparationCompleted: initialEvent?.preparationCompleted ?? [],
      ...(followUpNote.trim() ? { followUpNote: followUpNote.trim() } : {}),
      ...(careStatus === 'scheduled' ? { appointmentDate } : {}),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-screening-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 id="add-screening-title" className="text-xl font-bold text-gray-900">
                  {initialEvent ? 'Update Screening Progress' : suggestedType ? 'Start Screening Plan' : 'Add Screening'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {initialEvent
                    ? 'Update information that was entered incorrectly. The revised record remains patient-entered.'
                    : suggestedType
                      ? 'Save where you are now, then return here as the screening moves forward.'
                      : 'Track a screening from discussion through results and follow-up.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                aria-label="Close add screening dialog"
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="screening-type" className="block text-sm font-semibold text-gray-700 mb-1">Screening Test Type</label>
                <select
                  id="screening-type"
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="colonoscopy">Colonoscopy (Colorectal)</option>
                  <option value="fit">FIT Stool Test (Colorectal)</option>
                  <option value="cologuard">Stool DNA Test (Cologuard)</option>
                  <option value="mammogram">Mammography (Breast)</option>
                  <option value="pap">Cervical Pap Smear (Cervical)</option>
                  <option value="hpv">HPV Co-testing (Cervical)</option>
                  <option value="ldct">Lung LDCT (Lung)</option>
                  <option value="psa">PSA blood test (Prostate)</option>
                </select>
              </div>

              <div>
                <label htmlFor="screening-progress" className="block text-sm font-semibold text-gray-700 mb-1">Where are you now?</label>
                <select
                  id="screening-progress"
                  value={careStatus}
                  onChange={(event) => {
                    setCareStatus(event.target.value as ScreeningCareStatus);
                    setError(null);
                  }}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="discuss">I need to discuss this with a clinician</option>
                  <option value="order_requested">I requested an order or referral</option>
                  <option value="ordered">The test was ordered</option>
                  <option value="scheduled">The appointment is scheduled</option>
                  <option value="completed">I completed the test and await results</option>
                  <option value="result_received">I received the result</option>
                  <option value="follow_up_needed">The result needs follow-up</option>
                  <option value="resolved">Follow-up is complete or resolved</option>
                </select>
              </div>

              {careStatus === 'scheduled' && (
                <div>
                  <label htmlFor="appointment-date" className="block text-sm font-semibold text-gray-700 mb-1">Appointment Date</label>
                  <input
                    id="appointment-date"
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}

              {['completed', 'result_received', 'follow_up_needed', 'resolved'].includes(careStatus) && (
              <div>
                <label htmlFor="screening-date" className="block text-sm font-semibold text-gray-700 mb-1">Completion Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    id="screening-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              )}

              {['result_received', 'follow_up_needed', 'resolved'].includes(careStatus) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">Result Findings</label>
                <div className="space-y-3">
                  {/* Preset Selector Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="screening-result-preset" className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Common Presets Based on Test</label>
                    <select
                      id="screening-result-preset"
                      value={PRESETS_BY_TYPE[type]?.some(p => p.value === result) ? result : "custom"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setError(null);
                        } else {
                          const matchedPreset = PRESETS_BY_TYPE[type]?.find(p => p.value === val);
                          if (matchedPreset) {
                            setResult(matchedPreset.value);
                            setIsAbnormal(matchedPreset.isAbnormal);
                          }
                          setError(null);
                        }
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                      {PRESETS_BY_TYPE[type]?.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="custom">✍️ Keep custom entry / Edit directly</option>
                    </select>
                  </div>

                  {/* Manual/Refined edit field */}
                  <div className="space-y-1">
                    <label htmlFor="screening-result-detail" className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Detailed Findings Description</label>
                    <div className="relative">
                      <Clipboard className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        id="screening-result-detail"
                        type="text"
                        value={result}
                        onChange={(e) => {
                          setResult(e.target.value);
                          setError(null);
                        }}
                        placeholder="e.g., Normal, NILM, CIN1, Negative"
                        className={`w-full pl-10 p-3 rounded-xl border ${
                          error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                        } focus:ring-2 outline-none transition-all text-sm`}
                      />
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-xs text-red-600 font-bold mt-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {['result_received', 'follow_up_needed', 'resolved'].includes(careStatus) && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Abnormal Result?</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    This flags follow-up algorithms.
                  </p>
                </div>
                <input
                  aria-label="Abnormal result"
                  type="checkbox"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              )}

              {['follow_up_needed', 'resolved'].includes(careStatus) && (
                <div>
                  <label htmlFor="follow-up-note" className="block text-sm font-semibold text-gray-700 mb-1">Follow-up note</label>
                  <textarea
                    id="follow-up-note"
                    value={followUpNote}
                    onChange={(event) => setFollowUpNote(event.target.value)}
                    placeholder="For example: called primary care; referral requested. Do not enter urgent symptoms here."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                This is saved as <strong>patient-entered information</strong> and is not verified against the original medical record. Confirm abnormal findings and follow-up timing with your care team.
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {loading ? 'Saving...' : initialEvent ? 'Save Progress' : 'Save Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
