import { loadProfile } from './storageService';

const VOICE_PRESETS = {
  buzzy: { pitch: 1.0, rate: 0.9 },
  robot: { pitch: 0.5, rate: 0.8 },
  squeaky: { pitch: 1.6, rate: 1.0 },
  wise: { pitch: 0.7, rate: 0.85 }
};

export const speak = (text: string, forceVoice?: 'buzzy' | 'robot' | 'squeaky' | 'wise' | 'random') => {
  if (!('speechSynthesis' in window)) return;
  
  const profile = loadProfile();
  let voiceType = forceVoice || profile.settings.voiceType || 'buzzy';
  
  // Handle Randomization
  if (voiceType === 'random') {
    const keys = Object.keys(VOICE_PRESETS) as Array<keyof typeof VOICE_PRESETS>;
    voiceType = keys[Math.floor(Math.random() * keys.length)];
  }

  // Ensure voiceType is a valid key (fallback to buzzy)
  if (!VOICE_PRESETS[voiceType as keyof typeof VOICE_PRESETS]) {
    voiceType = 'buzzy';
  }

  const preset = VOICE_PRESETS[voiceType as keyof typeof VOICE_PRESETS];

  // Cancel current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = preset.pitch;
  utterance.rate = preset.rate;
  
  const voices = window.speechSynthesis.getVoices();
  // Attempt to find a suitable base voice for the modulation
  const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Google')) || voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.speak(utterance);
};

// Simple synthesizer for SFX to avoid loading external mp3s
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const ctx = new AudioContext();

export const playSound = (type: 'correct' | 'wrong' | 'pop' | 'win' | 'bonus') => {
  if (ctx.state === 'suspended') ctx.resume();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;

  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'pop') {
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(800, now);
     gain.gain.setValueAtTime(0.1, now);
     gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
     osc.start(now);
     osc.stop(now + 0.1);
  } else if (type === 'win') {
    [0, 0.1, 0.2, 0.3].forEach((offset, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = 400 + (i * 200);
        g.gain.setValueAtTime(0.2, now + offset);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.3);
        o.start(now + offset);
        o.stop(now + offset + 0.3);
    });
  } else if (type === 'bonus') {
    // High sparkle
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }
};