import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BearAvatar from '../components/BearAvatar';
import { Costume } from '../types';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const parentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showParentHint, setShowParentHint] = useState(false);

  const startParentUnlock = () => {
    setShowParentHint(true);
    parentTimer.current = setTimeout(() => {
      alert("Parents Area: Here you would see analytics (Placeholder)");
      setShowParentHint(false);
    }, 3000);
  };

  const cancelParentUnlock = () => {
    if (parentTimer.current) clearTimeout(parentTimer.current);
    setShowParentHint(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky to-cloud relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-10 right-10 opacity-20 animate-bounce-slow">
         <div className="text-9xl">☁️</div>
      </div>
      <div className="absolute bottom-10 left-10 opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>
         <div className="text-9xl">☁️</div>
      </div>

      {/* Hero Content */}
      <div className="z-10 flex flex-col items-center animate-pop">
        <BearAvatar color="#FCD34D" costume={Costume.HONEY_DIPPER} className="w-48 h-48 mb-8" />
        
        <h1 className="text-5xl font-black text-honey mb-2 tracking-tight text-center">Buzzy's</h1>
        <h2 className="text-4xl font-bold text-lavender mb-12 tracking-tight text-center">Honey Factory</h2>

        <button 
          onClick={() => navigate('/setup')}
          className="w-64 py-6 bg-mint text-white text-3xl font-bold rounded-[2rem] shadow-[0_8px_0_#2F855A] active:shadow-none active:translate-y-[8px] transition-all hover:bg-[#45cc5b] mb-6"
        >
          PLAY
        </button>

        <button
          onMouseDown={startParentUnlock}
          onMouseUp={cancelParentUnlock}
          onTouchStart={startParentUnlock}
          onTouchEnd={cancelParentUnlock}
          className="px-8 py-3 bg-white text-gray-400 font-bold rounded-full text-sm border-2 border-gray-100 select-none"
        >
          {showParentHint ? "Hold for 3s..." : "Parents"}
        </button>
      </div>
    </div>
  );
};

export default Landing;