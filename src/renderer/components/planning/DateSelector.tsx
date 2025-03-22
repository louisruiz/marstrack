// DateSelector.tsx
import React from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const date = new Date(selectedDate);
  
  const handlePreviousDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(date.getDate() - 1);
    onDateChange(prevDay.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    onDateChange(nextDay.toISOString().split('T')[0]);
  };
  
  const handleToday = () => {
    const today = new Date();
    onDateChange(today.toISOString().split('T')[0]);
  };
  
  // Formatage de la date pour l'affichage
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Capitaliser la première lettre
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow mb-4">
      <button
        onClick={handlePreviousDay}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        &lt; Précédent
      </button>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold">{displayDate}</h2>
        <button
          onClick={handleToday}
          className="text-sm text-blue-500 hover:underline mt-1"
        >
          Aujourd'hui
        </button>
      </div>
      
      <button
        onClick={handleNextDay}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Suivant &gt;
      </button>
    </div>
  );
};

// TimeBlockList.tsx
import React from 'react';
import { TimeBlock } from '../../shared/models/Planning';
import { TaskCategory } from '../../shared/models/Task';

interface TimeBlockListProps {
  timeBlocks: TimeBlock[];
  categories: TaskCategory[];
  onBlockSelect: (block: TimeBlock) => void;
  onStatusChange: (id: number, completed: boolean) => void;
  onDeleteBlock?: (id: number) => void;
}

export const TimeBlockList: React.FC<TimeBlockListProps> = ({
  timeBlocks,
  categories,
  onBlockSelect,
  onStatusChange,
  onDeleteBlock
}) => {
  // Obtenez le nom de la catégorie par ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return "";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "";
  };
  
  // Obtenez la couleur de la catégorie par ID
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return "#e0e0e0";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color || "#e0e0e0" : "#e0e0e0";
  };
  
  // Triez les blocs par heure de début
  const sortedBlocks = [...timeBlocks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Générer les slots horaires
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // De 6h à 21h
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Planning de la journée</h2>
      </div>
      
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <tbody>
            {hours.map(hour => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              const blocksForHour = sortedBlocks.filter(block => {
                const blockStartHour = parseInt(block.startTime.split(':')[0]);
                return blockStartHour === hour;
              });
              
              return (
                <tr key={hour} className="border-b hover:bg-gray-50">
                  <td className="p-2 border-r w-16 text-center text-sm text-gray-500">
                    {hourStr}
                  </td>
                  <td className="p-2">
                    {blocksForHour.map(block => (
                      <div 
                        key={block.id} 
                        className="mb-2 p-3 rounded cursor-pointer"
                        style={{ backgroundColor: `${getCategoryColor(block.categoryId)}30` }}
                        onClick={() => onBlockSelect(block)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{block.title}</div>
                            <div className="text-sm text-gray-600">
                              {block.startTime} - {block.endTime}
                            </div>
                            {block.categoryId && (
                              <div className="text-xs mt-1 text-gray-500">
                                Catégorie: {getCategoryName(block.categoryId)}
                              </div>
                            )}
                            {block.description && (
                              <div className="text-sm mt-1">{block.description}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={block.completed}
                              onChange={(e) => onStatusChange(block.id!, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5"
                            />
                            {onDeleteBlock && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlock(block.id!);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TimeBlockForm.tsx
import React, { useState, useEffect } from 'react';
import { TimeBlock } from '../../shared/models/Planning';
import { TaskCategory, Task } from '../../shared/models/Task';

interface TimeBlockFormProps {
  initialBlock?: TimeBlock;
  dateId: number;
  categories: TaskCategory[];
  tasks: Task[];
  onSubmit: (block: TimeBlock) => void;
  onCancel: () => void;
}

export const TimeBlockForm: React.FC<TimeBlockFormProps> = ({
  initialBlock,
  dateId,
  categories,
  tasks,
  onSubmit,
  onCancel
}) => {
  const [block, setBlock] = useState<Partial<TimeBlock>>({
    dateId,
    startTime: "09:00",
    endTime: "10:00",
    title: "",
    description: "",
    categoryId: undefined,
    taskIds: [],
    completed: false,
    ...(initialBlock || {})
  });
  
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  
  // Mise à jour des tâches disponibles lorsque la catégorie change
  useEffect(() => {
    if (block.categoryId) {
      const filteredTasks = tasks.filter(task => task.categoryId === block.categoryId);
      setAvailableTasks(filteredTasks);
    } else {
      setAvailableTasks(tasks);
    }
  }, [block.categoryId, tasks]);
  
  // Mettre à jour le plan quotidien si nécessaire
  useEffect(() => {
    setBlock(current => ({
      ...current,
      dateId
    }));
  }, [dateId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(block as TimeBlock);
  };
  
  const handleTaskToggle = (taskId: number) => {
    const taskIds = block.taskIds || [];
    if (taskIds.includes(taskId)) {
      setBlock({
        ...block,
        taskIds: taskIds.filter(id => id !== taskId)
      });
    } else {
      setBlock({
        ...block,
        taskIds: [...taskIds, taskId]
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {initialBlock?.id ? 'Modifier le bloc' : 'Nouveau bloc de temps'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={block.title}
          onChange={(e) => setBlock({ ...block, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Heure de début</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={block.startTime}
            onChange={(e) => setBlock({ ...block, startTime: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Heure de fin</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={block.endTime}
            onChange={(e) => setBlock({ ...block, endTime: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={block.description || ''}
          onChange={(e) => setBlock({ ...block, description: e.target.value })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Catégorie</label>
        <select
          className="w-full p-2 border rounded"
          value={block.categoryId || ''}
          onChange={(e) => setBlock({ 
            ...block, 
            categoryId: e.target.value ? parseInt(e.target.value) : undefined,
            // Réinitialiser les taskIds si la catégorie change
            taskIds: []
          })}
        >
          <option value="">-- Sélectionner une catégorie --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {block.categoryId && availableTasks.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tâches associées</label>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {availableTasks.map(task => (
              <div key={task.id} className="flex items-center py-1">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={(block.taskIds || []).includes(task.id!)}
                  onChange={() => handleTaskToggle(task.id!)}
                  className="mr-2"
                />
                <label htmlFor={`task-${task.id}`} className="text-sm">
                  {task.title}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={block.completed}
            onChange={(e) => setBlock({ ...block, completed: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm">Marquer comme complété</span>
        </label>
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
          disabled={!block.title}
        >
          {initialBlock?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

// EconomicEventList.tsx
import React from 'react';
import { EconomicEvent } from '../../shared/models/Planning';

interface EconomicEventListProps {
  events: EconomicEvent[];
  onEventSelect: (event: EconomicEvent) => void;
  onDeleteEvent?: (id: number) => void;
}

export const EconomicEventList: React.FC<EconomicEventListProps> = ({
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
                
                {onDeleteEvent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id!);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// EconomicEventForm.tsx
import React, { useState, useEffect } from 'react';
import { EconomicEvent, ImportanceLevel } from '../../shared/models/Planning';

interface EconomicEventFormProps {
  initialEvent?: EconomicEvent;
  dateId: number;
  onSubmit: (event: EconomicEvent) => void;
  onCancel: () => void;
}

export const EconomicEventForm: React.FC<EconomicEventFormProps> = ({
  initialEvent,
  dateId,
  onSubmit,
  onCancel
}) => {
  const [event, setEvent] = useState<Partial<EconomicEvent>>({
    dateId,
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
      dateId
    }));
  }, [dateId]);
  
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