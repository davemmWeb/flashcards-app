import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FlashcardItem } from "./components/FlashcardItem.js";
import NewCardForm from "./components/NewCardForm.js";
import { calculateNextReview } from "./db/db.js";
import { useCards } from "./hooks/useCards.js";
import { type Flashcard } from "./db/db.js";

function App() {
  const { cards, addCard, updateCardReview, resetAllCards, deleteCard, updateCard } = useCards();
  
  // Lista de IDs que el usuario marcó como "Difícil" en esta sesión de estudio
  const [failedCardIds, setFailedCardIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Estado para ver la cantidad de los aciertos
  const [successes, setSuccesses] = useState({
    dificil: 0,
    bien: 0,
    facil: 0
  });

  // ESTADOS PARA LA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  // --- LÓGICA DE LA COLA DINÁMICA ---
  // 1. Tomamos las tarjetas base que vienen de IndexedDB
  const baseCards = cards || [];
  
  // 2. Filtramos cuáles quedan pendientes: Aquellas cuyo ID no ha sido guardado con éxito 
  // (es decir, que no se respondieron con "Bien" o "Fácil")
  // NOTA: Para probar de forma fluida ahora mismo, asumimos que todas las de 'baseCards' entran a la sesión
  const pendingBaseCards = baseCards; 

  // 3. Construimos la cola real: Las pendientes normales + las difíciles clonadas que van al final
  const sessionQueue: Flashcard[] = [...pendingBaseCards];
  failedCardIds.forEach(id => {
    const cardToRepeat = baseCards.find(c => c.id === id);
    if (cardToRepeat) {
      sessionQueue.push(cardToRepeat);
    }
  });

  // La tarjeta que se muestra es siempre el índice actual de nuestra cola dinámica
  const currentCard = sessionQueue[currentIndex];

  // Sincronizar los campos del formulario de edición cuando cambie la tarjeta actual
  useEffect(() => {
    if (currentCard) {
      setEditFront(currentCard.front || "");
      setEditBack(currentCard.back || "");
    }
  }, [currentCard?.id]);

  const handleReset = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Se restablecerá tu progreso de estudio actual!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, reiniciar mazo",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await resetAllCards();
        setCurrentIndex(0);
        setFailedCardIds([]); // Limpiamos la cola de fallidas
        setSuccesses({ dificil: 0, bien: 0, facil: 0 });
        
        Swal.fire({
          title: "¡Reiniciado!",
          text: "Tus tarjetas están listas para volver a estudiar.",
          icon: "success",
          confirmButtonColor: "#2563eb"
        });
      }
    });
  };

  const handleDelete = async (id: number | undefined) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      await deleteCard(id);
      // Si eliminamos, limpiamos el ID de la lista de fallidas si existía
      if (id) setFailedCardIds(prev => prev.filter(cardId => cardId !== id));
      
      if (currentIndex > 0 && currentIndex >= sessionQueue.length - 1) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard?.id || !updateCard) return;

    await updateCard(currentCard.id, {
      ...currentCard,
      front: editFront,
      back: editBack,
    });

    setIsEditing(false);
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

    // Actualizamos estadísticas visuales
    setSuccesses(prev => {
      if (level === 1) return { ...prev, dificil: prev.dificil + 1 };
      if (level === 2) return { ...prev, bien: prev.bien + 1 };
      return { ...prev, facil: prev.facil + 1 };
    });

    if (level === 1) {
      // --- CASO DIFÍCIL ---
      // Metemos el ID en la lista de pendientes para que se encole al final
      setFailedCardIds(prev => [...prev, currentCard.id!]);
      // Avanzamos el índice hacia la siguiente tarjeta de la cola
      setCurrentIndex((prev) => prev + 1);
    } else {
      // --- CASO BIEN O FÁCIL ---
      // 1. Si esta tarjeta era una que ya había fallado antes, la removemos de las 'fallidas'
      // para que deje de ciclarse en el futuro
      setFailedCardIds(prev => prev.filter(id => id !== currentCard.id));
      
      // 2. Calculamos fecha y guardamos en IndexedDB de forma permanente
      const nextDate = calculateNextReview(level);
      await updateCardReview(currentCard.id, nextDate);

      // 3. Avanzamos el flujo normal
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <header className="text-center mb-16">
        <h1 className="text-3xl font-black text-slate-800">English Memorize</h1>
        <p className="text-slate-400 text-sm">Modo Estudio</p>
      </header>

      <div className="w-full max-w-md relative">
        {!isEditing && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="absolute -top-12 right-0 bg-white p-2 rounded-full shadow-sm border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-10"
            title="Nueva Tarjeta"
          >
            {isAdding ? <span className="px-2 font-bold text-sm">Cerrar</span> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}

        {isAdding && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-blue-100 animate-in slide-in-from-top duration-300">
            <h3 className="font-bold text-slate-700 mb-4">Añadir nueva palabra</h3>
            <NewCardForm onSave={() => setIsAdding(false)} />
          </div>
        )}

        {!isAdding && currentCard ? (
          <div className="animate-in fade-in zoom-in-95 duration-500 relative">
            
            {!isEditing && (
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <button onClick={() => setIsEditing(true)} className="text-slate-300 hover:text-blue-500 transition-colors" title="Editar tarjeta">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(currentCard.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Eliminar tarjeta">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Editar Tarjeta</h3>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Frente (Inglés)</label>
                  <input type="text" value={editFront} onChange={(e) => setEditFront(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reverso (Español)</label>
                  <textarea value={editBack} onChange={(e) => setEditBack(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 h-24 resize-none" required />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">Cancelar</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">Guardar</button>
                </div>
              </form>
            ) : (
              <>
                <FlashcardItem key={currentCard.id} card={currentCard} />

                <div className="flex gap-3 mt-10">
                  <button onClick={() => handleNext(1)} className="flex-1 bg-white border-2 border-red-200 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95">
                    Difícil
                  </button>
                  <button onClick={() => handleNext(2)} className="flex-1 bg-white border-2 border-green-200 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all active:scale-95">
                    Bien
                  </button>
                  <button onClick={() => handleNext(3)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                    ¡Fácil!
                  </button>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex justify-around bg-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-500">
                    <span>🔴 Difícil: {successes.dificil}</span>
                    <span>🟢 Bien: {successes.bien}</span>
                    <span>🔵 Fácil: {successes.facil}</span>
                  </div>
                  <p className="text-center text-slate-400 text-xs font-medium">
                    Tarjeta {currentIndex + 1} de {sessionQueue.length} en revisión
                  </p>
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
                <button onClick={handleReset} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Reiniciar todo el mazo
                </button>
                <button onClick={() => { setCurrentIndex(0); setFailedCardIds([]); }} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition">
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