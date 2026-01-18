
import { WorkoutBlock } from './types';

export const WORKOUT_BLOCKS: WorkoutBlock[] = [
  {
    id: 'B1',
    name: 'b1Name',
    exercises: ['bicepCurls', 'frenchPress'],
  },
  {
    id: 'B2',
    name: 'b2Name',
    exercises: ['militaryPress', 'reverseCurls'],
  },
  {
    id: 'B3',
    name: 'b3Name',
    exercises: ['uprightRow', 'wristCurls'],
  },
];

export const STORAGE_KEY = 'protrack_workout_history';
export const FINISH_HOLD_TIME = 3000; // 3 seconds
