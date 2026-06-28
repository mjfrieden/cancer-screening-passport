import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, User, Activity, AlertTriangle, Beaker, ChevronDown, ChevronUp, Settings2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VALIDATION_PRESETS: { name: string; description: string; profile: UserProfile }[] = [
  {
    name: "Case A: Breast Cancer Survivor",
    description: "Female (48) with history of Breast Cancer, treated with Lumpectomy Surgery & Endocrine Hormonals, no Chemo.",
    profile: {
      userId: "",
      name: "Sophia Carter (Simulated)",
      dob: "1978-05-15",
      sexAssignedAtBirth: "female",
      genderIdentity: "female",
      smokingHistory: { status: "never", packYears: 0 },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: true,
      survivorshipPlan: {
        cancerType: "breast",
        diagnosisDate: "2023-04-12",
        stage: "2",
        treatments: ["Surgery", "Hormonal Therapy"]
      }
    }
  },
  {
    name: "Case B: Colorectal Cancer Survivor",
    description: "Male (52) with history of Stage III Colorectal Cancer, treated with Surgery & Chemotherapy.",
    profile: {
      userId: "",
      name: "Ethan Ramirez (Simulated)",
      dob: "1974-08-20",
      sexAssignedAtBirth: "male",
      genderIdentity: "male",
      smokingHistory: { status: "former", packYears: 10, quitDate: "2020-01-15" },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: false,
      survivorshipPlan: {
        cancerType: "colorectal",
        diagnosisDate: "2022-11-05",
        stage: "3",
        treatments: ["Surgery", "Chemotherapy"]
      }
    }
  },
  {
    name: "Case C: Prostate Cancer Survivor",
    description: "Male (62) with history of Prostate Cancer, treated with Radiation & Hormonals.",
    profile: {
      userId: "",
      name: "Marcus Vance (Simulated)",
      dob: "1964-02-10",
      sexAssignedAtBirth: "male",
      genderIdentity: "male",
      smokingHistory: { status: "never", packYears: 0 },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: false,
      survivorshipPlan: {
        cancerType: "prostate",
        diagnosisDate: "2021-06-30",
        stage: "2",
        treatments: ["Radiation", "Hormonal Therapy"]
      }
    }
  },
  {
    name: "Case D: Lung Cancer Survivor",
    description: "Female (58) with history of Lung Cancer, treated with Surgery & Immunotherapy. Smoker status: Former (25 pack-years).",
    profile: {
      userId: "",
      name: "Grace Helm (Simulated)",
      dob: "1968-12-05",
      sexAssignedAtBirth: "female",
      genderIdentity: "female",
      smokingHistory: { status: "former", packYears: 25, quitDate: "2024-02-01" },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: true,
      survivorshipPlan: {
        cancerType: "lung",
        diagnosisDate: "2024-05-18",
        stage: "3",
        treatments: ["Surgery", "Immunotherapy"]
      }
    }
  },
  {
    name: "Case E: Lymphoma Survivor",
    description: "Male (35) with history of Lymphoma, treated with Chemotherapy & Radiation.",
    profile: {
      userId: "",
      name: "Liam O'Connor (Simulated)",
      dob: "1991-03-24",
      sexAssignedAtBirth: "male",
      genderIdentity: "male",
      smokingHistory: { status: "never", packYears: 0 },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: false,
      survivorshipPlan: {
        cancerType: "lymphoma",
        diagnosisDate: "2020-09-15",
        stage: "2",
        treatments: ["Chemotherapy", "Radiation"]
      }
    }
  },
  {
    name: "Case F: Pancreatic Cancer Survivor",
    description: "Female (60) with history of Pancreatic Cancer, treated with Surgery (Whipple procedure) & Chemotherapy.",
    profile: {
      userId: "",
      name: "Claire Dubois (Simulated)",
      dob: "1966-07-30",
      sexAssignedAtBirth: "female",
      genderIdentity: "female",
      smokingHistory: { status: "never", packYears: 0 },
      personalHistoryOfCancer: true,
      immunocompromised: false,
      cervixPresent: true,
      survivorshipPlan: {
        cancerType: "pancreatic",
        diagnosisDate: "2023-10-14",
        stage: "3",
        treatments: ["Surgery", "Chemotherapy"]
      }
    }
  }
];

interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSave: (data: UserProfile) => void;
  loading: boolean;
}

