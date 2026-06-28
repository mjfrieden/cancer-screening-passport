import React, { useState } from 'react';
import { Apple, Activity, Heart, Shield, Info, ExternalLink, Check, Plus, Minus, Flame, Salad, GlassWater, Beer, Award, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { Recommendation } from '../types';

interface HealthyLivingProps {
  recommendations?: Recommendation[];
}

export default function HealthyLiving({ recommendations = [] }: HealthyLivingProps) {
  const preventionRecommendations = recommendations.filter(r => r.status === 'prevention');

  // Fallback defaults if no dynamic recommendations have been fetched yet
  const defaultAICR = [
    {
      id: "prevention-weight",
      recommended_action: "Be a healthy weight",
      reason: "Keep your weight within the healthy range and avoid weight gain in adult life.",
      screening_modality: "Weight Management"
    },
    {
      id: "prevention-activity",
      recommended_action: "Be physically active",
      reason: "Walk more and sit less. Aim for at least 150 min of moderate activity per week.",
      screening_modality: "Physical Activity"
    },
    {
      id: "prevention-diet",
      recommended_action: "Eat a diet rich in whole grains, vegetables, fruits and beans",
      reason: "Make whole grains, vegetables, fruits and pulses such as beans and lentils a major part of your usual daily diet.",
      screening_modality: "Nutrition"
    },
    {
      id: "prevention-fast-food",
      recommended_action: "Limit 'fast foods' and processed foods high in fat, starches or sugars",
      reason: "Limiting these foods helps control calorie intake and maintain a healthy weight.",
      screening_modality: "Nutrition"
    },
    {
      id: "prevention-meat",
      recommended_action: "Limit red and processed meat",
      reason: "Eat no more than moderate amounts of red meat and little, if any, processed meat.",
      screening_modality: "Nutrition"
    },
    {
      id: "prevention-drinks",
      recommended_action: "Limit sugar-sweetened drinks",
      reason: "Drink mostly water and unsweetened drinks to avoid weight gain.",
      screening_modality: "Nutrition"
    },
    {
      id: "prevention-alcohol",
      recommended_action: "Limit alcohol consumption",
      reason: "For cancer prevention, it's best not to drink alcohol.",
      screening_modality: "Lifestyle"
    }
  ];

  const activeGuidelines = preventionRecommendations.length > 0 
    ? preventionRecommendations 
    : defaultAICR.map(g => ({
        id: g.id,
        cancer_type: "Healthy Living (AICR)",
        status: "prevention" as const,
        recommended_action: g.recommended_action,
        screening_modality: g.screening_modality,
        due_date: "N/A",
        reason: g.reason,
        source: "AICR",
        source_version: "2024",
        source_url: "https://www.aicr.org/cancer-prevention/recommendations/",
        recommendation_grade: "N/A",
        confidence: "high" as const,
        requires_clinician_review: false,
        clinical_review_status: "physician_reviewed" as const,
        clinical_review_note: "Content reviewed for medical accuracy by a physician on behalf of White Cloud Medical, LLC on 2026-06-28. Patient-specific clinician review remains required."
      }));

  const [adherence, setAdherence] = useState<{ [key: string]: 'undone' | 'improving' | 'following' }>({});

  const toggleAdherence = (id: string) => {
    const current = adherence[id] || 'undone';
    let next: 'undone' | 'improving' | 'following';
    if (current === 'undone') next = 'improving';
    else if (current === 'improving') next = 'following';
    else next = 'undone';

    setAdherence(currentAdherence => ({ ...currentAdherence, [id]: next }));
  };

  // Calculate score representation: following = 2 points, improving = 1 point, undone = 0 points.
  const totalPossible = activeGuidelines.length * 2;
  const currentScore = activeGuidelines.reduce((acc, g) => {
    const status = adherence[g.id] || 'undone';
    if (status === 'following') return acc + 2;
    if (status === 'improving') return acc + 1;
    return acc;
  }, 0);

  const percentage = totalPossible > 0 ? Math.round((currentScore / totalPossible) * 100) : 0;

  // Map guideline IDs to custom designs
  const getCardDesign = (id: string) => {
    switch (id) {
      case 'prevention-weight':
        return {
          icon: Heart,
          color: 'bg-rose-50 border-rose-100 text-rose-600',
          badgeColor: 'bg-rose-100 text-rose-700',
          tips: ["Avoid sugary drinks", "Limit energy-dense foods", "Include lean protein & fiber"]
        };
      case 'prevention-activity':
        return {
          icon: Activity,
          color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          tips: ["150 mins moderate activity/week", "Take dynamic standing/movement breaks", "Incorporate strength sessions"]
        };
      case 'prevention-diet':
        return {
          icon: Salad,
          color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          tips: ["Aim for 30g fiber daily", "5 portions (400g) of non-starchy veg/fruit", "Add beans or lentils to meals"]
        };
      case 'prevention-fast-food':
        return {
          icon: Flame,
          color: 'bg-amber-50 border-amber-100 text-amber-600',
          badgeColor: 'bg-amber-100 text-amber-700',
          tips: ["Cook meals at home", "Check nutrition facts for sodium/sugar", "Choose air-fried over deep-fried"]
        };
      case 'prevention-meat':
        return {
          icon: Shield,
          color: 'bg-orange-50 border-orange-100 text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-700',
          tips: ["Limit red meat to <18oz/week", "Minimize processed ham/bacon entirely", "Incorporate wild fish & poultry"]
        };
      case 'prevention-drinks':
        return {
          icon: GlassWater,
          color: 'bg-cyan-50 border-cyan-100 text-cyan-600',
          badgeColor: 'bg-cyan-100 text-cyan-700',
          tips: ["Carry a reusable water bottle", "Incorporate unsweetened teas", "Steer clear of soda & high-sugar juices"]
        };
      case 'prevention-alcohol':
        return {
          icon: Beer,
          color: 'bg-purple-50 border-purple-100 text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-700',
          tips: ["Opt for low-sugar mocktails", "Choose sparkling water with lime", "Understand the direct links to breast/colon cancer risk"]
        };
      default:
        return {
          icon: Apple,
          color: 'bg-teal-50 border-teal-100 text-teal-600',
          badgeColor: 'bg-teal-100 text-teal-700',
          tips: ["Prioritize hydration", "Ensure adequate quality sleep", "Reduce high-salinity items"]
        };
    }
  };

  // Check if patient is a survivor to display the survivorship lifestyle note (AICR Recommendation #10)
  const isSurvivor = recommendations.some(r => r.status === 'survivorship');

  return (
    <div className="space-y-8 pb-32">
      <header className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Healthy Living</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Evidence-based strategies to reduce cancer risk and prevent recurrence, aligned with the <strong>American Institute for Cancer Research (AICR)</strong> standards.
        </p>
      </header>

      {/* Interactive Adherence Tracker */}
      <section className="p-6 bg-gradient-to-br from-teal-900 to-emerald-950 text-white rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Award className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h3 className="font-bold text-md">AICR Adherence Score</h3>
            <p className="text-xs text-teal-200">Track and optimize your protective healthy habits daily</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-extrabold">{percentage}% <span className="text-xs font-normal text-teal-200">Aligned</span></span>
            <span className="text-xs font-semibold text-teal-300">{currentScore} of {totalPossible} Action Points</span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-bold uppercase tracking-wider">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="text-gray-300">Target</div>
            <div className="text-white mt-0.5">{activeGuidelines.length - Object.values(adherence).filter(s => s !== 'undone').length} remaining</div>
          </div>
          <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/10">
            <div className="text-teal-300">Action Plan</div>
            <div className="text-teal-200 mt-0.5">{Object.values(adherence).filter(s => s === 'improving').length} adopting</div>
          </div>
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/10">
            <div className="text-emerald-300">Aligned</div>
            <div className="text-emerald-200 mt-0.5">{Object.values(adherence).filter(s => s === 'following').length} active</div>
          </div>
        </div>
      </section>

      {/* Survivor Special Wellness Guidance */}
      {isSurvivor && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-purple-50 border border-purple-100 rounded-3xl flex items-start gap-4"
        >
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-purple-900 text-sm">AICR Guideline #10 for Survivors</h4>
            <p className="text-xs text-purple-800 leading-relaxed">
              <strong>After a cancer diagnosis</strong>, World Cancer Research Fund and AICR advise survivors to follow these lifestyle recommendations for general and recurrent risk-reduction, always consult with your oncology team regarding custom caloric or active modifications.
            </p>
          </div>
        </motion.div>
      )}

      {/* List of Lifestyle Guidelines */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Standard Recommendations
          <span className="text-xs font-normal text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">AICR Expert Panel</span>
        </h3>

        <div className="grid gap-4">
          {activeGuidelines.map((guide, idx) => {
            const design = getCardDesign(guide.id);
            const status = adherence[guide.id] || 'undone';
            
            return (
              <motion.section 
                key={guide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`p-3 rounded-2xl ${design.color} border`}>
                    <design.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-gray-900 leading-tight pr-2">{guide.recommended_action}</h4>
                      <button 
                        onClick={() => toggleAdherence(guide.id)}
                        className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border transition-all ${
                          status === 'following' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          status === 'improving' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {status === 'following' ? 'Aligned' : status === 'improving' ? 'Adopting' : 'Track'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">{guide.reason}</p>
                  </div>
                </div>

                {/* Sub tips */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50 mt-2">
                  {design.tips.map((tip, i) => (
                    <span 
                      key={i} 
                      className="text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 px-2.5 py-1.5 rounded-lg border border-gray-50"
                    >
                      {tip}
                    </span>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-teal-50 border border-teal-100 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 text-teal-700">
          <Info className="w-5 h-5" />
          <h4 className="font-bold">About the AICR Guidelines</h4>
        </div>
        <p className="text-xs text-teal-800 leading-relaxed">
          The Cancer Prevention Recommendations are based on 10 explicit strategies developed by world-leading scientific teams. Following these guidelines correlates directly with lower cancer mortality rates and reduces risks for other chronic metabolic conditions.
        </p>
        <a 
          href="https://www.aicr.org/cancer-prevention/recommendations/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
        >
          View Full AICR Recommendations
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
