import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import BearAvatar from '../components/BearAvatar';
import Keypad from '../components/Keypad';
import StrategyVisuals from '../components/learn/StrategyVisuals';
import MultiplicationTable from '../components/learn/MultiplicationTable';
import { Operation, MathProblem, Costume } from '../types';
import { generateProblem } from '../services/mathEngine';
import { speak, playSound } from '../services/audioService';
import { loadProfile, updateBears, markStrategyLearned } from '../services/storageService';

type Phase = 'intro' | 'interact' | 'practice' | 'success' | 'fail';
type View = 'lesson' | 'table';

// Helper for Visual Scaffolding in Practice Mode
const VisualScaffold: React.FC<{ operation: Operation; level: number; problem: MathProblem; inputLen: number }> = ({ operation, level, problem, inputLen }) => {
    // Only show scaffolds if input is empty or short to encourage mental math but provide backup
    const opacity = inputLen > 0 ? 'opacity-40' : 'opacity-100';

    if (operation === Operation.MULT) {
        if (level === 1) { // Repeated Add
            return <div className={`text-honey font-bold text-sm mt-2 ${opacity} transition-opacity`}>{Array(problem.a).fill(problem.b).join(' + ')}</div>;
        }
        if (level === 2) { // Array
             return (
                 <div className={`grid gap-1 mt-4 ${opacity} transition-opacity`} style={{ gridTemplateColumns: `repeat(${problem.b}, 1fr)` }}>
                     {Array.from({length: problem.a * problem.b}).map((_, i) => (
                         <div key={i} className="w-2 h-2 rounded-full bg-honey/40"></div>
                     ))}
                 </div>
             );
        }
        if (level === 5) { // Distributive (Chocolate)
            // e.g. 7x8 -> (5x8) + (2x8)
            const split = Math.floor(problem.a / 2); // Simple split logic for visual
            const rest = problem.a - split;
            return <div className={`text-gray-400 text-xs mt-2 ${opacity}`}>Hint: ({split} × {problem.b}) + ({rest} × {problem.b})</div>;
        }
        if (level === 6) { // Near Square
            return <div className={`text-gray-400 text-xs mt-2 ${opacity}`}>Hint: ({problem.a} × 10) + {problem.a}</div>;
        }
        if (level === 7) { // Area
            return (
                 <div className={`flex mt-2 border border-blue-200 rounded ${opacity}`}>
                     <div className="bg-blue-50 p-2 text-[10px] flex items-center justify-center">{Math.floor(problem.a/10)*10}×{problem.b}</div>
                     <div className="bg-green-50 p-2 text-[10px] flex items-center justify-center">{problem.a%10}×{problem.b}</div>
                 </div>
            )
        }
    }
    return null;
};


