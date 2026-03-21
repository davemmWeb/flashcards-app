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

export const db = new MyDatabase();