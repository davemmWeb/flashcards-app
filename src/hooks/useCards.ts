import { useLiveQuery } from "dexie-react-hooks";
import { db, type Flashcard } from "../db/db.js";

export function useCards() {
  const cards = useLiveQuery(() => db.cards.toArray());

  const addCard = async (
    front: string,
    back: string,
    deck: string = "General",
  ) => {
    const newCard: Flashcard = {
      front,
      back,
      deck,
      nextReview: new Date(),
      difficulty: 1,
      interval: 0,
    };
    await db.cards.add(newCard);
  };

  const updateCardReview = async (id: number, nextDate: Date) => {
    await db.cards.update(id, { nextReview: nextDate });
  };

  const resetAllCards = async () => {
    // Obtenemos todas las tarjetas actuales
    const allCards = await db.cards.toArray();

    // Usamos una promesa masiva para actualizar todas a "hoy"
    const promises = allCards.map((card) =>
      db.cards.update(card.id!, {
        nextReview: new Date(),
        interval: 0,
        difficulty: 1,
      }),
    );

    await Promise.all(promises);
  };

  const deleteCard = async (id: number | undefined) => {
    await db.cards.delete(id);
    resetAllCards();
  };

  const updateCard = async (id: number | undefined, flashCard:  Flashcard) => {
    
    await db.cards.update(id, flashCard)
  }

  return { cards, addCard, updateCardReview, resetAllCards, deleteCard, updateCard };
}
