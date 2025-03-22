import React, { useState, useEffect } from 'react';
import { EconomicEvent, ImportanceLevel } from '../../../shared/models/Planning';

interface EconomicEventFormProps {
  initialEvent?: Partial<EconomicEvent>;
  dailyPlanId: number;
  onSubmit: (event: EconomicEvent) => void;
  onCancel: () => void;
}

const EconomicEventForm: React.FC<EconomicEventFormProps> = ({
  initialEvent,
  dailyPlanId,
  onSubmit,
  onCancel
}) => {
  const [event, setEvent] = useState<Partial<EconomicEvent>>({
    dailyPlanId,
    time: "12:00",
    title: "",
    importance: "medium" as ImportanceLevel,
    forecast: "",
    previous: "",
    actual: "",
    notes: "",
    ...(initialEvent || {})
  });
  
  // Mettre à jour le plan quotidien si nécessaire
  useEffect(() => {
    setEvent(current => ({
      ...current,
      dailyPlanId
    }));
  }, [dailyPlanId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(event as EconomicEvent);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {initialEvent?.id ? 'Modifier l\'événement' : 'Nouvel événement économique'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Heure</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={event.time}
            onChange={(e) => setEvent({ ...event, time: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Importance</label>
          <select
            className="w-full p-2 border rounded"
            value={event.importance}
            onChange={(e) => setEvent({ ...event, importance: e.target.value as ImportanceLevel })}
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prévision</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={event.forecast || ''}
            onChange={(e) => setEvent({ ...event, forecast: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Précédent</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={event.previous || ''}
            onChange={(e) => setEvent({ ...event, previous: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Résultat</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={event.actual || ''}
            onChange={(e) => setEvent({ ...event, actual: e.target.value })}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={event.notes || ''}
          onChange={(e) => setEvent({ ...event, notes: e.target.value })}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={!event.title}
        >
          {initialEvent?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default EconomicEventForm;