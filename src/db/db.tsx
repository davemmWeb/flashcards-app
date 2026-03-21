import { Dexie, type Table } from 'dexie';

export interface Flashcard {
  id?: number;
  front: string;
  back: string;
  nextReview: Date;
  deck: string;
  difficulty: number;
  interval: number; // Días hasta el próximo repaso
}

export class MyDatabase extends Dexie {
  cards!: Table<Flashcard>; 

  constructor() {
    super('FlashcardsDB');
    this.version(1).stores({
      cards: '++id, front, back, nextReview, deck'
    });
  }
}

export const calculateNextReview = (level: number): Date => {
  const now = new Date();
  
  // Lógica simple de días:
  // 1 (Difícil) -> Mañana
  // 2 (Bien)    -> En 3 días
  // 3 (Fácil)   -> En 7 días
  const daysToAdd = level === 1 ? 1 : level === 2 ? 3 : 7;
  
  // Sumamos los días a la fecha actual
  now.setDate(now.getDate() + daysToAdd);
  
  return now;
};

export const db = new MyDatabase();