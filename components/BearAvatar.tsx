import React from 'react';
import { Costume } from '../types';

interface Props {
  color: string;
  costume: Costume;
  className?: string;
  emotion?: 'happy' | 'neutral' | 'surprised';
  professor?: boolean;
}

const BearAvatar: React.FC<Props> = ({ color, costume, className = "w-32 h-32", emotion = 'happy', professor = false }) => {
  // Simple geometric bear construction
  return (
    <svg viewBox="0 0 100 100" className={`${className} transition-all duration-300`}>
      {/* Ears */}
      <circle cx="25" cy="25" r="10" fill={color} />
      <circle cx="75" cy="25" r="10" fill={color} />
      <circle cx="25" cy="25" r="5" fill="#FFF" opacity="0.3" />
      <circle cx="75" cy="25" r="5" fill="#FFF" opacity="0.3" />

      {/* Head */}
      <rect x="20" y="20" width="60" height="50" rx="20" fill={color} />
      
      {/* Snout */}
      <ellipse cx="50" cy="55" rx="14" ry="10" fill="#FFF" opacity="0.9" />
      <ellipse cx="50" cy="52" rx="5" ry="3" fill="#374151" /> {/* Nose */}

      {/* Eyes */}
      {emotion === 'happy' ? (
        <>
          <path d="M 35 40 Q 40 38 45 40" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 55 40 Q 60 38 65 40" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
           <circle cx="40" cy="40" r="3" fill="#374151" />
           <circle cx="60" cy="40" r="3" fill="#374151" />
        </>
      )}

      {/* Professor Glasses */}
      {professor && (
        <g stroke="#374151" strokeWidth="2" fill="none">
          <circle cx="40" cy="40" r="8" fill="rgba(255,255,255,0.4)" />
          <circle cx="60" cy="40" r="8" fill="rgba(255,255,255,0.4)" />
          <path d="M 48 40 L 52 40" /> {/* Bridge */}
        </g>
      )}

      {/* Mouth */}
      {emotion === 'surprised' ? (
        <circle cx="50" cy="60" r="3" fill="#374151" />
      ) : (
        <path d="M 45 60 Q 50 63 55 60" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Body Hint (Bottom) */}
      <path d="M 30 70 L 30 90 Q 50 100 70 90 L 70 70 Z" fill={color} opacity="0.9" />

      {/* Costume Overlays */}
      {costume === Costume.HONEY_DIPPER && (
        <path d="M 80 50 L 95 30 M 80 50 L 70 60" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
      )}
      
      {costume === Costume.PIRATE && (
        <path d="M 20 25 L 80 25 L 50 5 Z" fill="#1F2937" />
      )}
      
      {costume === Costume.ASTRONAUT && (
         <circle cx="50" cy="45" r="35" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.5" />
      )}

      {costume === Costume.WIZARD && (
        <path d="M 15 25 L 85 25 L 50 -10 Z" fill="#7C3AED" />
      )}
      
       {costume === Costume.KING && (
         <path d="M 25 25 L 25 10 L 40 20 L 50 5 L 60 20 L 75 10 L 75 25 Z" fill="#F59E0B" />
      )}
    </svg>
  );
};

export default BearAvatar;