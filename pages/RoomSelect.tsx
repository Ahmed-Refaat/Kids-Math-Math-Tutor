import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPERATION_CONFIG } from '../constants';
import { Operation } from '../types';
import { loadProfile, updateBears } from '../services/storageService';
import { playSound } from '../services/audioService';

const RoomSelect: React.FC = () => {
  const navigate = useNavigate();
  // Keep local state for bears to allow instant UI update
  const [profile, setProfile] = useState(loadProfile());

  const handleSelect = (op: Operation) => {
    // Navigate with state
    navigate('/play', { state: { operation: op } });
  };

  const handleLearn = (op: Operation) => {
    const level = profile.levels[op] || 1;
    const isLearned = profile.learnedStrategies[`${op}_${level}`];
    
    if (isLearned) {
        // Award bonus bear for reviewing
        const updated = updateBears(1);
        setProfile(updated);
        playSound('correct');
    }
    
    navigate('/learn', { state: { operation: op, level } });
  };

  return (
    <div className="min-h-screen bg-cloud p-6 overflow-y-auto pb-20">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/setup')} className="bg-white p-2 rounded-xl shadow-sm">
          👤 <span className="font-bold text-gray-600">{profile.name}</span>
        </button>
        <div className="bg-honey/10 px-4 py-2 rounded-xl text-honey font-bold animate-pop" key={profile.totalBears}>
           🐻 {profile.totalBears}
        </div>
      </header>

      <h1 className="text-3xl font-black text-gray-700 text-center mb-6">Choose a Room</h1>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {(Object.keys(OPERATION_CONFIG) as Operation[]).map((op) => {
          const config = OPERATION_CONFIG[op];
          const level = profile.levels[op] || 1;
          const isMultOrDiv = op === Operation.MULT || op === Operation.DIV;
          const isLearned = profile.learnedStrategies[`${op}_${level}`];
          
          return (
            <div key={op} className="relative group">
              <button
                onClick={() => handleSelect(op)}
                className={`
                  w-full relative h-24 rounded-[1.5rem] flex items-center px-6 shadow-[0_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[6px] transition-all
                  ${config.color} text-white overflow-hidden z-10
                `}
              >
                {/* Icon Background */}
                <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 font-black group-hover:scale-110 transition-transform">
                  {config.icon}
                </div>

                <div className="text-4xl font-black mr-4 bg-white/20 w-16 h-16 flex items-center justify-center rounded-2xl">
                  {config.icon}
                </div>
                
                <div className="flex flex-col items-start z-10">
                  <span className="text-xl font-bold">{config.name}</span>
                  {op !== Operation.MIXED && (
                    <span className="text-sm opacity-90 font-medium bg-black/10 px-2 py-0.5 rounded-lg mt-1">Level {level}</span>
                  )}
                </div>
              </button>
              
              {/* Learning Annex Button Attachment */}
              {isMultOrDiv && (
                  <button 
                    onClick={() => handleLearn(op)}
                    className={`
                      absolute -bottom-4 right-4 z-20 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1
                      ${isLearned ? 'bg-white text-gray-500 border border-gray-200' : 'bg-honey text-white animate-pulse'}
                    `}
                  >
                    {isLearned ? (
                        <>
                            <span>🎓 Review Trick</span>
                            <span className="bg-yellow-100 text-honey px-1 rounded ml-1 text-[10px]">+1 🐻</span>
                        </>
                    ) : '✨ Learn the trick first!'}
                  </button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        Select a machine to start working!
      </div>
    </div>
  );
};

export default RoomSelect;