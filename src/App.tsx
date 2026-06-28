import { useState, useEffect } from "react";
import { useCards } from "./hooks/useCards.js";
import { FlashcardItem } from "./components/FlashcardItem.js";
import { calculateNextReview } from "./db/db.js";
import NewCardForm from "./components/NewCardForm.js";

function App() {
  // 1. Asegúrate de extraer la función de actualizar/editar de tu hook (ej. updateCard)
  const { cards, addCard, updateCardReview, resetAllCards, deleteCard, updateCard } = useCards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // ESTADOS PARA LA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  const pendingCards = cards || [];
  const currentCard = pendingCards[currentIndex];

  // Sincronizar los campos del formulario de edición cuando cambie la tarjeta actual
  useEffect(() => {
    if (currentCard) {
      setEditFront(currentCard.front || "");
      setEditBack(currentCard.back || "");
    }
  }, [currentCard]);

  const handleReset = async () => {
    if (
      window.confirm(
        "¿Quieres reiniciar todas las tarjetas para volver a estudiar?",
      )
    ) {
      await resetAllCards();
      setCurrentIndex(0);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      await deleteCard(id);
      if (currentIndex >= (cards?.length || 1) - 1 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
  };

  // 2. FUNCIÓN PARA GUARDAR LA EDICIÓN
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard?.id || !updateCard) return;

    // Llamamos a tu hook pasando el ID y los nuevos datos
    await updateCard(currentCard.id, {
      ...currentCard,
      front: editFront,
      back: editBack,
    });

    setIsEditing(false); // Salimos del modo edición
  };

  if (cards === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando base de datos...
      </div>
    );
  }

  const handleNext = async (level: number) => {
    if (!currentCard?.id || !updateCardReview) return;

    const nextDate = calculateNextReview(level);
    await updateCardReview(currentCard.id, nextDate);

    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <header className="text-center mb-16">
        <h1 className="text-3xl font-black text-slate-800">English Memorize</h1>
        <p className="text-slate-400 text-sm">Modo Estudio</p>
      </header>

      <div className="w-full max-w-md relative">
        {/* Botón de Agregar (Deshabilitado si estamos editando) */}
        {!isEditing && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="absolute -top-12 right-0 bg-white p-2 rounded-full shadow-sm border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-10"
            title="Nueva Tarjeta"
          >
            {isAdding ? (
              <span className="px-2 font-bold text-sm">Cerrar</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}

        {/* Formulario Condicional de Agregar */}
        {isAdding && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-blue-100 animate-in slide-in-from-top duration-300">
            <h3 className="font-bold text-slate-700 mb-4">Añadir nueva palabra</h3>
            <NewCardForm onSave={() => setIsAdding(false)} />
          </div>
        )}

        {/* Renderizado de la Tarjeta Actual / Modo Edición */}
        {!isAdding && currentCard ? (
          <div className="animate-in fade-in zoom-in-95 duration-500 relative">
            
            {/* BOTONES DE ACCIÓN (Esquina superior derecha) */}
            {!isEditing && (
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                {/* Botón Editar */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-300 hover:text-blue-500 transition-colors"
                  title="Editar tarjeta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                {/* Botón Eliminar */}
                <button
                  onClick={() => handleDelete(currentCard.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Eliminar tarjeta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* INTERFAZ CONDICIONAL: ¿EDITANDO O VIENDO? */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Editar Tarjeta</h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Frente (Inglés)</label>
                  <input
                    type="text"
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reverso (Español)</label>
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 h-24 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Vista normal de la Tarjeta */}
                <FlashcardItem card={currentCard} />

                {/* Botones de respuesta */}
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
              </>
            )}

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