import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { db, auth, signInWithGoogle, OperationType, handleFirestoreError } from './lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, ScreeningEvent, Recommendation } from './types';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import SurvivorshipForm from './components/SurvivorshipForm';
import HealthyLiving from './components/HealthyLiving';
import FHIRSharing from './components/FHIRSharing';
import AddScreeningModal from './components/AddScreeningModal';
import { Heart, LayoutDashboard, User as UserIcon, Share2, LogOut, Loader2, Plus, LogIn, Shield, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'share' | 'survivorship' | 'lifestyle'>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<ScreeningEvent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial Fetch
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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
    try {
      const res = await fetch('/api/recommendations/preventive-screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: prof, history })
      });
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Engine fetch error:", error);
    }
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

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-teal-50 rounded-full blur-3xl opacity-60" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 text-center space-y-8 max-w-md"
      >
        <div className="p-4 bg-blue-600 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-200">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Cancer Prevention Passport</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            Your clinical history, versioned guidelines, and FHIR interoperability – all in your pocket.
          </p>
        </div>

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
            <div className="font-bold text-sm">HIPAA-Ready</div>
            <div className="text-[10px] text-gray-500">Encrypted at rest and transit.</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl text-left">
            <WorkflowIcon className="w-6 h-6 text-teal-600 mb-2" />
            <div className="font-bold text-sm">HL7 FHIR</div>
            <div className="text-[10px] text-gray-500">Built for modern EMR systems.</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Cancer Prevention Passport</span>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
             <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <Dashboard recommendations={recommendations} events={events} profile={profile} />
             </motion.div>
           )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileForm initialData={profile || undefined} onSave={handleSaveProfile} loading={loading} />
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
      </main>

      {/* Floating Plus for adding record */}
      <div className="fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Plan" />
          <NavButton active={activeTab === 'lifestyle'} onClick={() => setActiveTab('lifestyle')} icon={Apple} label="Healthy" />
          <NavButton active={activeTab === 'survivorship'} onClick={() => setActiveTab('survivorship')} icon={Shield} label="Survivor" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserIcon} label="Profile" />
          <NavButton active={activeTab === 'share'} onClick={() => setActiveTab('share')} icon={Share2} label="Share" />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
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
