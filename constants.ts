import { Costume, Milestone, Operation } from './types';

export const COLORS = {
  honey: '#FFB800',
  lavender: '#9E7BFF',
  mint: '#4CD964',
  cotton: '#FF6B9D',
  sky: '#5AC8FA',
  cloud: '#F2F5FF',
  text: '#2D3748',
  white: '#FFFFFF'
};

export const MILESTONES: Milestone[] = [
  { count: 10, costume: Costume.HONEY_DIPPER, title: "Honey Keeper" },
  { count: 25, costume: Costume.ASTRONAUT, title: "Space Explorer" },
  { count: 50, costume: Costume.PIRATE, title: "Honey Pirate" },
  { count: 100, costume: Costume.WIZARD, title: "Math Wizard" },
  { count: 200, costume: Costume.KING, title: "Bear King" },
  { count: 500, costume: Costume.UNICORN, title: "Rainbow Rider" },
  { count: 1000, costume: Costume.EMPEROR, title: "Galactic Emperor" },
];

export const SKINS = [
  '#FCD34D', // Yellow (Classic)
  '#FDBA74', // Orange
  '#A7F3D0', // Mint
  '#BFDBFE', // Blue
  '#FBCFE8', // Pink
  '#E9D5FF', // Purple
];

export const MAX_LEVEL = 7;

export const OPERATION_CONFIG = {
  [Operation.ADD]: { name: 'Jelly Mixer', color: 'bg-green-400', icon: '+' },
  [Operation.SUB]: { name: 'Bubble Popper', color: 'bg-pink-400', icon: '−' },
  [Operation.MULT]: { name: 'Comb Doubler', color: 'bg-amber-400', icon: '×' },
  [Operation.DIV]: { name: 'Share Fountain', color: 'bg-cyan-400', icon: '÷' },
  [Operation.MIXED]: { name: 'Rainbow Corridor', color: 'bg-indigo-400', icon: '?' },
};