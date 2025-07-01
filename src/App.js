import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
// Removed getDoc, setDoc, deleteDoc, where, getDocs as they were unused
import { getFirestore, addDoc, updateDoc, onSnapshot, collection, query, serverTimestamp } from 'firebase/firestore';
// Removed Briefcase, Clock as they were unused
import { ChevronLeft, Home, BookOpen, Smile, Headphones, Heart, Edit, Calendar, Zap, Sun, Cloud, Droplet, Wind, Moon, Star, MessageSquare, User, Video, Mic, MessageCircle, Sparkles, Send } from 'lucide-react';

// Context for Firebase and User
const AppContext = createContext(null);

// Tailwind CSS is assumed to be available
function App() {
  const [currentPage, setCurrentPage] = useState('onboarding'); // 'onboarding', 'home', 'meditation', 'mood', 'relaxation', 'calm', 'journal', 'therapy', 'affirmation', 'talk-to-ai'
  // Removed firebaseApp state as it's not directly used after initialization and caused unused var error
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Firebase Initialization and Authentication
  useEffect(() => {
    try {
      // Direct usage of __app_id and __firebase_config to avoid unused variable warning
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);
      setAuth(authInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("User authenticated:", user.uid);
        } else {
          console.log("No user, attempting anonymous sign-in...");
          try {
            if (typeof __initial_auth_token !== 'undefined') {
              await signInWithCustomToken(authInstance, __initial_auth_token);
            } else {
              await signInAnonymously(authInstance);
            }
            // User will be set by onAuthStateChanged listener
          } catch (error) {
            console.error("Firebase Auth Error:", error);
            showUserMessage(`Authentication failed: ${error.message}`);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      showUserMessage(`App initialization failed: ${error.message}`);
    }
  }, []);

  const showUserMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Render different pages based on currentPage state
  const renderPage = () => {
    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 text-gray-800 p-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          <p className="mt-4 text-lg font-semibold">Loading app...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'onboarding':
        return <OnboardingScreen onComplete={() => setCurrentPage('home')} />;
      case 'home':
        return <HomeScreen setCurrentPage={setCurrentPage} />;
      case 'meditation':
        return <MeditationLibrary />;
      case 'mood':
        return <MoodTracker />;
      case 'relaxation':
        return <GuidedRelaxation />;
      case 'calm':
        return <EmergencyCalm />;
      case 'journal':
        return <Journaling />;
      case 'therapy':
        return <VirtualTherapy />;
      case 'affirmation':
        return <AffirmationGenerator />;
      case 'talk-to-ai':
        return <TalkToAI />;
      default:
        return <OnboardingScreen onComplete={() => setCurrentPage('home')} />;
    }
  };

  return (
    <AppContext.Provider value={{ db, auth, userId, showUserMessage, setCurrentPage }}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 font-inter flex flex-col">
        {/* Header with back button */}
        {currentPage !== 'onboarding' && currentPage !== 'home' && (
          <div className="p-4 bg-white shadow-md flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              aria-label="Go back to home"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Sthiti</h1>
            <div className="w-8"></div> {/* Placeholder for alignment */}
          </div>
        )}

        {/* Main content area */}
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {renderPage()}
        </main>

        {/* Navigation Bar */}
        {currentPage !== 'onboarding' && (
          <nav className="bg-white shadow-lg p-3 flex justify-around items-center rounded-t-3xl border-t border-gray-100">
            <NavItem icon={<Home size={24} />} label="Home" onClick={() => setCurrentPage('home')} active={currentPage === 'home'} />
            <NavItem icon={<BookOpen size={24} />} label="Meditate" onClick={() => setCurrentPage('meditation')} active={currentPage === 'meditation'} />
            <NavItem icon={<Edit size={24} />} label="Journal" onClick={() => setCurrentPage('journal')} active={currentPage === 'journal'} />
            <NavItem icon={<MessageSquare size={24} />} label="Therapy" onClick={() => setCurrentPage('therapy')} active={currentPage === 'therapy'} />
          </nav>
        )}

        {/* Custom Modal for messages */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
              <p className="text-lg font-semibold text-gray-800 mb-4">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

// NavItem Component for bottom navigation
const NavItem = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
      active ? 'text-red-700 bg-red-100 shadow-inner' : 'text-gray-500 hover:text-red-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

// Onboarding Screen
const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Welcome to Sthiti",
      description: "Your path to mindful stability.",
      // Placeholder for Sthiti logo. Replace with your hosted image:
      // <img src="path/to/Sthiti.jpg" alt="Sthiti Logo" className="w-32 h-32 object-contain" />
      image: (
        <div className="flex flex-col items-center justify-center">
          <Heart size={80} className="text-red-500 mb-2" />
          <span className="text-4xl font-extrabold text-red-700 font-serif">Sthiti</span>
        </div>
      ),
    },
    {
      title: "Find Your Calm",
      description: "Explore guided meditations and relaxation exercises.",
      image: <Headphones size={80} className="text-orange-500" />,
    },
    {
      title: "Track Your Journey",
      description: "Monitor your mood and reflect with journaling.",
      image: <Calendar size={80} className="text-green-600" />,
    },
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step - 1];

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl shadow-xl max-w-md w-full animate-fade-in">
      <div className="mb-8 p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center shadow-inner">
        {currentStep.image}
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{currentStep.title}</h2>
      <p className="text-lg text-gray-600 mb-8">{currentStep.description}</p>
      <button
        onClick={handleNext}
        className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        {step < steps.length ? "Next" : "Get Started"}
      </button>
      <div className="flex mt-8 space-x-2">
        {steps.map((_, index) => (
          <span
            key={index}
            className={`block w-3 h-3 rounded-full ${
              index + 1 === step ? 'bg-red-600' : 'bg-gray-300'
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

// Home Screen
const HomeScreen = ({ setCurrentPage }) => {
  const { userId } = useContext(AppContext);
  const [userName] = useState("Mindful User"); // Removed setUserName as it was unused

  useEffect(() => {
    if (userId) {
      // In a real app, you'd fetch user's name from Firestore profile
      // For now, it's a placeholder.
      console.log("User ID on Home Screen:", userId);
    }
  }, [userId]);

  const features = [
    { name: "Meditation Library", icon: <BookOpen size={28} />, page: 'meditation', color: 'text-red-600', bg: 'bg-red-100' },
    { name: "Daily Mood Tracker", icon: <Smile size={28} />, page: 'mood', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: "Guided Relaxation", icon: <Headphones size={28} />, page: 'relaxation', color: 'text-green-600', bg: 'bg-green-100' },
    { name: "Emergency Calm", icon: <Zap size={28} />, page: 'calm', color: 'text-red-600', bg: 'bg-red-100' },
    { name: "Journaling", icon: <Edit size={28} />, page: 'journal', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: "Virtual Therapy", icon: <MessageSquare size={28} />, page: 'therapy', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: "Affirmation Generator ✨", icon: <Sparkles size={28} />, page: 'affirmation', color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: "Talk to AI 🤖", icon: <MessageCircle size={28} />, page: 'talk-to-ai', color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Hello, {userName}!</h2>
      <p className="text-lg text-gray-600 mb-8">What would you like to do today?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {features.map((feature) => (
          <button
            key={feature.name}
            onClick={() => setCurrentPage(feature.page)}
            className={`flex items-center p-5 rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${feature.bg} border border-gray-200`}
          >
            <div className={`p-3 rounded-full ${feature.bg} ${feature.color} mr-4`}>
              {feature.icon}
            </div>
            <span className="text-lg font-semibold text-gray-800">{feature.name}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-8">Your User ID: <span className="font-mono text-xs break-all">{userId}</span></p>
    </div>
  );
};

// Meditation Library
const MeditationLibrary = () => {
  const { showUserMessage } = useContext(AppContext);
  const [userMoodInput, setUserMoodInput] = useState('');
  const [recommendedMeditation, setRecommendedMeditation] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);

  const meditations = [
    { id: 1, title: "Mindful Breathing", duration: "10 min", description: "Focus on your breath to calm your mind.", level: "Beginner", type: "breathing" },
    { id: 2, title: "Body Scan Meditation", duration: "15 min", description: "Bring awareness to different parts of your body.", level: "Beginner", type: "body scan" },
    { id: 3, title: "Loving-Kindness", duration: "20 min", description: "Cultivate feelings of compassion and kindness.", level: "Intermediate", type: "compassion" },
    { id: 4, title: "Walking Meditation", duration: "10 min", description: "Find mindfulness in your movement.", level: "All Levels", type: "movement" },
    { id: 5, title: "Stress Reduction", duration: "12 min", description: "Techniques to alleviate stress and tension.", level: "Intermediate", type: "stress reduction" },
    { id: 6, title: "Anxiety Relief", duration: "18 min", description: "Gentle guidance for managing anxious thoughts.", level: "Beginner", type: "anxiety relief" },
    { id: 7, title: "Deep Sleep Aid", duration: "25 min", description: "Prepare your mind and body for restful sleep.", level: "All Levels", type: "sleep" },
  ];

  const handlePlayMeditation = (title) => {
    showUserMessage(`Playing "${title}". (Audio playback is simulated in this demo.)`);
  };

  const handleGetRecommendation = async () => {
    if (!userMoodInput.trim()) {
      showUserMessage("Please describe how you are feeling to get a recommendation.");
      return;
    }

    setIsRecommending(true);
    setRecommendedMeditation(null); // Clear previous recommendation

    try {
      const availableMeditationTypes = meditations.map(med => med.title).join(', ');
      const prompt = `The user is feeling: "${userMoodInput}". Based on this, and from the following list of meditation types: ${availableMeditationTypes}, suggest ONE most suitable meditation type. Respond ONLY with the exact name of the meditation type, nothing else.`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const recommendedTitle = result.candidates[0].content.parts[0].text.trim();
        const foundMeditation = meditations.find(med => med.title === recommendedTitle);

        if (foundMeditation) {
          setRecommendedMeditation(foundMeditation);
          showUserMessage(`Recommended meditation: "${foundMeditation.title}"`);
        } else {
          showUserMessage(`Could not find a specific meditation for your mood. Try "${recommendedTitle}" or explore the library.`);
        }
      } else {
        showUserMessage("Failed to get a recommendation. Please try again.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      console.error("Error getting meditation recommendation:", error);
      showUserMessage(`Error getting recommendation: ${error.message}`);
    } finally {
      setIsRecommending(false);
    }
  };


  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Meditation Library</h2>

      {/* Personalized Recommendation Section */}
      <div className="w-full bg-orange-50 p-5 rounded-2xl shadow-inner border border-orange-200 mb-8">
        <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
          <Sparkles size={24} className="mr-2 text-orange-600" /> Get a Personalized Recommendation
        </h3>
        <textarea
          className="w-full p-3 border border-orange-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-y min-h-[80px]"
          placeholder="How are you feeling right now? (e.g., stressed, tired, happy, anxious)"
          value={userMoodInput}
          onChange={(e) => setUserMoodInput(e.target.value)}
          rows="3"
        ></textarea>
        <button
          onClick={handleGetRecommendation}
          disabled={isRecommending}
          className={`w-full py-2 rounded-full text-lg font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-300
            ${isRecommending ? 'bg-orange-400 text-white cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 transform hover:scale-105'}`}
        >
          {isRecommending ? 'Recommending...' : 'Recommend Meditation ✨'}
        </button>

        {recommendedMeditation && (
          <div className="mt-4 bg-orange-100 p-4 rounded-xl border border-orange-300">
            <p className="text-orange-800 font-semibold mb-2">Your Recommended Meditation:</p>
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{recommendedMeditation.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{recommendedMeditation.description}</p>
                <div className="flex items-center text-gray-500 text-xs mt-2">
                  <span className="mr-3 flex items-center"><Headphones size={14} className="mr-1" /> {recommendedMeditation.duration}</span>
                  <span className="flex items-center"><Star size={14} className="mr-1" /> {recommendedMeditation.level}</span>
                </div>
              </div>
              <button
                onClick={() => handlePlayMeditation(recommendedMeditation.title)}
                className="mt-4 md:mt-0 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Play
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Explore All Meditations</h3>
        {meditations.map((med) => (
          <div
            key={med.id}
            className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-all duration-200"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{med.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{med.description}</p>
              <div className="flex items-center text-gray-500 text-xs mt-2">
                <span className="mr-3 flex items-center"><Headphones size={14} className="mr-1" /> {med.duration}</span>
                <span className="flex items-center"><Star size={14} className="mr-1" /> {med.level}</span>
              </div>
            </div>
            <button
              onClick={() => handlePlayMeditation(med.title)}
              className="mt-4 md:mt-0 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mood Tracker
const MoodTracker = () => {
  const { db, userId, showUserMessage } = useContext(AppContext);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const moods = [
    { name: "Happy", icon: <Sun size={40} className="text-yellow-500" />, value: "happy" },
    { name: "Calm", icon: <Cloud size={40} className="text-blue-400" />, value: "calm" },
    { name: "Neutral", icon: <Droplet size={40} className="text-gray-500" />, value: "neutral" },
    { name: "Stressed", icon: <Wind size={40} className="text-red-500" />, value: "stressed" },
    { name: "Sad", icon: <Moon size={40} className="text-indigo-500" />, value: "sad" },
  ];

  useEffect(() => {
    if (db && userId) {
      const moodsCollectionRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/moods`);
      const q = query(moodsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp in descending order
        history.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setMoodHistory(history);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching mood history:", error);
        showUserMessage("Failed to load mood history.");
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [db, userId, showUserMessage]);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      showUserMessage("Please select a mood before saving.");
      return;
    }
    if (!db || !userId) {
      showUserMessage("App not ready. Please try again.");
      return;
    }

    try {
      const moodsCollectionRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/moods`);
      await addDoc(moodsCollectionRef, {
        mood: selectedMood,
        timestamp: serverTimestamp(),
      });
      setSelectedMood(null);
      showUserMessage("Mood saved successfully!");
    } catch (error) {
      console.error("Error saving mood:", error);
      showUserMessage("Failed to save mood. Please try again.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString(); // Adjust format as needed
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">How are you feeling today?</h2>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`flex flex-col items-center p-4 rounded-xl border-2 ${
              selectedMood === mood.value ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            } transition-all duration-200`}
          >
            {mood.icon}
            <span className="mt-2 text-sm font-medium text-gray-700">{mood.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSaveMood}
        disabled={!selectedMood}
        className={`w-full max-w-xs py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300
          ${selectedMood ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
      >
        Save Mood
      </button>

      <div className="mt-10 w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Mood History</h3>
        {loading ? (
          <p className="text-gray-600">Loading mood history...</p>
        ) : moodHistory.length === 0 ? (
          <p className="text-gray-600">No mood entries yet. Start tracking your mood!</p>
        ) : (
          <div className="space-y-3">
            {moodHistory.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800 capitalize">{entry.mood}</span>
                <span className="text-sm text-gray-500">{formatTimestamp(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Guided Relaxation
const GuidedRelaxation = () => {
  const { showUserMessage } = useContext(AppContext);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      showUserMessage("Starting guided relaxation. (Audio playback simulated)");
    } else {
      showUserMessage("Pausing guided relaxation.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-md w-full text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Guided Relaxation</h2>
      <div className="relative w-48 h-48 bg-gradient-to-br from-orange-200 to-red-200 rounded-full flex items-center justify-center shadow-inner mb-8">
        <Headphones size={80} className="text-red-600 animate-pulse-slow" />
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping-slow opacity-75"></div>
        )}
      </div>
      <p className="text-lg text-gray-600 mb-8">
        Close your eyes, take a deep breath, and let go of tension.
      </p>
      <button
        onClick={handleTogglePlay}
        className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        {isPlaying ? "Pause Relaxation" : "Start Relaxation"}
      </button>
    </div>
  );
};

// Emergency Calm Button
const EmergencyCalm = () => {
  const { showUserMessage } = useContext(AppContext);

  const handleCalmAction = () => {
    showUserMessage("Deep breaths... You are safe. Focus on the present moment. (Simulated calm exercise)");
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-md w-full text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Feeling Overwhelmed?</h2>
      <p className="text-lg text-gray-600 mb-8">
        Press the button below for an immediate calming exercise.
      </p>
      <button
        onClick={handleCalmAction}
        className="bg-red-600 text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:bg-red-700 transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-red-300 animate-pulse-fast"
      >
        <Zap size={40} className="inline-block mr-3" />
        EMERGENCY CALM
      </button>
      <p className="text-sm text-gray-500 mt-8">
        This is a quick tool to help you regain composure.
      </p>
    </div>
  );
};

// Journaling with AI Insights
const Journaling = () => {
  const { db, userId, showUserMessage } = useContext(AppContext);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalHistory, setJournalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    if (db && userId) {
      const journalCollectionRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/journalEntries`);
      const q = query(journalCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp in descending order
        history.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setJournalHistory(history);
        setLoadingHistory(false);
      }, (error) => {
        console.error("Error fetching journal history:", error);
        showUserMessage("Failed to load journal history.");
        setLoadingHistory(false);
      });

      return () => unsubscribe();
    }
  }, [db, userId, showUserMessage]);

  const handleSaveJournal = async () => {
    if (!journalEntry.trim()) {
      showUserMessage("Journal entry cannot be empty.");
      return;
    }
    if (!db || !userId) {
      showUserMessage("App not ready. Please try again.");
      return;
    }

    try {
      const journalCollectionRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/journalEntries`);
      await addDoc(journalCollectionRef, {
        content: journalEntry,
        timestamp: serverTimestamp(),
        aiInsight: null, // Initialize AI insight as null
      });
      setJournalEntry('');
      showUserMessage("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      showUserMessage("Failed to save journal entry. Please try again.");
    }
  };

  const handleGenerateInsight = async (entryId, entryContent) => {
    setGeneratingInsight(true);
    if (!db || !userId) {
      showUserMessage("App not ready. Please try again.");
      setGeneratingInsight(false);
      return;
    }

    try {
      const prompt = `Analyze the following journal entry and provide a brief, compassionate, and insightful reflection or suggestion. Focus on emotional patterns, potential stressors, or positive affirmations. Keep it concise (2-3 sentences).\n\nJournal Entry: "${entryContent}"`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const insight = result.candidates[0].content.parts[0].text;

        // Update the Firestore document with the AI insight
        const entryDocRef = doc(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${userId}/journalEntries`, entryId);
        await updateDoc(entryDocRef, { aiInsight: insight });

        showUserMessage("AI insight generated and added to your entry!");
      } else {
        showUserMessage("Failed to generate AI insight. Please try again.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      console.error("Error generating AI insight:", error);
      showUserMessage(`Error generating AI insight: ${error.message}`);
    } finally {
      setGeneratingInsight(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString(); // Adjust format as needed
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Journal</h2>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-y min-h-[120px]"
        placeholder="Write your thoughts and feelings here..."
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
      ></textarea>
      <button
        onClick={handleSaveJournal}
        className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 w-full max-w-xs"
      >
        Save Entry
      </button>

      <div className="mt-10 w-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Journal History</h3>
        {loadingHistory ? (
          <p className="text-gray-600">Loading journal history...</p>
        ) : journalHistory.length === 0 ? (
          <p className="text-gray-600">No journal entries yet. Start writing!</p>
        ) : (
          <div className="space-y-6">
            {journalHistory.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-gray-800 text-base mb-3 leading-relaxed">{entry.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  <button
                    onClick={() => handleGenerateInsight(entry.id, entry.content)}
                    disabled={generatingInsight}
                    className={`text-red-600 hover:text-red-800 font-medium ${generatingInsight ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {generatingInsight ? 'Generating...' : 'Get AI Insight ✨'}
                  </button>
                </div>
                {entry.aiInsight && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md mt-3">
                    <p className="text-sm text-red-800 font-medium">AI Insight:</p>
                    <p className="text-sm text-red-700">{entry.aiInsight}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Virtual Therapy Booking
const VirtualTherapy = () => {
  const { showUserMessage } = useContext(AppContext);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const therapists = [
    { id: 1, name: "Dr. Anya Sharma", specialty: "Stress & Anxiety", availability: "Mon, Wed, Fri" },
    { id: 2, name: "Mr. Ben Carter", specialty: "Work-Life Balance", availability: "Tue, Thu" },
    { id: 3, name: "Ms. Chloe Davis", specialty: "Mindfulness & Trauma", availability: "Mon, Tue, Wed" },
  ];

  const sessionTypes = [
    { name: "Video Call", icon: <Video size={20} />, value: "video" },
    { name: "Audio Call", icon: <Mic size={20} />, value: "audio" },
    { name: "Chat", icon: <MessageCircle size={20} />, value: "chat" },
  ];

  const handleBookSession = () => {
    if (!selectedTherapist || !selectedSessionType || !selectedDate || !selectedTime) {
      showUserMessage("Please select a therapist, session type, date, and time.");
      return;
    }
    showUserMessage(
      `Session booked with ${selectedTherapist.name} for a ${selectedSessionType.name} on ${selectedDate} at ${selectedTime}. (This is a simulated booking.)`
    );
    // Reset form
    setSelectedTherapist(null);
    setSelectedSessionType(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Book a Virtual Therapy Session</h2>

      <div className="w-full mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Choose your Therapist:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {therapists.map((therapist) => (
            <button
              key={therapist.id}
              onClick={() => setSelectedTherapist(therapist)}
              className={`p-4 rounded-xl border-2 flex flex-col items-start ${
                selectedTherapist?.id === therapist.id ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              } transition-all duration-200`}
            >
              <div className="flex items-center mb-2">
                <User size={24} className="text-red-600 mr-2" />
                <span className="text-lg font-medium text-gray-800">{therapist.name}</span>
              </div>
              <p className="text-sm text-gray-600">Specialty: {therapist.specialty}</p>
              <p className="text-sm text-gray-500">Availability: {therapist.availability}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedTherapist && (
        <div className="w-full mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Choose Session Type:</h3>
          <div className="flex flex-wrap gap-4">
            {sessionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedSessionType(type)}
                className={`p-4 rounded-xl border-2 flex items-center ${
                  selectedSessionType?.value === type.value ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } transition-all duration-200`}
              >
                {type.icon}
                <span className="ml-2 text-base font-medium text-gray-700">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTherapist && selectedSessionType && (
        <div className="w-full mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Select Date & Time:</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleBookSession}
        disabled={!selectedTherapist || !selectedSessionType || !selectedDate || !selectedTime}
        className={`w-full max-w-xs py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300
          ${(selectedTherapist && selectedSessionType && selectedDate && selectedTime) ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
      >
        Book Session
      </button>
    </div>
  );
};

// New Component: Affirmation Generator
const AffirmationGenerator = () => {
  const { showUserMessage } = useContext(AppContext);
  const [affirmationTopic, setAffirmationTopic] = useState('');
  const [generatedAffirmation, setGeneratedAffirmation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAffirmation = async () => {
    if (!affirmationTopic.trim()) {
      showUserMessage("Please enter a topic or challenge to generate an affirmation.");
      return;
    }

    setIsGenerating(true);
    setGeneratedAffirmation(''); // Clear previous affirmation

    try {
      const prompt = `Generate a positive and empowering affirmation (1-2 sentences) related to the following topic or challenge: "${affirmationTopic}". Make it encouraging and concise.`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const affirmation = result.candidates[0].content.parts[0].text.trim();
        setGeneratedAffirmation(affirmation);
      } else {
        showUserMessage("Failed to generate affirmation. Please try again.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      console.error("Error generating affirmation:", error);
      showUserMessage(`Error generating affirmation: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-2xl w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <Sparkles size={28} className="mr-2 text-pink-600" /> Affirmation Generator
      </h2>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px]"
        placeholder="Enter a topic or challenge you'd like an affirmation for (e.g., 'self-doubt', 'new beginnings', 'stress at work')"
        value={affirmationTopic}
        onChange={(e) => setAffirmationTopic(e.target.value)}
        rows="4"
      ></textarea>

      <button
        onClick={handleGenerateAffirmation}
        disabled={isGenerating}
        className={`w-full max-w-xs py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300
          ${isGenerating ? 'bg-pink-400 text-white cursor-not-allowed' : 'bg-pink-600 text-white hover:bg-pink-700 transform hover:scale-105'}`}
      >
        {isGenerating ? 'Generating...' : 'Generate Affirmation ✨'}
      </button>

      {generatedAffirmation && (
        <div className="mt-8 w-full bg-pink-50 p-5 rounded-2xl shadow-inner border border-pink-200">
          <h3 className="text-xl font-semibold text-pink-800 mb-3">Your Affirmation:</h3>
          <p className="text-lg text-pink-700 leading-relaxed font-medium italic">"{generatedAffirmation}"</p>
        </div>
      )}
    </div>
  );
};

// New Component: TalkToAI
const TalkToAI = () => {
  const { showUserMessage } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      showUserMessage("Please type a message to the AI.");
      return;
    }

    const userMessage = { sender: 'user', text: inputMessage.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      chatHistory.push({ role: "user", parts: [{ text: userMessage.text }] });

      // Add a system instruction to guide the AI's persona
      const systemInstruction = {
        role: "system",
        parts: [{ text: "You are a compassionate, non-judgmental, and supportive AI designed to help users vent and process their emotions. Respond with empathy, understanding, and encouragement. Avoid giving direct advice unless specifically asked, and focus on active listening and validating feelings. Keep responses concise and comforting." }]
      };

      const payload = {
        contents: chatHistory,
        systemInstruction: systemInstruction, // Include the system instruction
      };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponse = result.candidates[0].content.parts[0].text.trim();
        setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: aiResponse }]);
      } else {
        showUserMessage("AI did not respond. Please try again.");
        console.error("Gemini API response structure unexpected:", result);
        setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: "I'm having trouble responding right now. Please try again in a moment." }]);
      }
    } catch (error) {
      console.error("Error talking to AI:", error);
      showUserMessage(`Error communicating with AI: ${error.message}`);
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for new line
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-xl max-w-xl w-full h-[80vh] md:h-[70vh] animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <MessageCircle size={28} className="mr-2 text-teal-600" /> Talk to AI
      </h2>

      <div className="flex-grow w-full overflow-y-auto p-4 border border-gray-200 rounded-xl bg-gray-50 mb-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 italic mt-10">
            <p>Hi there! I'm here to listen. Feel free to share whatever is on your mind.</p>
            <p className="mt-2">I won't judge, and everything you say is confidential.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-red-200 text-red-900 rounded-br-none'
                    : 'bg-orange-200 text-orange-900 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-orange-200 text-orange-900 rounded-bl-none">
              <div className="flex items-center">
                <div className="animate-pulse-dots mr-2">
                  <span>.</span><span>.</span><span>.</span>
                </div>
                AI is typing...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>

      <div className="w-full flex items-center">
        <textarea
          className="flex-grow p-3 border border-gray-300 rounded-xl mr-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
          style={{ maxHeight: '100px' }} // Prevent textarea from growing too large
        ></textarea>
        <button
          onClick={handleSendMessage}
          disabled={isSending || !inputMessage.trim()}
          className={`p-3 rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300
            ${isSending || !inputMessage.trim() ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 transform hover:scale-105'}`}
          aria-label="Send message"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
