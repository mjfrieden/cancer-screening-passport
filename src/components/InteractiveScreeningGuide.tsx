import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Info, 
  Activity, 
  User, 
  Sparkles,
  ArrowRight,
  ClipboardList,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ScreeningOption {
  id: string;
  name: string;
  type: string;
  timeline: string;
  description: string;
  howItWorks: string;
  whoShouldGetIt: string;
  preparation: string;
}

interface CancerCategory {
  id: string;
  title: string;
  description: string;
  iconName: 'colorectal' | 'breast' | 'cervical' | 'prostate';
  options: ScreeningOption[];
}

const CATEGORIES: CancerCategory[] = [
  {
    id: 'colorectal',
    title: 'Colorectal (Colon) Screening',
    description: 'Colon screening checks your large bowel. It is highly effective because it can find and remove small growths (called polyps) before they ever have a chance to turn into cancer.',
    iconName: 'colorectal',
    options: [
      {
        id: 'colonoscopy',
        name: 'Colonoscopy',
        type: 'Visual Camera Exam',
        timeline: 'Once every 10 years (for most people with normal results)',
        description: 'A doctor uses a tiny camera on a thin, flexible tube to view the entire inside of your colon.',
        howItWorks: 'This is the most thorough option because if the doctor finds any pre-cancerous polyps, they can remove them immediately during the test.',
        whoShouldGetIt: 'Recommended for everyone starting at age 45, or earlier if you have a family history of colon cancer.',
        preparation: 'Requires drinking a special liquid the day before to completely clean out your bowel, and you will be given medicine to let you sleep comfortably during the test.'
      },
      {
        id: 'fit',
        name: 'FIT Test',
        type: 'Simple At-Home Stool Card',
        timeline: 'Once every year (Annually)',
        description: 'A private, non-invasive kit you use at home to collect a tiny stool sample, which you mail or return to a lab.',
        howItWorks: 'The lab checks the sample for microscopic amounts of blood that are invisible to the eye but could point to growths or early issues.',
        whoShouldGetIt: 'Great for people who prefer a simple, private option they can do at home without bowel prep or sedation.',
        preparation: 'None. You do not need to change your diet or stop taking medications. If this yearly test is positive, a colonoscopy is required to check why.'
      },
      {
        id: 'cologuard',
        name: 'Cologuard (Stool DNA Test)',
        type: 'Advanced At-Home Mail Kit',
        timeline: 'Once every 3 years',
        description: 'An advanced at-home mail-in test kit that looks for both invisible blood and abnormal cell changes.',
        howItWorks: 'You collect a stool sample in a container at home and mail it to a specialized lab in a pre-paid box.',
        whoShouldGetIt: 'An option for average-risk adults who want to test less frequently than the annual FIT test.',
        preparation: 'None. No food or medicine restrictions. If the test comes back positive, a follow-up colonoscopy is necessary.'
      }
    ]
  },
  {
    id: 'breast',
    title: 'Breast Screening',
    description: 'Breast screening looks for early indicators of breast changes when they are incredibly small and much easier to treat successfully.',
    iconName: 'breast',
    options: [
      {
        id: 'mammogram',
        name: 'Standard Screening Mammogram',
        type: 'Breast X-Ray',
        timeline: 'Once every 1 to 2 years',
        description: 'A quick, highly structured X-ray exam of the breast tissue.',
        howItWorks: 'A specialized machine gently presses each breast for a few seconds to flatten the tissue and get a clear, safe picture.',
        whoShouldGetIt: 'The primary screening test recommended for all women starting at age 40.',
        preparation: 'Avoid wearing any underarm deodorant, perfume, powder, or lotion on the day of your appointment, as these can show up on the X-ray.'
      },
      {
        id: '3d_mammogram',
        name: '3D Mammogram (Tomosynthesis)',
        type: 'Advanced Multi-Angle X-Ray',
        timeline: 'Once every 1 to 2 years',
        description: 'An advanced mammogram that takes multiple clear images from different angles to create a 3-dimensional view.',
        howItWorks: 'By producing thin "slices" of the breast, it allows doctors to look through overlapping dense tissue more clearly.',
        whoShouldGetIt: 'Highly recommended for women who have denser breast tissue or a slightly higher risk.',
        preparation: 'Avoid wearing deodorant, perfume, powders, or lotions under your arms on the day of the test.'
      }
    ]
  },
  {
    id: 'cervical',
    title: 'Cervical Screening',
    description: 'Cervical screening helps find changes on the cervix (the lower part of the uterus) before they can develop into cancer. These changes are almost always caused by a very common virus called HPV.',
    iconName: 'cervical',
    options: [
      {
        id: 'pap_smear',
        name: 'Pap Smear',
        type: 'Cell Health Check',
        timeline: 'Once every 3 years',
        description: 'A doctor gently collects a small sample of cells from your cervix during a routine office visit.',
        howItWorks: 'A lab looks at the cells under a microscope to spot any unusual cell shapes before they can turn into anything serious.',
        whoShouldGetIt: 'Generally recommended for women starting at age 21 through age 29.',
        preparation: 'Try to schedule your appointment on a day you are not on your period. Avoid sexual intercourse, douching, or vaginal creams for 48 hours beforehand.'
      },
      {
        id: 'hpv_test',
        name: 'HPV Test',
        type: 'Viral DNA Check',
        timeline: 'Once every 5 years',
        description: 'A cervix swab test that checks directly for the presence of the HPV virus.',
        howItWorks: 'Instead of looking at cell shapes, this test checks for the genetic code (DNA) of the high-risk strains of HPV that lead to cell changes.',
        whoShouldGetIt: 'An outstanding, highly protective option for women aged 25 to 65.',
        preparation: 'Best done when not on your period. Avoid intercourse, douching, or vaginal creams for 48 hours before the test.'
      },
      {
        id: 'cotesting',
        name: 'Co-Testing (Pap + HPV)',
        type: 'Double-Layer Check',
        timeline: 'Once every 5 years',
        description: 'A single, routine doctor swabbing that runs both the Pap cell test and the HPV virus test at the same time.',
        howItWorks: 'This combines the safety of looking at cells with checking for the underlying virus, providing excellent long-term reassurance.',
        whoShouldGetIt: 'Very popular option for women aged 30 to 65.',
        preparation: 'Avoid intercourse, douching, or vaginal creams for 48 hours prior. Best scheduled when you do not have your period.'
      }
    ]
  },
  {
    id: 'prostate',
    title: 'Prostate Screening',
    description: 'Prostate screening checks the health of your prostate. Shared decision discussions are recommended for men to weigh personalized benefits against potential harms.',
    iconName: 'prostate',
    options: [
      {
        id: 'psa_blood',
        name: 'PSA Blood Test',
        type: 'Simple Blood Test',
        timeline: 'Once every 1 to 2 years (Ages 55-69)',
        description: 'A routine blood draw checking the concentration of Prostate-Specific Antigen.',
        howItWorks: 'A rising or high level of PSA can be a sign of changes in the cells of the prostate gland.',
        whoShouldGetIt: 'Men aged 55 to 69 after consulting with their doctor about their individual risk factor profiles.',
        preparation: 'Avoid intense physical exercise or sexual activity for 48 hours prior to testing, as these can temporarily elevate PSA levels.'
      },
      {
        id: 'dre_physical',
        name: 'Clinical Prostate Exam (DRE)',
        type: 'In-Office Physical Check',
        timeline: 'On discussion / as clinically indicated',
        description: 'A quick physical exam checking the physical contours of the prostate.',
        howItWorks: 'A clinician checks for abnormal firm nodules or physical irregularities on the prostate wall.',
        whoShouldGetIt: 'Men undergoing active shared clinical decision making for prostate health tracking.',
        preparation: 'None. This standard physical check is performed directly during your consultation.'
      }
    ]
  }
];

