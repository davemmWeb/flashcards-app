import { useState } from 'react';
import { type Flashcard } from '../db/db.js';

interface Props {
  card: Flashcard;
}

export function FlashcardItem({ card }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group h-64 w-full perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative h-full w-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Frente */}
        <div className="absolute inset-0 bg-white flex items-center justify-center rounded-xl shadow-lg backface-hidden border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800">{card.front}</h2>
          <p className="absolute bottom-4 text-xs text-gray-400">Toca para ver traducción</p>
        </div>

        {/* Reverso */}
        <div className="absolute inset-0 bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg rotate-y-180 backface-hidden">
          <h2 className="text-2xl font-medium">{card.back}</h2>
        </div>

      </div>
    </div>
  );
}