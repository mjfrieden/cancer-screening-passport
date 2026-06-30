import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { db, auth, signInWithGoogle, OperationType, handleFirestoreError } from './lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, ScreeningEvent, Recommendation } from './types';
import AddScreeningModal from './components/AddScreeningModal';
import {
  LayoutDashboard,
  User as UserIcon,
  Share2,
  LogOut,
  Loader2,
  Plus,
  LogIn,
  Shield,
  Apple,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  HeartHandshake,
  LockKeyhole,
  Menu,
  Sparkles,
} from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,248,237,0.95),_rgba(247,248,252,1)_45%,_rgba(236,246,248,1)_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_80%_20%,rgba(197,242,228,0.45),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(213,232,255,0.35),transparent_40%)]" />
      <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#dbeafe]/45 blur-3xl" />
      <div className="absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-[#d9f99d]/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-10 pt-6 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src="/brand/cancer-prevention-passport-lockup.png"
              alt="Cancer Prevention Passport"
              width="1100"
              height="650"
              className="h-auto w-[240px] sm:w-[320px] lg:w-[360px]"
            />
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-slate-900">How it works</a>
            <a href="/legal/privacy.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-slate-900">Privacy</a>
            <a href="/support.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-slate-900">Help</a>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Keep your screening reminders in one place
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Track screenings, save notes, and share a simple summary with your clinician when you want to.
              It is designed to feel familiar, private, and easy to understand.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-slate-900 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900">
                  <LogIn className="h-4 w-4" />
                </div>
                Continue with Google
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                See how it works
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Easy to use
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                <LockKeyhole className="h-4 w-4 text-sky-600" />
                You stay in control
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                <HeartHandshake className="h-4 w-4 text-amber-600" />
                Built for sharing
              </div>
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3" id="how-it-works">
              <FeatureCard
                icon={CheckCircle2}
                title="Easy to use"
                description="Put your screenings and notes in one place without extra clutter."
                accent="from-emerald-100 to-emerald-50"
                iconClassName="text-emerald-700"
              />
              <FeatureCard
                icon={LockKeyhole}
                title="You stay in control"
                description="Your information stays signed in and you decide what to share."
                accent="from-sky-100 to-sky-50"
                iconClassName="text-sky-700"
              />
              <FeatureCard
                icon={HeartHandshake}
                title="Built for sharing"
                description="Create a summary you can bring to appointments or send later."
                accent="from-amber-100 to-amber-50"
                iconClassName="text-amber-700"
              />
            </div>

            <div className="mt-6 text-sm leading-6 text-slate-500">
              Cancer Prevention Passport is a health education and record-organizing tool from White Cloud Medical, LLC.
              Review screening decisions with your clinician.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.06 }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <div className="absolute inset-x-8 top-14 h-80 rounded-[3rem] bg-sky-200/35 blur-3xl" />
            <div className="absolute -right-2 top-28 h-24 w-24 rounded-full bg-emerald-200/45 blur-2xl" />
            <div className="relative">
              <div className="absolute right-0 top-10 hidden rotate-[-8deg] rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur md:block md:w-[260px]">
                <div className="flex items-center gap-2">
                  <img
                    src="/brand/cancer-prevention-passport-mark.png"
                    alt=""
                    width="28"
                    height="28"
                    className="h-7 w-7 rounded-xl"
                  />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Cancer Prevention Passport
                  </div>
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  Your summary
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Share a clear overview of your screenings and notes when you are ready.
                </p>
              </div>

              <div className="mx-auto w-full rounded-[2.5rem] border border-white/80 bg-white/85 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-5">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <button type="button" aria-label="Menu" className="text-slate-500 transition-colors hover:text-slate-900">
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="text-sm font-semibold text-slate-900">My Passport</div>
                    <button type="button" aria-label="Notifications" className="text-slate-500 transition-colors hover:text-slate-900">
                      <Bell className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="px-5 pb-5 pt-4">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Next up</div>
                      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Colorectal screening</div>
                      <div className="mt-1 text-sm text-slate-600">Recommended every 10 years</div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm ring-1 ring-emerald-100">
                        <CalendarDays className="h-4 w-4" />
                        Due May 2026
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">My screenings</div>
                        <div className="text-sm font-medium text-sky-600">See all</div>
                      </div>
                      <div className="space-y-3">
                        <MiniRow
                          icon={CheckCircle2}
                          iconClassName="text-emerald-600"
                          title="Mammogram"
                          subtitle="Completed May 2024"
                          right="›"
                        />
                        <MiniRow
                          icon={CalendarDays}
                          iconClassName="text-sky-600"
                          title="Cervical screening"
                          subtitle="Due Nov 2025"
                          right="›"
                        />
                        <MiniRow
                          icon={Sparkles}
                          iconClassName="text-violet-600"
                          title="Skin check"
                          subtitle="Recommended yearly"
                          right="›"
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2 rounded-[1.4rem] border border-slate-100 bg-slate-50 px-3 py-3">
                      <MiniNav icon={CheckCircle2} label="Home" active />
                      <MiniNav icon={CalendarDays} label="Screenings" />
                      <MiniNav icon={FileText} label="Notes" />
                      <MiniNav icon={HeartHandshake} label="Share" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white/80 px-5 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-sm md:max-w-[360px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-sm leading-6 text-slate-600">
                    Health information only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                    In an emergency, call 911.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <div className="relative mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <LegalLinks />
      </div>
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

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  iconClassName,
}: {
  icon: any;
  title: string;
  description: string;
  accent: string;
  iconClassName: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br", accent)}>
        <Icon className={cn("h-6 w-6", iconClassName)} />
      </div>
      <div className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function MiniRow({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  right,
}: {
  icon: any;
  iconClassName: string;
  title: string;
  subtitle: string;
  right: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-100 bg-white px-3 py-3 shadow-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50", iconClassName)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{title}</div>
        <div className="truncate text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="text-xl leading-none text-slate-300">{right}</div>
    </div>
  );
}

function MiniNav({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[10px] font-medium",
      active ? "bg-white text-sky-700 shadow-sm" : "text-slate-400"
    )}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