export default function ProfileForm({ initialData, onSave, loading }: ProfileFormProps) {
  const enableClinicalSimulator = import.meta.env.VITE_ENABLE_CLINICAL_SIMULATOR === 'true';
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {
    sexAssignedAtBirth: 'female',
    smokingHistory: { status: 'never', packYears: 0 },
    personalHistoryOfCancer: false,
    immunocompromised: false,
    cervixPresent: true,
  });

  const [showPresets, setShowPresets] = useState(false);
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);

  const applyPreset = (preset: typeof VALIDATION_PRESETS[0]) => {
    setFormData(preset.profile);
    setAppliedPresetName(preset.name);
    onSave(preset.profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as UserProfile);
  };

  const updateSmoking = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      smokingHistory: { ...prev.smokingHistory!, [field]: value }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
      {enableClinicalSimulator && (
      <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 border border-blue-100/60 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800">
            <Beaker className="w-5 h-5 text-blue-600 animate-pulse" />
            <h3 className="font-bold text-sm tracking-tight">Clinical Verification Hub</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-bold transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showPresets ? "Hide Simulator" : "Show Preset Simulator"}</span>
            {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-gray-605 leading-relaxed font-medium">
          Verify and test NCCN guideline adaptations and tab rendering under different cancer histories. Load ready-to-test case presets or customize manually.
        </p>

        {appliedPresetName && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 p-2.5 rounded-xl text-xs flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Active Test Case: {appliedPresetName}. Loaded successfully!</span>
          </div>
        )}

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2.5 pt-2"
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select a Patient Case Study:</div>
              <div className="grid sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {VALIDATION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-white border border-gray-150 rounded-xl text-left hover:border-blue-500 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                        <span>{preset.name}</span>
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-1.5" />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-2.5 text-[9px] font-extrabold uppercase tracking-widest text-blue-600 flex items-center gap-1">
                      <span>Launch Test Case</span>
                      <span>&rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <User className="w-5 h-5" />
          <h3 className="font-bold">Demographics</h3>
        </div>
        <div className="grid gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="profile-name"
              type="text"
              required
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                id="profile-dob"
                type="date"
                required
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.dob || ''}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="profile-sex" className="block text-sm font-medium text-gray-700 mb-1">Sex Assigned at Birth</label>
              <select
                id="profile-sex"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.sexAssignedAtBirth}
                onChange={e => setFormData({ ...formData, sexAssignedAtBirth: e.target.value as any })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Activity className="w-5 h-5" />
          <h3 className="font-bold">Health History</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
            <div className="flex gap-2">
              {['never', 'former', 'current'].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={formData.smokingHistory?.status === s}
                  onClick={() => updateSmoking('status', s)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.smokingHistory?.status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(formData.smokingHistory?.status === 'former' || formData.smokingHistory?.status === 'current') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <label htmlFor="profile-pack-years" className="block text-xs font-medium text-gray-500 mb-1">Pack-years</label>
                <input
                  id="profile-pack-years"
                  type="number"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={formData.smokingHistory?.packYears || 0}
                  onChange={e => updateSmoking('packYears', parseInt(e.target.value))}
                />
              </div>
              {formData.smokingHistory?.status === 'former' && (
                <div>
                  <label htmlFor="profile-quit-date" className="block text-xs font-medium text-gray-500 mb-1">Quit Date</label>
                  <input
                    id="profile-quit-date"
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    value={formData.smokingHistory?.quitDate || ''}
                    onChange={e => updateSmoking('quitDate', e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
             <div>
               <h4 className="text-sm font-medium">Personal History of Cancer</h4>
               <p className="text-[10px] text-gray-500">Includes any prior cancer treatments</p>
             </div>
             <input
               aria-label="Personal history of cancer"
               type="checkbox"
               className="w-5 h-5 accent-blue-600"
               checked={formData.personalHistoryOfCancer}
               onChange={e => setFormData({ ...formData, personalHistoryOfCancer: e.target.checked })}
             />
          </div>

          {formData.sexAssignedAtBirth === 'female' && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
               <div>
                 <h4 className="text-sm font-medium">Cervix Present</h4>
                 <p className="text-[10px] text-gray-500">Uncheck if you have had a total hysterectomy</p>
               </div>
               <input
                 aria-label="Cervix present"
                 type="checkbox"
                 className="w-5 h-5 accent-blue-600"
                 checked={formData.cervixPresent}
                 onChange={e => setFormData({ ...formData, cervixPresent: e.target.checked })}
               />
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              These factors help tailor guideline-inspired reminders. Confirm all screening decisions with your clinician.
            </p>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          type="submit"
          disabled={loading}
          className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : (
            <>
              <Save className="w-5 h-5" />
              Update Passport Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
