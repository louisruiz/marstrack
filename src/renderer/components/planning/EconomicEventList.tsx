import React from 'react';
import { EconomicEvent } from '../../../shared/models/Planning';

interface EconomicEventListProps {
  events: EconomicEvent[];
  onEventSelect: (event: EconomicEvent) => void;
  onDeleteEvent: (id: number) => void;
}

const EconomicEventList: React.FC<EconomicEventListProps> = ({
  events,
  onEventSelect,
  onDeleteEvent
}) => {
  // Triez les événements par heure
  const sortedEvents = [...events].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
  
  // Style pour chaque niveau d'importance
  const getImportanceStyles = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'medium':
        return 'bg-orange-100 border-orange-400 text-orange-700';
      case 'low':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };
  
  // Label pour chaque niveau d'importance
  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return importance;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Événements économiques</h2>
      </div>
      
      {sortedEvents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Aucun événement économique pour cette journée
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[400px]">
          {sortedEvents.map((event) => (
            <div 
              key={event.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${getImportanceStyles(event.importance)}`}
              onClick={() => onEventSelect(event)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm">{event.time}</div>
                  
                  <div className="flex space-x-4 mt-2 text-xs">
                    <div>
                      <span className="font-medium">Importance:</span> {getImportanceLabel(event.importance)}
                    </div>
                    
                    {event.forecast && (
                      <div>
                        <span className="font-medium">Prévision:</span> {event.forecast}
                      </div>
                    )}
                    
                    {event.previous && (
                      <div>
                        <span className="font-medium">Précédent:</span> {event.previous}
                      </div>
                    )}
                    
                    {event.actual && (
                      <div>
                        <span className="font-medium">Résultat:</span> {event.actual}
                      </div>
                    )}
                  </div>
                  
                  {event.notes && (
                    <div className="text-sm mt-2 italic">{event.notes}</div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event.id!);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EconomicEventList;