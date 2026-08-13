import { useState } from 'react';
import { ArrowRight, Check, ExternalLink, Info } from 'lucide-react';
import { Recommendation, ScreeningEvent } from '../types';
import { COLORECTAL_SCREENING_CHOICES, getColorectalChoiceRecommendation } from '../lib/screeningChoices';

interface InteractiveScreeningGuideProps {
  recommendations: Recommendation[];
  onChooseOption: (recommendation: Recommendation, type: ScreeningEvent['type']) => void;
}

export default function InteractiveScreeningGuide({ recommendations, onChooseOption }: InteractiveScreeningGuideProps) {
  const recommendation = getColorectalChoiceRecommendation(recommendations);
  const [selectedType, setSelectedType] = useState<ScreeningEvent['type']>('fit');

  if (!recommendation) return null;

  const selected = COLORECTAL_SCREENING_CHOICES.find(choice => choice.type === selectedType)
    ?? COLORECTAL_SCREENING_CHOICES[0];

  return (
    <section aria-labelledby="screening-choice-heading" className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">Choose a screening approach</p>
        <h3 id="screening-choice-heading" className="mt-1 text-xl font-extrabold text-gray-950">Which colon screening option could fit your life?</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          For average-risk adults, several screening approaches are recommended. The best practical choice is one you can complete on schedule and follow up if a result is abnormal.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Colorectal screening options">
        {COLORECTAL_SCREENING_CHOICES.map(choice => {
          const selectedChoice = choice.type === selected.type;
          return (
            <button
              key={choice.type}
              type="button"
              role="radio"
              aria-checked={selectedChoice}
              onClick={() => setSelectedType(choice.type)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selectedChoice
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-extrabold text-gray-950">{choice.name}</span>
                {selectedChoice && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-indigo-700" />}
              </div>
              <p className="mt-1 text-xs font-bold text-indigo-700">{choice.interval}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{choice.setting}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-slate-50 p-5" aria-live="polite">
        <h4 className="text-lg font-extrabold text-gray-950">{selected.name}</h4>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <ChoiceDetail label="What you do" value={selected.process} />
          <ChoiceDetail label="Preparation" value={selected.preparation} />
          <ChoiceDetail label="How often" value={selected.interval} />
          <ChoiceDetail label="Important tradeoff" value={selected.tradeoff} />
        </dl>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
          <strong>If the result is abnormal:</strong> {selected.abnormalFollowUp}
        </div>

        <button
          type="button"
          onClick={() => onChooseOption(recommendation, selected.type)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 sm:w-auto"
        >
          Start tracking {selected.shortName} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <p>
          This comparison applies to average-risk screening, not surveillance after polyps, cancer, inflammatory bowel disease, hereditary risk, or an abnormal test. Coverage and local availability vary. Confirm the choice with a clinician.{' '}
          <a className="inline-flex items-center gap-1 font-semibold text-indigo-700 underline underline-offset-2" href="https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening" target="_blank" rel="noreferrer">
            USPSTF guidance <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </section>
  );
}

function ChoiceDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 leading-relaxed text-gray-800">{value}</dd>
    </div>
  );
}
