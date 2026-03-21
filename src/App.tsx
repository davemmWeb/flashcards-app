import { useState } from 'react';
import { useCards } from './hooks/useCards.js';
import { FlashcardItem } from './components/FlashcardItem.js';

function App() {
  const { cards, addCard } = useCards();
  
  // Estados para el formulario
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    await addCard(front, back);
    
    // Limpiar formulario
    setFront('');
    setBack('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800">Anki Clone <span className="text-blue-600">TS</span></h1>
          <p className="text-slate-500 mt-2">Aprende idiomas con repetición espaciada</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna de Creación (Formulario) */}
          <section className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-10">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Nueva Tarjeta</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Palabra / Frase</label>
                  <input 
                    type="text"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Ej: Apple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Traducción</label>
                  <input 
                    type="text"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Ej: Manzana"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Agregar Tarjeta
                </button>
              </form>
            </div>
          </section>

          {/* Columna de Visualización (Grid de Tarjetas) */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tus Tarjetas ({cards?.length || 0})</h2>
            </div>

            {cards && cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                  <FlashcardItem key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400">Aún no tienes tarjetas. ¡Crea la primera!</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default App;