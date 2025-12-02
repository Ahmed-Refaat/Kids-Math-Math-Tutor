import React, { useState, useEffect, useRef } from 'react';
import { Operation } from '../../types';
import { playSound, speak } from '../../services/audioService';

interface StrategyProps {
  operation: Operation;
  level: number;
  onComplete: () => void;
}

// Helper: Haptic & Sound
const feedback = (type: 'pop' | 'correct' | 'wrong' = 'pop') => {
  playSound(type);
  if (navigator.vibrate) navigator.vibrate(20);
};

// --- WIDGET 1: Number Line Hops (Mult Lv1) ---
const NumberLineWidget: React.FC<{ target: number, step: number, onDone: () => void }> = ({ target, step, onDone }) => {
  const [current, setCurrent] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [visited, setVisited] = useState<number[]>([0]);

  const handleHop = () => {
    if (current < target && !isJumping) {
      setIsJumping(true);
      feedback('pop');
      
      // Delay the actual move to sync with the jump arc
      setTimeout(() => {
        const next = current + step;
        setCurrent(next);
        setVisited(prev => [...prev, next]);
        setIsJumping(false);
        speak(next.toString()); // Speak number
        
        // Bloom effect sound
        setTimeout(() => playSound('pop'), 200);

        if (next >= target) {
          setTimeout(() => {
              speak(`We reached ${target}!`);
              onDone();
          }, 1500);
        }
      }, 300); // Wait for jump peak
    }
  };

  const progress = (current / target) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="relative w-full h-40 mt-4 flex items-center px-6 bg-gradient-to-b from-sky/20 to-green-50 rounded-2xl border-2 border-sky/20 overflow-visible">
        {/* Background Decors */}
        <div className="absolute bottom-2 left-10 text-xl opacity-50">🌱</div>
        <div className="absolute bottom-2 right-20 text-xl opacity-50">🌿</div>
        <div className="absolute bottom-2 left-1/2 text-xl opacity-50">🍄</div>

        {/* Line */}
        <div className="absolute top-2/3 left-6 right-6 h-4 bg-green-500 rounded-full shadow-inner border border-green-600" />
        
        {/* Ticks & Numbers */}
        {Array.from({ length: (target / step) + 1 }).map((_, i) => {
           const val = i * step;
           const leftPos = (i * step / target) * 100;
           const isVisited = visited.includes(val);
           return (
            <div key={i} className="absolute top-2/3 h-4 w-1 bg-green-700 rounded-full transition-all duration-500"
                 style={{ left: `calc(${leftPos}% - 2px)` }}>
               
               {/* Number Label */}
               <span className={`absolute -top-10 left-1/2 -translate-x-1/2 text-xl font-black transition-all duration-500 ${val <= current ? 'text-green-700 scale-125' : 'text-gray-300'}`}>
                 {val}
               </span>

               {/* Flower Reward for visited spots */}
               <div className={`absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-500 ${isVisited ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  <span className="text-2xl drop-shadow-sm">🌼</span>
               </div>
            </div>
           )
        })}

        {/* Bunny Character */}
        <div 
          className={`
            absolute top-1/2 w-20 h-20 bg-white rounded-full shadow-lg border-4 border-honey transition-all duration-500 ease-in-out z-20 flex items-center justify-center text-4xl
            ${isJumping ? '-translate-y-12 rotate-12 scale-110' : 'translate-y-0 rotate-0'}
          `}
          style={{ 
            left: `calc(${progress}% - 2.5rem)`, 
            top: isJumping ? '20%' : '45%' // Manual top override for jump arc
          }}
        >
          🐰
        </div>
      </div>

      <button 
        onClick={handleHop}
        disabled={isJumping || current >= target}
        className={`mt-10 px-12 py-5 bg-mint text-white text-3xl font-black rounded-full shadow-[0_8px_0_#2F855A] active:translate-y-[8px] active:shadow-none transition-all ${current >= target ? 'opacity-50 cursor-default' : 'animate-bounce hover:bg-green-400'}`}
      >
        HOP +{step}
      </button>
      <p className="mt-6 text-gray-500 font-bold bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
        {current === 0 ? "Click HOP to start counting!" : `${current} bunnies... keep going!`}
      </p>
    </div>
  );
};

// --- WIDGET 2: Array Grid (Mult Lv2) ---
const ArrayWidget: React.FC<{ rows: number, cols: number, onDone: () => void }> = ({ rows, cols, onDone }) => {
  const [active, setActive] = useState<boolean[]>(Array(rows * cols).fill(false));

  const handleClick = (index: number) => {
    if (active[index]) return;
    const newActive = [...active];
    newActive[index] = true;
    setActive(newActive);
    feedback('pop');
    
    const count = newActive.filter(x => x).length;
    
    if (newActive.every(x => x)) {
      speak("Full Honey Comb!");
      setTimeout(onDone, 1500);
    } else {
        // Speak random encouraging counts or "Sticky!"
        if (count % 3 === 0) speak(`${count}!`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-1 mx-auto bg-amber-50 p-6 rounded-[2rem] border-4 border-amber-100 shadow-sm">
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className={`flex gap-1 ${r % 2 === 1 ? 'pl-6' : ''}`}>
                {Array.from({ length: cols }).map((_, c) => {
                    const i = r * cols + c;
                    return (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                            className={`
                                w-14 h-16 transition-all duration-300 flex items-center justify-center text-2xl mb-[-8px]
                                ${active[i] 
                                    ? 'bg-honey scale-100 shadow-inner' 
                                    : 'bg-amber-200/50 hover:bg-amber-200 scale-95 cursor-pointer animate-pulse'
                                }
                            `}
                        >
                            {active[i] && <span className="animate-pop">🐝</span>}
                        </button>
                    )
                })}
            </div>
        ))}
      </div>
      
      <p className="mt-8 text-xl font-bold text-amber-500 bg-amber-50 px-6 py-2 rounded-xl">
        {active.filter(x=>x).length} filled out of {rows * cols}
      </p>
    </div>
  );
};

// --- WIDGET 3: Skip Counting Chart (Mult Lv3) ---
const SkipCountWidget: React.FC<{ skip: number, max: number, onDone: () => void }> = ({ skip, max, onDone }) => {
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const nextTarget = (highlighted.length + 1) * skip;

  const handleClick = (num: number) => {
    if (num === nextTarget) {
      const newH = [...highlighted, num];
      setHighlighted(newH);
      feedback('pop');
      if (num >= max) setTimeout(onDone, 800);
    } else {
      feedback('wrong');
    }
  };

  const grid = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="grid grid-cols-5 gap-2 w-full">
        {grid.map(n => {
          const isTarget = n === nextTarget;
          const isDone = highlighted.includes(n);
          return (
            <button
              key={n}
              onClick={() => handleClick(n)}
              className={`
                aspect-square rounded-lg font-bold text-sm transition-all duration-300 relative overflow-hidden
                ${isDone ? 'bg-lavender text-white scale-110 shadow-md' : 'bg-white text-gray-300'}
                ${isTarget ? 'ring-2 ring-lavender ring-offset-2 animate-pulse text-lavender font-black' : ''}
              `}
            >
              {isDone && <div className="absolute inset-0 bg-white opacity-20 animate-shimmer" />}
              {n}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-lavender font-bold">
        Count by {skip}s! <br/> Next number: {nextTarget}
      </p>
    </div>
  );
};

// --- WIDGET 4: Commutative Flip (Mult Lv4) ---
const CommutativeWidget: React.FC<{ rows: number, cols: number, onDone: () => void }> = ({ rows, cols, onDone }) => {
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(0);

  const handleFlip = () => {
    setFlipped(!flipped);
    feedback('pop');
    if (count < 2) {
      setCount(c => c + 1);
    } else {
      setTimeout(onDone, 800);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`transition-all duration-700 ease-in-out bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 ${flipped ? 'rotate-90' : 'rotate-0'}`}>
        <div className="grid gap-2" style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)` 
        }}>
          {Array.from({ length: rows * cols }).map((_, i) => (
             <div key={i} className="w-8 h-8 bg-honey rounded-full flex items-center justify-center animate-pop">🐝</div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xl font-bold text-gray-600 mb-2">
           {flipped ? `${cols} × ${rows}` : `${rows} × ${cols}`}
        </p>
        <button 
          onClick={handleFlip}
          className="bg-sky text-white px-8 py-3 rounded-xl font-bold text-lg shadow-[0_4px_0_#0284C7] active:translate-y-[4px] active:shadow-none animate-pulse hover:animate-none"
        >
          🔄 Flip Grid
        </button>
        {count >= 2 && <p className="mt-2 text-green-500 font-bold animate-pop">Same number of bees!</p>}
      </div>
    </div>
  );
};

// --- WIDGET 5: Distributive Chocolate Break (Mult Lv5) ---
const DistributiveWidget: React.FC<{ total: number, breakAt: number, onDone: () => void }> = ({ total, breakAt, onDone }) => {
  const [broken, setBroken] = useState(false);

  const handleBreak = () => {
    setBroken(true);
    playSound('pop'); 
    setTimeout(onDone, 1500);
  };

  return (
    <div className="flex flex-col items-center">
       <p className="mb-6 text-gray-500 font-bold text-center">
         7 × 8 is hard... Let's break the chocolate!<br/>
         <span className="text-sm font-normal">Break 7 into 5 + 2</span>
       </p>

       <div className="relative cursor-pointer group" onClick={handleBreak}>
          <div className="flex flex-col gap-1">
             <div className={`grid grid-cols-8 gap-1 bg-[#5D4037] p-2 rounded-t-lg transition-transform duration-500 relative overflow-hidden ${broken ? '-translate-y-2 rotate-1' : ''}`}>
               {!broken && <div className="absolute inset-0 bg-white opacity-10 animate-shimmer pointer-events-none" />}
               {Array.from({ length: 5 * 8 }).map((_, i) => (
                 <div key={i} className="w-6 h-6 bg-[#795548] rounded-sm border border-[#5D4037] opacity-90" />
               ))}
               <div className="absolute -left-12 top-10 font-bold text-[#5D4037]">5 × 8</div>
             </div>
             
             {!broken && (
               <div className="absolute top-[58%] left-0 right-0 h-1 bg-white/50 border-t-2 border-dashed border-white w-full z-10 group-hover:bg-honey/50 animate-pulse" />
             )}

             <div className={`grid grid-cols-8 gap-1 bg-[#5D4037] p-2 rounded-b-lg transition-transform duration-500 ${broken ? 'translate-y-2 -rotate-1' : ''}`}>
               {Array.from({ length: 2 * 8 }).map((_, i) => (
                 <div key={i} className="w-6 h-6 bg-[#795548] rounded-sm border border-[#5D4037] opacity-90" />
               ))}
               <div className="absolute -left-12 top-6 font-bold text-[#5D4037]">2 × 8</div>
             </div>
          </div>
       </div>

       {broken && (
         <div className="mt-8 text-center animate-pop">
           <div className="text-xl font-bold text-[#5D4037]">40 + 16 = 56</div>
           <div className="text-sm text-gray-400">Yum! Much easier.</div>
         </div>
       )}
       {!broken && <div className="mt-4 text-gray-400 text-sm animate-bounce">Tap to break!</div>}
    </div>
  );
};

// --- WIDGET 6: Near Square Trick (Mult Lv6) ---
const NearSquareWidget: React.FC<{ base: number, multiplier: number, onDone: () => void }> = ({ base, multiplier, onDone }) => {
  const [step, setStep] = useState(0); // 0: initial, 1: split 10, 2: split 1, 3: done

  const handleTap = () => {
    feedback('pop');
    setStep(s => s + 1);
    if (step >= 2) setTimeout(onDone, 2000);
  };

  return (
    <div className="flex flex-col items-center max-w-sm">
       <div className="text-4xl font-black text-gray-700 mb-8">{base} × {multiplier}</div>
       
       <div className="flex items-end gap-2 h-40 relative">
          {/* Main Stack (x10) */}
          <div className={`
             bg-honey w-20 flex flex-col items-center justify-center rounded-t-lg transition-all duration-500 border-b-4 border-honey/50
             ${step >= 1 ? 'h-32' : 'h-32 opacity-100'} 
             ${step === 0 ? 'animate-pulse cursor-pointer' : ''}
          `} onClick={step === 0 ? handleTap : undefined}>
             <span className="text-white font-bold text-2xl drop-shadow-md">×10</span>
             {step >= 1 && <span className="absolute -top-8 text-honey font-bold animate-pop">{base}0</span>}
          </div>

          {/* Remainder Stack (x1) */}
          <div className={`
             bg-honey/60 w-20 flex flex-col items-center justify-center rounded-t-lg transition-all duration-500
             ${step >= 2 ? 'h-8 opacity-100' : step >= 1 ? 'h-0 opacity-0' : 'h-0'}
             ${step === 1 ? 'h-8 opacity-50 cursor-pointer animate-pulse' : ''}
          `} onClick={step === 1 ? handleTap : undefined}>
             <span className="text-white font-bold text-sm">×1</span>
             {step >= 2 && <span className="absolute -top-8 text-honey/60 font-bold animate-pop">+{base}</span>}
          </div>
       </div>

       <div className="mt-8 h-12">
          {step === 0 && <p className="text-gray-400 animate-bounce">Tap the big block!</p>}
          {step === 1 && <p className="text-gray-400 animate-bounce">Tap the small block!</p>}
          {step >= 2 && <p className="text-2xl font-bold text-honey animate-pop">{base}0 + {base} = {base * multiplier}</p>}
       </div>
    </div>
  );
};

// --- WIDGET 7: Area Model (Mult Lv7) ---
const AreaModelWidget: React.FC<{ a: number, b: number, onDone: () => void }> = ({ a, b, onDone }) => {
  // Example: 14 x 5. a=14, b=5. Split 14 into 10 and 4.
  const tens = Math.floor(a / 10) * 10;
  const ones = a % 10;
  
  const [filledTens, setFilledTens] = useState(false);
  const [filledOnes, setFilledOnes] = useState(false);

  const checkDone = (t: boolean, o: boolean) => {
    if (t && o) setTimeout(onDone, 1500);
  };

  return (
    <div className="flex flex-col items-center">
       <div className="text-3xl font-black text-gray-600 mb-6">{a} × {b}</div>
       
       <div className="flex gap-2">
          {/* Tens Box */}
          <div 
             onClick={() => { if(!filledTens) { setFilledTens(true); feedback('pop'); checkDone(true, filledOnes); } }}
             className={`w-32 h-32 border-4 border-blue-200 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${filledTens ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'}`}
          >
             <div className="text-gray-400 font-bold text-xs absolute -top-6">{tens}</div>
             <div className="text-gray-400 font-bold text-xs absolute -left-6 top-12">{b}</div>
             
             {!filledTens ? (
               <span className="text-blue-300 animate-pulse text-4xl">?</span>
             ) : (
               <span className="text-blue-600 font-black text-3xl animate-pop">{tens * b}</span>
             )}
          </div>

          {/* Ones Box */}
          <div 
             onClick={() => { if(!filledOnes) { setFilledOnes(true); feedback('pop'); checkDone(filledTens, true); } }}
             className={`w-16 h-32 border-4 border-green-200 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${filledOnes ? 'bg-green-100' : 'bg-white hover:bg-gray-50'}`}
          >
             <div className="text-gray-400 font-bold text-xs absolute -top-6">{ones}</div>
             {!filledOnes ? (
               <span className="text-green-300 animate-pulse text-2xl">?</span>
             ) : (
               <span className="text-green-600 font-black text-2xl animate-pop">{ones * b}</span>
             )}
          </div>
       </div>

       <div className="mt-8 h-8 text-xl font-bold text-gray-600">
         {(filledTens && filledOnes) ? (
            <span className="animate-pop">{tens*b} + {ones*b} = {a*b}</span>
         ) : "Tap boxes to solve!"}
       </div>
    </div>
  );
};


// --- WIDGET 8: Fair Share with Remainder (Div Lv1 & Lv2) ---
const RemainderWidget: React.FC<{ items: number, groups: number, onDone: () => void }> = ({ items, groups, onDone }) => {
  const [distributed, setDistributed] = useState<number[]>(Array(groups).fill(0));
  const [leftover, setLeftover] = useState(0);
  const [remaining, setRemaining] = useState(items);
  const [animatingPlate, setAnimatingPlate] = useState<number | null>(null);

  const totalPerGroup = Math.floor(items / groups);

  const handleDistribute = (groupIndex: number) => {
    if (remaining > 0 && animatingPlate === null) {
      const currentAmount = distributed[groupIndex];
      
      if (currentAmount < totalPerGroup) {
         // Start animation
         setAnimatingPlate(groupIndex);
         feedback('pop');

         // Wait for animation to land before updating math
         setTimeout(() => {
             const newDist = [...distributed];
             newDist[groupIndex]++;
             setDistributed(newDist);
             setRemaining(r => r - 1);
             setAnimatingPlate(null);
         }, 400); // Sync with CSS duration
      } else {
        feedback('wrong');
      }
    }
  };

  const handleLeftover = () => {
    if (remaining > 0 && distributed.every(x => x === totalPerGroup)) {
       setLeftover(l => l + 1);
       setRemaining(r => r - 1);
       feedback('correct');
       setTimeout(onDone, 1000);
    } else {
       feedback('wrong');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Cookie Jar (Source) */}
      <div className="mb-8 relative w-32 h-24 bg-white/50 rounded-full border-4 border-gray-200 flex items-center justify-center shadow-inner">
         <span className={`text-4xl transition-all duration-300 ${remaining === 0 ? 'opacity-20 scale-50' : 'opacity-100 scale-100'}`}>
            🍪
         </span>
         <span className="absolute -top-3 bg-white px-2 rounded-full text-xs font-bold text-gray-400 border border-gray-200">
            {remaining} left
         </span>
         
         {/* Flying Cookie Animation */}
         {animatingPlate !== null && (
             <div 
               className="absolute z-50 text-3xl pointer-events-none transition-all duration-300 ease-in"
               style={{ 
                   transform: `translate(${animatingPlate === 0 ? '-100px' : '100px'}, 150px) scale(0.5)`,
                   opacity: 0 
               }}
             >
                 <div className="animate-pop">🍪</div>
             </div>
         )}
      </div>

      <div className="flex justify-center gap-8 items-end w-full max-w-sm">
        {Array.from({ length: groups }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleDistribute(i)}
            className={`
              relative flex flex-col items-center bg-blue-50 p-4 rounded-xl border-2 border-blue-100 transition-all active:scale-95
              ${distributed[i] >= totalPerGroup ? 'opacity-60 saturate-50' : 'animate-pulse ring-4 ring-blue-100/50'}
              ${animatingPlate === i ? 'scale-110 border-blue-400' : ''}
            `}
          >
            <div className="text-5xl mb-2 transition-transform duration-300">🐻</div>
            
            {/* Plate Area */}
            <div className="grid grid-cols-2 gap-1 w-20 h-20 place-content-start bg-white/50 rounded-lg p-1 border border-blue-100/50">
              {Array.from({ length: distributed[i] }).map((__, j) => (
                <div key={j} className="text-lg animate-pop">🍪</div>
              ))}
            </div>
            
            <span className="text-xs font-bold text-blue-300 mt-2 uppercase tracking-wide">Plate {i+1}</span>
          </button>
        ))}

        {/* Leftover Section (Only for Level 2 or if needed) */}
        {items % groups !== 0 && (
            <button
            onClick={handleLeftover}
            disabled={!distributed.every(x => x === totalPerGroup)}
            className={`
                flex flex-col items-center p-2 rounded-xl border-2 border-dashed border-gray-300 transition-all
                ${distributed.every(x => x === totalPerGroup) && remaining > 0 ? 'scale-110 bg-honey/10 border-honey animate-bounce' : 'opacity-30'}
            `}
            >
            <div className="w-16 h-20 border-4 border-gray-300 rounded-b-xl border-t-0 relative flex items-end justify-center pb-2 overflow-hidden bg-white/20">
                <div className="absolute top-0 w-full h-1 bg-gray-300" />
                {leftover > 0 && <div className="text-2xl animate-pop">🍪</div>}
            </div>
            <span className="text-xs font-bold text-gray-400 mt-2">Leftovers</span>
            </button>
        )}
      </div>
    </div>
  );
};

// --- WIDGET 9: Fact Family Triangle (Div Lv4) ---
const FactFamilyWidget: React.FC<{ a: number, b: number, onDone: () => void }> = ({ a, b, onDone }) => {
  const product = a * b;
  const [mode, setMode] = useState<'mult' | 'div'>('mult');

  const toggle = () => {
    setMode(m => m === 'mult' ? 'div' : 'mult');
    feedback('pop');
    setTimeout(onDone, 1500); 
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mt-8">
         <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <path d="M 50 10 L 90 90 L 10 90 Z" fill="#fff" stroke="#E5E7EB" strokeWidth="2" />
         </svg>
         
         <div className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl font-black text-honey bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md animate-pop">
           {product}
         </div>
         <div className="absolute bottom-0 left-0 text-2xl font-bold text-gray-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
           {a}
         </div>
         <div className="absolute bottom-0 right-0 text-2xl font-bold text-gray-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
           {b}
         </div>

         <button 
           onClick={toggle}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-lavender text-white rounded-full text-3xl font-black shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-pulse hover:animate-none"
         >
           {mode === 'mult' ? '×' : '÷'}
         </button>
      </div>
      <div className="mt-8 text-2xl font-bold text-gray-600 animate-pop">
         {mode === 'mult' ? `${a} × ${b} = ${product}` : `${product} ÷ ${a} = ${b}`}
      </div>
    </div>
  );
};

// --- WIDGET 10: Chunking Machine (Div Lv5) ---
const ChunkingWidget: React.FC<{ dividend: number, divisor: number, onDone: () => void }> = ({ dividend, divisor, onDone }) => {
  const [remaining, setRemaining] = useState(dividend);
  const [chunks, setChunks] = useState<number[]>([]);
  const [step, setStep] = useState<'subtract' | 'sum'>('subtract');

  const handleSubtract = (count: number) => {
    const val = count * divisor;
    if (val <= remaining) {
        const newRem = remaining - val;
        setRemaining(newRem);
        setChunks(prev => [...prev, count]);
        feedback('pop');
        if (newRem === 0) {
            setStep('sum');
            setTimeout(onDone, 3000);
        }
    }
  };

  const options = [10, 5, 2, 1].filter(n => n * divisor <= remaining);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
       <div className="mb-4 bg-gray-200 p-4 rounded-2xl w-full text-center border-4 border-gray-300 relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-white opacity-10 animate-shimmer pointer-events-none" />
           <p className="text-gray-500 font-bold text-xs uppercase mt-2">Machine Tank</p>
           <div className="text-5xl font-black text-gray-700 transition-all duration-300">{remaining}</div>
       </div>

       {step === 'subtract' ? (
           <div className="grid grid-cols-2 gap-3 w-full">
               {options.map(opt => (
                   <button 
                     key={opt}
                     onClick={() => handleSubtract(opt)}
                     className="bg-honey text-white py-3 px-4 rounded-xl font-bold shadow-[0_4px_0_#B45309] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center animate-slide-in hover:scale-105"
                   >
                       <span className="text-lg">Take {opt} groups</span>
                       <span className="text-xs opacity-80">({opt} × {divisor} = {opt * divisor})</span>
                   </button>
               ))}
           </div>
       ) : (
           <div className="animate-pop text-center bg-green-100 p-4 rounded-xl border-2 border-green-200 w-full">
               <div className="text-2xl font-bold text-green-600">
                   {chunks.join(' + ')} = {chunks.reduce((a,b)=>a+b, 0)}
               </div>
           </div>
       )}
    </div>
  );
};

// --- WIDGET 11: Halving Tree (Div Lv6) ---
const HalvingWidget: React.FC<{ start: number, onDone: () => void }> = ({ start, onDone }) => {
  const [level, setLevel] = useState(0); // 0: full, 1: half, 2: quarter (done)

  const handleClick = () => {
    feedback('pop');
    setLevel(l => l + 1);
    if (level >= 1) setTimeout(onDone, 1500);
  };

  return (
    <div className="flex flex-col items-center">
       <h3 className="text-gray-500 font-bold mb-4">Divide {start} by 4</h3>
       
       {/* Root */}
       <div className="flex flex-col items-center">
          <div 
             onClick={level === 0 ? handleClick : undefined}
             className={`w-24 h-24 rounded-full bg-honey flex items-center justify-center text-3xl font-black text-white shadow-lg transition-all ${level===0 ? 'animate-bounce cursor-pointer' : 'scale-75 opacity-50'}`}
          >
             {start}
          </div>
          
          {/* Level 1 Split */}
          {level >= 1 && (
            <div className="flex gap-8 mt-4 animate-pop">
               <div className="w-1 bg-gray-300 h-8 rotate-45 absolute left-1/2 -ml-6 -mt-6"></div>
               <div className="w-1 bg-gray-300 h-8 -rotate-45 absolute left-1/2 +ml-6 -mt-6"></div>

               <div className={`w-20 h-20 rounded-full bg-honey/80 flex items-center justify-center text-2xl font-bold text-white shadow transition-all ${level === 1 ? 'animate-pulse cursor-pointer' : 'scale-75 opacity-50'}`} onClick={level === 1 ? handleClick : undefined}>
                 {start / 2}
               </div>
               <div className="w-20 h-20 rounded-full bg-honey/80 flex items-center justify-center text-2xl font-bold text-white shadow opacity-50">
                 {start / 2}
               </div>
            </div>
          )}

          {/* Level 2 Split */}
          {level >= 2 && (
             <div className="flex gap-4 mt-4 animate-pop relative">
               <div className="absolute -top-6 left-8 w-1 h-6 bg-gray-300 -rotate-12"></div>
               <div className="absolute -top-6 left-24 w-1 h-6 bg-gray-300 rotate-12"></div>

               <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-xl font-black text-white shadow-xl scale-110">
                 {start / 4}
               </div>
               <div className="w-16 h-16 rounded-full bg-mint/50 flex items-center justify-center text-xl font-bold text-white">
                 {start / 4}
               </div>
             </div>
          )}
       </div>

       <div className="mt-8 text-center h-8">
          {level === 0 && <p className="text-gray-400">Tap to cut in half!</p>}
          {level === 1 && <p className="text-gray-400">Tap to cut in half again!</p>}
          {level === 2 && <p className="text-mint font-bold animate-pop">Half of half is divided by 4!</p>}
       </div>
    </div>
  );
};

// --- WIDGET 12: Short Division Scaffold (Div Lv7) ---
const ShortDivWidget: React.FC<{ dividend: number, divisor: number, onDone: () => void }> = ({ dividend, divisor, onDone }) => {
  // Hardcoded for 52 / 4 logic visual
  const [step, setStep] = useState(0); // 0: start, 1: div tens, 2: drag remainder, 3: div ones

  const handleDrag = () => {
    feedback('pop');
    setStep(2);
    setTimeout(() => setStep(3), 1000);
    setTimeout(onDone, 2500);
  };

  return (
    <div className="flex flex-col items-center">
       <div className="text-3xl font-mono bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative">
          <div className="border-r-2 border-gray-400 pr-4">{divisor}</div>
          <div className="flex gap-6 relative">
             {/* Tens */}
             <div className="flex flex-col items-center">
                <span className="text-gray-400 text-sm absolute -top-4">{step >= 1 ? '1' : ''}</span>
                <span className="text-4xl">5</span>
                {step === 0 && (
                   <button onClick={() => setStep(1)} className="absolute -bottom-12 bg-honey text-white text-xs px-2 py-1 rounded animate-bounce">
                     4 goes into 5?
                   </button>
                )}
             </div>

             {/* Remainder Animation */}
             {step >= 1 && (
                <div 
                  className={`absolute left-4 top-1 text-red-500 font-bold text-sm transition-all duration-1000 ${step >= 2 ? 'translate-x-6' : 'animate-pulse cursor-pointer'}`}
                  onClick={step === 1 ? handleDrag : undefined}
                >
                  1
                </div>
             )}

             {/* Ones */}
             <div className="flex flex-col items-center">
                <span className="text-gray-400 text-sm absolute -top-4">{step >= 3 ? '3' : ''}</span>
                <span className="text-4xl">2</span>
             </div>
          </div>
       </div>

       <div className="mt-12 h-12 text-center text-gray-500 font-bold">
          {step === 0 && "How many 4s inside 50?"}
          {step === 1 && "1 ten left over! Drag it to the ones."}
          {step === 2 && "Now we have 12..."}
          {step === 3 && <span className="text-honey text-2xl animate-pop">Answer is 13!</span>}
       </div>
    </div>
  );
};

// --- Main Switcher Component ---
const StrategyVisuals: React.FC<StrategyProps> = ({ operation, level, onComplete }) => {
  // Strategy Map
  if (operation === Operation.MULT) {
    if (level === 1) return <NumberLineWidget target={12} step={3} onDone={onComplete} />; 
    if (level === 2) return <ArrayWidget rows={3} cols={4} onDone={onComplete} />;
    if (level === 3) return <SkipCountWidget skip={5} max={50} onDone={onComplete} />; 
    if (level === 4) return <CommutativeWidget rows={3} cols={5} onDone={onComplete} />;
    if (level === 5) return <DistributiveWidget total={56} breakAt={5} onDone={onComplete} />; 
    if (level === 6) return <NearSquareWidget base={12} multiplier={11} onDone={onComplete} />;
    if (level === 7) return <AreaModelWidget a={14} b={5} onDone={onComplete} />;
    return <ArrayWidget rows={5} cols={5} onDone={onComplete} />;
  }

  if (operation === Operation.DIV) {
    if (level === 1) return <RemainderWidget items={8} groups={2} onDone={onComplete} />; 
    if (level === 2) return <RemainderWidget items={7} groups={2} onDone={onComplete} />; 
    if (level === 3) return <NumberLineWidget target={20} step={5} onDone={onComplete} />; 
    if (level === 4) return <FactFamilyWidget a={4} b={6} onDone={onComplete} />;
    if (level === 5) return <ChunkingWidget dividend={65} divisor={5} onDone={onComplete} />;
    if (level === 6) return <HalvingWidget start={64} onDone={onComplete} />;
    if (level === 7) return <ShortDivWidget dividend={52} divisor={4} onDone={onComplete} />;
    return <RemainderWidget items={10} groups={2} onDone={onComplete} />;
  }

  return <div>Strategy loading...</div>;
};

export default StrategyVisuals;