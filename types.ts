
export interface SetRecord {
  weight: number;
  reps: number;
}

export interface ExerciseData {
  name: string;
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  blockId: 'B1' | 'B2' | 'B3';
  exercises: ExerciseData[];
  durationSeconds?: number;
  completedAt: string;
}

export interface WorkoutBlock {
  id: 'B1' | 'B2' | 'B3';
  name: string;
  exercises: string[];
}

export type AppView = 'CALENDAR' | 'SETUP' | 'COUNTDOWN' | 'ACTIVE' | 'SETTINGS';

export type Theme = 'dark' | 'light';
export type Language = 'en' | 'es' | 'fr' | 'ru' | 'pl';

export interface DayStatus {
  date: Date;
  isWorkout: boolean;
  isRest: boolean;
  workoutData?: WorkoutSession;
}
