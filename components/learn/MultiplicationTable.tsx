import React, { useState } from 'react';
import { speak, playSound } from '../../services/audioService';

const MultiplicationTable: React.FC = () => {
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);
  const [hideAnswers, setHideAnswers] = useState(false);
  const [revealed, setRevealed] = useState<string[]>([]); // "r-c"

  const size = 12;
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  const handleCellClick = (r: number, c: number) => {
    const val = r * c;
    setSelected({ r, c });
    playSound('pop');
    
    // If hidden, reveal
    const key = `${r}-${c}`;
    if (hideAnswers && !revealed.includes(key)) {
        setRevealed(prev => [...prev, key]);
        speak(`${val}!`);
    } else {
        speak(`${r} times ${c} is ${val}`);
    }
  };

  const toggleHide = () => {
    setHideAnswers(!hideAnswers);
    setRevealed([]); // Reset reveals
    setSelected(null);
    playSound('pop');
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
       <div className="flex justify-between items-center w-full mb-4 px-2">
          <h2 className="text-xl font-black text-gray-600">Explore Table</h2>
          <button 
            onClick={toggleHide}
            className={`
              px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all border-2
              ${hideAnswers ? 'bg-lavender text-white border-lavender' : 'bg-white text-gray-500 border-gray-200'}
            `}
          >
            {hideAnswers ? '👁️ Show All' : '🙈 Hide Answers'}
          </button>
       </div>

       {/* Main Grid Container */}
       <div className="flex-1 w-full overflow-auto bg-white rounded-2xl shadow-inner border border-gray-200 p-2 relative no-scrollbar">
          <div className="inline-block min-w-full">
             
             {/* Header Row */}
             <div className="flex sticky top-0 z-20 shadow-sm">
                <div className="w-10 h-10 flex-shrink-0 bg-honey text-white font-black flex items-center justify-center rounded-tl-lg text-lg">×</div>
                {numbers.map(n => (
                   <div key={n} className={`w-12 h-10 flex-shrink-0 flex items-center justify-center font-black bg-honey/90 text-white border-r border-honey/50 text-sm ${selected?.c === n ? 'bg-honey brightness-110 scale-110 z-30 shadow-lg' : ''}`}>
                      {n}
                   </div>
                ))}
             </div>

             {/* Rows */}
             {numbers.map(r => (
               <div key={r} className="flex">
                  {/* Row Header */}
                  <div className={`sticky left-0 z-10 w-10 h-10 flex-shrink-0 flex items-center justify-center font-black bg-honey/90 text-white border-b border-honey/50 text-sm ${selected?.r === r ? 'bg-honey brightness-110 scale-110 z-30 shadow-lg' : ''}`}>
                    {r}
                  </div>

                  {/* Cells */}
                  {numbers.map(c => {
                    const val = r * c;
                    const isSelected = selected?.r === r && selected?.c === c;
                    const isRowHigh = selected?.r === r;
                    const isColHigh = selected?.c === c;
                    const isHidden = hideAnswers && !revealed.includes(`${r}-${c}`);

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`
                          w-12 h-10 flex-shrink-0 flex items-center justify-center font-bold text-sm border-r border-b border-gray-100 transition-all duration-200
                          ${isSelected 
                             ? 'bg-mint text-white scale-110 z-20 rounded shadow-md text-lg' 
                             : isRowHigh || isColHigh 
                                ? 'bg-yellow-50 text-gray-800' 
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                          }
                        `}
                      >
                         {isHidden ? <span className="text-gray-200 text-xs">?</span> : val}
                      </button>
                    )
                  })}
               </div>
             ))}
          </div>
       </div>

       {/* Equation Display Footer */}
       <div className="mt-4 h-12 w-full bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100">
          {selected ? (
             <span className="text-2xl font-black text-honey animate-pop">
                {selected.r} × {selected.c} = {selected.r * selected.c}
             </span>
          ) : (
             <span className="text-gray-400 text-sm">Tap any number!</span>
          )}
       </div>
    </div>
  );
};

export default MultiplicationTable;
