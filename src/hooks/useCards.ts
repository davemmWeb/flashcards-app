import { useLiveQuery } from "dexie-react-hooks";
import { db, type Flashcard } from "../db/db.js";

export function useCards() {
  const cards = useLiveQuery(() => db.cards.toArray());

  const addCard = async (front: string, back: string, deck: string = "General") => {
    const newCard: Flashcard = {
      front,
      back,
      deck,
      nextReview: new Date(),
      difficulty: 1,
      interval: 0
    };
    await db.cards.add(newCard);
  };

  return { cards, addCard };
}