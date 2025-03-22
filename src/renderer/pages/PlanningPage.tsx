import React, { useState, useEffect } from 'react';
import { DailyPlan, TimeBlock, EconomicEvent, ImportanceLevel } from '../shared/models/Planning';
import { TaskCategory, Task } from '../shared/models/Task';

// Ces imports seront remplacés par des appels réels à votre base de données
// Pour l'instant, nous utilisons des données simulées pour la démonstration
const MOCK_CATEGORIES: TaskCategory[] = [
  { id: 1, name: 'Trading', color: '#3498db', description: 'Activités de trading' },
  { id: 2, name: 'Macro/analyse', color: '#2ecc71', description: 'Analyse macro-économique' },
  { id: 3, name: 'Dev outil', color: '#9b59b6', description: 'Développement doutils' },
  { id: 4, name: 'Study', color: '#f1c40f', description: 'Études et apprentissage' },
  { id: 5, name: 'Tracking', color: '#e74c3c', description: 'Suivi et journalisation' }
];

const MOCK_TIMEBLOCKS: TimeBlock[] = [
  { 
    id: 1, 
    dateId: 1, 
    startTime: '07:00', 
    endTime: '09:00', 
    title: 'Overview des marchés', 
    description: 'Analyse macro, traçage des niveaux, check actualité', 
    categoryId: 2, 
    taskIds: [1, 2], 
    completed: true 
  },
  { 
    id: 2, 
    dateId: 1, 
    startTime: '09:00', 
    endTime: '11:00', 
    title: 'Trading session EU', 
    description: 'Gestion des positions sur Nasdaq et Gold', 
    categoryId: 1, 
    taskIds: [3], 
    completed: true 
  },
  { 
    id: 3, 
    dateId: 1, 
    startTime: '11:00', 
    endTime: '13:00', 
    title: 'Check ISM Manufacturing', 
    description: 'Analyse des données ISM', 
    categoryId: 2, 
    taskIds: [], 
    completed: false 
  },
  { 
    id: 4, 
    dateId: 1, 
    startTime: '13:00', 
    endTime: '15:00', 
    title: 'Dev programme bloombit', 
    description: 'Continuer le programme bloombit, dev de l\'indicateur SD', 
    categoryId: 3, 
    taskIds: [4, 5], 
    completed: false 
  },
  { 
    id: 5, 
    dateId: 1, 
    startTime: '16:00', 
    endTime: '17:00', 
    title: 'Analyse impact CPI sur marchés', 
    description: 'Analyse de l\'impact des données sur les différents marchés', 
    categoryId: 2, 
    taskIds: [], 
    completed: false 
  },
  { 
    id: 6, 
    dateId: 1, 
    startTime: '17:00', 
    endTime: '19:00', 
    title: 'Lecture "The Art of Quantitative Finance"', 
    description: 'Chapitres sur Options Pricing', 
    categoryId: 4, 
    taskIds: [8], 
    completed: false 
  },
  { 
    id: 7, 
    dateId: 1, 
    startTime: '19:00', 
    endTime: '20:00', 
    title: 'Journaling et tracking', 
    description: 'Résumé de la journée et mise à jour du tracking', 
    categoryId: 5, 
    taskIds: [], 
    completed: false 
  }
];

const MOCK_EVENTS: EconomicEvent[] = [
  {
    id: 1,
    dateId: 1,
    time: '14:30',
    title: 'CPI Release',
    importance: 'high',
    forecast: '3.1%',
    previous: '3.3%',
    notes: 'Donnée importante pour les marchés'
  }
];

const MOCK_TASKS: Task[] = [
  { id: 1, categoryId: 2, title: 'Check CPI Release', type: 'daily', priority: 1, completed: true },
  { id: 2, categoryId: 2, title: 'Analyse des niveaux clés', type: 'daily', priority: 2, completed: true },
  { id: 3, categoryId: 1, title: 'Gestion des positions', type: 'daily', priority: 1, completed: true },
  { id: 4, categoryId: 3, title: 'Dev programme bloombit', type: 'specific', priority: 2, completed: false },
  { id: 5, categoryId: 3, title: 'Indicateur SD', type: 'specific', priority: 3, completed: false },
  { id: 8, categoryId: 4, title: 'Étude options pricing', type: 'specific', priority: 2, completed: true }
];

