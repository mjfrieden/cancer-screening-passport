import { useState } from 'react';
import { User, deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { AlertTriangle, Download, Loader2, Trash2 } from 'lucide-react';
import { db, googleProvider } from '../lib/firebase';
import { Recommendation, ScreeningEvent, UserProfile } from '../types';

interface AccountDataControlsProps {
  user: User;
  profile: UserProfile | null;
  events: ScreeningEvent[];
  recommendations: Recommendation[];
  onDeleted: () => void;
}

export default function AccountDataControls({
  user,
  profile,
  events,
  recommendations,
  onDeleted,
}: AccountDataControlsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportData = () => {
    setError(null);
    setMessage(null);

    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Cancer Prevention Passport',
      operator: 'White Cloud Medical, LLC',
      user: {
        uid: user.uid,
        email: user.email,
      },
      profile,
      screeningEvents: events,
      recommendations,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cancer-prevention-passport-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage('Export downloaded.');
  };

  const deleteAccountAndData = async () => {
    setError(null);
    setMessage(null);

    const confirmation = window.prompt('Type DELETE to permanently remove your app data and Firebase sign-in account.');
    if (confirmation !== 'DELETE') {
      setMessage('Deletion canceled.');
      return;
    }

    setBusy(true);
    try {
      await reauthenticateWithPopup(user, googleProvider);

      const ownedCollectionNames = [
        'screening_events',
        'cervical_results',
        'survivorship_plans',
      ] as const;
      const ownedSnapshots = await Promise.all(
        ownedCollectionNames.map(collectionName => getDocs(query(
          collection(db, collectionName),
          where('userId', '==', user.uid),
        ))),
      );
      const refsToDelete = [
        ...ownedSnapshots.flatMap(snapshot => snapshot.docs.map(ownedDoc => ownedDoc.ref)),
        doc(db, 'user_profiles', user.uid),
        doc(db, 'user_consents', user.uid),
      ];

      for (let index = 0; index < refsToDelete.length; index += 450) {
        const batch = writeBatch(db);
        for (const ref of refsToDelete.slice(index, index + 450)) {
          batch.delete(ref);
        }
        await batch.commit();
      }

      await deleteUser(user);

      onDeleted();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : String(deleteError);
      setError(`Account deletion did not complete. ${message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Account and Data</h2>
        <p className="mt-1 text-sm text-gray-500">
          Export your current app data or remove your Firebase account and saved passport records.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={exportData}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Download className="h-4 w-4" />
          Export My Data
        </button>

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="mb-3 flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <div className="font-bold text-red-950">Permanent deletion</div>
              <p className="mt-1 text-xs leading-relaxed text-red-800">
                This removes your saved profile, screening events, and Firebase sign-in account for this app. Export your data first if you want a copy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={deleteAccountAndData}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 p-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete App Data and Account
          </button>
        </div>
      </div>

      {message && <p className="mt-3 text-sm font-medium text-gray-600">{message}</p>}
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
}
