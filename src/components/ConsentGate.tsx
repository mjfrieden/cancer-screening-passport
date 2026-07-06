import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { POLICY_VERSIONS } from '../lib/policyVersions';

interface ConsentGateProps {
  user: User;
  onAccepted: () => void;
}

export default function ConsentGate({ user, onAccepted }: ConsentGateProps) {
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = acceptedPolicies && acceptedDisclaimer && !busy;

  const accept = async () => {
    if (!canContinue) return;

    setBusy(true);
    setError(null);
    try {
      await setDoc(doc(db, 'user_consents', user.uid), {
        userId: user.uid,
        acceptedAt: new Date().toISOString(),
        privacyVersion: POLICY_VERSIONS.privacy,
        termsVersion: POLICY_VERSIONS.terms,
        medicalDisclaimerVersion: POLICY_VERSIONS.medicalDisclaimer,
      });
      onAccepted();
    } catch (acceptError) {
      const message = acceptError instanceof Error ? acceptError.message : String(acceptError);
      setError(`Consent could not be saved. ${message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-smoke="consent-gate"
      className="min-h-screen bg-white px-6 py-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
          <FileText className="h-7 w-7" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Before You Continue</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Cancer Prevention Passport is a health education and record-organizing service operated by White Cloud Medical, LLC. It does not create a physician-patient relationship and is not individualized medical advice, diagnosis, treatment, or emergency care.
        </p>

        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-gray-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(event) => setAcceptedPolicies(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm leading-relaxed text-gray-700">
              I have reviewed and agree to the{' '}
              <a className="font-bold text-blue-700 underline" href="/legal/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
              {' '}and{' '}
              <a className="font-bold text-blue-700 underline" href="/legal/terms.html" target="_blank" rel="noreferrer">Terms of Use</a>.
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-2xl border border-gray-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
            <input
              type="checkbox"
              checked={acceptedDisclaimer}
              onChange={(event) => setAcceptedDisclaimer(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm leading-relaxed text-gray-700">
              I understand the{' '}
              <a className="font-bold text-blue-700 underline" href="/legal/medical-disclaimer.html" target="_blank" rel="noreferrer">Medical Disclaimer</a>
              , understand that no physician-patient relationship is created, and will review screening decisions with my own licensed clinician.
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={accept}
          data-smoke="accept-consent"
          disabled={!canContinue}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 p-4 text-sm font-extrabold text-white shadow-xl shadow-blue-100 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Accept and Continue
        </button>

        {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
      </div>
    </div>
  );
}
