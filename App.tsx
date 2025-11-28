import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Video,
  Camera,
  Utensils,
  Lightbulb,
  MessageSquare,
  Mic,
  Settings,
  User,
  Menu,
  X,
  Play,
  StopCircle,
  Upload,
  Send,
  Image as ImageIcon,
  Newspaper,
  ExternalLink,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  UserProfile,
  ViewState,
  EXERCISES,
  AnalysisResult,
  DietPlanDay,
  ChatMessage
} from './types';
import * as GeminiService from './services/geminiService';

// --- Sub-components ---

const Onboarding = ({ onComplete }: { onComplete: (p: UserProfile) => void }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    gender: 'Male',
    weight: 70,
    height: 175,
    disease: 'None',
    goal: 'Build Muscle',
    exerciseDays: 3,
    exercisePreferences: 'Cardio, Strength Training'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 bg-secondary flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full my-8">
        <h2 className="text-3xl font-bold text-secondary mb-2">Welcome to AI Fitness</h2>
        <p className="text-gray-500 mb-6">Let's get to know you better to personalize your plan.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 border p-2"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.age} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.weight} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.height} onChange={e => setFormData({ ...formData, height: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              placeholder="e.g. Asthma, Back Pain, None"
              value={formData.disease} onChange={e => setFormData({ ...formData, disease: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Workout Days/Week</label>
                <input type="number" min="0" max="7" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={formData.exerciseDays} onChange={e => setFormData({ ...formData, exerciseDays: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fitness Goal</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}>
                    <option>Weight Loss</option>
                    <option>Build Muscle</option>
                    <option>Improve Endurance</option>
                    <option>Flexibility</option>
                </select>
              </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Exercises</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              placeholder="e.g. Gym, Yoga, Running, Home Workouts"
              value={formData.exercisePreferences} onChange={e => setFormData({ ...formData, exercisePreferences: e.target.value })} />
          </div>
          
          <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-sky-600 transition">
            Start Journey
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ profile }: { profile: UserProfile }) => {
  const data = [
    { name: 'Mon', reps: 45 },
    { name: 'Tue', reps: 52 },
    { name: 'Wed', reps: 38 },
    { name: 'Thu', reps: 65 },
    { name: 'Fri', reps: 55 },
    { name: 'Sat', reps: 70 },
    { name: 'Sun', reps: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reps</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">1,234</h3>
            </div>
            <span className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Activity size={20} />
            </span>
          </div>
          <p className="text-sm text-green-600 mt-2">+20.1% from last week</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm font-medium text-gray-500">Active Days</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">{profile.exerciseDays}/7</h3>
            </div>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Camera size={20} />
            </span>
          </div>
           <p className="text-sm text-gray-500 mt-2">Target</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div>
              <p className="text-sm font-medium text-gray-500">Goal Progress</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">75%</h3>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
             <div>
              <p className="text-sm font-medium text-gray-500">BMI</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">
                {(profile.weight / ((profile.height/100) ** 2)).toFixed(1)}
              </h3>
            </div>
             <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <User size={20} />
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Goal: {profile.goal}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-secondary mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="reps" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-secondary mb-4">Weight Trend</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                  {name: 'W1', w: profile.weight + 2},
                  {name: 'W2', w: profile.weight + 1},
                  {name: 'W3', w: profile.weight + 0.5},
                  {name: 'W4', w: profile.weight},
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="w" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyzeVideo = ({ profile }: { profile: UserProfile }) => {
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const base64 = await GeminiService.fileToBase64(file);
      const res = await GeminiService.analyzeExerciseVideo(base64, file.type, exercise, profile);
      setResult(res);
    } catch (err) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-secondary mb-2">Analyze Exercise Video</h2>
      <p className="text-gray-500 mb-6">Upload a video of your workout to get AI feedback on your form and rep count.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Exercise</label>
        <select value={exercise} onChange={e => setExercise(e.target.value)} className="w-full p-2 border rounded-lg">
          {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition cursor-pointer"
           onClick={() => fileInputRef.current?.click()}>
        <input type="file" accept="video/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Click to upload video</p>
        <p className="text-xs text-gray-400">MP4, WebM (Max 45s recommended)</p>
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Analyzing form with Gemini Pro...</p>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Analysis Results</h3>
            <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
              Score: {result.formScore}/10
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Reps Counted</p>
              <p className="text-3xl font-bold text-secondary">{result.reps}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Target Exercise</p>
              <p className="text-xl font-semibold text-secondary">{exercise}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="font-semibold mb-2">Feedback:</p>
            <p className="text-gray-700 whitespace-pre-line">{result.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const LiveSession = ({ profile }: { profile: UserProfile }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    return () => {
      // Cleanup stream
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = () => {
    setResult(null);
    chunksRef.current = [];
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      setAnalyzing(true);
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      // Convert blob to file/base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await GeminiService.analyzeExerciseVideo(base64, 'video/webm', exercise, profile);
          setResult(res);
        } catch (e) {
          console.error(e);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col items-center">
       <h2 className="text-2xl font-bold text-secondary mb-2 self-start">Live Exercise Session</h2>
       <p className="text-gray-500 mb-6 self-start">Select an exercise, record your set, and get instant feedback.</p>

      <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden relative shadow-xl aspect-video">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        
        {analyzing && (
           <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-xl">Gemini is counting your reps...</p>
           </div>
        )}

        {result && !analyzing && !recording && (
           <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
              <div className="bg-white text-slate-900 p-6 rounded-xl max-w-lg w-full">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Set Complete!</h3>
                    <button onClick={() => setResult(null)} className="text-gray-400 hover:text-gray-600"><X /></button>
                 </div>
                 <div className="flex gap-4 mb-4">
                    <div className="bg-slate-100 p-3 rounded-lg flex-1 text-center">
                       <p className="text-xs text-gray-500 uppercase">Reps</p>
                       <p className="text-3xl font-bold text-primary">{result.reps}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg flex-1 text-center">
                       <p className="text-xs text-gray-500 uppercase">Score</p>
                       <p className="text-3xl font-bold text-primary">{result.formScore}</p>
                    </div>
                 </div>
                 <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {result.feedback}
                 </p>
                 <button onClick={() => setResult(null)} className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-semibold">Do Another Set</button>
              </div>
           </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 p-4 rounded-full backdrop-blur-sm shadow-lg">
           <select 
             className="bg-transparent border-none font-semibold text-slate-900 focus:ring-0 cursor-pointer"
             value={exercise} onChange={e => setExercise(e.target.value)} disabled={recording}>
             {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
           </select>
           
           {!recording ? (
             <button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition transform hover:scale-110">
                <div className="w-4 h-4 bg-white rounded-full"></div>
             </button>
           ) : (
              <button onClick={stopRecording} className="bg-slate-900 hover:bg-slate-700 text-white rounded-full p-3 transition">
                <StopCircle size={20} />
             </button>
           )}
        </div>
        
        {recording && (
           <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Recording
           </div>
        )}
      </div>
    </div>
  );
};

const DietPlanner = ({ profile }: { profile: UserProfile }) => {
  const [plan, setPlan] = useState<DietPlanDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(3);
  const [exerciseDays, setExerciseDays] = useState(profile.exerciseDays || 3);
  const [preferences, setPreferences] = useState(profile.exercisePreferences || '');

  const generate = async () => {
    setLoading(true);
    try {
      const res = await GeminiService.generateDietPlan(profile, days, exerciseDays, preferences);
      setPlan(res);
    } catch (e) {
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary">AI Diet Planner</h2>
            <p className="text-gray-500">Personalized nutrition based on your goal: {profile.goal}</p>
       </div>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select value={days} onChange={e => setDays(Number(e.target.value))} className="w-full border p-2 rounded-lg">
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Days/Week</label>
                <input type="number" min="0" max="7" value={exerciseDays} onChange={e => setExerciseDays(Number(e.target.value))} 
                       className="w-full border p-2 rounded-lg" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Types</label>
                <input type="text" value={preferences} onChange={e => setPreferences(e.target.value)} 
                       className="w-full border p-2 rounded-lg" placeholder="e.g. Cardio" />
             </div>
          </div>
          <button onClick={generate} disabled={loading} className="w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-sky-600 disabled:opacity-50 transition">
               {loading ? 'Generating Diet Plan...' : 'Generate New Diet Plan'}
          </button>
       </div>

       {loading && (
          <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
             <p className="text-gray-600">Gemini is creating your optimized meal plan...</p>
          </div>
       )}

       <div className="grid gap-6">
          {plan.map((day, idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in" style={{animationDelay: `${idx*100}ms`}}>
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-lg text-secondary">{day.day}</h3>
                   <span className="text-sm text-gray-500 font-medium">{day.calories} kcal</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {Object.entries(day.meals).map(([type, meal]) => (
                      <div key={type} className="bg-slate-50 p-3 rounded-lg">
                         <p className="text-xs font-bold text-primary uppercase mb-1">{type}</p>
                         <p className="text-sm text-gray-700">{meal}</p>
                      </div>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

const Chatbot = ({ profile }: { profile: UserProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const sendMessage = async () => {
    if (!input.trim() && !recording) return;
    
    const userText = input;
    const userMsg: ChatMessage = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Create history for API. Note: New SDK requires matching history structure.
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    let prompt = userText;
    // Inject context if first message
    if (messages.length === 0) {
      prompt = `Context: User is ${profile.age}yo, ${profile.weight}kg, Goal: ${profile.goal}. Answer as a fitness expert. Question: ${userText}`;
    }

    try {
      const responseText = await GeminiService.chatWithBot(history, prompt);
      setMessages(prev => [...prev, { role: 'model', text: responseText || "I couldn't answer that." }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.onloadend = async () => {
               const base64 = (reader.result as string).split(',')[1];
               setLoading(true);
               try {
                  const text = await GeminiService.transcribeAudio(base64);
                  setInput(text);
               } catch(e) { console.error(e)}
               setLoading(false);
          }
          reader.readAsDataURL(blob);
          
          // Stop tracks
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setRecording(true);
      } catch (e) {
        alert("Microphone permission denied");
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-100">
       <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-secondary">Fitness AI Coach</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
               <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-50" />
               <p>Ask me about workouts, nutrition, or your progress.</p>
            </div>
          )}
          {messages.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                   {msg.text}
                </div>
             </div>
          ))}
          {loading && <div className="text-xs text-gray-400 animate-pulse">AI is typing...</div>}
       </div>
       <div className="p-4 border-t flex gap-2">
          <button onClick={handleAudioRecord} className={`p-2 rounded-full transition ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
             <Mic size={20} />
          </button>
          <input 
            className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="p-2 bg-primary text-white rounded-full hover:bg-sky-600 transition">
             <Send size={20} />
          </button>
       </div>
    </div>
  );
};

const Recommendations = () => {
  const [query, setQuery] = useState('Best youtube videos for beginner cardio');
  const [results, setResults] = useState<{text: string, chunks: any[] | undefined} | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await GeminiService.getRecommendations(query);
      setResults(res as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search() }, []); // Initial load

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex gap-2 mb-6">
          <input className="flex-1 p-3 border rounded-lg shadow-sm" value={query} onChange={e => setQuery(e.target.value)} />
          <button onClick={search} className="bg-primary text-white px-6 rounded-lg font-medium">Search</button>
       </div>

       {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
       ) : results ? (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 prose prose-slate max-w-none">
               <h3 className="text-xl font-bold mb-4">Summary</h3>
               <p>{results.text}</p>
            </div>
            
            <h3 className="text-xl font-bold text-secondary">Sources & Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {results.chunks?.map((chunk, i) => {
                 const web = chunk.web;
                 if(!web) return null;
                 return (
                  <a key={i} href={web.uri} target="_blank" rel="noreferrer" className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-primary transition group">
                      <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition">
                        <Play size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-900 truncate">{web.title}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{web.uri}</p>
                      </div>
                      <ExternalLink size={16} className="ml-auto text-gray-400" />
                  </a>
                 )
               })}
            </div>
         </div>
       ) : null}
    </div>
  );
};

const Shorts = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GeminiService.getTrendingShorts().then(data => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Trending Fitness News & Shorts</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(n => <div key={n} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {news.map((item, i) => (
             <a 
               href={item.url} 
               target="_blank" 
               rel="noopener noreferrer" 
               key={i} 
               className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col h-full cursor-pointer group"
             >
                <div className="h-32 bg-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition">
                   <Newspaper className="text-slate-400 group-hover:text-white transition" size={40} />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                   <h3 className="font-bold text-secondary mb-2 line-clamp-2">{item.title}</h3>
                   <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{item.summary}</p>
                   <div className="flex justify-between items-center mt-auto">
                     <p className="text-xs font-bold text-primary">{item.source}</p>
                     <ExternalLink size={14} className="text-gray-400" />
                   </div>
                </div>
             </a>
           ))}
        </div>
      )}
    </div>
  )
}

const VoiceAssistant = () => {
  const [connected, setConnected] = useState(false);
  
  // Audio Refs - Sab refs use karenge taaki re-render par data na udaye
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0); // Queue manage karne ke liye

  const startSession = async () => {
    try {
      // 1. Setup Output Audio Context (Speaker) - EK BAAR bas
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // 2. Setup Input Stream (Mic)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Input context for Mic (16kHz for Gemini)
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const onAudioData = async (base64: string) => {
         // Output Context use karein jo upar banaya tha
         const ctx = outputAudioContextRef.current;
         if (!ctx) return;

         // Decode Audio
         const binaryString = atob(base64);
         const len = binaryString.length;
         const bytes = new Uint8Array(len);
         for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
         }
         
         const dataInt16 = new Int16Array(bytes.buffer);
         const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
         const channelData = audioBuffer.getChannelData(0);
         
         // Convert PCM to Audio Buffer
         for(let i=0; i<dataInt16.length; i++) {
             channelData[i] = dataInt16[i] / 32768.0;
         }
         
         // Play Audio in Queue (Smooth Streaming)
         const source = ctx.createBufferSource();
         source.buffer = audioBuffer;
         source.connect(ctx.destination);
         
         const now = ctx.currentTime;
         // Agar pichla audio khatam ho gaya hai, toh abhi chalao, nahi toh queue mein lagao
         const startTime = Math.max(now, nextStartTimeRef.current);
         
         source.start(startTime);
         // Next start time set karein
         nextStartTimeRef.current = startTime + audioBuffer.duration;
      };

      const session = await GeminiService.connectLiveSession(
        onAudioData,
        () => setConnected(true),
        () => setConnected(false)
      );
      sessionRef.current = session;

      // 3. Process Mic Input
      inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         // Convert to PCM 16kHz Int16
         const l = inputData.length;
         const int16 = new Int16Array(l);
         for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
         }
         
         const blobData = btoa(String.fromCharCode.apply(null, new Uint8Array(int16.buffer) as any));
         
         session.sendRealtimeInput({
             media: {
                 mimeType: 'audio/pcm;rate=16000',
                 data: blobData
             }
         });
      };
      
      inputSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(inputAudioContextRef.current.destination);

    } catch (e) {
      console.error(e);
      alert("Microphone access required or API error.");
    }
  };

  const stopSession = () => {
    try {
        if (sessionRef.current) {
          try { sessionRef.current.close?.(); } catch(e){}
          sessionRef.current = null;
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        
        // Contexts ko disconnect karein par close nahi (taaki dobara start ho sake)
        if (inputSourceRef.current) inputSourceRef.current.disconnect();
        if (processorRef.current) processorRef.current.disconnect();
        
        // Reset Time Queue
        nextStartTimeRef.current = 0;
        
    } catch(e) {
        console.error("Error stopping session", e);
    }
    setConnected(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 ${connected ? 'bg-primary/10' : 'bg-gray-100'}`}>
         {connected && (
             <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
         )}
         <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all shadow-lg ${connected ? 'bg-gradient-to-br from-primary to-blue-600 scale-105' : 'bg-white'}`}>
            <Mic size={64} className={connected ? 'text-white' : 'text-gray-400'} />
         </div>
      </div>
      
      <h2 className="mt-8 text-2xl font-bold text-secondary">
         {connected ? "Listening..." : "Voice Assistant"}
      </h2>
      <p className="text-gray-500 mt-2 mb-8 text-center max-w-md">
         Have a hands-free conversation about your workout, form, or health tips in real-time.
      </p>
      
      {!connected ? (
         <button onClick={startSession} className="bg-primary text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-sky-600 transition hover:scale-105">
            Start Conversation
         </button>
      ) : (
         <button onClick={stopSession} className="bg-red-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-red-600 transition">
            End Call
         </button>
      )}
    </div>
  );
};
// --- Main App ---

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setView(ViewState.DASHBOARD);
  };

  const NavItem = ({ v, icon: Icon, label }: { v: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => { setView(v); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        view === v ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  if (!profile && view !== ViewState.ONBOARDING) {
     return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary text-white p-4 fixed h-full z-10">
        <div className="flex items-center gap-2 mb-8 px-4">
          <Activity className="text-primary" size={28} />
          <h1 className="text-xl font-bold tracking-tight">FitGenius AI</h1>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem v={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem v={ViewState.ANALYZE_VIDEO} icon={Video} label="Analyze Video" />
          <NavItem v={ViewState.LIVE_SESSION} icon={Camera} label="Live Session" />
          <NavItem v={ViewState.DIET_PLANNER} icon={Utensils} label="Diet Planner" />
          <NavItem v={ViewState.RECOMMENDATIONS} icon={Lightbulb} label="Recommendations" />
          <NavItem v={ViewState.SHORTS} icon={Newspaper} label="Trending" />
          <NavItem v={ViewState.CHATBOT} icon={MessageSquare} label="AI Chatbot" />
          <NavItem v={ViewState.VOICE_ASSISTANT} icon={Mic} label="Voice Coach" />
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700">
           <div className="px-4 py-2 flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center font-bold">
                 {profile?.name.charAt(0)}
              </div>
              <div>
                 <p className="text-sm font-semibold">{profile?.name}</p>
                 <p className="text-xs text-slate-400">Pro Member</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-secondary text-white z-40 p-4 md:hidden flex flex-col">
           <div className="flex justify-end mb-4">
              <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
           </div>
           <nav className="space-y-2">
            <NavItem v={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem v={ViewState.ANALYZE_VIDEO} icon={Video} label="Analyze Video" />
            <NavItem v={ViewState.LIVE_SESSION} icon={Camera} label="Live Session" />
            <NavItem v={ViewState.DIET_PLANNER} icon={Utensils} label="Diet Planner" />
            <NavItem v={ViewState.RECOMMENDATIONS} icon={Lightbulb} label="Recommendations" />
            <NavItem v={ViewState.SHORTS} icon={Newspaper} label="Trending" />
            <NavItem v={ViewState.CHATBOT} icon={MessageSquare} label="AI Chatbot" />
            <NavItem v={ViewState.VOICE_ASSISTANT} icon={Mic} label="Voice Coach" />
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
         <header className="flex justify-between items-center mb-8 md:hidden">
            <div className="flex items-center gap-2">
               <Activity className="text-primary" size={24} />
               <span className="font-bold text-secondary">FitGenius AI</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu className="text-secondary" /></button>
         </header>

         {view === ViewState.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
         {profile && (
            <>
               {view === ViewState.DASHBOARD && <Dashboard profile={profile} />}
               {view === ViewState.ANALYZE_VIDEO && <AnalyzeVideo profile={profile} />}
               {view === ViewState.LIVE_SESSION && <LiveSession profile={profile} />}
               {view === ViewState.DIET_PLANNER && <DietPlanner profile={profile} />}
               {view === ViewState.RECOMMENDATIONS && <Recommendations />}
               {view === ViewState.SHORTS && <Shorts />}
               {view === ViewState.CHATBOT && <Chatbot profile={profile} />}
               {view === ViewState.VOICE_ASSISTANT && <VoiceAssistant />}
            </>
         )}
      </main>
    </div>
  );
}