const Learn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { operation: Operation; level: number } | null;
  const [profile] = useState(loadProfile());

  // Guards
  useEffect(() => {
    if (!state) navigate('/rooms');
  }, [state, navigate]);

  if (!state) return null;

  const { operation, level } = state;

  const [view, setView] = useState<View>('lesson');
  const [phase, setPhase] = useState<Phase>('intro');
  const [practiceCount, setPracticeCount] = useState(0);
  const [correctPractice, setCorrectPractice] = useState(0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [input, setInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const targetPracticeCount = profile.settings.practiceQuestionCount || 3;

  const getIntro = () => {
    let introText = "";
    if (operation === Operation.MULT) {
        if (level === 1) introText = "Multiplication is just hops on a line! Tap the button to help the bunny hop and count out loud.";
        else if (level === 2) introText = "Let's build a Honey Comb! Tap the empty spots to fill them with bees. Count the rows as you go.";
        else if (level === 3) introText = "Let's learn a song! We can skip-count by 5s.";
        else if (level === 4) introText = "Here's a magic trick: If you flip the grid, the number of bees stays the same!";
        else if (level === 5) introText = "Big numbers are hard... so let's break the chocolate bar into smaller bites!";
        else if (level === 6) introText = "11 is just 10 plus 1. Multiply by 10 first, then add one more group!";
        else if (level === 7) introText = "Use the Box Method! Split the number into tens and ones, then add them up.";
        else introText = "Let's learn a trick to multiply faster!";
    } else {
        if (level === 1) introText = "Division means sharing cookies equally. One for you, one for me...";
        else if (level === 2) introText = "Uh oh! Sometimes the cookies don't fit evenly. We need a Leftover Jar!";
        else if (level === 3) introText = "We can jump backwards on the number line to divide!";
        else if (level === 4) introText = "Multiplication and Division are best friends. They are a Fact Family!";
        else if (level === 5) introText = "For big numbers, we can use the Chunking Machine! Subtract big chunks first.";
        else if (level === 6) introText = "To divide by 4, just cut it in half, then cut it in half again!";
        else if (level === 7) introText = "The remainder travels to the next number. Watch the red 1 float over!";
        else introText = "Let's split the honey into equal jars.";
    }

    return `${introText} Learning this trick helps you collect honey faster!`;
  };

  const handleIntroNext = () => {
    setPhase('interact');
    speak(getIntro());
  };

  const handleInteractionComplete = () => {
    playSound('win');
    setTimeout(() => {
        setPhase('practice');
        nextProblem();
    }, 1000);
  };

  const nextProblem = () => {
    setProblem(generateProblem(operation, level));
    setInput('');
  };

  const handleInput = (d: string) => {
    if (input.length < 3) setInput(prev => prev + d);
  };

  const checkAnswer = () => {
    if (!problem) return;
    const val = parseInt(input, 10);
    if (val === problem.answer) {
        playSound('correct');
        setCorrectPractice(c => c + 1);
    } else {
        playSound('wrong');
    }
    
    if (practiceCount < targetPracticeCount - 1) {
        setPracticeCount(c => c + 1);
        setTimeout(nextProblem, 500);
    } else {
        finishLesson();
    }
  };

  const finishLesson = () => {
    // 60% accuracy required to pass
    const accuracy = correctPractice / targetPracticeCount;
    if (accuracy >= 0.6) {
        setPhase('success');
        setShowConfetti(true);
        playSound('win');
        
        // Base reward is 3 bears. Bonus +1 for 100% accuracy.
        const baseReward = 3;
        const bonusReward = accuracy === 1 ? 1 : 0;
        const totalReward = baseReward + bonusReward;

        updateBears(totalReward);
        
        if (bonusReward > 0) {
            setTimeout(() => playSound('bonus'), 500);
        }
        
        markStrategyLearned(operation, level);
    } else {
        setPhase('fail');
        playSound('wrong');
    }
  };

  const retryPractice = () => {
      setPracticeCount(0);
      setCorrectPractice(0);
      setPhase('practice');
      nextProblem();
  };

  const goToGame = () => {
    navigate('/play', { state: { operation } });
  };

  return (
    <div className={`min-h-screen bg-cloud flex flex-col items-center p-4 relative overflow-hidden ${operation === Operation.MULT ? 'bg-amber-50' : 'bg-blue-50'}`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4">
        <h1 className="text-xl font-black text-gray-500 uppercase tracking-widest">Learning Annex</h1>
        
        {/* View Tabs (Only for Mult) */}
        {operation === Operation.MULT ? (
            <div className="flex bg-white/50 p-1 rounded-xl">
                <button 
                  onClick={() => setView('lesson')} 
                  className={`px-4 py-1 rounded-lg font-bold text-sm transition-all ${view === 'lesson' ? 'bg-white shadow text-honey' : 'text-gray-400'}`}
                >
                  Lesson
                </button>
                <button 
                  onClick={() => setView('table')} 
                  className={`px-4 py-1 rounded-lg font-bold text-sm transition-all ${view === 'table' ? 'bg-white shadow text-honey' : 'text-gray-400'}`}
                >
                  Table
                </button>
            </div>
        ) : (
            <div className="flex gap-1">
                <div className={`w-3 h-3 rounded-full ${phase === 'interact' || phase === 'practice' || phase === 'success' ? 'bg-honey' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full ${phase === 'practice' || phase === 'success' ? 'bg-honey' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full ${phase === 'success' ? 'bg-honey' : 'bg-gray-300'}`} />
            </div>
        )}
      </div>

      {/* Main Card */}
      <div className="flex-1 w-full max-w-2xl bg-white rounded-[2rem] shadow-xl p-6 flex flex-col relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(${operation === Operation.MULT ? '#F59E0B' : '#3B82F6'} 2px, transparent 2px)`, backgroundSize: '20px 20px' }} />

        {/* View Switcher */}
        {view === 'table' ? (
            <div className="w-full h-full animate-slide-in">
                <MultiplicationTable />
            </div>
        ) : (
            <>
                <div className="flex justify-center mb-6">
                    <BearAvatar 
                        color={profile.avatarColor} 
                        costume={Costume.NONE} 
                        className={`w-32 h-32 ${phase === 'interact' ? 'scale-75 origin-top' : ''} transition-all`} 
                        professor={true}
                        emotion={phase === 'fail' ? 'neutral' : 'happy'}
                    />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
                    
                    {phase === 'intro' && (
                        <div className="text-center animate-pop">
                            <h2 className="text-3xl font-black text-gray-700 mb-4">{operation === Operation.MULT ? 'Multiplication Magic' : 'Fair Share Division'}</h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{getIntro()}</p>
                            <button onClick={handleIntroNext} className="bg-honey text-white text-2xl font-bold px-12 py-4 rounded-full shadow-lg hover:bg-amber-500 transition-transform active:scale-95 animate-pulse">
                                Start Lesson
                            </button>
                        </div>
                    )}

                    {phase === 'interact' && (
                        <div className="w-full flex flex-col items-center animate-slide-in">
                            <div className="w-full bg-gray-50 rounded-3xl p-4 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200">
                                <StrategyVisuals operation={operation} level={level} onComplete={handleInteractionComplete} />
                            </div>
                        </div>
                    )}

                    {phase === 'practice' && problem && (
                        <div className="w-full flex flex-col items-center animate-slide-in">
                            <h3 className="text-gray-400 font-bold mb-4 uppercase tracking-wider">Practice {practiceCount + 1} / {targetPracticeCount}</h3>
                            <div className="text-5xl font-black text-gray-700 mb-2">
                                {problem.a} {problem.operator} {problem.b} = <span className="text-honey">{input || '?'}</span>
                            </div>
                            
                            {/* Visual Scaffold Container */}
                            <div className="h-16 mb-4 flex items-center justify-center w-full">
                                <VisualScaffold operation={operation} level={level} problem={problem} inputLen={input.length} />
                            </div>

                            <Keypad 
                                onPress={handleInput} 
                                onDelete={() => setInput(prev => prev.slice(0, -1))} 
                                onCheck={checkAnswer} 
                                canCheck={input.length > 0} 
                                disabled={false}
                            />
                        </div>
                    )}

                    {phase === 'success' && (
                        <div className="text-center animate-pop w-full">
                            <h2 className="text-4xl font-black text-honey mb-4">You got it!</h2>
                            {correctPractice === targetPracticeCount ? (
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 animate-bounce text-6xl">🌟</div>
                                    <div className="bg-honey/10 text-honey px-6 py-2 rounded-xl font-bold text-xl mb-6 border-2 border-honey shadow-sm">
                                        Perfect Score!
                                    </div>
                                    <div className="text-gray-500 mb-8 font-bold text-xl flex flex-col items-center gap-1">
                                        <span>3 Bears</span>
                                        <span className="text-honey animate-pulse">+ 1 Bonus Bear! 🐻</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <p className="text-gray-400 mb-6">Good practice!</p>
                                    <p className="text-gray-500 mb-8 font-bold text-xl">
                                        +3 Bears Collected 🐻
                                    </p>
                                </div>
                            )}
                            <button onClick={goToGame} className="bg-mint text-white text-2xl font-bold px-12 py-4 rounded-full shadow-lg hover:bg-green-500 transition-transform active:scale-95 animate-bounce">
                                Go to Machine Room →
                            </button>
                        </div>
                    )}

                    {phase === 'fail' && (
                        <div className="text-center animate-wiggle">
                            <h2 className="text-3xl font-black text-gray-400 mb-4">Almost there!</h2>
                            <p className="text-gray-500 mb-8">That was a bit tricky. Want to try the practice again?</p>
                            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                                <button onClick={retryPractice} className="bg-honey text-white text-xl font-bold px-8 py-3 rounded-2xl shadow-md active:scale-95">
                                    Try Again ↺
                                </button>
                                <button onClick={() => setPhase('interact')} className="text-gray-400 font-bold">
                                    Review Trick
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {phase === 'interact' && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-center font-medium animate-pulse">
                        👆 Tap the screen to copy Buzzy's trick!
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Learn;
