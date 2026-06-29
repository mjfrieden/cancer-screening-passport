import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { db, auth, signInWithGoogle, OperationType, handleFirestoreError } from './lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, ScreeningEvent, Recommendation } from './types';
import AddScreeningModal from './components/AddScreeningModal';
import { LayoutDashboard, User as UserIcon, Share2, LogOut, Loader2, Plus, LogIn, Shield, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import AccountDataControls from './components/AccountDataControls';
import ConsentGate from './components/ConsentGate';
import { POLICY_VERSIONS } from './lib/policyVersions';
import { getRecommendations } from './lib/guidelineEngine';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ProfileForm = lazy(() => import('./components/ProfileForm'));
const SurvivorshipForm = lazy(() => import('./components/SurvivorshipForm'));
const HealthyLiving = lazy(() => import('./components/HealthyLiving'));
const FHIRSharing = lazy(() => import('./components/FHIRSharing'));
const realPhiEnabled = import.meta.env.VITE_REAL_PHI_ENABLED === 'true';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'share' | 'survivorship' | 'lifestyle'>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<ScreeningEvent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [hasCurrentConsent, setHasCurrentConsent] = useState(false);

  // Initial Fetch
  useEffect(() => {
    if (user) {
      fetchConsentAndData();
    } else {
      setConsentChecked(false);
      setHasCurrentConsent(false);
      setProfile(null);
      setEvents([]);
      setRecommendations([]);
    }
  }, [user]);

  const hasAcceptedCurrentPolicies = (data: any) => (
    data?.privacyVersion === POLICY_VERSIONS.privacy &&
    data?.termsVersion === POLICY_VERSIONS.terms &&
    data?.medicalDisclaimerVersion === POLICY_VERSIONS.medicalDisclaimer
  );

  const fetchConsentAndData = async () => {
    if (!user) return;
    setConsentChecked(false);
    try {
      const consentDoc = await getDoc(doc(db, 'user_consents', user.uid));
      const consentAccepted = consentDoc.exists() && hasAcceptedCurrentPolicies(consentDoc.data());
      setHasCurrentConsent(consentAccepted);
      if (consentAccepted) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error fetching consent:', error);
      setHasCurrentConsent(false);
    } finally {
      setConsentChecked(true);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const eventsSnap = await getDocs(query(collection(db, 'screening_events'), where('userId', '==', user.uid)));
      const eventsData = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ScreeningEvent[];
      setEvents(eventsData);

      const profDoc = await getDoc(doc(db, 'user_profiles', user.uid));
      if (profDoc.exists()) {
        const profData = profDoc.data() as UserProfile;
        setProfile(profData);
        // Fetch recommendations from engine with actual history passed in!
        await fetchRecommendations(profData, eventsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (prof: UserProfile, history: ScreeningEvent[]) => {
    setRecommendations(getRecommendations(prof, history));
  };

  const handleSaveProfile = async (data: UserProfile) => {
    if (!user) return;
    setLoading(true);
    try {
      const profileWithId = { ...data, userId: user.uid };
      await setDoc(doc(db, 'user_profiles', user.uid), profileWithId);
      setProfile(profileWithId);
      await fetchRecommendations(profileWithId, events);
      
      if (profileWithId.personalHistoryOfCancer && profileWithId.survivorshipPlan) {
        setActiveTab('survivorship');
      } else if (activeTab === 'profile') {
        setActiveTab('dashboard');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `user_profiles/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (eventData: Omit<ScreeningEvent, 'id' | 'userId'>) => {
    if (!user) return;
    setLoading(true);
    let eventId = '';
    try {
      eventId = doc(collection(db, 'screening_events')).id;
      const newEvent: ScreeningEvent = {
        ...eventData,
        id: eventId,
        userId: user.uid
      };
      await setDoc(doc(db, 'screening_events', eventId), newEvent);
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      if (profile) {
        await fetchRecommendations(profile, updatedEvents);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `screening_events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSurvivorship = async (plan: any) => {
    if (!profile) return;
    const updated = { ...profile, personalHistoryOfCancer: true, survivorshipPlan: plan };
    await handleSaveProfile(updated);
  };

  const handleRemoveSurvivorship = async () => {
    if (!profile) return;
    const { survivorshipPlan, ...rest } = profile;
    const updated = { ...rest, personalHistoryOfCancer: false } as UserProfile;
    await handleSaveProfile(updated);
  };

  const handleAccountDeleted = () => {
    setProfile(null);
    setEvents([]);
    setRecommendations([]);
    setHasCurrentConsent(false);
    setConsentChecked(false);
    setActiveTab('dashboard');
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-7 w-full max-w-lg"
      >
        <h1 className="sr-only">Cancer Prevention Passport</h1>
        <img
          src="/brand/cancer-prevention-passport-lockup.png"
          alt=""
          width="1100"
          height="650"
          className="w-full h-auto"
        />
        <p className="text-gray-600 font-medium leading-relaxed max-w-md mx-auto">
          A health education and record-organizing tool from White Cloud Medical, LLC. Review all screening decisions with your clinician.
        </p>
        {!realPhiEnabled && <SyntheticDataBanner />}

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 p-4 rounded-2xl font-bold border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all group"
        >
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <LogIn className="w-3 h-3 text-white" />
          </div>
          Continue as Patient
        </button>

        <div className="pt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl text-left">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-bold text-sm">Private by Design</div>
            <div className="text-[10px] text-gray-500">Built around signed-in patient access.</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl text-left">
            <WorkflowIcon className="w-6 h-6 text-teal-600 mb-2" />
            <div className="font-bold text-sm">Structured Export</div>
            <div className="text-[10px] text-gray-500">Share a patient-held FHIR-style summary.</div>
          </div>
        </div>
        <LegalLinks />
      </motion.div>
    </div>
  );

  if (!consentChecked) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!hasCurrentConsent) return (
    <>
      {!realPhiEnabled && <SyntheticDataBanner />}
      <ConsentGate
        user={user}
        onAccepted={() => {
          setHasCurrentConsent(true);
          setConsentChecked(true);
          void fetchData();
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-semibold text-blue-700 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/brand/cancer-prevention-passport-mark.png"
              alt=""
              width="40"
              height="40"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="font-bold text-base sm:text-lg">Cancer Prevention Passport</span>
          </div>
          <button
            type="button"
            onClick={() => auth.signOut()}
            aria-label="Sign out"
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-[11px] font-medium text-amber-950">
        Health education only. Not medical advice, diagnosis, treatment, or emergency care. Verify recommendations with your clinician.
      </div>
      {!realPhiEnabled && <SyntheticDataBanner />}

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="app-main max-w-2xl mx-auto p-4 pt-8">
        <Suspense fallback={<TabLoadingState />}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
               <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <Dashboard recommendations={recommendations} events={events} profile={profile} />
               </motion.div>
             )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileForm initialData={profile || undefined} onSave={handleSaveProfile} loading={loading} />
                <AccountDataControls
                  user={user}
                  profile={profile}
                  events={events}
                  recommendations={recommendations}
                  onDeleted={handleAccountDeleted}
                />
              </motion.div>
            )}
            {activeTab === 'survivorship' && (
              <motion.div key="survivorship" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SurvivorshipForm 
                  initialData={profile?.survivorshipPlan} 
                  onSave={handleSaveSurvivorship} 
                  onRemove={handleRemoveSurvivorship}
                  loading={loading} 
                  recommendations={recommendations}
                  events={events}
                  onAddEvent={() => setIsModalOpen(true)}
                />
              </motion.div>
            )}
            {activeTab === 'lifestyle' && (
              <motion.div key="lifestyle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HealthyLiving recommendations={recommendations} />
              </motion.div>
            )}
            {activeTab === 'share' && (
               <motion.div key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 {profile ? (
                   <FHIRSharing profile={profile} events={events} recommendations={recommendations} />
                 ) : (
                   <div className="text-center py-12">
                     <p className="text-gray-500">Complete your profile to enable sharing.</p>
                     <button onClick={() => setActiveTab('profile')} className="mt-4 text-blue-600 font-bold underline">Go to Profile</button>
                   </div>
                 )}
               </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Floating Plus for adding record */}
      <div className="safe-bottom-fab fixed right-6 z-40">
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Add screening record"
          className="p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-300 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AddScreeningModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent}
        loading={loading}
      />

      {/* Bottom Nav */}
      <nav aria-label="Primary" className="safe-bottom-nav fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 pt-4">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Plan" />
          <NavButton active={activeTab === 'lifestyle'} onClick={() => setActiveTab('lifestyle')} icon={Apple} label="Healthy" />
          <NavButton active={activeTab === 'survivorship'} onClick={() => setActiveTab('survivorship')} icon={Shield} label="Survivor" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserIcon} label="Profile" />
          <NavButton active={activeTab === 'share'} onClick={() => setActiveTab('share')} icon={Share2} label="Share" />
        </div>
      </nav>
      <div className="safe-bottom-links fixed left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-2xl mx-auto px-4 pointer-events-auto">
          <LegalLinks compact />
        </div>
      </div>
    </div>
  );
}

function SyntheticDataBanner() {
  return (
    <div
      role="status"
      className="w-full border-y border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-900"
    >
      Production beta: use synthetic test data only. Do not enter real patient or health information.
    </div>
  );
}

function TabLoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-blue-600">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

function LegalLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-400",
      compact ? "bg-white/80 backdrop-blur-sm rounded-full py-1.5 shadow-sm border border-gray-100" : "pt-2"
    )}>
      <span>White Cloud Medical, LLC</span>
      <span aria-hidden="true">|</span>
      <a className="hover:text-blue-600" href="/legal/privacy.html" target="_blank" rel="noreferrer">Privacy</a>
      <span aria-hidden="true">|</span>
      <a className="hover:text-blue-600" href="/legal/terms.html" target="_blank" rel="noreferrer">Terms</a>
      <span aria-hidden="true">|</span>
      <a className="hover:text-blue-600" href="/legal/medical-disclaimer.html" target="_blank" rel="noreferrer">Medical Disclaimer</a>
      <span aria-hidden="true">|</span>
      <a className="hover:text-blue-600" href="/support.html" target="_blank" rel="noreferrer">Support</a>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-blue-600 font-bold scale-110" : "text-gray-400 font-medium"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function WorkflowIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
