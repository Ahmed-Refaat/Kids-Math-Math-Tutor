import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import BearAvatar from '../components/BearAvatar';
import Keypad from '../components/Keypad';
import { Operation, GameState, MathProblem, Costume } from '../types';
import { OPERATION_CONFIG, MILESTONES } from '../constants';
import { loadProfile, updateBears, updateLevel } from '../services/storageService';
import { generateProblem } from '../services/mathEngine';
import { speak, playSound } from '../services/audioService';

const Play: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const opState = location.state as { operation: Operation };
  
  // Guard against direct access without selection
  useEffect(() => {
    if (!opState?.operation) navigate('/rooms');
  }, [opState, navigate]);

  const profile = loadProfile();
  const operation = opState?.operation || Operation.ADD;
  
  // Game State
  const [level, setLevel] = useState(profile.levels[operation] || 1);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [input, setInput] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateBear, setAnimateBear] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintText, setHintText] = useState('');
  
  // Refs for logic
  const correctCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const historyRef = useRef<{correct: boolean, time: number}[]>([]);

  // Setup first problem
  useEffect(() => {
    nextProblem();
  }, []);

  const nextProblem = () => {
    const p = generateProblem(operation, level);
    setProblem(p);
    setInput('');
    setIsWrong(false);
    setAttempts(0);
    setHintText('');
    startTimeRef.current = Date.now();
  };

  const getCostume = () => {
    let costume = Costume.NONE;
    const total = profile.totalBears + score;
    for (let m of MILESTONES) {
        if (total >= m.count) costume = m.costume;
    }
    return costume;
  };

  const handleInput = (digit: string) => {
    if (input.length < 4) {
      playSound('pop');
      setInput(prev => prev + digit);
      setIsWrong(false);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const checkAnswer = () => {
    if (!problem) return;
    const val = parseInt(input, 10);
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;

    if (val === problem.answer) {
      // Correct
      playSound('correct');
      
      // Random Encouragement
      const praises = ["Awesome!", "Great Job!", "Super!", "You did it!", "Honey sweet!"];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      // This will use a random voice if 'random' is selected in settings
      speak(randomPraise);

      setScore(s => s + 1);
      correctCountRef.current += 1;
      historyRef.current.push({ correct: true, time: timeTaken });
      
      // Animation trigger
      setAnimateBear(true);
      setTimeout(() => setAnimateBear(false), 1000);

      setQuestionCount(c => c + 1);
      
      if (questionCount + 1 >= profile.settings.questionsPerSession) {
        finishGame();
      } else {
        setTimeout(nextProblem, 1000);
      }
    } else {
      // Wrong
      playSound('wrong');
      setIsWrong(true);
      setAttempts(a => a + 1);
      setInput(''); // clear input for retry

      if (attempts >= 2) {
         // Too many wrong, just show answer or move on? 
         // Design says: 3 wrong -> auto mark helped.
         setHintText(`The answer is ${problem.answer}`);
         speak(`The answer is ${problem.answer}`);
         setTimeout(() => {
           setQuestionCount(c => c + 1);
           historyRef.current.push({ correct: false, time: timeTaken });
           if (questionCount + 1 >= profile.settings.questionsPerSession) {
             finishGame();
           } else {
             nextProblem();
           }
         }, 2000);
      } else {
         // Show hint
         setHintText(problem.hint);
         speak(problem.hint);
      }
    }
  };

  const finishGame = () => {
    setGameOver(true);
    playSound('win');
    setShowConfetti(true);
    
    // Save stats
    updateBears(score);
    
    // Adaptive Logic
    const accuracy = correctCountRef.current / profile.settings.questionsPerSession;
    if (accuracy >= 0.8 && operation !== Operation.MIXED && level < 7) {
       updateLevel(operation, level + 1);
    } else if (accuracy <= 0.4 && level > 1) {
       updateLevel(operation, level - 1);
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-honey/10 flex flex-col items-center justify-center p-6 text-center">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        <BearAvatar color={profile.avatarColor} costume={getCostume()} className="w-48 h-48 animate-bounce-slow" />
        
        <h2 className="text-4xl font-black text-honey mt-6">Great Job!</h2>
        <p className="text-2xl text-gray-600 mt-2">You collected {score} bears!</p>
        
        <div className="mt-12 space-y-4 w-full max-w-xs">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-4 bg-mint text-white text-xl font-bold rounded-2xl shadow-[0_6px_0_#2F855A] active:translate-y-[6px] active:shadow-none"
          >
            Play Again
          </button>
          <button 
            onClick={() => navigate('/rooms')}
            className="w-full py-4 bg-white text-gray-500 text-xl font-bold rounded-2xl border-2 border-gray-200"
          >
             Choose Room
          </button>
        </div>
      </div>
    );
  }

  const roomColor = OPERATION_CONFIG[operation]?.color || 'bg-gray-400';

  return (
    <div className={`min-h-screen flex flex-col bg-cloud`}>
      {/* Top Bar */}
      <div className="h-16 flex justify-between items-center px-6 pt-4">
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
           <span className="text-xl">🫙</span>
           <span className="font-bold text-honey">{score}</span>
        </div>
        <button onClick={() => navigate('/rooms')} className="text-2xl opacity-50">⏸</button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
        
        {/* Animated Bear (Reward) */}
        {animateBear && (
           <div className="absolute z-50 animate-[slideIn_1s_ease-out] top-1/2 left-0 w-full pointer-events-none">
              <BearAvatar color={profile.avatarColor} costume={getCostume()} className="w-24 h-24 mx-auto" />
           </div>
        )}

        {/* Problem Card */}
        {problem && (
          <div className={`
             w-full p-8 rounded-[3rem] bg-white shadow-xl mb-8 flex flex-col items-center
             transition-transform duration-300
             ${isWrong ? 'animate-wiggle border-4 border-pink-200' : ''}
          `}>
             <div className="flex items-center gap-4 text-6xl font-black text-gray-700 font-mono tracking-wider">
                <span>{problem.a}</span>
                <span className="text-honey">{problem.operator}</span>
                <span>{problem.b}</span>
             </div>
             
             {/* Hint Bubble */}
             <div className="h-8 mt-4">
               {hintText && (
                 <div className="text-sm font-bold text-lavender bg-lavender/10 px-3 py-1 rounded-full animate-pop">
                   💡 {hintText}
                 </div>
               )}
             </div>

             {/* Input Display */}
             <div className="mt-6 w-48 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl font-bold text-gray-600 shadow-inner">
               {input || <span className="opacity-10 animate-pulse">?</span>}
             </div>
          </div>
        )}

        <Keypad 
          onPress={handleInput} 
          onDelete={handleDelete} 
          onCheck={checkAnswer} 
          canCheck={input.length > 0} 
          disabled={animateBear}
        />
        
        {/* Progress Bar */}
        <div className="w-full px-12 mt-8">
           <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
             <div 
               className={`h-full ${roomColor} transition-all duration-500`} 
               style={{ width: `${((questionCount) / profile.settings.questionsPerSession) * 100}%` }} 
             />
           </div>
        </div>

      </div>
    </div>
  );
};

export default Play;