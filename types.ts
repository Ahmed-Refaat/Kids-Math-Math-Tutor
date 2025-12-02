export enum Operation {
  ADD = 'add',
  SUB = 'sub',
  MULT = 'mult',
  DIV = 'div',
  MIXED = 'mixed'
}

export enum Costume {
  NONE = 'none',
  HONEY_DIPPER = 'honey_dipper',
  ASTRONAUT = 'astronaut',
  PIRATE = 'pirate',
  WIZARD = 'wizard',
  KING = 'king',
  UNICORN = 'unicorn',
  EMPEROR = 'emperor'
}

export interface UserProfile {
  name: string;
  avatarColor: string; // hex
  shirtDecal: number;
  totalBears: number;
  highestMilestone: number;
  levels: {
    [key in Operation]?: number;
  };
  learnedStrategies: {
    [key: string]: boolean; // Format: "mult_1", "div_2"
  };
  settings: {
    questionsPerSession: number;
    practiceQuestionCount: number;
    voiceType: 'buzzy' | 'robot' | 'squeaky' | 'wise' | 'random'; // Added 'random'
    reducedMotion: boolean;
    muted: boolean;
  };
}

export interface GameState {
  operation: Operation;
  currentLevel: number;
  score: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: MathProblem[];
  streak: number;
  sessionStartTime: number;
  history: {
    isCorrect: boolean;
    timeTaken: number;
  }[];
}

export interface MathProblem {
  a: number;
  b: number;
  operator: string; // +, -, ×, ÷
  answer: number;
  hint: string;
}

export interface Milestone {
  count: number;
  costume: Costume;
  title: string;
}