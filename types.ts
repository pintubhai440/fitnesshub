export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number; // kg
  height: number; // cm
  disease: string; // e.g., "None", "Asthma", "Back Pain"
  goal: string;
  exerciseDays: number;
  exercisePreferences: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isAudioTranscription?: boolean;
}

export interface AnalysisResult {
  reps: number;
  feedback: string;
  formScore: number; // 1-10
}

export interface DietPlanDay {
  day: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  calories: number;
}

export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ANALYZE_VIDEO = 'ANALYZE_VIDEO',
  LIVE_SESSION = 'LIVE_SESSION',
  DIET_PLANNER = 'DIET_PLANNER',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  CHATBOT = 'CHATBOT',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  SHORTS = 'SHORTS',
}

export const EXERCISES = [
  "Pushups",
  "Squats",
  "Lunges",
  "Bicep Curls",
  "Burpees",
  "Plank",
  "Bench Press"
];