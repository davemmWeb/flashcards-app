import { useState } from "react";
import { useCards } from "./hooks/useCards.js";
import { FlashcardItem } from "./components/FlashcardItem.js";
import { calculateNextReview } from "./db/db.js";
import NewCardForm from "./components/NewCardForm.js";

function App() {
  const { cards, addCard, updateCardReview, resetAllCards } = useCards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleReset = async () => {
    if (
      window.confirm(
        "¿Quieres reiniciar todas las tarjetas para volver a estudiar?",
      )
    ) {
      await resetAllCards();
      setCurrentIndex(0); // Vuelve a la primera tarjeta
    }
  };

  if (cards === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando base de datos...
      </div>
    );
  }

  // Filtramos para ver solo las que tocan hoy (o todas por ahora para probar)
  const pendingCards = cards || [];
  const currentCard = pendingCards[currentIndex];

  const handleNext = async (level: number) => {
    // Verificamos que exista el ID antes de intentar actualizar
    if (!currentCard?.id || !updateCardReview) return;

    const nextDate = calculateNextReview(level);
    await updateCardReview(currentCard.id, nextDate);

    // Pasamos a la siguiente
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <header className="text-center mb-16">
        <h1 className="text-3xl font-black text-slate-800">Anki Clone</h1>
        <p className="text-slate-400 text-sm">Modo Estudio</p>
      </header>

      {/* Contenedor relativo para posicionar el botón */}
      <div className="w-full max-w-md relative">
        {/* Botón de Agregar (Arriba a la derecha) */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="absolute -top-12 right-0 bg-white p-2 rounded-full shadow-sm border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-10"
          title="Nueva Tarjeta"
        >
          {isAdding ? (
            <span className="px-2 font-bold text-sm">Cerrar</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>

        {/* 2. Formulario Condicional */}
        {isAdding && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-blue-100 animate-in slide-in-from-top duration-300">
            <h3 className="font-bold text-slate-700 mb-4">
              Añadir nueva palabra
            </h3>
            <NewCardForm onSave={() => setIsAdding(false)} />
          </div>
        )}

        {/* 3. Renderizado de la Tarjeta Actual */}
        {!isAdding && currentCard ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <FlashcardItem card={currentCard} />

            {/* Botones de Difícil, Bien, Fácil... */}
            <div className="flex gap-3 mt-10">
              <button
                onClick={() => handleNext(1)}
                className="flex-1 bg-white border-2 border-red-200 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
              >
                Difícil
              </button>
              <button
                onClick={() => handleNext(2)}
                className="flex-1 bg-white border-2 border-green-200 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all active:scale-95"
              >
                Bien
              </button>
              <button
                onClick={() => handleNext(3)}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                ¡Fácil!
              </button>
            </div>
          </div>
        ) : (
          !isAdding && (
            <div className="text-center bg-white p-10 rounded-3xl shadow-lg border border-slate-100 animate-in zoom-in duration-300">
    <div className="text-5xl mb-6">🎯</div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Completado!</h2>
    <p className="text-slate-500 mb-8">Has terminado todas tus tarjetas por ahora.</p>
    
    <div className="flex flex-col gap-3">
      <button 
        onClick={handleReset}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
      >
        Reiniciar todo el mazo
      </button>
      
      <button 
        onClick={() => setCurrentIndex(0)}
        className="text-slate-400 hover:text-slate-600 text-sm font-medium transition"
      >
        Solo volver al principio (sin resetear fechas)
      </button>
    </div>
  </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
