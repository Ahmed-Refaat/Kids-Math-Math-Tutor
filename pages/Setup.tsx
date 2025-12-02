import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BearAvatar from '../components/BearAvatar';
import { SKINS, MILESTONES } from '../constants';
import { loadProfile, saveProfile } from '../services/storageService';
import { Costume, UserProfile } from '../types';
import { speak } from '../services/audioService';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [name, setName] = useState(profile.name);
  const [color, setColor] = useState(profile.avatarColor);
  const [count, setCount] = useState(profile.settings.questionsPerSession);
  const [practiceCount, setPracticeCount] = useState(profile.settings.practiceQuestionCount || 3);
  const [voice, setVoice] = useState(profile.settings.voiceType || 'buzzy');

  const getCostume = () => {
    let costume = Costume.NONE;
    for (let m of MILESTONES) {
        if (profile.totalBears >= m.count) costume = m.costume;
    }
    return costume;
  };

  const handleSave = () => {
    if (!name.trim()) return;
    saveProfile({
      ...profile,
      name,
      avatarColor: color,
      settings: { 
        ...profile.settings, 
        questionsPerSession: count,
        practiceQuestionCount: practiceCount,
        voiceType: voice
      }
    });
    navigate('/rooms');
  };

  const testVoice = (v: 'buzzy' | 'robot' | 'squeaky' | 'wise' | 'random') => {
    setVoice(v);
    speak("Hello! I am Buzzy.", v);
  };

  return (
    <div className="min-h-screen bg-cloud flex flex-col p-6 max-w-lg mx-auto overflow-y-auto no-scrollbar">
      <h1 className="text-3xl font-bold text-center text-gray-700 mt-4 mb-8">Who is playing?</h1>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-8">
        <div className="relative">
             <BearAvatar color={color} costume={getCostume()} className="w-40 h-40" />
             <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow text-xs font-bold text-honey">
               {profile.totalBears} Bears
             </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-6 bg-white p-6 rounded-[2rem] shadow-sm mb-8">
        
        {/* Name */}
        <div>
          <label className="block text-gray-500 font-bold mb-2 ml-2">My Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-100 rounded-2xl p-4 text-xl font-bold text-center outline-none focus:ring-4 ring-honey/30"
            placeholder="Type name..."
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-gray-500 font-bold mb-2 ml-2">Bear Color</label>
          <div className="flex justify-between gap-2">
            {SKINS.map((s) => (
              <button
                key={s}
                onClick={() => setColor(s)}
                className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${color === s ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: s }}
              />
            ))}
          </div>
        </div>

        {/* Voice Picker */}
        <div>
           <label className="block text-gray-500 font-bold mb-2 ml-2">Buzzy's Voice</label>
           <div className="grid grid-cols-2 gap-2">
              {(['buzzy', 'robot', 'squeaky', 'wise'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => testVoice(v)}
                  className={`py-3 rounded-xl font-bold capitalize transition-all border-2 ${voice === v ? 'bg-honey text-white border-honey shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                >
                  {v === 'buzzy' ? '🐻 Buzzy' : v === 'robot' ? '🤖 Robot' : v === 'squeaky' ? '🐹 Squeak' : '🦉 Wise'}
                </button>
              ))}
              <button
                  onClick={() => testVoice('random')}
                  className={`col-span-2 py-3 rounded-xl font-bold capitalize transition-all border-2 ${voice === 'random' ? 'bg-lavender text-white border-lavender shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                >
                  🎲 Surprise Me!
                </button>
           </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-gray-500 font-bold mb-2 ml-2">Game Questions: <span className="text-honey text-xl">{count}</span></label>
          <input 
            type="range" 
            min="5" max="50" step="5"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-honey h-4 rounded-full bg-gray-200 appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
             <span>5</span><span>25</span><span>50</span>
          </div>
        </div>

        {/* Practice Questions Toggle */}
        <div>
          <label className="block text-gray-500 font-bold mb-2 ml-2">Practice Questions</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setPracticeCount(3)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${practiceCount === 3 ? 'bg-mint text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              3 (Easy)
            </button>
            <button 
              onClick={() => setPracticeCount(5)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${practiceCount === 5 ? 'bg-mint text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              5 (Hard)
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!name.trim()}
          className={`w-full py-4 text-xl font-bold rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all mt-4
            ${name.trim() ? 'bg-honey text-white' : 'bg-gray-200 text-gray-400'}
          `}
        >
          Ready!
        </button>
      </div>
    </div>
  );
};

export default Setup;