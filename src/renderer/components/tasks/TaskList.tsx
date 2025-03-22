import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskPriority } from '../../../shared/models/Task';
import { taskService } from '../../../database/taskService';

interface TaskListProps {
  categoryId: number;
  onTaskSelect?: (task: Task) => void;
  onTaskStatusChange?: (taskId: number, completed: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  categoryId, 
  onTaskSelect, 
  onTaskStatusChange 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  // Chargement des tâches
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getByCategory(categoryId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadTasks();
    }
  }, [categoryId]);

  // Mise à jour du statut d'une tâche
  const handleTaskCheckboxChange = async (task: Task, completed: boolean) => {
    try {
      await taskService.updateCompletionStatus(task.id!, completed);
      
      // Mettre à jour l'état local
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed } : t
      ));
      
      // Notifier le parent si nécessaire
      if (onTaskStatusChange) {
        onTaskStatusChange(task.id!, completed);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await taskService.delete(id);
        loadTasks();
      } catch (err) {
        console.error('Erreur lors de la suppression de la tâche:', err);
      }
    }
  };

  // Filtrage des tâches par type
  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(task => task.type === filter);

  // Tri par priorité (les plus importantes en premier)
  const sortedTasks = [...filteredTasks].sort((a, b) => (a.priority - b.priority));

  if (loading) return <div className="p-4">Chargement des tâches...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const getTaskTypeLabel = (type: TaskType): string => {
    switch (type) {
      case 'perpetual': return 'Perpétuelle';
      case 'daily': return 'Quotidienne';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuelle';
      case 'specific': return 'Spécifique';
      default: return type;
    }
  };

  const getPriorityClass = (priority: TaskPriority): string => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tâches</h2>
        
        {/* Filtres de type */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'perpetual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('perpetual')}
          >
            Perpétuel
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('daily')}
          >
            Quotidien
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('weekly')}
          >
            Hebdo
          </button>
        </div>
      </div>
      
      {sortedTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune tâche dans cette catégorie</p>
      ) : (
        <ul className="space-y-2">
          {sortedTasks.map((task) => (
            <li key={task.id} className="border rounded p-3 hover:bg-gray-50">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3"
                  checked={task.completed}
                  onChange={(e) => handleTaskCheckboxChange(task, e.target.checked)}
                />
                <div className="flex-grow">
                  <div 
                    className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}
                    onClick={() => onTaskSelect && onTaskSelect(task)}
                  >
                    {task.title}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {getTaskTypeLabel(task.type)}
                    </span>
                    
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityClass(task.priority)}`}>
                      Priorité {task.priority}
                    </span>
                    
                    {task.estimatedDuration && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {task.estimatedDuration} min
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Échéance: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    
                    {task.tags && task.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700 ml-2"
                  onClick={() => handleDeleteTask(task.id!)}
                >
                  <span>❌</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;