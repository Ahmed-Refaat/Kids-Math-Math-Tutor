import React from 'react';

interface Props {
  onPress: (digit: string) => void;
  onDelete: () => void;
  onCheck: () => void;
  canCheck: boolean;
  disabled: boolean;
}

const Keypad: React.FC<Props> = ({ onPress, onDelete, onCheck, canCheck, disabled }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Del', '0'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto mt-6">
      {keys.map((k) => (
        <button
          key={k}
          disabled={disabled}
          onClick={() => k === 'Del' ? onDelete() : onPress(k)}
          className={`
            h-16 rounded-2xl text-2xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all
            ${k === 'Del' 
              ? 'bg-red-100 text-red-500 hover:bg-red-200' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {k === 'Del' ? '⌫' : k}
        </button>
      ))}
      <button
        onClick={onCheck}
        disabled={!canCheck || disabled}
        className={`
          h-16 rounded-2xl text-2xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all
          ${canCheck ? 'bg-mint text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
        `}
      >
        ✓
      </button>
    </div>
  );
};

export default Keypad;