interface InteractiveScreeningGuideProps {
  profile?: any;
}

export default function InteractiveScreeningGuide({ profile }: InteractiveScreeningGuideProps) {
  const sex = profile?.sexAssignedAtBirth;

  // Filter categories according to patient's sex
  const filteredCategories = CATEGORIES.filter((cat) => {
    if (sex === 'male') {
      return cat.id === 'colorectal' || cat.id === 'prostate';
    }
    if (sex === 'female') {
      return cat.id === 'colorectal' || cat.id === 'breast' || cat.id === 'cervical';
    }
    return true; // show all if profile is unconfigured
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>('colorectal');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('colonoscopy');

  // Synchronize dynamic category visibility when profile sex toggles
  useEffect(() => {
    if (!filteredCategories.some(c => c.id === activeCategoryId)) {
      const firstCat = filteredCategories[0];
      if (firstCat) {
        setActiveCategoryId(firstCat.id);
        setSelectedOptionId(firstCat.options[0]?.id || '');
      }
    }
  }, [sex, filteredCategories, activeCategoryId]);

  const currentCategory = filteredCategories.find(c => c.id === activeCategoryId) || filteredCategories[0] || CATEGORIES[0];
  const activeOption = currentCategory.options.find(o => o.id === selectedOptionId) || currentCategory.options[0];

  const handleCategoryChange = (catId: string) => {
    setActiveCategoryId(catId);
    const targetCat = filteredCategories.find(c => c.id === catId) || filteredCategories[0] || CATEGORIES[0];
    setSelectedOptionId(targetCat.options[0]?.id || '');
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-4 sm:p-7 space-y-7 font-sans">
      
      {/* 🌟 Intro Guidance Banner */}
      <div className="flex items-start gap-4 p-4.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
            Explore Your Preventive Screening Options
          </h4>
          <p className="text-xs text-indigo-800 leading-relaxed">
            You have choices when it comes to staying healthy. This guide translates complex medical tests into simple language. Compare your options and see which recommended timelines fit your life.
          </p>
        </div>
      </div>

      {/* 🏷️ Primary Category Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-150">
        {filteredCategories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              id={`tab-category-${cat.id}`}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "p-3 rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer",
                isActive 
                  ? "bg-white text-indigo-700 shadow-sm border border-gray-200/50" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
              )}
            >
              {cat.id === 'colorectal' && <Activity className="w-4 h-4 shrink-0 text-indigo-500" />}
              {cat.id === 'breast' && <User className="w-4 h-4 shrink-0 text-rose-500" />}
              {cat.id === 'cervical' && <ClipboardList className="w-4 h-4 shrink-0 text-teal-500" />}
              {cat.id === 'prostate' && <Shield className="w-4 h-4 shrink-0 text-sky-500" />}
              <span>{cat.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* 📖 Category Description */}
      <div className="space-y-1 text-center sm:text-left px-1">
        <p className="text-xs text-gray-500 leading-relaxed">
          {currentCategory.description}
        </p>
      </div>

      {/* 🗺️ Split View layout - Options on Left, Selected details on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
        
        {/* Left Side: Option Selection Cards */}
        <div className="md:col-span-5 space-y-3">
          <div className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest px-1">
            Test Options Available:
          </div>

          <div className="space-y-2.5">
            {currentCategory.options.map((option) => {
              const isSelected = option.id === selectedOptionId;
              return (
                <button
                  key={option.id}
                  id={`btn-guide-option-${option.id}`}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left border transition-all hover:shadow-sm flex flex-col gap-1 cursor-pointer",
                    isSelected 
                      ? "bg-indigo-50/10 border-indigo-500 ring-1 ring-indigo-500/10 shadow-sm" 
                      : "bg-white border-gray-150 hover:bg-gray-50/40"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-[9px]">
                      {option.type}
                    </span>
                    <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-transform", isSelected && "text-indigo-500 translate-x-1")} />
                  </div>
                  
                  <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                    {option.name}
                  </span>

                  <span className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{option.timeline}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Simple Detail View */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {activeOption ? (
              <motion.div
                key={activeOption.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-50 border border-slate-150 p-5 sm:p-6 rounded-3xl h-full flex flex-col justify-between space-y-5"
              >
                {/* Option Head */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/50 pb-3">
                    <div>
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block">
                        Screening Detail
                      </span>
                      <h4 className="text-lg font-extrabold text-gray-950 tracking-tight">
                        {activeOption.name}
                      </h4>
                    </div>
                    
                    <div className="bg-indigo-100 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-tight flex items-center gap-1.5 w-max">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeOption.timeline}</span>
                    </div>
                  </div>

                  {/* Plain-English Descriptions */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        What is this test?
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">
                        {activeOption.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        How does it work?
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">
                        {activeOption.howItWorks}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Who is this for?
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">
                        {activeOption.whoShouldGetIt}
                      </p>
                    </div>

                    <div className="p-3.5 bg-yellow-50/50 border border-yellow-150 rounded-2xl">
                      <h5 className="text-xs font-bold text-yellow-905 uppercase tracking-wide flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
                        <span>How to Prepare:</span>
                      </h5>
                      <p className="text-xs text-yellow-800 leading-relaxed mt-1 font-medium">
                        {activeOption.preparation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Advice Footnote */}
                <div className="text-[10.5px] text-gray-400 flex items-start gap-1.5 border-t border-gray-200/40 pt-3">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Always discuss your options and preference with your primary care doctor to choose the path that best matches your personal convenience and health.
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="text-gray-400 text-xs italic">Select an option to view details.</div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 💁 Patient-Doc Conversation Helper Board */}
      <div className="p-5 border border-emerald-100 bg-emerald-50/10 rounded-2xl space-y-3">
        <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>General Recommendations & Next Steps</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-extrabold text-gray-800 block">1. Focus on regular timelines</span>
            <p className="text-gray-550 leading-relaxed">
              No matter which option you select, staying on the correct timeline (whether that is every year, every 3 years, or every 10 years) is the absolute best way to protect your long term health.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-gray-800 block">2. Ask your doctor</span>
            <p className="text-gray-550 leading-relaxed">
              Use the <strong>"Save Physician PDF"</strong> button above under the <strong>Share</strong> tab to print out a simplified, clean summary to review during your next checkup.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