const PlanningPage: React.FC = () => {
  // État pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // États pour les données
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(MOCK_TIMEBLOCKS);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>(MOCK_EVENTS);
  const [categories, setCategories] = useState<TaskCategory[]>(MOCK_CATEGORIES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  // État pour la création/modification
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  
  // Fonctions de gestion des événements
  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };
  
  const handleTimeBlockClick = (block: TimeBlock) => {
    setEditingBlock(block);
    setShowAddForm(true);
  };
  
  const handleAddBlockClick = () => {
    setEditingBlock(null);
    setShowAddForm(true);
  };
  
  const handleBlockStatusChange = (id: number, completed: boolean) => {
    setTimeBlocks(
      timeBlocks.map(block => block.id === id ? { ...block, completed } : block)
    );
  };
  
  // Formatage de la date pour l'affichage
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };
  
  // Fonction pour obtenir le nom d'une catégorie
  const getCategoryName = (id?: number): string => {
    if (!id) return "";
    const category = categories.find(c => c.id === id);
    return category ? category.name : "";
  };
  
  // Fonction pour obtenir la couleur d'une catégorie
  const getCategoryColor = (id?: number): string => {
    if (!id) return "#e0e0e0";
    const category = categories.find(c => c.id === id);
    return category ? category.color : "#e0e0e0";
  };
  
  // Fonction pour obtenir la classe de couleur selon l'importance
  const getImportanceClass = (importance: ImportanceLevel): string => {
    switch (importance) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-400';
      default: return 'bg-gray-200';
    }
  };
  
  // Calcul des données pour le graphique d'analyse du temps
  const calculateTimeAnalytics = () => {
    const analytics: { [key: string]: number } = {};
    
    timeBlocks.forEach(block => {
      if (!block.categoryId) return;
      
      const categoryName = getCategoryName(block.categoryId);
      const startTime = new Date(`2000-01-01T${block.startTime}`);
      const endTime = new Date(`2000-01-01T${block.endTime}`);
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (analytics[categoryName]) {
        analytics[categoryName] += durationInHours;
      } else {
        analytics[categoryName] = durationInHours;
      }
    });
    
    return analytics;
  };
  
  const timeAnalytics = calculateTimeAnalytics();
  const totalHours = Object.values(timeAnalytics).reduce((sum, hours) => sum + hours, 0);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Planning</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('day')}
          >
            Jour
          </button>
          <button 
            className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('week')}
          >
            Semaine
          </button>
          <button 
            className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('month')}
          >
            Mois
          </button>
        </div>
      </div>
      
      {/* Sélecteur de date */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow mb-4">
        <button
          onClick={handlePreviousDay}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &lt; Précédent
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold capitalize">{formatDate(selectedDate)}</h2>
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
      
      <div className="grid grid-cols-3 gap-4">
        {/* Colonne principale - Blocs de temps */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Planification de la Journée</h2>
              <button 
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={handleAddBlockClick}
              >
                + Ajouter un bloc
              </button>
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full">
                <tbody>
                  {timeBlocks.map((block) => (
                    <tr key={block.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border-r w-16 text-center text-sm text-gray-500">
                        {block.startTime}
                      </td>
                      <td className="p-2">
                        <div 
                          className="mb-2 p-3 rounded cursor-pointer"
                          style={{ backgroundColor: `${getCategoryColor(block.categoryId)}20` }}
                          onClick={() => handleTimeBlockClick(block)}
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
                                onChange={(e) => handleBlockStatusChange(block.id!, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Événements économiques */}
                  {economicEvents.map((event) => (
                    <tr key={`event-${event.id}`} className="border-b hover:bg-gray-50">
                      <td className="p-2 border-r w-16 text-center text-sm text-gray-500">
                        {event.time}
                      </td>
                      <td className="p-2">
                        <div 
                          className={`mb-2 p-3 rounded ${getImportanceClass(event.importance)}`}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm">
                            {event.forecast && <span>Prévision: {event.forecast} | </span>}
                            {event.previous && <span>Précédent: {event.previous}</span>}
                          </div>
                          {event.notes && (
                            <div className="text-sm mt-1">{event.notes}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Colonne droite - Tâches et analyse */}
        <div className="space-y-4">
          {/* Tâches du jour */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Tâches du Jour</h2>
            </div>
            <ul className="p-2">
              {tasks.map((task) => (
                <li key={task.id} className="p-2 flex items-center">
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => {}} 
                    className="mr-3"
                  />
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                </li>
              ))}
              <li className="p-2 text-center text-gray-400 border-t mt-2">
                + Ajouter une tâche
              </li>
            </ul>
          </div>
          
          {/* Analyse du temps */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Analyse du Temps</h2>
            </div>
            <div className="p-4">
              {/* Ici, on simplifierait normalement avec un graphique réel */}
              <div className="space-y-2">
                {Object.entries(timeAnalytics).map(([category, hours]) => (
                  <div key={category} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(categories.find(c => c.name === category)?.id) }}
                    ></div>
                    <div className="flex-grow">{category}</div>
                    <div className="text-right">{hours.toFixed(1)}h ({(hours / totalHours * 100).toFixed(0)}%)</div>
                  </div>
                ))}
              </div>
              
              {/* Graphique simplifié */}
              <div className="flex h-6 mt-4 overflow-hidden rounded">
                {Object.entries(timeAnalytics).map(([category, hours], index) => (
                  <div 
                    key={index}
                    style={{ 
                      width: `${hours / totalHours * 100}%`,
                      backgroundColor: getCategoryColor(categories.find(c => c.name === category)?.id)
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="text-sm text-center mt-2 text-gray-500">
                Total: {totalHours.toFixed(1)} heures
              </div>
            </div>
          </div>
          
          {/* Événements économiques à venir */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Événements Économiques</h2>
              <button className="text-sm text-blue-500">+ Ajouter</button>
            </div>
            <div className="p-4">
              {economicEvents.length > 0 ? (
                <ul>
                  {economicEvents.map((event) => (
                    <li 
                      key={event.id} 
                      className={`mb-2 p-2 rounded ${getImportanceClass(event.importance)}`}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{event.title}</div>
                        <div>{event.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Aucun événement économique pour aujourd'hui
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;