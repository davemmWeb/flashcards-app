import { useState } from 'react';
import { useCards } from '../hooks/useCards.js';


function NewCardForm({ onSave }: { onSave: () => void }) {
  const { addCard } = useCards();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) return;
    await addCard(front, back);
    setFront('');
    setBack('');
    onSave(); // Cerramos el formulario tras guardar
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        autoFocus
        value={front}
        onChange={e => setFront(e.target.value)}
        placeholder="Palabra en Inglés"
        className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <input 
        value={back}
        onChange={e => setBack(e.target.value)}
        placeholder="Traducción"
        className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100">
        Guardar Tarjeta
      </button>
    </form>
  );
}

export { NewCardForm };
export default NewCardForm;