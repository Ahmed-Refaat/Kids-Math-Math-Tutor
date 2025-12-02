import { UserProfile, Operation } from '../types';

const STORAGE_KEY = 'buzzy_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatarColor: '#FCD34D',
  shirtDecal: 0,
  totalBears: 0,
  highestMilestone: 0,
  levels: {
    [Operation.ADD]: 1,
    [Operation.SUB]: 1,
    [Operation.MULT]: 1,
    [Operation.DIV]: 1,
  },
  learnedStrategies: {},
  settings: {
    questionsPerSession: 10,
    practiceQuestionCount: 3,
    voiceType: 'buzzy',
    reducedMotion: false,
    muted: false,
  },
};

export const loadProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure new fields (like learnedStrategies) exist for old users
      return { 
        ...DEFAULT_PROFILE, 
        ...parsed, 
        learnedStrategies: parsed.learnedStrategies || {},
        settings: { ...DEFAULT_PROFILE.settings, ...parsed.settings } 
      };
    }
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return DEFAULT_PROFILE;
};

export const saveProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const updateBears = (amount: number): UserProfile => {
  const profile = loadProfile();
  profile.totalBears += amount;
  saveProfile(profile);
  return profile;
};

export const updateLevel = (op: Operation, level: number): UserProfile => {
  const profile = loadProfile();
  if (op !== Operation.MIXED) {
     profile.levels[op] = level;
  }
  saveProfile(profile);
  return profile;
};

export const markStrategyLearned = (op: Operation, level: number): UserProfile => {
  const profile = loadProfile();
  const key = `${op}_${level}`;
  if (!profile.learnedStrategies[key]) {
    profile.learnedStrategies[key] = true;
    saveProfile(profile);
  }
  return profile;
}